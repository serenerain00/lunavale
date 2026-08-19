# Luna Vale — Project & Story Context

A single-file briefing to re-load context (for ChatGPT or any assistant that
has lost the thread). Everything here is **canon as set by Melissa Casole**,
the creator. The written journal entries and scene copy in the app are *drafts
written to this canon* — the canon below is what's authoritative.

---

## What the product is

**Luna Vale** (live at **lunavale38.com**) — a premium, explorable cinematic
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
track and the roads between them are all Colorado. **Cathy and Avery are in
Atlanta, Georgia**, and the distance is a plot fact rather than colour: when
Luna is in trouble her family is a phone call and a flight away, not a drive.

### How everyone ended up in Colorado
*(Canon set by Melissa, 2026-08-05. This is the origin of the whole
arrangement and the document did not have it.)*

**Luna is from Atlanta.** So are **Cathy**, **Avery** and **Tyson** — the
family and the best friend all come from the same place.

**Josh is from Denver**, and his father **Rick lives there too.** He met Luna
**in Atlanta, on business.** They **dated long distance**, and then —
**ten years ago — Luna moved to Colorado** to live with him on his farm.

**Tyson followed, but not for her.** He came out of the SEALs and moved from
Atlanta to Denver wanting **a change of pace**. That Luna was already moving
there was a bonus rather than a reason, and **Josh — his distant cousin — had
work for him on the farm**, which made it practical.

> So the geography is not a coincidence, and it is not a love triangle
> engineered by proximity either. **Everyone Luna is from moved to where Josh
> is.** She is the one who left home; the two men were already related, and one
> of them followed later for his own reasons. It explains why Tyson is on that
> farm every day, and why Luna's mother and sister are two thousand miles from
> everything that happens to her.

*(Mexico is a trip, not a place anyone lives — seven days during the
reconciliation. See "Mexico — seven days" below.)*

### Who owns what
*(Canon set by Melissa, 2026-08-03. Load-bearing — it decides who leaves.)*

- **The farm is Josh's.** It is where he and Luna lived together for the ten
  years. Tyson does contract work on it; he has no stake in it.
- **The lakehouse is Luna's** — her **retreat**, and the one place in this
  story that is hers outright.

> **CONFLICT, NEEDS ONE WORD FROM MELISSA.** On 2026-08-03 this was set down
> as **her family's, for a long time** — inherited, the place she grew up going
> to. On 2026-08-05 it was described as something **Luna bought when she and
> Josh broke up.**
>
> Both work; they are different stories. **Inherited** makes it the place she
> retreats *back* to, older than Josh, with her mother and sister in it.
> **Bought** makes it the first thing she chose entirely for herself, at
> thirty-eight, with her own money, the week her ten years ended — which given
> she is trying to work out whether any of her life was chosen on purpose is
> arguably the stronger version.
>
> Nothing on the site states either, so nothing is wrong right now. It matters
> the moment a journal entry or a scene says how long she has been going there.
> Left unresolved rather than picked.

**This is why the separation goes the way it does.** They were living on his
land, so when it ended **Luna is the one who left** — and she had somewhere of
her own to go. It is also why the lakehouse carries what it carries later:
every important thing that happens to her there happens on her own ground.

---

## The characters

**The family name is VALE** *(2026-08-05)* — Luna Vale, Cathy Vale, Avery
Vale. It is already on screen in the title card and in the domain; it had
never been written down here.

**It is a three-hander.** *(Clarified by Melissa, 2026-08-03.)* The story is
**Luna, Josh and Tyson** — those three and no others. Everyone below them is
**tertiary**: they exist to explain one of the three, and the story does not
become theirs.

That includes **Rick**, despite the amount written about him here. It includes
**Cathy** and **Avery**, who have both since arrived, and **others still to
come**. Weight of detail in this document is not a measure of standing — Rick
has a long section because his dynamic with Josh needs explaining, not because
he is a fourth lead.

### Luna Vale — the protagonist
**38** (ten years older than Avery, same age as Tyson). **She models — that is
her income** *(2026-08-05)*, and it is the only thing in the story that is
entirely her own: not Josh's farm, not a job he found her, and it travels.

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
**38** *(2026-08-04)*. **Navy SEAL for ten years** — "ex-military" everywhere
above means this specifically. Friend of the family, **distant cousin of
Josh**, and helps Josh on the **farm** here and there (they're friends and
co-workers). Into
**extreme sports** — snowboarding, motorcycles, track days — and owns a
**black 2020 Porsche Carrera** that's his baby (he'll ride a motorcycle
recklessly but won't take a hard corner with Luna in the passenger seat).

**He is from Atlanta too** *(2026-08-05)* — same city as Luna, Cathy and
Avery. He has known the family for twenty years, **thinks of Avery as a little
sister**, and is **protective of the whole Vale family**, not only Luna. He
came and went for a decade while he was serving; some of that was deployment.

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

### Cole Burnett — Tyson's oldest friend
*(Canon set by Melissa, 2026-08-04. **Tertiary**, but load-bearing: he is the
only person Tyson can say any of this to.)*

**40**, two years older than Tyson, and **local to Denver**. They were **Navy
SEALs together for ten years** — Cole was **two years ahead of him at the
academy** and already in when Tyson arrived — and they have kept in touch ever
since.

He is **Tyson's closest friend after Luna**, and specifically **the person
Tyson goes to when the thing he needs to say is about Luna.** That is the
function: Luna is the one he talks to about everything, so the one subject he
cannot raise with her needs somewhere else to go.

**He knows all of them.** He knows **Luna** — they have met several times,
birthday parties and barbecues, and she knows who he is. He knows **Josh**, and
he knows **how close Josh and Tyson are** — that they are family. So when he
gives Tyson advice he is not weighing an abstraction; he knows every person it
would cost.

**Crucially, he knows about the promise** (below). He is the only one who does.

**HE OWNS THE BAR** *(confirmed 2026-08-04)*. His surname is **Burnett**, and
**Burnett's Billiards & Bar** is his — the sign is legible on screen and he is
behind the counter working it.

That is a better fact than it first looks. It means Tyson is not meeting Cole
somewhere neutral; he is going **to Cole's place**, where Cole is working and
cannot leave, and where the conversation happens across a bar with other people
in the room. It is the least private way to say the most private thing, which
is exactly why Tyson can manage to say it at all.

**It is NOT the bar Tyson takes Luna dancing to** — different room, pool
tables, different dressing. Two distinct bars, and they now have distinct
places in the taxonomy (`burnetts` and `bar`).

> *Loose thread, not a problem:* Tyson took Luna dancing somewhere else rather
> than to his oldest friend's bar. That may be nothing, or it may be that he
> was avoiding the one room where Cole would have watched him with her.

*Melissa is writing Luna's journal entry about Cole and Tyson's friendship
herself — it is hers, not to be drafted.*

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

### Avery Vale — Luna's younger sister
*(Canon set by Melissa, 2026-08-04, expanded 2026-08-05. **Tertiary.**)*

**28**, ten years younger than Luna, and still in **Atlanta** where their
mother is.

**They have been close her entire life.** Luna **always wanted a baby sister**,
and before she left for Colorado she was **Avery's go-to for everything** —
less big sister than best friend. Avery **looks up to her**, and the two of
them are **alike in a lot of ways, including how they look.**

They have **always had an open relationship** — nothing withheld, in either
direction — and **both of them miss the other.**

**But she does not call often.** Usually only when there is **a family matter**,
or when **Cathy has nagged her into it.** That is not distance; it is a
28-year-old with a job. And it cuts both ways — **Luna is not good at relaying
things over the phone anyway**, which is exactly why the call in "Little
Sister" works and the one with their mother does not.

**She has known Tyson almost her whole life** — the same twenty years — and
**thinks of him as a big brother.**

#### Her work — SETTLED 2026-08-05
**A third-year psychiatry resident (PGY-3) in Atlanta.** Confirmed by Melissa
after checking what 28 realistically allows: four years of undergraduate, four
of medical school finishing around 26, then a four-year residency — so a fully
licensed attending psychiatrist is 30 or 31 at the earliest, and at 28 she is
**about two years off qualifying.**

**This earns its keep rather than merely being accurate.** A resident works
punishing hours on rotating call, which is a far better reason for not phoning
her sister than indifference — and it means that when she *does* ring, she has
made room for it.

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

#### Rick and Cathy have spoken — OFF-SCREEN, referenced only
*(Established by the dialogue in `josh-rick-lake`; confirmed by Melissa
2026-08-10: "I never had a video about rick speaking with cathy, he just
mentions it to josh".)*

At the lake Rick tells Josh: **I talked to Cathy. She said Luna's been staying
out at the lakehouse.** Josh's answer is that Tyson said the same.

**There is no scene of that call and there is not meant to be.** It happens
between two people the story never puts in a room together, and it reaches the
audience the way it reaches Josh — secondhand, from a man who already knew.

**Why it matters:** it means the two families are talking, and that Luna's own
mother is the one telling Josh's father where she is sleeping. Cathy is not
betraying her — she has known Josh ten years and never once from inside the
room (see her section above), so to her this is family keeping track of family.
It is the same mechanism as the phone call: Cathy is kind to whoever is in
front of her, with the only information anybody gives her.

It also puts Rick a step ahead of his son in a scene where Josh has come
looking for help, which is the joke of that scene and the reason it lands.

### Luna's panic attacks
*(Canon set by Melissa, 2026-08-19.)*

**Luna is prone to panic attacks.** This is not an event that happens to her
once; it is a standing fact about her, and it predates both men.

**Both of them know.**

- **Tyson has known for twenty years** — since she was about twenty-three. It
  has never needed to be a conversation. He does not ask whether she is all
  right, because he can see whether she is all right.
- **Josh has known for ten.** He is not blind and she is not as good at hiding
  it as she tells herself.

**The asymmetry is the story, not the secrecy.** She does not call Josh. She
never has. It is not that he would refuse to come — somewhere very early she
decided this was a thing she did not hand him, and she cannot remember
deciding it. When she calls anyone, she calls Tyson.

Anything written about this must NOT play it as a secret she is keeping from
everybody. That version was written once, in `the-bad-one`, and corrected —
see the note above that entry in `lib/content/journal.ts`. The material to
mine is who she reaches for, and what it costs the man who is never reached
for.

Depicted in `luna-truck-breakdown` ("Breathe") and written in `the-bad-one`,
`the-six-months` and `on-paper`.

---

### Mexico — seven days
*(Canon set by Melissa, 2026-07-29. **MOVED IN TIME by Melissa, 2026-08-17** —
see the correction below, which changes what this material is for.)*

Josh took Luna to **Mexico** for **seven days**. He booked it himself.

**It happens AFTER they get back together.** It was originally five years into
the ten, a flashback sitting before everything else; it is now a trip he takes
her on during the reconciliation, having spent the six months apart missing her
and working some things out about himself.

The trip was **good** — properly good. Whatever they had been carrying, they
put down at the airport and neither of them picked it back up while they were
there. They got close again. It was romantic. **He treated her the way she
wanted to be treated**, which is to say the way he had at the start, and it
**reminded her exactly why she fell in love with him.**

**What Luna responds to in Josh is his passion**, and Mexico is where she gets
all of it at once: how he touches her, how he kisses her, how he talks to her
and then actually listens. **He is enormously attentive to her body** and she
has never been with anyone so invested in her. It is the man she fell in love
with ten years ago, entire. She still cannot work out how that got lost — and
in Mexico she finds it again. She is **in love with this man**. At least this
version of him, which is the qualifier she puts on it herself.

#### What moving it changed
As a flashback, Mexico was the **evidence Luna had before she decided** — she
had seen this version of him once, so giving him another chance was not stupid,
and she was trying to get back to Mexico.

It cannot do that job any more, because she has already chosen him by the time
the plane lands. It does something sharper instead:

- It is the **proof arriving after the bet**, not before it.
- It is the **best week of her life happening inside the reconciliation** —
  which means the reconciliation genuinely worked, for a while, and she has it
  in her own handwriting.
- It **raises the fall**. She lands home from the top of the arc straight into
  him falling asleep in the chair before she has finished telling him about her
  day. Nothing she is later accused of imagining is imagined.

Anything written about Mexico must not describe it as a flashback, or say she
is "trying to get back to" it. She got there.

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

### THE PROMISE — why Tyson can't just say it
*(Canon set by Melissa, 2026-08-04. This is the mechanism the whole deadlock
runs on, and it was missing from this document until now.)*

**Josh asked Tyson to help him get Luna back, and Tyson said yes.**

It happened the way it would: Tyson does contract work on Josh's farm, so the
two of them are together constantly, and over those months **Josh talked about
her.** He wanted to try again. He was going to reach out. He asked for
**Tyson's support, his good word, and a nudge in the right direction** — from
the man who has been Luna's best friend for twenty years and whose opinion she
actually trusts.

**Tyson gave his word before he understood what he felt.** The promise came a
few months *ahead* of him working out that he was in love with her — so he did
not agree to it dishonestly, and he cannot get out of it honourably.

**THE TIMING IS EXACT AND IT MATTERS:**

- The separation runs **six months**.
- **Tyson starts falling for Luna about four months in** — i.e. roughly **two
  months before Josh calls her** for the coffee and the dinner.
- So by the time Josh actually makes his move, Tyson has been in love with her
  for two months **and is already committed to helping.**

> **This is why the deadlock is a trap rather than shyness.** Tyson is not
> staying quiet because he is scared. He is staying quiet because speaking
> would make him a man who took his cousin's wife-in-all-but-name after
> promising to help win her back — and Josh is family. The distance he puts
> between himself and Luna is the only way to keep a promise he no longer
> wants to have made.

**Only Cole knows.** Luna does not — which is why she reads the distance as
something she did.

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

### Tyson and Cole at the bar — asking the only person he can
*(Canon set by Melissa, 2026-08-04. Shot; awaiting a recut master — the first
export ran 1:44 with 63 seconds of black on the end. The scene itself is
**40 seconds**.)*

Tyson goes to Cole and **asks him what he would do.** It is the only place the
question can be asked, because the two people it is about are the two people he
cannot ask.

**Cole does not tell him what to do.** What he says is closer to: **you are
going to lose her if you keep avoiding her — and I know you made a promise.**
Then he leaves it there. He sympathises rather than advising, because he can
see there is no clean move, and saying so is the most honest thing available.

That refusal is the point of the scene. Nobody arrives at an answer. Tyson
came for permission and got understanding instead, which is worse.

### Casey at the bar — "I'll let you get back to your date"
*(Canon set by Melissa, 2026-08-09. CUT AND PUBLISHED as **"Your Date"**
(`luna-tyson-casey-bar`), 3:24, **members-only**, first minute open. Score not
yet made; the bar ambience is in the mix, the music is not.)*

**Casey is new.** A friend of Tyson's **from the track**. That is the whole of
what is established about her, and the scene works because it stays that thin —
Luna is not given enough to be wrong about, which is exactly her problem.

The night starts with **a fight with Josh**. Luna ends up at **the bar — theirs,
hers and Tyson's** — on her own, and she has been there a while before anything
happens. **She is already drunk when Tyson walks in**, and that is load-bearing:
everything she does next is her judgement with a few drinks on it.

Tyson is with Casey. Luna **jumps to a conclusion about who Casey is to him**.
Tyson tells her the truth — a friend from the track — and it does not land.

**Casey goes to get a drink**, and in that gap Luna and Tyson have the real
conversation. What actually offends her is not that Casey exists. It is that
**she had never heard of her.** Twenty years, and there is a person he sees at
the track that he never once mentioned.

Then **Tyson works out that she has been drinking**, and says so. **She takes
that badly** — worse than the Casey question, because it reframes everything she
has just said as something that can be dismissed.

It ends with her **finishing her drink** and: **"I'll let you get back to your
date."** She is not asking a question. She is handing him a version of the night
and leaving before he can correct it.

**Why it matters:** this is the first time Luna's jealousy is pointed at Tyson
rather than the other way round, and the first time she is the one behaving
badly in a room. She does not get to be the wronged party in this one, and the
scene does not offer her the excuse.

### The wall — Josh at the farmhouse
*(Canon set by Melissa, 2026-08-05. CUT AND PUBLISHED as **"The Way You Looked
at Him"** (`josh-luna-wall`), 6:07, **members-only**.)*

**Josh confronts Luna at the farmhouse.** He says **he saw her look at him** —
at Tyson — and he has decided what that look meant. He is **convinced she has
cheated.**

He **pins her against the wall** and kisses her, **aggressively**, and **takes
his time**. He **grabs her by the throat**, pushes her up against the wall,
holds her there. Six unbroken minutes, one continuous take, and **he never
raises his voice** — which is what makes it what it is.

**This is the scene that puts Josh past the point of return.** Everything
before it can be read as a difficult man; this cannot.

> **HOW IT IS PUBLISHED, and why it breaks the house pattern.** Members-only
> with **no free cut**. Every other scene with a premium version has a short
> public one selling it; that would be wrong twice here — a strangulation is
> not a shop window, and a pre-play disclaimer means little if a minute of what
> it describes is public two clicks away. It carries a **raised** content
> notice (`strangling`, `coercion`, `control`) that reads "Before you play
> this".

> **THIS IS THE FIGHT THE DRIVE IS RUNNING FROM** *(confirmed 2026-08-05)*.
> `luna-truck-breakdown` is the hour after this one: Luna leaves the farm and
> drives to Tyson, and **"he held me…"** — the three words she cannot finish in
> his arms — is this. The long-open "What Josh did" question is closed; see
> that section below.

*No journal entry — Melissa is holding that one.*

### The drive — the night she leaves the farm
*(Canon set by Melissa, 2026-08-02. Much later than the bar: Josh is back, and
this is where "it turns" turns.)*

**The fight is the wall** (`josh-luna-wall`, above — settled 2026-08-05), and
Luna leaves the farm. She is driving to
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

#### What Josh did — SETTLED 2026-08-05
**It is the wall.** The fight Luna is driving away from is
**"The Way You Looked at Him"** (`josh-luna-wall`) — Josh pinning her to the
farmhouse wall, hand on her throat, convinced she has looked at Tyson. See that
section above for the scene itself.

So **"he held me…"**, the three words she gets out in Tyson's arms and cannot
finish, is that. And what frightens her is not only the act but that **he has
never done that before** — possessiveness stopping being a mood and becoming
something done to her body.

> **This was written up for months as deliberately OFF SCREEN** — "the story is
> what it does to her, and that is already in the take." That reasoning is now
> obsolete and the note is kept only so nobody re-derives it: the fight is on
> screen, in full, for six minutes, behind the membership and behind a raised
> disclaimer. What stays true is that **Luna still never says it.** She stops
> three words in on screen and refuses the page in her journal, and both of
> those are character, not a canon gap.

**THE TWO SCENES ARE ONE NIGHT.** The wall is the event; the drive is the hour
after it. That is worth protecting in any recut or re-ordering — the drive's
entire weight comes from being the aftermath of something the audience has just
watched, or is about to.

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
