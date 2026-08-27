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
import {
  priceIdFor,
  siteUrl,
  stripeConfigured,
  type BillingInterval,
} from "@/lib/billing/provider";
import type { TierId } from "@/lib/content/membership";

let client: Stripe | undefined;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  // Cached across invocations — Fluid Compute reuses instances, so rebuilding
  // the client per request would be waste.
  client ??= new Stripe(key, {
    // Pin the wire version explicitly. stripe-node already defaults to the
    // version its types are generated against, so this doesn't change today's
    // behaviour — it makes a future SDK upgrade a deliberate decision rather
    // than a silent change to what the API receives.
    apiVersion: "2026-06-24.dahlia",
  });
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
  /**
   * Clerk user id, when there is one.
   *
   * NULL IS THE NEW NORMAL PATH. Checkout no longer waits for an account —
   * see app/membership/start/route.ts. A session with no user id is matched
   * back to a person by the email Stripe collects, and the webhook parks it in
   * `pending_memberships` until they make an account.
   */
  userId: string | null;
  interval?: BillingInterval;
  email?: string;
  existingCustomerId?: string;
}): Promise<string> {
  if (!stripeConfigured()) throw new Error("Stripe is not configured");

  const interval: BillingInterval = input.interval ?? "month";
  const price = priceIdFor(input.tier, interval);
  if (!price) {
    throw new Error(
      `No Stripe price configured for "${input.tier}" — set STRIPE_PRICE_${input.tier.toUpperCase()}`,
    );
  }

  // Reuse a session this person already has open, rather than minting another.
  //
  // /membership/start is a GET, and a GET can be fetched by things that are
  // not a decision to buy: a link prefetch, a speculative load, a double tap,
  // a back button. Each one used to produce its own Checkout Session. That
  // never double-charged anybody — only one session can be paid — but it left
  // orphaned sessions behind and inflated the abandonment count, so the one
  // number that measures this page could not be trusted.
  //
  // The link no longer prefetches (components/membership/TierCard.tsx), but
  // that fixes one caller rather than the route. This makes the route itself
  // safe to call twice, which is the property a GET actually needs to have.
  // Only for a signed-in buyer: the match is on the Clerk id, and a signed-out
  // one does not have it yet. Two anonymous clicks make two sessions, which is
  // the correct trade — reusing across anonymous visitors would be far worse.
  //
  // Keyed on the interval too. Without it, somebody who clicked monthly and
  // came back for yearly would be handed their old monthly session and be
  // charged $8 for the plan they just chose to leave.
  if (input.userId) {
    const open = await openSessionFor(input.userId, input.tier, interval);
    if (open) return open;
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    ...(input.userId ? { client_reference_id: input.userId } : {}),
    // Also on the SESSION, not only on subscription_data below. The
    // subscription copy is what every later webhook carries; this copy is what
    // openSessionFor() matches on, and what makes an abandoned session on
    // /admin say which tier the person was looking at when they stopped.
    metadata: { userId: input.userId ?? "", tier: input.tier, interval },
    ...(input.existingCustomerId
      ? { customer: input.existingCustomerId }
      : input.email
        ? { customer_email: input.email }
        : {}),
    subscription_data: {
      metadata: { userId: input.userId ?? "", tier: input.tier, interval },
    },
    // Stripe's own cancellation flow, so "cancel any time" is true at the
    // source rather than something we have to implement and remember to keep.
    // A signed-in buyer already has somewhere to land. A signed-out one has
    // paid and has no account yet, so they go to /welcome, which turns the
    // email Stripe just collected into an account in one step.
    success_url: input.userId
      ? `${siteUrl()}/account?started=1`
      : `${siteUrl()}/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/membership`,
    allow_promotion_codes: true,
    // Don't demand a card when nothing is owed. Stripe's default for
    // subscriptions is to collect one regardless, which turns a 100%-off comp
    // code — the way somebody is given the site for free — into a checkout
    // that still asks for card details. It changes nothing for a paying
    // member: if there is an amount due, Stripe still collects.
    payment_method_collection: "if_required",
  });

  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

/**
 * A Checkout Session this user already has open for this tier, if there is one.
 *
 * Matched on `client_reference_id` — the Clerk user id, which the session is
 * stamped with at creation — plus the tier carried in subscription metadata,
 * so switching from one tier to another still gets its own session rather than
 * silently reusing the wrong plan's.
 *
 * Only `status: "open"` sessions are candidates. Stripe expires them after
 * roughly a day and a completed one is not reusable, so this can never hand
 * somebody a session that has already been paid.
 *
 * Returns undefined on any failure rather than throwing: this is an
 * optimisation on the way to checkout, and a Stripe hiccup here should cost a
 * duplicate session, not the sale.
 */
async function openSessionFor(
  userId: string,
  tier: TierId,
  interval: BillingInterval,
): Promise<string | undefined> {
  try {
    const sessions = await stripe().checkout.sessions.list({
      status: "open",
      limit: 100,
    });
    const match = sessions.data.find(
      (s) =>
        s.client_reference_id === userId &&
        // Must be an EXACT tier match, never a fallback. An earlier draft
        // treated "no tier on the session" as a match, which would have handed
        // somebody clicking Patron a session for Vault the moment a second
        // tier went on sale. Sessions created before this line existed carry
        // no tier and are correctly ignored.
        s.metadata?.tier === tier &&
        // Same reasoning as the tier, one level down. A session made before
        // yearly existed carries no interval; treating that as monthly is
        // correct, because monthly is the only thing it could have been.
        (s.metadata?.interval ?? "month") === interval &&
        Boolean(s.url),
    );
    return match?.url ?? undefined;
  } catch (error) {
    console.error("openSessionFor: could not list checkout sessions", error);
    return undefined;
  }
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
