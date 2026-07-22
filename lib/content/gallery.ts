/**
 * Still galleries — sets of images from an event in Luna's world, displayed as
 * navigable "projections" on a room's wall (an in-world art gallery).
 *
 * Source stills live in public/stills/<event>/ (large originals, gitignored).
 * Optimized web copies live in public/gallery/<event>/NN.jpg and are committed.
 */

import type { AccessLevel } from "@/lib/content/videos";
import type { FeelingId, PlaceId } from "@/lib/content/taxonomy";

export interface StillGallery {
  /** Matches the source stills folder name. */
  id: string;
  title: string;
  subtitle: string;
  /** Optimized web image paths under /public, in display order. */
  images: string[];
  /** Compressed cover used as the catalog card image. */
  cover: string;
  /** Emotional context — how this set is browsed in the catalog. */
  feelings: FeelingId[];
  /** Where in the world it happens. */
  place: PlaceId;
  access: AccessLevel;
  mature: boolean;
}

function seq(event: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/gallery/${event}/${String(i + 1).padStart(2, "0")}.jpg`,
  );
}

export const galleries: StillGallery[] = [
  {
    id: "josh-luna-dinner",
    title: "Dinner",
    subtitle: "Josh & Luna",
    images: seq("josh-luna-dinner", 14),
    cover: "/gallery/josh-luna-dinner/cover.jpg",
    feelings: ["trust", "desire"],
    place: "farmhouse",
    access: "free",
    mature: false,
  },
];

export function getGallery(id: string): StillGallery | undefined {
  return galleries.find((g) => g.id === id);
}
