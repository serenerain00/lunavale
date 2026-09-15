/**
 * RFC 8058 one-click unsubscribe.
 *
 * This is the endpoint named in the `List-Unsubscribe` header, which is what
 * Gmail and Apple Mail turn into the small "Unsubscribe" link beside the
 * sender's name. When somebody presses it the mail client POSTs here directly,
 * with no browser and no page — so this has to do the work itself and answer
 * 200, which is the whole protocol.
 *
 * THE POST MUTATES AND THE GET DOES NOT, and that asymmetry is the point. A
 * POST here is a person pressing a button in their mail client. A GET is
 * usually a link scanner. Some clients do follow the header as a link, so GET
 * redirects to the page with the button rather than 404ing at them.
 *
 * NO AUTHENTICATION BEYOND THE SIGNATURE. There is no session here — the
 * request comes from a mail server. The HMAC in the URL is the proof, which is
 * exactly what it is for; see lib/email/unsubscribe.ts.
 */

import { NextResponse } from "next/server";
import { optOut, databaseConfigured } from "@/lib/db/email-list";
import { tokenValid } from "@/lib/email/unsubscribe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function params(request: Request) {
  const url = new URL(request.url);
  return { email: url.searchParams.get("e") ?? "", token: url.searchParams.get("t") ?? "" };
}

export async function POST(request: Request) {
  const { email, token } = params(request);
  if (!email || !tokenValid(email, token)) {
    return new NextResponse("Invalid link", { status: 400 });
  }
  if (!databaseConfigured()) {
    // 503 rather than 200: a mail client that is told "done" when nothing was
    // recorded will not ask again, and the person stays on the list.
    return new NextResponse("Unavailable", { status: 503 });
  }
  try {
    await optOut(email, "one-click");
    return new NextResponse("Unsubscribed", { status: 200 });
  } catch (err) {
    console.error("one-click unsubscribe failed", err);
    return new NextResponse("Failed", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { email, token } = params(request);
  const to = new URL("/unsubscribe", request.url);
  if (email) to.searchParams.set("e", email);
  if (token) to.searchParams.set("t", token);
  return NextResponse.redirect(to, 302);
}
