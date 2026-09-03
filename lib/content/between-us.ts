/**
 * Between Us — the episode series, and the announcement that runs ahead of it.
 *
 * WHY THIS IS A MODULE AND NOT COPY TYPED INTO THE HOME PAGE. The band it
 * feeds is the first thing under the hero, it is temporary by construction,
 * and it makes a promise the product has not kept yet. All three of those want
 * one obvious place to go and change — turning it off when the first episode
 * lands should be flipping `announced` to false, not hunting through JSX for a
 * paragraph.
 *
 * THE CLAIM, from Melissa (2026-09-03): "I want new comers to see that
 * membership doesnt unlock just stills/scenes, theyll have access to episodes
 * as they are released with exclusive first view access before IG."
 *
 * That is two separate promises and the copy below keeps them separate on
 * purpose, because they cost different things to keep:
 *
 *   1. Members get the episodes. Straightforward — it is the same gate every
 *      other premium thing already uses.
 *   2. Members get them BEFORE Instagram. This one is an operational
 *      commitment, not a feature: it means no episode may be posted to
 *      Instagram until it has been live here first. Nothing in the code can
 *      enforce that. If the order ever slips, this line is the thing that
 *      turned a membership into a grievance, so it is written down here as a
 *      promise somebody has to keep rather than buried in a sentence.
 *
 * NOTHING HERE SAYS ANYTHING IS AVAILABLE. There is no episode yet. Every line
 * is future tense, there is no date, and there is no countdown — a date this
 * file cannot guarantee would be exactly the fake scarcity
 * docs/monetization/MONETIZATION.md rules out. When the first one exists, the
 * honest move is to replace this band with the episode itself.
 */

export interface BetweenUsAnnouncement {
  /** Whether the band renders at all. Flip to false when episodes are real. */
  announced: boolean;
  /** Small caps above the heading. */
  eyebrow: string;
  heading: string;
  /** The body, in order. Two short paragraphs; a band is not an essay. */
  body: string[];
  /** The line that answers "and what do I get for eight dollars". */
  memberLine: string;
  /** What a member sees instead of the pitch. */
  memberNote: string;
}

export const BETWEEN_US: BetweenUsAnnouncement = {
  announced: true,
  eyebrow: "Coming to the LunaVerse",
  heading: "Between Us",
  body: [
    "An episode series, and the first one is coming. Not a scene and not a clip — episodes, released as they are finished.",
    // "before it goes to Instagram" rather than "exclusive" on its own:
    // exclusive is a word that can mean anything, and the specific version is
    // both more persuasive and easier to be held to.
    "Members watch each one here first, before it goes to Instagram — and the membership was never only the stills and the scenes.",
  ],
  memberLine: "Included with the LunaVerse.",
  memberNote: "You'll get these first — they land here before anywhere else.",
};
