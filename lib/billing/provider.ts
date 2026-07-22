/**
 * Billing provider seam.
 *
 * There is no payment processor connected yet, and the app is required to be
 * honest about that rather than mimic a checkout. This module is the single
 * place that knows, so the answer can't drift between the pitch page, the
 * account page and the entitlement layer.
 *
 * Wiring Phase 3 (see docs/roadmap/ROADMAP.md) means, in order:
 *   1. real authentication, so a subscription can belong to somebody
 *   2. a `memberships` record keyed by user, holding tier + period end
 *   3. `startCheckout` below redirecting to a Stripe Checkout session
 *   4. a webhook writing the subscription state into that record
 *   5. `lib/access/entitlement.ts#readTier` reading it instead of a cookie
 *
 * Until step 1 exists, none of the rest can be built honestly — a checkout
 * with nowhere to attach the result is theatre.
 */

/**
 * Whether a payment provider is configured. Env-driven so that turning billing
 * on is a deployment decision, not a code change, and so preview deployments
 * can run without keys.
 */
export function billingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
