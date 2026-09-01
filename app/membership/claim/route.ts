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
 * IT IS ALSO SAFE TO HIT WHENEVER. Claiming is idempotent (claimPendingFor
 * only ever matches an unclaimed row), there is nothing to claim for most
 * people, and anybody who arrives here signed out is simply sent to sign in.
 */

import { NextResponse, type NextRequest } from "next/server";
import { billingLive } from "@/lib/billing/provider";
import { claimPendingFor } from "@/lib/db/memberships";

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
  if (!userId) {
    const back = "/membership/claim";
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

  return NextResponse.redirect(
    new URL(claimed ? "/account?started=1" : "/account", origin),
  );
}
