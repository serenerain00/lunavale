/**
 * Claim a parked payment by the Checkout Session that paid for it.
 *
 * The session id is the proof: Stripe only ever puts it on the success URL of
 * the browser that paid, and /welcome keeps it in the PAID_COOKIE. Used by
 * /membership/claim (session in the URL), and since 2026-10-20 by entitlement
 * and by Join (session in the cookie) — see the note in app/membership/start.
 */
import "server-only";
import { claimPendingBySubscription } from "@/lib/db/memberships";

/**
 * The subscription on a Checkout Session, only if Stripe says it was paid.
 *
 * Retrieved from Stripe rather than trusted from the request: the only thing
 * taken from the caller is the session id, and a made-up or abandoned one
 * returns nothing. Failure is quiet on purpose — the health check warns about
 * anything left unclaimed for over an hour.
 */
export async function paidSubscriptionFor(sessionId: string): Promise<string | null> {
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  try {
    const { stripe } = await import("@/lib/billing/stripe");
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const done =
      session.payment_status === "paid" || session.status === "complete";
    if (!done || !session.subscription) return null;
    return typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  } catch (error) {
    console.error("claim: could not read checkout session", error);
    return null;
  }
}

/** True when this session's payment was waiting and is now this user's. */
export async function claimBySession(userId: string, sessionId: string): Promise<boolean> {
  const subscriptionId = await paidSubscriptionFor(sessionId);
  return subscriptionId ? claimPendingBySubscription(userId, subscriptionId) : false;
}
