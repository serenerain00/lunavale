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
 * A hero that overrides the shuffle while it is set.
 *
 * MELISSA, 2026-09-15: "i need the trailer in the hero - with the option to
 * play it." The pool is nine scenes shuffled per request, so simply adding the
 * trailer to it would have put it in front of about one visitor in nine —
 * which is not what "in the hero" means a fortnight before a pilot drops.
 *
 * THE FILE ALREADY ARGUED AGAINST PINNING and the argument still holds: the
 * interview was pinned once, and it was removed because a front page that
 * shows everybody the same thing every day stops being a reason to come back.
 * That is a rule about the STEADY STATE. A trailer ahead of a launch is the
 * exception it was never written for, and it is temporary by construction.
 *
 * SET IT BACK TO null WHEN THE PILOT IS OUT. The trailer stays in HERO_SLUGS
 * and drops into the rotation on its own; nothing else has to change.
 */
const HERO_PIN: string | null = "between-us-trailer-one";

export function pickHero(): Hero | undefined {
  const all = heroes();
  if (all.length === 0) return undefined;
  if (HERO_PIN) {
    const pinned = all.find((h) => h.slug === HERO_PIN);
    // Falls through to the shuffle rather than showing nothing if the pin ever
    // names a slug that heroes() has dropped.
    if (pinned) return pinned;
  }
  return all[Math.floor(Math.random() * all.length)];
}
