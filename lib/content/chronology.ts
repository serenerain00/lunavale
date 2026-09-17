/**
 * Story order — the order the clips happen to Luna, not the order they went up.
 *
 * WHY THIS EXISTS. For two months this site released things in whatever order
 * they finished, which is the right way to make a thing and the wrong way to
 * show it to somebody. A visitor landing on 47 pieces with no order starts in
 * the middle of a story and has no way of knowing it. Melissa, 2026-09-16:
 * "I know people like order."
 *
 * ORDER IS A LIST, NOT A NUMBER ON EACH CLIP. The obvious alternative was a
 * `storyOrder: 14` field on every Video, and it is worse in the way that only
 * shows up later: inserting one clip between 14 and 15 means renumbering
 * everything after it, in a file where every entry carries a paragraph of
 * reasoning that must not get detached from it. Here, inserting a clip is
 * putting one line in the right place in one list.
 *
 * MOST OF IT IS DERIVED, NOT INVENTED. lib/content/journal.ts is already in
 * story order and says so, and 41 of the 46 clips are named by a journal entry
 * through `sceneSlug`. The order below was generated from that — first entry
 * that names a clip places it — so it inherits the canon rather than
 * reinterpreting it. Regenerate it the same way if the journal is ever
 * resequenced:
 *
 *   journal.forEach((e, i) => { if (e.sceneSlug && !at.has(e.sceneSlug)) at.set(e.sceneSlug, i) })
 *
 * FIVE ARE PLACED BY HAND and every one of them is marked below with what it
 * was placed on and how confident that is. They are the clips no journal entry
 * names — mostly because Luna is not in them, and she cannot write about a room
 * she was not in. Two are near-certain, two are reasoned, ONE IS A GUESS AND IS
 * LABELLED AS ONE. Melissa should read those five lines and move any that are
 * wrong; nothing else in the list needs her.
 *
 * IT IS CHECKED, NOT TRUSTED. `assertComplete()` runs in the health check and
 * fails if this list and the clip library ever disagree — a clip missing here
 * would silently vanish from the ordered view, which is exactly the kind of
 * thing nobody notices until a customer does.
 */

import { videos } from "@/lib/content/videos";

/**
 * Every story clip, first to last.
 *
 * NOT IN HERE, deliberately:
 *   between-us-trailer-one — the trailer is about the story, not in it
 *   interview              — the cast, out of character
 *   ty-luna-grg2           — hidden, waiting on the scored file
 */
export const STORY_ORDER: readonly string[] = [
  // ── The six months apart ────────────────────────────────────────────────
  // Ten years end. She packs, he goes, and Tyson is the one who turns up.
  "luna-josh-truck-leaving",
  "luna-josh-break",
  "luna-josh-bed-flashback",
  "luna-lkehouse-wine-shatter",
  "luna-cathy-phone",
  "josh-rick-lake",
  "luna-avery-ipad",
  "luna-ty-panic-attack",

  // HAND-PLACED — CONFIDENT. Melissa, 2026-09-11: "this is after josh and luna
  // broke up, about a month." The clip either side of it is the one-month mark
  // in her journal ("A month, and he made me go out"), so this sits with it.
  "josh-ty-ricks-house",

  "luna-tyson-dance",
  "luna-tyson-gingerale",
  "luna-ty-wasntplanningonit",
  "luna-ty-nyc-hotel",

  // HAND-PLACED — REASONED. Tyson takes the one subject he cannot raise with
  // Luna to Cole. It belongs immediately before he starts pulling away, which
  // is the next clip: he asks what to do, and then he does it.
  "tyson-cole-bar",

  "tyson-apt-thinking",
  "tyson-luna-lakehouse-fire",

  // HAND-PLACED — A GUESS, AND MELISSA SHOULD CHECK THIS ONE. Josh and his
  // father, and the last thing Josh says is about Luna. Placed here because the
  // next clip is Josh calling her back, which makes this the room he decided it
  // in. It would read just as well much later, when he has started to suspect —
  // the synopsis does not settle it, and neither can I.
  "josh-rick-study",

  // ── He calls, and it starts again ───────────────────────────────────────
  "luna-josh-coffee",
  "luna-tyson-bathroom",
  "luna-josh-dinner-house",
  "luna-josh-first-night",
  "ty-luna-blonde-guy-bar",
  "luna-josh-first-morning",
  "luna-josh-kitchen-kiss",
  "josh-tyson-barn",
  "josh-luna-bolt",
  "luna-josh-fair",

  // HAND-PLACED — CONFIDENT. The pool scene is the trip, not the farmhouse:
  // lit water, candles, palms. The only trip in the story is Mexico, and the
  // clip that follows is its last night. (The clip's `place` field still says
  // farmhouse and is a known placeholder — see lib/content/videos.ts.)
  "josh-luna-pool",

  "luna-josh-beach",

  // ── What Tyson will not say, and what Josh starts to see ────────────────
  "ty-luna-six-months",
  "ty-luna-farm-road",
  "luna-tyson-bar",
  "luna-ty-shop-kiss",
  "luna-ty-lakehouse-confrontation",
  "ty-josh-fight",

  // HAND-PLACED — REASONED. "Josh has decided what he saw in her face when
  // Tyson was in the room." That decision needs Tyson to have been in the room,
  // and the clip before it is the one where the two men have it out in front of
  // her. This is the morning after that.
  "josh-luna-wall",

  "luna-josh-bed",
  "luna-tyson-casey-bar",
  "luna-ty-bar-drunk",
  "tyson-park-fight",
  "luna-josh-house",
  "luna-bathtub",
  "ty-luna-garage",

  // HAND-PLACED — REASONED. Published 2026-09-17, the third garage scene and a
  // different conversation in the same room rather than a recut of the others.
  // It sits after The Garage and before the month of silence because that is
  // the shape its own staging note describes: her asking, him not answering.
  // Move it if the line turns out to put it elsewhere.
  "ty-luna-grg2",

  "luna-ty-apt-argue",
  "luna-truck-breakdown",
  "ty-luna-bed",
];

/** Position in the story, 1-based. `undefined` for anything not in the list. */
export function storyPosition(slug: string): number | undefined {
  const i = STORY_ORDER.indexOf(slug);
  return i === -1 ? undefined : i + 1;
}

/** The clips that belong to the story, in order, skipping anything hidden. */
export function inStoryOrder() {
  const bySlug = new Map(videos.map((v) => [v.slug, v]));
  return STORY_ORDER.map((slug) => bySlug.get(slug)).filter(
    (v): v is NonNullable<typeof v> => Boolean(v) && !v!.hidden,
  );
}

/** Newest first — the other way people expect to sort a library. */
export function inReleaseOrder() {
  return inStoryOrder()
    .slice()
    .sort((a, b) => (b.addedOn ?? "").localeCompare(a.addedOn ?? ""));
}

/**
 * The next clip in the story, for "up next" at the end of one.
 *
 * Story order rather than release order on purpose: somebody who has just
 * finished a clip is following the story, and the useful next thing is the one
 * that happens next, not the one that was uploaded next.
 */
export function nextInStory(slug: string) {
  const ordered = inStoryOrder();
  const i = ordered.findIndex((v) => v.slug === slug);
  return i === -1 || i === ordered.length - 1 ? undefined : ordered[i + 1];
}

export function previousInStory(slug: string) {
  const ordered = inStoryOrder();
  const i = ordered.findIndex((v) => v.slug === slug);
  return i <= 0 ? undefined : ordered[i - 1];
}

/**
 * Whether the list and the library still agree.
 *
 * Returns the problems rather than throwing, so the health check can report
 * both directions at once: a clip that exists and is unordered, and a slug
 * ordered that no longer exists.
 */
export function assertComplete(): { missing: string[]; unknown: string[] } {
  const EXEMPT = new Set(["between-us-trailer-one", "interview"]);
  const ordered = new Set(STORY_ORDER);
  const missing = videos
    .filter((v) => !v.hidden && !EXEMPT.has(v.slug) && !ordered.has(v.slug))
    .map((v) => v.slug);
  const known = new Set(videos.map((v) => v.slug));
  const unknown = STORY_ORDER.filter((s) => !known.has(s));
  return { missing, unknown };
}
