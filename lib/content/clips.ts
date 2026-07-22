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
 *      left to gate — putting those behind the Vault would be selling
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
}

/** A clip's effective access. Free is the default, so entries stay terse. */
export function clipAccess(clip: Clip): AccessLevel {
  return clip.access ?? "free";
}

export const clips: Clip[] = [
  {
    id: "run-at-the-lake",
    title: "Run",
    caption: "Six miles, headphones in, nobody to talk to. Her favourite hour.",
    file: "run-at-the-lake.proxy.mp4",
    poster: "/posters/run-at-the-lake.jpg",
    durationSeconds: 104,
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
    id: "said-out-loud",
    title: "Said Out Loud",
    caption: "The sentence she'd been carrying around for a month.",
    file: "said-out-loud.proxy.mp4",
    poster: "/posters/said-out-loud.jpg",
    durationSeconds: 69,
    about: ["luna"],
    mature: true,
  },
];

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
