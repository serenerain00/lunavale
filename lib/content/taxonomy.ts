/**
 * Catalog taxonomy — the two axes visitors browse Luna's world by.
 *
 * FEELING is the emotional context of a piece of content (trust, hurt, lies…).
 * PLACE is where in the world it happens (farmhouse, lakehouse, park…).
 *
 * Content DATA only. Both lists are open sets: add entries as content lands.
 * Facets with no content are simply never rendered (see lib/content/catalog.ts),
 * so it is safe to declare a place or feeling before anything uses it.
 *
 * NOTE: the curatorial `blurb` lines are PLACEHOLDER copy. Melissa owns the
 * canon — replace the wording freely. The `id` values are load-bearing (they
 * appear in URLs and in content records) and should stay stable.
 */

export interface Feeling {
  /** Stable id — appears in ?feeling= URLs. Do not rename casually. */
  id: string;
  label: string;
  /** One curatorial line, shown as the shelf subtitle on /browse. */
  blurb: string;
}

export interface Place {
  /** Stable id — appears in ?place= URLs. Do not rename casually. */
  id: string;
  label: string;
  /** One curatorial line. */
  blurb: string;
  /**
   * Slug of the explorable environment for this place, when one exists
   * (lib/content/world.ts). Lets the catalog offer a way into the world.
   */
  environmentSlug?: string;
}

export const feelings = [
  {
    id: "trust",
    label: "Trust",
    blurb: "What they gave each other before they knew what it would cost.",
  },
  {
    id: "desire",
    label: "Desire",
    blurb: "The pull neither of them says out loud.",
  },
  {
    id: "distance",
    label: "Distance",
    blurb: "Two people in the same room, further apart than they'll admit.",
  },
  {
    id: "lies",
    label: "Lies",
    blurb: "The things kept back, and what keeping them does.",
  },
  {
    id: "hurt",
    label: "Hurt",
    blurb: "When it finally breaks the surface.",
  },
  {
    id: "grief",
    label: "Grief",
    blurb: "After. What's left in the rooms they used to share.",
  },
] as const satisfies readonly Feeling[];

export const places = [
  {
    id: "farmhouse",
    label: "The Farmhouse",
    blurb: "Warm wood, low light, and everything left unsaid.",
    environmentSlug: "farmhouse",
  },
  {
    id: "lakehouse",
    label: "The Lakehouse",
    blurb: "Water, firelight, and the nights that changed things.",
  },
  {
    id: "park",
    label: "The Park",
    blurb: "Open ground, nowhere to hide.",
  },
  {
    id: "bar",
    label: "The Bar",
    blurb: "Low light, other people's noise, and room to say the real thing.",
  },
  {
    id: "lake",
    label: "The Lake",
    blurb: "Open water at the far edge of the farm, well out of earshot.",
  },
  {
    id: "coffee-shop",
    label: "The Coffee Shop",
    blurb: "Neutral ground, chosen for exactly that reason.",
  },
] as const satisfies readonly Place[];

/**
 * The people Luna writes about. A third browse axis, used by the journal:
 * an entry is filed by where it was written and by who it is about.
 */
export const people = [
  {
    id: "josh",
    label: "Josh",
    blurb:
      "Ten years, six months apart, and a phone call that started it again.",
  },
  {
    id: "tyson",
    label: "Tyson",
    blurb: "Twenty years her best friend, and the six months that changed it.",
  },
  {
    id: "luna",
    label: "Herself",
    blurb: "The entries that aren't about anyone else.",
  },
] as const satisfies readonly Person[];

export interface Person {
  /** Stable id — appears in ?about= URLs. Do not rename casually. */
  id: string;
  label: string;
  blurb: string;
}

export type FeelingId = (typeof feelings)[number]["id"];
export type PlaceId = (typeof places)[number]["id"];
export type PersonId = (typeof people)[number]["id"];

export function getPerson(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getFeeling(id: string): Feeling | undefined {
  return feelings.find((f) => f.id === id);
}

export function getPlace(id: string): Place | undefined {
  return places.find((p) => p.id === id);
}
