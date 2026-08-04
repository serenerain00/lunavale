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

## Where it happens
*(Canon set by Melissa, 2026-08-03.)*

**Luna lives in Denver, Colorado** — the farm, the lakehouse, the bar, the
track and the roads between them are all Colorado. **Cathy is in Atlanta,
Georgia**, and the distance is a plot fact rather than colour: when Luna is in
trouble her mother is a phone call and a flight away, not a drive.

*(Mexico stays what it already was — a flashback to a trip, not a place anyone
lives.)*

### Who owns what
*(Canon set by Melissa, 2026-08-03. Load-bearing — it decides who leaves.)*

- **The farm is Josh's.** It is where he and Luna lived together for the ten
  years. Tyson does contract work on it; he has no stake in it.
- **The lakehouse is Luna's** — **her family's**, and **has been for a long
  time**. Her **retreat**, her home away from home, and the one place in this
  story that is hers outright.

**This is why the separation goes the way it does.** They were living on his
land, so when it ended **Luna is the one who left** — and she had somewhere of
her own to go. It is also why the lakehouse carries what it carries later:
every important thing that happens to her there happens on her own ground.

---

## The characters

**It is a three-hander.** *(Clarified by Melissa, 2026-08-03.)* The story is
**Luna, Josh and Tyson** — those three and no others. Everyone below them is
**tertiary**: they exist to explain one of the three, and the story does not
become theirs.

That includes **Rick**, despite the amount written about him here. It includes
**Cathy** and **Avery**, who have both since arrived, and **others still to
come**. Weight of detail in this document is not a measure of standing — Rick
has a long section because his dynamic with Josh needs explaining, not because
he is a fourth lead.

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

**What is underneath it** *(canon added 2026-08-03):* Josh is **charismatic in
public** and knows exactly **how to talk to people into doing what he wants** —
his father's trick, learned at home. But he is **the child in that dynamic**: a
man still trying to **fill Rick's shoes and please him**, and underneath the
command presence a **scared little boy**.

He **does not take no for an answer**, he **has no idea what to do with an
emotion**, and **his anger can turn violent**. Those three in one man is the
whole danger of him — and the reason Luna cannot separate the thrill from the
fear.

### Tyson — her best friend of twenty years
**Ex-military.** Friend of the family, **distant cousin of Josh**, and helps
Josh on the **farm** here and there (they're friends and co-workers). Into
**extreme sports** — snowboarding, motorcycles, track days — and owns a
**black 2020 Porsche Carrera** that's his baby (he'll ride a motorcycle
recklessly but won't take a hard corner with Luna in the passenger seat).

**Cousins, and it shows** *(2026-08-03).* Josh and Tyson are **distant
cousins — second or third, Melissa is deciding which** — and they are meant to
**share some features**, which is worth landing on screen rather than only in
the family tree.

**After the military** he came out with a **discipline that does not waver**,
and he makes his living **several different ways** rather than one — the
extreme sports are part of who he is, not a hobby he fits around a job. Where
Josh is a **farm-boy workaholic and a businessman**, Tyson is the one with no
boss and no performance to keep up.

**Settled 2026-08-03: Josh owns the farm; Tyson does not.** When Tyson came out
of the military, **Josh helped him get work there — contract work**, and it is
**only part of what Tyson earns.** He is not an employee and he is not a
partner; he is a retired man with several irons in the fire, one of which is
his cousin's farm. Which is exactly why he is around the place enough for any
of this to happen.

Over the six months Luna was without Josh, **Tyson and Luna grew closer than
ever** — he felt responsible for keeping her head above water while she
drowned in the end of her ten-year relationship. **Luna started developing
feelings for him** in that window, and so did he. **Neither will admit it.**

When Josh comes back, Tyson **starts putting distance** between himself and
Luna — because distance is the only way he can keep hiding that he's in love
with her.

### Cathy — Luna's mother
*(Canon set by Melissa, 2026-08-03. **Tertiary**, per the note above — the
first of the "others" that section anticipated.)*

**65.** Lives in **Atlanta, Georgia**, which matters more than a biographical
detail normally would: Luna is in **Colorado**, so Cathy is two thousand miles
from a daughter she is frightened for and can do nothing but phone. She is
**divorced**, and has **two daughters** — Luna, and **Avery**, ten years younger — see
her own section below. The family all know each other.

She is a **caring, loving, well-meaning mother**, and right now a **worried
one**. What she is picturing is Luna **alone at the lakehouse, in the dark, in
another state**, after the breakup.

She is also **pushy**, and Luna knows it. That is the entire dynamic and there
is **nothing dark in it** — **Luna had a good childhood.** It is only that a
call from her mother is a thing Luna has to **take a breath before answering**,
the way most daughters do. They love each other. Cathy means well.

**Cathy and Tyson.** She has known him **the whole twenty years** he and Luna
have been friends. She **made the two of them lunches as teenagers.** She was
**there for Luna when Tyson deployed.** She loves him **like a son** — with
Melissa's caveat attached: she knows perfectly well he is Luna's *best friend*,
and **it is going to get complicated**, given where Luna and Tyson end up.

**Cathy and Josh.** She has known him as long as Luna has, and closely across
**the ten years of the relationship.** What she does **not** have is what Luna
has — the quirks, the ins and outs, what he is like once the door is shut.

So **Cathy defends Josh.** He has been **calling her**, and she passes on that
**he doesn't sound like himself, that he's hurting.** She is being kind, and
she is not wrong about what she has heard. **Luna is bitter about it**, because
her mother is sympathising with the man who hurt her.

> **That asymmetry is the engine of every scene these two have.** Cathy is
> being a good mother with incomplete information; Luna is not ready to hand
> her the rest. Neither of them is behaving badly.

#### The phone call — a week into the separation
*CUT AND PUBLISHED 2026-08-03 as **"Long Distance"** (`luna-cathy-phone`),
1:32, free. Raw takes still sitting beside it in `stories/luna-mom-phone/`.
Luna's account of it is the journal entry **"my-mother-called"**.*

**A week in**, and that week was **Luna moving out** and dealing with her own
head. She has been **dodging her family** the whole time — which is why this
call is the one that finally connects, and why it opens the way it does.

It sits **beside "The day the last box went"** in the journal.

Cathy **has not been able to reach Luna for days.** When she finally gets
through, the first thing she says is a version of **"pick up the phone when I
call."**

Then she tells her **Josh has been calling her** — and that he doesn't sound
like himself, and that he's hurting. **Luna takes it badly**, because of what
he actually did.

Shot as an **intercut between two rooms**: Cathy somewhere warm and settled, a
lamp and a shelf of **framed family photographs** behind her; Luna at **the
lakehouse**, water through the glass, hair up, coffee on the counter. The two
rooms do a lot of the work — the distance is in the frame before anyone says
anything about it.

*That Luna is at the lakehouse is the point, not set dressing: she has been
there about a week, because it is where she went.*

### Avery — Luna's younger sister
*(Canon set by Melissa, 2026-08-04. **Tertiary.** She is the sister the Cathy
section had been holding a space for since 2026-08-03 — now named and cast.)*

**Ten years younger than Luna**, and still in **Atlanta**, where their mother
is. Luna is in Denver, so the sisters are as far apart as Luna and Cathy are.

They have **always had an open relationship** — nothing withheld, in either
direction — and **both of them have grown to miss the other.** The ten years
between them stopped mattering somewhere along the way, and neither has ever
said when.

**How she gets in when nobody else can.** Cathy told Avery she had spoken to
Luna, so Avery rings — and she is not calling to find out whether Luna is all
right. **She already knows she isn't.** That is the whole difference between
the two calls: their mother asks, and Avery doesn't have to.

#### The iPad call
*CUT AND PUBLISHED 2026-08-04 as **"Little Sister"** (`luna-avery-ipad`),
1:35, free. Luna's account of it is the journal entry **"avery-called"**.*

A night or two after Cathy's call. Luna is **in bed, writing in her journal**,
when the iPad lights up with Avery's name — so the call **interrupts an entry**,
which is the device the journal side is built on.

It is **the smile she needed** after a week of getting through this on her own.
She laughs properly, for the first time since the boxes.

**Where she is: her own place in Denver** *(settled 2026-08-04)* — a night
after the lakehouse week, not the lakehouse itself. Filed under the new
`apartment` place, which is the same room as "The Apartment" clip.

*The lights outside the window are deliberately unnamed in all the copy. They
read as a skyline; Melissa may play them as her porch. Nothing on the site
commits to either.*

### Rick — Josh's father
*(Canon set by Melissa, 2026-07-28. **Tertiary** — see the note at the top of
this section. He is here to explain Josh, not to carry anything himself.)*

**Think boss.** Dominance with charisma — the same combination Josh has, which
is the point: **their dynamic is most of the reason Josh is the way he is.**
Rick is where Josh learned that being magnetic and being in control are the
same act.

**He is a CEO**, in a similar line of business to Josh *(2026-08-03)*. The
register Melissa wants off him is **mob boss without being one** — a
**commanding, dominant presence that barely has to do anything to get its
way.** That is the thing Josh inherited and does a louder, less certain version
of.

**Rick owns a brewery** *(settled 2026-08-03)*. His, not an inherited one —
**there is no generation above Rick in this story** and the family tree does not
go back further. What runs in the line is **business ownership itself**, which
is the thing Josh is measuring himself against.

He is also **a big drinker — very fine liquor**, never anything cheap. A man
who owns a brewery and drinks something better than what he makes is worth
sitting with for a second.

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

**One month** after **Luna moved out**. She needs to get out of the house and
stop thinking about him, and **Tyson takes her somewhere loud** and spends the
night working to keep her happy.

> *Corrected 2026-08-03.* This read "after Josh moved out" from 2026-07-31
> until the property canon was settled. The farm is his and the lakehouse is
> hers, so **she** is the one who left — and "the house" she needs to get out
> of in the line above is therefore the lakehouse, not the farm.

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
