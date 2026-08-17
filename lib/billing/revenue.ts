/**
 * What is actually being collected, asked of Stripe rather than inferred.
 *
 * THE BUG THIS REPLACES. /admin used to compute `mrr = paying * 8`: count the
 * membership rows, multiply by the list price of the LunaVerse tier. That is
 * wrong in three separate ways, and the first one is the one that matters:
 *
 *   1. A 100%-off comp code still counts as $8. Somebody given the site for
 *      free was being reported as revenue. The subscription is genuinely
 *      `active` — Stripe is charging them nothing — so the local memberships
 *      table, which stores tier and status and no amount at all, cannot tell
 *      the difference. Nothing short of asking Stripe can.
 *   2. Every member is priced at $8 regardless of tier. Patron is $20.
 *   3. `trialing` counts in full, before a card has ever been charged.
 *
 * The memberships table is the right thing to read for ACCESS — it is one
 * indexed lookup and it answers "may this person watch". It is the wrong thing
 * to read for MONEY, because money is not in it. So this module goes to
 * Stripe, which is the source of truth the admin page already claims it is.
 *
 * Failure is soft on purpose: a Stripe outage should show a dash on a
 * dashboard, not take the dashboard down. Same contract as the Clerk account
 * count next to it.
 */

import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/billing/stripe";
import { stripeConfigured } from "@/lib/billing/provider";

/** Statuses Stripe considers live. Mirrors ACTIVE_STATUSES in lib/db/memberships.ts. */
const LIVE_STATUSES: Stripe.SubscriptionListParams.Status[] = [
  "active",
  "trialing",
  "past_due",
];

export interface RevenueSummary {
  /** Net monthly recurring revenue in cents, after discounts. The real number. */
  mrrCents: number;
  /** What the same subscriptions would bill at list price. */
  grossCents: number;
  /** Live subscriptions, whatever they pay. */
  members: number;
  /** Contributing more than zero. */
  paying: number;
  /** Live, but discounted to nothing — the comps. */
  comped: number;
  /** Discounted, but still paying something. */
  discounted: number;
  /** In trial: no money yet, and excluded from MRR until there is. */
  trialing: number;
  /** Card failing, still inside Stripe's retry window. Counted — it is owed. */
  pastDue: number;
}

/**
 * Ask Stripe what the live subscriptions actually bill per month.
 *
 * Returns null when Stripe isn't configured or the call fails, which the admin
 * page renders as "—".
 */
export async function revenueSummary(): Promise<RevenueSummary | null> {
  if (!stripeConfigured()) return null;

  try {
    const subs: Stripe.Subscription[] = [];
    for (const status of LIVE_STATUSES) {
      // The coupon is the whole point of this module — without it a comped
      // member is indistinguishable from a paying one, which is the bug. It
      // sits four levels down (discounts → source → coupon) and arrives as a
      // bare id unless every level is named, so the path is spelled out in
      // full rather than stopping at `data.discounts`.
      const page = stripe().subscriptions.list({
        status,
        limit: 100,
        expand: ["data.discounts.source.coupon"],
      });
      for await (const sub of page) subs.push(sub);
    }

    const summary: RevenueSummary = {
      mrrCents: 0,
      grossCents: 0,
      members: subs.length,
      paying: 0,
      comped: 0,
      discounted: 0,
      trialing: 0,
      pastDue: 0,
    };

    for (const sub of subs) {
      const gross = grossMonthlyCents(sub);
      const net = applyDiscounts(gross, sub);

      summary.grossCents += gross;

      if (sub.status === "trialing") {
        // Nothing has been charged yet. Counting a trial as revenue is the
        // same class of mistake as counting a comp as revenue.
        summary.trialing += 1;
        continue;
      }
      if (sub.status === "past_due") summary.pastDue += 1;

      summary.mrrCents += net;

      if (net === 0) summary.comped += 1;
      else {
        summary.paying += 1;
        if (net < gross) summary.discounted += 1;
      }
    }

    return summary;
  } catch (error) {
    console.error("revenueSummary: Stripe lookup failed", error);
    return null;
  }
}

/**
 * List-price value of a subscription, normalised to one month.
 *
 * Normalising matters because MRR has to compare like with like: an annual
 * plan is not twelve times a monthly one for the month you are looking at.
 * Metered prices have no unit_amount and no fixed monthly value, so they
 * contribute nothing here rather than a guess.
 */
function grossMonthlyCents(sub: Stripe.Subscription): number {
  let cents = 0;
  for (const item of sub.items.data) {
    const price = item.price;
    const recurring = price.recurring;
    if (!recurring || price.unit_amount == null) continue;

    const perInterval = price.unit_amount * (item.quantity ?? 1);
    const count = recurring.interval_count || 1;

    switch (recurring.interval) {
      case "month":
        cents += perInterval / count;
        break;
      case "year":
        cents += perInterval / (12 * count);
        break;
      case "week":
        cents += (perInterval * 52) / (12 * count);
        break;
      case "day":
        cents += (perInterval * 365) / (12 * count);
        break;
    }
  }
  return Math.round(cents);
}

/**
 * Take the coupons off.
 *
 * `once` discounts are deliberately NOT applied. MRR is a run rate, and a
 * single-invoice credit does not change what this subscription bills every
 * month from here — it changes one invoice. Forever and repeating discounts
 * do change the run rate, so those come off. A repeating coupon that has
 * already run out is dropped by its `end` timestamp, though in practice Stripe
 * detaches it first.
 */
function applyDiscounts(grossCents: number, sub: Stripe.Subscription): number {
  // Older API versions carried a single `discount`; current ones carry an
  // array. Read both so a pinned-version bump can't silently zero this out.
  const raw = [
    ...(sub.discounts ?? []),
    ...((sub as unknown as { discount?: Stripe.Discount | null }).discount
      ? [(sub as unknown as { discount: Stripe.Discount }).discount]
      : []),
  ];

  // Unexpanded discounts arrive as bare ids, which carry no coupon and so
  // cannot be applied. Better to report gross than to invent a reduction.
  const discounts = raw.filter(
    (d): d is Stripe.Discount => typeof d !== "string" && d !== null,
  );

  const now = Date.now() / 1000;
  let cents = grossCents;

  for (const discount of discounts) {
    const coupon = couponFor(discount);
    if (!coupon) continue;
    if (coupon.duration === "once") continue;
    if (discount.end && discount.end < now) continue;

    if (coupon.percent_off != null) {
      cents -= (cents * coupon.percent_off) / 100;
    } else if (coupon.amount_off != null) {
      cents -= coupon.amount_off;
    }
  }

  // A discount larger than the price is a credit, not negative revenue.
  return Math.max(0, Math.round(cents));
}

/**
 * The coupon behind a discount, whichever shape the API version puts it in.
 *
 * Stripe moved it from `discount.coupon` to `discount.source.coupon`. Reading
 * both means a pinned-version bump in either direction cannot silently turn a
 * comped member back into $8 of imaginary revenue — the failure would be
 * invisible, because a missing coupon looks exactly like no discount.
 *
 * A coupon left as a bare id (expand path wrong or truncated) returns
 * undefined, so the subscription reports at gross rather than at a made-up
 * reduction. Over-reporting revenue is the bug being fixed; under-reporting a
 * discount is the safer direction to fail.
 */
function couponFor(discount: Stripe.Discount): Stripe.Coupon | undefined {
  const source = (
    discount as unknown as { source?: { coupon?: string | Stripe.Coupon | null } }
  ).source;
  const candidate =
    source?.coupon ??
    (discount as unknown as { coupon?: string | Stripe.Coupon | null }).coupon;

  return candidate && typeof candidate !== "string" ? candidate : undefined;
}

export interface AbandonedCheckout {
  email: string | null;
  /** Clerk user id, when the session carried one. May be a deleted account. */
  userId: string | null;
  tier: string | null;
  at: Date;
  /** Still payable, versus expired unpaid. */
  stillOpen: boolean;
}

/**
 * People who reached the payment page and did not pay.
 *
 * READ FROM STRIPE, DELIBERATELY, not from Clerk. Stripe keeps a Checkout
 * Session forever with the email and timestamp on it, whereas a Clerk account
 * can be deleted — so this survives cleaning up the user list, and it is the
 * only record that says somebody got as far as the card form. An account with
 * no membership tells you a person exists; this tells you they nearly bought.
 *
 * Sessions are grouped to one row per person: the route used to mint several
 * per visit (see openSessionFor), so counting raw sessions would report one
 * hesitant visitor as three.
 */
export async function abandonedCheckouts(
  limit = 100,
): Promise<AbandonedCheckout[]> {
  if (!stripeConfigured()) return [];

  try {
    const sessions = await stripe().checkout.sessions.list({ limit });

    // ANYONE WHO EVENTUALLY PAID IS NOT AN ABANDONMENT, and without this they
    // all are. Every buyer leaves unpaid sessions behind them — the hover that
    // opened one, the tab they came back to, the attempt before the card that
    // worked — so a naive "unpaid session" list reports your paying customers
    // as people who walked away. Carsten is the clean example: session at
    // 09:10:36 abandoned, session at 09:10:37 paid, one minute, one person.
    //
    // Matched on BOTH the Clerk id and the email, because the same person can
    // arrive under either: the id changes if an account is remade, the email
    // survives it.
    const paidIds = new Set<string>();
    const paidEmails = new Set<string>();
    for (const s of sessions.data) {
      if (s.payment_status !== "paid" && s.status !== "complete") continue;
      if (s.client_reference_id) paidIds.add(s.client_reference_id);
      const e = s.customer_email ?? s.customer_details?.email;
      if (e) paidEmails.add(e.toLowerCase());
    }

    const byPerson = new Map<string, AbandonedCheckout>();

    for (const s of sessions.data) {
      if (s.payment_status === "paid" || s.status === "complete") continue;

      const email = s.customer_email ?? s.customer_details?.email ?? null;

      // No email means no way to know who it was and nothing you could do
      // about it — a row that can only ever be noise on a dashboard.
      if (!email) continue;
      if (paidEmails.has(email.toLowerCase())) continue;
      if (s.client_reference_id && paidIds.has(s.client_reference_id)) continue;

      // Keyed on the EMAIL, not the Clerk id. The id changes if somebody signs
      // up again after giving up the first time — which is exactly the person
      // this list is about — and keying on it would show them twice.
      const key = email.toLowerCase();
      const at = new Date(s.created * 1000);
      const existing = byPerson.get(key);

      // Keep the most recent attempt as the row, but remember if ANY attempt
      // is still payable — that one can still turn into a sale.
      if (!existing || at > existing.at) {
        byPerson.set(key, {
          email,
          userId: s.client_reference_id ?? null,
          tier: s.metadata?.tier ?? null,
          at,
          stillOpen: s.status === "open" || (existing?.stillOpen ?? false),
        });
      } else if (s.status === "open") {
        existing.stillOpen = true;
      }
    }

    return [...byPerson.values()].sort((a, b) => b.at.getTime() - a.at.getTime());
  } catch (error) {
    console.error("abandonedCheckouts: Stripe lookup failed", error);
    return [];
  }
}

/** `$8`, or `$12.50` when the cents are not round. Whole dollars stay clean. */
export function formatCents(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars)
    ? `$${dollars}`
    : `$${dollars.toFixed(2)}`;
}
