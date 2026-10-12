# Attribution — from an Instagram post to a paying member

**Goal:** know which marketing activity creates paying subscribers, not which
gets views. Every number below is first-party: Clarity, our own database, and
our own Stripe account.

## How a payment is traced

```text
Instagram post (tagged link)
  → landing page: CaptureAttribution writes lv_ft / lv_lt cookies (labels only)
  → /membership/start copies them onto the Stripe Checkout Session metadata
  → Stripe records the payment, with ft_* / lt_* attached
  → /admin/conversion reads Stripe and groups by source and campaign
```

- `lv_ft` is the **first touch**. It is set once and kept for 90 days.
- `lv_lt` is the **last touch**. It is replaced by any later visit that arrives from outside the site, and kept for 30 days. Direct visits, pages inside the site, and returns from Stripe or sign-in never replace it.
- **No identity is stored.** The cookies hold campaign labels only.
- Code lives in `lib/analytics/attribution.ts`, `components/analytics/CaptureAttribution.tsx` and `lib/billing/checkout-funnel.ts`.

## Tagging convention — use it on every link we publish

```text
https://lunavale38.com/<path>?utm_source=instagram&utm_medium=<medium>&utm_campaign=<post>&utm_content=<variant>
```

| Field | Values |
|---|---|
| `utm_source` | `instagram`, `threads`, `facebook`, `newsletter` |
| `utm_medium` | `reel`, `story`, `post`, `bio`, `dm`, `email` |
| `utm_campaign` | the post's `post_id` from the editorial queue, or the clip slug: lower-case, hyphens |
| `utm_content` | optional; marks the variant in an A/B test (`hook-a`, `hook-b`) |

Untagged visits are still recognised as Instagram, either from Instagram's link
shim (`l.instagram.com`) or from its in-app browser. They just cannot say which
post. Untagged visits show up on the dashboard as **"untagged"**, which is the
measure of how much attribution we are losing.

The bio link counts as one campaign. Tag it `utm_medium=bio&utm_campaign=bio`,
and when it changes, change the campaign too (`bio-2026-10`).

## What each funnel step is measured by

| Step | Instrument | Instagram split |
|---|---|---|
| Visitors | Clarity sessions (daily copy, `traffic_daily`) | Clarity source |
| Opened an episode page | Clarity session-pages on `/clips/*` | Clarity source |
| Started watching | Player beacon, first play per page (`play_starts`) | cookie or in-app browser |
| Viewed /membership | Clarity | Clarity source |
| Began checkout | Stripe sessions with an email | session metadata |
| Paid | Stripe completed sessions | session metadata |

The steps are counts from different instruments over the same window. They are
**not** one group of people followed through. Ratios between steps are what to
track from week to week.

## Baseline rule

**No conversion change ships until the baseline exists:** at least 14 days of
`traffic_daily`, plays and attributed checkouts, recorded with the site
unchanged. A baseline taken across a site change measures the change and the
baseline together, and can't separate the two.

At current volume (about 115 visitors a day, a handful of checkouts a week),
a single week's paid count is too small to compare campaigns. Read campaign
rows as anecdotes until a campaign has more than 10 people who began checkout.

## Limits worth knowing

- Clarity's export allows 10 requests a project a day and covers only the last 3 days. The cron uses 3 of those requests, the Mac's raw snapshot job uses 5, and 2 are left for live questions.
- A person who switches devices, or clears cookies, between the Reel and the payment shows up as unattributed or with a different source.
- The `memberships` table does not store attribution. Stripe is the record, so the attribution lives in session and subscription metadata.
