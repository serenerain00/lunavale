/**
 * The bottom of the conversion funnel, read from Stripe for a date range:
 * how many checkouts were opened, by how many people, and how many were paid.
 *
 * WHY THREE NUMBERS AND NOT ONE. A Checkout Session is created the moment
 * somebody taps Join, before they type anything — so "sessions opened" counts
 * taps, including any speculative fetch that slipped past the guard in
 * app/membership/start/route.ts. A session only learns an email once the
 * person types it into Stripe's form, so "distinct emails" is the count of
 * people who demonstrably got as far as the card form. The truth about
 * intent sits between the two, and showing both is more honest than picking.
 *
 * Paid is counted per PERSON (email, else customer), not per session: a buyer
 * often leaves an unpaid session behind them, and the paid one is the one
 * that counts — see abandonedCheckouts() in ./revenue.ts for the same rule.
 *
 * ATTRIBUTION. Sessions created since the attribution cookies shipped carry
 * ft_* / lt_* metadata (lib/analytics/attribution.ts). A session counts as
 * Instagram if EITHER touch was Instagram — "Instagram was involved", the
 * honest reading when one person can see a Reel, google the show a day later
 * and pay. Campaign is the last touch's, falling back to the first's.
 * Sessions from before the cookies, or with cookies blocked, are counted in
 * `unattributed` and never guessed at.
 *
 * Soft failure, as elsewhere on /admin: null means Stripe could not be read.
 */
import "server-only";
import { stripe } from "@/lib/billing/stripe";
import { stripeConfigured } from "@/lib/billing/provider";

export interface FunnelCounts {
  /** Distinct emails — reached the card form. */
  began: number;
  /** Distinct people with a completed, paid session. */
  paid: number;
}

export interface CheckoutFunnel {
  sessionsOpened: number;
  /** Distinct emails across every session in the window — reached the form. */
  peopleWithEmail: number;
  /** Distinct people with a completed, paid session. */
  paid: number;
  /** True if the window held more sessions than were read (cap below). */
  truncated: boolean;
  instagram: FunnelCounts;
  /** Sessions carrying no attribution at all (pre-cookie, or blocked). */
  unattributed: number;
  /** Per campaign label ("" = Instagram/other source but untagged link), by source. */
  campaigns: { source: string; campaign: string; began: number; paid: number }[];
  /** experiment → variant → people who began checkout / paid (metadata ab_<id>). */
  experiments: Record<string, Record<string, FunnelCounts>>;
  /** Where the tap came from (metadata `entry`; "" = /membership or an older link). From 2026-10-13. */
  byEntry: Record<string, FunnelCounts>;
}

const MAX_SESSIONS = 1000;

export async function checkoutFunnel(since: Date): Promise<CheckoutFunnel | null> {
  if (!stripeConfigured()) return null;
  try {
    const emails = new Set<string>();
    const paid = new Set<string>();
    const igBegan = new Set<string>();
    const igPaid = new Set<string>();
    const byCampaign = new Map<string, { source: string; campaign: string; began: Set<string>; paid: Set<string> }>();
    const ab = new Map<string, { began: Set<string>; paid: Set<string> }>();
    const entries = new Map<string, { began: Set<string>; paid: Set<string> }>();
    let opened = 0;
    let unattributed = 0;
    let truncated = false;

    for await (const s of stripe().checkout.sessions.list({
      created: { gte: Math.floor(since.getTime() / 1000) },
      limit: 100,
    })) {
      if (opened >= MAX_SESSIONS) {
        truncated = true;
        break;
      }
      opened += 1;
      const m = s.metadata ?? {};
      const email = (s.customer_email ?? s.customer_details?.email ?? "").toLowerCase();
      const isPaid = s.status === "complete" || s.payment_status === "paid";
      const customer = typeof s.customer === "string" ? s.customer : s.customer?.id;
      const who = email || customer || s.id;

      if (email) emails.add(email);
      if (isPaid) paid.add(who);

      for (const [k, variant] of Object.entries(m)) {
        if (!k.startsWith("ab_")) continue;
        const key = `${k.slice(3)}|${variant}`;
        const row = ab.get(key) ?? { began: new Set<string>(), paid: new Set<string>() };
        if (email) row.began.add(email);
        if (isPaid) row.paid.add(who);
        ab.set(key, row);
      }

      const entry = entries.get(m.entry ?? "") ?? { began: new Set<string>(), paid: new Set<string>() };
      if (email) entry.began.add(email);
      if (isPaid) entry.paid.add(who);
      entries.set(m.entry ?? "", entry);

      const source = m.lt_source || m.ft_source || "";
      if (!source) {
        unattributed += 1;
        continue;
      }
      const ig = m.lt_source === "instagram" || m.ft_source === "instagram";
      if (ig && email) igBegan.add(email);
      if (ig && isPaid) igPaid.add(who);

      const campaign = m.lt_campaign || m.ft_campaign || "";
      const key = `${source}|${campaign}`;
      const row = byCampaign.get(key) ?? { source, campaign, began: new Set(), paid: new Set() };
      if (email) row.began.add(email);
      if (isPaid) row.paid.add(who);
      byCampaign.set(key, row);
    }

    return {
      sessionsOpened: opened,
      peopleWithEmail: emails.size,
      paid: paid.size,
      truncated,
      instagram: { began: igBegan.size, paid: igPaid.size },
      unattributed,
      campaigns: [...byCampaign.values()]
        .map((r) => ({ source: r.source, campaign: r.campaign, began: r.began.size, paid: r.paid.size }))
        .sort((a, b) => b.paid - a.paid || b.began - a.began),
      experiments: [...ab].reduce<Record<string, Record<string, FunnelCounts>>>((out, [key, r]) => {
        const [id, variant] = key.split("|");
        (out[id] ??= {})[variant] = { began: r.began.size, paid: r.paid.size };
        return out;
      }, {}),
      byEntry: Object.fromEntries(
        [...entries].map(([k, r]) => [k, { began: r.began.size, paid: r.paid.size }]),
      ),
    };
  } catch (error) {
    console.error("checkoutFunnel: Stripe lookup failed", error);
    return null;
  }
}
