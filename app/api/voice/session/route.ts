/**
 * A conversation token for the voice assistant — owner only.
 *
 * The agent has authentication switched on (scripts/voice/sync-agent.mjs), so
 * its id alone cannot start a conversation. This route is the only way in: it
 * checks that the signed-in user is Melissa, then asks ElevenLabs for a
 * short-lived WebRTC token with the server-side key. The key itself is never
 * sent to the browser.
 */

import { isOwner, notOwner } from "@/lib/access/owner";
import { conversationToken, voiceConfigured } from "@/lib/marketing/voice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isOwner())) return notOwner();
  if (!voiceConfigured()) {
    return Response.json({ error: "Voice isn't configured on this deployment." }, { status: 503 });
  }
  try {
    return Response.json(
      { token: await conversationToken() },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    console.error("voice session failed", error);
    return Response.json({ error: "Couldn't reach ElevenLabs." }, { status: 502 });
  }
}
