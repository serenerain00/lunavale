/**
 * Daily: copy yesterday's traffic out of Clarity into traffic_daily.
 *
 * Scheduled in vercel.json at 00:15 UTC. Clarity's window is "the 24 hours
 * before this call", so a run just after midnight UTC covers the UTC day that
 * just ended, and the row is filed under that day.
 *
 * SPENDS THREE OF CLARITY'S TEN DAILY REQUESTS. Do not point anything else at
 * this route; a second run on the same day overwrites the row with the same
 * numbers and wastes three more.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on scheduled calls; that
 * is the only caller this accepts.
 */
import { NextResponse, type NextRequest } from "next/server";
import { clarityToken, fetchTrafficDay } from "@/lib/analytics/clarity";
import { saveTrafficDay } from "@/lib/db/funnel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const token = clarityToken();
  if (!token) {
    return NextResponse.json({ ok: false, error: "CLARITY_API_TOKEN is not set" }, { status: 503 });
  }

  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  try {
    const data = await fetchTrafficDay(token, 1);
    await saveTrafficDay(yesterday, 1, data);
    return NextResponse.json({ ok: true, day: yesterday, sessions: data.sessions });
  } catch (error) {
    console.error("cron/clarity failed", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 502 });
  }
}
