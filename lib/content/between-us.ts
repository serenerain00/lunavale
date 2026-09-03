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
  /*
    WHAT IT IS, FROM MELISSA, 2026-09-03 — and it now leads, because it is the
    only thing on this band a stranger actually needs.

    Her words, lightly set: "Between Us is a cinematic drama series about Luna,
    Josh and Tyson — three people whose lives have been tangled together for
    more than two decades. Luna and Josh are trying to find their way back to
    each other. Tyson is Josh's family, Luna's best friend, and the one person
    who has always known her a little too well. A story about friendship,
    loyalty, love, and everything we don't say until it's too late. Three
    people, twenty years of history, and one question nobody wants answered."

    THIS FILE USED TO SAY THE DESCRIPTION DID NOT EXIST — that nothing in the
    repository could supply one without inventing it, and that the moment there
    was a real one it would be the best line here. That is now closed. The
    first three paragraphs below are hers; the two sentences she asked to have
    added on the same day are the only ones that are not.

    THE ADDED SENTENCES ARE CHECKED AGAINST CANON rather than atmosphere.
    "Nothing in it breaks in a single night" is a description of the journal:
    eighty pages of kitchens, trucks and pauses, and then one thing that goes.
    "Nobody in it is the villain" is the deal the whole product already makes —
    Josh is free on this site being good at something (josh-luna-bolt,
    josh-rick-study) precisely so that his turn reads as a man rather than as a
    plot. Neither line names an event, a date or an outcome, so neither can
    spoil an episode nobody has seen, and neither can be made wrong by one that
    is not finished.

    WHAT IS STILL NOT SAID, on purpose: how many episodes, how long they are,
    what order they run in, and when the first one lands. Those are the exact
    promises this band cannot keep yet.
  */
  body: [
    "A cinematic drama series about Luna, Josh and Tyson — three people whose lives have been tangled together for more than twenty years. Luna and Josh are trying to find their way back to each other. Tyson is Josh's family, Luna's best friend, and the one person who has always known her a little too well.",
    "Friendship, loyalty, love, and everything we don't say until it's too late. Nothing in it breaks in a single night — it comes apart quietly, over years, in kitchens and trucks and the pauses between sentences. Nobody in it is the villain. Nobody comes out of it clean.",
    "Three people. Twenty years of history. One question nobody wants answered.",
    // The logistics, kept separate and kept last. Every line below is future
    // tense with no date in it, for the reason in the header.
    "The first episode is coming, and the ones after it land here as each one is finished. Not a scene and not a clip — episodes.",
    "Every one is part of the membership. Nothing extra to buy, no season to wait for, and they stay yours to watch again.",
    // "before it goes to Instagram" rather than "exclusive" on its own:
    // exclusive is a word that can mean anything, and the specific version is
    // both more persuasive and easier to be held to.
    "Members watch each one here first, before it goes to Instagram.",
  ],
  memberLine: "Included with the LunaVerse.",
  memberNote: "You'll get these first — they land here before anywhere else.",
};
