# Win-back plan — October 2026

**Status:** DRAFT for Melissa's approval. Nothing has been sent, and no code
has been written for it.
**Written:** 2026-10-11, from live Stripe, the memberships table, email_sends
and lib/content/releases.ts.

## 1. What the data says (observed)

**Who is leaving.** 9 members have switched off renewal but still have access.
7 more have already lost it.

| Group | People | Access ends |
|---|---|---|
| A — leaving, still in | 9 | Oct 14 (1), Oct 23 (1), Oct 26 (2), Oct 27 (2), Oct 28 (1), Nov 2 (1), Nov 3 (1) |
| B — already gone | 7 | Sep 28 – Oct 11 |

**Why they said they left.** This is the reason box in Stripe's cancel flow,
which was switched on partway through, so Group B mostly gave none.

| Reason | Group A | Group B |
|---|---|---|
| "I don't use it enough" (`unused`) | **5** | 0 |
| "Low quality" | 2 | 1 |
| "Too expensive" | 1, with the comment *"And slow"* | 0 |
| Other / none given | 1 | 6 |

**When they cancelled.** 10 of the 16 cancelled within one day of joining.
That is the same pattern as September: switching off renewal straight away
reads as "I want this once", not as a verdict on the show. One Group A member
had been with us 55 days.

**What they were told.** One email has ever gone out: the Sep 22
announcement, to 14 people. **26 things have been released since then**, and
nobody was told about any of them:

- 12 scenes, including **Episode 2: Breathe** and **Episode 3: The Space Between**
- 8 journal entries
- 6 posts

7 of the 9 people in Group A joined after Sep 22. They have never had a single
email from Luna Vale.

## 2. What we think is going on (hypothesis, not proven)

> The leading reason, "I don't use it enough", is at least partly a
> **communication gap**, not a content gap. People paid, watched what was
> there, never heard that more had arrived, and didn't come back to check.

What would support it: people in Group A come back to watch after an email
that tells them what's new, and some of them switch renewal back on.
What would weaken it: they open the email, come back, watch, and still leave.
That would point to price, format ("once, not monthly"), or the content itself.

**Sample size warning.** These are 16 people. Whatever happens, it is a story
about these 16, not a conversion rate. Nothing here is an experiment, and
there is no control group. It is the obvious thing to do for people who
already paid, and it also teaches us something.

"And slow" has two readings: the site loads slowly, or the story moves slowly.
One comment can't decide between them. The Instagram-visitor audit (next on
the list) will measure page speed. The email below simply invites replies.

## 3. The plan

### Group A — leaving, still have access (9 people)

- **One email, sent Tuesday morning, Oct 13**, before the first access ends on Oct 14.
- **What it says:** a "Previously on Between Us" recap of Episodes 1–3, the list of what's been added *since that person joined*, the date their access ends, how to keep their membership, and an honest "reply and tell me what didn't work".
- **No discount, no countdown, no "last chance".** The CLAUDE.md principles rule those out, and with 5 of 9 saying "unused", price isn't the main lever.
- **No second email.** The one exception is a new episode landing before someone's end date; then that release announcement goes out as normal, through `announce.ts`, which already includes leaving members.

### Group B — already gone (7 people)

- **One email, the same day:** what's been added since they left, the same recap, and one link back to `/membership`.
- **Sent once, and never a sequence.** If they don't come back, we don't write again unless they rejoin or ask to hear about new episodes.
- **Consent question for you, see §6.** These people are former customers, not members.

### Everyone else (22 staying members)

- **Not part of this plan,** but the finding applies to them too: they haven't heard about 26 releases either.
- The cheapest fix is the existing announcement, run by hand: `npx tsx scripts/announce.ts --since=2026-09-22`. It's a dry run by default, so you see the email and the recipient count before anything goes.
- I'd send it **after** the win-back emails, so Group A doesn't get two emails in one day. The announcement script skips anyone a campaign has already reached, but these are two different campaigns.

## 4. Sample messages (drafts, in your voice)

Placeholders are in `{braces}`. The recap uses **only what the public episode
descriptions already say**: nothing from LUNA_VALE_CONTEXT.md, nothing about
how Tyson feels, and Josh is never called her husband.

### Group A — subject line options

1. **Previously on Between Us**
2. **Episodes 2 and 3 are out — and I never told you**
3. **What happened after Luna made the call**

My recommendation is option 1. It's calm, it's the thing you said you like,
and it doesn't oversell.

### Group A — body

> Hi {first name},
>
> You joined Luna Vale on {join date}, and I never wrote to tell you what's
> gone up since. That's on me, so here it is.
>
> **Previously on Between Us**
>
> *Episode 1.* After ten years together, Luna and Josh have built a whole life
> on the assumption that they'll always find their way back to each other.
> One ordinary night shows her how far apart they've grown, and she leaves.
> The person she calls is Tyson, her best friend of twenty years. He answers.
>
> *Episode 2: Breathe.* A grocery run and a stop at Rick's to sign paperwork
> pull her back toward the life she just walked out of, and finally to the
> farmhouse, and Josh. It was supposed to be a quick handoff. It wasn't.
>
> *Episode 3: The Space Between.* She finds the journal from her first year
> with Josh and reads it cover to cover, looking for the moment loving each
> other stopped being enough. Then Tyson finds her reading. Later that night,
> Josh calls.
>
> **[Watch Episode 3 →]** {link}
>
> **Since you joined:**
> {per-person list, newest first — e.g.}
> - It Suits You — Luna and Tyson at the tailor's
> - Still Us
> - Nine Years Ago
> - Episode 3: The Space Between
> - Episode 2: Breathe
> - {n} new pages of Luna's journal
>
> Your membership ends on **{access until}**, and everything stays open until
> then. If you'd like to keep watching after that, you can switch renewal back
> on from your account. Same price, nothing else changes.
> **[Keep my membership →]** {/account link}
>
> And if something didn't work for you, whether it was too slow, too
> expensive, or not what you expected, just reply. I read every one, and it
> changes what I make next.
>
> Melissa
>
> *{unsubscribe link}*

### Group B — subject

**Previously on Between Us**, the same as Group A, deliberately. One idea, one name.

### Group B — body

> Hi {first name},
>
> Your Luna Vale membership ended on {ended date}. Since then, the story has
> kept going, and I wanted you to know where it is.
>
> **Previously on Between Us**
> {same three-episode recap}
>
> **Added since you left:**
> {per-person list}
>
> If you'd like to come back, it's the same membership you had, and you can
> cancel any time.
> **[Come back to Luna Vale →]** {/membership link}
>
> And if you left because something wasn't right, I'd really like to know.
> Just reply.
>
> Melissa
>
> *{unsubscribe link} — I won't write again unless you come back.*

## 5. How it would be built (after approval)

This is small, and it reuses what already exists.

| Piece | What it is | Effort |
|---|---|---|
| `lib/content/recaps.ts` | The approved "Previously on" text per episode, as structured content. Once you approve it, it's reusable in new-episode emails and on the site. | under an hour |
| `scripts/winback.ts` | Built the same way as `scripts/announce.ts`: **dry run by default**, segments A/B from the database and Stripe, a per-person "since you joined" list from `releases()`, skips `email_optouts`, records in `email_sends` so it can never double-send, sends from `MAIL_FROM` with replies going to `OWNER_EMAIL`, and adds a signed unsubscribe link. | 2–3 hours |
| Tagged links | Every link carries `utm_source=email&utm_medium=winback&utm_campaign=winback-2026-10-{a\|b}`. Rejoins flow into Stripe metadata and show up on `/admin/conversion` by campaign. | already built |
| Test send | `--to=<your address> --send` first, so you see the real email in your own inbox. | 5 minutes |

**One thing to verify before sending.** These cancellations were recorded by
Stripe with `cancel_at`. Before the "Keep my membership" button is promised,
I'll confirm on a test-mode subscription cancelled the same way that the
billing portal shows a working "Renew" option. If it doesn't, the button will
point to a reply-to-me line instead, and you'd switch renewal back on by hand.

## 6. Decisions for you

1. **The recap text.** It's canon-adjacent, so it needs your eye: is anything in it wrong or too much?
2. **Group B (former members):** send the one email, or not? They paid you recently and every email carries an unsubscribe link, which is the usual standard for writing to past customers about the same product. It's still your call, and you may want to be more conservative, since several are in the UK and EU. This is not legal advice.
3. **Group A timing:** Tuesday morning, Oct 13 (your time), before the first expiry on Oct 14.
4. **Later, and only after the Oct 25 baseline:** "too expensive" plus "I want it once" suggest testing the yearly plan (configured, but not live in Stripe) or a one-off season pass. That's a pricing change, so it's a separate decision and a separate measurement.

## 7. How we'll know it worked

| Measure | Source | Read on |
|---|---|---|
| Group A members who switch renewal back on | `memberships.cancel_at_period_end` turning false, via the webhook | each person's end date, last on Nov 3 |
| Group B members who rejoin | Stripe checkout metadata, campaign `winback-2026-10-b` | Oct 27 (14 days) |
| Replies, and what they say | your inbox (`OWNER_EMAIL`) | ongoing |
| Plays by Group A after the email | `play_starts` (member plays) | rough only: counts aren't per person, on purpose |

**What would count as a result:** any reactivation is real money, $8 a month
per person. At 16 people, though, "3 came back" and "0 came back" are both
anecdotes. The replies are probably worth more than the counts.
