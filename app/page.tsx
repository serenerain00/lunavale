import Image from "next/image";
import Link from "next/link";
import { RailItem, RAIL_ITEM_SIZES } from "@/components/browse/Rail";
import { Shelf } from "@/components/shelf/Shelf";
import { PAGE } from "@/components/ui/layout";
import { ClipCard } from "@/components/shelf/ClipCard";
import { Hero } from "@/components/home/Hero";
import { TrailerHero } from "@/components/home/TrailerHero";
import { FollowForm } from "@/components/follow/FollowForm";
import { SurveyDrawer } from "@/components/survey/SurveyDrawer";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Guest, Member, UnlessAnswered } from "@/components/access/Viewer";
import { pickHero } from "@/lib/content/hero";
import { BETWEEN_US } from "@/lib/content/between-us";
import { inStoryOrder } from "@/lib/content/chronology";
import { categories } from "@/lib/content/categories";
import { currentSeason, hasReleasedEpisode } from "@/lib/content/season";
import { characters } from "@/lib/content/characters";
import { galleries } from "@/lib/content/gallery";
import { freeEntries, opening } from "@/lib/content/journal";
import { clips as postList, clipPosterSrc, clipAccess, type Clip } from "@/lib/content/posts";
import { notes as setNotes, type SetNote } from "@/lib/content/between-takes";
import { formatPrice, getTier } from "@/lib/content/membership";
import {
  recentReleases,
  cadenceNote,
  formatReleaseDate,
} from "@/lib/content/releases";
import { formatDuration, videos as videosAll } from "@/lib/content/videos";
import { sceneOptions } from "@/lib/content/survey";

/**
 * The front page.
 *
 * REBUILT 2026-09-16, AND THE OLD SHAPE IS WORTH RECORDING because the new one
 * is a reaction to it. It was fifteen stacked editorial sections: the newest
 * clip, a featured post, a "lately" carousel, a free rail, the interview, five
 * things Luna wrote about herself, the three people it happens to, browse-by-
 * feeling, a pull quote, the journal, the newest locked pages, a members' rail,
 * a count of what is behind the door, the ask, and the follow form. Every one
 * of them was argued for and most of them were individually right. Together
 * they were an essay, and Melissa's verdict was the correct one: "it's very
 * text heavy… think hulu/netflix."
 *
 * SO IT IS NOW A HERO AND SOME SHELVES. That is not a lack of imagination, it
 * is the format people already know how to read. A visitor arriving from
 * Instagram has about four seconds to work out what this is and whether they
 * can watch it, and a shelf answers both at a glance in a way a paragraph
 * cannot. Everything cut is still on the site — it moved to /about, /journal,
 * /characters and /membership, which are the pages people go to when they want
 * that, rather than the page everybody lands on.
 *
 * THE ORDER OF THE SHELVES IS THE ARGUMENT:
 *
 *   Season 1   what you came for, even though it has not landed yet
 *   Clips      the story so far, in the order it happens — the reason to stay
 *   Posts      the short vertical cuts, which is what Instagram sent them for
 *   Journal    her side of it, and the thing nothing else has
 *   Cast       who these people are
 *   Set        how it gets made
 *   Join       once, at the end, after they have seen what they would get
 *
 * ONE MEMBERSHIP ASK. The old page made it three times before the fold and
 * again at the foot. CLAUDE.md rules out constant interruption, and a page
 * that sells between every row is not showing a library, it is running an
 * infomercial about one.
 *
 * STATIC, REVALIDATED HOURLY (2026-08-31, and preserved through the rebuild).
 * Nothing per-viewer is read during render. The labels that differ for a
 * member are <Member> / <Guest> pairs resolved on the client after the cached
 * HTML arrives — see components/access/Viewer.tsx, which also carries the
 * standing rule that nothing premium may be passed as children to <Member>.
 * Every real gate is server-side and untouched. This page was costing about
 * $118 a month in function invocations when it was dynamic; it is not going
 * back.
 */
export const revalidate = 3600;

/** How many cards a shelf shows before "See all" takes over. */
const SHELF_LIMIT = 14;

export default async function Home() {
  const hero = pickHero();
  const season = currentSeason();
  const episodeLanded = hasReleasedEpisode();
  const vault = getTier("vault")!;

  // The story, in the order it happens to her — see lib/content/chronology.ts.
  // NO COUNTS DERIVED FROM IT. There used to be three here feeding the
  // membership pitch; see the note on app/membership/page.tsx for why they
  // went.
  const story = inStoryOrder();

  // Art for an unreleased episode: the trailer's poster, because it is the only
  // image that is honestly about the thing being announced.
  const trailer = videosAll.find((v) => v.slug === "between-us-trailer-one");

  const openPages = freeEntries();

  // What has gone up lately, and how often — both derived, neither hand-kept.
  const fresh = recentReleases(12);
  const cadence = cadenceNote();

  return (
    <>
      <SiteHeader />

      <main className="flex-1 pb-24">
        {hero &&
          (hero.playInline ? <TrailerHero hero={hero} /> : <Hero hero={hero} />)}

        {/*
          THE BLURB, directly under the hero and deliberately one paragraph.
          Melissa: "theres a blurb below it." It answers the only three
          questions a stranger has — what is it, who is in it, and what can I
          watch right now — in plain sentences rather than the half-lines the
          old page was built out of.
        */}
        <section className={`${PAGE} pt-8 sm:pt-10`}>
          <p className="max-w-2xl text-lg leading-relaxed text-stone sm:text-xl">
            Luna and Josh were together ten years. They spent six months apart,
            and in those six months her oldest friend Tyson was the one who
            turned up. Then Josh called. Season one is coming, and the moments
            below are a look at what it is walking into.
          </p>
        </section>

        {/*
          -------------------------------------------------- between us band

          RESTORED 2026-09-17, AND RECORDING WHY IT WENT MISSING. This band was
          Melissa's explicit ask on 2026-09-03 — "I want new comers to see that
          membership doesnt unlock just stills/scenes, theyll have access to
          episodes as they are released" — and it was the first thing under the
          hero for two weeks. The 09-16 rebuild cut the home page from fifteen
          sections to a hero and shelves, and this went with them, which was a
          mistake: it is not an editorial section, it is the one place the site
          tells a stranger what a membership is FOR.

          The home page went from four membership links to one in that rebuild,
          and the one that was left is at the foot of a page that is now twelve
          shelves long. Between 09-15 and 09-17 not one checkout session was
          created in live Stripe, against sessions on eight of the thirteen
          days before it. That is not proof — the checkout code is fine and so
          is the Stripe config — but it is the only thing that changed, and a
          funnel is not something to leave thin on a hunch.

          It sits directly under the hero blurb, which is where it was, and
          reads straight into the Season 1 shelf below it.
        */}
        {BETWEEN_US.announced && (
          <section
            aria-labelledby="between-us-heading"
            className="mt-8 border-y border-hairline sm:mt-10"
          >
            <div
              className={`${PAGE} py-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10`}
            >
              <div className="lg:max-w-3xl">
                <p className="text-xs uppercase tracking-[0.2em] text-amber">
                  {BETWEEN_US.eyebrow}
                </p>
                <h2
                  id="between-us-heading"
                  className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-ivory sm:text-3xl"
                >
                  {BETWEEN_US.heading}
                </h2>
                {BETWEEN_US.body.map((line) => (
                  <p
                    key={line}
                    className="mt-2.5 max-w-2xl leading-relaxed text-stone"
                  >
                    {line}
                  </p>
                ))}
              </div>

              {/* Both variants ship in the cached HTML and the client shows
                  one — nothing premium is passed as children to <Member>. */}
              <div className="mt-5 shrink-0 lg:mt-0">
                <Guest>
                  <Link
                    href="/membership"
                    className="inline-flex min-h-12 items-center whitespace-nowrap rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                  >
                    {vault.cta}
                  </Link>
                  <p className="mt-2 text-xs text-stone-dim">
                    {`${BETWEEN_US.memberLine} From ${formatPrice(vault.priceMonthlyCents)} a month.`}
                  </p>
                </Guest>
                <Member>
                  <p className="max-w-xs text-sm leading-relaxed text-amber-soft">
                    {BETWEEN_US.memberNote}
                  </p>
                </Member>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------- season one */}
        <Shelf
          title={`Season ${season.number}`}
          note={
            episodeLanded
              ? undefined
              : "The first episode is on its way. Nothing here is a placeholder for it — the clips below are the story it comes out of."
          }
          /*
            THE ONE PLACE THE SEASON AND THE MEMBERSHIP ARE NAMED TOGETHER.
            Melissa: "people need to know they can watch the season if they're
            a member." The Season 1 row is where somebody is already looking at
            the thing they want, which is the only moment that sentence is
            information rather than an interruption — the ask at the foot of
            the page is a long way from here.

            Guest-only: a member reading "become a member" learns nothing and
            is being sold something they have bought. Both variants ship in the
            cached HTML and the client picks — see components/access/Viewer.tsx.
          */
          action={
            <Guest>
              <Link
                href="/membership"
                className="shrink-0 text-sm text-amber transition-colors duration-(--duration-quick) hover:text-amber-soft"
              >
                Watch it with a membership{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </Guest>
          }
        >
          {season.episodes.map((ep) => (
            <RailItem key={ep.number}>
              <ClipCard
                href={ep.slug ? `/clips/${ep.slug}` : "#"}
                title={ep.title ?? `Episode ${ep.number}`}
                poster={ep.poster ?? trailer?.poster ?? "/posters/hero.jpg"}
                meta={ep.runtimeSeconds ? formatDuration(ep.runtimeSeconds) : undefined}
                comingSoon={ep.comingSoon}
              />
            </RailItem>
          ))}
          {trailer && (
            <RailItem>
              <ClipCard
                href={`/clips/${trailer.slug}`}
                title="Trailer"
                poster={trailer.poster}
                meta={formatDuration(trailer.durationSeconds)}
              />
            </RailItem>
          )}
        </Shelf>

        {/* ------------------------------------------------------------- new */}
        {/*
          IS ANYTHING ACTUALLY HAPPENING HERE. This is the shelf that answers
          the question four of the first fourteen members left over, and it is
          the one row that has to be derived rather than curated — see
          lib/content/releases.ts. It cannot show something unpublished, it
          cannot miss something published, and it goes quiet on its own if the
          pace stops, which is the only way a claim about rhythm is worth
          making.

          It renders nothing at all when fewer than three things are dated
          inside the window, rather than standing there with a heading and one
          card under it.
        */}
        {fresh.length >= 3 && (
          <Shelf title="New" note={cadence}>
            {fresh.map((r) => (
              <RailItem key={r.href}>
                {r.poster ? (
                  <ClipCard
                    href={r.href}
                    title={r.title}
                    poster={r.poster}
                    meta={
                      r.durationSeconds
                        ? formatDuration(r.durationSeconds)
                        : undefined
                    }
                    premium={r.access === "premium"}
                    mature={r.mature}
                  />
                ) : (
                  <Link href={r.href} className="group block">
                    <div className="flex aspect-video flex-col justify-between rounded-lg bg-[#efe7d9] p-5 ring-1 ring-hairline transition-transform duration-(--duration-standard) group-hover:-translate-y-1">
                      <p className="font-hand text-lg leading-snug text-[#2a2520]">
                        {r.blurb}
                      </p>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#6b6156]">
                        {formatReleaseDate(r.date)}
                      </p>
                    </div>
                    <p className="mt-2.5 truncate text-sm text-ivory">
                      {r.title}
                    </p>
                  </Link>
                )}
              </RailItem>
            ))}
          </Shelf>
        )}

        {/* ----------------------------------------------------------- clips */}
        <Shelf
          title="Clips"
          href="/clips"
          note="A peek at what season one is walking into."
        >
          {story.slice(0, SHELF_LIMIT).map((v, i) => (
            <RailItem key={v.slug}>
              <ClipCard
                href={`/clips/${v.slug}`}
                title={v.title}
                poster={v.poster}
                meta={formatDuration(v.durationSeconds)}
                position={i + 1}
                premium={v.access === "premium"}
                mature={v.mature}
              />
            </RailItem>
          ))}
        </Shelf>

        {/* ------------------------------------------------------ categories */}
        {/*
          THE SAME 46 CLIPS, CUT EIGHT WAYS. One shelf in story order is a
          correct list and a thin front page — it gives a visitor exactly one
          reason to scroll, and if the first four posters do not land there is
          no second chance. Every row here is a predicate over the clip data
          (lib/content/categories.ts), so a new clip joins its rows the moment
          it is published and none of this is a second list to keep.

          A clip appearing in several rows is deliberate. "Luna & Tyson" and
          "The distance" are different questions and the same clip is a good
          answer to both; a front page is not a partition.
        */}
        {categories().map((c) => (
          <Shelf key={c.id} title={c.label} href={c.href} note={c.note}>
            {c.clips.map((v) => (
              <RailItem key={v.slug}>
                <ClipCard
                  href={`/clips/${v.slug}`}
                  title={v.title}
                  poster={v.poster}
                  meta={formatDuration(v.durationSeconds)}
                  premium={v.access === "premium"}
                  mature={v.mature}
                />
              </RailItem>
            ))}
          </Shelf>
        ))}

        {/* ----------------------------------------------------------- posts */}
        <Shelf
          title="Posts"
          href="/posts"
          note="The short vertical cuts, the same ones that go up on Instagram."
        >
          {postList.slice(0, SHELF_LIMIT).map((p: Clip) => (
            <RailItem key={p.id}>
              <ClipCard
                href={`/posts/${p.id}`}
                title={p.title}
                poster={clipPosterSrc(p)}
                meta={formatDuration(p.durationSeconds)}
                premium={clipAccess(p) === "premium"}
                mature={p.mature}
                portrait
              />
            </RailItem>
          ))}
        </Shelf>

        {/* --------------------------------------------------------- journal */}
        {/*
          HER PAGES, AS PAPER. A poster would be borrowed from a clip and would
          say "this is a video"; the sheet says "this is something she wrote",
          which is the whole difference and the reason the journal is worth
          having at all.
        */}
        <Shelf
          title="Her journal"
          href="/journal"
          note="What Luna wrote the same night, in her own words."
        >
          {openPages.map((e) => (
            <RailItem key={e.id}>
              <Link href={`/journal/${e.id}`} className="group block">
                <div className="flex aspect-video flex-col justify-between rounded-lg bg-[#efe7d9] p-5 ring-1 ring-hairline transition-transform duration-(--duration-standard) group-hover:-translate-y-1">
                  <p className="font-hand text-lg leading-snug text-[#2a2520]">
                    {opening(e, 110)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#6b6156]">
                    {e.dateline}
                  </p>
                </div>
                <p className="mt-2.5 truncate text-sm text-ivory">
                  {e.dateline}
                </p>
              </Link>
            </RailItem>
          ))}
        </Shelf>

        {/* ------------------------------------------------------------ cast */}
        <Shelf title="The cast" href="/characters">
          {characters.map((c) => (
            <RailItem key={c.id}>
              <Link href={`/characters/${c.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline">
                  <Image
                    src={c.portrait}
                    alt=""
                    fill
                    sizes={RAIL_ITEM_SIZES}
                    className="object-cover brightness-90 transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="font-display text-lg text-ivory">{c.name}</p>
                    <p className="text-sm text-stone">{c.role}</p>
                  </div>
                </div>
              </Link>
            </RailItem>
          ))}
        </Shelf>

        {/* ------------------------------------------------------- behind it */}
        <Shelf
          title="On set"
          href="/between-takes"
          note="Stills, and the notes from the days these were shot."
        >
          {galleries.slice(0, 8).map((g) => (
            <RailItem key={g.id}>
              <ClipCard
                href={`/gallery/${g.id}`}
                title={g.title}
                poster={g.cover}
                meta="Stills"
                premium={g.access === "premium"}
              />
            </RailItem>
          ))}
          {setNotes.slice(0, 4).map((n: SetNote) => (
            <RailItem key={n.id}>
              <Link href={`/between-takes/${n.id}`} className="group block">
                <div className="flex aspect-video flex-col justify-between rounded-lg border border-hairline bg-charcoal p-5 transition-transform duration-(--duration-standard) group-hover:-translate-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-amber">
                    From the set
                  </p>
                  <p className="font-display text-lg leading-snug text-ivory">
                    {n.heading}
                  </p>
                </div>
                <p className="mt-2.5 truncate text-sm text-ivory">{n.heading}</p>
              </Link>
            </RailItem>
          ))}
        </Shelf>

        {/* ------------------------------------------------------------ join */}
        {/*
          THE ONLY ASK ON THE PAGE, and it comes after seven shelves of what
          you would be paying for. The counts are read from the content modules
          rather than typed, so they cannot drift from what is really published
          — a number in a sales pitch that turns out to be wrong costs more than
          the pitch is worth.
        */}
        <section
          aria-labelledby="join-heading"
          className={`${PAGE} mt-16`}
        >
          <div className="rounded-xl border border-hairline p-7 sm:p-10">
            <Guest>
              <h2
                id="join-heading"
                className="max-w-2xl font-display text-2xl font-light leading-tight text-ivory sm:text-3xl"
              >
                Season one lands for members first.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
                Membership opens every clip at full length, all of
                Luna&rsquo;s journal, and the stills from the set. What&rsquo;s
                open to everyone stays open, always. It&rsquo;s{" "}
                {formatPrice(vault.priceMonthlyCents)} a month, and you can stop
                whenever you like.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/membership"
                  className="inline-flex min-h-12 items-center rounded-full bg-ivory px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white"
                >
                  Join for {formatPrice(vault.priceMonthlyCents)} a month
                </Link>
                <Link
                  href="/about"
                  className="inline-flex min-h-12 items-center rounded-full border border-hairline px-7 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                >
                  What this is
                </Link>
              </div>
            </Guest>

            <Member>
              <h2 className="max-w-2xl font-display text-2xl font-light leading-tight text-ivory sm:text-3xl">
                You&rsquo;re in. Season one comes to you first.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
                Every clip is open to you at full length, along with the
                journal and the stills from the set. The first episode will be
                here before it is anywhere else.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/clips"
                  className="inline-flex min-h-12 items-center rounded-full bg-ivory px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white"
                >
                  Start at the beginning
                </Link>
              </div>
            </Member>
          </div>
        </section>

        {/* ---------------------------------------------------------- follow */}
        <section className={`${PAGE} mt-6`}>
          <div className="rounded-xl border border-hairline p-7 sm:p-10">
            <h2 className="font-display text-xl font-light text-ivory sm:text-2xl">
              Know when episode one lands.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-stone">
              One email when there&rsquo;s something new. No account needed, and
              you can stop it in one click.
            </p>
            <div className="mt-6 max-w-md">
              <FollowForm
                source="home"
                label="Your email"
                note="One line from me when something new goes up, and nothing else."
                done="Done — I'll write when the next one lands."
              />
            </div>
          </div>
        </section>
      </main>

      {/*
        The survey still asks a question worth asking, but no longer the one
        about series-or-film — that is settled. See lib/content/survey.ts.
      */}
      <UnlessAnswered>
        <SurveyDrawer scenes={sceneOptions()} />
      </UnlessAnswered>
    </>
  );
}
