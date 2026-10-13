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
];

/** Breaks that went live on or between two UTC days (inclusive). */
export function breaksBetween(from: string, to: string): BaselineBreak[] {
  return BREAKS.filter((b) => b.on >= from && b.on <= to);
}

/** Checkouts tagged with an entry point; untagged ones came from /membership or an older link. */
export const ENTRY_LABELS: Record<string, string> = {
  play: "Join box under the player",
  "": "Membership page (or an older link)",
};
