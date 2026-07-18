/**
 * Still galleries — sets of images from an event in Luna's world, displayed as
 * navigable "projections" on a room's wall (an in-world art gallery).
 *
 * Source stills live in public/stills/<event>/ (large originals, gitignored).
 * Optimized web copies live in public/gallery/<event>/NN.jpg and are committed.
 */

export interface StillGallery {
  /** Matches the source stills folder name. */
  id: string;
  title: string;
  subtitle: string;
  /** Optimized web image paths under /public, in display order. */
  images: string[];
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
  },
];

export function getGallery(id: string): StillGallery | undefined {
  return galleries.find((g) => g.id === id);
}
