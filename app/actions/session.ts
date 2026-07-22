/**
 * Membership actions.
 *
 * Two modes, decided by what's configured (lib/billing/provider.ts):
 *
 *   LIVE — auth, Stripe and a database are all present. `startMembership`
 *   sends the visitor to Stripe Checkout; nothing here grants access. Access
 *   arrives later, from the webhook, once Stripe confirms the payment. Ending
 *   a membership opens Stripe's own billing portal.
 *
 *   PREVIEW — something isn't wired yet. `startMembership` sets a cookie so
 *   the member experience is demonstrable, and every surface that shows
 *   membership state says plainly that no payment was taken.
 *
 * The constraint across both: nothing may imply a payment that didn't happen.
 * There is no card form here, no "order confirmed", no receipt. Card details
 * never touch this application — Checkout and the portal are Stripe's pages.
 */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MEMBER_COOKIE } from "@/lib/access/entitlement";
import { authConfigured, billingLive } from "@/lib/billing/provider";
import { getTier } from "@/lib/content/membership";
import { membershipForUser } from "@/lib/db/memberships";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Begin a membership at the given tier.
 *
 * Bound with the tier id at the call site rather than read from form data, so
 * the tier can't be swapped by editing the DOM.
 */
export async function startMembership(tierId: string) {
  const tier = getTier(tierId);
  // Unknown or free tier: there is nothing to start.
  if (!tier || tier.id === "free") redirect("/membership");

  if (billingLive()) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();

    // A subscription has to belong to somebody. Send them to sign in first and
    // bring them back here — buying is pointless if we can't attribute it.
    if (!userId) redirect(`/sign-in?redirect_url=/membership`);

    const [user, existing] = await Promise.all([
      currentUser(),
      membershipForUser(userId),
    ]);

    // Reuse the Stripe customer if they've subscribed before, so one person
    // doesn't accumulate duplicate customers and a confusing billing history.
    const { createCheckoutSession } = await import("@/lib/billing/stripe");
    const url = await createCheckoutSession({
      tier: tier.id,
      userId,
      email: user?.primaryEmailAddress?.emailAddress,
      existingCustomerId: existing?.stripeCustomerId,
    });

    redirect(url);
  }

  // ---- Preview mode -------------------------------------------------------
  const store = await cookies();
  store.set(MEMBER_COOKIE, tier.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });

  revalidatePath("/", "layout");
  redirect("/account?started=1");
}

/**
 * End the membership.
 *
 * When billing is live this opens Stripe's billing portal rather than
 * cancelling locally. Two reasons: the portal always reflects the real
 * subscription state, and it cannot quietly grow a retention flow that argues
 * with somebody trying to leave. Cancelling locally would also be a lie — the
 * card would keep being charged.
 */
export async function cancelMembership() {
  if (billingLive() && authConfigured()) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const existing = await membershipForUser(userId);
    if (existing?.stripeCustomerId) {
      const { createPortalSession } = await import("@/lib/billing/stripe");
      redirect(await createPortalSession(existing.stripeCustomerId));
    }
    // Signed in with nothing to cancel — say so rather than pretending.
    redirect("/account");
  }

  const store = await cookies();
  store.delete(MEMBER_COOKIE);
  revalidatePath("/", "layout");
  redirect("/account?ended=1");
}
