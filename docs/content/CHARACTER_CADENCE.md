# Character Content — Weekly Cadence

**Commitment: one character drop per week.** Agreed 2026-07-28.

## Why weekly, and why this specifically

Retention is a content cadence problem before it is a UX problem. A member who
has run out of things to read cancels, and no interface prevents that — see
`docs/monetization/MEMBERSHIP_OPTIMIZATION.md`.

The character hubs (`/characters/<id>`) are the cheapest surface to feed. A new
Between Takes note is a few paragraphs; it needs no shoot, no edit, and no
media pipeline. It lands on a page that already exists, and most of them are
members-only, so each one is a small, visible reason the Vault was worth it.

Compare that to a new scene, which needs footage. Weekly scenes are not
realistic. Weekly *notes* are.

## What counts as a drop

In rough order of cost:

1. **A Between Takes note** — `lib/content/between-takes.ts`. The default. One
   note, 2–4 short paragraphs, tied to a real scene / gallery / clip.
2. **A journal entry** — `lib/content/journal.ts`. Higher value and much more
   canon-sensitive; this is Luna's interior voice.
3. **A detail or intro revision** — `lib/content/characters.ts`. Cheap, and the
   intros are still draft prose written to canon rather than by Melissa.
4. **New media tagged to a person** — a still set or clip with `about` set.
   Highest value, highest cost.

A drop is one of these, not all of them. The point is that something on a
character page changed this week.

## Keep the promise conservative

`lib/content/membership.ts` currently tells members *"New material lands every
month."* Leave it that way even while shipping weekly. Under-promise and
over-deliver: a monthly promise kept for a year is worth more than a weekly
promise missed twice. Only raise the copy once the cadence has survived a
couple of months.

## Where the gaps are

Read off `countFor()` / `lockedCountFor()` in `lib/content/characters.ts`,
2026-08-24. The 2026-07-28 row is kept beneath so the drift is visible.

| | Notes | Total pieces | Members-only |
| --- | --- | --- | --- |
| Luna | 12 | 105 | 80 |
| Tyson | 12 | 79 | 66 |
| Josh | 14 | 79 | 62 |
| Rick | 1 | 4 | 2 |

*As built, 2026-07-28: Luna 8 / 44 / 23 · Tyson 8 / 44 / 33 · Josh 8 / 35 / 21.
Rick was not on the table at all. Figures above include this week's note.*

**Josh is level on volume and still needs the most.** He is even with Tyson on
total pieces now, but volume was never the real measure for him: he is the
hardest character to hold an audience's sympathy for, and the whole story
depends on him being genuinely likeable before he turns. What to watch is how
much of his material makes that case, not how much of it there is.

**Rick is the real hole.** Four pieces against Josh's seventy-nine, and he is
the entire explanation for Josh. Every note written for Rick is doing double
duty on the character the story most needs an audience to like first, which
makes him the cheapest way to feed Josh as well — but he is boxed in at one
note per scene, and both his scenes are covered once the open PRs land.

> **READ THE OPEN PULL REQUESTS BEFORE PICKING A SUBJECT.** Added 2026-08-25.
> The counts above and the backlog below describe `main`, and `main` is behind:
> the drops for 2026-08-03, 08-10 and 08-17 are all still open and unmerged
> (#1, #2, #3). A weekly run clones the repo fresh, so it cannot see them, and
> three consecutive weeks independently picked the same obvious gap and wrote
> the same note — a Rick note on `josh-rick-lake` (#2, #3, and this week's #4
> before it was rewritten). Whatever this file says is uncovered, check it
> against the open PRs first.

Standing backlog, roughly prioritised:

- Josh scenes with no note yet: `luna-josh-break`, `luna-josh-bed-flashback`,
  `luna-josh-first-night`, `luna-josh-fair` *(taken by #4)*, and `josh-luna-wall`
  — the last of which Melissa may want to write herself, as she is holding the
  journal entry for it
- `luna-tyson-dance` has no note from either of them, and it is free — so a note
  on it is a shop window rather than a spoiler
- Rick is boxed in. He is in two scenes: `josh-rick-study`, which already has
  `rick-the-chair`, and `josh-rick-lake`, which #2 and #3 both cover. Once one
  of those lands he has a note on everything he appears in, so the next Rick
  piece has to come from somewhere other than a scene — the brewery, the
  liquor, what he made of Luna across ten years
- First notes for Cathy and Avery, who have none at all
- A Tyson note on `luna-tyson-bar` from the other side of the table
- Luna notes on the galleries — `the-night`, `the-firepit` — which have none
- Notes on the clips; only `run-at-the-lake` has one
- Wire `notesForScene()` into `/watch/<slug>` so a scene's note appears under
  the player, which is where a members-only note converts best

## Log

Add a line per week. Keep it short — this is a record that the cadence held,
not a changelog.

| Week of | What shipped | Who |
| --- | --- | --- |
| 2026-07-28 | Character hubs built; 24 Between Takes notes (8 each), 7 free | all three |
| 2026-08-24 | Between Takes note "Asking it straight" on `luna-josh-fair`, premium; counts table re-read off the app | Josh |
