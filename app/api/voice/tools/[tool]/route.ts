/**
 * Webhook tools for the voice agent. ElevenLabs calls these mid-conversation
 * when Claude needs a number.
 *
 * READ-ONLY, BY CONSTRUCTION. Every tool here looks something up and returns
 * it. Nothing in this file can publish, post, edit the site or touch a
 * customer — that is enforced by there being no such tool, not by the prompt.
 * When actions arrive they will only create pending items that Melissa
 * confirms with a tap in the dashboard (docs/voice-assistant-plan.md).
 *
 * AUTH: a shared secret in a header, set on the agent's tool config by
 * scripts/voice/sync-agent.mjs and compared in constant time. Anything else
 * gets the same 404 as a route that doesn't exist.
 *
 * Each response carries `speak` — a sentence or two meant to be said aloud —
 * so the model has a ready summary and no reason to read a table out.
 */

import { timingSafeEqual } from "node:crypto";
import { businessSnapshot, type Range } from "@/lib/marketing/snapshot";
import { contentInventory } from "@/lib/marketing/content";
import { instagramStats } from "@/lib/marketing/instagram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(req: Request): boolean {
  const expected = process.env.VOICE_TOOL_SECRET;
  const got = req.headers.get("x-voice-secret");
  if (!expected || !got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

const RANGES: Range[] = ["today", "week", "month"];

export async function POST(req: Request, { params }: { params: Promise<{ tool: string }> }) {
  if (!authorised(req)) return new Response("Not found", { status: 404 });
  const { tool } = await params;
  const body = (await req.json().catch(() => ({}))) as { range?: string; post?: string; days?: number };

  try {
    switch (tool) {
      case "business_snapshot": {
        const range = RANGES.includes(body.range as Range) ? (body.range as Range) : "week";
        return Response.json(await businessSnapshot(range));
      }
      case "content_inventory":
        return Response.json(contentInventory());
      case "instagram_stats":
        return Response.json(
          await instagramStats({
            post: typeof body.post === "string" ? body.post.slice(0, 80) : undefined,
            days: typeof body.days === "number" ? body.days : undefined,
          }),
        );
      default:
        return new Response("Not found", { status: 404 });
    }
  } catch (error) {
    console.error(`voice tool ${tool} failed`, error);
    return Response.json({ speak: "I couldn't get that just now. Try again in a moment." }, { status: 200 });
  }
}
