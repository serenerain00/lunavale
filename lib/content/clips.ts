/**
 * Vertical clips — the 9:16 cuts that ran on Instagram.
 *
 * A separate content kind rather than more entries in lib/content/videos.ts,
 * for two concrete reasons:
 *
 *   1. Shape. They are portrait. Dropped into a 16:9 rail they would either be
 *      pillarboxed into a sliver or cropped to nonsense, and every layout that
 *      touches them wants to know their aspect up front.
 *   2. Access. They have already been published publicly on Instagram, so
 *      there is nothing left to gate. Putting them behind the Vault would be
 *      selling something anybody can already scroll past for free — which is
 *      the sort of thing docs/monetization/MONETIZATION.md exists to prevent.
 *
 * Which camera export each one came from is recorded in
 * scripts/import-clips.sh, identified by frames at 15/45/75% of runtime.
 *
 * PLACEHOLDER: titles and captions were written from the footage, not from the
 * original Instagram posts. If those captions still exist, they are the real
 * copy and should replace these.
 */

import type { PersonId } from "@/lib/content/taxonomy";

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
}

/** Every vertical clip is free — see the note above. */
export const CLIP_ACCESS = "free" as const;

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
  {
    id: "ty-luna-bed",
    title: "Nowhere To Be",
    caption: "A whole afternoon, and no reason to get up.",
    file: "ty-luna-bed.proxy.mp4",
    poster: "/posters/ty-luna-bed.jpg",
    durationSeconds: 210,
    about: ["luna", "tyson"],
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
