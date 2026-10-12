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
re-run 2026-10-12 against `main` at 5ebf06d. The 2026-07-28 row is kept beneath
so the drift is visible.

| | Notes | Total pieces | Members-only |
| --- | --- | --- | --- |
| Luna | 12 | 204 | 173 |
| Tyson | 12 | 147 | 129 |
| Josh | 14 | 129 | 114 |
| Rick | 1 | 14 | 13 |
| Cathy | 0 | 13 | 13 |
| Avery | 0 | 7 | 7 |

*As built, 2026-07-28: Luna 8 / 44 / 23 · Tyson 8 / 44 / 33 · Josh 8 / 35 / 21.
Rick, Cathy and Avery were not on the table at all. Figures above include this
week's note.*

> These numbers move fast. Total pieces were 105 / 79 / 79 / 4 in late August,
> 126 / 94 / 86 / 4 in mid-September and 172 / 132 / 104 / 10 a fortnight ago.
> Episodes 2 and 3, the new clips and Luna's old journal added another
> seventy-odd in early October. Cathy and Avery earned their rows in the same
> push. Re-run the two functions rather than trusting the table.

**Josh is the thinnest of the three leads, and the gap no longer has a
direction.** He has the most *notes* of anyone and is still bottom on total
pieces. Tyson's lead over him went 25 before the September launch → 28 → 19 →
17 → **18 at 5ebf06d**: it widened for six weeks, snapped in hard when episodes
2 and 3 landed (both are about Luna, Josh and Tyson, so they pay the two of them
equally while Josh started from behind), and has since been drifting a point
either way. **Treat it as noise in the high teens, not a trend.** *(This
paragraph has now been wrong twice: it claimed the direction had never changed,
which died on 2026-10-09, and then that the gap was closing, which died on
10-12. Do not write a third trend sentence — re-derive the two numbers and quote
them.)* Volume was never the real
measure for him anyway: he is the hardest character to hold an audience's
sympathy for, and the whole story depends on him being genuinely likeable before
he turns. What to watch is how much of his material makes that case. **He is one
of the three all three episodes are about**, and the episodes are the first
thing a new member watches.

**Rick is the real hole.** Fourteen pieces against Josh's hundred-and-twenty-odd,
and he is the entire explanation for Josh. Every note written for Rick is doing
double duty on the character the story most needs an audience to like first,
which makes him the cheapest way to feed Josh as well. He is in seven clips now
and **six of them carry no note**: `josh-ty-ricks-house` (*The Safe*),
`ty-josh-rick-accident` (*What Was Agreed*), `josh-rick-lake` (*The Lake* — the
contested slot, not a real gap), both episodes, and `luna-detectives` (*The
Interview*, 2026-10-11) — October keeps adding him to things. Only
`josh-rick-study` is covered. The accident is still the
one to take first: published **free**, second in the order, and about the
character who explains Josh — a note on a free piece is the shop window, and
that is what makes it the highest-value Rick gap, not merely that it is open.
*(It opened the story until 2026-09-22, when `ty-luna-young` took first place.
Do not restore the "first in the story" phrasing; check `STORY_ORDER` before
making that claim about anything.)* Five other free pieces are uncovered as well
— `luna-ty-couch`, `ty-luna-young`, `luna-tyson-shaving`, `young-luna-ty-apt`
and `luna-truck-breakdown` — but every one of them pays into the two characters
who need it least.

> **READ THE OPEN PULL REQUESTS BEFORE PICKING A SUBJECT.** Added 2026-08-25,
> updated 2026-10-12. The backlog below describes `main`, and `main` is behind:
> the drops for 2026-08-03, 08-10, 08-17, 08-31, 09-07, 09-14, 09-21, 10-05 and
> 10-12 are all still open and unmerged (#1, #2, #3, #5, #6, #7, #8, #9, #10), as
> is this one (#4) — **ten weeks of drops, nothing landed.** A weekly run clones
> the repo fresh, so it cannot see any of them — and **nine** separate weeks have
> now independently picked the same obvious gap and written the same note, a Rick
> `insight` note on `josh-rick-lake`: #2, #3, #5, #6, #7, #8, #9, #10, and #4
> before it was rewritten. The ids differ (#5 `rick-i-already-knew`, #8
> `rick-already-knew`, #9 `rick-the-line-in-the-water`, #10
> `rick-round-the-outside`), so merging two of them
> would not collide — it would quietly give Rick the same page twice. Whatever
> this file says is uncovered, check it against the open PRs first.
>
> **This paragraph cannot fix that on its own, and it has now failed six
> times.** It has only ever existed on #4's branch, never on `main`, so the
> 08-31, 09-07, 09-14, 09-21, 10-05 and 10-12 runs could not read it and
> duplicated anyway. It becomes effective the moment anything carrying it lands on `main`.
> Until then the only reliable control is the weekly routine's own stored prompt,
> which is the maintainer's to change.
>
> *(There was no 2026-09-28 drop: that run was refused by an account rate limit
> before it read anything. The gap in the dates above is that, not a week off.)*
>
> **The count tables across the open PRs disagree, and all of them are right.**
> Each branch's `countFor()` sees that branch's own note, so #3, #8 and #9 read
> Josh 13 / Rick 2 while this one reads Josh 14 / Rick 1. #10 shows it cleanly:
> it branched off **the same `main` as this one** (5ebf06d) and reads Josh
> 13 / 128 / 113 and Rick 2 / 15 / 14 against this branch's Josh 14 / 129 / 114
> and Rick 1 / 14 / 13 — same library, and the entire difference is which single
> note each tree carries. Do not "correct"
> another PR's table against this one; recount on whatever tree you are actually
> on.

Standing backlog, roughly prioritised:

- **The three episodes carry no note between them.** This is the top of the
  list, and in October it stopped being one item: `pilot` (*Episode 1*,
  2026-09-21, 18:36, `mature`, `notes: ["danger"]`), `episode-2` (*Breathe*,
  22:23) and `episode-3` (*The Space Between*, 21:35). All three are `premium`
  with a free opening — `preview.durationSeconds` reads 60, 124 and 129, so a
  minute on the pilot and about two on each of the others, not the "1:30" an
  early commit message said of Breathe before it was recut. That preview is what
  keeps them in the sitemap, so a note on an
  episode is reachable in a way a note on an ordinary gated clip is not. They
  are the first thing a new member watches, and 2 and 3 add Rick to the cast,
  so a note on either pays Josh *and* Rick. *(The pilot is no longer the longest
  thing in the library — `episode-2` is, by nearly four minutes. Don't restore
  that claim; read `durationSeconds` in `videos.ts`.)* For the pilot, the
  entry's own comment says the constraint on everything about it is **not to
  spend the intro**. Read Melissa's synopsis in `videos.ts` for each rather than
  writing off frames — she replaced the frames-written ones there, and the
  comments explain why
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
- `ty-luna-young` — *Pick Me Up*, published **free** on 2026-09-22 — is
  uncovered, and it is now **first in `STORY_ORDER`**: Atlanta at eighteen, she
  rings him from a party, he comes anyway. It is the front door of the ordered
  library and the earliest footage on the site by nine years, so a note on it is
  the most-seen page a note could have. Same caveat as the couch — it pays into
  Luna and Tyson — but the placement is worth more here than it is there. It
  pairs with the journal entry `the-rule` via `sceneSlug`, and both cuts are
  free (the 9:16 is the post `pick-me-up`), so read that entry first
- Rick is in seven clips as of 2026-10-11. Six carry no note on `main`, though
  one of those six is the contested slot rather than a real gap. `josh-rick-study`
  is the only covered one (`rick-the-chair`, `josh-the-study`); `josh-rick-lake`
  is the one every open drop keeps re-writing; `josh-ty-ricks-house` has
  nothing; `episode-2` and `episode-3` have nothing and are covered by the
  episodes item above; `luna-detectives` (*The Interview*) has nothing and is
  new on 2026-10-11; and `ty-josh-rick-accident` — *What Was Agreed* — has
  nothing either and is **free**, which makes it the Rick one to take first (it
  is second in the order now, not first; `ty-luna-young` took the opening on
  2026-09-22). Mind the canon: the accident
  moved to 8–10 years ago on 2026-09-18, Luna and Josh were already together
  by then, and October added that Josh came home that night — so read
  *"TIMELINE — CANONICAL, 2026-09-18"* in `BETWEEN_US_SECRET_CANON.md` before
  writing a word of it, and note that two
  sections there are both numbered 12, so go by the title, not the number. After
  those two, the next Rick piece has to come from somewhere other than a clip —
  the brewery, the liquor, what he made of Luna across ten years
- First notes for Cathy and Avery. They are no longer empty — October gave them
  thirteen and seven pieces, a kitchen clip (`avery-cathy-kitchen`, *Mom's
  Kitchen*) and Avery a real portrait — but neither has a single note, which now
  makes them the two largest wholly uncovered people on the table
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
