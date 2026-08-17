/**
 * Overheard — the shared constants.
 *
 * Separate from lib/db/overheard.ts because that module is `server-only` and
 * the post form is a client component: importing the allowance from there
 * dragged the database client into the browser bundle and failed the build.
 * Numbers that both sides need live here; anything that touches Postgres
 * stays in lib/db.
 */

/**
 * HISTORICAL. Posts a non-member could leave before the LunaVerse was
 * required, back when the room was free to read.
 *
 * Overheard went members-only on 2026-08-03 and the allowance no longer gates
 * anything — app/overheard/actions.ts checks membership and nothing else. It
 * survives because the rows it produced are still in the database and
 * app/admin still reports against it ("how far each free account got"), which
 * is a question about the past and stays answerable.
 *
 * If you are looking for the rule that decides who may post, it is not this.
 */
/**
 * ARCHIVED — Melissa, 2026-08-10. "lets archive the convo wall for now".
 *
 * Set false to bring it back; that is the whole switch. Everything else is
 * intact: the cast thread below, the database table and its rows, the
 * moderation page, the admin panel. Nothing has been deleted and nothing
 * needs rebuilding.
 *
 * WHY IT WENT. The wall was made members-only on 3 August, and in the week
 * that followed it took ZERO posts — because it had one member, who is
 * Melissa. A conversation wall with nobody on it is worse than no wall: it is
 * a room the site keeps pointing at, and every visitor who follows the sign
 * finds it empty and learns something true about how many people are here.
 *
 * When it comes back it should come back with posting open to free accounts,
 * so it can fill before it is sold.
 */
export const OVERHEARD_ARCHIVED = true;

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
 * DRAFT COPY in their voices, per LUNA_VALE_CONTEXT.md: Luna interior and
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

  /* --------------------------------------------------------------- day 15 */
  { id: "d15-1", day: 15, at: "08:12", author: JOSH, addressedTo: null, body: ["Somebody asked what I eat for breakfast. THAT is the question. Not the ten years."] },
  { id: "d15-2", day: 15, at: "08:20", author: LUNA, addressedTo: null, body: ["@Josh It's four coffees and whatever is nearest."] },
  { id: "d15-3", day: 15, at: "08:22", author: JOSH, addressedTo: null, body: ["@Luna Three."] },

  /* --------------------------------------------------------------- day 16 */
  { id: "d16-1", day: 16, at: "17:40", author: TYSON, addressedTo: null, body: ["Rode out to the coast. Didn't tell anyone. Telling you now."] },
  { id: "d16-2", day: 16, at: "18:02", author: LUNA, addressedTo: null, body: ["@Tyson That is not how not telling anyone works."] },

  /* --------------------------------------------------------------- day 17 */
  { id: "d17-1", day: 17, at: "12:30", author: RICK, addressedTo: null, body: ["Somebody on here called me a boss. I've been called worse and less accurately."] },

  /* --------------------------------------------------------------- day 18 */
  { id: "d18-1", day: 18, at: "20:15", author: LUNA, addressedTo: null, body: [
    "Question for the room, and I want real answers.",
    "What's the smallest thing somebody has ever done that made you decide about them? Not the big thing. The small one.",
  ] },
  { id: "d18-2", day: 18, at: "20:31", author: TYSON, addressedTo: null, body: ["@Luna Cupboards."] },
  { id: "d18-3", day: 18, at: "20:33", author: LUNA, addressedTo: null, body: ["@Tyson I'm going to let that one sit there."] },

  /* --------------------------------------------------------------- day 19 */
  { id: "d19-1", day: 19, at: "09:45", author: JOSH, addressedTo: null, body: ["Fixed the gate. Nobody is going to notice the gate. I'm mentioning the gate."] },

  /* --------------------------------------------------------------- day 20 */
  { id: "d20-1", day: 20, at: "21:20", author: RICK, addressedTo: null, body: ["@Josh Your grandfather hung that gate in 1971. You've adjusted it."] },
  { id: "d20-2", day: 20, at: "21:26", author: JOSH, addressedTo: null, body: ["@Rick I'll take it."] },

  /* --------------------------------------------------------------- day 21 */
  { id: "d21-1", day: 21, at: "07:50", author: LUNA, addressedTo: null, body: ["Ran the long way round for the first time since April. Nothing happened. That's the update. That's the whole update."] },

  /* --------------------------------------------------------------- day 22 */
  { id: "d22-1", day: 22, at: "19:05", author: TYSON, addressedTo: null, body: ["Somebody asked what I listen to on the bike. Nothing. That's the point of the bike."] },

  /* --------------------------------------------------------------- day 23 */
  { id: "d23-1", day: 23, at: "13:10", author: JOSH, addressedTo: null, body: ["Genuinely enjoying this. Nobody warned me you'd all be funny."] },
  { id: "d23-2", day: 23, at: "13:44", author: RICK, addressedTo: null, body: ["@Josh Give it a fortnight."] },

  /* --------------------------------------------------------------- day 24 */
  { id: "d24-1", day: 24, at: "22:40", author: LUNA, addressedTo: null, body: ["Can't sleep. Not a bad thing this time — just awake. Anybody else up?"] },
  { id: "d24-2", day: 24, at: "22:44", author: TYSON, addressedTo: null, body: ["@Luna Yeah."] },

  /* --------------------------------------------------------------- day 25 */
  { id: "d25-1", day: 25, at: "11:00", author: RICK, addressedTo: null, body: ["Right. Ask me the thing you've all been circling. I'll answer it once."] },

  /* --------------------------------------------------------------- day 26 */
  { id: "d26-1", day: 26, at: "18:30", author: JOSH, addressedTo: null, body: ["@Rick They're not circling anything. They just like you more than me and it's fine."] },
  { id: "d26-2", day: 26, at: "18:35", author: RICK, addressedTo: null, body: ["@Josh It is not a competition. You'd lose."] },
  { id: "d26-3", day: 26, at: "18:41", author: LUNA, addressedTo: null, body: ["Every single time."] },

  /* --------------------------------------------------------------- day 27 */
  { id: "d27-1", day: 27, at: "08:25", author: TYSON, addressedTo: null, body: ["Car's booked in. Two weeks. I'll be unbearable."] },
  { id: "d27-2", day: 27, at: "08:31", author: LUNA, addressedTo: null, body: ["@Tyson Will be?"] },

  /* --------------------------------------------------------------- day 28 */
  { id: "d28-1", day: 28, at: "20:00", author: JOSH, addressedTo: null, body: [
    "Serious one, then I'll stop.",
    "Thanks for arguing with me on here instead of just deciding. It's more than I get most places.",
  ] },

  /* --------------------------------------------------------------- day 29 */
  { id: "d29-1", day: 29, at: "09:15", author: LUNA, addressedTo: null, body: ["That's the nicest thing he's said in weeks and he made it about himself in the second sentence. Consistency."] },
  { id: "d29-2", day: 29, at: "09:22", author: JOSH, addressedTo: null, body: ["@Luna Fair."] },

  /* --------------------------------------------------------------- day 30 */
  { id: "d30-1", day: 30, at: "16:50", author: RICK, addressedTo: null, body: ["Been reading. Not posting. There's a difference and most of you could learn it."] },

  /* --------------------------------------------------------------- day 31 */
  { id: "d31-1", day: 31, at: "10:05", author: TYSON, addressedTo: null, body: ["End of the month. Still here. Still not much use."] },
  { id: "d31-2", day: 31, at: "10:20", author: LUNA, addressedTo: null, body: ["@Tyson You answered forty things this month. I counted."] },
  { id: "d31-3", day: 31, at: "10:24", author: TYSON, addressedTo: null, body: ["@Luna Thirty-eight."] },

  /* --------------------------------------------------------------- day 32 */
  { id: "d32-1", day: 32, at: "19:30", author: LUNA, addressedTo: null, body: [
    "Last day of August. Thank you for being in here — genuinely.",
    "Keep going. We're not going anywhere.",
  ] },
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

/* ----------------------------------------------------------- @ mentions --- */

/**
 * Who can be tagged. The cast plus Melissa — a small, fixed set, so the picker
 * needs no user directory and no lookup.
 *
 * Matching is CASE-INSENSITIVE everywhere. Somebody typing "@melissa" has
 * plainly tagged Melissa, and a mention that silently fails to register because
 * of a capital letter is worse than no mention at all.
 */
export const MENTIONABLE = [
  { name: "Luna", hint: "the one it happens to" },
  { name: "Tyson", hint: "her best friend of twenty years" },
  { name: "Josh", hint: "her partner of ten years" },
  { name: "Rick", hint: "Josh's father" },
  { name: "Melissa", hint: "the filmmaker" },
] as const;

/** Byline colours for cast replies, keyed by canonical name. */
export const CAST_TINTS: Record<string, string> = {
  Luna: "#e0b072",
  Tyson: "#9fb3c8",
  Josh: "#d99a8f",
  Rick: "#b8a98c",
};

/** Canonical spelling for a typed name, or null if it isn't one of ours. */
export function resolveMention(typed: string): string | null {
  const hit = MENTIONABLE.find(
    (m) => m.name.toLowerCase() === typed.toLowerCase(),
  );
  return hit ? hit.name : null;
}

/** Days of scripted cast thread still to come. Zero means it has run dry. */
export function threadRunway(now: Date): { lastDay: Date; daysLeft: number } {
  const start = new Date(THREAD_START);
  const maxDay = CAST_THREAD.reduce((m, x) => Math.max(m, x.day), 0);
  const lastDay = new Date(start);
  lastDay.setUTCDate(lastDay.getUTCDate() + maxDay);
  const daysLeft = Math.max(
    0,
    Math.ceil((lastDay.getTime() - now.getTime()) / 86_400_000),
  );
  return { lastDay, daysLeft };
}
