import "server-only";

/**
 * The business at a glance — one function, read by the voice assistant and by
 * the report panel on /admin/voice, so a number said out loud and the same
 * number on screen can never disagree.
 *
 * REUSES RATHER THAN RECOMPUTES. Checkout and attribution come from
 * checkoutFunnel() (lib/billing/checkout-funnel.ts, the /admin/conversion
 * dashboard's own source) and new-member counts from membershipsCreatedSince().
 * The only thing computed here is what nothing else had: subscriptions as of
 * right now, and money actually collected in the window.
 *
 * NO CLARITY CALLS. The Clarity export API allows 10 requests a day and the
 * measurement side already uses 8 (docs/analytics/ATTRIBUTION.md). Traffic,
 * when it is wanted here, comes from the stored copy in traffic_daily.
 *
 * Counts only. No email address or name leaves this module — the assistant
 * talks about members as numbers, by design.
 */

import { stripe } from "@/lib/billing/stripe";
import { stripeConfigured } from "@/lib/billing/provider";
import { checkoutFunnel } from "@/lib/billing/checkout-funnel";
import { membershipsCreatedSince, trafficSince } from "@/lib/db/funnel";

export type Range = "today" | "week" | "month";

export interface Snapshot {
  range: Range;
  since: string;
  members: { renewing: number; cancelling: number; pastDue: number };
  /** Monthly recurring revenue from renewing subscriptions, in cents. */
  mrrCents: number;
  /** Money actually collected in the window (paid invoices), in cents. */
  collectedCents: number;
  newMembers: number | null;
  checkout: {
    began: number;
    paid: number;
    instagramPaid: number;
    unattributed: number;
    topCampaigns: { campaign: string; paid: number; began: number }[];
  } | null;
  visitors: { total: number; instagram: number; days: number } | null;
  /** One or two sentences, written to be said out loud. */
  speak: string;
}

export function sinceFor(range: Range, now = new Date()): Date {
  const d = new Date(now);
  if (range === "today") {
    d.setUTCHours(0, 0, 0, 0);
  } else {
    d.setUTCDate(d.getUTCDate() - (range === "week" ? 7 : 30));
  }
  return d;
}

export async function businessSnapshot(range: Range): Promise<Snapshot> {
  const since = sinceFor(range);
  const sinceDay = since.toISOString().slice(0, 10);

  const [subs, collectedCents, funnel, newMembers, traffic] = await Promise.all([
    subscriptionsNow(),
    collectedSince(since),
    checkoutFunnel(since),
    membershipsCreatedSince(sinceDay),
    trafficSince(sinceDay).catch(() => []),
  ]);

  const checkout = funnel
    ? {
        began: funnel.peopleWithEmail,
        paid: funnel.paid,
        instagramPaid: funnel.instagram.paid,
        unattributed: funnel.unattributed,
        topCampaigns: [...funnel.campaigns]
          .sort((a, b) => b.paid - a.paid || b.began - a.began)
          .slice(0, 5)
          .map(({ campaign, paid, began }) => ({ campaign, paid, began })),
      }
    : null;

  // Clarity sessions, as the dashboard counts them (data.sessions per day).
  const visitors = traffic.length
    ? {
        total: traffic.reduce((n, d) => n + d.data.sessions, 0),
        instagram: traffic.reduce((n, d) => n + d.data.instagram.sessions, 0),
        days: traffic.length,
      }
    : null;

  const snap: Omit<Snapshot, "speak"> = {
    range,
    since: sinceDay,
    members: subs.members,
    mrrCents: subs.mrrCents,
    collectedCents,
    newMembers,
    checkout,
    visitors,
  };
  return { ...snap, speak: spoken(snap) };
}

async function subscriptionsNow() {
  const members = { renewing: 0, cancelling: 0, pastDue: 0 };
  let mrrCents = 0;
  if (!stripeConfigured()) return { members, mrrCents };
  for await (const s of stripe().subscriptions.list({ status: "all", limit: 100 })) {
    if (s.status === "past_due") {
      members.pastDue++;
      continue;
    }
    if (s.status !== "active" && s.status !== "trialing") continue;
    if (s.cancel_at_period_end || s.cancel_at) {
      members.cancelling++;
      continue;
    }
    members.renewing++;
    for (const item of s.items.data) {
      const unit = item.price.unit_amount ?? 0;
      const monthly =
        item.price.recurring?.interval === "year" ? unit / 12 : unit;
      mrrCents += monthly * (item.quantity ?? 1);
    }
  }
  return { members, mrrCents: Math.round(mrrCents) };
}

async function collectedSince(since: Date): Promise<number> {
  if (!stripeConfigured()) return 0;
  let cents = 0;
  for await (const inv of stripe().invoices.list({
    status: "paid",
    created: { gte: Math.floor(since.getTime() / 1000) },
    limit: 100,
  })) {
    cents += inv.amount_paid;
  }
  return cents;
}

function dollars(cents: number): string {
  const d = cents / 100;
  return Number.isInteger(d) ? `$${d}` : `$${d.toFixed(2)}`;
}

function spoken(s: Omit<Snapshot, "speak">): string {
  const window = { today: "today", week: "in the last seven days", month: "in the last thirty days" }[s.range];
  const parts: string[] = [];
  parts.push(`You collected ${dollars(s.collectedCents)} ${window}.`);
  const m = s.members;
  parts.push(
    `${m.renewing} ${m.renewing === 1 ? "member is" : "members are"} set to renew, worth ${dollars(s.mrrCents)} a month` +
      (m.cancelling ? `, and ${m.cancelling} have cancelled but still have access` : "") +
      (m.pastDue ? `; ${m.pastDue} card${m.pastDue === 1 ? " is" : "s are"} failing` : "") +
      ".",
  );
  if (s.checkout) {
    const c = s.checkout;
    parts.push(
      `${c.began} ${c.began === 1 ? "person" : "people"} started checkout and ${c.paid} paid` +
        (c.instagramPaid ? `, ${c.instagramPaid} of them from Instagram` : "") +
        ".",
    );
  }
  if (s.visitors) {
    parts.push(
      `${s.visitors.total} visits, ${s.visitors.instagram} from Instagram.`,
    );
  }
  return parts.join(" ");
}
