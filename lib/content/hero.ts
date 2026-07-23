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
  /**
   * When true, the hero IS the full thing — clicking play unmutes and plays it
   * in place, right in the hero, rather than sending the visitor to a watch
   * page. Used for the cast interview, which is content in its own right, not a
   * teaser for a scene elsewhere.
   */
  playInline?: boolean;
}

/**
 * When set, this slug is shown as the hero always, overriding the daily
 * rotation — used to feature one piece (the cast interview). Its loop and
 * poster live at /hero/<slug>.{mp4,jpg} like any hero, and its `video` is the
 * full thing (played inline). Set to null to return to the daily rotation.
 */
const PINNED_HERO_SLUG: string | null = "interview";

/** One full turn of the rotation. */
export const HERO_ROTATION_MS = 24 * 60 * 60 * 1000;

/**
 * Shift the changeover off midnight UTC to overnight in the US, the primary
 * audience. 00:00 UTC is 8pm Eastern / 5pm Pacific — mid-evening, so the new
 * hero appears while people are still up and the change reads as "same as I saw
 * earlier." Offsetting 7 hours moves the flip to 07:00 UTC (3am Eastern /
 * midnight Pacific), overnight on both coasts, so a full local day shows one
 * hero and it turns over while nobody's watching.
 */
const ROTATION_OFFSET_MS = 7 * 60 * 60 * 1000;

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
 * disagree with the next render. Whole days since the epoch, offset to the US
 * overnight (see ROTATION_OFFSET_MS), modulo the number of heroes — so adding a
 * fifth hero simply makes the cycle five days long.
 */
export function heroForTime(now: number = Date.now()): Hero | undefined {
  // A pinned hero overrides the rotation. Its video is played inline.
  if (PINNED_HERO_SLUG) {
    const video = getVideo(PINNED_HERO_SLUG);
    if (video) {
      return {
        slug: PINNED_HERO_SLUG,
        video,
        loop: `/hero/${PINNED_HERO_SLUG}.mp4`,
        poster: `/hero/${PINNED_HERO_SLUG}.jpg`,
        playInline: true,
      };
    }
  }

  const all = heroes();
  if (all.length === 0) return undefined;
  const day = Math.floor((now - ROTATION_OFFSET_MS) / HERO_ROTATION_MS);
  return all[day % all.length];
}

/** Milliseconds until the next rotation — used to bound page caching. */
export function msUntilNextHero(now: number = Date.now()): number {
  return (
    HERO_ROTATION_MS - ((now - ROTATION_OFFSET_MS) % HERO_ROTATION_MS)
  );
}
