# Audit: first-time visitors from Instagram

**Date:** 2026-10-11
**Status:** read-only. Nothing on the site was changed.

**Rule:** nothing here ships before the baseline is complete on **2026-10-25**
(docs/analytics/ATTRIBUTION.md). After that, one change at a time, each
measured against the baseline.

**Sources:**
- Clarity, 3-day exports (Oct 9–11): totals, Source×URL, Device×URL and Browser×URL
- live Stripe checkout sessions for the last 14 days
- headless Chrome on the live site, as an iPhone inside Instagram's browser, throttled to Lighthouse's mobile profile
- the code

**Not used yet:** Clarity session recordings. They need the Clarity MCP, which
loads in a new Claude Code session; see §6.

Each finding is labelled **Observed** (measured here), **Known** (documented
behaviour of a third party, not measured on this site) or **Hypothesis**.

---

## 1. The path, with numbers

Clarity covers Oct 9–11. Stripe covers Sep 28 – Oct 11.

| Step | What we see | Source |
|---|---|---|
| Arrive from Instagram | **101 sessions / 3 days**, 29% of all traffic. 89 of them inside Instagram's own browser. | Clarity |
| First page | Home **61**, /clips 18, /membership 14, Pilot 9, /posts 7 | Clarity Source×URL |
| Open an episode | Pilot: 33 sessions in total, **98% scroll, 49 s active**. Most watch the free minute. | Clarity |
| Reach /membership | 51 sessions in total, **14 from Instagram** | Clarity |
| Open Stripe checkout | **61 sessions in 14 days** | Stripe |
| Type an email in Stripe | **15** (25% of opened) | Stripe |
| Pay | **12** (80% of those who typed an email). **None since Oct 6.** | Stripe |

**The single biggest leak is on Stripe's page, before anyone types anything.**
Of 61 checkouts opened, 46 were left without an email. Once someone starts
typing, they almost always finish.

Caveat: some of the 46 may be speculative loads that slipped past the guard in
`app/membership/start/route.ts`, so treat 46 as a ceiling. Attribution is now
live, so from Oct 11 we can split this by Instagram in-app vs other browsers.

---

## 2. Findings by area

### Mobile experience

- **Observed. 87% of visits are on phones or tablets.** The site looks good on them: the cinematic identity holds at 390 px, and nothing overflows.
- **Observed. The first screen on Home doesn't say what Between Us is.**
  - The hero is a randomly rotating clip. In the audit it was "The Glass", members-only, with a 🔒 **Play** button and "More from The Lakehouse".
  - The one-line explanation ("Between Us is a cinematic slow-burn drama…") starts just **below** the first screen.
  - Someone who just watched a Reel about one scene lands on a different scene and a lock.
- **Observed. Visitors bounce straight back much more inside Instagram's browser.** That's 35 quick returns per 100 page views, against 20 on other phones. On Home it's 18 in 58 sessions.
- **Observed. Script errors happen only inside Instagram's browser.** That's 32 per 100 page views there, against 0 everywhere else.
  - The code review found nothing in the site's own client code likely to throw.
  - That makes injected Instagram scripts the likely cause (Hypothesis).
  - Five of these errors are on /membership, so it's worth confirming in recordings that none of them breaks the Join tap.

### Page speed

These were measured from a Mac with throttling, not from real phones. Treat
them as indicative.

| Page | Main content visible (LCP) | Data | Note |
|---|---|---|---|
| Home | **5.6 s** | 970 KB, 50 requests | The LCP element is the **hero video**; 342 KB of JS |
| Pilot | 0.5 s* | 91 KB | *Shared files were already cached from Home |
| /membership | 0.2 s* | 43 KB | *as above |

- **Observed.** Home is the main Instagram landing page, and it is the slow one. Google's "good" threshold for LCP is 2.5 s.
- The cause is that the largest thing on the first screen is a video, which has to load before the page counts as "shown".
- A poster image as the first paint, with the video fading in over it, would keep the same look and roughly halve that time (Hypothesis: confirm after the change).
- The customer who cancelled with "too expensive — *and slow*" may have meant this. One comment, so unproven.

### Episode discovery

- **Observed. Episode 1 is members-only.** A first-time visitor gets **1:00 of 18:36**. Of 63 clips, 7 are free, and none of them is an episode.
- **Observed. When the free minute ends, the player stops on its last frame.**
  - The only next step is a panel **below** the player (`SceneWatch.tsx`).
  - On a phone, that panel is often off-screen or hidden behind fullscreen.
  - The Pilot has **52 taps that did nothing in 33 sessions**, 45 of them on mobile.
- This is the moment someone is most interested, and it currently offers nothing.

### Membership and pricing

- **Observed.** $8/month and "cancel any time" are clear, and the price is just visible on the first screen.
- **Observed. The headline is about Luna's private journal** ("She wrote all of it down…"), not the episodes. Most Instagram visitors came because of a video.
- **Observed. Only monthly billing is live.** Yearly ($80) is configured in test mode only.
- **Observed. Cancellation reasons point at the shape of the offer:** 5 of 9 leaving members said "I don't use it enough", and 1 said "too expensive". Price may not be the main barrier to joining, but "monthly" may be (Hypothesis).

### Checkout friction

- **Observed. 75% of opened checkouts are left before an email is typed.**
- **Observed, and it corrects an earlier assumption: Apple Pay *is* offered inside Instagram's in-app browser on iPhone.** Melissa tested it from the Instagram app on 2026-10-11.
  - The draft of this audit said Apple Pay is generally unavailable there. That was wrong for this setup, and it is **not** what explains the 75% who leave before typing.
  - The cause of that leak is now open. Candidates, all unmeasured: surprise at leaving the site for Stripe's page; the price seen for the first time on Stripe; or people opening checkout just to look.
  - Clarity recordings around the Join tap, and attribution by browser, are how to narrow it down.
- **Observed. Checkout explicitly lists `card` and `cashapp` only.**
  - Stripe **Link** is enabled on the account but excluded by that explicit list.
  - Link lets anyone who has paid with Link anywhere before pay with their email and a code, with no card typing. Since Apple Pay already works in the in-app browser, this matters less than first thought: it helps Android and returning Link users.
- **Observed.** Pay-first works as designed: no account is needed before paying.

### Calls to action

- **Observed.** The header **Join** is on every page. On phones, the hero's own membership button is hidden (`Hero.tsx:194`).
- **Observed.** The Pilot page's link to the membership is one inline text link: "the LunaVerse".
- **Observed.** On /membership, the button is below the first screen. That's fine, since the price shows first.

### Link previews in Instagram, Threads and DMs

- **Observed. The site answers Meta's crawler user agent (`facebookexternalhit`) with HTTP 429, a bot challenge.** This was tested from a Mac.
- The page itself has correct preview tags.
- **Unverified:** Vercel may let Meta's real crawler through, based on its IP address. If it doesn't, every lunavale38.com link shared in a DM or on Threads shows as a bare URL.
- **Check:** paste `https://lunavale38.com/clips/pilot` into Meta's Sharing Debugger (developers.facebook.com/tools/debug, logged in). The debugger shows the image and title if the crawler gets through, and an error if it doesn't. It takes 2 minutes and needs no code.

---

## 3. Recommendations, prioritised

- **Impact** is the expected effect on paid conversions.
- **Effort** is the build time.
- **Confidence** is how sure we are it helps.

None of these changes the visual identity: same palette, type, imagery and tone.

| # | Change | Impact | Effort | Confidence | Evidence |
|---|---|---|---|---|---|
| **1** | **End-of-preview moment.** When the free minute ends, show a quiet card **over the player's last frame**: "That was the first minute of 18:36. The rest of the episode is for members — $8/month, cancel any time." with **[Keep watching]** and **[Not now]**. No countdown, no blur trick. | High | Low, ~half a day | Medium-high | 52 dead taps on the Pilot; 98% scroll; the panel below is off-screen on phones |
| **2** | **Add Stripe Link to checkout** (dynamic payment methods or add `link`), so returning Stripe users pay without typing a card. | Low-medium (lowered 2026-10-11: Apple Pay already works in Instagram's browser) | Very low, one line in the money path | Low-medium | 75% leave before typing, cause unknown |
| **3** | **Point the Instagram bio at the Pilot,** not Home. Test it by alternating the bio link weekly between `/` and `/clips/pilot`, each tagged. | Medium | **Zero code** | Medium | Home: 5.6 s, a locked random clip, 18 quick returns in 58. Pilot: 49 s active, 98% scroll |
| **4** | **Home's first screen for first-time visitors:** "Between Us" plus the one-line premise above the fold, the hero fixed to the Pilot or trailer (not a random members clip), the primary button **"Watch the first minute free"**, and the poster as the first paint with the video after. | Medium | Medium, 1–2 days | Medium | 61 of 101 Instagram arrivals land here; LCP 5.6 s; the explanation sits below the first screen |
| **5** | **A longer free Pilot,** to its natural first turn (perhaps 4–6 min), or the whole Pilot free. A business decision first, then a test. | Potentially the highest | Low for code; your call on content | Low-medium; could also cannibalise | No episode is free today; streaming usually gives episode 1 away |
| **6** | **Membership headline leads with the episodes,** with the journal second. For example: "Every episode of Between Us, in full — and the pages she never meant anyone to see." | Low-medium | Very low (copy) | Low-medium | Instagram visitors come for video; 22–25 s active on /membership |
| **7** | **Confirm link previews** with Meta's Sharing Debugger. If they're blocked, allow Meta's crawler in the Vercel firewall. | Low-medium (DMs, Threads, Stories) | Very low | Unverified | Crawler user agent gets 429 from outside Meta |
| **8** | **Check the in-app-browser script errors in recordings** (10 sessions on /membership). Fix only if one stops a tap. | Low unless it breaks checkout | Low | Low | Errors appear only in Instagram's browser |
| **9** | **Yearly plan or season pass.** A pricing change, so a separate decision. | Unknown | Low | Low | "Unused" and "too expensive" cancellation reasons |

**Order I'd ship them in after Oct 25:** 7 (a check, not a change) → 3 (no
code) → 1 → 2 → 4 → 6. Then decide on 5 and 9 with real numbers in hand. Each
change runs alone for at least one full week before the next ships.

---

## 4. A/B testing plan

### The honest constraint

At current volume, a classic split test on **paid conversions** cannot reach
significance in any useful time. About 12 payments in 14 days and about 35
Instagram sessions a day means even a doubling of conversions would take months
to separate from noise. Claiming otherwise would be making numbers up.

So each test is judged on a **proxy step with a higher base rate**, and payments
are reported alongside as supporting evidence, not as the verdict.

| Test | Proxy (decides it) | Also watch | Design |
|---|---|---|---|
| **A. End-of-preview card** (#1) | Share of non-member Pilot **plays** that lead to a **/membership** view or checkout opened in the same session | Checkouts opened; paid | **Split test** on Pilot plays: a 50/50 first-party cookie, assigned on the first play and recorded with the play beacon |
| **B. Bio link → Pilot** (#3) | Instagram sessions → **checkout opened** | Paid by `utm_campaign` | **Alternating weeks**: bio→Home (tag `bio-home`), then bio→Pilot (`bio-pilot`), at least 2 weeks each. No code |
| **C. Stripe Link** (#2) | Checkouts with an email ÷ checkouts opened, **Instagram in-app only** | Paid | **Before/after** against the 14-day baseline. You can't randomise payment methods per session cleanly |
| **D. Home first screen** (#4) | Home → episode page or /membership, Instagram sessions; quick-back rate; LCP | Checkouts opened | **Split test** by cookie. The page is static, so variant B renders client-side. Keep the hero image identical, to avoid a flash |

### Sample sizes, so nobody stops early

Test A, as an example. Suppose about 15% of Pilot plays reach /membership
today:

| Effect to detect | Plays needed per arm (80% power, α = 0.05) | Time at about 11 Pilot plays a day |
|---|---|---|
| +50% relative (15% → 22.5%) | **~430** | ~11 weeks |
| Doubling (15% → 30%) | **~120** | ~3 weeks |

So Test A can only detect a large effect. That fits, because the card is
meant to fix a dead end rather than polish a working step. If three weeks show
nothing like a doubling, the honest conclusion is "no large effect".

### Rules for every test

1. **One change live at a time.** Tests B and C can overlap A, because they act on different steps.
2. **Write down the stopping date and the decision rule before starting,** and don't peek-and-stop.
3. **Report the proxy, the payments, and the counts behind every percentage.** At this size, "3 vs 1" is not a result.
4. **Assignment and results are first-party only:** our cookie, our play beacon, our Stripe metadata. No new vendors.
5. **The build needs:** a variant cookie, the variant recorded on `play_starts` and on the Stripe metadata (`ab_*`), and an A/B section on `/admin/conversion`. It's about a day, built **before Oct 25** so Test A can start on the 26th.

---

## 5. What not to change

- **The look.** Palette, type, imagery, pacing and the content notes before playback all serve the story. Every recommendation above works inside them.
- **Pay-first checkout.** It works: 80% of people who start typing finish.
- **"Cancel any time" and "you keep access until the end of the period".** They're true and visible, and they help.
- **No urgency, countdowns, fake scarcity, or blurred "teaser" walls** (CLAUDE.md).

---

## 6. Open checks (no code needed)

- [ ] **Melissa:** paste a lunavale38.com link into Meta's Sharing Debugger and report whether the preview shows (finding: link previews). She said "yea i see it" on 2026-10-11, which probably means it works; to be confirmed.
- [x] **Melissa, 2026-10-11:** from the Instagram app on an iPhone, tapped Join. **Apple Pay is offered** on Stripe's page.
- [ ] **Claude, next session (Clarity MCP loaded):** watch 10 recordings of Instagram visitors on /membership and on the Pilot after the preview ends. Note where taps go and whether any script error coincides with a failed tap.
- [ ] **On 2026-10-25:** read the 14-day baseline on `/admin/conversion`, set each test's decision rule against it, and start.
