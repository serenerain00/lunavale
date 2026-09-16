/**
 * The category rows under the hero — the same library, cut several ways.
 *
 * WHY. Melissa, 2026-09-16: "the rest of the site, below the hero, will
 * categorize each scene clip by category… i wanna show viewers rich content."
 * One long shelf of 46 clips in story order is a correct list and a thin
 * front page: it gives a visitor exactly one reason to scroll, and if the
 * first four posters do not land there is no second chance. Cutting the same
 * clips by who is in them, where it happens and what it feels like turns one
 * row into eight, and every row is another chance for something to catch.
 *
 * DERIVED FROM THE CLIPS, NOT A SECOND LIST TO MAINTAIN. Every row below is a
 * predicate over lib/content/videos.ts — `about`, `place`, `feelings` — so a
 * clip joins its rows the moment it is published and cannot be forgotten. The
 * labels and the one-line notes are written by hand, because "Luna & Tyson" is
 * a better heading than "about includes luna and tyson" and no amount of
 * cleverness generates "Twenty years, and neither of them will say it."
 *
 * ORDER INSIDE A ROW IS STORY ORDER. A category is a slice of the story, and a
 * slice of a sequence is still a sequence — reading a row left to right should
 * move forwards, not jump about.
 *
 * ROWS THAT WOULD BE THIN DO NOT RENDER. `categories()` drops anything under
 * MIN_IN_ROW, so a category cannot appear as a heading with two cards under
 * it, and one that grows into existence later starts appearing on its own.
 * That is also why the counts are not written down anywhere here: they change.
 *
 * THIS IS NOT /browse. That page filters, exhaustively, and answers "show me
 * everything tagged X". This one is a front page: a handful of the best cuts,
 * each capped, each with a way through to the full filter. The overlap is the
 * point — the rows teach the vocabulary that the filter page then uses.
 */

import { inStoryOrder } from "@/lib/content/chronology";
import type { Video } from "@/lib/content/videos";
import type { FeelingId, PersonId, PlaceId } from "@/lib/content/taxonomy";

export interface Category {
  /** Stable id, used as a React key. */
  id: string;
  /** The row heading. Short enough to scan. */
  label: string;
  /** One quiet line under it, or nothing. Never a sentence explaining the row. */
  note?: string;
  /**
   * Where "See all" goes: the clip index, filtered to this category.
   *
   * NOT /browse?people=… — that page parses only `feeling` and `place`, so a
   * people filter would have been dropped on arrival and the link would have
   * quietly shown the whole catalog. /clips owns this vocabulary because this
   * module defines it, which means one predicate decides both what is in the
   * row and what is on the page it opens.
   */
  href: string;
  clips: Video[];
}

/** Below this, a row is not worth a heading. */
const MIN_IN_ROW = 4;

/** Above this, the rest is behind "See all". */
const MAX_IN_ROW = 14;

const has = (v: Video, who: PersonId) => v.about?.includes(who) ?? false;
const only = (v: Video, ...who: PersonId[]) =>
  who.every((p) => has(v, p)) &&
  !(["luna", "josh", "tyson"] as PersonId[])
    .filter((p) => !who.includes(p))
    .some((p) => has(v, p));

interface Definition {
  id: string;
  label: string;
  note?: string;
  match: (v: Video) => boolean;
}

/**
 * The rows, in the order they appear.
 *
 * WHO COMES BEFORE WHERE AND FEELING, on purpose. This is a story about three
 * people and the question a new visitor is actually holding is "who are these
 * two and what is going on between them" — a room or a mood is only
 * interesting once you know that.
 */
const DEFINITIONS: Definition[] = [
  {
    id: "luna-tyson",
    label: "Luna & Tyson",
    note: "Twenty years, and neither of them will say it.",
    match: (v) => only(v, "luna", "tyson"),
  },
  {
    id: "luna-josh",
    label: "Luna & Josh",
    note: "Ten years, then six months apart, then he called.",
    match: (v) => only(v, "luna", "josh"),
  },
  {
    id: "all-three",
    label: "All three in the room",
    note: "The ones where it cannot stay unsaid.",
    match: (v) => has(v, "luna") && has(v, "josh") && has(v, "tyson"),
  },
  {
    id: "lakehouse",
    label: "At the lakehouse",
    note: "Where she went when the farmhouse stopped being hers.",
    match: (v) => v.place === ("lakehouse" as PlaceId),
  },
  {
    id: "farmhouse",
    label: "The farmhouse",
    note: "Ten years of their life, and the rooms that remember it.",
    match: (v) => v.place === ("farmhouse" as PlaceId),
  },
  {
    id: "late",
    label: "Late, and nobody sober",
    note: "Bars, kitchens, and the things that only get said after midnight.",
    match: (v) =>
      v.place === ("bar" as PlaceId) ||
      (v.feelings?.includes("lies" as FeelingId) ?? false),
  },
  {
    id: "distance",
    label: "The distance",
    note: "Somebody stops picking up, and nobody explains why.",
    match: (v) => v.feelings?.includes("distance" as FeelingId) ?? false,
  },
  {
    id: "desire",
    label: "What they will not say",
    note: "Close enough to do something about it. Neither of them does.",
    match: (v) => v.feelings?.includes("desire" as FeelingId) ?? false,
  },
];

/**
 * The rows that have enough in them to be worth showing, capped.
 *
 * A clip appearing in several rows is correct and deliberate — "Luna & Tyson"
 * and "The distance" are different questions and the same clip can be a good
 * answer to both. A front page is not a partition.
 */
/** One category by id, for the filtered clip index. */
export function getCategory(id: string): Category | undefined {
  return categories().find((c) => c.id === id);
}

/**
 * Every clip in a category, uncapped — the row shows MAX_IN_ROW, the page
 * behind it shows all of them.
 */
export function clipsInCategory(id: string): Video[] {
  const d = DEFINITIONS.find((x) => x.id === id);
  return d ? inStoryOrder().filter(d.match) : [];
}

export function categories(): Category[] {
  const story = inStoryOrder();
  return DEFINITIONS.flatMap((d) => {
    const clips = story.filter(d.match);
    if (clips.length < MIN_IN_ROW) return [];
    return [
      {
        id: d.id,
        label: d.label,
        note: d.note,
        href: `/clips?category=${d.id}`,
        clips: clips.slice(0, MAX_IN_ROW),
      },
    ];
  });
}
