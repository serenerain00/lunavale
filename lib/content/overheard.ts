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
 * The four of them, talking to each other, pinned above the wall.
 *
 * These live in code rather than in `overheard_posts` on purpose:
 *
 *   1. They are copy, so they belong with the copy — reviewable in a diff and
 *      editable without a SQL client.
 *   2. They are the ONLY posts here that are not from a real account. Keeping
 *      them structurally separate means the table stays exactly what it claims
 *      to be: things actual people said. A wall seeded with invented visitors
 *      would be a lie a visitor could eventually catch; four characters talking
 *      is the same fiction as the cast interview, openly labelled.
 *
 * Written to read as one thread, top to bottom, so `addressedTo` is doing real
 * work — it is who they are answering, not a category.
 *
 * DRAFT COPY in their voices, not Melissa's — same convention as journal.ts.
 * Voices per LUNA_VAULT_CONTEXT.md: Luna interior and self-revising, Tyson
 * almost nothing but it lands, Josh charming and certain he is not the villain,
 * Rick unkind in a way that is also accurate.
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

const LUNA = { name: "Luna", role: "Luna" };
const TYSON = { name: "Tyson", role: "Tyson" };
const JOSH = { name: "Josh", role: "Josh" };
const RICK = { name: "Rick", role: "Rick" };

export const OPENING_POSTS: OpeningPost[] = [
  {
    id: "luna-opens",
    author: LUNA,
    addressedTo: null,
    body: [
      "Melissa has given the four of us accounts on here, which I think she may regret by Thursday.",
      "Ask us things. I'll answer honestly, which is not the same as answering completely.",
    ],
  },
  {
    id: "tyson-define",
    author: TYSON,
    addressedTo: "luna",
    body: ["Define honestly."],
  },
  {
    id: "luna-dont",
    author: LUNA,
    addressedTo: "tyson",
    body: ["Don't."],
  },
  {
    id: "josh-not-the-villain",
    author: JOSH,
    addressedTo: null,
    body: [
      "Before anybody asks: no, I don't think I'm the villain of this. I've read what gets written about me. Some of it is fair.",
      "Ask me whatever you want. I'd rather you asked me than decided.",
    ],
  },
  {
    id: "rick-most-work",
    author: RICK,
    addressedTo: "josh",
    body: [
      "You've read what people write about you. That's the most work you've put into any of it.",
    ],
  },
  {
    id: "josh-hello-dad",
    author: JOSH,
    addressedTo: "rick",
    body: ["Hello, Dad."],
  },
  {
    id: "rick-would-have-hired",
    author: RICK,
    addressedTo: "tyson",
    body: ["You're the only one of them I'd have hired."],
  },
  {
    id: "tyson-not-much-use",
    author: TYSON,
    addressedTo: null,
    body: ["I won't be much use on here. Ask anyway."],
  },
  {
    id: "luna-four-words",
    author: LUNA,
    addressedTo: null,
    body: [
      "He'll answer. It will be four words and you'll think about it for a week.",
    ],
  },
  {
    id: "tyson-six",
    author: TYSON,
    addressedTo: "luna",
    body: ["Six."],
  },
  {
    id: "josh-what-would-you",
    author: JOSH,
    addressedTo: null,
    body: [
      "Here's what I actually want to know, and nobody ever answers it.",
      "Not what you think of us. What you would have done — in the kitchen, in the car, on that first phone call. Same ten years, same Tuesday. Go on.",
    ],
  },
  {
    id: "luna-frightened",
    author: LUNA,
    addressedTo: "josh",
    body: ["That's the only question on here I'm frightened of."],
  },
  {
    id: "rick-i-liked-her",
    author: RICK,
    addressedTo: null,
    body: [
      "Since somebody is going to ask it eventually: yes, I liked her. That was never the problem.",
    ],
  },
  {
    id: "rick-ask-me",
    author: RICK,
    addressedTo: null,
    body: [
      "Ask me whatever you like. I won't be kind about any of them. Particularly my son.",
    ],
  },
  {
    id: "josh-he-means-it",
    author: JOSH,
    addressedTo: null,
    body: [
      "He means that. Ask him anyway — he's the most honest one here and it has never once cost him anything.",
    ],
  },
  {
    id: "tyson-closes",
    author: TYSON,
    addressedTo: null,
    body: ["Box is at the top. Say something."],
  },
];
