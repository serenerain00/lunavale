/**
 * The conversion baseline, and every change that landed inside it.
 *
 * The plan (docs/conversion/INSTAGRAM_FIRST_VISIT_AUDIT.md) was two clean
 * weeks, Oct 11–25, with no conversion changes, read before the first test.
 * When something ships inside that window anyway, it is recorded here, not
 * quietly absorbed: /admin/conversion and the weekly report print every break
 * that falls in the range they show, so a before/after comparison across one
 * is never read as if nothing changed.
 *
 * Pure data. Add a row whenever a change could move a funnel step.
 */

export const BASELINE = { from: "2026-10-11", to: "2026-10-25" } as const;

export interface BaselineBreak {
  /** UTC day the change went live. */
  on: string;
  what: string;
  /** Which numbers it moves, and how to compare across it. */
  effect: string;
}

export const BREAKS: readonly BaselineBreak[] = [
  {
    on: "2026-10-13",
    what: "Join became a POST: one tap now opens one Stripe checkout (5049baf).",
    effect:
      "Before this, each tap opened 2–3 sessions, so \"checkouts opened\" before Oct 13 is roughly double. Compare people (emails typed, paid), not sessions, across this date.",
  },
  {
    on: "2026-10-13",
    what: "Join box under the player on first play, for non-members: \"Watch everything · $8/month [Join]\" (d1dcbf3). Melissa's decision, inside the baseline.",
    effect:
      "A new route to checkout that skips /membership, so /membership views → checkout no longer covers every checkout. Its sessions carry entry=play and are counted separately under \"By entry point\".",
  },
  {
    on: "2026-10-13",
    what: "Join no longer opens a checkout for somebody who has already paid: members (and pay-first buyers, now claimed on any page) go to /account; a browser that paid but has no account yet goes back to /welcome.",
    effect:
      "Removes duplicate payments (Oct 5, Oct 13). \"Paid\" counts after this date can drop by those duplicates; they were never new members, so compare people, not payments.",
  },
  {
    on: "2026-10-18",
    what: "Facebook page launched (traffic ~3x in a day) and /go/fb added: Facebook links now arrive tagged utm_source=facebook, utm_campaign=fb-page.",
    effect:
      "Not a change to the funnel itself, but a new audience inside the baseline window. Compare Instagram-sourced rows across this date, not totals; Facebook-tagged visits that would have been untagged (app with no referrer) now show as facebook.",
  },
  {
    on: "2026-10-18",
    what: "From the Facebook conversion audit, all approved by Melissa: the header Join shows the price (\"Join · $8/mo\"); the home page's first screen is an A/B test (first-screen: control vs a series screen with Join · $8/month → /membership); the membership page opens with the episodes; the pilot's free preview is longer; Google sign-in is hidden inside Facebook/Instagram's browsers; unclaimed buyers get an automatic reminder after an hour.",
    effect:
      "Several changes on one day, so before/after comparisons across Oct 18 cannot separate them — the A/B test is the only clean read, and only for the first screen. \"Direct\" is now a recorded source, and Facebook plays are counted as Facebook, so source splits before Oct 18 are not comparable.",
  },
  {
    on: "2026-10-22",
    what: "Episode 1 (Pilot) free to everyone, in full, through Wednesday Oct 28 (Pacific); Melissa's test of what a free pilot does for subscriptions. Its 3:10 preview comes back by itself after (Video.openUntil). The same day it became the pinned home hero for the same window, saying so in amber; the Season 1 card says it too; the first-screen test's series arm plays the pilot (pilot_play) instead of the trailer. Hero synopses are clamped to three lines from here on. Also from Oct 21: paying makes the account (AUTO_ACCOUNT).",
    effect:
      "Pilot plays by non-members are whole-episode plays this week, so preview_end counts for the pilot drop to near zero and the Join box under the player is the pilot's only in-player route to checkout. Compare paid signups Oct 22–28 against the weeks either side, people not payments; the first-screen A/B runs through it, both arms equally.",
  },
];

/** Breaks that went live on or between two UTC days (inclusive). */
export function breaksBetween(from: string, to: string): BaselineBreak[] {
  return BREAKS.filter((b) => b.on >= from && b.on <= to);
}

/** Checkouts tagged with an entry point; untagged ones came from /membership or an older link. */
export const ENTRY_LABELS: Record<string, string> = {
  play: "Join box under the player",
  hero: "Join on the home page's first screen (first-screen test, series arm)",
  "": "Membership page (or an older link)",
};
