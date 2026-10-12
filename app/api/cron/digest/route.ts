/**
 * Fridays 14:00 UTC (10am Eastern): the weekly digest. See lib/email/digest.ts.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; nothing else is accepted.
 * Sends only when DIGEST_ENABLED=1. `?dry=1` (still secret-gated) resolves the
 * recipients and sends nothing.
 */
import { NextResponse, type NextRequest } from "next/server";
import { runDigest } from "@/lib/email/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// A list this size takes well under a minute at Resend's 2/second.
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const dry = request.nextUrl.searchParams.get("dry") === "1";
    const summary = await runDigest({ send: !dry });
    return NextResponse.json(summary);
  } catch (error) {
    console.error("cron/digest failed", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
