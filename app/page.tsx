import Image from "next/image";
import Link from "next/link";
import { CatalogCard } from "@/components/browse/CatalogCard";
import {
  Rail,
  RailItem,
  RAIL_ITEM_SIZES,
} from "@/components/browse/Rail";
import { Hero } from "@/components/home/Hero";
import { InterviewHero } from "@/components/home/InterviewHero";
import { Reveal } from "@/components/motion/Reveal";
import { SurveyDrawer } from "@/components/survey/SurveyDrawer";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { canWatch, getMembership } from "@/lib/access/entitlement";
import { catalog, shelves, type CatalogItem } from "@/lib/content/catalog";
import { pickHero } from "@/lib/content/hero";
import {
  entriesForScene,
  freeEntries,
  journal,
  latestEntries,
  opening,
  quoteOfTheDay,
} from "@/lib/content/journal";
import { getCharacter } from "@/lib/content/characters";
import { galleries } from "@/lib/content/gallery";
import { cadenceNote, recentReleases } from "@/lib/content/releases";
import { LatelyRail } from "@/components/home/LatelyRail";
import { takes } from "@/lib/content/takes";
import { formatPrice, getTier } from "@/lib/content/membership";
import {
  formatDuration,
  isRecent,
  latestScene,
  videos as videosAll,
} from "@/lib/content/videos";
import { ANSWERED_COOKIE, sceneOptions } from "@/lib/content/survey";
import { hasAnswered } from "@/lib/db/survey";
import { cookies } from "next/headers";

export default async function Home() {
  const { active: member } = await getMembership();

  const free = catalog.filter((item) => item.access === "free");
  const premium = catalog.filter((item) => item.access === "premium");
  const vault = getTier("vault")!;

  // Rotates daily. Resolved per request rather than at build time, so the
  // turnover doesn't wait for a deploy.
  // The journal line on the hinge below the hero. Rotates daily — see
  // quoteOfTheDay(). Resolved per request, like the hero.
  const quote = quoteOfTheDay();

  const hero = pickHero();
  const heroUnlocked = hero ? await canWatch(hero.video) : false;

  // The newest release, shown only while it is genuinely new — see isRecent.
  // When nothing has gone up in two weeks the section disappears rather
  // than keeping a "New" label on something that is not.
  const latest = latestScene();
  const showLatest = latest && isRecent(latest);
  // Her account of the same day, when there is one. The pairing is the single
  // most persuasive thing on the site — a scene and the page she wrote about
  // it — and until now the home page dropped it and made you find the journal
  // on your own.
  const latestEntry = latest ? entriesForScene(latest.slug)[0] : undefined;

  // THE NEWEST PAGES OF THE JOURNAL, members-only, shown to everybody.
  // Release order rather than story order — see latestEntries(). Empty until
  // something dated and gated exists, in which case the section does not
  // render at all rather than standing there with a heading and no pages.
  const newestPages = latestEntries(3);

  // THE RHYTHM. Derived from what is actually published; see
  // lib/content/releases.ts for why this is not a hand-kept list and why there
  // is no forward-looking schedule anywhere in it.
  const drops = recentReleases(12);
  const cadence = cadenceNote();

  // Nobody who has already answered gets asked again. Read server-side rather
  // than from document.cookie, so the band is simply absent from the HTML for
  // them instead of appearing and then vanishing once JavaScript catches up.
  // Counted from the content modules so the numbers cannot drift from what is
  // actually published — see the note on the depth section.
  const storyScenes = videosAll.filter((v) => !v.hidden);
  const scenesCount = storyScenes.length;
  const freeScenesCount = storyScenes.filter((v) => v.access === "free").length;
  const stillsCount = galleries.reduce((n, g) => n + g.count, 0);
  const takesCount = takes.reduce(
    (n, s) => n + s.beats.reduce((m, b) => m + b.takes.length, 0),
    0,
  );

  const jar = await cookies();
  const surveyAnswered = await hasAnswered(jar.get(ANSWERED_COOKIE)?.value ?? "");

  return (
    <>
      <SiteHeader member={member} />

      <main className="flex-1 pb-24">
        {hero &&
          (hero.playInline ? (
            <InterviewHero hero={hero} member={member} />
          ) : (
            <Hero hero={hero} member={member} unlocked={heroUnlocked} />
          ))}


        {/* ------------------------------------------------------------ survey */}
        {/* THE SECOND THING ON THE PAGE (Melissa, 2026-08-26). It used to sit
            tenth, under the rails, behind the paywall, and its own comment
            claimed it was "straight after the newest scene" — which had not
            been true for some time. Nobody scrolls that far to volunteer an
            opinion.

            The band is a door, not a form: the questions arrive in a panel
            that slides over the page, so answering costs nobody the page they
            came for. There is also a tab pinned to the edge of the screen
            (SurveyEdgeTab) that opens the same panel from anywhere further
            down, for the visitor who decides they have something to say only
            after they have watched something.

            ASKED BEFORE THEY HAVE SEEN ANYTHING, deliberately and with a cost.
            "Should this be a series?" is a better question after two scenes
            than before them, and it is Melissa's call that being asked at all
            beats being asked well and unread. The edge tab is the hedge: it
            follows them down the page and is still there once they have.

            Absent entirely once they have answered — no second ask, no
            dismissible banner that comes back. */}
        {!surveyAnswered && (
          <section className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
            <SurveyDrawer scenes={sceneOptions()} />
          </section>
        )}

        {/* -------------------------------------------------------- just added */}
        {/* THE NEWEST SCENE, big, and the first thing to watch. Under the
            hero and the ask, and above everything else, because "there is a
            new one and here it is" is the only claim on this page that is
            both true every week and interesting to a stranger. */}
        {showLatest && latest && (
          <section
            aria-labelledby="latest-heading"
            className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14"
          >
            <div className="overflow-hidden rounded-xl border border-hairline bg-charcoal/30 sm:grid sm:grid-cols-[1.1fr_1fr] sm:items-stretch">
              <Link
                href={`/watch/${latest.slug}`}
                className="group relative block aspect-video sm:aspect-auto sm:h-full"
              >
                <Image
                  src={latest.poster}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 45vw"
                  className="object-cover transition-transform duration-(--duration-slow) group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/70 to-transparent sm:bg-gradient-to-r" />
                <span className="absolute left-4 top-4 rounded-full bg-amber px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-void">
                  New
                </span>
              </Link>

              <div className="p-5 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-amber">
                  Just added
                </p>
                <h2
                  id="latest-heading"
                  className="mt-3 font-display text-2xl font-light text-ivory sm:text-3xl"
                >
                  {latest.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone">
                  <span className="tabular-nums">
                    {formatDuration(latest.durationSeconds)}
                  </span>
                  <span aria-hidden>·</span>
                  <span
                    className={
                      latest.access === "free" ? "text-stone" : "text-amber"
                    }
                  >
                    {latest.access === "free" ? "Free" : "Members"}
                  </span>
                </div>
                <p className="mt-3 max-w-md leading-relaxed text-stone">
                  {latest.synopsis}
                </p>

                <Link
                  href={`/watch/${latest.slug}`}
                  className="mt-6 inline-flex min-h-11 items-center gap-2.5 rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
                  </svg>
                  {latest.access === "free" ? "Watch it" : "Watch the opening"}
                </Link>

                {/* Says what a non-member actually gets, with the real number
                    rather than a vague "preview". */}
                {latest.access !== "free" && latest.preview && !member && (
                  <p className="mt-3 text-xs leading-relaxed text-stone-dim">
                    The first {formatDuration(latest.preview.durationSeconds)}{" "}
                    is open to everyone. The rest is part of the LunaVerse.
                  </p>
                )}

                {/* THE PAIR. A scene and the page she wrote about the same day
                    is the thing this site has that a video library does not,
                    and the home page used to make you go and find the second
                    half yourself. Rendered only when the entry exists — most
                    scenes have no journal page and a dead link would be worse
                    than no link. */}
                {latestEntry && (
                  <p className="mt-5 border-t border-hairline pt-4 text-sm leading-relaxed text-stone">
                    She wrote about the same day.{" "}
                    <Link
                      href={`/journal/${latestEntry.id}`}
                      className="text-ivory underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:decoration-ivory"
                    >
                      {latestEntry.dateline}
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------ lately */}
        {/* AND IT KEEPS HAPPENING. The card above says a new thing arrived;
            this row says they keep arriving, and those are different promises
            — a finished object is bought once, a rhythm is what a monthly
            subscription is actually for.

            EVERYTHING HERE IS DERIVED (lib/content/releases.ts). Nothing is
            hand-listed, so it cannot drift from what is really published, and
            it goes quiet on its own if the pace does. That last part is the
            point: a cadence claim that keeps rendering after the cadence stops
            is the one lie on this page anybody could catch.

            AND THERE IS NO SCHEDULE. No "next drop Friday", no countdown, no
            calendar. The site has no release calendar it can keep, and
            CLAUDE.md's rule against promising what we lack bites hardest on a
            promise about next week. Past tense only. */}
        {drops.length >= 4 && (
          <section
            aria-labelledby="lately-heading"
            className="mx-auto w-full max-w-4xl px-5 pt-16 sm:px-8 sm:pt-24"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2
                id="lately-heading"
                className="font-display text-2xl font-light text-ivory sm:text-3xl"
              >
                Lately
              </h2>
              {cadence && (
                <p className="text-xs uppercase tracking-[0.16em] text-amber">
                  {cadence}
                </p>
              )}
            </div>

            {/* THE RAIL, not a table (Melissa, 2026-08-25). The list this
                replaced was five columns of small text on a page whose entire
                argument is that this is a film — accurate, and reading like a
                changelog. A card leads with the picture and opens to the rest.

                Reusing components/browse/Rail so the catalog's carousel
                behavior — peeking card, edge scrims, arrows that vanish at
                the ends, drag, keyboard paging, reduced motion — is the same
                gesture here as everywhere else rather than a second one. */}
            <div className="mt-6">
              <LatelyRail drops={drops} label="Lately" />
            </div>
          </section>
        )}

        {/* ------------------------------------------------------- free scenes */}
        {/* THE FREE RAIL, and it now sits ABOVE the membership section rather
            than below it (2026-08-26). The old order asked for money and then
            showed what was free, which is the wrong way round in both
            directions: it prices the ask before the evidence, and it buries
            the scenes anybody can watch under the one section they cannot.

            The streaming grammar everyone already reads: a row of frames to
            pick from. */}
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
          {free.length > 0 && (
            <Row
              heading="Start here"
              blurb="Open to everyone, in full. No account needed."
              href="/browse"
              hrefLabel="All scenes"
              items={free}
              member={member}
            />
          )}
        </div>

        {/* ------------------------------------------------------------- three */}
        {/* WHO IT HAPPENS TO, once they have seen it happen. "Why should I
            care" answered before anything is asked for — a stranger cannot
            care about a cast list, but they can hold three faces and three
            facts.

            THE IMAGE PATHS COME FROM lib/content/characters.ts rather than
            being typed here, so there is one place a portrait is named and
            this page cannot drift from the character hub it links into. */}
        <section
          aria-labelledby="three-heading"
          className="mx-auto w-full max-w-4xl px-5 pt-16 sm:px-8 sm:pt-24"
        >
          <h2
            id="three-heading"
            className="font-display text-2xl font-light text-ivory sm:text-3xl"
          >
            It&rsquo;s about three people.
          </h2>
          <ul className="mt-8 grid grid-cols-3 gap-3 sm:gap-6">
            {[
              {
                id: "luna",
                line: "Ten years with Josh, six months apart, and she went back knowing exactly what she was going back to.",
              },
              {
                id: "josh",
                line: "Charming, commanding, and the thrill she can no longer quite separate from fear.",
              },
              {
                id: "tyson",
                line: "Her best friend of twenty years, who kept her alive through those six months and will not say the thing.",
              },
            ].map((p) => {
              const character = getCharacter(p.id)!;
              return (
                <li key={p.id}>
                  <Link
                    href={`/characters/${character.id}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline">
                      <Image
                        src={character.portrait}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 31vw, 280px"
                        className="object-cover brightness-90 transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-100"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                      <h3 className="absolute inset-x-0 bottom-0 p-3 font-display text-xl font-light leading-none text-ivory sm:p-5 sm:text-3xl">
                        {character.name}
                      </h3>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-stone sm:text-sm">
                      {p.line}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 max-w-2xl leading-relaxed text-stone">
            Nobody in it is lying to anybody except themselves, which is the
            part that takes a while to hurt.{" "}
            <Link
              href="/about"
              className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
            >
              The whole premise, in ninety seconds
            </Link>
          </p>
        </section>

        {/* ------------------------------------------------------------- moods */}
        <section
          aria-labelledby="feeling-heading"
          className="mx-auto w-full max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20"
        >
          <h2
            id="feeling-heading"
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            Or start from how it felt
          </h2>
          <p className="mt-2 max-w-lg leading-relaxed text-stone">
            Luna&rsquo;s world is filed by emotional context as much as by
            place. Pick the one you&rsquo;re in.
          </p>

          <Reveal className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {shelves().map((shelf) => (
              <Link
                key={shelf.feelingId}
                href={`/browse?feeling=${shelf.feelingId}`}
                data-reveal-item
                className="group relative flex aspect-[3/4] items-end overflow-hidden rounded-lg ring-1 ring-hairline"
              >
                <Image
                  src={shelf.items[0].poster}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover brightness-75 transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-105 group-hover:brightness-100"
                />
                {/* Scrim only where the label sits — the top two-thirds of the
                    frame stays as bright as the footage allows. */}
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 via-45% to-transparent" />
                <span className="relative p-3 font-display text-lg text-ivory">
                  {shelf.label}
                  <span className="block text-xs tabular-nums text-stone">
                    {shelf.items.length}
                  </span>
                </span>
              </Link>
            ))}
          </Reveal>
        </section>

        {/* --------------------------------------------------------- her voice */}
        {/* HER VOICE, and the hinge of the page. Above it is a film; from
            here down it is somebody's private life. One line, no card, no
            button — a page that has just shown you scenes and then hands you a
            sentence out of her diary is making a promise about what kind of
            place this is.

            IT USED TO BE THE SECOND THING ANYBODY SAW and it is now the
            eighth (2026-08-26). The old argument was that the writing is the
            hook; the problem was that a visitor who came to watch something
            met two blocks of prose before a single playable scene. It works
            better as the turn than as the opening — by here they have watched
            something and the diary is a door further in rather than a wall in
            front of the door.

            THE LINE SHUFFLES (Melissa, 2026-08-15) — it was one fixed sentence
            for weeks, which meant a returning visitor met the same greeting
            every time and stopped reading it. quoteOfTheDay() rotates through
            a hand-picked set daily; every one is from a FREE entry, so the
            link under it opens the whole page rather than a wall, and none of
            them gives away a turn. */}
        <section
          aria-labelledby="voice-heading"
          className="mx-auto w-full max-w-3xl px-5 pt-16 sm:px-8 sm:pt-24"
        >
          <h2 id="voice-heading" className="sr-only">
            From Luna&rsquo;s journal
          </h2>
          <blockquote className="text-balance font-display text-2xl font-light leading-[1.4] text-ivory sm:text-4xl sm:leading-[1.35]">
            &ldquo;{quote.line}&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-stone">
            Luna keeps a journal. She was not writing it for anyone.{" "}
            <Link
              href={`/journal/${quote.entryId}`}
              className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
            >
              Read that day
            </Link>
          </p>
        </section>

        {/* ----------------------------------------------------------- journal */}
        {/* And the pages themselves, straight under the line that came out of
            one of them. Free entries of Luna's hand are the strongest thing on
            this site that is not a scene. */}
        <section
          aria-labelledby="journal-heading"
          className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-amber">
                Her own hand
              </p>
              <h2
                id="journal-heading"
                className="mt-2 font-display text-2xl font-medium text-ivory sm:text-3xl"
              >
                Read from Luna&rsquo;s journal
              </h2>
              <p className="mt-2 max-w-lg leading-relaxed text-stone">
                What she wrote when nobody was going to read it. These few are
                free to read — the rest of the journal is part of the
                membership.
              </p>
            </div>
            <Link
              href="/journal"
              className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
            >
              The whole journal
            </Link>
          </div>

          <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {freeEntries()
              .slice(0, 3)
              .map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  data-reveal-item
                  className="group relative block overflow-hidden rounded-sm bg-paper shadow-[0_12px_34px_-12px_rgba(0,0,0,0.85)] transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(47,58,74,0.11) 21px 22px)",
                      backgroundPosition: "0 3.5rem",
                    }}
                  />
                  <div className="relative p-5">
                    <p className="font-hand text-xl leading-tight text-ink-soft">
                      {entry.dateline}
                    </p>
                    <p className="font-hand mt-3 line-clamp-4 text-xl leading-[1.4rem] text-ink">
                      {opening(entry, 150)}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-margin-rule/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#9a4b45]">
                      Free to read
                    </p>
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper-shade to-transparent"
                  />
                </Link>
              ))}
          </Reveal>
        </section>

        {/* ------------------------------------------------- the newest pages */}
        {/* THE NEW ENTRIES, LOCKED, directly under the free ones. Melissa,
            2026-08-30: the journal is the book people keep asking her for and
            are not going to get any other way, so the newest pages should be
            visible on the home page and should require joining to read.

            IT SITS UNDER THE FREE ROW ON PURPOSE. A visitor has just been
            handed three whole entries; the argument this row makes is "and
            there are new ones every week" rather than "here is a wall". Order
            matters — the same row above the free one would read as a toll gate
            before anybody has been given anything.

            THE CARD IS THE SAME PAPER as the free row, deliberately. The only
            differences are the badge and the page falling away into the dark
            at the bottom, which is the same gesture the locked entry page
            makes. A visitor learns one object here and meets it again when
            they click.

            THE OPENING LINE IS REAL AND IS GIVEN AWAY. Same call as
            LockedEntry in app/journal/[id]/page.tsx: enough of her handwriting
            to make its own case, and the honest version of a teaser — this is
            genuinely the first sentence of the page, not copy written to sell
            it.

            NO COUNTDOWN, NO SCARCITY. The pressure is that there is a great
            deal of her in here and it keeps arriving, which is true and stays
            true. MONETIZATION.md rules out the other kind. */}
        {newestPages.length > 0 && (
          <section
            aria-labelledby="newest-pages-heading"
            className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-amber">
                  Just written
                </p>
                <h2
                  id="newest-pages-heading"
                  className="mt-2 font-display text-2xl font-medium text-ivory sm:text-3xl"
                >
                  The newest pages
                </h2>
                <p className="mt-2 max-w-lg leading-relaxed text-stone">
                  {member
                    ? "The latest of her handwriting, yours as part of the LunaVerse."
                    : "The long ones — twenty years of her and Tyson, and what she only writes down at three in the morning. These are inside the LunaVerse."}
                </p>
              </div>
              <Link
                href={member ? "/journal" : "/membership"}
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                {member ? "The whole journal" : "Join to read them"}
              </Link>
            </div>

            <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {newestPages.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal/${entry.id}`}
                  data-reveal-item
                  className="group relative block overflow-hidden rounded-sm bg-paper shadow-[0_12px_34px_-12px_rgba(0,0,0,0.85)] transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(47,58,74,0.11) 21px 22px)",
                      backgroundPosition: "0 3.5rem",
                    }}
                  />
                  <div className="relative p-5 pb-10">
                    <p className="font-hand text-xl leading-tight text-ink-soft">
                      {entry.dateline}
                    </p>
                    <p className="font-hand mt-3 line-clamp-5 text-xl leading-[1.4rem] text-ink">
                      {opening(entry, 190)}
                    </p>
                  </div>
                  {/* The page falling away into the dark, not a cropped card —
                      the same gesture the locked entry page makes. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void via-void/85 to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3 py-1 text-xs text-amber-soft backdrop-blur-sm">
                      {member ? "Yours to read" : "Members only"}
                    </span>
                  </span>
                </Link>
              ))}
            </Reveal>
          </section>
        )}

        {/* -------------------------------------------------- in the lunaverse */}
        {/* THE MEMBERS' RAIL, immediately before the ask — real locked frames
            in the same grammar as the free row above, so what membership opens
            is a shelf a visitor has already learned to read rather than a
            list of promises. */}
        <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
          {premium.length > 0 && (
            <Row
              heading="In the LunaVerse"
              blurb={
                member
                  ? "Yours, as part of your membership."
                  : "Members see these in full — and the locked rooms they came from."
              }
              href={member ? "/browse" : "/membership"}
              hrefLabel={member ? "All scenes" : "What membership opens"}
              items={premium}
              member={member}
            />
          )}
        </div>

        {/* ------------------------------------------------------------- depth */}
        {/* WHAT IS ACTUALLY BEHIND THE DOOR, counted, and directly under the
            shelf it counts. Every number here is read from the content modules
            rather than typed, so it cannot drift into a lie the week after
            somebody publishes something.

            Countable depth rather than urgency: no timer, no "only today", no
            invented scarcity — the argument is simply that there is a great
            deal of her in here and most of it is not public. That is true, it
            stays true, and it is the one honest form of pressure available. */}
        <section
          aria-labelledby="depth-heading"
          className="mx-auto w-full max-w-4xl px-5 pt-16 sm:px-8 sm:pt-24"
        >
          <h2
            id="depth-heading"
            className="font-display text-2xl font-light text-ivory sm:text-3xl"
          >
            How much of her there is.
          </h2>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {[
              {
                n: journal.length,
                label: "journal entries",
                sub: `${freeEntries().length} of them open`,
              },
              {
                n: scenesCount,
                label: "scenes",
                sub: `${freeScenesCount} free in full`,
              },
              { n: stillsCount, label: "stills", sub: "from the rooms" },
              {
                n: takesCount,
                label: "takes",
                sub: "every attempt, kept",
              },
            ].map((s) => (
              <div key={s.label}>
                <dt className="font-display text-3xl font-light text-ivory tabular-nums sm:text-4xl">
                  {s.n}
                </dt>
                <dd className="mt-1 text-sm text-stone">
                  {s.label}
                  <span className="mt-0.5 block text-xs text-stone-dim">
                    {s.sub}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* -------------------------------------------------------- membership */}
        {/* THE ASK, LAST (2026-08-26). It used to sit in the middle of the
            page, above the free rail and above half the evidence for it. A
            price is easiest to say yes to at the end of the argument, not in
            the middle of it — by here a visitor has watched a scene, seen the
            rhythm, met the three of them, read a page of the journal and been
            shown the size of what is locked. */}
        {!member && (
          <section
            aria-labelledby="join-heading"
            className="relative mt-6 overflow-hidden border-y border-hairline sm:mt-10"
          >
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber">
                  Membership
                </p>
                <h2
                  id="join-heading"
                  className="mt-4 max-w-xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl"
                >
                  The rest of the house is behind one door.
                </h2>
                {/* Built as one string rather than JSX text around an
                    expression: JSX drops the whitespace either side of an
                    interpolation here, and "$8a month" is not a typo anyone
                    forgives on a page asking for money. */}
                <p className="mt-4 max-w-lg leading-relaxed text-stone">
                  {`The full scene library, the cuts that never go public, Luna’s journals, and the rooms you’ve already walked past without being able to open. From ${formatPrice(vault.priceMonthlyCents)} a month, cancel any time, and nothing that’s free today ever moves behind it.`}
                </p>
                {/* SUBTLE ON PURPOSE — Melissa asked for it "somewhere
                    subtle", and this is a home page, not a fundraiser. One
                    line, in the dim text, under the offer rather than in
                    place of it: a fact about where the money goes, not an
                    appeal. The full version lives on /membership. */}
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-dim">
                  It also pays for the next scene. This is made independently,
                  and memberships are what fund the ones still being shot.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  {/* CTA WORDING, per the strategy rewrite: name the outcome,
                      not the transaction. "See what it opens" describes a
                      product; this describes what happens to her. */}
                  <Link
                    href="/membership"
                    className="inline-flex min-h-12 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                  >
                    Read the rest of her
                  </Link>
                  <Link
                    href="/browse"
                    className="inline-flex min-h-12 items-center rounded-full border border-hairline px-7 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                  >
                    Keep looking around
                  </Link>
                </div>
              </div>

              {/* Real locked frames — showing what's behind the door rather
                  than describing it. Flex, not a fixed 3-column grid: with two
                  premium items a grid leaves a visible empty cell. Dimmed
                  enough to read as withheld, bright enough to still sell. */}
              <Reveal className="flex gap-2 sm:gap-3">
                {premium.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    data-reveal-item
                    className="relative aspect-[2/3] flex-1 overflow-hidden rounded-lg ring-1 ring-hairline"
                  >
                    <Image
                      src={item.poster}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 30vw, 200px"
                      className="object-cover brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/20 to-transparent" />
                    <span className="absolute inset-x-0 bottom-2.5 text-center text-[0.7rem] tracking-wide text-amber-soft">
                      Members
                    </span>
                  </div>
                ))}
              </Reveal>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

/** One landing-page rail. Same slider the catalog uses, so it behaves the same. */
function Row({
  heading,
  blurb,
  href,
  hrefLabel,
  items,
  member,
}: {
  heading: string;
  blurb: string;
  href: string;
  hrefLabel: string;
  items: CatalogItem[];
  member: boolean;
}) {
  const headingId = `row-${heading.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section aria-labelledby={headingId} className="mb-14 sm:mb-16">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-stone">
            {blurb}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
        >
          {hrefLabel}
        </Link>
      </div>

      <Reveal>
        <Rail label={heading}>
          {items.map((item) => (
            <RailItem key={item.id}>
              <CatalogCard
                item={item}
                unlocked={member}
                sizes={RAIL_ITEM_SIZES}
              />
            </RailItem>
          ))}
        </Rail>
      </Reveal>
    </section>
  );
}
