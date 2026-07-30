/**
 * Overheard — the shared constants.
 *
 * Separate from lib/db/overheard.ts because that module is `server-only` and
 * the post form is a client component: importing the allowance from there
 * dragged the database client into the browser bundle and failed the build.
 * Numbers that both sides need live here; anything that touches Postgres
 * stays in lib/db.
 */

/** Posts a non-member may leave before the LunaVerse is required. */
export const FREE_POST_ALLOWANCE = 3;

/** Longest a single post may be — enough to say something, short enough to read. */
export const MAX_POST_LENGTH = 900;

/* ------------------------------------------------------- opening posts ---- */

/**
 * Melissa's posts, pinned above the wall.
 *
 * These live in code rather than in the database on purpose:
 *
 *   1. They are copy, so they belong where the rest of the copy is — reviewable
 *      in a diff, editable without a SQL client, and version-controlled.
 *   2. They are the ONLY posts on this wall that are not from a real account.
 *      Keeping them structurally separate from `overheard_posts` means the
 *      table stays exactly what it claims to be: things actual people said.
 *
 * That second point is the important one. A room seeded with invented visitors
 * is a lie a visitor can eventually catch, and it would cast doubt on
 * everything else here. A room opened by the filmmaker is just a host talking
 * first, which is what a host is for.
 *
 * DRAFT COPY, written in Melissa's voice but not by her — same convention as
 * journal.ts and between-takes.ts. Replace freely; these are openers whose only
 * job is to be worth replying to.
 */
export interface OpeningPost {
  id: string;
  /**
   * Who it is from. Defaults to Melissa. A character author is what makes the
   * cast answering a visible fact rather than a promise — the site already has
   * them speaking in the interview and signing the Between Takes notes, so this
   * is the same conceit, not a new one.
   */
  author?: { name: string; role: string };
  /** Addressee id, or null for the room. Matches the wall's own values. */
  addressedTo: string | null;
  body: string[];
}

export const MELISSA = { name: "Melissa", role: "Filmmaker" };

export const OPENING_POSTS: OpeningPost[] = [
  {
    id: "welcome",
    addressedTo: null,
    body: [
      "So this is the room. I built the rest of the site to be looked at; I built this bit to be argued in.",
      "Say what you made of it. Tell me what you think happens next, tell me I got something wrong, ask me why a scene is the length it is. I read everything here, and I answer most of it.",
    ],
  },
  {
    id: "the-wrong-question",
    addressedTo: null,
    body: [
      "Everybody asks me which one she should end up with, so let's have it out properly.",
      "My honest answer is that it is the wrong question and I understand completely why everyone asks it anyway. She is not picking a man. But I did not write it so that only one reading works, and I have been told I am wrong about my own film before.",
      "Tyson or Josh. Go on.",
    ],
  },
  {
    id: "ask-them",
    addressedTo: null,
    body: [
      "You can address a post to Luna, Tyson, Josh or Rick — there's a dropdown on the box.",
      "Do. They answer these themselves, in their own words, and I don't tidy it up afterwards to make anybody look better. Rick in particular will not be nice about it.",
    ],
  },
  {
    // The demonstration. One line from Tyson is worth more than a paragraph
    // from me promising he'll turn up, and refusing to answer is more in
    // character than answering would be.
    id: "tyson-declines",
    author: { name: "Tyson", role: "Tyson" },
    addressedTo: null,
    body: ["Not answering that one."],
  },
];
