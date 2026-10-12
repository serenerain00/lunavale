import "server-only";

/**
 * ElevenLabs, server side only. The API key never leaves this module: the
 * browser gets a short-lived conversation token and nothing else.
 */

const API = "https://api.elevenlabs.io";

function key(): string | undefined {
  return process.env.ELEVENLABS_API_KEY;
}

export function voiceConfigured(): boolean {
  return Boolean(key() && process.env.ELEVENLABS_AGENT_ID && process.env.VOICE_TOOL_SECRET);
}

async function el<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: { "xi-api-key": key()! },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`ElevenLabs ${path} → ${r.status}`);
  return (await r.json()) as T;
}

/** A WebRTC conversation token for the private agent. Expires on its own. */
export async function conversationToken(): Promise<string> {
  const { token } = await el<{ token: string }>(
    `/v1/convai/conversation/token?agent_id=${encodeURIComponent(process.env.ELEVENLABS_AGENT_ID!)}`,
  );
  return token;
}

export interface VoiceUsage {
  creditsUsed: number;
  creditsLimit: number;
  resetsOn: string | null;
  minutesThisPeriod: number;
  conversations: number;
}

/**
 * What voice has used, read from ElevenLabs itself, so the page shows the real
 * ceiling (the plan's credit allowance) rather than an estimate.
 */
export async function voiceUsage(): Promise<VoiceUsage | null> {
  if (!voiceConfigured()) return null;
  try {
    const sub = await el<{
      character_count: number;
      character_limit: number;
      next_character_count_reset_unix?: number;
    }>("/v1/user/subscription");
    // The billing period started a month before the next reset.
    const reset = sub.next_character_count_reset_unix
      ? new Date(sub.next_character_count_reset_unix * 1000)
      : null;
    const periodStart = reset
      ? Math.floor(new Date(reset).setUTCMonth(reset.getUTCMonth() - 1) / 1000)
      : Math.floor(Date.now() / 1000) - 30 * 86400;
    const { conversations = [] } = await el<{
      conversations: { call_duration_secs: number }[];
    }>(
      `/v1/convai/conversations?agent_id=${encodeURIComponent(process.env.ELEVENLABS_AGENT_ID!)}` +
        `&call_start_after_unix=${periodStart}&page_size=100`,
    );
    const secs = conversations.reduce((n, c) => n + (c.call_duration_secs || 0), 0);
    return {
      creditsUsed: sub.character_count,
      creditsLimit: sub.character_limit,
      resetsOn: reset ? reset.toISOString().slice(0, 10) : null,
      minutesThisPeriod: Math.round((secs / 60) * 10) / 10,
      conversations: conversations.length,
    };
  } catch (error) {
    console.error("voiceUsage failed", error);
    return null;
  }
}
