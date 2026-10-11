# Voice assistant — proposal

*2026-10-11. A proposal for review. Nothing here is built, configured, or
deployed.*

## What Melissa asked for

Talk to the marketing agent instead of typing or reading dashboards. Natural
two-way voice with interruption (ElevenLabs), reasoning by Claude, reusing the
same data the dashboard uses, short spoken answers with detail shown on screen,
explicit confirmation before anything consequential, private, no keys in the
browser, and usage costs tracked.

## An honest starting point

The voice layer is the easy part. What the assistant can *know* is the hard
part, and today most of it doesn't exist yet:

| Question | Answerable today? |
|---|---|
| "How much revenue this week?" / "How did we do today?" | **Yes** — Stripe + the `memberships` table |
| "Why aren't people subscribing?" | **Partly** — the funnel in `/admin/conversion` (Clarity daily copy in `traffic_daily`, play starts, checkout starts vs paid). The voice agent reads those tables and **never calls the Clarity API** (10 a day, 8 already used) |
| "Which Reel brought the most subscribers?" | **Yes, from now on** — attribution shipped 2026-10-11 (`docs/analytics/ATTRIBUTION.md`); answers grow as tagged posts go out. Small numbers for a while |
| "What should we post tomorrow?" / "Prepare three promos" | **Partly** — the content inventory and the promo maker exist; there is no queue yet |
| Instagram analytics | **No** — Instagram isn't connected yet |

So the voice assistant should be built **on top of** the Social Growth
dashboard's data layer, not beside it: one set of server functions that the dashboards render and the voice agent
calls — reusing what `/admin/conversion` already computes rather than a second
copy. That
is what "no duplicated business logic" means in practice.

## The three ElevenLabs options

| | How it works | Fit here |
|---|---|---|
| **A. Agent + Claude chosen in ElevenLabs + webhook tools** | ElevenLabs runs speech-to-text, turn-taking, interruption, text-to-speech *and* calls Claude (Sonnet is a built-in choice). When Claude needs data it calls our HTTPS endpoints. | **Recommended for the prototype.** Least code; every piece runs on Vercel as ordinary request/response routes. |
| **B. Agent + Custom LLM endpoint** | Same, but every turn is sent to our own OpenAI-compatible endpoint, which calls Claude with our tools. | **The upgrade path.** Use it once the in-app marketing agent exists, so the dashboard and voice share one Claude prompt and one tool loop, billed to our own Claude account. |
| **C. Speech Engine SDK** | ElevenLabs does speech only; our server receives transcripts and streams LLM text back. | **Not now.** It needs a **persistent WebSocket server**, and this site is serverless on Vercel, so it would mean running and paying for a second always-on server. |

## The prototype (option A), read-only

```
Browser /admin/voice  ──WebRTC──►  ElevenLabs Agent (STT · turn-taking · TTS · Claude)
   ▲   owner-only page                     │ webhook tools (HTTPS + shared secret)
   │                                       ▼
   │  conversation token      lunavale38.com/api/voice/tools/*  ──►  lib/marketing/* (Stripe, Neon, content)
   └──── /api/voice/session (owner-only; holds the ElevenLabs key)
```

1. **The agent**, created in Melissa's ElevenLabs account: her chosen voice,
   Claude Sonnet as the LLM, authentication required (no public link), and a
   system prompt built from `CLAUDE_marketing_agent.md` plus voice rules: answer
   in two or three spoken sentences; never read tables aloud; offer "want it on
   screen?"; say plainly when data isn't connected yet.
2. **`/admin/voice`**: owner-only, same gate as `/admin`. A talk button, the
   live transcript, and a panel where detailed reports appear.
3. **`/api/voice/session`**: owner-only. Uses `ELEVENLABS_API_KEY` server-side
   to mint a short-lived conversation token. The key never reaches the browser.
4. **Three read-only webhook tools**, each verifying a shared secret header:
   - `business_snapshot(range)`: members (new, renewing, cancelling, failed
     cards), revenue, checkouts started vs completed.
   - `content_inventory()`: recent releases, free vs member, promo-ready assets.
   - `report(id)`: the full table behind the last answer.

   Each returns a one-line `speak` summary plus a `report_id`.
5. **One client tool, `show_report(report_id)`**: Claude calls it when Melissa
   says "show me". The page fetches that report from our server and renders
   it. No data rides through the browser that the server didn't already gate.
6. **Memory**: within a session, ElevenLabs keeps the conversation and Claude
   sees all of it. Memory across sessions is out of scope for the prototype.
7. **Costs**: ElevenLabs' post-call webhook reports each conversation's length
   and cost into a `voice_usage` table, shown on the page as month-to-date, plus
   a spending cap set in the ElevenLabs account. Third-party reviews put Agents
   at about $0.08 a minute plus LLM tokens; confirm against her plan.

**No write actions in the prototype.** It can look and recommend, not act.

## When it's allowed to act (later)

- Voice can **prepare** things: draft three posts, queue a promo render. Those
  land as `needs_review` items in the dashboard.
- **Publishing, changing site content, or anything with money or customers
  needs a tap on a Confirm button** in the dashboard, showing exactly what will
  happen. A spoken "yes" isn't enough, because speech-to-text can mishear and a
  stray "yeah" mid-sentence must never publish anything.
- The server enforces this, not the prompt: webhook tools that act only ever
  create pending items, and the confirm endpoint checks it's Melissa, signed in,
  clicking.

## Environment (names only)

`ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID`, `VOICE_TOOL_SECRET`,
`ELEVENLABS_WEBHOOK_SECRET`.

## Order of work

1. Build `lib/marketing/*` (business snapshot, content inventory). The Social
   Growth dashboard needs these first anyway.
2. Voice prototype on top: agent config, session route, three tools, page, cost
   logging. Roughly a day once step 1 exists.
3. Attribution and the Instagram connection (social plan phases 1–3). Each one
   makes the assistant able to answer another question on the list.
4. Move to option B when the in-app agent exists; add prepare-only actions with
   tap-to-confirm.

## Voice — chosen 2026-10-11

**Eryn** (`DXFkLCBUTmvXpp2QwZjA`), from Melissa's ElevenLabs library, picked on
her request: built for AI assistants, calm, clear articulation, supports the
fastest agent model (Flash v2.5) and the newest (v4). Fallback: Elise
(`EST9Ui6982FZPSi7gCHi`). Not the Luna or Josh voices, which were experiments.

## Decisions for Melissa

1. ~~Plan and voice~~ — pay-as-you-go (67,156 credits a month, resets on the 15th); voice is Eryn.
2. OK for the assistant to live at `/admin/voice` on the live site, owner-only?
   (The alternative is local-only, but then it can't be used from a phone.)
3. A monthly spending cap for voice?
