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
  /**
   * Stripe will stop at `currentPeriodEnd` rather than renew.
   *
   * READ THIS FOR WORDING, NEVER FOR ACCESS. `status` stays "active" for the
   * whole remaining period after somebody cancels, which is correct — they
   * paid for it. tierForUser() below is the access gate and deliberately does
   * not look at this field.
   */
  cancelAtPeriodEnd: boolean;
}

/**
 * Statuses that actually open the doors.
 *
 * `past_due` DOES NOT, as of 2026-10-12. It used to, on the theory that a
 * failed renewal is usually an expired card and locking a paying member out
 * mid-retry is unkind. Melissa's call: a card that has failed is out until
 * every invoice is paid, and the account page tells them so and gives them
 * the payment link (see lockedForPayment()). `unpaid` is the same thing after
 * Stripe stops retrying.
 *
 * Stripe's own revenue-recovery setting decides whether a subscription is
 * eventually cancelled. Either way the door is shut from the first failure.
 */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);
const PAYMENT_FAILED_STATUSES = new Set(["past_due", "unpaid"]);

/**
 * Promises already made in writing, by subscription id → the moment the
 * promise runs out. A member here keeps access while past due until then.
 *
 * Lorna was emailed on 2026-10-12, before the rule above existed, that she
 * keeps full access while she fixes her card and has until Tuesday Oct 20.
 * That promise is kept. Add nobody here without Melissa saying so.
 */
const PAST_DUE_GRACE: Record<string, string> = {
  sub_1UBaX6GjKS2wfUha1JJKkw75: "2026-10-21T04:00:00Z", // end of Oct 20, Eastern
};

function inGrace(subscriptionId: string | null | undefined): boolean {
  const until = subscriptionId ? PAST_DUE_GRACE[subscriptionId] : undefined;
  return Boolean(until && Date.now() < new Date(until).getTime());
}

/**
 * Whether this membership is shut because a payment failed — what the account
 * page reads to say "pay to get back in" instead of "you're on the free side".
 */
export function lockedForPayment(
  record: Pick<MembershipRecord, "status" | "stripeSubscriptionId"> | null,
): boolean {
  return Boolean(
    record &&
      PAYMENT_FAILED_STATUSES.has(record.status) &&
      !inGrace(record.stripeSubscriptionId),
  );
}

/** What the entitlement layer asks for: the tier this user currently holds. */
export async function tierForUser(userId: string): Promise<TierId> {
  if (!databaseConfigured()) return "free";

  const rows = (await sql()`
    SELECT tier, status, current_period_end, stripe_subscription_id
    FROM memberships
    WHERE user_id = ${userId}
    LIMIT 1
  `) as Array<{
    tier: string;
    status: string;
    current_period_end: string | null;
    stripe_subscription_id: string | null;
  }>;

  const row = rows[0];
  if (!row) return "free";
  if (PAYMENT_FAILED_STATUSES.has(row.status)) {
    // Not the period-end fallback below: a failed renewal has already moved
    // the period end a month forward, and that month was never paid for.
    if (!inGrace(row.stripe_subscription_id)) return "free";
  } else if (!ACTIVE_STATUSES.has(row.status)) {
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
           stripe_subscription_id, current_period_end, cancel_at_period_end
    FROM memberships
    WHERE user_id = ${userId}
    LIMIT 1
  `) as Array<Record<string, string | boolean | null>>;

  const row = rows[0];
  if (!row) return null;
  return {
    userId: row.user_id as string,
    tier: (getTier(row.tier as string)?.id ?? "free") as TierId,
    status: row.status as string,
    stripeCustomerId: row.stripe_customer_id as string,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    currentPeriodEnd: row.current_period_end
      ? new Date(row.current_period_end as string)
      : null,
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
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
  /** Defaults false so an older caller cannot silently clear a real flag. */
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  await sql()`
    INSERT INTO memberships (
      user_id, tier, status, stripe_customer_id,
      stripe_subscription_id, current_period_end, cancel_at_period_end, updated_at
    ) VALUES (
      ${input.userId}, ${input.tier}, ${input.status}, ${input.stripeCustomerId},
      ${input.stripeSubscriptionId}, ${input.currentPeriodEnd?.toISOString() ?? null},
      ${input.cancelAtPeriodEnd ?? false}, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      tier                   = EXCLUDED.tier,
      status                 = EXCLUDED.status,
      stripe_customer_id     = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      current_period_end     = EXCLUDED.current_period_end,
      cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
      updated_at             = now()
    -- ONE ROW PER PERSON, SO A SECOND SUBSCRIPTION MUST NOT CLOBBER A LIVE
    -- FIRST ONE (2026-10-20). Andrea paid twice; the row swapped between her
    -- two subscriptions with each write, and refunding + cancelling the
    -- duplicate would have filed "canceled" over the one she was keeping,
    -- locking her out. A different subscription only replaces this row when
    -- the one held here is no longer live. Same subscription: always. The
    -- one left out shows up in the health check as an orphan.
    WHERE memberships.stripe_subscription_id IS NOT DISTINCT FROM EXCLUDED.stripe_subscription_id
       OR memberships.status NOT IN ('active', 'trialing', 'past_due')
  `;

  // LINKED LOGINS (2026-10-20). One person, two accounts — Andrea has one per
  // email — can share one subscription: a second row with the same
  // stripe_subscription_id. The webhook only knows one user id per event, so
  // whatever it learns is copied to every other row on that subscription, or
  // the second login would keep the access it had on the day it was linked.
  if (input.stripeSubscriptionId) {
    await sql()`
      UPDATE memberships SET
        tier                 = ${input.tier},
        status               = ${input.status},
        current_period_end   = ${input.currentPeriodEnd?.toISOString() ?? null},
        cancel_at_period_end = ${input.cancelAtPeriodEnd ?? false},
        updated_at           = now()
      WHERE stripe_subscription_id = ${input.stripeSubscriptionId}
        AND user_id <> ${input.userId}
    `;
  }
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
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  // ONE ROW PER EMAIL, so a second payment on the same address used to
  // overwrite the first — which is how Tina's first subscription (2026-10-21)
  // ended up belonging to nobody, and how cancelling that duplicate would then
  // have written a canceled sub over her real one. Same guard as
  // recordMembership(): another subscription may only replace this one once
  // it is no longer live. A payment refused here is an orphan, and the health
  // check and /admin both list orphans, so it is loud rather than lost.
  const written = (await sql()`
    INSERT INTO pending_memberships (
      email, tier, status, stripe_customer_id,
      stripe_subscription_id, current_period_end, cancel_at_period_end, updated_at
    ) VALUES (
      ${input.email.toLowerCase()}, ${input.tier}, ${input.status},
      ${input.stripeCustomerId}, ${input.stripeSubscriptionId},
      ${input.currentPeriodEnd?.toISOString() ?? null},
      ${input.cancelAtPeriodEnd ?? false}, now()
    )
    ON CONFLICT (email) DO UPDATE SET
      tier                   = EXCLUDED.tier,
      status                 = EXCLUDED.status,
      stripe_customer_id     = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      current_period_end     = EXCLUDED.current_period_end,
      cancel_at_period_end   = EXCLUDED.cancel_at_period_end,
      updated_at             = now()
    WHERE pending_memberships.stripe_subscription_id IS NOT DISTINCT FROM EXCLUDED.stripe_subscription_id
       OR pending_memberships.status NOT IN ('active', 'trialing', 'past_due')
    RETURNING email
  `) as unknown[];
  if (written.length === 0) {
    console.error(
      `pending membership for ${input.email} already holds a live subscription; ` +
        `${input.stripeSubscriptionId} (${input.status}) not recorded — likely a double payment`,
    );
  }
}

/**
 * Is any paid-for membership still waiting for its account? Lets the access
 * check skip the Clerk lookup on every page for the (usual) answer: no.
 */
export async function anyUnclaimed(): Promise<boolean> {
  if (!databaseConfigured()) return false;
  const rows = (await sql()`
    SELECT 1 FROM pending_memberships
    WHERE claimed_at IS NULL AND status IN ('active', 'trialing')
    LIMIT 1
  `) as unknown[];
  return rows.length > 0;
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
           current_period_end, cancel_at_period_end
    FROM pending_memberships
    WHERE email = ${verifiedEmail.toLowerCase()} AND claimed_at IS NULL
    LIMIT 1
  `) as {
    tier: string;
    status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
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
    // Carried across, so a membership claimed days after purchase does not
    // forget it was already cancelled on the way in.
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
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

/**
 * Claim a parked membership by its Stripe subscription, for a signed-in person
 * who has just come through checkout.
 *
 * ADDED 2026-09-25 because matching on email alone failed a real customer:
 * she paid with a Hotmail address, made her account with Google on a Gmail
 * one three minutes later, and claimPendingFor() — which only ever sees the
 * account's own addresses — had nothing to match. /welcome already asked her
 * to use the paying address; asking is not enough once a "Continue with
 * Google" button is on the same screen.
 *
 * THE PROOF HERE IS THE CHECKOUT SESSION, NOT THE EMAIL. The caller must have
 * read `subscriptionId` off a Checkout Session it retrieved from Stripe and
 * confirmed as paid, using a session id that arrived on the success URL.
 * That id is only ever handed to the browser that completed the payment, so
 * holding it is proof of having paid in the same way a verified address is.
 * NEVER pass a subscription id that came from anywhere a user can type.
 *
 * Same idempotency and ordering rules as claimPendingFor().
 */
export async function claimPendingBySubscription(
  userId: string,
  subscriptionId: string,
): Promise<boolean> {
  if (!databaseConfigured() || !subscriptionId) return false;

  const rows = (await sql()`
    SELECT tier, status, stripe_customer_id, stripe_subscription_id,
           current_period_end, cancel_at_period_end
    FROM pending_memberships
    WHERE stripe_subscription_id = ${subscriptionId} AND claimed_at IS NULL
    LIMIT 1
  `) as {
    tier: string;
    status: string;
    stripe_customer_id: string;
    stripe_subscription_id: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
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
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
  });

  await sql()`
    UPDATE pending_memberships
    SET claimed_at = now(), claimed_by = ${userId}, updated_at = now()
    WHERE stripe_subscription_id = ${subscriptionId} AND claimed_at IS NULL
  `;

  return true;
}

/**
 * Which account already holds this subscription, if any.
 *
 * ADDED 2026-09-25 for the webhook. A membership bought before the account
 * existed carries no Clerk id in its Stripe metadata — nothing ever writes one
 * back after the claim — so every later event for it (renewal, cancellation,
 * failed card) arrived looking like a brand-new buyer and was filed against
 * the already-claimed pending row. The real membership never heard about it.
 * On the day this was found, 16 of 21 members had been bought that way and
 * two cancellations had gone missing. Looking the subscription up here first
 * sends those events to the membership that owns it.
 */
export async function userIdForSubscription(
  subscriptionId: string,
): Promise<string | undefined> {
  if (!databaseConfigured() || !subscriptionId) return undefined;
  const rows = (await sql()`
    SELECT user_id FROM memberships
    WHERE stripe_subscription_id = ${subscriptionId}
    LIMIT 1
  `) as { user_id: string }[];
  return rows[0]?.user_id;
}

/** Paid-for memberships still waiting for somebody to make an account. */
export async function unclaimedPending(): Promise<
  { email: string; tier: string; createdAt: Date }[]
> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT email, tier, created_at
    FROM pending_memberships
    -- Not the cancelled ones: a refunded duplicate (2026-10-05, 10-13) is
    -- unclaimed forever and owes nobody an account. Same filter as health-check.
    WHERE claimed_at IS NULL AND status <> 'canceled'
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

/**
 * Who can actually open the doors right now, for the admin dashboard.
 *
 * Not a sum of status counts: since 2026-10-12 a past-due member is shut out
 * unless their subscription is in PAST_DUE_GRACE, and /admin used to count
 * every past_due row as "with access". Same rule as tierForUser, by
 * construction — it asks inGrace() rather than re-deriving it.
 */
export async function accessCounts(): Promise<{
  withAccess: number;
  /** Past due and shut out until they pay. */
  locked: number;
  /** Past due but still in, on a promise in PAST_DUE_GRACE, with its end. */
  grace: { until: Date }[];
}> {
  if (!databaseConfigured()) return { withAccess: 0, locked: 0, grace: [] };
  const rows = (await sql()`
    SELECT status, stripe_subscription_id FROM memberships
  `) as { status: string; stripe_subscription_id: string | null }[];
  let withAccess = 0;
  let locked = 0;
  const grace: { until: Date }[] = [];
  for (const r of rows) {
    if (ACTIVE_STATUSES.has(r.status)) withAccess += 1;
    else if (PAYMENT_FAILED_STATUSES.has(r.status)) {
      if (inGrace(r.stripe_subscription_id)) {
        withAccess += 1;
        grace.push({ until: new Date(PAST_DUE_GRACE[r.stripe_subscription_id!]) });
      } else locked += 1;
    }
  }
  return { withAccess, locked, grace };
}

/** The billing log, newest first. See billing_actions in lib/db/schema.sql. */
export async function recentBillingActions(limit = 15): Promise<
  { at: Date; kind: string; who: string; summary: string; amountCents: number | null; refs: string | null }[]
> {
  if (!databaseConfigured()) return [];
  try {
    const rows = (await sql()`
      SELECT at, kind, who, summary, amount_cents, refs FROM billing_actions
      ORDER BY at DESC LIMIT ${limit}
    `) as { at: string; kind: string; who: string; summary: string; amount_cents: number | null; refs: string | null }[];
    return rows.map((r) => ({
      at: new Date(r.at), kind: r.kind, who: r.who, summary: r.summary,
      amountCents: r.amount_cents, refs: r.refs,
    }));
  } catch (error) {
    // Older database without the table: an empty log, not a broken page.
    console.error("recentBillingActions failed", error);
    return [];
  }
}

/**
 * Who holds each subscription on the site, for spotting one person paying
 * twice across two emails (2026-10-20). A subscription can have more than one
 * holder now — linked logins share one. `waiting` is paid and parked, not yet
 * anybody's, which is fine; anything live that is in neither is an orphan.
 */
export async function subscriptionHolders(): Promise<{
  holders: Map<string, Set<string>>;
  waiting: Set<string>;
}> {
  const holders = new Map<string, Set<string>>();
  const waiting = new Set<string>();
  if (!databaseConfigured()) return { holders, waiting };
  const rows = (await sql()`
    SELECT stripe_subscription_id AS sub, user_id FROM memberships WHERE stripe_subscription_id IS NOT NULL
    UNION ALL
    SELECT stripe_subscription_id, claimed_by FROM pending_memberships
    WHERE stripe_subscription_id IS NOT NULL AND claimed_by IS NOT NULL
  `) as { sub: string; user_id: string }[];
  for (const r of rows) holders.set(r.sub, (holders.get(r.sub) ?? new Set()).add(r.user_id));
  for (const r of (await sql()`
    SELECT stripe_subscription_id AS sub FROM pending_memberships
    WHERE claimed_at IS NULL AND stripe_subscription_id IS NOT NULL
  `) as { sub: string }[]) waiting.add(r.sub);
  return { holders, waiting };
}
