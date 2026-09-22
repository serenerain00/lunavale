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
 *   2. This is the only place they can be watched.
 *
 * THE SECOND ONE CHANGED ON 2026-09-07 AND GOT STRONGER BY GETTING SMALLER.
 * It used to read "before it goes to Instagram", which was an operational
 * commitment rather than a feature: no episode could be posted to Instagram
 * until it had been live here first, nothing in the code could enforce that,
 * and one out-of-order post would have turned a membership into a grievance.
 *
 * Melissa, 2026-09-07: Instagram does not allow full episodes. So the ordering
 * promise was never the real point — an episode cannot go there at all. What
 * replaces it is a platform fact rather than a promise, and the difference is
 * the whole reason to prefer it: nobody can break it by posting in the wrong
 * order, and it says something considerably better than "first", which is that
 * there is no second place. Instagram stays what it always was for this
 * project — clips, trailers and fragments, which is what sends people here.
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
  /**
   * What the series IS. Not shown on the home band — see the note on the
   * value below. Written and kept for the page that should carry it.
   */
  premise: string[];
  /**
   * What a membership has to do with it. This is what the band shows: a band
   * is not an essay, and the premise is already in the blurb above it.
   */
  offer: string[];
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
  /*
   * SPLIT IN TWO, 2026-09-17. It was one `body` array of six paragraphs, and
   * the home page rendered all six under the hero — which put a ~980-character
   * wall directly beneath a blurb that had just said the same thing. The first
   * three ARE the premise, and the hero blurb above the band already carries
   * it, so on the home page they were the page repeating itself at length on
   * the exact screen Melissa had asked to make less text-heavy.
   *
   * `premise` is what the series is. `offer` is what a membership has to do
   * with it. The band shows the offer, because that is the band's whole job —
   * telling a stranger that episodes are coming and this is where they land.
   * The premise is kept because it is good and because the moment there is a
   * page that should carry it (a series page, the first episode's own page) it
   * is written and waiting.
   */
  premise: [
    "A cinematic drama series about Luna, Josh and Tyson — three people whose lives have been tangled together for more than twenty years. Luna and Josh are trying to find their way back to each other. Tyson is Josh's family, Luna's best friend, and the one person who has always known her a little too well.",
    "Friendship, loyalty, love, and everything we don't say until it's too late. Nothing in it breaks in a single night — it comes apart quietly, over years, in kitchens and trucks and the pauses between sentences. Nobody in it is the villain. Nobody comes out of it clean.",
    "Three people. Twenty years of history. One question nobody wants answered.",
  ],

  // The logistics. Every line is future tense with no date in it, for the
  // reason in the header.
  offer: [
    "The first episode is here, and the ones after it land as each one is finished. Not a scene and not a clip — episodes.",
    "Every one is part of the membership. Nothing extra to buy, no season to wait for, and they stay yours to watch again.",
    // NAMES THE CONSTRAINT rather than claiming exclusivity. "Exclusive" is a
    // word that can mean anything and that a reader has been trained to
    // discount; a length limit on a platform they use themselves is checkable,
    // and it explains the situation instead of asserting it.
    "Instagram can carry a clip. It cannot carry an episode — so this is the only place to watch one.",
  ],
  memberLine: "Included with the LunaVerse.",
  memberNote: "Each one lands here, and here is the only place it lands.",
};
