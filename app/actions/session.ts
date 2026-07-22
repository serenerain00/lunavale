/**
 * Membership actions.
 *
 * STUB standing in for Phase 3 auth + billing: these write the `lv_member`
 * cookie that lib/access/entitlement.ts reads, so the member and non-member
 * experiences are both demonstrable today.
 *
 * The deliberate constraint: nothing here may imply a payment happened. There
 * is no card form, no "order confirmed", no receipt. `startMembership` grants
 * PREVIEW access and every surface that shows membership state is required to
 * label it as such. When lib/billing/provider.ts reports a configured
 * provider, this action redirects to real checkout instead of granting
 * anything — see the branch below.
 */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MEMBER_COOKIE } from "@/lib/access/entitlement";
import { billingConfigured } from "@/lib/billing/provider";
import { getTier } from "@/lib/content/membership";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Begin a membership at the given tier.
 *
 * Bound with the tier id at the call site rather than read from form data, so
 * the tier can't be swapped by editing the DOM.
 */
export async function startMembership(tierId: string) {
  const tier = getTier(tierId);
  // Unknown or free tier: there is nothing to start. Send them to the pitch
  // rather than failing silently or granting something arbitrary.
  if (!tier || tier.id === "free") redirect("/membership");

  if (billingConfigured()) {
    // Phase 3: create a Checkout session for this tier and redirect to it.
    // Deliberately unimplemented — see lib/billing/provider.ts for why the
    // auth work has to land first.
    throw new Error(
      "Billing is configured but checkout is not implemented yet.",
    );
  }

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
 * One click, no retention flow, no "are you sure you want to lose access" —
 * docs/monetization/MONETIZATION.md calls for clear cancellation, and a
 * cancel button that argues back is the thing people remember about a site.
 */
export async function cancelMembership() {
  const store = await cookies();
  store.delete(MEMBER_COOKIE);
  revalidatePath("/", "layout");
  redirect("/account?ended=1");
}
