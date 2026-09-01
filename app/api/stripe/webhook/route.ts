/**
 * Stripe webhook — the only thing in the app that grants paid access.
 *
 * Access is never granted from the browser's return trip out of Checkout.
 * That redirect is just a redirect: anyone can visit /account?started=1, and a
 * payment that fails after the redirect would otherwise leave someone let in.
 * The subscription is real when Stripe says it is, here, over a signed
 * request.
 *
 * Three properties this handler has to have, all of which Stripe's delivery
 * behavior will test:
 *
 *   Verified   — the raw body is checked against STRIPE_WEBHOOK_SECRET before
 *                anything is parsed. Without that, this endpoint is a public
 *                "give me a membership" button.
 *   Idempotent — Stripe retries. Event ids are claimed in the database, so a
 *                redelivery is a no-op.
 *   Order-safe — deliveries can arrive out of order, so every relevant event
 *                re-reads the subscription from Stripe and writes the current
 *                truth, rather than applying a delta.
 */

import type Stripe from "stripe";
import { stripe } from "@/lib/billing/stripe";
import { stripeConfigured, tierForPriceId } from "@/lib/billing/provider";
import {
  eventHandled,
  markEventHandled,
  recordMembership,
  recordPendingMembership,
} from "@/lib/db/memberships";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The events that can change what somebody may open. */
const HANDLED = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return new Response("Billing is not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // Must be the raw body — any parsing first and the signature won't match.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("stripe webhook: signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (!HANDLED.has(event.type)) {
    // 200 so Stripe stops retrying something we are choosing to ignore.
    return Response.json({ ignored: event.type });
  }

  try {
    // Skip only events already applied. This is a check, not a claim: if the
    // work below throws, we return 500, Stripe retries, and the retry re-applies
    // rather than being waved through as a duplicate. Recording the id happens
    // AFTER the work succeeds, so a transient failure can't drop a membership.
    if (await eventHandled(event.id)) {
      return Response.json({ duplicate: event.id });
    }

    // Idempotent — re-reads the subscription and upserts its current state — so
    // a concurrent double-delivery that both reach here is harmless.
    await applyEvent(event);
    await markEventHandled(event.id, event.type);
    return Response.json({ ok: true });
  } catch (error) {
    // 500 asks Stripe to retry. A transient failure must not silently drop
    // somebody's membership, which is exactly what claiming-before-applying
    // used to do here.
    console.error(`stripe webhook: handling ${event.type} failed`, error);
    return new Response("Handler failed", { status: 500 });
  }
}

async function applyEvent(event: Stripe.Event): Promise<void> {
  const subscriptionId =
    event.type === "checkout.session.completed"
      ? subscriptionIdFromSession(event.data.object as Stripe.Checkout.Session)
      : (event.data.object as Stripe.Subscription).id;

  if (!subscriptionId) return;

  // Always re-read rather than trusting the payload: deliveries arrive out of
  // order, and an old "updated" event overwriting a newer one would hand
  // somebody back access they had canceled.
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  const userId = userIdFor(subscription, event);

  const priceId = subscription.items.data[0]?.price.id;
  const tier =
    (priceId ? tierForPriceId(priceId) : undefined) ??
    (subscription.metadata?.tier as ReturnType<typeof tierForPriceId>);
  if (!tier) {
    console.error(
      `stripe webhook: price ${priceId} maps to no tier — check STRIPE_PRICE_* env`,
    );
    return;
  }

  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  // THE ORDINARY PATH FOR A NEW BUYER SINCE 2026-08-27: paid, no account yet.
  // Checkout runs before sign-up now (app/membership/start/route.ts), so a
  // brand-new member has no Clerk id at the moment this fires. Park it against
  // the email Stripe collected and let /welcome or /account claim it.
  //
  // This is NOT a failure branch and must not be treated as one. The old code
  // logged "cannot attribute" and dropped the event on the floor, which would
  // now discard every first-time purchase on the site.
  if (!userId) {
    const email = await emailForSubscription(subscription, event);
    if (!email) {
      // Genuinely unattributable: no id and no address. Stripe always collects
      // an email at checkout, so this means something is wrong rather than
      // something is new — leave it loud.
      console.error(
        `stripe webhook: subscription ${subscriptionId} has neither a userId nor an email — cannot attribute`,
      );
      return;
    }
    await recordPendingMembership({
      email,
      tier,
      status: subscription.status,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: periodEnd(subscription),
    });
    return;
  }

  await recordMembership({
    userId,
    tier,
    status: subscription.status,
    stripeCustomerId,
    stripeSubscriptionId: subscription.id,
    currentPeriodEnd: periodEnd(subscription),
  });
}

/**
 * The address that paid, for a subscription with no Clerk id on it.
 *
 * Tried in order of reliability: what the visitor actually typed on the card
 * form, then the session's pre-filled address, then the Customer object. The
 * Customer is the fallback rather than the source because a returning buyer
 * can have an older address on it than the one they just used.
 */
async function emailForSubscription(
  subscription: Stripe.Subscription,
  event: Stripe.Event,
): Promise<string | undefined> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const fromSession =
      session.customer_details?.email ?? session.customer_email ?? undefined;
    if (fromSession) return fromSession;
  }

  try {
    const customer = await stripe().customers.retrieve(
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    );
    if (!customer.deleted && customer.email) return customer.email;
  } catch (error) {
    console.error("stripe webhook: could not read customer email", error);
  }
  return undefined;
}

function subscriptionIdFromSession(
  session: Stripe.Checkout.Session,
): string | undefined {
  if (!session.subscription) return undefined;
  return typeof session.subscription === "string"
    ? session.subscription
    : session.subscription.id;
}

/**
 * Which Clerk user this belongs to.
 *
 * Subscription metadata is set at checkout and carried by every later event,
 * so it is the reliable source. The session's client_reference_id is the
 * fallback for the one event that has it.
 */
function userIdFor(
  subscription: Stripe.Subscription,
  event: Stripe.Event,
): string | undefined {
  const fromMetadata = subscription.metadata?.userId;
  if (fromMetadata) return fromMetadata;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return session.client_reference_id ?? undefined;
  }
  return undefined;
}

/**
 * End of the paid period.
 *
 * Read off the subscription item rather than the subscription: Stripe moved
 * `current_period_end` down to the item level, and the top-level field is not
 * present on newer API versions. Falling back to `null` means "no known end",
 * which the entitlement layer treats as expired for a non-active status —
 * the safe direction.
 */
function periodEnd(subscription: Stripe.Subscription): Date | null {
  const seconds =
    subscription.items.data[0]?.current_period_end ??
    (subscription as unknown as { current_period_end?: number })
      .current_period_end;
  return typeof seconds === "number" ? new Date(seconds * 1000) : null;
}
