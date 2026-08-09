import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import { membershipSummary } from "@/lib/db/memberships";
import { allPostsForModeration, posterStats } from "@/lib/db/overheard";
import { recentHelpMessages } from "@/lib/db/help";
import { surveyResults, type Tally } from "@/lib/db/survey";
import { labelFor } from "@/lib/content/survey";
import { threadRunway, FREE_POST_ALLOWANCE } from "@/lib/content/overheard";
import { videos } from "@/lib/content/videos";
import { clips, clipAccess } from "@/lib/content/clips";
import { galleries } from "@/lib/content/gallery";
import { journal } from "@/lib/content/journal";
import { notes } from "@/lib/content/between-takes";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The one page Melissa opens to see the state of the thing.
 *
 * Deliberately NOT an analytics dashboard — Microsoft Clarity already does
 * traffic and session replay, and rebuilding a worse version of it here would
 * be work that helps nobody. This answers the questions Clarity cannot: who is
 * paying, who is talking, what is published behind which wall, and when the
 * cast thread runs dry.
 *
 * Owner-only, gated on OWNER_USER_ID and checked server-side.
 */
export default async function AdminPage() {
  if (!authConfigured() || !(await isOwner())) notFound();

  const now = new Date();
  const [{ active: member }, members, posts, posters, signups] =
    await Promise.all([
      getMembership(),
      membershipSummary(),
      allPostsForModeration(20),
      posterStats(FREE_POST_ALLOWANCE),
      freeAccountCount(),
    ]);
  const [help, survey] = await Promise.all([
    recentHelpMessages(20),
    surveyResults(25),
  ]);

  // The two numbers Melissa actually wants off this page, pulled out of the
  // tallies so they can sit at the top as headline stats. "Would watch" counts
  // day-one and probably together — "if someone I trusted told me to" is a
  // real answer but it is not a yes, and rolling it in would flatter the
  // number on the strength of the softest option on the list.
  const share = (rows: Tally[], ids: string[]) =>
    survey.total === 0
      ? 0
      : Math.round(
          (rows
            .filter((r) => ids.includes(r.optionId))
            .reduce((n, r) => n + r.count, 0) /
            survey.total) *
            100,
        );
  const wouldWatchPct = share(survey.wouldWatch, ["day-one", "probably"]);
  const seriesPct = share(survey.format, ["series"]);
  const openHelp = help.filter((h) => !h.handled);

  const paying = members
    .filter((m) => ["active", "trialing", "past_due"].includes(m.status))
    .reduce((n, m) => n + m.n, 0);
  const mrr = paying * 8;

  const runway = threadRunway(now);

  const scenes = videos.filter((v) => !v.hidden);
  const content = [
    {
      label: "Scenes",
      total: scenes.length,
      gated: scenes.filter((v) => v.access === "premium").length,
      href: "/browse",
    },
    {
      label: "Still galleries",
      total: galleries.length,
      gated: galleries.filter((g) => g.access === "premium").length,
      href: "/gallery",
    },
    {
      label: "Clips",
      total: clips.length,
      gated: clips.filter((c) => clipAccess(c) === "premium").length,
      href: "/clips",
    },
    {
      label: "Journal entries",
      total: journal.length,
      gated: journal.filter((e) => e.access === "premium").length,
      href: "/journal",
    },
    {
      label: "Between Takes notes",
      total: notes.length,
      gated: notes.filter((n) => n.access === "premium").length,
      href: "/characters",
    },
  ];

  const visible = posts.filter((p) => !p.hidden);

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-10 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">Admin</p>
          <h1 className="mt-3 font-display text-3xl font-light text-ivory sm:text-4xl">
            The state of it.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone">
            Traffic and session replay live in{" "}
            <a
              href="https://clarity.microsoft.com"
              className="text-amber underline decoration-hairline underline-offset-4"
            >
              Clarity
            </a>
            . This is everything Clarity can&rsquo;t tell you.
          </p>
        </header>

        {/* ---------------------------------------------------------- money */}
        <Section title="Members">
          <div className="flex flex-wrap gap-8">
            <Stat label="Paying members" value={String(paying)} />
            <Stat label="MRR" value={`$${mrr}`} />
          </div>
          {members.length === 0 ? (
            <p className="mt-4 text-sm text-stone-dim">
              No membership rows yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-1 text-sm text-stone">
              {members.map((m) => (
                <li key={`${m.tier}:${m.status}`}>
                  {m.n} × <span className="text-ivory">{m.tier}</span> ·{" "}
                  {m.status}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-stone-dim">
            Stripe is the source of truth; this table is the webhook&rsquo;s
            projection of it. A number that looks wrong here means the webhook,
            not the billing.
          </p>
        </Section>

        {/* ------------------------------------------------------- the room */}
        <Section
          title="Overheard"
          action={{ href: "/account/overheard", label: "Moderate" }}
        >
          <div className="flex flex-wrap gap-8">
            <Stat
              label="Accounts"
              value={signups === null ? "—" : String(signups)}
            />
            <Stat label="Have posted" value={String(posters.posters)} />
            <Stat label="Spent the old three" value={String(posters.spent)} />
            <Stat label="Posts" value={String(posts.length)} />
            <Stat label="Showing" value={String(visible.length)} />
            <Stat
              label="Cast thread runway"
              value={runway.daysLeft === 0 ? "dry" : `${runway.daysLeft}d`}
              warn={runway.daysLeft <= 5}
            />
          </div>
          <p className="mt-4 text-xs text-stone-dim">
            &ldquo;Accounts&rdquo; is every login Clerk holds, members
            included — it is not a count of people who have not paid.{" "}
            <strong className="font-normal text-stone">
              Both of the next two numbers are history now.
            </strong>{" "}
            Overheard went members-only on 3 August, so nobody signs up in
            order to post any more and nobody else will ever spend the old
            three-post allowance. They describe the people who came through
            while the wall was public.
          </p>
          <p className="mt-2 text-xs text-stone-dim">
            Which also means new email addresses now only arrive with a
            payment. There is no longer a step where somebody interested but
            undecided hands you one.
          </p>
          <p className="mt-2 text-xs text-stone-dim">
            Scripted cast messages run to{" "}
            {runway.lastDay.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            . After that the thread stops growing — it doesn&rsquo;t break,
            it just goes quiet.
          </p>

          {posts.length > 0 && (
            <ul className="mt-5 space-y-3">
              {posts.slice(0, 5).map((p) => (
                <li key={p.id} className="text-sm">
                  <span className="text-ivory">{p.authorName}</span>{" "}
                  <span className="text-xs text-stone-dim">
                    {p.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {p.hidden && " · hidden"}
                  </span>
                  <p className="line-clamp-1 text-stone">{p.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* --------------------------------------------------------- survey */}
        <Section title="Survey">
          {survey.total === 0 ? (
            <p className="mt-1 text-sm text-stone-dim">
              No answers yet. The form is at{" "}
              <Link
                href="/survey"
                className="text-amber underline decoration-hairline underline-offset-4"
              >
                /survey
              </Link>
              .
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-8">
                <Stat label="Responses" value={String(survey.total)} />
                <Stat
                  label="Would watch it"
                  value={`${wouldWatchPct}%`}
                  warn={wouldWatchPct < 50}
                />
                <Stat label="Want a series" value={`${seriesPct}%`} />
              </div>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                <Tallies
                  heading="How they're finding it"
                  questionId="enjoyment"
                  rows={survey.enjoyment}
                  total={survey.total}
                />
                <Tallies
                  heading="Series or film"
                  questionId="format"
                  rows={survey.format}
                  total={survey.total}
                />
                <Tallies
                  heading="Would you watch it on a platform"
                  questionId="would_watch"
                  rows={survey.wouldWatch}
                  total={survey.total}
                />
                <Tallies
                  heading="Want more of"
                  questionId="wants"
                  rows={survey.wants}
                  total={survey.total}
                />
                <Tallies
                  heading="Stayed with them"
                  questionId="favourite_scene"
                  rows={survey.favouriteScene}
                  total={survey.total}
                />
              </div>
              {survey.comments.length > 0 && (
                <ul className="mt-8 divide-y divide-hairline border-t border-hairline">
                  {survey.comments.map((c, i) => (
                    <li key={i} className="py-4">
                      <p className="whitespace-pre-line text-sm leading-relaxed text-stone">
                        {c.comment}
                      </p>
                      <p className="mt-1.5 text-xs text-stone-dim">
                        {c.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Section>

        {/* ---------------------------------------------------------- inbox */}
        <Section title="Help">
          <div className="flex flex-wrap gap-8">
            <Stat
              label="Waiting"
              value={String(openHelp.length)}
              warn={openHelp.length > 0}
            />
            <Stat label="All time" value={String(help.length)} />
          </div>
          {help.length === 0 ? (
            <p className="mt-4 text-sm text-stone-dim">
              Nothing yet. The form is at{" "}
              <Link href="/help" className="text-amber underline decoration-hairline underline-offset-4">
                /help
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-hairline">
              {help.map((h) => (
                <li key={h.id} className={`py-4 ${h.handled ? "opacity-45" : ""}`}>
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold text-ivory">{h.subject}</span>
                    <span className="text-xs text-stone-dim">
                      {h.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    {h.handled && (
                      <span className="text-[0.6875rem] uppercase tracking-wide text-stone-dim">
                        handled
                      </span>
                    )}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone">
                    {h.body}
                  </p>
                  <p className="mt-1.5 text-xs text-stone-dim">
                    {h.replyTo ? (
                      <a
                        href={`mailto:${h.replyTo}`}
                        className="text-amber underline decoration-hairline underline-offset-4"
                      >
                        {h.replyTo}
                      </a>
                    ) : (
                      "no reply address given"
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-stone-dim">
            Messages land here whatever happens. They are also emailed to you
            once RESEND_API_KEY, OWNER_EMAIL and HELP_FROM_EMAIL are set — the
            database is the record, the email is only the nudge.
          </p>
        </Section>

        {/* ----------------------------------------------------- what exists */}
        <Section title="Content">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.1em] text-stone-dim">
                <th className="pb-2 font-normal">Kind</th>
                <th className="pb-2 text-right font-normal">Total</th>
                <th className="pb-2 text-right font-normal">Members-only</th>
                <th className="pb-2 text-right font-normal">Free</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {content.map((c) => (
                <tr key={c.label}>
                  <td className="py-2">
                    <Link
                      href={c.href}
                      className="text-stone transition-colors hover:text-amber"
                    >
                      {c.label}
                    </Link>
                  </td>
                  <td className="py-2 text-right tabular-nums text-ivory">
                    {c.total}
                  </td>
                  <td className="py-2 text-right tabular-nums text-amber-soft">
                    {c.gated}
                  </td>
                  <td className="py-2 text-right tabular-nums text-stone">
                    {c.total - c.gated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-stone-dim">
            Every members-only number here is a promise the membership page
            makes. If one drops to zero, a benefit line has stopped being true.
          </p>
        </Section>
      </main>
    </>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12 border-t border-hairline pt-6">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl text-ivory">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-sm text-amber underline decoration-hairline underline-offset-4"
          >
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  warn = false,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-display text-3xl ${warn ? "text-amber" : "text-ivory"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-stone-dim">
        {label}
      </p>
    </div>
  );
}

/**
 * One question's answers, as counts and bars.
 *
 * Percentages are of RESPONDENTS, not of answers, which is why "want more of"
 * can add up to well over a hundred — it is a multi-select, and "62% of people
 * want more Luna and Tyson" is the sentence Melissa needs, not "Luna and Tyson
 * was 24% of all boxes ticked".
 */
function Tallies({
  heading,
  questionId,
  rows,
  total,
}: {
  heading: string;
  questionId: string;
  rows: Tally[];
  total: number;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.1em] text-stone-dim">
        {heading}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const pct = total === 0 ? 0 : Math.round((r.count / total) * 100);
          return (
            <li key={r.optionId}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ivory">
                  {labelFor(questionId, r.optionId)}
                </span>
                <span className="shrink-0 tabular-nums text-stone-dim">
                  {r.count} · {pct}%
                </span>
              </div>
              <div className="mt-1 h-1 w-full rounded-full bg-hairline">
                <div
                  className="h-1 rounded-full bg-amber"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Free accounts, from Clerk — it owns the person, we own what they can open.
 * Returns null rather than throwing if Clerk is unreachable, so one flaky call
 * shows a dash instead of taking the whole dashboard down.
 */
async function freeAccountCount(): Promise<number | null> {
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    return await client.users.getCount();
  } catch {
    return null;
  }
}

async function isOwner(): Promise<boolean> {
  const owner = process.env.OWNER_USER_ID;
  if (!owner) return false;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return Boolean(userId && userId === owner);
}
