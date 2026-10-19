/**
 * The player's "somebody pressed play" beacon. Counts; returns nothing.
 *
 * Sent with navigator.sendBeacon from components/media/VideoPlayer.tsx, once
 * per player, on the first `play`. It is the only way to count "started
 * watching": /api/stream is hit by every page view because the player
 * preloads metadata.
 *
 * NOTHING HERE IS TRUSTED FOR ACCESS and nothing identifies anyone. The body
 * is a slug and two labels; the slug must be a real one, the labels must be
 * from the fixed lists, and anything else is dropped without a word — a 204
 * either way, so there is nothing to probe. A forged beacon can inflate a
 * counter on the admin page and do nothing else.
 */
import { NextResponse } from "next/server";
import { getStreamable } from "@/lib/content/streamable";
import { PLAY_SOURCES, PLAY_VIEWERS, recordPlay, recordPreviewEnd, type PlaySource, type PlayViewer } from "@/lib/db/funnel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const done = new NextResponse(null, { status: 204 });
  if (!process.env.DATABASE_URL) return done;
  // A local dev server shares the production database (.env.local), so a
  // test run would land in the real counts — it did once, 2026-10-11, and the
  // rows had to be removed by hand. Counted only in production unless
  // RECORD_LOCAL_EVENTS=1 is set on purpose.
  if (process.env.NODE_ENV !== "production" && process.env.RECORD_LOCAL_EVENTS !== "1") return done;

  let body: { slug?: unknown; viewer?: unknown; source?: unknown; event?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  const slug = typeof body.slug === "string" ? body.slug : "";
  const viewer = body.viewer as PlayViewer;
  const source = body.source as PlaySource;
  if (
    slug.length > 120 ||
    !getStreamable(slug) ||
    !PLAY_VIEWERS.includes(viewer) ||
    !PLAY_SOURCES.includes(source)
  ) {
    return done;
  }

  try {
    // `event: "preview_end"` — a non-member reached the end of a free
    // preview (2026-10-18). Anything else is a play start, as before.
    if (body.event === "preview_end") await recordPreviewEnd(slug, source);
    else await recordPlay(slug, viewer, source);
  } catch (error) {
    console.error("play beacon failed", error);
  }
  return done;
}
