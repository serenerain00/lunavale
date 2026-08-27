import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import {
  abandonedCheckouts,
  revenueSummary,
  formatCents,
} from "@/lib/billing/revenue";
import { membershipSummary, unclaimedPending } from "@/lib/db/memberships";
import { allPostsForModeration, posterStats } from "@/lib/db/overheard";
import { recentHelpMessages } from "@/lib/db/help";
import { surveyResults, type Tally } from "@/lib/db/survey";
import { commentCountsByScene, recentSceneComments } from "@/lib/db/comments";
import {
  followerCount,
  followerSources,
  recentFollowers,
} from "@/lib/db/followers";
import { getVideo } from "@/lib/content/videos";
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
  const [help, survey, sceneComments, commentCounts, revenue, abandoned] =
    await Promise.all([
      recentHelpMessages(20),
      surveyResults(25),
      recentSceneComments(30),
      commentCountsByScene(),
      revenueSummary(),
      abandonedCheckouts(),
    ]);
  const [listSize, listSources, list, pending] = await Promise.all([
    followerCount(),
    followerSources(),
    recentFollowers(200),
    unclaimedPending(),
  ]);
  const unreadComments = sceneComments.filter((c) => !c.handled).length;

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

  // Head COUNT comes from the local table — it is the access record and it is
  // one query. Head count is all it can honestly answer: the table stores tier
  // and status and no amount, so the money below comes from Stripe instead.
  const withAccess = members
    .filter((m) => ["active", "trialing", "past_due"].includes(m.status))
    .reduce((n, m) => n + m.n, 0);

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

        {/* --------------------------------------------------------- funnel */}
        {/*
          THE WHOLE POINT OF THIS PANEL is that Clerk and Stripe count
          different things and neither one answers "how is this going".
          Clerk holds accounts, Stripe holds subscriptions, and reading either
          alone gave a number that looked like customers and was not: six
          accounts against one real payer. Every step below is on one line, in
          the order a person actually moves through it, so there is nothing
          left to cross-reference.
        */}
        <Section title="How it's going">
          <div className="flex flex-wrap gap-8">
            <Stat
              label="Accounts"
              value={signups === null ? "—" : String(signups)}
            />
            <Stat
              label="Reached checkout"
              value={
                revenue ? String(revenue.members + abandoned.length) : "—"
              }
            />
            <Stat
              label="Paying"
              value={revenue ? String(revenue.paying) : "—"}
            />
            <Stat
              label="MRR"
              value={revenue ? formatCents(revenue.mrrCents) : "—"}
            />
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone">
            An account is free and costs nothing to make, so &ldquo;accounts&rdquo;
            will always be the biggest number here and is not a measure of
            anything on its own. The step that matters is the one from
            checkout to paying.
          </p>

          {abandoned.length > 0 && (
            <>
              <p className="mt-6 text-xs uppercase tracking-[0.14em] text-stone-dim">
                Reached the payment page and stopped
              </p>
              <ul className="mt-3 divide-y divide-hairline border-t border-hairline">
                {abandoned.map((person) => (
                  <li
                    key={person.email ?? person.at.toISOString()}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm"
                  >
                    <span className="text-ivory">
                      {person.email ?? "no email recorded"}
                    </span>
                    <span className="text-xs text-stone-dim">
                      {person.at.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {person.stillOpen && (
                        <span className="ml-2 text-amber-soft">
                          still payable
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-stone-dim">
                Read from Stripe, not Clerk — a Checkout Session keeps the
                email whether or not the account still exists, so deleting
                someone from Clerk does not erase the fact that they nearly
                bought. &ldquo;Still payable&rdquo; means Stripe has not expired
                that session yet and it could turn into a sale on its own.
              </p>
            </>
          )}
        </Section>

        {/* ---------------------------------------------------------- money */}
        <Section title="Members">
          <div className="flex flex-wrap gap-8">
            <Stat label="With access" value={String(withAccess)} />
            <Stat
              label="Paying"
              value={revenue ? String(revenue.paying) : "—"}
            />
            <Stat
              label="MRR"
              value={revenue ? formatCents(revenue.mrrCents) : "—"}
            />
            {/* Only shown when there is something to show: a zero "Comped" on a
                dashboard with no comps is noise. */}
            {revenue && revenue.comped > 0 && (
              <Stat label="Comped" value={String(revenue.comped)} />
            )}
            {revenue && revenue.trialing > 0 && (
              <Stat label="On trial" value={String(revenue.trialing)} />
            )}
            {revenue && revenue.pastDue > 0 && (
              <Stat label="Card failing" value={String(revenue.pastDue)} warn />
            )}
          </div>

          {/* The gap between the headline number and list price, spelled out.
              This line is the whole reason the section was rewritten: an $8
              MRR against two members reads like a bug until it says why. */}
          {revenue &&
            (revenue.comped > 0 || revenue.discounted > 0) && (
              <p className="mt-4 text-sm text-stone">
                {formatCents(revenue.grossCents)} at list price;{" "}
                {formatCents(revenue.mrrCents)} actually billed.{" "}
                {revenue.comped > 0 &&
                  `${revenue.comped} ${revenue.comped === 1 ? "membership is" : "memberships are"} on a 100% coupon and ${revenue.comped === 1 ? "pays" : "pay"} nothing. `}
                {revenue.discounted > 0 &&
                  `${revenue.discounted} ${revenue.discounted === 1 ? "is" : "are"} discounted but still paying.`}
              </p>
            )}

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
            The money is read live from Stripe, net of coupons, with annual
            plans divided down to a month and trials counted as nothing until
            they convert. The tier list above it is the webhook&rsquo;s
            projection, so if the two disagree it is the webhook that is behind,
            not the billing. A dash means Stripe could not be reached.
          </p>
        </Section>

        {/* ------------------------------------------------------- the room */}
        {/* ARCHIVED 2026-08-10 — the moderation link is gone with it, since
            that page 404s now. The numbers stay: they are the record of what
            the room did while it was open, which is the evidence behind
            archiving it. */}
        <Section title="Overheard (archived)">
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
            That used to mean an address only ever arrived with a payment.{" "}
            <strong className="font-normal text-stone">
              Not any more — the list below is that step.
            </strong>{" "}
            Somebody interested but undecided can now hand you an address at
            the end of the survey or under a scene they just finished.
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

        {/* ------------------------------------------------ scene comments */}
        <Section title="What they said about the scenes">
          {sceneComments.length === 0 ? (
            <p className="mt-1 text-sm text-stone-dim">
              Nothing yet. The box appears under a scene once somebody has
              watched it to the end.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-8">
                <Stat label="Comments" value={String(sceneComments.length)} />
                <Stat
                  label="Unread"
                  value={String(unreadComments)}
                  warn={unreadComments > 0}
                />
                <Stat
                  label="Scenes talked about"
                  value={String(commentCounts.length)}
                />
              </div>

              {commentCounts.length > 1 && (
                <p className="mt-4 text-xs leading-relaxed text-stone-dim">
                  Most written about:{" "}
                  {commentCounts.slice(0, 5).map((c, i) => (
                    <span key={c.sceneSlug}>
                      {i > 0 && " · "}
                      <span className="text-stone">
                        {getVideo(c.sceneSlug)?.title ?? c.sceneSlug}
                      </span>{" "}
                      {c.count}
                    </span>
                  ))}
                </p>
              )}

              <ul className="mt-5 divide-y divide-hairline">
                {sceneComments.map((c) => (
                  <li
                    key={c.id}
                    className={`py-4 ${c.handled ? "opacity-45" : ""}`}
                  >
                    <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      <Link
                        href={`/watch/${c.sceneSlug}`}
                        className="font-semibold text-ivory underline decoration-hairline underline-offset-4"
                      >
                        {getVideo(c.sceneSlug)?.title ?? c.sceneSlug}
                      </Link>
                      <span className="text-xs text-stone-dim">
                        {c.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      {/* Whether they had seen the whole thing when they
                          wrote it — it changes what the words mean. */}
                      <span className="text-[0.6875rem] uppercase tracking-wide text-stone-dim">
                        {c.wasMember ? "saw all of it" : "preview only"}
                      </span>
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-stone">
                      {c.body}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>

        {/* --------------------------------------------------------- survey */}
        {/* PAID, NO ACCOUNT YET — the one queue that needs a person.

            Since 2026-08-27 checkout runs before sign-up, so there is a window
            where somebody has paid and has no account. Almost always it lasts
            seconds and closes itself; a row that sits here for a day means
            somebody paid and walked off before making one.

            Nothing is broken when that happens — the membership is held
            against the email and attaches itself the moment they ever sign in
            with it — but they cannot watch anything until they do, and they
            paid. That is worth an email from Melissa rather than a wait. */}
        {pending.length > 0 && (
          <Section title="Paid, no account yet">
            <p className="mt-1 text-sm text-stone">
              These people have paid and have not made an account, so they
              cannot open anything yet. It attaches itself the moment they sign
              in with the same address — but if one has been sitting here for a
              day, write to them.
            </p>
            <ul className="mt-5 space-y-1.5">
              {pending.map((p) => (
                <li
                  key={p.email}
                  className="flex flex-wrap items-baseline gap-x-3 text-sm"
                >
                  <span className="text-ivory">{p.email}</span>
                  <span className="text-xs text-stone-dim">
                    {p.tier} ·{" "}
                    {p.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* THE LIST, and the number worth watching weekly.

            It sits above the survey because at this size it is the more useful
            of the two: the survey says what people think, and this says who can
            be told when there is something new. One of those compounds.

            ADDRESSES ARE SHOWN IN FULL AND IN ONE BLOCK, on purpose. This page
            is owner-only, and the job it has to support is "paste them into
            the mail provider and write to them" — a paginated table with a
            copy button per row would be a worse tool for the only task anybody
            does here. */}
        <Section title="The list">
          {listSize === 0 ? (
            <p className="mt-1 text-sm text-stone-dim">
              Nobody on it yet. The ask appears at the end of the survey and
              under a scene once it has finished playing.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-8">
                <Stat label="On the list" value={String(listSize)} />
                {listSources.map((row) => (
                  <Stat
                    key={row.source}
                    label={
                      row.source === "survey"
                        ? "From the survey"
                        : row.source === "scene"
                          ? "After a scene"
                          : row.source
                    }
                    value={String(row.count)}
                  />
                ))}
              </div>

              <p className="mt-6 text-sm text-stone">
                Every address, newest first. Nothing is ever sent from this
                site — write to them from your mail provider, and only when
                there is something to say.
              </p>
              <textarea
                readOnly
                rows={6}
                aria-label="Every address, comma separated"
                value={list.map((f) => f.email).join(", ")}
                className="mt-3 w-full resize-y rounded-lg border border-hairline bg-void px-4 py-3 font-mono text-xs leading-relaxed text-ivory focus:border-amber focus:outline-none"
              />

              <ul className="mt-6 space-y-1.5">
                {list.slice(0, 30).map((f) => (
                  <li
                    key={f.email}
                    className="flex flex-wrap items-baseline gap-x-3 text-sm"
                  >
                    <span className="text-ivory">{f.email}</span>
                    <span className="text-xs text-stone-dim">
                      {f.source.startsWith("scene:")
                        ? getVideo(f.source.slice(6))?.title ?? f.source
                        : f.source}
                      {" · "}
                      {f.createdAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
              {list.length > 30 && (
                <p className="mt-3 text-xs text-stone-dim">
                  Showing the newest 30 of {list.length}. All of them are in the
                  box above.
                </p>
              )}
            </>
          )}
        </Section>

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
