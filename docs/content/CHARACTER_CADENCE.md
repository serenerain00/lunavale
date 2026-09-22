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
re-run 2026-09-22 against `main` at 71ec661. The 2026-07-28 row is kept beneath
so the drift is visible.

| | Notes | Total pieces | Members-only |
| --- | --- | --- | --- |
| Luna | 12 | 169 | 145 |
| Tyson | 12 | 129 | 115 |
| Josh | 14 | 103 | 91 |
| Rick | 1 | 10 | 9 |

*As built, 2026-07-28: Luna 8 / 44 / 23 · Tyson 8 / 44 / 33 · Josh 8 / 35 / 21.
Rick was not on the table at all. Figures above include this week's note.*

> These numbers move fast. Total pieces were 105 / 79 / 79 / 4 in late August and
> 126 / 94 / 86 / 4 a fortnight ago; the trailer, the new clips and the pages
> that landed on `main` through September added another seventy-odd, and the same
> push put almost everything behind membership — which is why the members-only
> column now sits just under the total. Re-run the two functions rather than
> trusting the table.

**Josh is the thinnest of the three leads again.** He has the most *notes* of
anyone, but he is bottom on total pieces, and the gap is still widening even
when he gains: the 2026-09-21 launch batch gave him three pieces, the most he
has had in a month, and Tyson's lead over him went from 25 to 26 anyway. Volume
was never the real measure for him: he is the hardest character to hold an
audience's sympathy for, and the whole story depends on him being genuinely
likeable before he turns. What to watch is how much of his material makes that
case — and on that, the launch was good for him. **He is one of the three the
pilot is about**, which is now the first thing a new member watches.

**Rick is the real hole.** Ten pieces against Josh's hundred-odd, and he is the
entire explanation for Josh. Every note written for Rick is doing double duty on
the character the story most needs an audience to like first, which makes him
the cheapest way to feed Josh as well. September gave him two more appearances,
both noteless: `josh-ty-ricks-house`, and `ty-josh-rick-accident` — *What Was
Agreed*, the accident, published **free** and placed first in the story. A note
on a free piece is the shop window, and that one is free, first, and about the
character who explains Josh, which is what makes it the highest-value gap on
this list — not merely that it is open. `luna-ty-couch` is free and uncovered
too as of 2026-09-20, but it pays into the two characters who need it least.

> **READ THE OPEN PULL REQUESTS BEFORE PICKING A SUBJECT.** Added 2026-08-25,
> updated 2026-09-21. The backlog below describes `main`, and `main` is behind:
> the drops for 2026-08-03, 08-10, 08-17, 08-31, 09-07, 09-14 and 09-21 are all
> still open and unmerged (#1, #2, #3, #5, #6, #7, #8), as is this one (#4) —
> **eight weeks of drops, nothing landed.** A weekly run clones the repo fresh,
> so it cannot see any of them — and **seven** separate weeks have now
> independently picked the same obvious gap and written the same note, a Rick
> `insight` note on `josh-rick-lake`: #2, #3, #5, #6, #7, #8, and #4 before it
> was rewritten. The ids differ (#5 `rick-i-already-knew`, #8
> `rick-already-knew`), so merging two of them would not collide — it would
> quietly give Rick the same page twice. Whatever this file says is uncovered,
> check it against the open PRs first.
>
> **This paragraph cannot fix that on its own, and it has now failed four
> times.** It has only ever existed on #4's branch, never on `main`, so the
> 08-31, 09-07, 09-14 and 09-21 runs could not read it and duplicated anyway. It
> becomes effective the moment anything carrying it lands on `main`. Until then
> the only reliable control is the weekly routine's own stored prompt, which is
> the maintainer's to change.
>
> **The count tables across the open PRs disagree, and all of them are right.**
> Each branch's `countFor()` sees that branch's own note, so #3 and #8 read Josh
> 13 / Rick 2 while this one reads Josh 14 / Rick 1. Do not "correct" another
> PR's table against this one; recount on whatever tree you are actually on.

Standing backlog, roughly prioritised:

- **`pilot` — *Episode 1 (Pilot)*, published 2026-09-21, and nothing has a note
  on it.** This is now the top of the list. It is the longest thing in the
  library (18½ minutes), it is about Luna, Josh and Tyson, and it is the first
  thing a new member watches. It is `premium`, but the first minute is public
  and is already on Instagram, so the episode is back in the sitemap — a note on
  it is reachable in a way a note on an ordinary gated clip is not. Two
  cautions: it is `mature` and carries `notes: ["danger"]`, and the entry's own
  comment says the constraint on everything about it is **not to spend the
  intro**. Read Melissa's synopsis in `videos.ts` rather than writing off frames
  — she replaced a frames-written one there, and the comment explains why
- Josh clips with no note yet: `luna-josh-break`, `luna-josh-bed-flashback`,
  `luna-josh-first-night`, `luna-josh-fair` *(taken by #4)*, and `josh-luna-wall`
  — the last of which Melissa may want to write herself, as she is holding the
  journal entry for it
- `luna-tyson-dance` has no note from either of them. It went members-only in
  the September push, so a note on it is no longer a shop window — but it is
  still two leads and uncovered
- `luna-ty-couch` — *Most Nights*, published **free** on 2026-09-20 — has no
  note either, and its own comment in `videos.ts` says nothing happens in it on
  purpose: he looks over six times and she never catches him. That is a note
  waiting to be written, and being free it would convert. Weigh it against the
  fact that Luna and Tyson are already the best-fed characters on the table
- Rick is in four clips. Three carry no note on `main`, though one of those
  three is the contested slot rather than a real gap. `josh-rick-study` has
  two notes already (`rick-the-chair`, `josh-the-study`); `josh-rick-lake` is the
  one every open drop keeps re-writing; `josh-ty-ricks-house` has nothing; and
  `ty-josh-rick-accident` — *What Was Agreed* — has nothing either and is
  **free**, which makes it the one to take first. Mind the canon: the accident
  moved to 8–10 years ago on 2026-09-18 and Luna and Josh were already together
  by then, so read *"TIMELINE — CANONICAL, 2026-09-18"* in
  `BETWEEN_US_SECRET_CANON.md` before writing a word of it — and note that two
  sections there are both numbered 12, so go by the title, not the number. After
  those two, the next Rick piece has to come from somewhere other than a clip —
  the brewery, the liquor, what he made of Luna across ten years
- First notes for Cathy and Avery, who have none at all
- A Tyson note on `luna-tyson-bar` from the other side of the table
- Luna notes on the galleries — `the-night`, `the-firepit` — which have none
- Notes on the vertical posts; only `run-at-the-lake` has one
- Wire `notesForScene()` into `/clips/<slug>` so a clip's note appears under the
  player, which is where a members-only note converts best. NOTE the route moved
  — this said `/watch/<slug>` until 2026-09-18, and that path is gone

## Log

Add a line per week. Keep it short — this is a record that the cadence held,
not a changelog.

| Week of | What shipped | Who |
| --- | --- | --- |
| 2026-07-28 | Character hubs built; 24 Between Takes notes (8 each), 7 free | all three |
| 2026-08-24 | Between Takes note "Asking it straight" on `luna-josh-fair`, premium; counts table re-read off the app | Josh |
