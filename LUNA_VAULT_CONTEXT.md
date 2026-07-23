# Luna Vault — Project & Story Context

A single-file briefing to re-load context (for ChatGPT or any assistant that
has lost the thread). Everything here is **canon as set by Melissa Casole**,
the creator. The written journal entries and scene copy in the app are *drafts
written to this canon* — the canon below is what's authoritative.

---

## What the product is

**Luna Vault** (live at **lunavale38.com**) — a premium, explorable cinematic
story world. Not a Netflix clone and not a plain portfolio: visitors move
through *places* (farmhouse, lakehouse, the bar, the lake, the coffee shop,
the park) and discover scenes, still galleries, short vertical clips, and
Luna's private journal. A paid **Vault membership ($8/month)** unlocks the
locked rooms, the full scene library, the mature/explicit cuts, and ~80% of
Luna's journal.

Tone: mature, intimate, emotionally layered, sensual, understated, realistic.
Never cartoonish or melodramatic.

**Creator:** Melissa Casole. **Stack:** Next.js (App Router) + TypeScript +
GSAP, deployed on Vercel. Video served privately from Vercel Blob; auth via
Clerk; billing via Stripe; membership state in Neon Postgres.

---

## The three characters

### Luna — the protagonist
The story is her interior life. She has a **streak**: she likes danger (that's
Josh) but she is loyal (that's Tyson). Through the story she is conflicted,
tormented, sad, angry, lost, "not found yet," confused — living day by day,
second by second, waiting to see what's meant to be. She is not a victim and
not stupid; she sees clearly and chooses badly and knows it.

Her attraction to each man is real and different:
- **With Tyson:** safe, taken care of, familiar — twenty years of friendship
  turned intimate. No fear in it.
- **With Josh:** a thrill. Unpredictable, aggressive *in all the right ways*.
  She likes the danger and is also scared of it — and can no longer fully
  separate the thrill from the fear.

### Josh — her partner of ten years
Together with Luna **10 years**, then **separated for 6 months**. By the end
of the ten years he'd gone **lazy** — stopped noticing the house, the
calendar, her. But he was also **caring, loving, intimate, passionate,
commanding**, and she loved that in him. He owns a **shop** and a large
**farm**; he's very professional, **work-first**.

After six months apart he **called** — coffee, then dinner that same night —
and it all began again. Luna decided to give him another chance. She didn't
know it was about to get **much worse**: once he starts to suspect Luna and
Tyson are more than friends, he turns **jealous, possessive, controlling, even
abusive** — worse than before.

### Tyson — her best friend of twenty years
**Ex-military.** Friend of the family, **distant cousin of Josh**, and helps
Josh on the **farm** here and there (they're friends and co-workers). Into
**extreme sports** — snowboarding, motorcycles, track days — and owns a
**black 2020 Porsche Carrera** that's his baby (he'll ride a motorcycle
recklessly but won't take a hard corner with Luna in the passenger seat).

Over the six months Luna was without Josh, **Tyson and Luna grew closer than
ever** — he felt responsible for keeping her head above water while she
drowned in the end of her ten-year relationship. **Luna started developing
feelings for him** in that window, and so did he. **Neither will admit it.**

When Josh comes back, Tyson **starts putting distance** between himself and
Luna — because distance is the only way he can keep hiding that he's in love
with her.

---

## The engine of the story

- **They never lie to each other** — Luna and Tyson, twenty years, not once.
  So when Luna has dinner with Josh and **doesn't tell Tyson**, it's a real
  break. And Tyson **already knew** — Josh had told him that morning, casually,
  because they're family and co-workers. Tyson lets her have the lie, which
  costs more than confronting her would.
- **The deadlock:** Luna won't say how she feels until Tyson does; Tyson won't
  say it until Luna does. Both know; neither speaks it.
- **Luna is torn** between Josh and Tyson as her future — and stays *with Josh*
  giving it another try, which is what makes everything harder.

### The "staring game" (a signature detail)
An inside thing Luna and Tyson have always done, **learned in the military**:
when one of them thinks the other is lying, they **go silent, move closer to
intimidate, and wait for the other to crack.** Twenty years of using it over
nothing (who finished the coffee, who dented the tailgate). It runs on the
principle that people fill a silence, and fill it faster if you're close
enough. In this situation it stops being a game.

### Key beats already written into scenes/journal
- **Coffee shop:** Josh grazes Luna's **lower lip** mid-sentence — it breaks
  down all her defenses. He touches her, gets close, makes her laugh, is the
  man she first fell for. He asks her to dinner; she says yes though she meant
  to say no.
- **The bar:** Tyson **subliminally tells Luna he's been noticing her** — a
  few words, big meaning, the way he looks at her and won't look away, the long
  silences. "A conversation that never happened, and I understood every word."
- **The park:** Luna and Tyson. He stays **silent**, won't look at her while
  she asks what's wrong. Then eight words: **"You're standing here, and I can't
  do anything about it."** Little words, huge meaning — that's Tyson.
- **Much later:** Tyson and Luna finally have **a night together** — real,
  unhurried intimacy with no fear in it. It's the thing that undoes her,
  because now she *knows the difference*.

---

## The world (locations = the navigation)

| Place | What it is |
|---|---|
| **The Farmhouse** | Where Josh and Luna built their life. Kitchen, bedroom, the long table, the farm road, the barn. |
| **The Lakehouse** | Luna's own place now — water, firelight, the **firepit**. Where she processes everything. |
| **The Bar** | Low light, other people's noise, room to say the real thing. |
| **The Lake** | Open water at the far edge of the farm, out of earshot — where things get said. |
| **The Coffee Shop** | Neutral ground, chosen for exactly that reason. Where Josh restarts it. |
| **The Park** | Open ground, nowhere to hide. |

---

## Content types in the app

- **Scenes** — landscape films (First Morning, Fireside, The Kitchen, Coffee,
  The Barn, etc.). Some free, some members-only, most flagged Mature.
- **Still galleries** — sets of stills from an event (e.g. the Josh & Luna
  dinner), shown as an in-world gallery.
- **Clips** — 9:16 vertical cuts that ran on Instagram. Mostly free; the
  **explicit** one (a sex scene) is members-only, rated 18+, poster hidden.
- **Luna's Journal** — her private handwriting, one entry per page, filed by
  *place* and by *who it's about* (Josh / Tyson / herself). ~33 entries; about
  80% members-only. This is her interior voice and the most canon-sensitive
  writing in the product.

**Content ratings:** `Mature` = intimate/sexual but not graphic. `Explicit ·
18+` = graphic. A separate **content-note** system flags **controlling
behaviour** and **physical violence** *before* a scene plays — because the
story turns toward domestic abuse, and "Mature" alone reads as *sexual*, which
would blindside a viewer bracing for one thing and getting another.

---

## Guardrails / tone rules (for writing in this world)

- Lead with **story**, never with "AI." Production methods are behind-the-scenes only.
- Luna's journal voice: interior, specific, self-revising, fragments allowed,
  never explicit on the page even when the events are. She writes the way
  someone writes when they think no one will read it.
- No melodrama. No villain cartoon — Josh is genuinely charismatic and that's
  what makes his turn land. Tyson is stoic, few words, enormous restraint.
- Mature content is real but never the *only* way to follow the arc.

---

*Prices, tier names, and any placeholder copy in the app are still subject to
Melissa's sign-off. The **canon above is the source of truth**; the drafted
prose in the app is written to it and can be replaced freely.*
