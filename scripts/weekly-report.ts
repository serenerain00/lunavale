/**
 * weekly-report.ts — the data pack behind the weekly Between Us report.
 *
 * Assembles one week (and the week before it, for comparison) from every
 * first-party source, and writes it as markdown tables to
 * ~/lunavale-analytics/reports/week-<end>.md. Claude then writes the
 * narrative on top — what worked, what didn't, three experiments — keeping
 * observations and hypotheses apart, as the brief requires.
 *
 * SOURCES, and what each can and cannot say:
 *   traffic_daily   Clarity, copied nightly: visitors, Instagram visitors,
 *                   per-campaign Instagram sessions (from 2026-10-12).
 *   play_starts     non-member plays, Instagram vs other.
 *   Stripe (live)   checkouts opened / with email / paid, by campaign from
 *                   the attribution metadata (from 2026-10-11); new and
 *                   cancelled subscriptions.
 *   Instagram       reach, plays, saves, shares, follows per post — ONLY once
 *                   imported (~/lunavale-analytics/instagram/posts.json, see
 *                   scripts/ig-import.ts). Without it, the report says "not
 *                   connected" rather than estimating.
 *
 * NEVER INVENTS. A missing source is listed under "Data completeness" and its
 * cells read "—". Every rate is printed with the counts behind it, and any
 * group smaller than MIN_N is marked as too small to compare.
 *
 *   npx tsx --env-file=.env.local scripts/weekly-report.ts [--end=YYYY-MM-DD]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";
import type { TrafficDay } from "@/lib/analytics/clarity";
import { POST_LABELS, durationBand, type PostLabels } from "@/lib/marketing/post-labels";

/** One post as scripts/ig-import.ts writes it. Metrics are null when the export did not carry them. */
interface IgPost {
  shortcode: string;
  permalink: string;
  published: string;
  durationSeconds: number | null;
  campaign: string | null;
  reach: number | null;
  plays: number | null;
  saves: number | null;
  shares: number | null;
  follows: number | null;
}

const MIN_N = 5;
/** First days each first-party source existed (see docs/analytics/ATTRIBUTION.md). */
const PLAYS_FROM = "2026-10-11";
const ATTRIBUTION_FROM = "2026-10-11";
const DIR = path.join(os.homedir(), "lunavale-analytics");
const day = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => day(new Date(Date.parse(`${iso}T00:00:00Z`) + n * 864e5));

const endArg = process.argv.find((a) => a.startsWith("--end="))?.slice(6);
const end = endArg ?? addDays(day(new Date()), -1);
const start = addDays(end, -6);
const prevEnd = addDays(start, -1);
const prevStart = addDays(prevEnd, -6);

interface Week {
  label: string;
  start: string;
  end: string;
  trafficDays: number;
  visitors: number;
  igVisitors: number;
  igCampaigns: Record<string, number>;
  episodePages: number;
  membershipViews: number;
  playsNonMember: number;
  playsIg: number;
  checkoutsOpened: number;
  checkoutsWithEmail: number;
  paid: number;
  paidIg: number;
  byCampaign: Record<string, { began: number; paid: number }>;
  newSubs: number;
  cancelClicks: number;
  ended: number;
}

const sql = neon(process.env.DATABASE_URL!);
const stripeKey = process.env.STRIPE_SECRET_KEY_LIVE;
const stripe = stripeKey?.startsWith("sk_live_") ? new Stripe(stripeKey) : null;

async function week(label: string, from: string, to: string): Promise<Week> {
  const w: Week = {
    label, start: from, end: to, trafficDays: 0, visitors: 0, igVisitors: 0, igCampaigns: {},
    episodePages: 0, membershipViews: 0, playsNonMember: 0, playsIg: 0, checkoutsOpened: 0,
    checkoutsWithEmail: 0, paid: 0, paidIg: 0, byCampaign: {}, newSubs: 0, cancelClicks: 0, ended: 0,
  };

  const traffic = (await sql`
    SELECT day::text, window_days, data FROM traffic_daily WHERE day BETWEEN ${from} AND ${to}
  `.catch(() => [])) as { window_days: number; data: TrafficDay }[];
  for (const t of traffic) {
    w.trafficDays += Number(t.window_days);
    w.visitors += t.data.sessions;
    w.igVisitors += t.data.instagram.sessions;
    w.episodePages += t.data.pages.episodePages;
    w.membershipViews += t.data.pages.membership;
    for (const [k, n] of Object.entries(t.data.instagram.campaigns ?? {})) {
      w.igCampaigns[k] = (w.igCampaigns[k] ?? 0) + n;
    }
  }

  const plays = (await sql`
    SELECT viewer, source, SUM(n)::int AS n FROM play_starts
    WHERE day BETWEEN ${from} AND ${to} GROUP BY viewer, source
  `.catch(() => [])) as { viewer: string; source: string; n: number }[];
  for (const p of plays) {
    if (p.viewer === "member") continue;
    w.playsNonMember += p.n;
    if (p.source === "instagram") w.playsIg += p.n;
  }

  if (stripe) {
    const gte = Math.floor(Date.parse(`${from}T00:00:00Z`) / 1000);
    const lt = Math.floor(Date.parse(`${addDays(to, 1)}T00:00:00Z`) / 1000);
    const emails = new Set<string>(), paid = new Set<string>(), paidIg = new Set<string>();
    const camp: Record<string, { began: Set<string>; paid: Set<string> }> = {};
    for await (const s of stripe.checkout.sessions.list({ created: { gte, lt }, limit: 100 })) {
      w.checkoutsOpened += 1;
      const email = (s.customer_email ?? s.customer_details?.email ?? "").toLowerCase();
      const isPaid = s.status === "complete";
      const who = email || (typeof s.customer === "string" ? s.customer : s.id);
      if (email) emails.add(email);
      if (isPaid) paid.add(who);
      const m = s.metadata ?? {};
      if (isPaid && (m.lt_source === "instagram" || m.ft_source === "instagram")) paidIg.add(who);
      const source = m.lt_source || m.ft_source;
      const key = source ? `${source}|${m.lt_campaign || m.ft_campaign || "untagged"}` : "unattributed";
      camp[key] ??= { began: new Set(), paid: new Set() };
      if (email) camp[key].began.add(email);
      if (isPaid) camp[key].paid.add(who);
    }
    w.checkoutsWithEmail = emails.size;
    w.paid = paid.size;
    w.paidIg = paidIg.size;
    for (const [k, v] of Object.entries(camp)) w.byCampaign[k] = { began: v.began.size, paid: v.paid.size };

    for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100 })) {
      if (sub.start_date >= gte && sub.start_date < lt) w.newSubs += 1;
      if (sub.canceled_at && sub.canceled_at >= gte && sub.canceled_at < lt) w.cancelClicks += 1;
      if (sub.ended_at && sub.ended_at >= gte && sub.ended_at < lt) w.ended += 1;
    }
  }
  return w;
}

/* --------------------------------------------------------------- format ---- */

const pct = (n: number, of: number) => (of ? `${((n / of) * 100).toFixed(of >= 100 ? 0 : 1)}%` : "—");
const delta = (a: number, b: number) => (b === 0 ? (a === 0 ? "±0" : "new") : `${a >= b ? "+" : ""}${a - b}`);
const row = (cells: (string | number)[]) => `| ${cells.join(" | ")} |`;

/** Rule-based labels from scripts/ig-label.ts; hand corrections in POST_LABELS win. */
const fileLabels: Record<string, PostLabels> = (() => {
  const f = path.join(DIR, "instagram", "labels.json");
  return existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as Record<string, PostLabels>) : {};
})();

function igPosts(): { rows: IgPost[]; note: string } {
  const f = path.join(DIR, "instagram", "posts.json");
  if (!existsSync(f)) return { rows: [], note: "**Not connected.** No Instagram export imported yet, so reach, plays, saves, shares and follows per post are unknown this week." };
  const all = (JSON.parse(readFileSync(f, "utf8")) as { posts: IgPost[] }).posts;
  return { rows: all.filter((p) => p.published.slice(0, 10) >= start && p.published.slice(0, 10) <= end), note: "" };
}

async function main() {
  const [cur, prev] = await Promise.all([week("This week", start, end), week("Week before", prevStart, prevEnd)]);
  const ig = igPosts();
  const lines: string[] = [];
  const L = (s = "") => lines.push(s);

  L(`# Between Us — weekly data pack, ${start} → ${end}`);
  L();
  L(`Generated ${new Date().toISOString().slice(0, 16)}Z. Compared with ${prevStart} → ${prevEnd}. Counts are exact; rates show their counts. Groups under ${MIN_N} are marked "too few".`);
  L();
  L("## Data completeness");
  L();
  L(`- Clarity traffic: ${cur.trafficDays} of 7 days stored this week; ${prev.trafficDays} of 7 the week before.`);
  L(`- Stripe: ${stripe ? "live, read directly" : "**not available** (no live key)"}. Campaign attribution exists only for checkouts from 2026-10-11 on.`);
  L(`- Plays: counted from 2026-10-11.`);
  L(`- Instagram: ${ig.note || `${ig.rows.length} post(s) in this week from the imported export.`}`);
  L();
  L("## The funnel, week on week");
  L();
  L(row(["Step", "This week", "Week before", "Change"]));
  L(row(["---", "---:", "---:", "---:"]));
  const steps: [string, keyof Week][] = [
    ["Visitors (Clarity)", "visitors"], ["…from Instagram", "igVisitors"], ["Episode-page views", "episodePages"],
    ["Non-member plays", "playsNonMember"], ["…from Instagram", "playsIg"], ["/membership views", "membershipViews"],
    ["Checkouts opened", "checkoutsOpened"], ["…with an email typed", "checkoutsWithEmail"], ["Paid", "paid"],
    ["…Instagram involved", "paidIg"], ["New subscriptions", "newSubs"], ["Cancel clicks", "cancelClicks"], ["Subscriptions ended", "ended"],
  ];
  // "No data" is not zero: a step whose source did not exist for that week
  // prints a dash, and its change is not computed.
  const has = (w: Week, k: keyof Week) =>
    ["visitors", "igVisitors", "episodePages", "membershipViews"].includes(k)
      ? w.trafficDays > 0
      : ["playsNonMember", "playsIg"].includes(k)
        ? w.end >= PLAYS_FROM
        : k === "paidIg"
          ? w.end >= ATTRIBUTION_FROM
          : Boolean(stripe);
  const cell = (w: Week, k: keyof Week) => (has(w, k) ? String(w[k]) : "—");
  for (const [label, k] of steps) {
    L(row([label, cell(cur, k), cell(prev, k), has(cur, k) && has(prev, k) ? delta(cur[k] as number, prev[k] as number) : "—"]));
  }
  L();
  L(
    cur.trafficDays && prev.trafficDays
      ? `Visitor → paid: ${pct(cur.paid, cur.visitors)} (${cur.paid} of ${cur.visitors}) vs ${pct(prev.paid, prev.visitors)} (${prev.paid} of ${prev.visitors}).`
      : "Visitor → paid: not computable until both weeks have Clarity traffic stored.",
  );
  L();
  L("## Instagram visits by campaign (Clarity)");
  L();
  const camps = Object.entries(cur.igCampaigns).sort((a, b) => b[1] - a[1]);
  if (!camps.length) L("No per-campaign data stored for this week yet (recorded from 2026-10-12).");
  else {
    L(row(["Medium / campaign", "Sessions"]));
    L(row(["---", "---:"]));
    for (const [k, n] of camps) {
      const [medium, campaign] = k.split("|");
      L(row([`${medium || "(no medium)"} / ${campaign || "untagged"}`, n]));
    }
  }
  L();
  L("## Checkouts and payments by campaign (Stripe)");
  L();
  const bc = Object.entries(cur.byCampaign).sort((a, b) => b[1].paid - a[1].paid || b[1].began - a[1].began);
  if (!bc.length) L("No checkouts this week.");
  else {
    L(row(["Source / campaign", "Began checkout", "Paid", "Note"]));
    L(row(["---", "---:", "---:", "---"]));
    for (const [k, v] of bc) L(row([k.replace("|", " / "), v.began, v.paid, v.began < MIN_N ? "too few" : ""]));
  }
  L();
  L("## Instagram posts this week");
  L();
  if (!ig.rows.length) L(ig.note || "No posts published this week.");
  else {
    L(row(["Post", "Length", "Characters", "Themes", "Hook", "Caption", "CTA", "Reach", "Plays", "Saves", "Shares", "Follows", "Site sessions"]));
    L(row(Array(13).fill("---")));
    for (const p of ig.rows) {
      const lab = POST_LABELS[p.shortcode] ?? fileLabels[p.shortcode];
      const sess = Object.entries(cur.igCampaigns).filter(([k]) => k.endsWith(`|${p.campaign ?? "\u0000"}`)).reduce((a, [, n]) => a + n, 0);
      L(row([
        `[${p.shortcode}](${p.permalink})`, p.durationSeconds === null ? "—" : durationBand(p.durationSeconds),
        lab?.characters.join(", ") ?? "unlabelled", lab?.themes.join(", ") || "—", lab?.hook ?? "—",
        lab?.captionStyle ?? "—", lab?.cta ?? "—", p.reach ?? "—", p.plays ?? "—", p.saves ?? "—",
        p.shares ?? "—", p.follows ?? "—", p.campaign ? sess : "untagged",
      ]));
    }
  }
  L();
  L("## Narrative");
  L();
  L("_To be written from the tables above: what worked, what didn't, and three experiments — observations and hypotheses kept separate, with the sample size behind every claim._");

  mkdirSync(path.join(DIR, "reports"), { recursive: true });
  const out = path.join(DIR, "reports", `week-${end}.md`);
  writeFileSync(out, lines.join("\n") + "\n");
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
