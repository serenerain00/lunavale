/**
 * Create or update the "Luna Vale Assistant" ElevenLabs agent from this folder.
 *
 * The agent's settings live HERE, not only in the ElevenLabs dashboard, so a
 * change is a reviewable diff and can be re-applied in one command. Edit
 * agent-prompt.md or the CONFIG below, then:
 *
 *   node --env-file=.env.local scripts/voice/sync-agent.mjs            # dry run
 *   node --env-file=.env.local scripts/voice/sync-agent.mjs --apply
 *
 * Finds the agent by NAME and updates it; creates it if it doesn't exist. It
 * never touches any other agent in the account (Arti is a separate work
 * project).
 *
 * The cost guardrails are part of the config on purpose: 5-minute conversations,
 * hang up after 20s of silence, one conversation at a time, a daily cap, and
 * authentication required so the agent id alone can't start a call.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const KEY = process.env.ELEVENLABS_AGENT_KEY || process.env.ELEVENLABS_API_KEY;
// Melissa, 2026-10-11: "change her name to Erin". Found by id when
// ELEVENLABS_AGENT_ID is set, so renaming never creates a second agent.
const NAME = "Erin";
const SITE = process.env.VOICE_SITE_URL || "https://lunavale38.com";
const SECRET = process.env.VOICE_TOOL_SECRET;

/**
 * The tools. Two webhooks into app/api/voice/tools/[tool] (read-only — there is
 * no tool that can change anything) and one client tool the page handles.
 * The secret header is how those routes know the caller is this agent.
 */
const webhook = (name, description, properties = {}) => ({
  type: "webhook",
  name,
  description,
  api_schema: {
    url: `${SITE}/api/voice/tools/${name}`,
    method: "POST",
    request_headers: { "x-voice-secret": SECRET },
    request_body_schema: { type: "object", properties, required: [] },
  },
});

const TOOLS = [
  webhook(
    "business_snapshot",
    "Live business numbers: money collected, renewing/cancelling/failing members, monthly recurring revenue, checkouts started and paid, how many paid from Instagram, campaigns, visits. Use for any question about revenue, members, subscriptions, sales or how things are going. Returns a `speak` summary to say aloud.",
    {
      range: {
        type: "string",
        enum: ["today", "week", "month"],
        description: "today, the last 7 days (week) or the last 30 days (month). Default week.",
      },
    },
  ),
  webhook(
    "content_inventory",
    "What has been released on the site: recent clips, posts, journal pages and episodes, free or members-only, and counts. Use for questions about content or what to promote. Returns a `speak` summary.",
  ),
  {
    type: "client",
    name: "show_report",
    description: "Show the detailed table on Melissa's screen. Call when she asks to see, show, or put something on screen.",
    expects_response: true,
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", enum: ["snapshot", "content"], description: "snapshot for business numbers, content for releases" },
        range: { type: "string", enum: ["today", "week", "month"], description: "for snapshot; default week" },
      },
      required: ["name"],
    },
  },
];

const CONFIG = {
  name: NAME,
  tags: ["luna-vale"],
  conversation_config: {
    agent: {
      first_message: "Hi Melissa, it's Erin. What do you want to know?",
      language: "en",
      prompt: {
        prompt: readFileSync(join(here, "agent-prompt.md"), "utf8"),
        // Haiku: fastest replies and cheapest per minute. One setting to
        // change if analysis needs more depth (claude-sonnet-5-5).
        llm: "claude-haiku-4-5",
        temperature: 0.3,
        // tool_ids is filled in below, after the tools themselves are synced.
      },
    },
    tts: {
      voice_id: "DXFkLCBUTmvXpp2QwZjA", // Eryn
      model_id: "eleven_flash_v2", // ElevenLabs: English agents must use turbo or flash v2
    },
    conversation: { max_duration_seconds: 300 },
    turn: { silence_end_call_timeout: 20 },
    // Melissa, 2026-10-11: "its picking up my tv". Filters out voices that
    // aren't the person at the microphone — TV, other people in the room.
    vad: { background_voice_detection: true },
  },
  platform_settings: {
    auth: { enable_auth: true },
    call_limits: { agent_concurrency_limit: 1, daily_limit: 10, bursting_enabled: false },
  },
};

async function api(method, path, body) {
  const r = await fetch(`https://api.elevenlabs.io${path}`, {
    method,
    headers: { "xi-api-key": KEY, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${text.slice(0, 400)}`);
  return json;
}

if (!SECRET) {
  console.error("No VOICE_TOOL_SECRET in the environment.");
  process.exit(1);
}
if (!KEY) {
  console.error("No ELEVENLABS_AGENT_KEY or ELEVENLABS_API_KEY in the environment.");
  process.exit(1);
}

const apply = process.argv.includes("--apply");
const { agents = [] } = await api("GET", "/v1/convai/agents?page_size=100");
const existing =
  agents.find((a) => a.agent_id === process.env.ELEVENLABS_AGENT_ID) ??
  agents.find((a) => a.name === NAME);

console.log(existing ? `update ${NAME} (${existing.agent_id})` : `create ${NAME}`);
console.log(`  llm ${CONFIG.conversation_config.agent.prompt.llm}, voice Eryn, ` +
  `max ${CONFIG.conversation_config.conversation.max_duration_seconds}s, ` +
  `silence hang-up ${CONFIG.conversation_config.turn.silence_end_call_timeout}s, ` +
  `auth ${CONFIG.platform_settings.auth.enable_auth}, ` +
  `daily limit ${CONFIG.platform_settings.call_limits.daily_limit}`);

if (!apply) {
  console.log("dry run — pass --apply to write");
  process.exit(0);
}

// TOOLS ARE STORED SEPARATELY in ElevenLabs and referenced by id. Inline
// `tools` on the agent creates a fresh copy on every run, so: update ours by
// name, create only the missing ones. Only names in TOOLS are ever touched —
// Arti's tools live in the same account.
const { tools: stored = [] } = await api("GET", "/v1/convai/tools");
const ids = [];
for (const tool of TOOLS) {
  const found = stored.find((t) => t.tool_config?.name === tool.name);
  if (found) {
    await api("PATCH", `/v1/convai/tools/${found.id}`, { tool_config: tool });
    ids.push(found.id);
    console.log(`  tool ${tool.name}: updated`);
  } else {
    const made = await api("POST", "/v1/convai/tools", { tool_config: tool });
    ids.push(made.id);
    console.log(`  tool ${tool.name}: created`);
  }
}
CONFIG.conversation_config.agent.prompt.tool_ids = ids;

const out = existing
  ? await api("PATCH", `/v1/convai/agents/${existing.agent_id}`, CONFIG)
  : await api("POST", "/v1/convai/agents/create", CONFIG);
const id = existing?.agent_id ?? out.agent_id;
console.log(`done: ${id}`);
console.log(`put this in .env.local and Vercel: ELEVENLABS_AGENT_ID=${id}`);
