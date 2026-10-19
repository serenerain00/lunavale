/**
 * Hourly: remind anybody who paid over an hour ago and has no account yet.
 * Once per address, ever. See lib/email/finish-account.ts. `?dry=1` lists
 * what it would do and sends nothing.
 */
import { NextResponse, type NextRequest } from "next/server";
import { runFinishAccount } from "@/lib/email/finish-account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: false, error: "no database" });
  try {
    const dry = request.nextUrl.searchParams.get("dry") === "1";
    return NextResponse.json(await runFinishAccount({ send: !dry }));
  } catch (error) {
    console.error("cron/finish-account failed", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
