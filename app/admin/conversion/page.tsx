import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { authConfigured } from "@/lib/billing/provider";
import { isOwner } from "@/lib/access/owner";
import { checkoutFunnel } from "@/lib/billing/checkout-funnel";
import {
  membershipsCreatedSince,
  playsSince,
  trafficSince,
  type StoredTrafficDay,
} from "@/lib/db/funnel";
import { getVideo } from "@/lib/content/videos";

export const metadata: Metadata = {
  title: "Conversion",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const RANGES = [7, 14, 30] as const;

/**
 * From an Instagram tap to a paying member, on one page.
 *
 * EACH STEP COMES FROM THE ONE PLACE THAT CAN SEE IT, and says which:
 *
 *   visitors, episode pages, /membership   Clarity, copied daily by
 *                                           /api/cron/clarity into traffic_daily
 *   started watching                       the player's own beacon (play_starts)
 *   began checkout, paid                   Stripe, live
 *
 * Mixing sources means the steps are not one cohort followed through: they are
 * counts of the same window from different instruments. The ratios between
 * them are still the right thing to watch week to week — that is what a
 * baseline is — but "3 of 51" is not a claim that those exact 3 were among
 * those exact 51. The page says so, below the numbers.
 *
 * Instagram is split out at every step. For checkout and payment that split
 * comes from the attribution metadata on each Checkout Session
 * (lib/analytics/attribution.ts); sessions from before it shipped carry none
 * and are reported as unattributed, never guessed into a column.
 *
 * Owner-only, gated server-side exactly like /admin.
 */
export default async function ConversionPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  if (!authConfigured() || !(await isOwner())) notFound();

  const requested = Number((await searchParams).days);
  const days = RANGES.includes(requested as (typeof RANGES)[number]) ? requested : 7;
  const now = new Date();
  const since = new Date(now.getTime() - days * 864e5).toISOString().slice(0, 10);
  const sinceMidnight = new Date(`${since}T00:00:00Z`);

  const [traffic, plays, checkout, newRows] = await Promise.all([
    trafficSince(since),
    playsSince(since),
    checkoutFunnel(sinceMidnight),
    membershipsCreatedSince(since),
  ]);

  const t = totals(traffic);
  const covered = traffic.reduce((n, d) => n + d.windowDays, 0);

  const nonMemberPlays = plays.rows.filter((r) => r.viewer !== "member");
  const playsAll = nonMemberPlays.reduce((n, r) => n + r.n, 0);
  const playsIg = nonMemberPlays.filter((r) => r.source === "instagram").reduce((n, r) => n + r.n, 0);
  const memberPlays = plays.rows.filter((r) => r.viewer === "member").reduce((n, r) => n + r.n, 0);
  const playsMeasured = plays.firstDay !== null;

  const steps: Step[] = [
    {
      label: "Visitors",
      note: "Clarity sessions",
      all: traffic.length ? t.sessions : null,
      ig: traffic.length ? t.igSessions : null,
    },
    {
      label: "Opened an episode page",
      note: "Clarity, session-pages on /clips/…",
      all: traffic.length ? t.episodePages : null,
      ig: traffic.length ? t.igEpisodePages : null,
    },
    {
      label: "Started watching",
      note: "Player beacon, non-members, first play per page",
      all: playsMeasured ? playsAll : null,
      ig: playsMeasured ? playsIg : null,
    },
    {
      label: "Viewed /membership",
      note: "Clarity",
      all: traffic.length ? t.membership : null,
      ig: traffic.length ? t.igMembership : null,
    },
    {
      label: "Began checkout",
      note: "Stripe, people who reached the card form",
      all: checkout ? checkout.peopleWithEmail : null,
      ig: checkout ? checkout.instagram.began : null,
    },
    {
      label: "Paid",
      note: "Stripe, completed checkouts",
      all: checkout ? checkout.paid : null,
      ig: checkout ? checkout.instagram.paid : null,
    },
  ];

  const landings = Object.entries(t.igLandings).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topPlays = [...nonMemberPlays.reduce((m, r) => m.set(r.slug, (m.get(r.slug) ?? 0) + r.n), new Map<string, number>())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-10 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            <Link href="/admin" className="hover:text-amber-soft">Admin</Link> · Conversion
          </p>
          <h1 className="mt-3 font-display text-3xl font-light text-ivory sm:text-4xl">
            From a tap to a member.
          </h1>
          <nav aria-label="Date range" className="mt-6 flex gap-2">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin/conversion?days=${r}`}
                aria-current={r === days ? "page" : undefined}
                className={`rounded-sm border px-3 py-1.5 text-sm ${
                  r === days
                    ? "border-amber/60 bg-amber/15 text-amber-soft"
                    : "border-hairline text-stone hover:text-ivory"
                }`}
              >
                {r} days
              </Link>
            ))}
          </nav>
          <p className="mt-4 text-xs text-stone-dim">
            Since {since} (UTC).{" "}
            {traffic.length
              ? `Clarity numbers cover ${covered} of ${days} days.`
              : "No Clarity days stored yet — the daily copy has not run."}{" "}
            {playsMeasured
              ? `Plays counted since ${plays.firstDay}.`
              : "Plays are not being counted yet."}
          </p>
        </header>

        <section className="mb-12 border-t border-hairline pt-6">
          <h2 className="mb-5 font-display text-2xl text-ivory">The funnel</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.1em] text-stone-dim">
                  <th className="pb-2 font-normal">Step</th>
                  <th className="pb-2 text-right font-normal">Everyone</th>
                  <th className="pb-2 text-right font-normal">of previous</th>
                  <th className="pb-2 text-right font-normal">From Instagram</th>
                  <th className="pb-2 text-right font-normal">of previous</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {steps.map((s, i) => {
                  const prev = steps[i - 1];
                  return (
                    <tr key={s.label}>
                      <td className="py-3 pr-4">
                        <span className="text-ivory">{s.label}</span>
                        <span className="block text-xs text-stone-dim">{s.note}</span>
                      </td>
                      <Cell value={s.all} />
                      <Ratio value={s.all} prev={prev?.all} />
                      <Cell value={s.ig} />
                      <Ratio value={s.ig} prev={prev?.ig} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap gap-8">
            <Stat
              label="Visitor → paid"
              value={
                traffic.length && checkout && t.sessions > 0
                  ? pct(checkout.paid, t.sessions)
                  : "—"
              }
            />
            <Stat label="Checkouts opened" value={checkout ? String(checkout.sessionsOpened) : "—"} />
            <Stat label="New membership rows" value={newRows === null ? "—" : String(newRows)} />
            <Stat label="Member plays" value={playsMeasured ? String(memberPlays) : "—"} />
          </div>

          <div className="mt-6 max-w-2xl space-y-2 text-xs leading-relaxed text-stone-dim">
            <p>
              <strong className="font-normal text-stone">These are counts from different instruments, not one group of people followed through.</strong>{" "}
              Watch the ratios week to week; don&rsquo;t read &ldquo;3 of 51&rdquo; as the same 3 people.
            </p>
            <p>
              Episode and /membership numbers are session-pages: somebody who opens two
              episodes counts twice. &ldquo;Checkouts opened&rdquo; counts taps on Join,
              including people who left before typing; &ldquo;began checkout&rdquo; counts
              only those who typed an email. &ldquo;New membership rows&rdquo; lags
              &ldquo;paid&rdquo; for anyone who paid and has not yet made an account.
            </p>
            <p>
              &ldquo;From Instagram&rdquo; for plays, checkout and payment means Instagram
              was involved — a tagged link, Instagram&rsquo;s link, or its in-app browser,
              on the first or the latest visit.
              {checkout && checkout.unattributed > 0 &&
                ` ${checkout.unattributed} of ${checkout.sessionsOpened} checkouts in this range carry no attribution (opened before tracking began, or cookies blocked) and are left out of the Instagram column rather than guessed.`}
            </p>
            {checkout?.truncated && <p className="text-amber-soft">Stripe held more sessions than were read; the checkout numbers are a floor.</p>}
          </div>
        </section>

        <section className="mb-12 border-t border-hairline pt-6">
          <h2 className="mb-5 font-display text-2xl text-ivory">Where Instagram lands</h2>
          {landings.length === 0 ? (
            <p className="text-sm text-stone-dim">Nothing stored for this range yet.</p>
          ) : (
            <Bars rows={landings.map(([p, n]) => ({ label: p, n }))} />
          )}
        </section>

        <section className="mb-12 border-t border-hairline pt-6">
          <h2 className="mb-5 font-display text-2xl text-ivory">Which posts made members</h2>
          {!checkout || checkout.campaigns.length === 0 ? (
            <p className="text-sm text-stone-dim">
              No attributed checkouts in this range yet. Tag every link you post:{" "}
              <code className="text-stone">?utm_source=instagram&amp;utm_medium=reel&amp;utm_campaign=&lt;post&gt;</code>
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[24rem] text-sm tabular-nums">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.1em] text-stone-dim">
                    <th className="pb-2 font-normal">Source</th>
                    <th className="pb-2 font-normal">Campaign</th>
                    <th className="pb-2 text-right font-normal">Began checkout</th>
                    <th className="pb-2 text-right font-normal">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {checkout.campaigns.map((c) => (
                    <tr key={`${c.source}|${c.campaign}`}>
                      <td className="py-2 text-stone">{c.source}</td>
                      <td className="py-2 text-ivory">{c.campaign || <span className="text-stone-dim">untagged</span>}</td>
                      <td className="py-2 text-right text-ivory">{c.began}</td>
                      <td className="py-2 text-right text-ivory">{c.paid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-stone-dim">
            Counts at this size are anecdotes, not rates. A campaign with one payment and a
            campaign with none are not yet different.
          </p>
        </section>

        <section className="mb-12 border-t border-hairline pt-6">
          <h2 className="mb-5 font-display text-2xl text-ivory">What non-members press play on</h2>
          {topPlays.length === 0 ? (
            <p className="text-sm text-stone-dim">
              {playsMeasured ? "No plays in this range." : "Plays are not being counted yet."}
            </p>
          ) : (
            <Bars rows={topPlays.map(([slug, n]) => ({ label: getVideo(slug)?.title ?? slug, n }))} />
          )}
        </section>

        <section className="mb-12 border-t border-hairline pt-6">
          <h2 className="mb-5 font-display text-2xl text-ivory">By day</h2>
          {traffic.length === 0 ? (
            <p className="text-sm text-stone-dim">Nothing stored for this range yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm tabular-nums">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.1em] text-stone-dim">
                    <th className="pb-2 font-normal">Day</th>
                    <th className="pb-2 text-right font-normal">Visitors</th>
                    <th className="pb-2 text-right font-normal">Instagram</th>
                    <th className="pb-2 text-right font-normal">Episode pages</th>
                    <th className="pb-2 text-right font-normal">/membership</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {[...traffic].reverse().map((d) => (
                    <tr key={d.day}>
                      <td className="py-2 text-stone">
                        {d.day}
                        {d.windowDays > 1 && <span className="text-stone-dim"> ({d.windowDays}d)</span>}
                      </td>
                      <td className="py-2 text-right text-ivory">{d.data.sessions}</td>
                      <td className="py-2 text-right text-ivory">{d.data.instagram.sessions}</td>
                      <td className="py-2 text-right text-ivory">{d.data.pages.episodePages}</td>
                      <td className="py-2 text-right text-ivory">{d.data.pages.membership}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

interface Step {
  label: string;
  note: string;
  all: number | null;
  ig: number | string | null;
}

function totals(days: StoredTrafficDay[]) {
  const t = {
    sessions: 0,
    igSessions: 0,
    episodePages: 0,
    igEpisodePages: 0,
    membership: 0,
    igMembership: 0,
    igLandings: {} as Record<string, number>,
  };
  for (const { data } of days) {
    t.sessions += data.sessions;
    t.igSessions += data.instagram.sessions;
    t.episodePages += data.pages.episodePages;
    t.igEpisodePages += data.instagram.episodePages;
    t.membership += data.pages.membership;
    t.igMembership += data.instagram.membership;
    for (const [p, n] of Object.entries(data.instagram.landings)) {
      t.igLandings[p] = (t.igLandings[p] ?? 0) + n;
    }
  }
  return t;
}

function pct(n: number, of: number): string {
  if (of === 0) return "—";
  const v = (n / of) * 100;
  return `${v < 10 ? v.toFixed(1) : Math.round(v)}%`;
}

function Cell({ value }: { value: number | string | null }) {
  return (
    <td className={`py-3 text-right tabular-nums ${typeof value === "number" ? "text-ivory" : "text-xs text-stone-dim"}`}>
      {value === null ? "—" : value}
    </td>
  );
}

function Ratio({ value, prev }: { value: number | string | null; prev?: number | string | null }) {
  const ok = typeof value === "number" && typeof prev === "number";
  return (
    <td className="py-3 text-right tabular-nums text-xs text-stone-dim">
      {ok ? pct(value, prev) : ""}
    </td>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-ivory">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-stone-dim">{label}</p>
    </div>
  );
}

function Bars({ rows }: { rows: { label: string; n: number }[] }) {
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ivory">{r.label}</span>
            <span className="shrink-0 tabular-nums text-stone-dim">{r.n}</span>
          </div>
          <div className="mt-1 h-1 w-full rounded-full bg-hairline">
            <div className="h-1 rounded-full bg-amber" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
