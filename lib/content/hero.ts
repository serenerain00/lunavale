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
 * The rotation, in order. Sequenced so consecutive days look different:
 * warm night interior, warm day interior, cool night exterior, green day
 * exterior. A visitor who comes back tomorrow should not think the page is
 * broken, or that it never changes.
 *
 * Every slug must exist in lib/content/videos.ts and have a matching pair of
 * files under public/hero/. `heroesWithScene()` drops any that don't, so a
 * half-finished addition degrades to a shorter rotation rather than a broken
 * page or a 404 background.
 */
export const HERO_SLUGS: string[] = [
  "luna-tyson-bar",
  "luna-josh-kitchen-kiss",
  "ty-luna-lake-fight",
  "ty-luna-farm-road",
];

export interface Hero {
  slug: string;
  /** The scene this loop was cut from — what the play button plays. */
  video: Video;
  /** Silent looping trailer, public (see the note in make-hero-loop.sh). */
  loop: string;
  /** First frame of the loop; also the whole hero when motion is reduced. */
  poster: string;
}

/** One full turn of the rotation. */
export const HERO_ROTATION_MS = 24 * 60 * 60 * 1000;

/** The rotation, with each slug resolved to its scene. Unknown slugs dropped. */
export function heroes(): Hero[] {
  return HERO_SLUGS.flatMap((slug) => {
    const video = getVideo(slug);
    if (!video) return [];
    return [
      {
        slug,
        video,
        loop: `/hero/${slug}.mp4`,
        poster: `/hero/${slug}.jpg`,
      },
    ];
  });
}

/**
 * Today's hero.
 *
 * Deterministic from the clock rather than random: the same request has to
 * produce the same hero on every server that handles it, or a visitor
 * refreshing would shuffle the page under themselves and any cached HTML would
 * disagree with the next render. Whole UTC days since the epoch, modulo the
 * rotation length — so it turns over at 00:00 UTC, and adding a fifth hero
 * simply makes the cycle five days long.
 */
export function heroForTime(now: number = Date.now()): Hero | undefined {
  const all = heroes();
  if (all.length === 0) return undefined;
  const day = Math.floor(now / HERO_ROTATION_MS);
  return all[day % all.length];
}

/** Milliseconds until the next rotation — used to bound page caching. */
export function msUntilNextHero(now: number = Date.now()): number {
  return HERO_ROTATION_MS - (now % HERO_ROTATION_MS);
}
