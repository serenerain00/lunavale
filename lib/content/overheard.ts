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

/* ------------------------------------------------------- the cast thread -- */

/**
 * The four of them, talking, one day at a time.
 *
 * This is a SCRIPT, not a job. Every message declares the day it lands on and
 * the page shows the ones whose day has arrived — so the thread grows daily
 * with no cron, no queue and no writes to the database. A visitor who comes
 * back next week finds messages that weren't there before, and all of it stays
 * reviewable in a diff.
 *
 * They are also kept out of `overheard_posts` deliberately. Every row in that
 * table is something a real account actually said; four characters talking is
 * the same openly-labelled fiction as the cast interview, and mixing the two
 * would make the table a claim it couldn't keep.
 *
 * WHEN IT RUNS OUT the thread simply stops growing — no errors, no blanks, and
 * the visitor posts underneath carry on as normal. Extend by appending; `day`
 * is days after THREAD_START, so nothing already published shifts.
 *
 * DRAFT COPY in their voices, per LUNA_VAULT_CONTEXT.md: Luna interior and
 * self-revising, Tyson almost nothing but it lands, Josh charming and certain
 * he isn't the villain, Rick unkind in a way that is also accurate.
 */

/** Day zero. Changing this moves the whole thread. */
export const THREAD_START = "2026-07-30T09:00:00Z";

export interface CastAuthor {
  name: string;
  tint: string;
}

export const LUNA: CastAuthor = { name: "Luna", tint: "#e0b072" };
export const TYSON: CastAuthor = { name: "Tyson", tint: "#9fb3c8" };
export const JOSH: CastAuthor = { name: "Josh", tint: "#d99a8f" };
export const RICK: CastAuthor = { name: "Rick", tint: "#b8a98c" };

export interface CastMessage {
  id: string;
  /** Days after THREAD_START. 0 lands immediately. */
  day: number;
  /** Time of day it lands, 24h "HH:MM". Only used for ordering and display. */
  at: string;
  author: CastAuthor;
  /** Who they're answering, or null for the room. */
  /** Retained for filtering; the visible mention lives in the body. */
  addressedTo: string | null;
  body: string[];
}

export const CAST_THREAD: CastMessage[] = [
  /* ---------------------------------------------------------------- day 0 */
  { id: "d0-1", day: 0, at: "09:02", author: LUNA, addressedTo: null, body: [
    "Melissa has given the four of us accounts on here, which I think she may regret by Thursday.",
    "Ask us things. I'll answer honestly, which is not the same as answering completely.",
  ] },
  { id: "d0-2", day: 0, at: "09:03", author: TYSON, addressedTo: "luna", body: ["@Luna Define honestly."] },
  { id: "d0-3", day: 0, at: "09:04", author: LUNA, addressedTo: "tyson", body: ["@Tyson Don't."] },
  { id: "d0-4", day: 0, at: "09:11", author: JOSH, addressedTo: null, body: [
    "Before anybody asks: no, I don't think I'm the villain of this. I've read what gets written about me. Some of it is fair.",
    "Ask me whatever you want. I'd rather you asked me than decided.",
  ] },
  { id: "d0-5", day: 0, at: "09:14", author: RICK, addressedTo: "josh", body: [
    "@Josh You've read what people write about you. That's the most work you've put into any of it.",
  ] },
  { id: "d0-6", day: 0, at: "09:15", author: JOSH, addressedTo: "rick", body: ["@Rick Hello, Dad."] },
  { id: "d0-7", day: 0, at: "09:16", author: RICK, addressedTo: "tyson", body: [
    "@Tyson You're the only one of them I'd have hired.",
  ] },
  { id: "d0-8", day: 0, at: "09:20", author: TYSON, addressedTo: null, body: ["I won't be much use. Ask anyway."] },
  { id: "d0-9", day: 0, at: "09:21", author: LUNA, addressedTo: null, body: [
    "He'll answer. It will be four words and you'll think about it for a week.",
  ] },
  { id: "d0-10", day: 0, at: "09:22", author: TYSON, addressedTo: "luna", body: ["@Luna Six."] },
  { id: "d0-11", day: 0, at: "09:28", author: JOSH, addressedTo: null, body: [
    "Here's what I actually want to know, and nobody ever answers it.",
    "Not what you think of us. What you would have done — in the kitchen, in the car, on that first phone call. Same ten years, same Tuesday. Go on.",
  ] },
  { id: "d0-12", day: 0, at: "09:31", author: LUNA, addressedTo: "josh", body: [
    "@Josh That's the only question on here I'm frightened of.",
  ] },
  { id: "d0-13", day: 0, at: "09:36", author: RICK, addressedTo: null, body: [
    "Ask me whatever you like. I won't be kind about any of them. Particularly my son.",
  ] },
  { id: "d0-14", day: 0, at: "09:42", author: TYSON, addressedTo: null, body: ["Box is at the bottom. Say something."] },

  /* ---------------------------------------------------------------- day 1 */
  { id: "d1-1", day: 1, at: "08:40", author: JOSH, addressedTo: null, body: [
    "Nobody has asked me anything yet. I'm choosing to read that as respect.",
  ] },
  { id: "d1-2", day: 1, at: "08:52", author: TYSON, addressedTo: "josh", body: ["@Josh Read it how you like."] },

  /* ---------------------------------------------------------------- day 2 */
  { id: "d2-1", day: 2, at: "21:15", author: LUNA, addressedTo: null, body: [
    "Somebody asked what I'd change. Nothing. That's the honest answer and I don't like it any more than you do.",
  ] },

  /* ---------------------------------------------------------------- day 3 */
  { id: "d3-1", day: 3, at: "19:30", author: RICK, addressedTo: null, body: [
    "Watched the coffee shop again. He's good in it. Don't tell him.",
  ] },
  { id: "d3-2", day: 3, at: "19:34", author: JOSH, addressedTo: "rick", body: ["@Rick Too late."] },

  /* ---------------------------------------------------------------- day 4 */
  { id: "d4-1", day: 4, at: "07:05", author: TYSON, addressedTo: null, body: ["Cold this morning. Bike stays in."] },
  { id: "d4-2", day: 4, at: "07:41", author: LUNA, addressedTo: "tyson", body: [
    "@Tyson You drove the car to the end of the road and came back. I watched you do it.",
  ] },
  { id: "d4-3", day: 4, at: "07:44", author: TYSON, addressedTo: "luna", body: ["@Luna It needed running."] },

  /* ---------------------------------------------------------------- day 5 */
  { id: "d5-1", day: 5, at: "22:10", author: JOSH, addressedTo: null, body: [
    "Genuine question. Does anybody actually like me, or are you all here for him.",
  ] },

  /* ---------------------------------------------------------------- day 6 */
  { id: "d6-1", day: 6, at: "09:20", author: LUNA, addressedTo: "josh", body: [
    "@Josh People like you. That has always been the problem.",
  ] },

  /* ---------------------------------------------------------------- day 7 */
  { id: "d7-1", day: 7, at: "18:02", author: RICK, addressedTo: null, body: [
    "My son asked whether anybody likes him. In public. On a website.",
  ] },

  /* ---------------------------------------------------------------- day 8 */
  { id: "d8-1", day: 8, at: "12:15", author: TYSON, addressedTo: null, body: ["Ask me an easy one."] },

  /* ---------------------------------------------------------------- day 9 */
  { id: "d9-1", day: 9, at: "23:48", author: LUNA, addressedTo: null, body: [
    "Bad night. Not writing about it. Just saying it happened, because I said I'd be honest on here and this is what that costs.",
  ] },

  /* --------------------------------------------------------------- day 10 */
  { id: "d10-1", day: 10, at: "08:05", author: JOSH, addressedTo: "luna", body: ["@Luna You alright?"] },
  { id: "d10-2", day: 10, at: "08:31", author: LUNA, addressedTo: "josh", body: ["@Josh Yes."] },
  { id: "d10-3", day: 10, at: "08:33", author: TYSON, addressedTo: "josh", body: ["@Josh She isn't."] },

  /* --------------------------------------------------------------- day 11 */
  { id: "d11-1", day: 11, at: "20:40", author: RICK, addressedTo: null, body: [
    "Thirty years running a business and I never once said the right thing to him at the right time. Make of that what you like. I have.",
  ] },

  /* --------------------------------------------------------------- day 12 */
  { id: "d12-1", day: 12, at: "09:12", author: LUNA, addressedTo: null, body: [
    "That is the most Rick has ever said in one go.",
  ] },
  { id: "d12-2", day: 12, at: "09:19", author: RICK, addressedTo: "luna", body: ["@Luna Don't get used to it."] },

  /* --------------------------------------------------------------- day 13 */
  { id: "d13-1", day: 13, at: "21:55", author: JOSH, addressedTo: null, body: [
    "Watched the barn scene with the sound off. Better scene with the sound off. Don't tell Melissa.",
  ] },
  { id: "d13-2", day: 13, at: "22:03", author: TYSON, addressedTo: "josh", body: ["@Josh She reads this."] },

  /* --------------------------------------------------------------- day 14 */
  { id: "d14-1", day: 14, at: "07:30", author: TYSON, addressedTo: null, body: ["Still here."] },
];

/** A cast message with its landing time resolved. */
export interface LandedMessage extends CastMessage {
  landedAt: Date;
}

/**
 * The messages whose day has arrived, oldest first.
 *
 * `now` is a parameter rather than read from the clock so this is testable and
 * so the caller decides — the page passes the request time.
 */
export function landedMessages(now: Date): LandedMessage[] {
  const start = new Date(THREAD_START);
  return CAST_THREAD.map((m) => {
    const [h, min] = m.at.split(":").map(Number);
    const landedAt = new Date(start);
    landedAt.setUTCDate(landedAt.getUTCDate() + m.day);
    landedAt.setUTCHours(h, min, 0, 0);
    return { ...m, landedAt };
  })
    .filter((m) => m.landedAt <= now)
    .sort((a, b) => a.landedAt.getTime() - b.landedAt.getTime());
}
