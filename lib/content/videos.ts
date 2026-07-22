/**
 * Video library — the structured source of truth for browsable/watchable scenes.
 *
 * This is content DATA, deliberately separate from presentation and access logic
 * (per CLAUDE.md engineering rules). The UI reads from here; it never hard-codes
 * titles, files, or access levels inline.
 *
 * NOTE: titles and descriptions below are PLACEHOLDER copy derived from filenames.
 * Melissa owns the real canon — replace `title`/`synopsis` with approved wording.
 * The `slug`, `file`, and `access` fields are load-bearing and should stay stable.
 */

import type { FeelingId, PlaceId } from "@/lib/content/taxonomy";

export type AccessLevel = "free" | "premium";

export interface Video {
  /** Stable identifier — used in URLs and to locate the media file. Do not rename casually. */
  slug: string;
  /** Display title. PLACEHOLDER — pending approved copy. */
  title: string;
  /** Short public-facing description. PLACEHOLDER. */
  synopsis: string;
  /** Basename of the media file inside `stories/` (proxy used for playback). */
  file: string;
  /** Poster image served from /public. */
  poster: string;
  /** Runtime in whole seconds (from ffprobe on the master). */
  durationSeconds: number;
  /** Whether this scene is publicly viewable or requires membership. */
  access: AccessLevel;
  /** Mature-content flag — surfaced as a label per content rules. */
  mature: boolean;
  /**
   * Emotional context — how this scene is browsed in the catalog. A scene can
   * carry more than one. PLACEHOLDER tagging pending Melissa's canon pass.
   */
  feelings: FeelingId[];
  /** Where in the world it happens. */
  place: PlaceId;
}

export const videos: Video[] = [
  {
    slug: "luna-josh-first-morning",
    title: "First Morning",
    synopsis:
      "A quiet farmhouse morning between Luna and Josh — the calm before everything shifts.",
    file: "luna-josh-first-morning.proxy.mp4",
    poster: "/posters/luna-josh-first-morning.jpg",
    durationSeconds: 143,
    access: "free",
    mature: false,
    feelings: ["trust", "desire"],
    place: "farmhouse",
  },
  {
    slug: "tyson-luna-lakehouse-fire",
    title: "Fireside",
    synopsis:
      "Late at the lakehouse firepit, Luna and Tyson circle the things they haven't said.",
    file: "tyson-luna-lakehouse-fire.proxy.mp4",
    poster: "/posters/tyson-luna-lakehouse-fire.jpg",
    durationSeconds: 281,
    access: "premium",
    mature: true,
    feelings: ["desire", "distance"],
    place: "lakehouse",
  },
  {
    slug: "tyson-park-fight",
    title: "The Park",
    synopsis:
      "A confrontation in the park breaks the surface of a rivalry that's been building for weeks.",
    file: "tyson-park-fight.proxy.mp4",
    poster: "/posters/tyson-park-fight.jpg",
    durationSeconds: 155,
    access: "premium",
    mature: true,
    feelings: ["hurt", "lies"],
    place: "park",
  },
];

export function getVideo(slug: string): Video | undefined {
  return videos.find((v) => v.slug === slug);
}

/** Format seconds as m:ss for display. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
