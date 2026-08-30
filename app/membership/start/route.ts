/**
 * /membership/start?tier=<id>&interval=<month|year> — the one entry point that
 * begins a membership.
 *
 * CHECKOUT NO LONGER WAITS FOR AN ACCOUNT (2026-08-27, Melissa's call after
 * watching people reach the membership page and leave).
 *
 * What it used to do: a signed-out visitor was sent to Clerk, made an account,
 * waited for a verification code in their email, typed it, came back here, and
 * only THEN saw a price field. Three screens stood between deciding to buy and
 * being able to. An earlier pass fixed the worst of it — the redirect carries
 * you back here rather than dumping you on the pricing page — but the account
 * itself was still a wall in front of the till.
 *
 * What it does now: a signed-out visitor goes straight to Stripe. Stripe
 * collects the email, the webhook parks the membership against that email in
 * `pending_memberships`, and /welcome turns it into an account afterwards, on
 * the other side of the payment, when they are already committed.
 *
 * WHY THAT IS SAFE. Nothing is granted by the cookie in production
 * (lib/access/entitlement.ts ignores it whenever billing is live), so a
 * pending membership opens nothing until a signed-in Clerk user with a
 * VERIFIED matching email claims it. Payment first does not mean access first.
 *
 * AND IT IS SELF-HEALING. If somebody pays and closes the tab before making an
 * account, the row sits there keyed by their email; whenever they sign up or
 * sign in with that address — that day or a month later — /account claims it.
 * Nobody can pay and end up with nothing.
 *
 * A SIGNED-IN buyer skips all of that and goes straight to Stripe as before,
 * with their Clerk id on the session.
 *
 * Handles both modes, same as the old action did:
 *   billing live  → Stripe Checkout (signed in or not)
 *   preview       → set the preview cookie → /account
 *
 * The tier and interval come from the query string and are both validated
 * against the real list, so a hand-edited URL cannot conjure a plan or a price.
 */

import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_COOKIE } from "@/lib/access/entitlement";
import { billingLive, isBillingInterval } from "@/lib/billing/provider";
import { getTier } from "@/lib/content/membership";
import { membershipForUser } from "@/lib/db/memberships";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const params = request.nextUrl.searchParams;
  const tier = getTier(params.get("tier") ?? "");

  // Unknown or free tier: nothing to start.
  if (!tier || tier.id === "free") {
    return NextResponse.redirect(new URL("/membership", origin));
  }

  // Anything that is not "year" is monthly, including nothing at all — so
  // every link that predates the yearly plan keeps buying what it always did.
  const raw = params.get("interval") ?? "month";
  const interval = isBillingInterval(raw) ? raw : "month";

  if (billingLive()) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    const { createCheckoutSession } = await import("@/lib/billing/stripe");

    // SIGNED OUT: straight to the card. No account, no verification code, no
    // second visit to this route. Stripe collects the email and the webhook
    // does the rest.
    if (!userId) {
      const url = await createCheckoutSession({
        tier: tier.id,
        userId: null,
        interval,
      });
      return NextResponse.redirect(url);
    }

    const [user, existing] = await Promise.all([
      currentUser(),
      membershipForUser(userId),
    ]);

    const url = await createCheckoutSession({
      tier: tier.id,
      userId,
      interval,
      email: user?.primaryEmailAddress?.emailAddress,
      existingCustomerId: existing?.stripeCustomerId,
    });
    return NextResponse.redirect(url);
  }

  // ---- Preview mode: grant the labeled preview, no charge -----------------
  const res = NextResponse.redirect(new URL("/account?started=1", origin));
  res.cookies.set(MEMBER_COOKIE, tier.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}
