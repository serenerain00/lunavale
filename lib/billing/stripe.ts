/**
 * Stripe client and the two flows that touch it.
 *
 * Deliberately thin. Checkout and the billing portal are both hosted by
 * Stripe, which means card details never reach this application at all — no
 * card form to build, nothing sensitive to log by accident, and PCI scope
 * stays with Stripe. The membership page's "no deceptive billing" promise is
 * a lot easier to keep when the payment page isn't ours to get wrong.
 */

import "server-only";
import Stripe from "stripe";
import { priceIdFor, siteUrl, stripeConfigured } from "@/lib/billing/provider";
import type { TierId } from "@/lib/content/membership";

let client: Stripe | undefined;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // Cached across invocations — Fluid Compute reuses instances, so rebuilding
  // the client per request would be waste.
  client ??= new Stripe(key);
  return client;
}

/**
 * Start a subscription.
 *
 * The Clerk user id rides along in two places: `client_reference_id`, which is
 * what the completed-checkout event carries, and subscription metadata, which
 * is what every later subscription event carries. Without the second one, a
 * renewal or cancellation arriving months later would have no way back to a
 * person.
 */
export async function createCheckoutSession(input: {
  tier: TierId;
  userId: string;
  email?: string;
  existingCustomerId?: string;
}): Promise<string> {
  if (!stripeConfigured()) throw new Error("Stripe is not configured");

  const price = priceIdFor(input.tier);
  if (!price) {
    throw new Error(
      `No Stripe price configured for "${input.tier}" — set STRIPE_PRICE_${input.tier.toUpperCase()}`,
    );
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: input.userId,
    ...(input.existingCustomerId
      ? { customer: input.existingCustomerId }
      : { customer_email: input.email }),
    subscription_data: {
      metadata: { userId: input.userId, tier: input.tier },
    },
    // Stripe's own cancellation flow, so "cancel any time" is true at the
    // source rather than something we have to implement and remember to keep.
    success_url: `${siteUrl()}/account?started=1`,
    cancel_url: `${siteUrl()}/membership`,
    allow_promotion_codes: true,
  });

  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

/**
 * The billing portal — where cancelling actually happens.
 *
 * Handing this to Stripe rather than building our own cancel button is the
 * honest choice: it always reflects the real subscription state, it can't
 * drift from what Stripe thinks, and it cannot quietly grow a retention flow
 * that argues with somebody trying to leave.
 */
export async function createPortalSession(
  customerId: string,
): Promise<string> {
  const session = await stripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl()}/account`,
  });
  return session.url;
}
