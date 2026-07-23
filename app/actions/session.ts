/**
 * Membership actions.
 *
 * Beginning a membership lives in the GET route app/membership/start/route.ts,
 * not here, because sign-up must flow straight into checkout: the route sends a
 * signed-out visitor to Clerk with a redirect_url back to itself, so checkout
 * resumes automatically once they verify — no second click on the pricing page.
 * This file keeps only the cancel path.
 *
 * The constraint that governs both: nothing may imply a payment that didn't
 * happen. No card form here, no "order confirmed", no receipt. Card details
 * never touch this application — Checkout and the portal are Stripe's pages.
 */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MEMBER_COOKIE } from "@/lib/access/entitlement";
import { authConfigured, billingLive } from "@/lib/billing/provider";
import { membershipForUser } from "@/lib/db/memberships";

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
