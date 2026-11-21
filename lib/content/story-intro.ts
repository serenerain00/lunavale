/**
 * The newcomer's introduction: the words over the home hero while the free
 * pilot leads it, and the three relationships under it.
 *
 * WHY (2026-11-21). Melissa's Instagram audit and redesign brief: somebody
 * arriving from a 20-second Reel has no idea who these people are, and the
 * front page answered with an episode title ("Episode 1 (Pilot)") and a
 * five-sentence synopsis clamped to three lines. The brief asked for three
 * things in five seconds: what it is, why care, where to start.
 *
 * CANON CHECKED, line by line, against the series synopsis on the home page
 * (hers, 2026-09-25) and lib/content/journal.ts:
 *  - Josh and Tyson are SECOND cousins (no-undecided-facts), so the copy says
 *    "family" rather than "cousin". The brief's draft said "his cousin".
 *  - Nothing says or hints Tyson felt anything before the separation
 *    (tyson-no-early-feelings). "Something is shifting" is present tense.
 *  - The secret is already public in her own synopsis ("a decade-old secret
 *    involving Josh and Tyson's families") and in the free alley clip. What
 *    it IS stays writer knowledge: no names, no event.
 *
 * DRAFT COPY, adapted from the brief's suggestions. Hers to replace.
 */

export const STORY_HOOK = {
  headline: "Ten years of love. Twenty years of friendship. One secret that changes everything.",
  blurb:
    "She walked away from the man she still loves. Her closest friend for twenty years is his family. And the lines between the three of them are starting to blur.",
  primary: "Watch Episode 1 free",
  secondary: "Explore the series",
} as const;

export interface Relationship {
  id: string;
  title: string;
  line: string;
  /** A FREE clip, so the card is a door anybody can walk through. */
  clipSlug: string;
  /** 1280x720, rendered at aspect-video: nothing is cropped. */
  image: string;
  alt: string;
}

export const RELATIONSHIPS: Relationship[] = [
  {
    id: "luna-josh",
    title: "Luna + Josh",
    line: "Ten years of love. A separation neither of them knows how to navigate.",
    clipSlug: "luna-josh-frmhouse-comehome-horiz",
    image: "/posters/luna-josh-frmhouse-comehome-horiz.jpg",
    alt: "Luna and Josh, close, in the farmhouse kitchen",
  },
  {
    id: "luna-tyson",
    title: "Luna + Tyson",
    line: "Twenty years of friendship. Something between them is shifting, and neither of them will say it.",
    clipSlug: "luna-ty-couch",
    image: "/posters/luna-ty-couch.jpg",
    alt: "Luna and Tyson at opposite ends of the same couch at the lakehouse",
  },
  {
    id: "the-secret",
    title: "The secret",
    line: "Something happened years ago between their families, and the past isn't finished with them.",
    clipSlug: "luna-alley-attack",
    image: "/posters/luna-alley-attack.jpg",
    alt: "Luna walking alone downtown at night",
  },
];
