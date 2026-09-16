/**
 * The landing hero, and which scene it belongs to.
 *
 * A hero is not decoration here: it is a twelve-second trailer cut from a real
 * scene, and the play button under it plays *that* scene. So a hero is
 * identified by nothing but the scene's slug — the loop, the poster and the
 * link target are all derived from it. There is no way to point the button at
 * something other than the footage the visitor is watching, because there is
 * no second field to get wrong.
 *
 * Loops are built by scripts/make-hero-loop.sh, which names its output for the
 * same slug. Adding a hero is: add a line to that script's HEROES list, run
 * it, add the slug here.
 *
 * Content DATA only — no React, no request state.
 */

import { getVideo, type Video } from "@/lib/content/videos";

/**
 * The pool the hero is drawn from.
 *
 * FREE SCENES, OR PREMIUM ONES WITH A PUBLIC PREVIEW, and `heroes()` enforces
 * it rather than trusting this list.
 *
 * The rule started out as free-only (Melissa, 2026-08-05). The rotation had
 * been luna-tyson-bar, luna-josh-kitchen-kiss and ty-luna-farm-road — all
 * three PREMIUM — so the front page led with footage a visitor could not
 * watch, under a play button that opened a locked door. That is the worst
 * possible first impression on a page whose whole job is to make somebody
 * want in.
 *
 * What changed on 2026-08-06 is that premium scenes got real previews. The
 * objection was never "premium" — it was the locked door, and a scene with a
 * preview does not have one: the play button lands on a page that plays a
 * genuine minute of the scene. So the test is now the door rather than the
 * price, which is why it reads `!video.preview` and not `access !== "free"`.
 * A premium scene with NO preview is still excluded, and still would be.
 *
 * Loops are built by scripts/make-hero-loop.sh, which crops every one to
 * exactly 1280x720, so "widescreen" is guaranteed by construction and not by
 * anyone remembering. Adding a hero is: add a line there, run it, add the slug
 * here.
 *
 * Every slug must exist in lib/content/videos.ts and have a matching pair of
 * files under public/hero/. `heroes()` drops any that don't, so a half-finished
 * addition degrades to a shorter pool rather than a broken page.
 */
export const HERO_SLUGS: string[] = [
  // The trailer, 2026-09-15. Also PINNED — see HERO_PIN below.
  "between-us-trailer-one",
  "interview",
  "luna-josh-fair",
  "luna-josh-coffee",
  "luna-cathy-phone",
  "luna-tyson-dance",
  "luna-avery-ipad",
  "josh-tyson-barn",
  "josh-luna-bolt",
  // The first members-only scene in the rotation (Melissa, 2026-08-09: "I just
  // want people to have a sneak peek"). Allowed by the preview rule above —
  // its play button opens a page that plays the first minute for anybody.
  "luna-tyson-casey-bar",

  // ─── 2026-09-16, with the switch to a newest-first hero. All five are
  // premium-with-a-preview, which the door rule above allows, and every loop
  // was cut from inside that clip's own public preview window — see the note
  // at the top of scripts/make-hero-loop.sh.
  "josh-luna-pool",
  "tyson-apt-thinking",
  "josh-ty-ricks-house",
  "luna-lkehouse-wine-shatter",
  "ty-luna-blonde-guy-bar",
];

export interface Hero {
  slug: string;
  /** The scene this loop was cut from — what the play button plays. */
  video: Video;
  /** Silent looping trailer, public (see the note in make-hero-loop.sh). */
  loop: string;
  /** First frame of the loop; also the whole hero when motion is reduced. */
  poster: string;
  /**
   * When true, the hero IS the full thing — clicking play unmutes and plays it
   * in place, right in the hero, rather than sending the visitor to a watch
   * page. Used for the cast interview, which is content in its own right, not a
   * teaser for a scene elsewhere.
   */
  playInline?: boolean;
  /**
   * The words over it. Only a `playInline` hero has its own — everything else
   * in the pool is a teaser for a scene and shares the site's front-door copy.
   *
   * IT LIVES HERE BECAUSE IT USED TO LIVE IN THE COMPONENT. The hero said
   * "Start with the cast, in their own words" and "Play the interview" as
   * literal strings, which was correct while the interview was the only thing
   * that played inline and became a lie the moment the trailer did. Copy that
   * describes a particular video belongs with that video.
   */
  copy?: HeroCopy;
}

export interface HeroCopy {
  kicker: string;
  headline: string;
  blurb: string;
  cta: string;
}

/** The site's front door, and the fallback for anything without its own. */
const DEFAULT_COPY: HeroCopy = {
  kicker: "An explorable cinematic universe",
  headline: "Enter the world of Luna.",
  blurb:
    "Start with the cast, in their own words \u2014 then step inside the world they made.",
  cta: "Play the interview",
};

const INLINE_COPY: Record<string, HeroCopy> = {
  interview: DEFAULT_COPY,
  "between-us-trailer-one": {
    kicker: "An explorable cinematic universe",
    headline: "Enter the world of Luna.",
    // Says what it is, when the thing it is advertising arrives, and that the
    // site is not a waiting room — the world is already open.
    blurb:
      "The first trailer for Between Us. The pilot lands this month \u2014 and the world it happens in is already here.",
    cta: "Play the trailer",
  },
};

/**
 * The interview used to be PINNED here, overriding the rotation entirely — so
 * the front page showed the same thing to everybody, every day. It is now just
 * one of the pool, and still plays inline when it comes up (see `playInline`).
 */
const PLAY_INLINE_SLUGS = new Set(["interview", "between-us-trailer-one"]);

/* The daily-rotation clock lived here: HERO_ROTATION_MS and a 7-hour offset
 * that moved the changeover to overnight in the US so a full local day showed
 * one hero. Removed 2026-08-05 with the rotation itself — the hero is shuffled
 * per request now, so there is no changeover to schedule and nothing to keep
 * two servers agreeing about. `msUntilNextHero` went with it; nothing imported
 * it. */

/**
 * The pool, with each slug resolved to its scene.
 *
 * DROPS ANYTHING THAT ISN'T FREE. This is the guarantee, not the list above: a
 * premium slug added to HERO_SLUGS by mistake silently does nothing instead of
 * putting a locked scene on the front page. Unknown slugs are dropped the same
 * way.
 */
export function heroes(): Hero[] {
  return HERO_SLUGS.flatMap((slug) => {
    const video = getVideo(slug);
    if (!video) return [];
    // The door, not the price — see the note on HERO_SLUGS.
    if (video.access !== "free" && !video.preview) return [];
    return [
      {
        slug,
        video,
        loop: `/hero/${slug}.mp4`,
        poster: `/hero/${slug}.jpg`,
        ...(PLAY_INLINE_SLUGS.has(slug)
          ? { playInline: true, copy: INLINE_COPY[slug] ?? DEFAULT_COPY }
          : {}),
      },
    ];
  });
}

/**
 * The hero for this request — picked at random from the pool.
 *
 * SHUFFLED, per Melissa (2026-08-05). This replaced a clock-derived daily
 * rotation, and the trade it makes is worth writing down because the old
 * comment argued the other side: a refresh now changes the hero. That was
 * previously treated as a bug ("shuffling the page under themselves"); it is
 * now the feature. Somebody landing from Instagram twice should see two
 * different scenes, because the point of the front page is to suggest there is
 * a lot in here.
 *
 * Random is only safe because this page is server-rendered per request. Do not
 * move the pick into a client component — the server would render one hero and
 * the client would hydrate a different one.
 */
/**
 * Which hero plays, and why it is the newest thing rather than a fixed one.
 *
 * IT WAS PINNED TO THE TRAILER from 2026-09-15. That was right for the week
 * before a launch and wrong the moment there was a launch to fill: a front
 * page that shows everybody the same thirty seconds every day stops being a
 * reason to come back, which is the rule the pin was a deliberate exception to.
 *
 * NOW IT LEADS WITH WHAT WENT UP MOST RECENTLY. Melissa, 2026-09-16: "we're
 * going to auto play the newest videos posted instead… netflix has their hero
 * auto play a clip from a series. i like that format, gets the visitors
 * attention right away." So the hero is the front page's answer to "is this
 * alive", and it answers it with the actual answer instead of a claim.
 *
 * FIVE, NOT ONE. "The newest video" would be a single clip sitting there until
 * the next one is cut, which is the pin again under a different name. The pool
 * is the five most recently added heroes and one is chosen per render, so the
 * page is both current and different on a second visit.
 *
 * THE TRAILER IS OUT OF THE POOL, deliberately — "we'll keep the trailer and
 * ep 1 thumbnails where they are". It is a card on the Season 1 shelf now, and
 * a trailer playing full-bleed above a shelf containing the same trailer was
 * showing it twice on one screen.
 *
 * A NEW CLIP DOES NOT ENTER THIS ON ITS OWN. It needs a loop built by
 * scripts/make-hero-loop.sh and its slug in HERO_SLUGS above — a hero loop is
 * permanently public and the span has to be chosen by a person, so that step
 * is a feature. Until then the clip is simply not in the pool and the hero
 * falls back to the next most recent, which is why this degrades quietly
 * rather than going blank.
 */

/** How many of the most recent heroes the rotation draws from. */
const RECENT_POOL = 5;

/** Never the hero: it is a card on the Season 1 shelf. */
const NOT_IN_HERO = new Set(["between-us-trailer-one"]);

/**
 * The pool, newest first.
 *
 * Undated heroes sort last rather than being dropped — every clip has an
 * `addedOn` since the 2026-09-15 back-fill, so this only matters if one is
 * ever added without a date, and the safe behaviour there is "still usable,
 * just not treated as new".
 */
export function recentHeroes(): Hero[] {
  return heroes()
    .filter((h) => !NOT_IN_HERO.has(h.slug))
    .sort((a, b) => (b.video.addedOn ?? "").localeCompare(a.video.addedOn ?? ""))
    .slice(0, RECENT_POOL);
}

export function pickHero(): Hero | undefined {
  const pool = recentHeroes();
  // Falls back to the whole set rather than showing nothing, in case every
  // recent hero is ever dropped by the door test in heroes().
  const all = pool.length > 0 ? pool : heroes();
  if (all.length === 0) return undefined;
  return all[Math.floor(Math.random() * all.length)];
}
