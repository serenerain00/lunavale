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
re-run 2026-11-14 against `main` at 439860b. **A touched `lib/content/` file
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
| Luna | 12 | 283 | 237 |
| Tyson | 12 | 199 | 171 |
| Josh | 14 | 171 | 148 |
| Rick | 1 | 15 | 13 |
| Cathy | 0 | 13 | 13 |
| Avery | 0 | 9 | 9 |
| Simone | 0 | 8 | 7 |

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
17 → 18 → 19 → 22 → 23 → **24 → 23 → 22 → 24 → 25 → 23 → 24 → 24 → 27 → 28 → 29 → 29 → 29 → 30 → 28 → 28 → 30 → 26 → 26 → 28 at 439860b** (Tyson 199, Josh 171 — the 11-13 journal pages pay Tyson four and Josh two, so the gap gave back two of the four it had closed): it widened for six weeks, snapped in hard when episodes
2 and 3 landed (both are about Luna, Josh and Tyson, so they pay the two of them
equally while Josh started from behind), and has moved as much as three points in
a single day since. **It has now sat anywhere between 17 and 30. Quote the two
current numbers at a sha and do not characterise the movement at all** — an
earlier version of this line said "noise in the high teens", which 22 killed.
*(The ceiling was 28, set in late September and matched on 10-27. The 10-28
merge — one premium Luna-and-Tyson clip and its journal page — put it at 29,
so the span itself moved for the first time in five weeks. That is a fact about
the bounds, not a direction: **the previous sentence was "it has sat anywhere
between 17 and 28", and it was true until it wasn't.** If a later merge passes
29, extend the number and nothing else. **It did, on 11-05**: `luna-ty-garage-event`
is a Luna-and-Tyson clip, so Tyson moved alone and the ceiling is now **30**. The
number was extended and nothing else was. That is the third ceiling in nine days,
which is an argument for quoting a sha rather than a range at all.)*
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
Bulb*, free, 2026-10-14, thirty-nine seconds), `luna-truck-breakdown`,
**`luna-ty-laundrymat`** (*Get to Know Her*, free, 2:51, 2026-10-27, sixty-sixth
in the order — Luna's own page about it, `laundromat`, is **premium**, so the
footage is the shop window and her interior is behind the wall) and
**`luna-alley-attack`** (*Someone's Asking Questions*, free, 2:27, 2026-10-29,
sixty-eighth in the order, **downtown, and `about` is Luna alone** — checked
against every entry on this list at 1df359f, the only one that names a single
character, which is the sort of claim to re-derive rather than trust) —
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
> updated 2026-11-09. The backlog below describes `main`, and `main` is behind:
> the drops for 2026-08-03, 08-10, 08-17, 08-31, 09-07, 09-14, 09-21, 10-05,
> 10-12, 10-19, 10-26, 11-02 and 11-09 are all still open and unmerged (#1, #2,
> #3, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14), as is this one (#4) —
> **fourteen weeks of drops, nothing landed.**
> A weekly run clones the repo fresh, so it cannot see any of them — and
> **thirteen** separate weeks have now independently picked the same obvious gap
> and written the same note, a Rick `insight` note on `josh-rick-lake`: #2, #3,
> #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, and #4 before it was rewritten.
> Most ids differ (#5 `rick-i-already-knew`, #8 `rick-already-knew`, #9
> `rick-the-line-in-the-water`), so merging two of those would not collide — it
> would quietly give Rick the same page twice. **There are now two colliding
> pairs: #10 and #11 are both `rick-round-the-outside`, and #12 and #14 are both
> `rick-never-look-at-him` under the same heading** — either pair would actually
> conflict rather than duplicate silently. Do not generalise either way — read
> the ids. Whatever this file says is uncovered, check it against the open PRs
> first.
>
> **#14, the 2026-11-09 run, is the one that settles the argument.** By then
> `main` carried `luna-josh-kitchen-argue` (a Josh scene at the lakehouse with
> all three leads and the shortest free window on the site), the free
> house-party trailer, the free montage, Episode 6 and ten new journal pages —
> the most obvious new ground the backlog has ever had. **It went to Rick at the
> lake anyway, and reproduced #12's id exactly.** Whatever else is true, *adding
> material does not change the outcome*; the only things that will are landing
> one of these or editing the stored prompt. It spent nothing it should not
> have: no Episode 7, no house party, no Evan, Matt or Ashley.
>
> **#13 is the one to look at twice.** The 2026-11-02 run shipped
> `rick-line-in-the-water` with the heading *The line stays in the water* — and
> #9 already carries `rick-the-line-in-the-water` under that same heading. **The
> two ids differ by the single word `the`**, so they would not collide; they would
> silently give Rick two nearly identically named pages. Reading the ids is not
> enough any more when they are one word apart — diff the bodies. (They are
> genuinely different notes: #13 is built on Melissa's note about his hands and
> the line he never takes out of the water.)
>
> **One thing the 11-02 run got right, and it is worth recording.** It was the
> first weekly run to see `luna-alley-attack`, `luna-attack-trailer` and the
> 10-28 canon addition on `main`, and its note spends **none** of that: no
> masked man, no hospital, no family, no journal, nothing about the facility. The
> failure here is repetition of a subject, not leakage of writer knowledge — do
> not widen the charge beyond what the runs actually do.
>
> **The notebook's own ACCESS header is stale on `main`, and every run makes it
> worse.** `lib/content/between-takes.ts` on `main` at 944c369 says *"5 of the 32
> pages are open"* while the module actually holds **38 notes, 8 of them free** —
> the comment has been hand-maintained and has drifted by six pages and three
> free ones. Each weekly run then *increments the stale number*: #13 wrote *"5 of
> the 33"*, which is arithmetic on a wrong figure rather than a count. **Derive
> it — `notes.length` and `freeNotes().length` — and never add one to the
> sentence.** #4's branch reads *"8 of the 39"*, which is what those two
> functions return there, and is the only correct copy on the board. Checked on
> 2026-11-02 against `main`, #4 and #13 at once, because a header that looks
> maintained is worse than one that looks obviously old.
>
> **The 10-26 run is the strongest evidence yet that this is structural, not
> taste.** By then `main` carried Simone, two *Come Home* cuts, `ty-gym`,
> `luna-ty-driving`, Episode 5 and the free kitchen corner — far more obvious
> ground than the 10-19 run had, including a free Josh piece where Josh asks for
> something himself. It still went to Rick at the lake. **A run that cannot see
> the open PRs will keep finding the same gap however much new material it is
> given**, because the gap is real: the backlog names Rick first and the lake is
> his best scene. Adding material does not fix this. Landing one of these, or
> changing the stored prompt, does.
>
> **This paragraph cannot fix that on its own, and it has now failed ten
> times.** It has only ever existed on #4's branch, never on `main`, so the
> 08-31, 09-07, 09-14, 09-21, 10-05, 10-12, 10-19, 10-26, 11-02 and 11-09 runs
> could not read it and duplicated anyway. It becomes effective the moment anything carrying it lands on `main`.
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

> **THE ATTACK ARC IS THE LARGEST BLOCK OF WRITER KNOWLEDGE ON THE BOARD, AND
> ALMOST NONE OF IT IS FILMED.** `BETWEEN_US_SECRET_CANON.md` gained
> *"Addition — 2026-10-28: the attack (`luna-alley-attack`)"*, from Melissa's
> brief, and it marks itself: **writer knowledge except where marked as on
> screen.** A note may use only the on-screen part, which is the free clip
> itself: about 9 PM, Luna leaves **Vale Studios** downtown, walks to her truck,
> a masked man drags her into an alley, knows her name and where she lives, and
> leaves a message — *"Tell Josh and Tyson someone's asking questions. They'll
> know what that means."* He knocks her out and takes her phone; she comes to and
> breaks down looking for it. **That is all a visitor has seen.**
>
> **MOST OF THAT LINE LASTED ONE DAY — READ THIS PART CAREFULLY.** On 10-29 this
> block said the hospital, Josh arriving, Josh and Tyson deciding, and Frank
> were all unfilmed and off limits. On **2026-10-30** Melissa published
> **`luna-attack-trailer`** (*The Warning*, **free**, 2:40, Luna/Josh/Tyson,
> `notes: ["assaulted"]`, **not** in `STORY_ORDER` like the other trailers) —
> *"the trailer to a future scene, about the attack on luna, the accident. its
> free for everyone"* — and its transcript puts on screen: **the alley**, **Luna
> in the hospital**, **Josh arriving** (*"I'm Josh. They called me earlier"*),
> **Tyson and Josh deciding who to go see**, and **Frank at the warehouse**
> (*"make sure the right people hear me"*). Its synopsis is plainer still: *"Luna
> wakes up in a hospital bed with a message for Josh and Tyson. They go looking
> for whoever sent it."* **So those beats are now public, in a free piece, and a
> note may use them.** Do not restore the sentence that called them unfilmed.
>
> **What is still writer knowledge, and still off limits:** **who the man is and
> who hired him**, the **family** looking for evidence about a death at the
> facility, **the journal** they want, and anything naming them. The entry's own
> comment draws the line: the trailer says *"something that happened ten years
> ago"* **and nothing more**, so it *"spends no more of the secret than the
> Dorsey brief allows."* **Match that restraint** — a note may know there is a
> warning and a man in a warehouse; it may not know why.
> **`docs/content/scenes/dorsey-warehouse.md` is still a DRAFT**, Melissa's to
> rewrite, and **Frank still has no entry in `lib/content/`** — he is a face in a
> trailer, not a character on the site. Treat the drafted scene as not yet
> existing even though the trailer shows a piece of it.
>
> **Two small conflicts the brief itself leaves open, so do not "fix" or repeat
> either:** it says the death was *approximately ten years* earlier where this
> document says nine (September 17th), and it calls Tyson Josh's *cousin* where
> canon says **second cousin** — which the Dorsey draft is careful about, since
> it means **Rick is not Tyson's uncle**. The brief also restates what has not
> changed: Luna and Josh separated and still in love, ten years, never married;
> **Tyson and Luna not romantically involved**; neither man an action hero;
> *"a character drama, not a revenge thriller."*

> **WRITE THE NOTE IN AMERICAN ENGLISH — AND THE CHECK IS NO LONGER ONLY ABOUT
> BRITISH SPELLINGS.** As of 2026-10-20 the health check has
> a daily spelling check over `lib/content`, `lib/studio`, `lib/email`, `app`
> and `components` — everything a visitor reads — and `between-takes.ts` is in
> that set. A hit in a note will FAIL the run, not warn. There is a
> `BRITISH_OK` allow-list in `scripts/health-check.ts` for the handful of real
> exceptions (`aria-labelledby`, `normalis…`, `favouriteScene`, `cole-rang-him`
> and a few more); do not add to it to get a note through. **This file is not in
> scope** — `docs/` is internal, so its own spellings are nobody's problem.
>
> **Two project-specific slips joined the same list on 2026-10-26, and they are
> the ones a note is actually likely to make.**
> **Her nickname is `Lu`, never `Lou`** — Melissa, that day: *"its noy spelled
> lou, its Lu"*. Fourteen journal lines had it wrong, taken from the transcripts,
> and the *Come Home* transcript in `videos.ts` had it too. Any note quoting Josh
> or Tyson speaking to her must spell it **Lu**.
> And **"round" where it should be "around"** — nine of those in the journal,
> never caught before. The rule only fires on the phrases that are actually wrong
> (`round the`, `way round`, `came round`), so *"round the outside"* as a title is
> its own question, but in prose write **around**.
> Both are in the `BRITISH` list rather than a separate check, so both **FAIL**
> the run. This branch's note was re-checked against both the day they landed and
> contains neither.

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
- **The seven episodes carry no note between them.** This is the top of the
  list, and it keeps growing: `pilot` (*Episode 1*, 2026-09-21, 18:36,
  `notes: ["danger"]`), `episode-2` (*Breathe*, 22:23), `episode-3` (*The Space
  Between*, 21:35) and — new on 2026-10-18 — `episode-4` (*Peace and Quiet*,
  15:09, `notes: ["danger"]`), — new on 2026-10-25 — `episode-5`
  (*Everybody Has an Opinion*, 18:15), — new on 2026-11-02 — **`episode-6`
  (*The Event*, 26:24)**, and — new on 2026-11-09 — **`episode-7` (*The Things
  We Don't Say*, 20:29)**. All seven are `premium` with a free opening
  — `preview.durationSeconds` reads **190**, 124, 129, 158, 96, **63 and 63** as
  of 2026-11-10, so **episodes 6 and 7 tie for the shortest episode opening**, so three minutes ten on the pilot, about two on the middle pair,
  the firefight on episode 4, the taco scene on episode 5, and the
  **shortest opening of the six** on episode 6, the therapist's office a year
  ago. *(Episode 5 held "shortest of the five" for eight days. Don't restore
  it — read the field.)* (Not the "1:30" an early commit message said of Breathe before it
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
  only episode that reaches Simone at all; **episode 6 is Luna, Josh and Tyson**,
  so it buys nothing for Rick or Simone. *(**`episode-6` is now the longest thing
  in the library at 1584s**, four minutes past `episode-2`, which held that for
  six weeks and which this line credited until 2026-11-03. The pilot was never
  it. Episode 4 is still the shortest. Don't restore any of it; read
  `durationSeconds` in `videos.ts`.)* For the pilot, the
  entry's own comment says the constraint on everything about it is **not to
  spend the intro**. Read Melissa's synopsis in `videos.ts` for each rather than
  writing off frames — she replaced the frames-written ones there, and the
  comments explain why. Episode 4's synopsis is deliberately written to give
  nothing away, so do not mine it for plot
- **`episode-6` is the first episode that overlaps a clip already on this
  backlog, and it comes with its own restraint.** Landed 2026-11-02 (a day late;
  Melissa had tech difficulties), title hers — *The Event*. Its entry comment
  says what is in it: a therapist's office a year ago (Josh fixes before he
  understands, Luna goes quiet, dinner at seven then nine then eleven), then
  Josh's company event, Tyson finding out she came with Josh, a stranger at the
  bar, the investor, Josh asking her to come home outside, and it **ends on "I
  want to believe you."** Two things follow for a note.
  **First: `luna-josh-ty-event` is inside it.** That clip is on the uncovered
  Josh list below, so a note on it now also describes a stretch of a premium
  episode — which settles its access (`premium`, not free) and means the note
  should be written as the scene it is, not as a summary of the episode around
  it.
  **Second, and this is the restraint: Melissa's synopsis deliberately leaves
  out the stranger at the bar and anything Tyson feels** (`tyson-no-early-feelings`
  — "describe and stop"). Match that. **Do not connect the stranger to the
  attack arc in writing.** The alley clip's line is *"someone's asking
  questions"* and the stranger's is *"funny how much people can keep to
  themselves"*, and the resemblance is inference, not canon — nothing in
  `lib/content/` or `BETWEEN_US_SECRET_CANON.md` joins them, and a note that
  joins them would be inventing plot. Ask rather than write it. The ending is
  also **not a reconciliation**: "I want to believe you" is the same unresolved
  register as *Come Home*, and Josh asking a second time is not Luna answering.
- **`luna-ty-garage-event`** — *Everybody Else*, published **premium** on
  2026-11-04, 380s (6:20) with a **62-second free opening**, Luna and Tyson,
  place `garage`, **twenty-seventh of seventy in `STORY_ORDER`** (re-derived 2026-11-06) — the first
  new clip in weeks to be placed *inside* the order rather than appended, which
  is what shifted the ordinals below. It is a scene from Episode 7, and
  for five days it shipped *ahead* of the episode, which made the boundary
  unusually sharp: canon's rule was *"nothing beyond what that post shows goes
  on the site before the episode does"*. **That clause expired on 2026-11-09
  when Episode 7 was released.** The whole scene is now inside a published
  episode, so a note on this clip is no longer fenced to the 2:46 Instagram cut
  — it is fenced the way any note on a premium episode's scene is. **Do not
  restore the "before the episode does" wording**; it was true for five days and
  reads as a live restriction if left in place.
  **The guardrail is the same one the kitchen corner carries, and canon now
  states it twice:** Tyson's hurt is about **being told last** — finding out
  with the room — and **nothing may say or hint that it is jealousy or
  feelings** (`tyson-no-early-feelings-on-site`). Neither of them is wholly
  wrong, she admits she should have told him, and **it ends on the laughter**:
  the written-statement joke, no hug *(Melissa, 2026-11-04: "remove the bear hug
  part, i never added that")*. Do not write it as a romantic beat.
  **One thing that looked like material and is now real, and one that is still
  not.** The scene was meant to mirror **a flashback with the positions
  reversed** — young Tyson keeping something from her — which on 11-04 was *"not
  built yet"*. It exists now: the Atlanta scene at twenty inside
  `luna-ty-montage`, free since 11-07, and Episode 7's synopsis also promises
  *"a glimpse into her past with Tyson"*. **Which footage sits inside the
  episode is not stated in its entry's own what-is-in-it list, so do not assert
  that the montage's scene is the episode's flashback** — describe whichever
  piece you are writing about. And **Evan** (29, a
  former Marine Tyson mentors through a veterans program) has **no character
  card and no `lib/content/` entry** — `countFor("evan")` returns 0 — with
  canon saying "no real details right now on him". Like Frank, he is a face in
  a scene, not a character on the site; a note may have Tyson talk about
  mentoring without inventing Evan.
  **And `ty-luna-garage` (*The Garage*, premium, 456s, published 2026-08-19) is
  a different scene in the same room.** Canon settles only that it is **not
  present day** and comes **well after Episode 7** — it sits sixty-second in the
  order, **sixty-third of seventy** at 6dc6a46 — it read sixty-second one day
  earlier, which is the warning below in miniature — after the wall and the
  bathtub. **Do not call it earlier than Episode 7 either**; "not present day" is the whole of what is settled, and a commit on
  11-04 exists specifically to stop that inference being made.
- **`luna-josh-kitchen-argue`** — *I Don't Know Yet*, published **premium** on
  2026-11-05, 164s (2:44) with a **30-second free opening** (the shortest free
  window on any clip), **Luna, Josh and Tyson**, place `lakehouse`,
  **thirty-third of seventy** in `STORY_ORDER` — **hand-placed as a guess, and
  the entry says Melissa is to move it**, so do not build a note on where it
  falls. This is the strongest new Josh material in weeks and it pays all three
  leads: Josh comes inside about Tyson's truck, asks whether something is going
  on, and her answer is the title. **Guardrails from the entry:** the synopsis
  "describes and stops" — **Josh's suspicion is his**, the copy does not answer
  it, and it says nothing about what Tyson feels (`tyson-no-early-feelings`).
  Handle the end with care: **he grabs her arm and the scene ends on him
  apologizing for it.** That is on screen and may be played, but it is the one
  moment on the site where Josh puts a hand on her, so a note about it is about
  an actor's care in staging it, never about excusing him.
  *(Heading collision to avoid: **#1 is already titled "I don't know yet"**, so a
  note on this clip wants a different heading even though the clip's own title is
  hers.)*
- **The journal is at 179 entries and still only 6 free.** Ten `premium` pages
  landed on 11-05 — five beside Episode 6, three beside *Everybody Else*, one
  beside *One Number Off*, and one beside **Come Home, a free clip whose page is
  members-only** — **five more on 2026-11-11, all beside Episode 7**, and **five
  more on 2026-11-13: three beside Episode 4 and two beside
  `luna-josh-kitchen-argue`**, all `premium`. **Four of the seven episodes carry
  journal pages** — 4 has three, 5 has five, 6 has five, 7 has five; the pilot,
  2 and 3 have none — while **no episode carries a Between Takes note**: two
  separate backlogs, and the one this file tracks is the notes. *(This line said
  "Episodes 6 and 7" on 11-11 and was **already wrong when written** — Episode 5
  had five pages by then. Derive it from `sceneSlug`, do not count the ones a
  commit message mentions.)* The *Come Home* page remains the most quotable
  instance of the separate-access rule: the clip is the piece a non-member can
  watch, and the writing about it is not.
- **Five draft journal pages arrived on 2026-11-13 and three of them put new
  things into visible copy.** All five are `premium`, all five say **DRAFT
  PROSE, replace it** in their own comments — the same standing as a note on
  this branch, so do not quote them as settled.
  **Reed is now named in copy a reader can reach.** He was writer material and
  a face in Episode 4's **free** 2:38 opening — hit on the ridge, Tyson keeping
  him alive, ending on *"Medic! I need help!"* — and `who-was-it` is the first
  place his **name** appears in prose. **That he dies is from Melissa's full
  synopsis, which she cut: the public synopsis names no death and neither does
  the footage.** A note may say Tyson lost a teammate and was woken by it; it
  must not kill Reed on the page, and nothing about the mission beyond the name
  is usable. He has **no `lib/content/` entry** — the Miller / Evan / Matt /
  Ashley / Frank bucket, but the only one of them now spoken in copy.
  **Why Luna is staying at Tyson's apartment is not said in Episode 4, so
  nothing on the site says it** — the pages are explicit about leaving it out.
  And the pages settle a canon conflict the other way from the older file:
  2026-09-11 canon calls the apartment somewhere she *"never had a reason to
  go"*; the episode is newer and wins (CLAUDE.md's rule), but **do not write the
  reason either way**.
  **"I love you", both directions, is on screen in Episode 4** — said as twenty
  years of friendship and nothing else, days into the separation. It is not
  evidence against `tyson-no-early-feelings`; the pages keep Tyson to what she
  saw and heard, and a note must too.
- **The two kitchen-argue pages tighten that scene's guard rather than loosening
  it.** `his-truck` and `i-dont-know-yet` sit beside `luna-josh-kitchen-argue`,
  premium like the scene past its 30-second opening — **a fourth instance of
  footage and page carrying separate access**, and like `luna-ty-lkehous-fight`
  it is the window, not the clip, that differs. Three rulings in their comment:
  **the grab is not a warning on the page** — she reads it as fear because he
  told her he was scared, and *"the control arc is writer knowledge; nothing
  here points at it"*, so a note must not point at it either; **her "no" is
  true**, and the page goes no further into her side than `new-york` already
  did and says nothing at all about Tyson's; and **Josh says "cousin" on
  screen** while canon says **second cousin**, so the page avoids the word
  rather than repeating or correcting it — the cleanest demonstration yet of
  how that open conflict is handled. Quoted on the pages: *"I don't have to beg
  him to show up"* and *"I don't know yet"*. **Not quoted: *"Don't grab me like
  that"*.**
- **"The Night Everything Changed" (the house party): part of it is public now,
  and the sentence above it in this file lasted a day.** It read *"writer
  knowledge and must not be posted at all"*, written 2026-11-06 from the 11-04
  canon addition, and on **2026-11-07** the free trailer
  **`luna-ty-drunk-trailer`** (*Let Me Get You Home*, free, 2:58, Luna/Tyson/Josh,
  place `tysons-apartment`, **not in `STORY_ORDER`**, title a placeholder) put
  the first public look on the site. **Do not restore the old wording.** The
  canon block was rewritten to say where the line now falls, and it is narrow:
  **released** is what the trailer shows — the party with Josh there, Tyson
  drunk saying things and then telling her to forget them, *"We're not doing
  this"*, *"I need you to say it"*, her refusing to answer him while he is
  drunk, and her driving him home and getting him upstairs.
  **Still not released, and not to be written:** the fantasy, *"Just you, Lu"*,
  *"what if I'd met you first"*, *"tell me I'm wrong"*, and the kitchen ending.
  **What he wants her to say is his and is unspoken in the trailer** — the
  entry says the copy does not name it, so neither does a note. This is the
  second guard in nine days to go from absolute to partial in a day (the attack
  arc was the first), so **read the canon block and the entry before trusting a
  sentence here about anything unreleased.**
  Three things in that block still hold, because they correct what a reader
  might otherwise infer:
  **(1) The cut is canon, not the written synopsis.** Where they disagree the
  cut wins, and the block lists the differences. That generalises: a written
  synopsis in canon is a draft of a scene, and the video is the scene.
  **(2) There is no kiss, and the intimacy is only Tyson's fantasy** — a graded
  passage inside the cut that **does not happen**. Never write it as something
  that did.
  **(3) It is a turning point for her, not a decision.** She is not over Josh
  and has not chosen Tyson; what he says drunk is not a reliable declaration;
  there is no affair and no betrayal. Josh is at the party.
  Where it falls against the published `luna-ty-shop-kiss` (fifty-third) and
  `ty-luna-bed` (sixty-seventh) is **not settled and is Melissa's** — do not
  order them in writing.
- **`luna-ty-montage`** — *A Heads Up*, published **free** on 2026-11-07, 167s
  (2:47), `about` **Luna, Tyson and Josh**, place `garage`, **not in
  `STORY_ORDER`** (it is a montage across two times, exempt in `chronology.ts`
  like the trailers), title a placeholder. It cuts two arguments against each
  other: a **new Atlanta scene that exists nowhere else on the site**, and the
  garage confrontation from *Everybody Else*. The mirror is the point — then he
  kept something from her, now she kept something from him — and **the synopsis
  says that and stops**.
  **Her age in it is twenty, and the entry's own comment is wrong.** Canon (and
  the synopsis) say **20**; the comment block inside the entry still reads *"AT
  EIGHTEEN"*, because the correction commit fixed the copy and not the comment.
  **Read the synopsis and the canon addition, not the comment heading.** That is
  a new shape of the old trap: it has been commit messages that lie, and now a
  stale comment inside the entry can too.
  **Matt and Ashley** (the boyfriend and the other woman in the scene at twenty)
  are **minor, have no character cards, and the site copy does not name them** —
  the same bucket as Evan, Frank and Miller. A note does not name them either.
  *(One thing worth asking rather than fixing: `about` names **Josh**, and he is
  in neither half of the montage. It pays him a point in the counts. Left as
  Melissa set it.)*
- **Eight free pieces sit deliberately outside the free-and-uncovered list
  below**, and the reasons are not all the same. The list's clause is that every
  piece on it pays **only into Luna and Tyson**, which is what makes it an
  argument rather than an inventory. Off it for paying someone else: the three
  free trailers (`between-us-trailer-one`, `luna-attack-trailer`,
  `luna-ty-drunk-trailer`) and `luna-ty-montage`, each of which pays all three
  leads, and the two free Josh clips (`josh-ty-kitchen-corner`, *Come Home*).
  Off it for not being story beats at all: **`tyson-qa`** (free, Tyson alone)
  and **`luna-josh-radio`** (free, Luna and Josh) — cast-promo pieces, both
  exempt from `STORY_ORDER`. Counted at ddb7381, where free reads **18
  published / 19 by `access`**.
  **This list is about free *videos* only, and `luna-sidewalk-interview` does
  not make it nine.** The 11-12 cast-promo piece is a **vertical post**, and
  posts were never on this list — they are not in `STORY_ORDER` at all, so
  "exempt from the order" says nothing about them. Count videos against videos.
- **Rick finally has new material, it is free, and it is the richest canon he
  has ever had.** `josh-rick-cigarBar-square` — *A Reason to Come Home*, a
  **free** square post, 2026-11-09 — puts Josh and Rick in a dimly lit cigar
  lounge in **Denver**, present day, **shortly after the separation**. Rick's
  tally moves **14 → 15** on it. **It is a separate scene from Episode 7**;
  canon says so outright and that *nothing on the site links the two*, so a note
  must not connect them. On screen: business talk turning into Luna, Rick saying
  she came to see him a week after the separation and still loves Josh but is
  more afraid of nothing changing than of losing him, and the lines — *"Stop
  trying to get her home. Start giving her a reason to want to come home."*,
  *"Then don't make her afraid to stay."*, *"Wonder where I got that from."*
  **What is writer knowledge and stays off the site:** the reading of *why* the
  scene exists (the psychological ground for Josh's need for control), and the
  foreshadowing that he grows more aggressive as the fear grows. Canon labels
  both; a note plays the room, not the thesis. **Rick is not a villain** —
  perceptive, protective, capable of real regret. **Josh's mother is settled
  only as far as the dialogue:** the same conversation happened with her and it
  did not work out. **Whether she left or died is not settled — do not state it.**
  And **the investigation canon now calls Mercer, plus any suspicion about
  Tyson, are not in this scene** and are not to be written into it.
- **`luna-josh-radio`** — *On the Air*, **free**, 2026-11-10, 158s, `about`
  **Luna and Josh**, place `downtown`, **exempt from `STORY_ORDER`** like
  `tyson-qa` and the interview, title and synopsis both placeholders. A radio
  interview *"meant to be fun"*: his shoes in the kitchen, her stealing his
  shirts, *"ten very long years"*, and both of them plugging the show at the end.
  **It is the first free piece that pays Luna and Josh together**, which makes it
  the cheapest free Josh material on the board and a genuinely new kind of entry:
  in character, but promoting the series rather than living in it.
  **Two restraints from the entry.** It says they have been together about ten
  years and **says nothing about the separation**, and **the synopsis does not
  place it in the story** — so a note must not place it either, and must not read
  the separation into it. And **the host is unnamed in the footage, so he is
  unnamed in the entry**: the same bucket as Evan, Matt, Ashley and Frank. Do not
  give him a name.
  *(Second cast-promo piece in two days, after `tyson-qa`, and the third
  followed on 11-12. All three are free and none is a story beat — a category
  this file did not have a week ago and now the most active one on the board.)*
- **`luna-sidewalk-interview`** — *Too Dark?*, a **free vertical post**,
  2026-11-12, 33s, `about` **Luna alone**. **It is the third cast-promo piece
  in four days** and the first that is a post rather than a video, so it is
  **not in `STORY_ORDER`** for the ordinary reason that no post is. A street
  reporter with a `DENVER LIVE` mic stops her, iced coffee in hand, to say some
  of her followers think *Between Us* is getting too dark and asks what she
  would tell her viewers; her answer is *"If you think it's dark now, I'd
  probably stop watching."*
  **Three restraints from the entry.** It is in character but **tells nothing
  about the story** — a note on it has no beat to describe and must not invent
  one, nor read the answer as a hint about what is coming. **The reporter is
  unnamed**: the same bucket as the radio host, Evan, Matt, Ashley and Frank.
  And **`mature` is false on purpose** — the entry records that the strong
  language in it is the reporter's and that `mature` is for sex, so do not read
  the flag as a judgement about the language.
  *(Title and caption are both placeholders, hers to replace. It pays **Luna
  alone**, which took her total 277 → 278 and left the Josh gap at 26 — the
  first merge in weeks to move exactly one character.)*
- **`tyson-qa`** — *Questions for Tyson*, **free**, 2026-11-09, 100s, `about`
  **Tyson alone**, place `park` (he is in his car), **exempt from `STORY_ORDER`**
  like the interview, title and synopsis both placeholders. **It is the first
  free piece on the site that pays Tyson and nobody else**, which makes it an
  odd fit for the free-and-uncovered list's clause and a genuinely new kind of
  gap: in character, but not a story beat.
  **One answer runs straight at the Tyson rule.** Asked whether he has ever had
  feelings for someone he could not have, he says *"Yeah. I think everybody has
  at some point."* The entry is explicit that this is **his own deflection**,
  that the synopsis does not quote it, name anyone or read it, and that the job
  is to **describe and stop**. A note must do the same: it may be about reading
  cards in a car, and not about what that answer means.
  *(Served as `tyson-qa-v3`, after a redo and a first cut. Three files, one
  slug — read `file`, not the slug, if the version matters.)*
- **Two new premium verticals arrived with the biggest forward-looking spoiler
  on the board, and neither has a preview.** `ty-luna-alley-music` (*Not Here*,
  85s, `mature`) and `ty-luna-rain-right-music-vert` (*Pouring*) are both
  **members-only with no free window at all** — closed doors, like
  `luna-josh-bed-ig` — so a note on either is premium and describes something no
  visitor can sample.
  **The alley's canon is far-future writer knowledge and none of it may appear
  in visible copy:** season 3–4 or later, *"still being defined"*, and it turns
  on where Luna and Tyson end up and what she has not told him. **Do not write
  any of it, do not hint at it, and do not let a note about an earlier scene
  lean on it.** The approved caption names none of it; match the caption, not
  the canon block.
  **`Pouring` sits before the alley and is also ahead of released canon:**
  Tyson has **not yet told her how he feels**, its dialogue is under the score
  so nothing in it is quotable as settled, and its caption stops at the fight —
  no feelings, no kiss, no when.
  **And `Pouring` is not `luna-ty-rain-ig` (*Rain*, 2026-10-02).** Both are Luna
  and Tyson arguing then kissing in a downpour, and canon is explicit that they
  are **two separate nights, not two cuts of one**. Never merge them or
  cross-refer them as the same moment.
- **"Not Here" is now two different pieces.** It is the title of
  `luna-josh-fair` — the clip this PR's note is on — and, since 11-09, of the
  post `ty-luna-alley-music`. The note's own header carries the slug, so it
  stays unambiguous, but **a note or caption that says "Not Here" without a slug
  no longer identifies anything**.
- **The health check gained a rule that can fail on absence rather than on
  error.** From 2026-11-09 a new episode leads the home-page hero for five days,
  and the check **FAILS** if the pin is live and the loop is missing (no
  `public/hero/<slug>.mp4` and `.jpg`, or the slug absent from `HERO_SLUGS`, or
  `pickHero()` choosing something else). It is the first check that fires on a
  *window* rather than on repo state, so a run inside those five days can fail
  for a reason that was fine the day before.
- **Ordinal positions in `STORY_ORDER` are not stable, and two in this file were
  badly wrong.** A clip inserted mid-list shifts everything after it — which
  `luna-ty-garage-event` just did at position 27 — and Melissa also hand-moves
  entries. Re-derived 2026-11-05 and again 2026-11-06: *Come Home* is
  **nineteenth**, not the "sixty-fifth" this file claimed, and `luna-ty-driving`
  is **twenty-ninth**,
  not "sixty-fourth". Both were off by more than forty places, which means they
  had been wrong for some time and nobody re-ran them. **Quote an ordinal only
  with the sha you derived it at, or say "early in the order" and nothing more.**
- **`access` is not necessarily what a visitor can watch — check `openNow()`, not
  a sentence in this file.** `Video.openUntil` (added 2026-10-22) marks a
  members-only piece as open to everyone until a timestamp: `canWatch()` in
  `lib/access/entitlement.ts` returns true for anyone while the window is open,
  `openNow()` in `videos.ts` is the test, and `streamable.ts` carries the field
  through. **The pilot carried the only window so far — 2026-10-22 to
  2026-10-29T07:00:00Z, the end of Wednesday 10-28 Pacific — and it was the home
  hero and said so on both first-screen arms while it lasted.** The field is
  still on the entry; `openNow(pilot)` now returns **false**, and `access`-free
  and watchable-now agree again — both **fourteen** at 1df359f, both **fifteen**
  at 944c369 once the free trailer landed. If another window
  opens, the two diverge by however many pieces carry one, and the list in this
  file is the `access` list.
  *(**There is a third free count, and it is the one the health check prints.**
  That check counts `access === "free" && !hidden`, so it said **14 free** on
  10-31 while `access`-free was **15**: `interview` is free and `hidden: true`,
  the only hidden piece in `videos.ts`. At fdbbc96 the three read **16
  published / 17 `access`-free / 17 watchable** — the gap of one is always
  `interview`, and the figures themselves move whenever anything free lands. None of the three figures is
  wrong and none of them is the others — say which one you mean, and never
  reconcile them by editing one. This was checked on 10-31 because the gap looked
  at first like the new trailer being withheld, and it is not:
  `luna-attack-trailer` is `hidden: false` and a visitor can watch it.)*
  *(**This item is the one claim in this file that went false with nobody
  touching the repo.** Every other correction here followed a commit; this one
  followed the clock, at 07:00 UTC on 10-29, and it said "the pilot is open to
  everyone" and "a free count off `access` is one short" until that minute. It is
  also why the instruction above is to call the function rather than repeat the
  sentence. Do not restore the live wording for a window that has closed, and do
  not build a note, a pull quote or a promotion on one that is open.)*
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
  Josh, **nineteenth of seventy in `STORY_ORDER`** (re-derived 2026-11-06;
  this line said "sixty-fifth" and was wrong — see the ordinals warning below).
  The second free uncovered Josh piece, and
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
- **`luna-attack-trailer`** — *The Warning*, published **free** on 2026-10-30,
  2:40, **Luna, Josh and Tyson**, `notes: ["assaulted"]`, **not in
  `STORY_ORDER`** (no trailer is). It is free and uncovered and **pays all three
  leads**, which makes it the only uncovered free piece that reaches Josh *and*
  Tyson *and* Luna at once — and the reason it is **deliberately not on the
  free-and-uncovered list above**, whose clause is that every piece there pays
  the two who need it least. *(`between-us-trailer-one` is off that list for the
  same reason.)* It is **a trailer for a scene that does not exist yet**, so a
  note on it would be about cutting a promise rather than playing one — weigh
  that before taking it, and read the spoiler guard above first, because the
  trailer is exactly where the public line now sits.
- Josh clips with no note yet: `luna-josh-break`, `luna-josh-bed-flashback`,
  `luna-josh-first-night`, `luna-josh-fair` *(taken by #4)*, **`josh-luna-pre-break`**
  (*Before*, 2026-10-19, 6:58, `premium` with a sixty-second free opening — Luna
  and Josh before the breakup, and the longest explicit cut on the site, so weigh
  what a note on it would be doing), `josh-luna-wall`
  — which Melissa may want to write herself, as she is holding the journal entry
  for it — and **`luna-josh-ty-event`** (*I Was Going to Text You*, five minutes,
  `premium`, 2026-10-14): all three leads are in it, and
  `preview.durationSeconds` reads 64.5, so it has a free first minute and stays
  in the sitemap the way the episodes do. **As of 2026-11-02 this scene is also
  inside `episode-6`**, whose entry comment names it, so a note on it is a note
  on a stretch of an episode as well — see the episode-6 item above for what
  that constrains. A note on it is reachable in a way a
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
- Notes on the vertical posts — **there are thirty at ddb7381** (23 of them
  free) and only `run-at-the-lake` has one. **This line read "twenty-six" for
  weeks while the module held twenty-nine — do not restore a figure here
  without re-running `clips.length`.** The newest is
  **`luna-sidewalk-interview`** (*Too Dark?*, **free**, 33s, Luna alone,
  2026-11-12), which has its own item above; before it,
  **`josh-rick-cigarBar-square`** (the cigar lounge, 11-09). Older, and still
  the richest of them for Tyson: **`ty-gym`** (*Two in the Morning*,
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
  **twenty-ninth of seventy in `STORY_ORDER`**, re-derived 2026-11-06 — this
  line said "sixty-fourth") came in as a *"new members clip"* and **is** a
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
