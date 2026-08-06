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
 * FREE SCENES ONLY (Melissa, 2026-08-05), and `heroes()` enforces it rather
 * than trusting this list. The rotation used to be luna-tyson-bar,
 * luna-josh-kitchen-kiss and ty-luna-farm-road — all three PREMIUM — so the
 * front page led with footage a visitor could not watch, under a play button
 * that opened a locked door. That is the worst possible first impression on a
 * page whose whole job is to make somebody want in.
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
  "interview",
  "luna-josh-fair",
  "luna-josh-coffee",
  "luna-cathy-phone",
  "luna-tyson-dance",
  "luna-avery-ipad",
  "josh-tyson-barn",
  "josh-luna-bolt",
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
}

/**
 * The interview used to be PINNED here, overriding the rotation entirely — so
 * the front page showed the same thing to everybody, every day. It is now just
 * one of the pool, and still plays inline when it comes up (see `playInline`).
 */
const PLAY_INLINE_SLUGS = new Set(["interview"]);

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
    if (video.access !== "free") return [];
    return [
      {
        slug,
        video,
        loop: `/hero/${slug}.mp4`,
        poster: `/hero/${slug}.jpg`,
        ...(PLAY_INLINE_SLUGS.has(slug) ? { playInline: true } : {}),
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
export function pickHero(): Hero | undefined {
  const all = heroes();
  if (all.length === 0) return undefined;
  return all[Math.floor(Math.random() * all.length)];
}
