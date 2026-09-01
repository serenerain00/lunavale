/**
 * Membership storage — the local projection of what Stripe knows.
 *
 * Stripe is the source of truth for billing. This table is written only by the
 * webhook (app/api/stripe/webhook/route.ts) and read on every entitlement
 * check, so that "may this person watch" is one indexed lookup rather than a
 * network call to Stripe on every page render.
 *
 * Everything here is guarded on DATABASE_URL. With no database configured the
 * functions return "no membership" instead of throwing, which is what lets the
 * site keep running in preview mode while billing is being wired up.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import { getTier, type TierId } from "@/lib/content/membership";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface MembershipRecord {
  userId: string;
  tier: TierId;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}

/**
 * Statuses that actually open the doors.
 *
 * `past_due` deliberately still grants access: a card that failed to renew is
 * usually an expired card, not a person who left, and locking someone out on
 * the first failed charge while Stripe is still retrying is a bad way to treat
 * a paying member. Stripe moves them to `canceled` or `unpaid` when it gives
 * up, and those don't grant.
 */
const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

/** What the entitlement layer asks for: the tier this user currently holds. */
export async function tierForUser(userId: string): Promise<TierId> {
  if (!databaseConfigured()) return "free";

  const rows = (await sql()`
    SELECT tier, status, current_period_end
    FROM memberships
    WHERE user_id = ${userId}
    LIMIT 1
  `) as Array<{
    tier: string;
    status: string;
    current_period_end: string | null;
  }>;

  const row = rows[0];
  if (!row) return "free";
  if (!ACTIVE_STATUSES.has(row.status)) {
    // Cancelled, but the period they paid for may not be over yet. The
    // membership page promises exactly this, so honor it here rather than in
    // the UI, where it would be easy to forget.
    const until = row.current_period_end
      ? new Date(row.current_period_end)
      : null;
    if (!until || until.getTime() < Date.now()) return "free";
  }

  // An unknown tier id (a tier renamed in content but still live in Stripe)
  // must not grant something arbitrary.
  return getTier(row.tier)?.id ?? "free";
}

export async function membershipForUser(
  userId: string,
): Promise<MembershipRecord | null> {
  if (!databaseConfigured()) return null;

  const rows = (await sql()`
    SELECT user_id, tier, status, stripe_customer_id,
           stripe_subscription_id, current_period_end
    FROM memberships
    WHERE user_id = ${userId}
    LIMIT 1
  `) as Array<Record<string, string | null>>;

  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.user_id!,
    tier: (getTier(row.tier!)?.id ?? "free") as TierId,
    status: row.status!,
    stripeCustomerId: row.stripe_customer_id!,
    stripeSubscriptionId: row.stripe_subscription_id,
    currentPeriodEnd: row.current_period_end
      ? new Date(row.current_period_end)
      : null,
  };
}

/** Upsert from a Stripe webhook. The only writer of this table. */
export async function recordMembership(input: {
  userId: string;
  tier: TierId;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  await sql()`
    INSERT INTO memberships (
      user_id, tier, status, stripe_customer_id,
      stripe_subscription_id, current_period_end, updated_at
    ) VALUES (
      ${input.userId}, ${input.tier}, ${input.status}, ${input.stripeCustomerId},
      ${input.stripeSubscriptionId}, ${input.currentPeriodEnd?.toISOString() ?? null}, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      tier                   = EXCLUDED.tier,
      status                 = EXCLUDED.status,
      stripe_customer_id     = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      current_period_end     = EXCLUDED.current_period_end,
      updated_at             = now()
  `;
}

/**
 * Park a membership that has been paid for but has no account behind it yet.
 *
 * Written by the webhook when a Checkout Session carries no Clerk user id,
 * which since 2026-08-27 is the ordinary path for a new buyer: checkout runs
 * before the account exists. See the table comment in lib/db/schema.sql.
 *
 * GRANTS NOTHING ON ITS OWN. Entitlement is resolved from `memberships` by
 * Clerk user id and nothing else; this row only becomes access through
 * claimPendingFor().
 */
export async function recordPendingMembership(input: {
  email: string;
  tier: TierId;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
}): Promise<void> {
  await sql()`
    INSERT INTO pending_memberships (
      email, tier, status, stripe_customer_id,
      stripe_subscription_id, current_period_end, updated_at
    ) VALUES (
      ${input.email.toLowerCase()}, ${input.tier}, ${input.status},
      ${input.stripeCustomerId}, ${input.stripeSubscriptionId},
      ${input.currentPeriodEnd?.toISOString() ?? null}, now()
    )
    ON CONFLICT (email) DO UPDATE SET
      tier                   = EXCLUDED.tier,
      status                 = EXCLUDED.status,
      stripe_customer_id     = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      current_period_end     = EXCLUDED.current_period_end,
      updated_at             = now()
  `;
}

/**
 * Turn a parked membership into a real one, for a signed-in person.
 *
 * THE CALLER MUST PASS A VERIFIED EMAIL. This is the whole security boundary
 * of the pay-first flow: anybody who can prove they control the address that
 * paid gets the membership, and Clerk's verified primary email is that proof.
 * Passing an unverified address here would let somebody claim a stranger's
 * subscription by typing their email into a sign-up form.
 *
 * Idempotent. A claimed row is never claimed twice — the WHERE clause requires
 * claimed_at IS NULL — so calling this on every /account render costs one
 * indexed read and does nothing.
 *
 * Returns true only when a claim actually happened, so the caller can tell the
 * difference between "you already had this" and "your membership just arrived".
 */
export async function claimPendingFor(
  userId: string,
  verifiedEmail: string,
): Promise<boolean> {
  if (!databaseConfigured() || !verifiedEmail) return false;

  const rows = (await sql()`
    SELECT tier, status, stripe_customer_id, stripe_subscription_id,
           current_period_end
    FROM pending_memberships
    WHERE email = ${verifiedEmail.toLowerCase()} AND claimed_at IS NULL
    LIMIT 1
  `) as {
    tier: string;
    status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string | null;
    current_period_end: string | null;
  }[];

  const row = rows[0];
  if (!row) return false;

  await recordMembership({
    userId,
    tier: row.tier as TierId,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    currentPeriodEnd: row.current_period_end
      ? new Date(row.current_period_end)
      : null,
  });

  // Marked AFTER the membership is written, never before. If the order were
  // reversed and the write failed, the row would look spent and the person
  // would have paid for nothing with no way back.
  await sql()`
    UPDATE pending_memberships
    SET claimed_at = now(), claimed_by = ${userId}, updated_at = now()
    WHERE email = ${verifiedEmail.toLowerCase()} AND claimed_at IS NULL
  `;

  return true;
}

/** Paid-for memberships still waiting for somebody to make an account. */
export async function unclaimedPending(): Promise<
  { email: string; tier: string; createdAt: Date }[]
> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT email, tier, created_at
    FROM pending_memberships
    WHERE claimed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 50
  `) as { email: string; tier: string; created_at: string }[];
  return rows.map((r) => ({
    email: r.email,
    tier: r.tier,
    createdAt: new Date(r.created_at),
  }));
}

/**
 * Whether this Stripe event has already been fully processed.
 *
 * A read, not a claim, and that distinction is load-bearing: the webhook
 * checks this BEFORE doing the work and only records the id AFTER the work
 * succeeds (markEventHandled). If it claimed the id up front and then the work
 * failed, Stripe's retry would see the claim, treat the event as a duplicate,
 * and the update would be lost forever.
 */
export async function eventHandled(eventId: string): Promise<boolean> {
  const rows = (await sql()`
    SELECT 1 FROM billing_events WHERE event_id = ${eventId} LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

/**
 * Record an event as processed. Called only after its effect is applied.
 *
 * Concurrency safety does not come from here — two simultaneous deliveries can
 * both pass eventHandled() and both apply. That's fine because the apply is an
 * idempotent upsert of the subscription's current state, so they write the
 * same thing. The ON CONFLICT keeps the second insert from erroring.
 */
export async function markEventHandled(
  eventId: string,
  type: string,
): Promise<void> {
  await sql()`
    INSERT INTO billing_events (event_id, type)
    VALUES (${eventId}, ${type})
    ON CONFLICT (event_id) DO NOTHING
  `;
}

/** Membership counts by tier and status, for the admin dashboard. */
export async function membershipSummary(): Promise<
  { tier: string; status: string; n: number }[]
> {
  if (!databaseConfigured()) return [];
  return (await sql()`
    SELECT tier, status, count(*)::int AS n
    FROM memberships
    GROUP BY tier, status
    ORDER BY n DESC
  `) as { tier: string; status: string; n: number }[];
}
