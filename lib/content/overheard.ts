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
   * Display time, e.g. "9:14". Presentational only — these are a scripted
   * conversation held in code, so they have no real timestamp, and a chat with
   * a blank time gutter on its first sixteen rows reads as broken.
   */
  at: string;
  /**
   * Who it is from. Defaults to Melissa. A character author is what makes the
   * cast answering a visible fact rather than a promise — the site already has
   * them speaking in the interview and signing the Between Takes notes, so this
   * is the same conceit, not a new one.
   */
  author?: { name: string; role: string; tint?: string };
  /** Addressee id, or null for the room. Matches the wall's own values. */
  addressedTo: string | null;
  body: string[];
}

export const MELISSA = { name: "Melissa", role: "Filmmaker", tint: "#e0b072" };

/** Name colours. A chat is much easier to follow when the speakers differ. */
const LUNA = { name: "Luna", role: "Luna", tint: "#e0b072" };
const TYSON = { name: "Tyson", role: "Tyson", tint: "#9fb3c8" };
const JOSH = { name: "Josh", role: "Josh", tint: "#d99a8f" };
const RICK = { name: "Rick", role: "Rick", tint: "#b8a98c" };

export const OPENING_POSTS: OpeningPost[] = [
  {
    id: "luna-opens",
    at: "9:02",
    author: LUNA,
    addressedTo: null,
    body: [
      "Melissa has given the four of us accounts on here, which I think she may regret by Thursday.",
      "Ask us things. I'll answer honestly, which is not the same as answering completely.",
    ],
  },
  {
    id: "tyson-define",
    at: "9:03",
    author: TYSON,
    addressedTo: "luna",
    body: ["Define honestly."],
  },
  {
    id: "luna-dont",
    at: "9:03",
    author: LUNA,
    addressedTo: "tyson",
    body: ["Don't."],
  },
  {
    id: "josh-not-the-villain",
    at: "9:11",
    author: JOSH,
    addressedTo: null,
    body: [
      "Before anybody asks: no, I don't think I'm the villain of this. I've read what gets written about me. Some of it is fair.",
      "Ask me whatever you want. I'd rather you asked me than decided.",
    ],
  },
  {
    id: "rick-most-work",
    at: "9:14",
    author: RICK,
    addressedTo: "josh",
    body: [
      "You've read what people write about you. That's the most work you've put into any of it.",
    ],
  },
  {
    id: "josh-hello-dad",
    at: "9:14",
    author: JOSH,
    addressedTo: "rick",
    body: ["Hello, Dad."],
  },
  {
    id: "rick-would-have-hired",
    at: "9:16",
    author: RICK,
    addressedTo: "tyson",
    body: ["You're the only one of them I'd have hired."],
  },
  {
    id: "tyson-not-much-use",
    at: "9:20",
    author: TYSON,
    addressedTo: null,
    body: ["I won't be much use. Ask anyway."],
  },
  {
    id: "luna-four-words",
    at: "9:21",
    author: LUNA,
    addressedTo: null,
    body: [
      "He'll answer. It will be four words and you'll think about it for a week.",
    ],
  },
  {
    id: "tyson-six",
    at: "9:21",
    author: TYSON,
    addressedTo: "luna",
    body: ["Six."],
  },
  {
    id: "josh-what-would-you",
    at: "9:28",
    author: JOSH,
    addressedTo: null,
    body: [
      "Here's what I actually want to know, and nobody ever answers it.",
      "Not what you think of us. What you would have done — in the kitchen, in the car, on that first phone call. Same ten years, same Tuesday. Go on.",
    ],
  },
  {
    id: "luna-frightened",
    at: "9:31",
    author: LUNA,
    addressedTo: "josh",
    body: ["That's the only question on here I'm frightened of."],
  },
  {
    id: "rick-i-liked-her",
    at: "9:35",
    author: RICK,
    addressedTo: null,
    body: [
      "Since somebody is going to ask it eventually: yes, I liked her. That was never the problem.",
    ],
  },
  {
    id: "rick-ask-me",
    at: "9:36",
    author: RICK,
    addressedTo: null,
    body: [
      "Ask me whatever you like. I won't be kind about any of them. Particularly my son.",
    ],
  },
  {
    id: "josh-he-means-it",
    at: "9:38",
    author: JOSH,
    addressedTo: null,
    body: [
      "He means that. Ask him anyway — he's the most honest one here and it has never once cost him anything.",
    ],
  },
  {
    id: "tyson-closes",
    at: "9:42",
    author: TYSON,
    addressedTo: null,
    body: ["Box is at the top. Say something."],
  },
];
