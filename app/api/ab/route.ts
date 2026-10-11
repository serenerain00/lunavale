/**
 * A/B event counter. See lib/analytics/experiments.ts.
 *
 * Same contract as /api/play: the body is three labels, each must be one the
 * registry knows, the experiment must be live today, and anything else is
 * dropped without a word — a 204 either way. Nothing identifies anybody; a
 * forged beacon can nudge a counter on the admin page and do nothing else.
 */
import { NextResponse } from "next/server";
import { EXPERIMENTS, experimentLive } from "@/lib/analytics/experiments";
import { recordAbEvent } from "@/lib/db/funnel";

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
  let body: { experiment?: unknown; variant?: unknown; event?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return done;
  }
  const e = typeof body.experiment === "string" ? EXPERIMENTS[body.experiment] : undefined;
  if (
    !e ||
    !experimentLive(e) ||
    typeof body.variant !== "string" ||
    !e.variants.includes(body.variant) ||
    typeof body.event !== "string" ||
    !e.events.includes(body.event)
  ) {
    return done;
  }
  try {
    await recordAbEvent(e.id, body.variant, body.event);
  } catch (error) {
    console.error("ab event failed", error);
  }
  return done;
}
