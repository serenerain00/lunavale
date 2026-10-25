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
   intros are still draft prose written to canon rather than by Melissa (the
   file header still says so: *"The beats are hers; the sentences are not"*).
   Less of a gap than it was, though — on 2026-10-14 the three leads' intros
   were rewritten against her character bible and gained an `inner` block of
   four rows (wants, afraid of, at their best, gets in their own way), and over
   10-15 and 10-16 she picked all three leads' portraits herself (Luna at the
   Denver Foundation event, Tyson in a white shirt at the lakehouse, Josh by the
   pool). **Rick, Cathy and
   Avery have no `inner` block at all**, which is now the cheapest real drop on
   the board.
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
re-run 2026-10-25 against `main` at 2598186. **A touched `lib/content/` file
does not mean the figures moved** — two merges on 10-15 and 10-16 swapped the
lead portraits one for one and changed nothing, so re-derive and say which it
was. The reverse holds too, and is the cheaper check: diff the file list first,
and if no `lib/content/` file appears the counts cannot have moved — that is how
the merge to c459e0f on 10-21 was handled, and the merge to 90843dd a few hours
later put two of those files back in the list, so run the check every time rather
than assuming either outcome. The 2026-07-28 row is kept beneath so the drift is
visible.

| | Notes | Total pieces | Members-only |
| --- | --- | --- | --- |
| Luna | 12 | 238 | 200 |
| Tyson | 12 | 169 | 146 |
| Josh | 14 | 145 | 127 |
| Rick | 1 | 14 | 13 |
| Cathy | 0 | 13 | 13 |
| Avery | 0 | 9 | 9 |
| Simone | 0 | 5 | 4 |

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
17 → 18 → 19 → 22 → 23 → **24 → 23 → 22 → 24 → 25 → 23 → 24 → 24 at 2598186** (Tyson 169, Josh 145 — Episode 5 pays both, so
the difference held while both numbers moved): it widened for six weeks, snapped in hard when episodes
2 and 3 landed (both are about Luna, Josh and Tyson, so they pay the two of them
equally while Josh started from behind), and has moved as much as three points in
a single day since. **It has sat anywhere between 17 and 28. Quote the two
current numbers at a sha and do not characterise the movement at all** — an
earlier version of this line said "noise in the high teens", which 22 killed.
*(This
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
making that claim about anything.)* Seven other free pieces are uncovered as well
— `luna-ty-couch`, `ty-luna-young`, `luna-tyson-shaving`, `young-luna-ty-apt`,
`young-luna-ty-seals` (new and free on 2026-10-13), `luna-ty-bulb` (*The Right
Bulb*, free, 2026-10-14, thirty-nine seconds) and `luna-truck-breakdown` —
but every one of them pays into the two characters who need it least.
*(`josh-ty-kitchen-corner` is free and uncovered too and is deliberately **not**
on this list: it pays Josh, which is the whole reason it ranks above everything
here. It is in the Josh item below. Do not file a free Josh or Rick piece under
this clause — it is what makes the clause true. **On 2026-10-22 that nearly
happened**: `luna-josh-frmhouse-comehome-horiz` (*Come Home*, free, 60s, Luna
and Josh) shipped straight into the free-and-uncovered set, and adding it here
would have made the clause false in the same commit that cited it. It is in the
Josh item too.)*

> **READ THE OPEN PULL REQUESTS BEFORE PICKING A SUBJECT.** Added 2026-08-25,
> updated 2026-10-12. The backlog below describes `main`, and `main` is behind:
> the drops for 2026-08-03, 08-10, 08-17, 08-31, 09-07, 09-14, 09-21, 10-05,
> 10-12 and 10-19 are all still open and unmerged (#1, #2, #3, #5, #6, #7, #8,
> #9, #10, #11), as is this one (#4) — **eleven weeks of drops, nothing landed.**
> A weekly run clones the repo fresh, so it cannot see any of them — and **ten**
> separate weeks have now independently picked the same obvious gap and written
> the same note, a Rick `insight` note on `josh-rick-lake`: #2, #3, #5, #6, #7,
> #8, #9, #10, #11, and #4 before it was rewritten. Most ids differ (#5
> `rick-i-already-knew`, #8 `rick-already-knew`, #9 `rick-the-line-in-the-water`),
> so merging two of those would not collide — it would quietly give Rick the same
> page twice. **#10 and #11 are the exception: both are `rick-round-the-outside`,
> same id and same heading**, so that pair would actually conflict rather than
> duplicate silently. Do not generalise either way — read the ids. Whatever
> this file says is uncovered, check it against the open PRs first.
>
> **This paragraph cannot fix that on its own, and it has now failed seven
> times.** It has only ever existed on #4's branch, never on `main`, so the
> 08-31, 09-07, 09-14, 09-21, 10-05, 10-12 and 10-19 runs could not read it and
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

> **SIMONE HAS LAUNCHED — AND THE GUARD THAT SAID OTHERWISE LASTED ONE DAY.**
> On 2026-10-20 canon said *"hold of on simone till i say"* and this block said
> to write nothing for her. On **2026-10-21** she shipped: a character card, a
> portrait, a `taxonomy.ts` person (`id: "simone"`), her reference promoted to
> **CANONICAL**, three journal entries, and the free vertical post
> `luna-ty-studio` (*The Studio*, 74s, `about: luna/tyson/simone`). `countFor`
> answers for her now — she is on the table above at 4 / 3. **She is a legitimate
> subject.** *(Recorded because the reverse of this paragraph was true yesterday:
> a status line about an unlaunched character is the shortest-lived claim in this
> file. Re-read her canon entry before trusting any sentence here about her.)*
>
> **TWO ENTRIES FOR HER NOW SIT IN `LUNA_VALE_CONTEXT.md`, AND THEY DISAGREE.**
> The 10-20 *CANONICAL* entry says so itself — *"the 2026-10-19 one further down
> disagrees"*. Her details moved: Manhattan rather than Brooklyn-born, **Studio
> Manager** rather than effectively a business partner, and the studio now has a
> name, **Vale Studios**. CLAUDE.md's rule decides it — *use the newest approved
> reference as canonical* — so read the 10-20 entry and ignore the one below it.
> **Miller** is still named-but-absent from `lib/content/`; **Cole** is published
> in `tyson-cole-bar`. Check `lib/content/` rather than guessing which it is.
>
> **THERE IS A CHARACTER BIBLE NOW, AND MOST OF IT MUST NOT REACH A NOTE.**
> `docs/content/BETWEEN_US_CHARACTER_BIBLE.md` arrived 2026-10-14. It is
> Melissa's, and it is **writer knowledge**. The header of
> `lib/content/characters.ts` records exactly what she allowed onto the public
> cast page — personality, wants, fears, blind spots, build and ink — and
> exactly what she kept off it: **anything about the accident beyond what *What
> Was Agreed* already shows for free, where the story goes after the
> reconciliation, Tyson's drinking history, and Miller (still PROPOSED).** Read
> the bible for who somebody is on any given day. Do not put the rest in a
> Between Takes note, which is a cast member talking about a shoot and has no
> business knowing the ending. The same rule that keeps the fall-fair note from
> loading Josh's one line applies here: the audience hears the second half
> coming long before it should.

> **WRITE THE NOTE IN AMERICAN ENGLISH.** As of 2026-10-20 the health check has
> a daily spelling check over `lib/content`, `lib/studio`, `lib/email`, `app`
> and `components` — everything a visitor reads — and `between-takes.ts` is in
> that set. A British spelling in a note will FAIL the run, not warn. There is a
> `BRITISH_OK` allow-list in `scripts/health-check.ts` for the handful of real
> exceptions (`aria-labelledby`, `normalis…`, `favouriteScene`, `cole-rang-him`
> and a few more); do not add to it to get a note through. **This file is not in
> scope** — `docs/` is internal, so its own spellings are nobody's problem.

Standing backlog, roughly prioritised:

- **Episode 5 landed on 2026-10-25 and it is the first episode that pays
  Simone.** *Everybody Has an Opinion*, `episode-5`, **premium**, 18:15, with the
  **taco scene free as a 96-second opening** (the hook starts at 732.97s —
  *"tacos, too much cilantro, and New York"*), poster of Luna smiling across the
  taco table at Tyson. `about` reads **Luna, Tyson, Josh *and* Simone**, so a
  note on it pays four people, which no other episode does. It was re-exported
  the same day — a filter was carrying into the next scene — and is served from
  `episode-5-v2.proxy.mp4` while the slug stays `episode-5`: **read `file`, not
  the slug, if you ever need the asset.** *(This item said "a fifth episode is
  promised and is not here yet" for two days, from the win-back email of 10-23.
  It is here. Do not restore the promise wording.)*
- **The five episodes carry no note between them.** This is the top of the
  list, and it keeps growing: `pilot` (*Episode 1*, 2026-09-21, 18:36,
  `notes: ["danger"]`), `episode-2` (*Breathe*, 22:23), `episode-3` (*The Space
  Between*, 21:35) and — new on 2026-10-18 — `episode-4` (*Peace and Quiet*,
  15:09, `notes: ["danger"]`), and — new on 2026-10-25 — `episode-5`
  (*Everybody Has an Opinion*, 18:15). All five are `premium` with a free opening
  — `preview.durationSeconds` reads **190**, 124, 129, 158 and **96** as of
  2026-10-25, so three minutes ten on the pilot, about two on the middle pair,
  the firefight on episode 4, and the **shortest of the five** on episode 5, the
  taco scene. (Not the "1:30" an early commit message said of Breathe before it
  was recut.) **These move on purpose — re-read all five before comparing them.**
  The pilot's window was 60 until 10-19, when Melissa approved lengthening it
  after the Facebook conversion audit: it was the most-played video for
  non-members the day Facebook arrived, its first minute is music-only with no
  dialogue, and the window now runs through the cold open to the last frame
  before the cut to the farmhouse. *(An earlier version of this item said
  episode 4 had the longest free opening of the four. That held for one day. The
  pilot does.)* That
  preview is what keeps them in the sitemap, so a note on an
  episode is reachable in a way a note on an ordinary gated clip is not. They
  are the first thing a new member watches. **Check `about` before claiming an
  episode pays a second character:** 2 and 3 carry Luna, Josh, Tyson *and*
  Rick, so a note on either pays Josh and Rick as well; **episode 4 is
  Tyson and Luna only**, so it pays into the two best-fed characters on the
  table and buys nothing for the two who need it; and **episode 5 carries Luna,
  Tyson, Josh and Simone** — four people, more than any other episode, and the
  only episode that reaches Simone at all. *(`episode-2` is the longest
  thing in the library, by nearly four minutes; the pilot is not, and episode 4
  is the shortest of the five. Don't restore either claim; read
  `durationSeconds` in `videos.ts`.)* For the pilot, the
  entry's own comment says the constraint on everything about it is **not to
  spend the intro**. Read Melissa's synopsis in `videos.ts` for each rather than
  writing off frames — she replaced the frames-written ones there, and the
  comments explain why. Episode 4's synopsis is deliberately written to give
  nothing away, so do not mine it for plot
- **`access` is no longer the same thing as what a visitor can watch, and the
  difference expires by itself.** On 2026-10-22 Melissa added `Video.openUntil`
  and set it on the **pilot** at `2026-10-29T07:00:00Z` — the end of Wednesday
  2026-10-28 in Pacific time. The pilot's `access` still reads `premium`, but
  `canWatch()` in `lib/access/entitlement.ts` returns true for everyone while the
  window is open, `openNow()` in `videos.ts` is the test, and the pilot is the
  home hero and says so on both first-screen arms while it lasts. So **a count of
  free pieces taken off `access` is one short of what is actually open** right
  now, and the list in this file is the `access` list. More to the point, this is
  the first claim in the doc with **a built-in expiry date**: nobody has to touch
  the repo for "the pilot is free" to become false — it stops being true at
  07:00 UTC on 10-29. Check `openNow()` rather than repeating it, and do not
  build a note, a pull quote or a promotion on a window that closes on its own
- **`josh-ty-kitchen-corner`** — *In Your Corner* (title a placeholder),
  published **free** on 2026-10-18, 1:34, Josh and Tyson. **It is one of two free
  Josh gaps on the board and the longer of them** — `luna-josh-frmhouse-comehome-horiz`
  joined it on 10-22, so read both before calling either the best; this line said
  "the best Josh gap on the board and the best free one" for four days and a
  single commit retired the superlative. Josh at the kitchen island
  early in the six months, asking Tyson whether he has seen her, unable to make
  sense of her telling him she wants to come home and then to stop calling —
  *"If she wants to be here, then what the fuck are we doing?"* — and then
  asking him to look after her: *"just don't let her forget what we have. You're
  family. I need you in my corner on this."* It is free, so it is the shop
  window, and it is the single piece that most does the job the doc keeps saying
  Josh needs: making him someone an audience likes before he turns.
  **Canon guardrail, from `LUNA_VALE_CONTEXT.md`, "The kitchen corner":** at
  this point Tyson is not hiding anything and does not yet feel what he later
  feels. *Any* copy about this scene is **loyalty and only loyalty** — the site
  never hints at his feelings before the separation. A Tyson note here that
  plays reluctance as something withheld would break that, and his reluctance is
  about being put between two people he loves, nothing more. Whether Luna really
  said "I want to come home" in those words is **open and Melissa's to settle**,
  so write it as Josh's account of the call, not as fact
- **`luna-josh-frmhouse-comehome-horiz`** — *Come Home* (title a placeholder,
  hers to replace), published **free** on 2026-10-22, sixty seconds, Luna and
  Josh, sixty-fifth in `STORY_ORDER`. The second free uncovered Josh piece, and
  the only one where Josh asks for something himself: a Sunday a few weeks into
  the separation, Luna at the farmhouse for equipment she left behind for Vale
  Studios, Josh holding her by the hips and asking her to come home. The same
  scene also shipped as the free vertical post `luna-josh-frmhouse-come-home`
  (`posts.ts`) — **one scene in two aspect ratios, not two pieces**, so it wants
  at most one note and it is not two entries on any tally.
  **Canon guardrails, from Melissa's context in `videos.ts`:** the scene is
  *"not a breakup and not a reconciliation: unresolved, on purpose"* and her
  instruction is **"never write it as either."** He loves her and wants to change
  without having the answers; she believes he is trying and needs more than
  another promise; she allows the closeness because she misses him and fears the
  same patterns. Neither wants to let go. And the line in it is **Josh asking
  her** — *"Baby, come home"* — which is **not** evidence that Luna ever said she
  wanted to come home. That question, from the kitchen corner, is still open and
  still Melissa's to settle; do not let this clip close it. The synopsis is setup
  only and stops short of her answer, so do not mine it for one. (The picture
  goes black at 58.2 seconds and her score fades out under it to the last frame —
  that is deliberate, not a bad trim.)
- Josh clips with no note yet: `luna-josh-break`, `luna-josh-bed-flashback`,
  `luna-josh-first-night`, `luna-josh-fair` *(taken by #4)*, **`josh-luna-pre-break`**
  (*Before*, 2026-10-19, 6:58, `premium` with a sixty-second free opening — Luna
  and Josh before the breakup, and the longest explicit cut on the site, so weigh
  what a note on it would be doing), `josh-luna-wall`
  — which Melissa may want to write herself, as she is holding the journal entry
  for it — and **`luna-josh-ty-event`** (*I Was Going to Text You*, five minutes,
  `premium`, 2026-10-14): all three leads are in it, and
  `preview.durationSeconds` reads 64.5, so it has a free first minute and stays
  in the sitemap the way the episodes do. A note on it is reachable in a way a
  note on a fully gated clip is not — second only to the kitchen corner above,
  which is free outright
- `luna-tyson-dance` has no note from either of them. It went members-only in
  the September push, so a note on it is no longer a shop window — but it is
  still two leads and uncovered
- `luna-ty-couch` — *Most Nights*, published **free** on 2026-09-20 — has no
  note either, and its own comment in `videos.ts` says nothing happens in it on
  purpose: he looks over six times and she never catches him. That is a note
  waiting to be written, and being free it would convert. Weigh it against the
  fact that Luna and Tyson are already the best-fed characters on the table
- `ty-luna-young` — *Pick Me Up*, published **free** on 2026-09-22 — is
  uncovered, and it is still **first in `STORY_ORDER`** — re-checked 2026-10-13,
  when a 2006 clip landed and went *third*, not first: Atlanta at eighteen, she
  rings him from a party, he comes anyway. It is the front door of the ordered
  library, so a note on it is the most-seen page a note could have. *(Do not
  restore "the earliest footage on the site by nine years". That gap was to the
  main timeline, and the opening of the library is now three clips deep in the
  same era — `young-luna-ty-apt` and `young-luna-ty-seals` sit right behind it.
  It is still the earliest; it is no longer an outlier.)* Same caveat as the couch — it pays into
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
- `young-luna-ty-seals` — *We'll Be Fine*, published **free** on 2026-10-13 and
  third in the order — is the strongest new opening on the board. A 2006
  flashback: Tyson sits Luna on a tailgate and tells her he has already joined
  the Navy and is going for the SEALs; she asks what happens if something
  happens to him, and he keeps saying they'll be fine. It is the decision the
  rest of Tyson is downstream of, it is free, and it is near the front door. The
  usual caveat holds — it pays into Luna and Tyson, who need it least — but of
  the free uncovered pieces this is the one with the most under it
- A Tyson note on `luna-tyson-bar` from the other side of the table
- Luna notes on the galleries — `the-night`, `the-firepit` — which have none
- Notes on the vertical posts — there are twenty-six now and only
  `run-at-the-lake` has one. The newest is **`ty-gym`** (*Two in the Morning*,
  **free**, 113s, Tyson and Luna, 2026-10-23): Tyson in the gym, and a call he
  made from deployment years ago. **That call looks like the same event as
  `tyson-luna-call-from-field`** (*You Survived*) from the other side — read both
  entries before writing either, because a note that assumes it would be
  inventing the link. Its runtime is trimmed to 113 because the iOS Control
  Center frames into the source after 113.1 seconds; the cut is not short by
  accident. Before it, **`luna-brief-about-site`**
  (*Where to Watch*, **free**, 2026-10-20): Luna on where the series lives. Its
  commit calls it a "new free clip", but it is a **vertical post** in
  `posts.ts`, not a video in `videos.ts` — one more reason to read the module
  rather than the message. **`luna-ty-studio`** (*The Studio*, **free**, 74s,
  Luna, Tyson and Simone, 2026-10-21) landed with the same "new free clip"
  wording and is also a post. That phrasing has now meant *post* twice running:
  check `videos.ts` and `posts.ts` before calling anything a clip. The counter-
  example arrived the next morning — **`luna-ty-driving`** (*One Number Off*,
  **premium**, 4:03 with a 58-second free opening, Luna and Tyson, 2026-10-22,
  sixty-fourth in `STORY_ORDER`) came in as a *"new members clip"* and **is** a
  video. So the wording predicts the module in neither direction: open the two
  files. It is also one more premium piece paying the two leads who need it
  least, which is why the Josh gap went to 25 the day it landed. It is also
  **the only free place a note can meet Simone**, and the cheaper of the two
  pieces she is in. *(It was "Simone's only piece of footage" from 10-21 until
  Episode 5 landed on 10-25 carrying her as well. Episode 5 is premium and
  eighteen minutes; the studio post is free and 74 seconds, which is the whole
  difference between them for a note. Do not restore the "only" wording — check
  `about` across `videos.ts` and `posts.ts`.)* Before it, **`tyson-luna-call-from-field`**
  (2026-10-15): Tyson calling Luna from deployment around 2016, `premium` with a
  67.5-second free preview, so it is reachable without a membership. Its title is
  **"You Survived"** — Melissa renamed it the same day it landed, and the commit
  that added it says *"Hey, Stranger"*. **Read the title out of `posts.ts`, not
  out of a commit message** (the same trap that produced the wrong free-preview
  figure for *Breathe*)
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
