/**
 * Vertical clips — the 9:16 cuts that ran on Instagram.
 *
 * A separate content kind rather than more entries in lib/content/videos.ts,
 * for two concrete reasons:
 *
 *   1. Shape. They are portrait. Dropped into a 16:9 rail they would either be
 *      pillarboxed into a sliver or cropped to nonsense, and every layout that
 *      touches them wants to know their aspect up front.
 *   2. Access. Most of them ran publicly on Instagram, so there is nothing
 *      left to gate — putting those behind the LunaVerse would be selling
 *      something anybody can already scroll past for free, which
 *      docs/monetization/MONETIZATION.md exists to prevent. But not all of
 *      them are the social cuts. Anything explicit was never on Instagram
 *      (it wouldn't have passed their rules), so it carries its own access
 *      and its own rating — see `access` and `explicit` below.
 *
 * Which camera export each one came from is recorded in
 * scripts/import-clips.sh, identified by frames at 15/45/75% of runtime.
 *
 * PLACEHOLDER: titles and captions were written from the footage, not from the
 * original Instagram posts. If those captions still exist, they are the real
 * copy and should replace these.
 */

import type { ContentNoteId } from "@/lib/content/content-notes";
import type { PersonId } from "@/lib/content/taxonomy";
import type { AccessLevel } from "@/lib/content/videos";

export interface Clip {
  /** Stable id — appears in /clips/<id>. Do not rename casually. */
  id: string;
  title: string;
  /** One line, the way a caption reads. PLACEHOLDER. */
  caption: string;
  /** Proxy basename inside stories/, served through the gated stream route. */
  file: string;
  /** Portrait poster under /public. */
  poster: string;
  durationSeconds: number;
  /**
   * The day this clip went up, ISO `YYYY-MM-DD`. THE INDEX IS SORTED BY IT,
   * newest first (Melissa, 2026-09-01: "keep the latest at the top. so the
   * latest should show first").
   *
   * Only set on clips published since the field existed. An undated clip is
   * treated as older than every dated one, which is true, and they hold their
   * authored order among themselves — so nothing had to be back-filled by
   * guesswork. Same rule and same reasoning as `Video.addedOn`.
   */
  addedOn?: string;
  /** Who's in it. */
  about: PersonId[];
  mature: boolean;
  /**
   * Explicit / X-rated — a stronger signal than `mature`, which reads as
   * "intimate" but not graphic. An explicit clip states so before it plays,
   * never autoplays, and its poster is withheld on the public grid. Explicit
   * implies mature; the badge shows "Explicit" in place of it.
   */
  explicit?: boolean;
  /**
   * Free unless stated. A gated clip streams only to members, and its poster
   * is locked on the index — the whole point of gating a sex scene is that a
   * signed-out visitor can't see it, which includes the still frame.
   */
  access?: AccessLevel;
  /** See lib/content/content-notes.ts. A clip carrying one does not autoplay. */
  notes?: ContentNoteId[];
  /**
   * When this clip is a preview of a longer scene, that scene's slug. Lets the
   * clip page say what the full thing is and where it lives, instead of leaving
   * a visitor to guess that thirty seconds is all there is.
   */
  fullSceneSlug?: string;
}

/** A clip's effective access. Free is the default, so entries stay terse. */
export function clipAccess(clip: Clip): AccessLevel {
  return clip.access ?? "free";
}

const authored: Clip[] = [
  {
    id: "run-at-the-lake",
    title: "Run",
    caption: "Six miles, headphones in, nobody to talk to. Her favorite hour.",
    // Trimmed 2026-08-10 at 100.5s, from 103.7. What came off was 1.0s of
    // black and 1.8s of screen-recorded editing-app UI that had ridden along
    // on the export. Her end card is untouched, and the audio had already
    // faded to digital silence by 100.6 — so the cut needed no fade and the
    // trim is a stream copy, with no re-encode and no quality lost.
    file: "run-at-the-lake.proxy.mp4",
    poster: "/posters/run-at-the-lake.jpg",
    durationSeconds: 101,
    about: ["luna"],
    // The one clip in the set that isn't intimate. Flagging a woman going for
    // a run as mature would drain the label of the meaning it needs to carry
    // on the six below it.
    mature: false,
  },
  {
    id: "apartment-window",
    title: "The Apartment",
    caption: "A city night, and a conversation that doesn't stay a conversation.",
    file: "apartment-window.proxy.mp4",
    poster: "/posters/apartment-window.jpg",
    durationSeconds: 99,
    about: ["luna", "tyson"],
    mature: true,
  },
  {
    id: "close-quarters",
    title: "Close Quarters",
    caption: "Not enough room in it to pretend.",
    file: "close-quarters.proxy.mp4",
    poster: "/posters/close-quarters.jpg",
    durationSeconds: 52,
    about: ["luna", "tyson"],
    mature: true,
  },
  {
    id: "still-awake",
    title: "Still Awake",
    caption: "Long past the hour either of them meant to stop.",
    file: "still-awake.proxy.mp4",
    poster: "/posters/still-awake.jpg",
    durationSeconds: 213,
    about: ["luna", "tyson"],
    mature: true,
    // A sex scene: gated to members, rated explicit, poster withheld.
    explicit: true,
    access: "premium",
  },
  {
    id: "morning-after",
    title: "The Morning After",
    caption: "Nobody says anything, and it isn't awkward, which is its own problem.",
    file: "morning-after.proxy.mp4",
    poster: "/posters/morning-after.jpg",
    durationSeconds: 152,
    about: ["luna", "josh"],
    mature: true,
  },
  {
    // The free preview of "The Beach" (lib/content/videos.ts), which is
    // members-only and 4m44s. Deliberately the Luna-weighted cut: 18s of her
    // alone before anything happens, so what it withholds IS the pitch.
    //
    // LICENSING: built from luna-josh-beach-color.mp4, NOT from
    // luna-josh-beach-sound.mov. That file has a commercially released song
    // mixed into it, and this is a paid product — see stories/trailer/build.sh,
    // which sets the rule: Melissa's own music, nothing licensed. The audio
    // here is the master's own location sound.
    id: "beach-preview",
    title: "The Beach",
    caption:
      "Thirty seconds of an evening that runs nearly five minutes. The rest is in the LunaVerse.",
    file: "beach-preview.proxy.mp4",
    poster: "/posters/beach-preview.jpg",
    durationSeconds: 30,
    about: ["luna", "josh"],
    mature: true,
    fullSceneSlug: "luna-josh-beach",
  },
  {
    // The 9:16 of The Bolt, scored. Named for the line it turns on, which is
    // also the line her journal entry and Josh's set note both quote — the
    // three pieces say the same four words and arrive at different places.
    //
    // Free, and the best thing on the site to put in front of a stranger:
    // it is 58 seconds, it needs no context, and somebody wins something.
    id: "one-more",
    title: "One More",
    caption:
      "She can't shift it and she's done arguing about it. He doesn't take the wrench off her.",
    file: "one-more.proxy.mp4",
    poster: "/posters/one-more.jpg",
    durationSeconds: 58,
    about: ["luna", "josh"],
    mature: false,
  },
  {
    // Free, like the rest of the social cuts. It reads as a mood piece rather
    // than a turn, and it is the shortest route a stranger has to Tyson —
    // which is what the character pages need most.
    id: "discipline",
    title: "Discipline",
    caption:
      "The sign on his wall has been there for years. He has never once mentioned it.",
    file: "discipline.proxy.mp4",
    poster: "/posters/discipline.jpg",
    durationSeconds: 87,
    about: ["luna", "tyson"],
    mature: true,
  },
  {
    id: "said-out-loud",
    title: "Said Out Loud",
    caption: "The sentence she'd been carrying around for a month.",
    file: "said-out-loud.proxy.mp4",
    poster: "/posters/said-out-loud.jpg",
    durationSeconds: 69,
    about: ["luna"],
    mature: true,
  },
  {
    // THE ONLY PLACE ON THE SITE SHE LOOKS LIKE THIS WITH JOSH, and that is
    // the entire reason to publish it. Melissa, 2026-09-01: she was helping
    // him out on the farm, it starts to pour on the way back, "their edges
    // soften on the way back... she does smile with Josh."
    //
    // Everything else in the Josh material is the charming-then-controlling
    // arc, and a reader who has only met him through the journal has no
    // working picture of why she stayed for ten years. Three minutes of the
    // two of them soaked and laughing on a farm road answers that without
    // arguing about it — and it makes the rest of the arc land harder, because
    // you cannot lose something you were never shown.
    //
    // Trimmed at 186.4s from a 193.0s export: blackdetect puts 6.6s of black
    // on the end. That needed a new `end` argument on optimize-media.sh's
    // `vertical` branch, which had never had one.
    id: "luna-josh-rain",
    title: "Caught Out",
    caption:
      "Helping him on the farm, and the sky opens on the way back. Neither of them runs for cover.",
    file: "luna-josh-rain.proxy.mp4",
    poster: "/posters/luna-josh-rain.jpg",
    durationSeconds: 186,
    addedOn: "2026-09-01",
    about: ["luna", "josh"],
    // Kissing in the rain, both fully dressed the whole way through, nothing
    // shown. `mature` on this set means intimate rather than graphic, and this
    // is a couple soaked on a farm road — closer to `run-at-the-lake` than to
    // the six below it. Melissa's to overrule.
    mature: false,
  },
];

/**
 * The clips, NEWEST FIRST.
 *
 * Sorted here rather than in the page, because array order is not only what the
 * index renders — clipNeighbours() reads it for the prev/next controls in the
 * player. Sorting in one place and leaving the other alone would have the
 * arrows walking a different sequence from the grid the visitor just came from.
 *
 * The sort is stable, so undated clips keep the order they are written in above
 * and sit below every dated one. That means adding a clip does NOT require
 * putting it in the right place by hand: give it an `addedOn` and it lands on
 * top by itself.
 */
export const clips: Clip[] = [...authored].sort((a, b) => {
  if (a.addedOn && b.addedOn) return b.addedOn.localeCompare(a.addedOn);
  if (a.addedOn) return -1;
  if (b.addedOn) return 1;
  return 0;
});

/**
 * How long a new clip is featured on the home page. Melissa, 2026-09-01:
 * "feature it on the home page for 7 days too."
 *
 * Seven rather than the fourteen `isRecent` gives a scene, and deliberately: a
 * scene is the product and a clip is an advert for it, so the clip's turn on
 * the front page should be the shorter one. It also means the section is
 * genuinely intermittent, which is what stops it reading as furniture.
 */
const FEATURE_DAYS = 7;

/** True while a clip is inside its window on the home page. */
export function isFeatured(clip: Clip, now: Date = new Date()): boolean {
  if (!clip.addedOn) return false;
  const days = (now.getTime() - new Date(clip.addedOn).getTime()) / 86_400_000;
  return days <= FEATURE_DAYS;
}

/**
 * The clip to feature, or undefined when there isn't one.
 *
 * SELF-EXPIRING BY DESIGN. Nothing has to be remembered or taken down: the
 * section renders while the newest clip is inside its seven days and vanishes
 * on its own afterwards. The home page is statically rendered with a one-hour
 * revalidate, so the disappearance lands within an hour of the deadline rather
 * than waiting for a deploy.
 *
 * Undated clips can never be featured, which is correct — they predate the
 * field and are not new.
 */
export function featuredClip(now: Date = new Date()): Clip | undefined {
  // clips is already newest-first, so the first dated one is the newest.
  const newest = clips.find((c) => c.addedOn);
  return newest && isFeatured(newest, now) ? newest : undefined;
}

export function getClip(id: string): Clip | undefined {
  return clips.find((c) => c.id === id);
}

/** The clip before and after this one, for prev/next in the player. */
export function clipNeighbours(id: string): {
  previous?: Clip;
  next?: Clip;
} {
  const at = clips.findIndex((c) => c.id === id);
  if (at === -1) return {};
  return { previous: clips[at - 1], next: clips[at + 1] };
}
