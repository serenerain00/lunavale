# Social Growth Agent — audit and plan

*Written 2026-10-11 against `CLAUDE_marketing_agent.md`. Everything below the
audit is a proposal. Nothing is built, nothing is published, and the calendar
at the end is a set of drafts for Melissa to approve, edit or bin.*

> **UPDATE 2026-10-11 — measurement now exists and is owned elsewhere.** The
> other Luna Vale session shipped first-party attribution and `/admin/conversion`
> (commit e8c556e), with Melissa's approval. **Split:** this plan owns Instagram
> post data, the editorial queue and publishing; measurement (post → visit →
> payment, the weekly report) lives in `docs/analytics/ATTRIBUTION.md`. So §2.5
> below is **superseded**. Every link we publish uses
> `utm_source=instagram&utm_medium=<reel|story|post|bio|dm>&utm_campaign=<post_id>&utm_content=<variant>`,
> and `post_id` from the queue is the join key. Also: **no new callers of the
> Clarity export API** (10 a day, 8 taken), and **no conversion-optimising site
> changes before 2026-10-25** (baseline). Typeable short paths (`/suit`) would
> be a site change, so they need clearing with Melissa and the measurement
> session first.

---

## 0. Melissa's direction, 2026-10-11 (supersedes anything below that disagrees)

- **IG promos are 30 seconds or under**, to test what performs. Existing posts
  under 3 minutes can still go up as they are; over 3 minutes IG limits reach.
- **Music is fine** — it came from IG in the first place.
- **The point is custom promos, not reposts**: trailer-style cuts, montages,
  teasers, "commercials" — edits that make people feel something and want the
  rest. These are what take Melissa longest, so they are what the agent should
  take off her hands.

So the pipeline gains a **promo maker** (`scripts/promo/make-promo.py`): each
promo is a short JSON edit list in `scripts/promo/specs/` — shots with crop
centres, a music bed lifted from the dialogue-free stretches of the `-music`
export, a line or two of type, and the BETWEEN US end card. Output is a
1080×1920, 30 fps, H.264/AAC, -14 LUFS MP4 in `stories/_promos/` (never
deployed). First one: `it-suits-you.json`, 29.9 s.

In the queue, a draft post now points at a **rendered promo**, not a raw clip,
and approval is of the video *and* the caption together.

---

## 1. What exists today (the audit)

| Area | What is actually there | Source of truth |
|---|---|---|
| Framework | Next.js 16 App Router, TypeScript, deployed to Vercel from the working tree with the CLI | `package.json`, `docs/architecture/` |
| Content | Typed modules, not a CMS. **Clips** (landscape story pieces, 63 live) in `lib/content/videos.ts`; **posts** (the IG verticals, 21) in `lib/content/posts.ts`; journal, chronology, season, releases alongside | the modules themselves |
| Media | Private Vercel Blob. Every stream is server-authorised; signed-out viewers get a `-preview` proxy or a 403. No public media URLs exist | `scripts/upload-media.mjs`, `app/api/…` |
| Access | `lib/access/entitlement.ts` → Clerk user → `memberships` row. Free accounts open nothing a visitor can't see | entitlement module |
| Membership | One paid tier, $8/month, Stripe Checkout (pay-first), webhook → Neon `memberships` / `pending_memberships` | `lib/billing/stripe.ts`, `app/api/stripe/webhook` |
| Admin | Owner-only `/admin` (404 for everyone else) and `/admin/studio` (image pipeline) | `app/admin/` |
| Analytics | **Microsoft Clarity only** (sessions, referrers, heatmaps), production only. No Vercel Analytics, no GA | `app/layout.tsx` |
| Attribution | **None.** No UTM capture, no first-touch cookie, nothing about where a buyer came from reaches Stripe or the database. The email list records a `source`, but only which form on the site was used | `lib/db/followers.ts` |
| Scheduling | No cron jobs configured | `vercel.json` |
| Social | No Instagram integration of any kind. Posts are uploaded to IG by hand, then mirrored to the site | — |

**The three gaps that matter, in order:**

1. **Nothing connects a purchase to where the buyer came from.** Every question
   on Melissa's list ("which character drives subscribers?") is unanswerable
   today, and *it cannot be backfilled* — attribution only exists from the day
   it starts being recorded. This is why §4 puts it in Phase 1, not last.
2. **Instagram captions can't carry links.** A Reel's only paths to the site
   are the bio link and Stories link stickers. Per-post attribution therefore
   needs something a viewer can type or tap that is unique to that post (§4).
3. **There is no public copy of any video**, by design. Meta's API fetches the
   video from a public URL, so publishing needs a short-lived public copy of the
   *approved promo cut only* — never the member file.

**What I found that the brief or the mock-up assumes, but isn't so:**

- *"Josh expects her to return sooner than she does"* (brief) — not in either
  canon file. I will not use it in copy until Melissa confirms it.
- *"Episode 4 promotional poster"* (dashboard mock-up) — there is no episode 4
  yet. Episodes 1–3 are live.
- *"Luna + Josh — Kitchen Argument"* — the nearest real asset is **Then Tell
  Me** (`luna-josh-fight-45m`), which is already on Instagram.
- The 21 **posts** on the site are, by definition, already on Instagram.
  Re-posting them is a duplicate, not new reach. New IG material comes from the
  landscape clips and their free preview windows, cut vertical.

---

## 2. The design, smallest version that works

```
content modules ─► Promo inventory ─► Draft queue ─► Approve ─► Schedule ─► Publish (Meta API)
 (videos/posts)     + owner flags       (Claude)       (Melissa)   (cron)        │
                                                                                 ▼
 Stripe webhook ◄── checkout metadata ◄── first-touch cookie ◄── lunavale38.com/<code>
      │
      ▼
 Weekly report: posts → visits → checkouts → paid members → revenue, by character/theme/hook
```

Lives inside the existing app at **`/admin/social`** (owner-only, same gate as
`/admin`), shaped like Melissa's mock-up: *Today's recommended posts*, each with
theme, goal, status and Approve / Edit caption / Schedule.

### 2.1 Promo inventory — derived, not duplicated

The content modules stay the source of truth for title, duration, characters,
feelings, access and story position. A small `promo_assets` table adds only what
they don't know:

| column | meaning |
|---|---|
| `asset_id` | `clip:<slug>` or `post:<id>` — matches the content modules |
| `window` | which seconds are promotable, e.g. the free preview `0–62` |
| `spoiler_tier` | `released` · `teaser-approved` · `hold` (see §3) |
| `music` | `cleared` · `ig-library-only` · `unknown` |
| `approved_for_promo` | Melissa's yes, with `approved_at` |
| `already_on_ig` | true for every existing post |

Default for anything new: `hold` / `unknown` / not approved.

### 2.2 Draft queue — `social_posts`

`post_id, asset_id, platform, caption, hook, cta, short_code, landing_url,
utm_campaign, hashtags, audience, spoiler_tier, theme, characters[],
status (draft → needs_review → approved → scheduled → publishing → published | failed),
reviewer, scheduled_for (America/New_York), ig_container_id, ig_media_id,
ig_permalink, retry_count, last_error, fingerprint, created_at, updated_at`

- `fingerprint` = hash of asset + window + caption. A unique index stops the
  same thing going out twice.
- Only `approved` rows can move to `scheduled`; the database enforces it, not
  just the UI.

### 2.3 Publishing — official Instagram API only

- **Account:** Melissa's IG must be a **Business** account (Meta's own docs are
  the authority on whether Creator accounts can publish via the API; confirm at
  setup). Instagram API with Instagram Login, permission
  `instagram_business_content_publish`, plus `instagram_business_basic` and
  `instagram_business_manage_insights` for metrics.
- **Flow:** create media container → poll until `FINISHED` → publish → record
  IDs. 100 API posts per rolling 24h, far above anything we'd do.
- **Video:** MP4/H.264/AAC, 9:16, ≤1 GB, 3s–15min. A promo-cut script renders
  the approved window vertical, uploads it to a **public, unguessable, temporary**
  Blob path, and deletes it once Meta reports `FINISHED`.
- **Scheduler:** one Vercel Cron (`/api/social/tick`, every 15 min, guarded by
  `CRON_SECRET`). Claims a due row with a single
  `UPDATE … WHERE status='scheduled' … RETURNING` so two runs can't both take it.
- **Off by default:** `SOCIAL_PUBLISH_LIVE` must be `true` *and* the row
  approved. Otherwise the tick runs as a dry run and logs what it would do.

### 2.4 AI drafting

Claude drafts in-session (no new paid API): reads the inventory and canon, then
writes 2–3 hook/caption variants per asset into the queue as `needs_review`,
validated against the schema before insert. Drafts never touch canon and never
publish. An in-app "regenerate" button via AI Gateway can come later if useful;
it would be a small, metered cost.

### 2.5 Attribution — the part that answers the business questions

1. **Per-post short codes.** Each post gets a typeable path:
   `lunavale38.com/suit`, `/sitstill`, `/ep3`. Captions say *"Full scene:
   lunavale38.com/suit"*; the bio link and Story stickers use the same codes.
   Each redirects to the real page with UTM tags.
2. **First-touch cookie.** On arrival, a first-party cookie records the first
   campaign + landing page (and the latest one), for 30 days. No personal data.
3. **Into Stripe.** Checkout already stamps session metadata. Add `campaign`,
   `content`, `landing` from the cookie. The webhook copies it to an
   `attributions` row keyed by subscription.
4. **Report** joins `social_posts` → visits (Clarity/redirect counts) →
   checkouts started → paid → still paying after 30 days, grouped by post,
   character pairing, theme and hook.

**What it will honestly be able to say.** At today's volume (22 renewing
members), a week's numbers are anecdotes. "Luna/Tyson converts better than
Luna/Josh" needs dozens of attributed signups before it means anything. The
report will show counts and say when they're too small to conclude from, rather
than dress a coin-flip up as an insight. People who see a Reel and type the
plain URL a day later won't be attributed; the report labels that as
*unattributed*, not *organic*.

A privacy-policy line about the attribution cookie goes in with Phase 1.

---

## 3. Spoiler tiers

| tier | means | today |
|---|---|---|
| `released` | free on the site, or the free preview window of a released clip | Default for the free clips and preview windows below |
| `teaser-approved` | Melissa has explicitly OK'd it as a forward look | The *Nine Years Ago* trailer (she posted it to IG on 2026-10-09) |
| `hold` | anything else, including all member-only footage past its free window | Default |

Copy rules: no claim that Luna and Tyson are in love or "something more";
Luna still loves Josh; Josh is not a villain; nothing about the detectives
storyline beyond what the trailer already shows.

---

## 4. Phased checklist

**Phase 0 — Audit** ✅ this document.

**Phase 1 — Safe MVP** *(needs approval to start)*
- [ ] `promo_assets`, `social_posts`, `attributions` tables + migration
- [ ] Short-code redirects with UTM, first-touch cookie, checkout metadata,
      webhook → `attributions` (**ship this first** — it starts the clock)
- [ ] `/admin/social`: today's recommendations, approve / edit / schedule
- [ ] Promo-cut script (vertical render of an approved window), preview in the
      dashboard
- [ ] Dry-run scheduler (cron + idempotent claim), feature flag off
- [ ] Tests: state transitions, approval gate, duplicate fingerprint, double-claim
- [ ] Health-check additions: a scheduled post with no approval; a failed publish

**Phase 2 — Instagram** — Meta app + Business account (Melissa), token storage
and refresh, one explicitly approved test post, logging, retries, alerting.

**Phase 3 — Measurement** — IG Insights pull, weekly report in `/admin/social`.

**Phase 4 — Optimisation** — hook/CTA/time-of-day tests; any increase in
autonomy only with written limits.

**Environment (names only):** `META_APP_ID`, `META_APP_SECRET`,
`IG_BUSINESS_ACCOUNT_ID`, `IG_ACCESS_TOKEN` (long-lived, refreshed server-side),
`SOCIAL_PUBLISH_LIVE`, `CRON_SECRET`.

**Rollback:** set `SOCIAL_PUBLISH_LIVE=false` (stops publishing immediately);
the attribution cookie and short codes are inert if removed.

### Decisions Melissa needs to make

1. Are the **free preview windows** of member clips approved for IG, or only
   for the site?
2. ~~Music~~ — settled 2026-10-11: fine as is.
3. Is the IG account **Business** or **Creator**?
4. Confirm or correct *"Josh expects her to return sooner than she does."*

---

## 5. Ten candidate assets

All exist on the site today. None of these have been posted to IG as far as the
repo knows, except where marked. Every one is `needs_review` on **music**,
because the repo doesn't record clearance.

| # | Asset | Window | Pair / theme | Spoiler | Status | Landing |
|---|---|---|---|---|---|---|
| 1 | **It Suits You** `luna-ty-suit` | 0:00–1:02 (free preview) | Luna+Tyson · unexpected awareness | released | needs_review (new; preview-for-IG question) | `/clips/luna-ty-suit` |
| 2 | **Sit Still** `luna-tyson-shaving` | free, 3:13 → cut to ~60s | Luna+Tyson · care, humour | released | needs_review (music) | `/clips/luna-tyson-shaving` |
| 3 | **Most Nights** `luna-ty-couch` | free, 1:49 | Luna+Tyson · quiet | released | needs_review (music) | `/clips/luna-ty-couch` |
| 4 | **Have Fun** `young-luna-ty-apt` | free, 1:35 | Young Luna+Tyson · twenty years | released | needs_review (music) | `/clips/young-luna-ty-apt` |
| 5 | **Three Days** `luna-josh-truck-leaving` | 0:00–0:30 (free preview) | Luna+Josh · tenderness, before the end | released | needs_review (preview-for-IG) | `/clips/luna-josh-truck-leaving` |
| 6 | **Trailer** `between-us-trailer-one` | free, 1:41 | All three · series intro | released | needs_review (music) | `/clips/between-us-trailer-one` |
| 7 | **Episode 3: The Space Between** | 0:00–2:09 (free preview) → cut to ~60s | Episode CTA | released | needs_review (preview-for-IG) | `/clips/episode-3` |
| 8 | **Episode 1 (Pilot)** | 0:00–1:00 (free preview) | Episode CTA · mature | released | needs_review (mature on IG) | `/clips/pilot` |
| 9 | **What Was Agreed** `ty-josh-rick-accident` | free, 2:03 | Josh+Tyson+Rick · the secret | released (but it's the series' central secret) | needs_review (spoiler judgement) | `/clips/ty-josh-rick-accident` |
| 10 | **Breathe** `luna-truck-breakdown` | free, 0:15 | Luna+Tyson · panic, care | released | needs_review (music) | `/clips/luna-truck-breakdown` |

Deliberately left out: the 21 existing posts (already on IG), everything
mature-only past its preview, and the *Nine Years Ago* footage beyond the
trailer Melissa already posted.

---

## 6. Draft 7-day calendar — DRAFTS, nothing approved

Every caption was checked against the clip's own synopsis; none says or hints that Tyson felt anything early, or that Luna and Tyson are more than friends. Times are suggestions (ET); Phase 3 data should replace them. Short codes are
proposed and don't exist yet. Until Phase 1 ships, they'd go in the bio link.

| Day | Asset | Mix | Hook (on-screen, first 2s) | Caption draft | CTA |
|---|---|---|---|---|---|
| **Mon** 7pm | It Suits You (0:00–1:02) | tension | A: *"She's known him twenty years. Today he looks different."* · B: *"He hates every suit. She doesn't."* | He needs a suit for a work thing he'd rather skip. She came to tell him it doesn't look stupid. | Full scene, members: **lunavale38.com/suit** |
| **Tue** 12pm | Sit Still | humour | A: *"Never hand your best friend the clippers."* · B: *"Sit. Still."* | A week since Josh. She takes the clippers to his beard and makes a twenty-minute job of it. | Free to watch in full: **lunavale38.com/sitstill** |
| **Wed** 7pm | Episode 3 preview (cut ~60s) | episode CTA | A: *"Episode 3 is out."* · B: *"The Space Between."* | Episode 3 of Between Us. The first two minutes are free on the site. | **lunavale38.com/ep3** |
| **Thu** 7pm | Three Days (0:00–0:30) | tenderness (Luna+Josh) | A: *"Three days. That's all."* · B: *"Neither of them hurries the goodbye."* | Josh is going away for three days. When the truck has gone, she is still standing in the drive. | **lunavale38.com/threedays** |
| **Fri** 8pm | Most Nights | quiet / Luna+Tyson | A: *"Nothing happens. That's the point."* · B: *"Same couch. Opposite ends."* | An evening where nobody says anything worth writing down. | Free in full: **lunavale38.com/mostnights** |
| **Sat** 11am | Have Fun (2006) | origin / humour | A: *"Eighteen."* · B: *"Twenty years ago, before any of it."* | Luna and Tyson at eighteen, on an ordinary night. | **lunavale38.com/havefun** |
| **Sun** 6pm | Trailer | series CTA | A: *"Ten years. Six months apart. One best friend."* · B: *"This is Between Us."* | Episodes 1–3 are on the site now. $8 a month for all of it. | **lunavale38.com/between-us** |

Mix: 2 tension, 3 humour/warmth/tenderness, 2 episode/series CTAs; Luna+Tyson ×4,
Luna+Josh ×1, ensemble ×2. That imbalance is honest about what's free to use;
more Luna+Josh needs either preview windows approved for IG or new verticals.
For the "arguments vs romance" question, it also means Luna+Josh will be
under-sampled until that's fixed.
