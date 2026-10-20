/**
 * /membership/claim — attach a membership that was paid for before the account
 * existed.
 *
 * Where it sits: checkout now runs before sign-up (app/membership/start), so a
 * new member pays, lands on /welcome, makes an account, and Clerk sends them
 * here. This is the join.
 *
 * THE SECURITY BOUNDARY IS ONE LINE, and it is the verified-email check below.
 * A pending row is keyed by the address that paid, so claiming it has to
 * require proof of that address — otherwise anybody could type a stranger's
 * email into a sign-up form and walk off with their subscription. Clerk only
 * marks an address verified after the code has been entered, so
 * `verification.status === "verified"` is that proof.
 *
 * AND A SECOND PROOF SINCE 2026-09-25: THE CHECKOUT SESSION. /welcome now
 * passes `session_id` through sign-up to here. If it resolves to a paid
 * session, the subscription on it is claimed for whoever is signed in,
 * whatever email their account uses. That closes the case that stranded a
 * real customer — paid with one address, signed up with Google on another.
 * The session id is the proof: Stripe only ever puts it on the success URL
 * of the browser that paid. See claimPendingBySubscription().
 *
 * IT IS ALSO SAFE TO HIT WHENEVER. Claiming is idempotent (claimPendingFor
 * only ever matches an unclaimed row), there is nothing to claim for most
 * people, and anybody who arrives here signed out is simply sent to sign in.
 */

import { PAID_COOKIE } from "@/lib/billing/paid-cookie";
import { NextResponse, type NextRequest } from "next/server";
import { billingLive } from "@/lib/billing/provider";
import { claimPendingFor } from "@/lib/db/memberships";
import { claimBySession } from "@/lib/billing/claim-by-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  if (!billingLive()) {
    return NextResponse.redirect(new URL("/account", origin));
  }

  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();

  // Not signed in — they cannot claim anything yet. Send them to sign in and
  // come straight back here, so the claim happens the moment they are.
  const sessionId = request.nextUrl.searchParams.get("session_id") ?? "";

  if (!userId) {
    // Keep the session on the way round, or signing in would drop the proof.
    const back = sessionId
      ? `/membership/claim?session_id=${encodeURIComponent(sessionId)}`
      : "/membership/claim";
    return NextResponse.redirect(
      new URL(`/sign-in?redirect_url=${encodeURIComponent(back)}`, origin),
    );
  }

  const user = await currentUser();

  // VERIFIED addresses only, and all of them — somebody can pay with one
  // address and sign up with another they also own, and both being verified
  // is exactly the condition that makes honouring it correct.
  const verified = (user?.emailAddresses ?? [])
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress);

  let claimed = false;
  for (const email of verified) {
    // Stops at the first hit: one person, one membership.
    if (await claimPendingFor(userId, email)) {
      claimed = true;
      break;
    }
  }

  // The email did not match — the paying address is not on this account.
  // The checkout session still can.
  if (!claimed && sessionId) {
    claimed = await claimBySession(userId, sessionId);
  }

  const res = NextResponse.redirect(
    new URL(claimed ? "/account?started=1" : "/account", origin),
  );
  // The paid-browser marker has done its job once the payment is attached:
  // from here on, signing in is what recognises them. ONLY THEN (2026-10-20) —
  // it used to go on every visit, claimed or not, which threw away the one
  // thing that stops this browser paying a second time.
  if (claimed) res.cookies.delete(PAID_COOKIE);
  return res;
}
