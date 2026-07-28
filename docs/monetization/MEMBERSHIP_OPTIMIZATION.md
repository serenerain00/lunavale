# Membership Optimization

## What This Document Is

`MONETIZATION.md` defines the **structure** — what is free, what a membership
unlocks, and the ethical rules that bind both.

This document defines the **strategy on top of it** — how a visitor becomes a
member, and how a member stays one.

When the two disagree, `MONETIZATION.md` wins. It is the one that
`lib/content/membership.ts` is derived from.

---

## Precedence

Read this **after** `CLAUDE.md`, not instead of it.

Where this document conflicts with CLAUDE.md's Experience Principles,
**CLAUDE.md wins.** This document optimizes *within* those constraints, never
around them.

Three collisions are known and already resolved in CLAUDE.md's favour:

| Tempting here | Forbidden there |
| --- | --- |
| Netflix-style rows and autoplay | "should not be built as a standard Netflix clone" |
| Anything that pressures the "one more scene" | "Performance Restraint", "Premium Without Manipulation" |
| Withheld answers used as a pressure lever | "No fake scarcity", "No shame-based messaging" |

The distinction that matters: **curiosity is a property of the story; scarcity
is a property of the interface.** Building the first is the job. Manufacturing
the second is not, and `membership.ts` already encodes that — nothing in the
product expires, counts down, or is limited to N members.

The restraint *is* the premium feel. It is not a tax on growth.

---

## Current State

Recommendations that ignore these will be wrong. Keep this section current —
it is the part that goes stale.

**Tiers** (`lib/content/membership.ts`):

| Tier | Price | Status |
| --- | --- | --- |
| Visitor | free | live |
| **Vault** | **$8/mo or $80/yr** (two months free) | **live — the only paid tier today** |
| Patron | $20/mo or $200/yr | `available: false` — withheld until the production material exists |

**Instrumentation:** Microsoft Clarity only (`app/layout.tsx`, production only,
project `xr14rpnqlh`). Heatmaps and session replay. No funnel, no cohort
retention, no revenue reporting. See *The Measurement Gap* below.

**Numbers** — re-fill these monthly. Last read **2026-07-28**, site live ~1 week:

| | | |
| --- | --- | --- |
| Paying members | **0** | Stripe |
| Unique visitors | **85** (91 sessions) | Clarity, 07/08–07/28 window |
| Visitor → member conversion | **not yet measurable** | see below |
| Monthly churn | n/a — no members | Stripe |

Engagement baseline, same window: 2.08 pages/session, 76% scroll depth, 1.7 min
active of 2.1 min total, 5.5% returning. Friction signals: 7.7% dead clicks (7
sessions), 1.1% rage clicks (1), 0% excessive scrolling.

### What these numbers mean

**The funnel is starved, not leaky.** At 85 unique visitors, a 2% conversion
rate predicts 1.7 members. Observing zero is entirely consistent with a
perfectly healthy funnel — it is a sample-size result, not a verdict on the
paywall, the pricing or the UX.

Two consequences, and they are the most load-bearing lines in this document:

1. **Do not change the product in response to zero conversions.** There is no
   signal to respond to. Any change justified that way is reacting to noise.
2. **Conversion rate is unreadable below ~500 visitors/month** (where 1% starts
   producing countable results). Telling 1% from 2% needs thousands. Until then,
   the conversion half of this document is not actionable and acquisition is the
   entire job.

The engagement numbers are good for a one-week-old site — 76% scroll depth and
an 81% active-time ratio say the people who arrive are genuinely interested, and
nothing is visibly broken. That is the argument for leaving the interface alone
and pointing everything at the top of the funnel.

---

## Primary Business Goal

**$8,000 MRR within 3 months.**

Stated previously as "1,000 members at $8/month" — but that is one path to the
number, and the most expensive one available. There are three levers:

1. **Vault volume.** 1,000 members at $8. The path this document originally
   assumed, and the hardest.
2. **Annual mix.** $80 up front is live right now — ten months of revenue
   collected on day one, and eleven fewer opportunities to cancel over the
   following year.
3. **Patron.** Code-complete and priced. Blocked on the production material
   existing, not on engineering. Every Patron is worth 2.5 Vault members, and
   they convert from people who already trust the work — the cheapest revenue on
   this list.

Prefer the cheapest lever that moves the number. Do not default to lever 1
because it was written down first.

### What the target actually requires

1,000 net new members in 90 days is **~11 net new paying members every day,
every day, for three months.**

Working backwards: paid-content sites convert roughly 1–2% of *engaged*
visitors — lower for cold social traffic. Treat that as a range, not a figure.

| Conversion | Engaged visitors needed / 90 days | Per day |
| --- | --- | --- |
| 2% | ~50,000 | ~550 |
| 1% | ~100,000 | ~1,100 |

Then add churn. At 5–10% monthly, *holding* 1,000 requires acquiring
meaningfully more than 1,000.

This is not an argument that the goal is wrong. It is an argument about which
variable to work on, and it should be re-run whenever the Current State numbers
change.

---

## The Constraint: Traffic Before Conversion

**Conversion rate is a multiplier. Traffic is the thing being multiplied.**

Doubling conversion is excellent, rare work — and it is worth nothing at 50
visitors a day. If the Current State numbers show traffic is the smaller number,
then on-site optimization is the *second* priority regardless of how much of
this document is about it.

Before accepting any conversion task, ask: **is the funnel starved or is it
leaky?** Answer from the numbers, then work on the one that is actually broken.

Two different jobs live inside this goal, and they need different tactics:

- **0 → ~50 members.** Direct outreach, existing audience, community, creators
  with overlapping audiences. Almost no on-site UX work moves this. People
  convert here because of who is asking, not because of a well-placed CTA.
- **~50 → 1,000 members.** Now the funnel exists and is worth optimizing. This
  is where the rest of this document earns its keep.

Know which one is in progress. Advice for the wrong phase is worse than none.

---

## Acquisition

The half the original brief omitted. On-site conversion cannot compensate for an
empty top of funnel.

Optimize for:

- **Clips that stand alone.** A scene that means something to someone with zero
  context, ending somewhere that makes them want the rest. See
  `stories/reels/build.sh` for the cast-interview cuts.
- **A destination worth the click.** Every off-site clip should land somewhere
  that continues that specific emotional thread, not a generic home page.
- **Owned audience over rented.** Email and accounts survive an algorithm
  change; followers do not. A free account is a conversion event worth
  optimizing in its own right.
- **The interview and behind-the-scenes material as acquisition, not bonus.**
  It is the most shareable content in the vault and it costs nothing to reuse.

Judge acquisition work by the same standard as everything else: does it produce
engaged visitors, or only impressions?

---

## Design Philosophy

The site's look and feel is established and correct. Assume the branding, the
visual language, the aesthetic, and the premium feel are all right.

Do **not** redesign for the sake of redesign.

Instead:

- reorganize content when beneficial
- improve information hierarchy
- improve discovery
- improve emotional flow
- improve navigation
- improve conversion opportunities
- reduce friction

while preserving the existing identity.

---

## Membership Philosophy

We are **not** selling access.

We are selling:

- curiosity
- emotional investment
- anticipation
- exclusivity
- continuation of the story

Visitors should feel:

> "I need to know what happens next."

Members should feel:

> "I'm always ahead."

---

## Product Principles

### Curiosity

Leave emotional questions unanswered. Every scene should naturally lead to
another.

The question is left open because the *story* is not finished — not because the
interface is holding it hostage. `MONETIZATION.md`'s Conversion Moments are the
approved list: a locked door, the end of a free memory, a cliffhanger, an
alternate-cut preview. Those are places the world is genuinely deeper. Use
those.

### Emotional Investment

Increase attachment to Luna, Tyson and Josh through storytelling rather than
explanation.

### Continuation

Recommend the next scene, related emotional moments, the natural continuation.

Make the next thing easy to find and worth finding. Do not make it hard to
stop — CLAUDE.md's Performance Restraint applies, and a platform that traps
people is the opposite of the tone this world is going for.

### Retention

Think past conversion. How does someone stay subscribed for twelve months?

Increase: return visits, emotional attachment, unfinished storylines,
anticipation for what is next.

Retention is mostly a **content cadence** problem, not a UX problem. `membership.ts`
promises "new material lands every month." The single highest-leverage retention
work is making that true and visible. No amount of interface can retain someone
who has run out of things to watch.

The standing commitment is one character drop a week — see
`docs/content/CHARACTER_CADENCE.md` for what counts as a drop, where the gaps
are, and the log. Character material is the cheapest thing to feed weekly:
a Between Takes note needs no shoot, no edit, and lands on a page that already
exists.

---

## Existing Content First

The site already has free and member-exclusive content. Before proposing
anything new, determine whether existing content could be surfaced better,
prioritized differently, introduced earlier, reorganized, or connected more
intelligently.

If existing content can drive more memberships through better presentation,
recommend that first. It ships sooner and it costs nothing to produce.

---

## UX Expectations

Consider page hierarchy, placement, discoverability, calls-to-action, emotional
timing, navigation flow, recommendations, onboarding, and friction.

Do not recommend a change because it is a common pattern. Every recommendation
needs a business reason and an expected direction of effect.

---

## Challenge Assumptions

Do not simply agree.

If there is a better approach: explain why, explain the expected impact, propose
alternatives. Push back when appropriate. Optimize for business outcomes rather
than implementation effort.

This applies to the goal itself. If the numbers say the target is not reachable
on the current trajectory, say that plainly and early rather than optimizing
politely toward a miss.

---

## Success Metrics

Prioritize improvements that move:

- Visitor → member conversion rate
- Member retention / churn
- Free account signups
- Scenes watched per visit
- Return visits per week
- Scene completion rate
- Click-through on recommendations
- Annual vs. monthly mix
- MRR

### The Measurement Gap

**Clarity can measure two of these.** It gives session replay and heatmaps — not
funnels, not cohorts, not revenue.

Conversion rate, retention, scenes per visit, return visits, completion rate and
MRR are **not currently instrumented.** Until they are, "every recommendation
needs a measurable business reason" cannot be honoured, and the honest thing is
to label recommendations as reasoned rather than measured.

Closing the gap needs two things:

1. A product analytics tool with a real funnel and cohort retention.
2. Stripe as the source of truth for revenue and churn — it already knows;
   nothing reads it back.

This is a prerequisite for most of this document, not a follow-up to it.

---

## Overall Objective

Refine a site with a strong foundation into a high-converting subscription
platform — through exceptional UX, emotional storytelling, intelligent content
organization, and frictionless discovery.

Preserve the brand. Improve the product. Fill the funnel before optimizing it.
Measure what you claim.
