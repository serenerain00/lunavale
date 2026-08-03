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
Luna's private journal. A paid **LunaVerse membership ($8/month)** unlocks the
locked rooms, the full scene library, the mature/explicit cuts, and ~80% of
Luna's journal.

Tone: mature, intimate, emotionally layered, sensual, understated, realistic.
Never cartoonish or melodramatic.

**Creator:** Melissa Casole. **Stack:** Next.js (App Router) + TypeScript +
GSAP, deployed on Vercel. Video served privately from Vercel Blob; auth via
Clerk; billing via Stripe; membership state in Neon Postgres.

---

## Naming

The membership is **the LunaVerse** (set by Melissa, 2026-07-29). It used to be
called "the Vault" and every visitor-facing string was changed over.

The tier's `id` is still the string `"vault"` and must stay that way — it is in
URLs, the `lv_member` cookie, entitlement checks and `STRIPE_PRICE_VAULT`.
Renaming the id would sign existing members out and break billing lookups. Name
and id are allowed to disagree; only one of them is a promise to a customer.

---

## The characters

**It is a three-hander.** *(Clarified by Melissa, 2026-08-03.)* The story is
**Luna, Josh and Tyson** — those three and no others. Everyone below them is
**tertiary**: they exist to explain one of the three, and the story does not
become theirs.

That includes **Rick**, despite the amount written about him here. It will also
include **Luna's mother**, who surfaces later, and **others still to come**.
Weight of detail in this document is not a measure of standing — Rick has a
long section because his dynamic with Josh needs explaining, not because he is
a fourth lead.

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

### Rick — Josh's father
*(Canon set by Melissa, 2026-07-28. **Tertiary** — see the note at the top of
this section. He is here to explain Josh, not to carry anything himself.)*

**Think boss.** Dominance with charisma — the same combination Josh has, which
is the point: **their dynamic is most of the reason Josh is the way he is.**
Rick is where Josh learned that being magnetic and being in control are the
same act.

He is **strong**, and he is **possessive in his own way**. What he is not is
able to express love well enough for it to have done Josh any good. The care is
real; it never arrives in a form his son can use. Josh grew up being run rather
than loved, and turned into a man who does the same thing to the woman he wants
to keep.

He is **disappointed in Josh for losing Luna** — and at the same time he always
**knew Luna was too good for him.** Both are true and he holds them at once,
which is exactly the kind of father he is: the judgement lands on his son, the
admiration goes to somebody else, and neither is ever said in a way that helps.

In **The Study**, **both men stay seated for the whole scene** — Josh never
stands up to him, not once — and Rick **gets up once, at the very end**, the
only man in the room who does, to say: **"You think you're handling it? You're
not."** He means losing Luna. He does not use her name.

---

### Mexico — the flashback
*(Canon set by Melissa, 2026-07-29.)*

**Five years into the ten**, Josh took Luna to **Mexico**. He booked it himself.

The trip was **good** — properly good. Whatever they had been carrying, they
put down at the airport and neither of them picked it back up while they were
there. They got close again. It was romantic. **He treated her the way she
wanted to be treated**, which is to say the way he had at the start, and it
**reminded her exactly why she fell in love with him.**

She came home feeling like it had been a **reset**.

It is the warmest material in the story and it is a **flashback** — it sits
five years before everything else. That is what makes it useful: it is the
evidence that the man Josh becomes is not the only man he is, and that when
Luna gives him another chance she is not being stupid. She has seen this
version of him. She is trying to get back to Mexico.

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

### The night at the bar — month one
*(Canon set by Melissa, 2026-07-31.)*

**One month** after Josh moved out. Luna needs to get out of the house and
stop thinking about him, and **Tyson takes her somewhere loud** and spends the
night working to keep her happy.

He asks whether she has heard from Josh. **A couple of texts. She hasn't
answered them.** She says she doesn't want to talk about it — and then thinks
about it anyway, all night.

**She makes him dance.** An upbeat song, and it is genuinely joyful — a lot of
laughing, Tyson being goofy, Luna laughing properly for the first time in
weeks. Then a slow song fades in and the room changes with it.

Luna starts to step back. **Tyson pulls her in closer** — to stop her going
somewhere in her head. He tells her she is thinking; he can **literally see
it**. He tells her to **let the night be simple**. She says she doesn't know
why she does this to herself.

This is where **Luna starts seeing Tyson differently.** She is still tied up in
Josh, so it is not a switch being flipped — it is the beginning of something
bigger, and **more complicated than Josh alone.**

### The fall fair — week two of trying again
*(Canon set by Melissa, 2026-08-02.)*

**Josh takes Luna to the fall fair**, about **two weeks into** them trying
again. **Josh notices Tyson** across the field and **asks Luna whether she knew
he'd be there.** She didn't.

For **the past week Tyson has been putting space between himself and Luna** —
**not answering her calls or her texts.** When she goes over to speak to him he
says **he's been busy.**

She doesn't know what's wrong. She tells him **he can talk to her** — that
**they don't avoid each other**, that this is not a thing they have ever done —
and **asks him not to start.**

**That is when he pulls her aside**, out of the light, and says **he can't do
this here. It's complicated. He'll talk to her eventually.**

**He is lying about the last part**, more or less, and on some level she knows
it while he is saying it. He is not avoiding her because he is busy — he is
avoiding her because **distance is the only way he can keep hiding what he
feels**, which is the engine already described above.

**Luna is left with nothing to hold**, and reads the closing-out as something
she has done. The reader knows more than she does here, and that gap is the
point.

### The drive — the night she leaves the farm
*(Canon set by Melissa, 2026-08-02. Much later than the bar: Josh is back, and
this is where "it turns" turns.)*

**A very bad fight with Josh**, and Luna leaves the farm. She is driving to
Tyson, not because she has decided anything, but because **she needs him** and
there is nowhere else the need points.

**The whole ride is silent** — no dialogue, no music, no one to hear it. She is
**talking to herself**: reminding herself to breathe, trying to hold her
composure until she gets there, and **failing**. Anxiety takes the cab. She
**fidgets, her arms won't stay still**, tears come and stop and come again, her
**breathing breaks and so does her voice.** She does not get it back before she
arrives.

**She gets to Tyson and lets herself fall apart.** She has held it for the
entire drive and she puts it down the second she is in front of him. **He
holds her. He tells her to breathe. He tells her they are going to the
lakehouse** — a decision, not a question, because she is in no state to make
one.

Two lines carry it:

- **"I can't."** Said as she falls into him. She does not mean the drive or the
  night. She means she **cannot keep doing this with Josh.**
- **"He held me…"** — and she does not finish it.

#### What Josh did — NOT YET FIXED
> **Melissa is still deciding this. Do not treat the paragraph below as settled
> canon and do not write it into scene copy, synopses or public-facing text.**

The direction she is working toward: during the fight **Josh held Luna down,
forcefully, against her will — and would not let her up.** What frightens her
is not only the act but that **he has never done that before.** It is the point
where possessiveness stops being a mood and becomes something done to her body.

This is deliberately kept **off screen**. The truck scene shows the drive and
the collapse, never the fight, and "he held me…" is the only account anyone
gets. Whatever the fight finally becomes, it should stay off screen: the story
is what it does to her, and that is already in the take.

---

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
- **The fair:** Tyson is **pleasant** with her — which is what he is with
  people he doesn't know. Then, out of the light: **"Not here. It's
  complicated. I'll talk to you."** Three sentences that add up to nothing, and
  she says okay.
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
