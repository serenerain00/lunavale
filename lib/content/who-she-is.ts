/**
 * Who she is — the five lines the home page introduces Luna with.
 *
 * THE PROBLEM THIS SOLVES (Melissa, 2026-09-01): somebody lands on the home
 * page having never heard of Luna Vale. They need to meet Luna, not be told
 * about her. The audience is mid-twenties to mid-sixties and about 90% women,
 * and the goal is that they care what happens to her before they are asked for
 * anything.
 *
 * WHY QUOTES AND NOT A PARAGRAPH ABOUT HER. A paragraph of adjectives —
 * "outspoken, kind, complicated, not afraid to speak her mind" — is the weakest
 * version of this and would describe four hundred other characters. It also
 * asks a stranger to take our word for it. Her own handwriting does not: it is
 * the single strongest asset the site has and it is already written.
 *
 * The five below are chosen against principles rather than taste, and the
 * principles are the reason they work:
 *
 *   SELF-DISCLOSURE. Intimate first-person disclosure creates felt closeness
 *   faster than any amount of third-person description. A reader who has just
 *   read a private admission is already in a relationship with the person who
 *   made it.
 *
 *   THE PRATFALL EFFECT. A capable person becomes MORE likeable after a
 *   visible flaw, not less. So the set opens on a flaw she names on herself,
 *   not on a virtue.
 *
 *   SPECIFICITY OVER SUMMARY. "I could do that one in my sleep" lands; "she is
 *   a people-pleaser" does not. Every line here is concrete.
 *
 *   AGENCY, NOT VICTIMHOOD. This matters more than anything else for this
 *   audience. A woman things happen TO invites pity, and pity does not buy a
 *   membership or finish a series. Every line was checked for one thing: does
 *   she name her own part in it? All five do. She is never the object of the
 *   sentence.
 *
 *   CONTRADICTION IS PERSONHOOD. Read in order they do not add up to a type —
 *   she accommodates, then she rages, then she catches herself doing both. A
 *   list of consistent traits is a character sheet. The inconsistency is what
 *   makes her a person.
 *
 *   THE CURIOSITY GAP GOES LAST. The set closes on an open question rather
 *   than a conclusion, because a resolved introduction has nowhere to go.
 *
 * THE ARC, and it is deliberate: she accommodates -> she rages -> she catches
 * herself -> she is in real trouble -> she still has her feet. Do not reorder
 * without reading it end to end; the fourth line is survivable only because
 * the fifth follows it.
 *
 * TWO OF THE FIVE ARE FROM FREE ENTRIES (`coffee`, `he-called`), on purpose.
 * A stranger who clicks a quote should not hit a wall every time — some doors
 * open, and the ones that do not become the reason to join rather than a
 * reason to leave.
 *
 * NOT INCLUDED, and deliberately: the warmth-toward-Josh beat. The home page
 * already carries it as the featured rain clip, which shows it in three
 * minutes better than a sentence could, and saying it twice on one page would
 * be arguing rather than showing.
 *
 * ADDRESSED BY INDEX, NOT BY COPY. Each line is stored as an entry id and a
 * paragraph number and resolved from the journal at render. Pasting the text
 * here would create a second copy that silently becomes a misquote the first
 * time Melissa edits an entry — and misquoting her own character on her own
 * home page is exactly the kind of rot nobody notices for months.
 */

import { getEntry } from "@/lib/content/journal";

export interface SheLine {
  /** The journal entry it comes from — also where the quote links to. */
  entryId: string;
  /** Which paragraph of that entry, zero-based. */
  paragraph: number;
  /**
   * What this line is doing in the set. Never rendered — it is here so the
   * next person to touch the list can tell whether a replacement does the same
   * job, rather than swapping in another good line and quietly flattening her.
   */
  role: string;
}

export const whoSheIs: SheLine[] = [
  {
    // THE WOUND, and it opens the set because it is a flaw rather than a
    // virtue. It is also the most widely-felt sentence in the book for this
    // audience: a competent woman noticing she has been running on autopilot
    // for other people.
    entryId: "last-on-my-own-list",
    paragraph: 3,
    role: "the accommodation — what she does instead of wanting things",
  },
  {
    // THE SPICE. Immediately after the flaw, so nobody mistakes the first line
    // for meekness. She is furious, and she is furious in writing, in capitals.
    entryId: "coffee",
    paragraph: 3,
    role: "the anger — she is not soft, and she knows exactly who is doing it",
  },
  {
    // THE SELF-HONESTY, and the reason a reader starts to trust her. She is
    // building a record against her own future self-deception.
    entryId: "he-called",
    paragraph: 2,
    role: "the integrity — she writes down the version that does not flatter her",
  },
  {
    // THE DARK. Placed fourth, never last. It is the line that makes the stakes
    // real, and on its own it would leave a stranger with nowhere to go.
    entryId: "the-page",
    paragraph: 19,
    role: "the demons — what she does with something she cannot look at",
  },
  {
    // THE FEET UNDER HER. Last, and it is the whole pitch: not resolved, not
    // rescued, still standing and still choosing. The question it leaves open
    // is the series.
    entryId: "day-by-day",
    paragraph: 4,
    role: "the agency — lost and somewhere are different, and she knows it",
  },
];

export interface ResolvedLine {
  entryId: string;
  text: string;
  dateline: string;
}

/**
 * The five lines, resolved against the live journal.
 *
 * Anything that no longer resolves is DROPPED rather than rendered empty: if an
 * entry is renamed or a paragraph is cut, the section quietly shows four lines
 * instead of crashing the home page or printing a blank quote mark. The section
 * hides itself entirely if fewer than three survive — see the home page.
 */
export function resolveWhoSheIs(): ResolvedLine[] {
  return whoSheIs.flatMap((line) => {
    const entry = getEntry(line.entryId);
    const text = entry?.body[line.paragraph];
    if (!entry || !text) return [];
    return [{ entryId: line.entryId, text, dateline: entry.dateline }];
  });
}
