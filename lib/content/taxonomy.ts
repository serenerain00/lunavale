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
    environmentSlug: "lakehouse",
  },
  {
    id: "park",
    label: "The Park",
    blurb: "Open ground, nowhere to hide.",
    environmentSlug: "park",
  },
  {
    id: "bar",
    label: "The Bar",
    blurb: "Low light, other people's noise, and room to say the real thing.",
    environmentSlug: "bar",
  },
  {
    id: "lake",
    label: "The Lake",
    blurb: "Open water at the far edge of the farm, well out of earshot.",
    environmentSlug: "lake",
  },
  {
    id: "coffee-shop",
    label: "The Coffee Shop",
    blurb: "Neutral ground, chosen for exactly that reason.",
    environmentSlug: "coffee-shop",
  },
  {
    // No `environmentSlug` yet — the garage is a place content is filed under
    // before it is a room anyone can walk into. Add the slug when the
    // environment gets built (CLAUDE.md lists it among the locations).
    id: "garage",
    label: "The Garage",
    blurb: "Where he goes instead of saying anything.",
  },
  {
    id: "downtown",
    label: "Downtown",
    blurb: "The city, and the drive home from it.",
    environmentSlug: "downtown",
  },
  {
    // Her own place in Denver — confirmed by Melissa 2026-08-04. Not new
    // material so much as a location that was always here and never named: the
    // "The Apartment" clip has been filed under nothing since it landed and is
    // plainly the same room.
    //
    // Distinct from `downtown`, which is the restaurant and the drive. This is
    // where she is when the day is over.
    //
    // WHAT IS OUTSIDE THE WINDOW IS DELIBERATELY UNSTATED here and in the copy
    // on the scene. It reads as a lit skyline; Melissa has said she may play it
    // as her porch instead, and neither the blurb nor the synopsis commits to
    // either, so that stays her call rather than something the site has already
    // decided for her.
    id: "apartment",
    label: "The Apartment",
    blurb: "Her own place in Denver, and the hours nobody else sees.",
  },
  {
    // No `environmentSlug` — the fair is a night, not a room, and it is the
    // one place in the world that will not be there next week. Filed as a
    // place because the scene has to live somewhere true, and folding an
    // autumn fair into "downtown" would lose the only thing about it that
    // matters: everybody they know is in one field at the same time.
    id: "fair",
    label: "The Fair",
    blurb: "Lights strung over a field, and nowhere to have a private word.",
  },
  {
    // Not part of the present-day world — the Mexico trip is a flashback to five
    // years into the relationship. Filed as its own place so the two journal
    // entries and the beach material sit somewhere true rather than being
    // squeezed into "the lake".
    id: "mexico",
    label: "Mexico",
    blurb: "Five years in, and a week that felt like a reset.",
  },
  {
    // Rick's room. Likely to become one room of a larger "Rick's house" once
    // more of it is shot — filed narrowly for now rather than folded into the
    // farmhouse, which belongs to Josh and Luna and means something else.
    id: "the-study",
    label: "The Study",
    blurb: "His father's room, and the only chair in it that matters.",
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
  {
    // Josh's father. Luna has written nothing about him — this axis exists so
    // scenes and stills can be filed under him, and it renders only where
    // there is content (lib/content/catalog.ts).
    id: "rick",
    label: "Rick",
    blurb: "Josh's father, and most of the reason Josh is the way he is.",
  },
  {
    // Luna's mother, new on 2026-08-03. Registered ahead of her first scene so
    // it has somewhere to be filed the moment it lands; renders nowhere until
    // then, and adding her here does NOT put her on /characters (that page has
    // its own list) or in Overheard's @ picker (MENTIONABLE is separate).
    //
    id: "cathy",
    label: "Cathy",
    blurb:
      "Two thousand miles away in Atlanta, defending a man she only half knows.",
  },
  {
    // Luna's younger sister, named 2026-08-04. Ten years between them, both
    // ends of the same open door. Still in Atlanta with their mother.
    id: "avery",
    label: "Avery",
    blurb: "Ten years younger, and the only one who doesn't have to ask.",
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
