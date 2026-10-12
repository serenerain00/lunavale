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
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/weekly-report.ts [--end=YYYY-MM-DD]
 *
 * (--conditions=react-server lets it import lib/billing/revenue, which is
 * server-only, for the same MRR arithmetic as /admin.)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";
import type { TrafficDay } from "@/lib/analytics/clarity";
import { netMonthlyCents } from "@/lib/billing/revenue";
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
  // ---- scorecard (Stripe, live) ----
  /** Paying subscriptions live at the end of the week (net amount > 0). */
  activePaying: number;
  /** Comped (100% off) subscriptions live at the end of the week. */
  activeComped: number;
  /** Net monthly recurring revenue at the end of the week, cents. */
  mrrCents: number;
  /** Of those paying at week end, how many had already cancelled (they run out their period). */
  leaving: number;
  leavingCents: number;
  /** New PAYING subscriptions started in the week (comps excluded). */
  newPaying: number;
  /** Cash collected: paid invoices in the week, minus refunds in the week, cents. */
  collectedCents: number;
  /** Paid checkouts in the week with Instagram as first or last touch, cents. */
  igAttributedCents: number;
  /** Follows Instagram credits to posts published in the week (gross). */
  igFollows: number | null;
  /** Lifetime reach of posts published in the week, summed. */
  igReach: number | null;
  igPosts: number | null;
}

const sql = neon(process.env.DATABASE_URL!);
const stripeKey = process.env.STRIPE_SECRET_KEY_LIVE;
const stripe = stripeKey?.startsWith("sk_live_") ? new Stripe(stripeKey) : null;

/** Never-completed checkouts leave these behind; they were never live. */
const NEVER_LIVE = new Set(["incomplete", "incomplete_expired"]);

async function week(label: string, from: string, to: string): Promise<Week> {
  const w: Week = {
    label, start: from, end: to, trafficDays: 0, visitors: 0, igVisitors: 0, igCampaigns: {},
    episodePages: 0, membershipViews: 0, playsNonMember: 0, playsIg: 0, checkoutsOpened: 0,
    checkoutsWithEmail: 0, paid: 0, paidIg: 0, byCampaign: {}, newSubs: 0, cancelClicks: 0, ended: 0,
    activePaying: 0, activeComped: 0, mrrCents: 0, leaving: 0, leavingCents: 0, newPaying: 0, collectedCents: 0, igAttributedCents: 0,
    igFollows: null, igReach: null, igPosts: null,
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
      if (isPaid && (m.lt_source === "instagram" || m.ft_source === "instagram")) {
        paidIg.add(who);
        w.igAttributedCents += s.amount_total ?? 0;
      }
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

    for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.discounts.source.coupon"] })) {
      if (NEVER_LIVE.has(sub.status)) continue;
      // Judged at the end of the week, with the admin page's own arithmetic.
      // Trials count as not paying, as there.
      const monthly = sub.trial_end && sub.trial_end >= lt ? 0 : netMonthlyCents(sub, lt);
      if (sub.start_date >= gte && sub.start_date < lt) {
        w.newSubs += 1;
        if (monthly > 0) w.newPaying += 1;
      }
      if (sub.canceled_at && sub.canceled_at >= gte && sub.canceled_at < lt) w.cancelClicks += 1;
      if (sub.ended_at && sub.ended_at >= gte && sub.ended_at < lt) w.ended += 1;
      // Live at the end of the week: started by then, not ended by then.
      const live = sub.start_date < lt && (!sub.ended_at || sub.ended_at >= lt);
      if (live && monthly > 0) {
        w.activePaying += 1;
        w.mrrCents += monthly;
        // Cancelled by the end of the week but still paid up: this MRR goes
        // away on its own unless they switch renewal back on.
        if (sub.canceled_at && sub.canceled_at < lt) { w.leaving += 1; w.leavingCents += monthly; }
      }
      else if (live) w.activeComped += 1;
    }
    for await (const inv of stripe.invoices.list({ status: "paid", created: { gte, lt }, limit: 100 })) {
      w.collectedCents += inv.amount_paid;
    }
    for await (const r of stripe.refunds.list({ created: { gte, lt }, limit: 100 })) {
      if (r.status === "succeeded") w.collectedCents -= r.amount;
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

/**
 * The growth side's post → campaign map (data/ig-posts.json, owned there):
 * which tagged campaign, experiment and arm each live post belongs to.
 * Joined by shortcode; rows whose shortcode is still null are not live yet.
 */
interface PlannedPost {
  shortcode: string | null;
  campaign: string;
  experiment?: string;
  arm?: string;
  /** Free-text protocol note from the growth side, e.g. a deviation from the test design. */
  note?: string;
}
const planned: PlannedPost[] = (() => {
  const f = path.join(process.cwd(), "data", "ig-posts.json");
  return existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as { posts: PlannedPost[] }).posts : [];
})();

function withCampaigns(posts: IgPost[]): IgPost[] {
  const byCode = new Map(planned.filter((p) => p.shortcode).map((p) => [p.shortcode!, p]));
  return posts.map((p) => ({ ...p, campaign: p.campaign ?? byCode.get(p.shortcode)?.campaign ?? null }));
}

function igPosts(): { rows: IgPost[]; note: string } {
  const f = path.join(DIR, "instagram", "posts.json");
  if (!existsSync(f)) return { rows: [], note: "**Not connected.** No Instagram export imported yet, so reach, plays, saves, shares and follows per post are unknown this week." };
  const all = withCampaigns((JSON.parse(readFileSync(f, "utf8")) as { posts: IgPost[] }).posts);
  return { rows: all.filter((p) => p.published.slice(0, 10) >= start && p.published.slice(0, 10) <= end), note: "" };
}

/** Instagram's own numbers for posts PUBLISHED in a week, from the imported export. */
function igWeek(w: Week): void {
  const f = path.join(DIR, "instagram", "posts.json");
  if (!existsSync(f)) return;
  const all = (JSON.parse(readFileSync(f, "utf8")) as { posts: IgPost[] }).posts;
  const inWeek = all.filter((p) => p.published.slice(0, 10) >= w.start && p.published.slice(0, 10) <= w.end);
  w.igPosts = inWeek.length;
  w.igReach = inWeek.reduce((a, p) => a + (p.reach ?? 0), 0);
  w.igFollows = inWeek.reduce((a, p) => a + (p.follows ?? 0), 0);
}

const money = (c: number) => `${c < 0 ? "−" : ""}$${(Math.abs(c) / 100).toFixed(c % 100 ? 2 : 0)}`;

async function main() {
  const [cur, prev] = await Promise.all([week("This week", start, end), week("Week before", prevStart, prevEnd)]);
  igWeek(cur);
  igWeek(prev);
  const ig = igPosts();
  const lines: string[] = [];
  const L = (s = "") => lines.push(s);

  L(`# Between Us — weekly data pack, ${start} → ${end}`);
  L();
  L(`Generated ${new Date().toISOString().slice(0, 16)}Z. Compared with ${prevStart} → ${prevEnd}. Counts are exact; rates show their counts. Groups under ${MIN_N} are marked "too few".`);
  L();
  // ------------------------------------------------------------- scorecard
  // Basis says how each number is known. "Confirmed" = money Stripe recorded.
  // "Measured" = counted by an instrument (Clarity, Instagram, our own DB).
  // "Attribution" = a rule decided who gets credit. "Not tracked" = no source;
  // left blank rather than estimated.
  L("## Scorecard");
  L();
  L(row(["Metric", "This week", "Week before", "Change", "Basis"]));
  L(row(["---", "---:", "---:", "---:", "---"]));
  const sc = (label: string, a: number | null, b: number | null, basis: string, fmt: (n: number) => string = String) =>
    L(row([label, a === null ? "—" : fmt(a), b === null ? "—" : fmt(b), a === null || b === null ? "—" : `${a - b > 0 ? "+" : a - b === 0 ? "±" : ""}${fmt(a - b)}`, basis]));
  const st = stripe ? (n: number) => n : () => null;
  sc("Active paying subscribers (end of week)", st(cur.activePaying), st(prev.activePaying), "Confirmed · Stripe");
  sc("…plus comped (not paying)", st(cur.activeComped), st(prev.activeComped), "Confirmed · Stripe");
  sc("New paying subscribers", st(cur.newPaying), st(prev.newPaying), "Confirmed · Stripe");
  sc("Cancellations clicked", st(cur.cancelClicks), st(prev.cancelClicks), "Confirmed · Stripe");
  sc("Subscriptions ended", st(cur.ended), st(prev.ended), "Confirmed · Stripe");
  sc("MRR (end of week, net of coupons)", st(cur.mrrCents), st(prev.mrrCents), "Confirmed · Stripe prices × coupons", money);
  sc("…of which already cancelled, running out their period", st(cur.leaving), st(prev.leaving), "Confirmed · Stripe");
  sc("MRR scheduled to end (those members)", st(cur.leavingCents), st(prev.leavingCents), "Confirmed · Stripe", money);
  sc("Cash collected (paid invoices − refunds)", st(cur.collectedCents), st(prev.collectedCents), "Confirmed · Stripe", money);
  sc("Instagram reach (posts published this week)", cur.igReach, prev.igReach, "Measured · IG export, lifetime to date");
  sc("Instagram follows from those posts", cur.igFollows, prev.igFollows, "Measured · IG export (gross, not net follower change)");
  sc("Instagram → site visits", cur.trafficDays ? cur.igVisitors : null, prev.trafficDays ? prev.igVisitors : null, "Measured · Clarity");
  sc("Site visitors", cur.trafficDays ? cur.visitors : null, prev.trafficDays ? prev.visitors : null, "Measured · Clarity");
  L(row([
    "Site → paid conversion",
    cur.trafficDays && stripe ? `${pct(cur.paid, cur.visitors)} (${cur.paid}/${cur.visitors})` : "—",
    prev.trafficDays && stripe ? `${pct(prev.paid, prev.visitors)} (${prev.paid}/${prev.visitors})` : "—",
    "—",
    "Measured ÷ Confirmed; different instruments, not one cohort",
  ]));
  sc("Revenue attributed to Instagram", cur.end >= ATTRIBUTION_FROM && stripe ? cur.igAttributedCents : null, prev.end >= ATTRIBUTION_FROM && stripe ? prev.igAttributedCents : null, "Attribution · IG as first or last touch; first payment only", money);
  L(row(["Content production & marketing costs", "—", "—", "—", "Not tracked (Melissa, 2026-10-11)"]));
  L();
  L(`Net follower change is not in Instagram's content export; it needs the API (account insights). MRR for past weeks uses each subscription's current coupon. "Attributed" revenue is a rule, not proof: it credits Instagram whenever an Instagram visit came first or last before paying.`);
  L();
  // The written parts live beside the numbers, in week-<end>.narrative.md,
  // so regenerating the tables can never erase them. Its "## Scorecard
  // commentary" section lands here; the rest goes at the end.
  const narrativeFile = path.join(DIR, "reports", `week-${end}.narrative.md`);
  const narrative = existsSync(narrativeFile) ? readFileSync(narrativeFile, "utf8") : "";
  const [scoreNotes, ...rest] = narrative.split(/^(?=## )/m).reduce<[string, ...string[]]>(
    (acc, part) => (part.startsWith("## Scorecard commentary") ? ((acc[0] = part.replace(/^## Scorecard commentary\s*/, "")), acc) : (acc.push(part), acc)),
    [""],
  );
  L("### Biggest drivers and three actions");
  L();
  L(scoreNotes.trim() || "_Not written yet: add a \"## Scorecard commentary\" section to " + path.basename(narrativeFile) + "._");
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
  // ---------------------------------------------- Instagram experiments
  // Whole run to date, not this week: an experiment's arms are compared over
  // all their posts. Follows on REELS exist only in the Business Suite
  // export (the API does not report them), so a follows column with dashes
  // means "export needed", not zero.
  const igAll = existsSync(path.join(DIR, "instagram", "posts.json"))
    ? withCampaigns((JSON.parse(readFileSync(path.join(DIR, "instagram", "posts.json"), "utf8")) as { posts: IgPost[] }).posts)
    : [];
  const experiments = [...new Set(planned.map((p) => p.experiment).filter(Boolean))] as string[];
  if (experiments.length) {
    L("## Instagram experiments (all posts to date)");
    L();
    const traffic = (await sql`SELECT data FROM traffic_daily`.catch(() => [])) as { data: TrafficDay }[];
    const sessionsFor = (campaign: string) =>
      traffic.reduce((a, t) => a + Object.entries(t.data.instagram.campaigns ?? {}).filter(([k]) => k.endsWith(`|${campaign}`)).reduce((x, [, n]) => x + n, 0), 0);
    for (const ex of experiments) {
      L(`**${ex}**`);
      L();
      L(row(["Arm", "Posts live", "Reach", "Follows", "Follows / 1k reached", "Saves / 1k", "Shares / 1k", "Tagged visits"]));
      L(row(["---", "---:", "---:", "---:", "---:", "---:", "---:", "---:"]));
      const arms = [...new Set(planned.filter((p) => p.experiment === ex).map((p) => p.arm ?? "—"))];
      for (const arm of arms) {
        const plan = planned.filter((p) => p.experiment === ex && (p.arm ?? "—") === arm);
        const live = igAll.filter((p) => plan.some((q) => q.shortcode === p.shortcode));
        const reach = live.reduce((a, p) => a + (p.reach ?? 0), 0);
        const fol = live.length && live.every((p) => p.follows !== null) ? live.reduce((a, p) => a + (p.follows ?? 0), 0) : null;
        const per = (n: number | null) => (n === null || !reach ? "—" : ((1000 * n) / reach).toFixed(1));
        L(row([
          arm, `${live.length} of ${plan.length}`, reach || "—", fol ?? "—", per(fol),
          per(live.reduce((a, p) => a + (p.saves ?? 0), 0)), per(live.reduce((a, p) => a + (p.shares ?? 0), 0)),
          plan.reduce((a, p) => a + sessionsFor(p.campaign), 0),
        ]));
      }
      // Deviations from the test design, as recorded when each post went up —
      // a readout that leaves these out overstates how clean the test was.
      const notes = planned.filter((p) => p.experiment === ex && p.note);
      if (notes.length) {
        L();
        L("Protocol notes:");
        for (const p of notes) L(`- ${p.campaign}${p.arm ? ` (${p.arm})` : ""}: ${p.note}`);
      }
      L();
    }
  }

  const story = rest.join("").trim();
  L(story || "## Narrative\n\n_Not written yet — goes in " + path.basename(narrativeFile) + "._");

  mkdirSync(path.join(DIR, "reports"), { recursive: true });
  const out = path.join(DIR, "reports", `week-${end}.md`);
  writeFileSync(out, lines.join("\n") + "\n");
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
