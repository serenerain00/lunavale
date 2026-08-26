/**
 * The release feed — everything that has gone up, newest first.
 *
 * WHY THIS EXISTS. The home page used to show one "Just added" card and
 * nothing else, which told a visitor that a thing arrived but not that things
 * KEEP arriving. Those are different promises, and the second one is what a
 * subscription is actually bought on: nobody pays monthly for a finished
 * object, they pay for the next one.
 *
 * The rhythm is real and was already being kept — a scene or a journal page
 * every other day through August — it simply was not visible anywhere on the
 * site. This module makes it visible without anyone having to maintain a list.
 *
 * DERIVED, NEVER HAND-WRITTEN. It reads the content modules, so a release
 * cannot appear here that is not really published, and nothing published with
 * a date can be forgotten. The moment somebody curates this by hand it starts
 * lying, and the thing it would lie about is the one claim on the page a
 * visitor can check.
 *
 * ONLY DATED THINGS APPEAR. Most of the journal predates `addedOn` and is
 * undated on purpose rather than back-filled by guesswork. Undated material is
 * simply older than everything here, which is true, and it means this list is
 * short and honest rather than long and invented.
 *
 * NO FUTURE DATES, AND NO SCHEDULE. There is deliberately no "next drop
 * Friday" anywhere in this file. The site does not have a release calendar it
 * can keep, and CLAUDE.md's rule against promising what we lack applies most
 * sharply to a promise about next week. What is shown is what has happened.
 */

import { journal, opening, type JournalEntry } from "@/lib/content/journal";
import { videos, type Video } from "@/lib/content/videos";

export type ReleaseKind = "scene" | "journal";

export interface Release {
  kind: ReleaseKind;
  /** ISO `YYYY-MM-DD`. Always present — undated material never gets this far. */
  date: string;
  title: string;
  href: string;
  /** "Free" / "Members" — the same word the card uses, decided at source. */
  access: "free" | "premium";
  /** Runtime for a scene; undefined for a journal page. */
  durationSeconds?: number;
  /**
   * Card art. SCENES ONLY.
   *
   * A journal page deliberately has none, and the card draws her handwriting
   * on ruled paper instead — the sheet JournalCard already uses on the index.
   *
   * The obvious alternative was tried and thrown out: letting an entry borrow
   * the poster of the scene it sits beside (`sceneSlug`). It reads fine in
   * isolation and fails in the one arrangement that actually occurs — a scene
   * and her account of it go up the same day, so they land side by side in the
   * rail and the row opens on the same photograph twice. The paper says what
   * the borrowed poster could not: this is a page, not a film.
   */
  poster?: string;
  /**
   * One or two lines of what the thing is: the scene's synopsis, or her real
   * opening sentence. The opening line is already the journal's shop window
   * (see JournalCard) — a locked page shows the handwriting and withholds the
   * rest, and a card in a rail is the same promise in a smaller frame.
   */
  blurb: string;
  /** Carried through so a card can wear the same label the catalog uses. */
  mature?: boolean;
  /** Journal only: the room, when she names one. */
  where?: string;
}

function fromScene(v: Video): Release {
  return {
    kind: "scene",
    date: v.addedOn!,
    title: v.title,
    href: `/watch/${v.slug}`,
    access: v.access,
    durationSeconds: v.durationSeconds,
    poster: v.poster,
    blurb: v.synopsis,
    mature: v.mature,
  };
}

function fromEntry(e: JournalEntry): Release {
  return {
    kind: "journal",
    date: e.addedOn!,
    // The dateline is how she heads the page, and it reads better in a list
    // than the id would. It is already written to be read cold.
    title: e.dateline,
    href: `/journal/${e.id}`,
    access: e.access,
    blurb: opening(e, 150),
    mature: e.mature,
    where: e.where,
  };
}

/**
 * Everything dated, newest first. `hidden` scenes are left out for the same
 * reason they are left out of the catalog — the interview is not a release in
 * the story.
 */
export function releases(): Release[] {
  return [
    ...videos.filter((v) => v.addedOn && !v.hidden).map(fromScene),
    ...journal.filter((e) => e.addedOn).map(fromEntry),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** The most recent `n`. */
export function recentReleases(n = 6): Release[] {
  return releases().slice(0, n);
}

/**
 * How often something has gone up lately, as a plain sentence — or undefined
 * when there is not enough dated history to say anything true.
 *
 * Deliberately vague ("every few days") rather than a computed average
 * rendered to one decimal place. "A release every 1.8 days" is the kind of
 * number that sounds like a promise and breaks the first week it slips.
 */
export function cadenceNote(now: Date = new Date()): string | undefined {
  const recent = releases().filter((r) => {
    const days = (now.getTime() - new Date(r.date).getTime()) / 86_400_000;
    return days >= 0 && days <= 30;
  });
  if (recent.length < 4) return undefined;

  const span = new Set(recent.map((r) => r.date)).size;
  const perWeek = (recent.length / 30) * 7;
  if (perWeek >= 4) return `${recent.length} new pieces in the last month`;
  if (span >= 4) return `Something new every few days`;
  return `${recent.length} new pieces in the last month`;
}

/**
 * "Aug 20" from "2026-08-20".
 *
 * Parsed off the STRING rather than through `new Date()`, deliberately. An ISO
 * date with no time is midnight UTC, and formatting that in a timezone behind
 * UTC renders the day before — which on a page whose whole job is "this went
 * up on this day" would be wrong for every visitor west of London.
 */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatReleaseDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} ${Number(d)}`;
}
