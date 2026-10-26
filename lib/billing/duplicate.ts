/**
 * A member paying a second time: cancel the new one and refund it (2026-10-26).
 *
 * WHY. Checkout runs before sign-in (app/membership/start/route.ts), so a
 * member on a phone or browser where they are signed out can press Join and
 * pay again: Stripe collects the email but makes a new customer every time.
 * Four in two weeks — the 10-13 customer, Andrea, Tina, Jeannie — each found
 * by the health check and refunded by hand. Melissa: "i wanna reduce this
 * inconvenience … do both" (this, and the sign-in line in PlayJoin.tsx).
 *
 * WHAT COUNTS AS ALREADY A MEMBER. The address that just paid has ANOTHER
 * subscription that is live and staying — active or trialing, renewal on —
 * found on a Stripe customer with that email, on a membership held by a site
 * account with that email, or parked unclaimed against it. Deliberately not:
 *   - someone running out a cancelled membership (paying again is them
 *     coming back, and their old one ends on its own);
 *   - past_due (locked out until paid, and cancelled under the past-due rule);
 *   - a signed-in buyer (the start route already sends members to /account).
 * Different emails for one person (Andrea) cannot be seen here; the health
 * check still catches those.
 *
 * WHAT IT DOES, in this order, each step safe to repeat: mark the new
 * subscription with `duplicateOf`, cancel it at once (no proration, no
 * invoice), refund its payment in full with reason "duplicate", log it on
 * /admin. The webhook runs it; so does /welcome, so the page they land on can
 * say so even if the webhook has not arrived yet. Stripe idempotency keys
 * make the two meet on the same cancel and the same refund.
 *
 * IT NEVER BREAKS A PAYMENT. Any error returns null and the payment carries
 * on exactly as before this file existed: recorded, claimable, and caught by
 * the health check if it really was a duplicate.
 *
 * OFF UNLESS DUPLICATE_GUARD=1.
 */
import "server-only";
import type Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

export function duplicateGuardEnabled(): boolean {
  return process.env.DUPLICATE_GUARD === "1";
}

export interface DuplicateRefund {
  email: string;
  /** The membership they already had, which is untouched. */
  kept: string;
  amountCents: number;
}

const LIVE = new Set(["active", "trialing"]);

function staying(sub: Stripe.Subscription): boolean {
  return LIVE.has(sub.status) && !sub.cancel_at_period_end && sub.cancel_at == null;
}

export async function refundIfDuplicate(
  sessionId: string,
  deps: { stripe?: Stripe; userIdsForEmail?: (email: string) => Promise<string[]> } = {},
): Promise<DuplicateRefund | null> {
  if (!duplicateGuardEnabled()) return null;
  if (!/^cs_(live|test)_[A-Za-z0-9]+$/.test(sessionId)) return null;
  try {
    const s = deps.stripe ?? (await import("@/lib/billing/stripe")).stripe();
    const session = await s.checkout.sessions.retrieve(sessionId);
    if (session.mode !== "subscription") return null;
    if (session.payment_status !== "paid" && session.status !== "complete") return null;
    // Signed-in checkouts carry the Clerk id; members never get one.
    if (session.client_reference_id || session.metadata?.userId) return null;
    const email = (session.customer_details?.email ?? session.customer_email ?? "").trim();
    const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (!email || !subId) return null;

    const sub = await s.subscriptions.retrieve(subId, { expand: ["latest_invoice.payments"] });
    const kept = sub.metadata?.duplicateOf || (await existingMembership(s, email, sub, deps));
    if (!kept) return null;

    if (sub.status !== "canceled") {
      if (!sub.metadata?.duplicateOf) {
        await s.subscriptions.update(subId, { metadata: { duplicateOf: kept } }, { idempotencyKey: `dup-mark-${subId}` });
      }
      await s.subscriptions
        .cancel(subId, { prorate: false, invoice_now: false }, { idempotencyKey: `dup-cancel-${subId}` })
        .catch(async (error) => {
          // The other caller got there first.
          if ((await s.subscriptions.retrieve(subId)).status !== "canceled") throw error;
        });
    }

    const amountCents = await refundFirstPayment(s, sub);
    if (sub.livemode) await logOnce(email, kept, subId, amountCents, session);
    return { email, kept, amountCents };
  } catch (error) {
    console.error(`duplicate guard: left ${sessionId} alone`, error);
    return null;
  }
}

/** Another live, staying subscription for this address, or null. */
async function existingMembership(
  s: Stripe,
  email: string,
  sub: Stripe.Subscription,
  deps: { userIdsForEmail?: (email: string) => Promise<string[]> },
): Promise<string | null> {
  const others = new Set<string>();

  // On Stripe. The email filter is case-sensitive, so ask both ways.
  for (const address of new Set([email, email.toLowerCase()])) {
    const customers = await s.customers.list({ email: address, limit: 20 });
    for (const c of customers.data) {
      const subs = await s.subscriptions.list({ customer: c.id, status: "all", limit: 20 });
      for (const other of subs.data) {
        if (other.id !== sub.id && other.created <= sub.created && staying(other)) others.add(other.id);
      }
    }
  }

  // On the site: a membership held by an account with this email (it may be
  // on a Stripe customer with an older address), or one parked unclaimed.
  if (others.size === 0 && process.env.DATABASE_URL) {
    const db = neon(process.env.DATABASE_URL);
    const users = await (deps.userIdsForEmail ?? clerkUserIds)(email);
    const rows = (await db`
      SELECT stripe_subscription_id FROM memberships
       WHERE user_id = ANY(${users}) AND stripe_subscription_id IS NOT NULL
      UNION
      SELECT stripe_subscription_id FROM pending_memberships
       WHERE email = ${email.toLowerCase()} AND claimed_at IS NULL AND stripe_subscription_id IS NOT NULL
    `) as { stripe_subscription_id: string }[];
    for (const r of rows) {
      if (r.stripe_subscription_id === sub.id) continue;
      // Re-read from Stripe: the table's status can lag, and money is only
      // ever refunded on what Stripe says now.
      const other = await s.subscriptions.retrieve(r.stripe_subscription_id).catch(() => null);
      if (other && other.created <= sub.created && staying(other)) others.add(other.id);
    }
  }

  return [...others].sort()[0] ?? null;
}

async function clerkUserIds(email: string): Promise<string[]> {
  const { clerkClient } = await import("@clerk/nextjs/server");
  const list = await (await clerkClient()).users.getUserList({ emailAddress: [email], limit: 10 });
  return list.data.map((u) => u.id);
}

/** Refunds the subscription's first payment in full, once. Returns the amount. */
async function refundFirstPayment(s: Stripe, sub: Stripe.Subscription): Promise<number> {
  const invoice =
    typeof sub.latest_invoice === "string"
      ? await s.invoices.retrieve(sub.latest_invoice, { expand: ["payments"] })
      : sub.latest_invoice;
  if (!invoice || invoice.amount_paid === 0) return 0;
  const payment = invoice.payments?.data.find((p) => p.status === "paid")?.payment;
  const pi = payment?.payment_intent;
  const piId = typeof pi === "string" ? pi : pi?.id;
  if (!piId) throw new Error(`no payment intent on ${invoice.id}`);
  const done = await s.refunds.list({ payment_intent: piId, limit: 10 });
  const refunded = done.data.filter((r) => r.status !== "failed" && r.status !== "canceled");
  if (refunded.length === 0) {
    await s.refunds.create(
      { payment_intent: piId, reason: "duplicate", metadata: { auto: "duplicate-guard", subscription: sub.id } },
      { idempotencyKey: `dup-refund-${sub.id}` },
    );
  }
  return invoice.amount_paid;
}

/** One line on /admin per duplicate, however many times this runs. */
async function logOnce(
  email: string,
  kept: string,
  subId: string,
  amountCents: number,
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  const db = neon(process.env.DATABASE_URL);
  const who = session.customer_details?.name || email;
  const summary =
    `Paid again while signed out; already a member (${kept}). ` +
    `Automatically cancelled the new membership and refunded it in full (duplicate guard). No email sent.`;
  await db`
    INSERT INTO billing_actions (at, kind, who, summary, amount_cents, refs)
    SELECT now(), 'refund', ${who}, ${summary}, ${amountCents}, ${`${subId} (kept ${kept}) · auto`}
     WHERE NOT EXISTS (SELECT 1 FROM billing_actions WHERE refs LIKE ${`${subId} %`})
  `;
}
