/**
 * Membership — the tiers, the prices, and the promise attached to each one.
 *
 * Content DATA only: no React, no request state, no billing calls. The pitch
 * page, the account page and every lock screen read from here, so what a
 * member is promised in the sales copy and what the product actually unlocks
 * can never drift apart.
 *
 * Derived from docs/monetization/MONETIZATION.md. That document's ethical
 * rules are load-bearing here, not decoration:
 *   - no fake scarcity: nothing in this file expires, counts down, or is
 *     "limited to N members"
 *   - no shame-based messaging: the free tier is described as a real offer,
 *     because it is
 *   - clear cancellation: `TIERS[n].commitment` is shown wherever price is
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ The LunaVerse tier is confirmed at $8/month. Its `id` stays "vault" —     │
 * │ that string is in URLs, cookies, entitlement checks and                   │
 * │ STRIPE_PRICE_VAULT, so the NAME changed and the id deliberately did not.  │
 * │ placeholder pending sign-off. `id` values are load-bearing (they appear  │
 * │ in URLs, cookies and entitlement checks) — change copy freely, change    │
 * │ ids deliberately.                                                        │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

export type TierId = "free" | "vault" | "patron";

/** Tiers in ascending order of access. Index doubles as the access rank. */
export const TIER_ORDER: TierId[] = ["free", "vault", "patron"];

export interface Tier {
  id: TierId;
  name: string;
  /** One line under the name — what this tier is *for*. */
  tagline: string;
  /** Monthly price in whole US cents. 0 means free. PLACEHOLDER. */
  priceMonthlyCents: number;
  /**
   * Annual price in cents, when paying up front is offered. PLACEHOLDER.
   * Omitted for free.
   */
  priceYearlyCents?: number;
  /** Short paragraph on the pitch page. */
  blurb: string;
  /** Label on this tier's button. */
  cta: string;
  /** What the visitor is committing to, shown next to every price. */
  commitment: string;
  /** The one tier presented as the default choice. Exactly one should be true. */
  featured?: boolean;
  /**
   * Whether this tier is currently on sale. A tier that exists but isn't
   * offered stays defined here rather than being deleted, so that (a) anyone
   * already holding it keeps resolving correctly, and (b) bringing it back is
   * flipping one flag instead of rewriting its copy from memory.
   */
  available: boolean;
}

/** Every tier that exists, offered or not. Use `TIERS` for anything visitor-facing. */
const ALL_TIERS: Tier[] = [
  {
    id: "free",
    name: "Visitor",
    // WAS "The world, open." / "Walk into the farmhouse, watch the public
    // scenes...". The world is off the site until it is finished
    // (WORLD_ENABLED in lib/content/world.ts), so the free tier stopped being
    // able to deliver the first thing it promised. Restore both lines when the
    // rooms come back.
    tagline: "The story, open.",
    priceMonthlyCents: 0,
    blurb:
      "Watch the trailer, read some of Luna's journal, and meet everyone in it. No account, no card, no countdown. What is free today stays free.",
    cta: "Start exploring",
    commitment: "Free forever",
    available: true,
  },
  {
    id: "vault",
    name: "LunaVerse",
    // The tagline is the first thing under the name, and it has to say two
    // things at once: that LunaVerse IS the membership, and what the membership
    // actually contains. "The rooms that are locked" said neither — it named a
    // world that is off the site (WORLD_ENABLED), and the blurb under it sold
    // "the parts of each location a visitor can see but not open", which is a
    // description of something nobody can currently buy. Both now describe the
    // real product: previews are the free edge, membership is past it. Restore
    // the room language with the world, not before.
    tagline: "The membership. Everything behind the previews.",
    priceMonthlyCents: 800,
    priceYearlyCents: 8000,
    blurb:
      "Every clip at full length, the mature cuts, the private journal entries, and the galleries. Season one lands here first. New material every month.",
    cta: "Join the LunaVerse",
    commitment: "Monthly · cancel any time",
    featured: true,
    available: true,
  },
  {
    id: "patron",
    name: "Patron",
    tagline: "How it gets made.",
    priceMonthlyCents: 2000,
    priceYearlyCents: 20000,
    blurb:
      "Everything in the LunaVerse, plus the production side: monthly breakdowns, the scripts and shot plans, and your name in the credits of what you helped fund.",
    cta: "Become a Patron",
    commitment: "Monthly · cancel any time",
    // Not on sale yet — the production-side material has to exist before it
    // can be promised. Flip to true when it does.
    available: false,
  },
];

/** The tiers actually offered. Everything visitor-facing reads this. */
export const TIERS: Tier[] = ALL_TIERS.filter((t) => t.available);

/**
 * Resolves against ALL tiers, including retired ones: a member holding a tier
 * that has since been withdrawn must still be recognized, not silently
 * downgraded to a visitor.
 */
export function getTier(id: string): Tier | undefined {
  return ALL_TIERS.find((t) => t.id === id);
}

/** True when `held` grants at least the access of `required`. */
export function tierCovers(held: TierId, required: TierId): boolean {
  return TIER_ORDER.indexOf(held) >= TIER_ORDER.indexOf(required);
}

/** "$8" / "$8.50" / "Free" — trailing zero cents dropped, as prices read better. */
export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  const dollars = cents / 100;
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

/** Months of a yearly plan you effectively don't pay for. 0 when there's no discount. */
export function monthsSavedYearly(tier: Tier): number {
  if (!tier.priceYearlyCents || tier.priceMonthlyCents === 0) return 0;
  const full = tier.priceMonthlyCents * 12;
  return Math.round((full - tier.priceYearlyCents) / tier.priceMonthlyCents);
}

/* ---------------------------------------------------------------- benefits */

export interface Benefit {
  id: string;
  /** Short row label in the comparison table. */
  label: string;
  /** One concrete sentence. Concrete beats aspirational — it builds trust. */
  detail: string;
  /** The lowest tier that includes it. */
  from: TierId;
  /**
   * Group heading in the comparison table. Grouping keeps the table scannable
   * instead of turning into a wall of twenty undifferentiated ticks.
   */
  group: "Watching" | "Behind it";
}

/**
 * PLACEHOLDER benefit copy. Every line here is a promise the product has to
 * keep, so keep them specific and keep them true — the moment one of these is
 * aspirational rather than real, the whole page stops being trustworthy.
 */
export const BENEFITS: Benefit[] = [
  {
    id: "public-scenes",
    label: "Open clips",
    detail: "The ones released openly, in full, at full quality.",
    from: "free",
    group: "Watching",
  },
  {
    id: "trailer",
    label: "Trailers and story overview",
    detail: "Where the story stands, who everyone is, and what happens next.",
    from: "free",
    group: "Watching",
  },
  {
    // FIRST OF THE PAID BENEFITS, Melissa 2026-09-03: "for $8 a month theyll
    // get exclusive access to Between Us episodes dropping soon. that should
    // be the first benefit." Array order is what TierCard renders, so being
    // first here is what puts it at the top of the card.
    //
    // IT IS THE ONE FORWARD-LOOKING LINE IN THIS FILE, and that is worth
    // flagging rather than burying. The rule at the top of BENEFITS is that
    // every row is a promise the product already keeps — "the moment one of
    // these is aspirational rather than real, the whole page stops being
    // trustworthy". This one is about something that does not exist yet.
    //
    // So the copy is written so it cannot be misread as available now: it says
    // the series is coming and that members get it when it lands, not that
    // there is anything to watch today. That is a real and keepable promise.
    // What it must not become is a row that quietly reads as current — if
    // Between Us slips, this line is the first thing to revisit, and the
    // honest move then is to change the wording rather than leave it standing.
    id: "between-us",
    label: "Between Us episodes",
    detail:
      "The episode series, coming soon — and members-only when it lands.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "full-library",
    label: "The full clip library",
    // NO NUMBER, Melissa 2026-09-03 ("remove the counts").
    //
    // It said "Twelve scenes that never go public", which was true when it was
    // written on 2026-07-29 and had quietly stopped being true: there are 24
    // members-only scenes now, so the line was underselling the library by
    // half. That is the failure mode of a hand-typed count — it does not
    // announce itself, it just drifts, and on a page asking for money a stale
    // number is worse than no number whether it is too high or too low.
    //
    // The counted version of this argument still exists and is safe, because
    // it is DERIVED: the "depth" section on the home page reads its figures
    // straight out of the content modules, so it cannot drift. If a number
    // belongs anywhere it is there, not typed into a sentence here.
    detail:
      "The clips that never go public, including the whole of The Beach.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "mature",
    label: "Mature cuts",
    detail:
      "Every intimate clip in the story. The public side keeps the quiet ones.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "extended",
    label: "Full-length clips",
    // Was "Extended and alternate edits", which promised plural alternates
    // against exactly one. This says the true and better thing: the clips are
    // teasers and the scenes they come from run minutes, not seconds.
    detail:
      "The posts are previews. Members get the clips they were cut from, in full.",
    from: "vault",
    group: "Watching",
  },
  // "Early access" was here — "scenes land for members first". Pulled
  // 2026-07-29: there is no release-scheduling mechanism anywhere in the
  // codebase, so there was no sense in which anything landed for members
  // first. Put it back when a scene can actually hold a members-only window.
  // "Walk the locations" was here — the farmhouse and every public location,
  // explorable room by room, offered free. Pulled 2026-08-13 on Melissa's
  // instruction: the free tier is being narrowed to what she actually promotes
  // on Instagram, which is trailers and the story overview.
  //
  // DELETED rather than moved to `vault`, and the distinction matters. The
  // world is still genuinely walkable by anyone — lib/content/world.ts is full
  // of `access: "free"` objects and nothing in WorldExperience gates the tour —
  // so a LunaVerse row saying "walk the locations" would be charging for
  // something a visitor already gets. Stopping the advertisement is honest;
  // claiming it is locked when it is not would be the same lie this table has
  // had to remove three times already, only pointed the other way.
  //
  // The members-only half of the world is already covered by "Locked rooms"
  // below, which is true and stays.
  // "Locked rooms" was here — "the doors that stay shut for visitors, and the
  // objects inside them". Pulled 2026-09-15 when the world came off the site
  // to be finished (WORLD_ENABLED). Selling a door nobody can reach is the
  // same lie this table has already had to remove three times, and the note
  // twenty lines up says so about a smaller version of it. Restore it with the
  // rooms.
  {
    id: "journals",
    label: "Private journals",
    detail:
      "Luna's writing, in her own words, between the clips you've watched.",
    from: "vault",
    // Was "The world". The journal is its own route and never needed the
    // rooms, so it moves rather than going with them.
    group: "Watching",
  },
  {
    id: "artifacts",
    label: "Character artifacts",
    detail:
      "Letters, photographs and stills that fill in what the clips leave out.",
    from: "vault",
    // Was "The world", and "objects" meant objects in rooms. The galleries
    // deliver this on their own, so it moves and the word changes with it.
    group: "Watching",
  },
  // "Member-only variants" was here — "locations at other hours and in other
  // weather, with their own moments". Pulled 2026-07-28. There is no weather
  // system and no variant content, and the nearest thing that does exist —
  // the day/night toggle in components/world/WorldExperience.tsx — is free to
  // everyone, so it could not honestly be rewritten as a LunaVerse benefit either.
  // Put it back when locations genuinely have gated states of their own.
  // The free "Overheard — read the wall, and leave three posts on it" row was
  // here. Pulled 2026-08-03, when the room went members-only: reading it and
  // writing in it are the same door now, so there is no free half of it left
  // to advertise. A benefits table that still offered it would be promising
  // something the product refuses at the page.
  {
    /*
     * BACK 2026-09-17, WITH THE WALL. This row came out on 2026-08-10 when
     * Overheard was archived, under the rule that still holds: a benefits list
     * is a contract, and a row for a room nobody can enter is a lie you are
     * charging for. The room is open again (OVERHEARD_ARCHIVED is false), so
     * the row is honest again.
     *
     * THE COPY LEADS WITH THE CAST THREAD, NOT WITH "CHAT WITH OTHER MEMBERS",
     * and that is deliberate rather than coy. There are ten members and zero
     * posts in the table; a row promising a lively room would be the same
     * mistake in a new coat. What is certainly there is Luna, Tyson, Josh and
     * Rick talking to each other, which is authored and does not depend on
     * anybody turning up. The part that needs other people is named second and
     * named plainly.
     */
    id: "overheard",
    label: "The group chat",
    detail:
      "Luna, Tyson, Josh and Rick, talking to each other the way they actually do — and a room where you can say something back.",
    from: "vault",
    group: "Behind it",
  },
  // "Selected behind the scenes" was here — "How a few of the public scenes
  // came together", free. Pulled 2026-08-13 with the same instruction, and it
  // should have gone sooner on its own merits: grep the codebase for this
  // benefit's id and the ONLY hit was this row. There is no behind-the-scenes
  // content anywhere in the product, free or otherwise. It was promising
  // something that has never existed.
  //
  // "Between Takes" below is the real behind-it offer, and it is members-only.
  {
    // Replaces the "Creator commentary" line, which promised Melissa talking
    // through the choices scene by scene. That does not exist and was never
    // made. This is what is actually on the site today: 38 notes in
    // lib/content/between-takes.ts, 13 of them open so a visitor can see the
    // register before paying, the rest members-only. They now have a book of
    // their own at /between-takes as well as sitting on the character pages.
    id: "between-takes",
    label: "Between Takes",
    detail:
      "The notebook that lives on the table at the edge of set — why a beat was played that way, and the notes the three of them leave each other. Still being written.",
    from: "vault",
    group: "Behind it",
  },
  {
    id: "stills",
    label: "Unreleased stills",
    detail: "The frames that didn't make the cut, at full resolution.",
    from: "vault",
    group: "Behind it",
  },
  {
    id: "breakdowns",
    label: "Monthly production breakdown",
    detail: "What got made this month, what it cost, and what's next.",
    from: "patron",
    group: "Behind it",
  },
  {
    id: "scripts",
    label: "Scripts and shot plans",
    detail: "The written material behind each clip, as it was actually shot.",
    from: "patron",
    group: "Behind it",
  },
  {
    id: "credits",
    label: "Supporter credit",
    detail: "Your name in the credits of the work you helped fund.",
    from: "patron",
    group: "Behind it",
  },
  {
    id: "qa",
    label: "Creator Q&A",
    detail: "A monthly thread where Melissa answers what patrons ask.",
    from: "patron",
    group: "Behind it",
  },
];

// "The world" was the middle group and is gone with the rooms (2026-09-15,
// WORLD_ENABLED). Its three rows either moved to Watching — the journal and
// the galleries never needed the world — or were pulled outright, in the case
// of "Locked rooms". Leaving the heading in would have rendered an empty
// column on the comparison table. Put it back with the rooms.
export const BENEFIT_GROUPS = ["Watching", "Behind it"] as const;

/**
 * Benefits belonging to a tier that is currently on sale. The comparison table
 * shows these — listing a benefit whose only tier can't be bought would be
 * advertising something that isn't for sale.
 */
export const OFFERED_BENEFITS = BENEFITS.filter((b) =>
  TIERS.some((t) => t.id === b.from),
);

export function benefitsFor(tier: TierId): Benefit[] {
  return BENEFITS.filter((b) => tierCovers(tier, b.from));
}

/** The benefits a tier adds over the one below it — the actual upgrade pitch. */
export function benefitsAddedBy(tier: TierId): Benefit[] {
  return BENEFITS.filter((b) => b.from === tier);
}

/* --------------------------------------------------------------- questions */

export interface Question {
  q: string;
  a: string;
}

/**
 * The questions someone actually asks before entering a card number. Answering
 * the uncomfortable ones plainly — cancellation, billing, what happens to
 * access afterwards — converts better than another list of features, and it is
 * the honest thing to do besides.
 */
export const QUESTIONS: Question[] = [
  {
    q: "Can I cancel whenever I want?",
    a: "Yes, from your account page, in one click, with no email or chat in the way. You keep access until the end of the period you already paid for, and you are not charged again.",
  },
  {
    // THIS ANSWER USED TO PROMISE SOMETHING THAT DOES NOT EXIST: "your progress
    // through the world is still there". There is no progress tracking in this
    // app — nothing records what anybody has watched — and the world it refers
    // to is off the site. It was a promise made on a cancellation screen, which
    // is the worst possible place to be caught in one. Say only what is true:
    // access is a switch, and the switch goes back on.
    q: "What happens to what I've unlocked if I leave?",
    a: "Locked material closes again when your membership ends, and everything public stays open to you exactly as before. Nothing you watched is deleted \u2014 if you come back later, the whole library opens again the moment you do.",
  },
  {
    q: "Does the free part get worse over time?",
    a: "No. What is open stays open, and the previews stay where they are. Membership adds material; it never takes any away.",
  },
  {
    q: "How often does new material arrive?",
    a: "New clips and journal pages land every month, and season one arrives here first. If a month is thin, the production breakdown will say so plainly rather than padding it out.",
  },
  {
    q: "Is the mature material separate?",
    a: "It is always labeled before you open it, and it is never the only way to follow the story. You can watch the whole arc without it.",
  },
  {
    q: "Where does the money go?",
    a: "Into making the next ones — cast, locations, post, and the time to do it properly. Nothing here is funded by advertising or by selling anything about you.",
  },
];
