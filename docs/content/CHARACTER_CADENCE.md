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

Recounted 2026-08-10 (the 2026-07-28 figures had drifted a long way — journal
entries, clips and two more scenes have landed since):

| | Notes | Total pieces | Members-only |
| --- | --- | --- | --- |
| Luna | 8 | 82 | 52 |
| Tyson | 9 | 63 | 50 |
| Josh | 10 | 60 | 36 |
| Rick | 2 | 5 | 2 |

**Josh is the thinnest** and is the one who benefits most from more. He is the
hardest character to hold an audience's sympathy for, the whole story depends
on him being genuinely likeable before he turns, and he has the fewest pieces
making that case.

Standing backlog, roughly prioritised:

- Josh notes on the scenes he is in that have none yet
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
| 2026-08-10 | Between Takes note — "Whose water it is", on The Lake. Rick's second. | rick |
