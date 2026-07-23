/**
 * /membership/start?tier=<id> — the one entry point that begins a membership.
 *
 * Why a GET route and not the old form action: sign-up has to flow straight
 * into checkout. When a signed-out visitor starts here, we send them to Clerk
 * with redirect_url pointing back at THIS url — so the moment they finish
 * verifying their email, Clerk redirects here again, now signed in, and we go
 * straight to Stripe. No landing back on the pricing page, no second click.
 * That second click was where people were dropping off.
 *
 * Handles both modes, same as the old action did:
 *   billing live  → Clerk sign-in (if needed) → Stripe Checkout
 *   preview        → set the preview cookie → /account
 *
 * The tier comes from the query string, but it's validated against the real
 * tier list, so a hand-edited ?tier= can't conjure a plan or a price.
 */

import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_COOKIE } from "@/lib/access/entitlement";
import { billingLive } from "@/lib/billing/provider";
import { getTier } from "@/lib/content/membership";
import { membershipForUser } from "@/lib/db/memberships";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const tier = getTier(request.nextUrl.searchParams.get("tier") ?? "");

  // Unknown or free tier: nothing to start.
  if (!tier || tier.id === "free") {
    return NextResponse.redirect(new URL("/membership", origin));
  }

  if (billingLive()) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();

    // Not signed in yet — send to Clerk, and come straight back HERE (not the
    // pricing page) so checkout continues automatically once verified.
    if (!userId) {
      const back = `/membership/start?tier=${tier.id}`;
      return NextResponse.redirect(
        new URL(`/sign-up?redirect_url=${encodeURIComponent(back)}`, origin),
      );
    }

    const [user, existing] = await Promise.all([
      currentUser(),
      membershipForUser(userId),
    ]);

    const { createCheckoutSession } = await import("@/lib/billing/stripe");
    const url = await createCheckoutSession({
      tier: tier.id,
      userId,
      email: user?.primaryEmailAddress?.emailAddress,
      existingCustomerId: existing?.stripeCustomerId,
    });
    return NextResponse.redirect(url);
  }

  // ---- Preview mode: grant the labelled preview, no charge -----------------
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
