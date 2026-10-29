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
import { SEASONS } from "@/lib/content/season";

/**
 * Every story clip, first to last.
 *
 * NOT IN HERE, deliberately:
 *   between-us-trailer-one — the trailer is about the story, not in it
 *   interview              — the cast, out of character
 *   ty-luna-grg2           — hidden, waiting on the scored file
 */
export const STORY_ORDER: readonly string[] = [
  // ── Twenty years ago ────────────────────────────────────────────────────
  /*
   * FIRST, AND IT TOOK THE OPENING FROM THE ACCIDENT on 2026-09-22.
   *
   * Atlanta, the two of them at eighteen: she rings him from a party, he is at
   * the races, he comes anyway. It is the earliest footage on the site by nine
   * years and it is chronologically first, which is the boring half of the
   * argument.
   *
   * The half that matters is what a stranger meets first. This list opened on
   * the accident — two men and a dead worker — which is a strange first taste
   * of a show about three people who love each other badly. It now opens on
   * why Luna and Tyson are Luna and Tyson, and the accident lands second, as
   * the other thing that happened before any of this.
   */
  "ty-luna-young",

  // HAND-PLACED — CONFIRMED ERA, REASONED ORDER. Melissa, 2026-09-25: 2006,
  // both eighteen. Same summer as Pick Me Up, so it sits beside it; after it
  // rather than before because that one is why they are who they are, and
  // this is what that looks like on an ordinary night.
  "young-luna-ty-apt",

  // HAND-PLACED — CONFIRMED ERA. Melissa, 2026-10-12: both eighteen, the
  // night he tells her about the Navy. After "Have Fun" (same summer, and he
  // goes "in a couple of months"); before the prologue, which is years later.
  "young-luna-ty-seals",

  // ── Before any of it ────────────────────────────────────────────────────
  /*
   * THE PROLOGUE, and the only clip here that predates the rest by years.
   *
   * Nine years before "Three Days": the night a worker died on Rick's site and
   * the three of them agreed he would take care of it. Luna was a year into
   * her life with Josh and was not told, then or since — see §12 of
   * docs/content/BETWEEN_US_SECRET_CANON.md.
   *
   * FIRST, BECAUSE IT IS THE FOUNDATION. Everything below is Luna living
   * inside a decision taken in this room, and the order reads correctly only
   * if you have seen it: she is not a woman whose partner has a secret from
   * before they met, she is a woman who was already there.
   *
   * IT IS ALSO MAXIMALLY EARLY AGAINST §8, which asks that the audience first
   * feel there is a history they do not know, and reach the accident late.
   * Position one is the opposite of late. That tension is real and it is
   * Melissa's to resolve — moving it is one line in this list. It is here
   * rather than last because it was made free to be watched, and burying the
   * hook at the bottom of forty-eight clips would undo the reason for that.
   */
  "ty-josh-rick-accident",

  // ── The six months apart ────────────────────────────────────────────────
  // Ten years end. She packs, he goes, and Tyson is the one who turns up.
  // HAND-PLACED, 2026-10-10. Luna and Josh in black and white — before the
  // breakup (Melissa), so it sits in front of "Three Days", the last of
  // them together. Exactly where in the ten years is not stated; move it if
  // she places it.
  "luna-josh-bed-land",
  // The long cut of the same night (Melissa, 2026-10-19: "pre-breakup").
  "josh-luna-pre-break",
  "luna-josh-truck-leaving",
  "luna-josh-break",

  // HAND-PLACED — CONFIRMED. Melissa: "this is the next day after the
  // breakup." It goes immediately after the break itself and before the
  // seven-day mark of `luna-lkehouse-wine-shatter`.
  "luna-ty-groceries",
  "luna-josh-bed-flashback",
  "luna-lkehouse-wine-shatter",
  // HAND-PLACED — CONFIRMED ERA, REASONED ORDER. Melissa, 2026-10-04: about a
  // week after the breakup. After the glass, which is the seven-day mark and
  // her alone with it; this is the same week with somebody there.
  "luna-tyson-shaving",

  // HAND-PLACED — CONFIRMED. Melissa, 2026-09-29: about a week after the
  // breakup, and Luna has not picked up for her mother. It goes straight
  // before the call she finally does pick up.
  "avery-cathy-kitchen",
  "luna-cathy-phone",
  "josh-rick-lake",
  "luna-avery-ipad",
  "luna-ty-panic-attack",
  // HAND-PLACED — A GUESS, 2026-10-26, Melissa to move it. The laundromat:
  // "I just miss him, Ty, and I don't want to miss him", "I wanted to leave",
  // "who am I without him". That is the first weeks, before she can say no to
  // him — so after the panic attack and before Come Home, where Josh asks.
  "luna-ty-laundrymat",

  // HAND-PLACED — CONFIRMED ERA, REASONED ORDER. Come Home. Melissa,
  // 2026-10-22: "only been separated for a few weeks". So after the
  // one-week clips above and before the one-month mark below, and before Josh
  // asks Tyson to talk to her (next), which reads as what he does once asking
  // her himself has not worked.
  "luna-josh-frmhouse-comehome-horiz",

  // HAND-PLACED — CONFIDENT. Melissa, 2026-09-11: "this is after josh and luna
  // broke up, about a month." The clip either side of it is the one-month mark
  // in her journal ("A month, and he made me go out"), so this sits with it.
  // HAND-PLACED — REASONED, 2026-10-18, Melissa to move it. Josh asks Tyson
  // to talk to Luna, and Tyson gives his word. Josh is still calling her and
  // she is asking him to stop, so it is early in the six months — and canon
  // puts the promise months before Tyson works out what he feels. Beside the
  // other Josh-and-Tyson scene of the early months.
  "josh-ty-kitchen-corner",
  "josh-ty-ricks-house",
  // HAND-PLACED — A GUESS, 2026-10-27, Melissa to move it. The lakehouse
  // fight: Josh has asked Luna whether she is coming home and keeps asking
  // Tyson at the farm, so it follows Come Home and Josh asking Tyson to talk
  // to her. Still the early months ("since you left him").
  "luna-ty-lkehous-fight",

  "luna-tyson-dance",
  "luna-tyson-gingerale",
  // HAND-PLACED — REASONED, 2026-10-11. The suit: early in the separation
  // (Melissa), and the first time their closeness feels different. Before
  // "Most Nights" and "Wasn't Planning On It", which read as later steps of
  // the same thing. Move it if she places it.
  "luna-ty-suit",
  // Melissa, 2026-10-13: the next night — the event the suit was for.
  "luna-josh-ty-event",

  // HAND-PLACED — REASONED, 2026-10-13, Melissa to move it. The light bulb:
  // an ordinary afternoon at the lakehouse with the ease back, so it sits at
  // the start of the settled middle, beside "Most Nights".
  "luna-ty-bulb",
  // HAND-PLACED — A GUESS, 2026-10-21, Melissa to move it. The wrong address:
  // a lens run across Denver, all teasing and no weight, so it sits with the
  // light bulb in the easy stretch. Nothing in it dates it.
  "luna-ty-driving",

  // HAND-PLACED — REASONED. Published 2026-09-20. An evening where nothing
  // happens, which puts it in the settled middle of the six months rather than
  // at either end: after the night out and the morning after it, before
  // anything between them stops being friendship. The ease in it is the
  // argument — they are not new to this and nothing has gone wrong yet.
  "luna-ty-couch",
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

  // HAND-PLACED, 2026-10-09. The interview itself — a future season, and the
  // start of the run it sets off: the detectives, then Josh ("Then Tell Me",
  // a post, so not in this list), then Tyson. Directly before the scene
  // below for that reason.
  "luna-detectives",

  // HAND-PLACED — CONFIRMED LAST. Melissa, 2026-09-24: "this scene is way in
  // the future. prob the latest scene we have." The detectives, and Tyson
  // keeping her out of it. If later scenes arrive, this is where they go.
  "luna-ty-detectives",

  // HAND-PLACED — REASONED, 2026-10-28. The alley: "someone's asking
  // questions" follows the detectives, and Melissa's brief for the arc puts
  // it at Vale Studios, so the studio era. Latest scene we have.
  "luna-alley-attack",
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
  /*
   * Not clips in the story, and each for its own reason: the trailer is about
   * the story, the interview is the cast out of character, and the PILOT is
   * the story itself rather than a piece cut out of it. STORY_ORDER exists to
   * put the fragments in sequence; an episode does not belong in a list whose
   * whole purpose is to compensate for not having episodes.
   */
  // Episodes are read from the season rather than listed by hand, so each new
  // one is exempt the day it is added (2026-09-29, episode 2).
  const EXEMPT = new Set([
    "between-us-trailer-one",
    // A trailer for a season away, not a beat in this one (2026-10-09).
    "luna-detectives-trailer",
    "interview",
    ...SEASONS.flatMap((s) => s.episodes.map((e) => e.slug).filter(Boolean)),
  ]);
  const ordered = new Set(STORY_ORDER);
  const missing = videos
    .filter((v) => !v.hidden && !EXEMPT.has(v.slug) && !ordered.has(v.slug))
    .map((v) => v.slug);
  const known = new Set(videos.map((v) => v.slug));
  const unknown = STORY_ORDER.filter((s) => !known.has(s));
  return { missing, unknown };
}
