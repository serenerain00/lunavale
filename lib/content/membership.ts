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
 * │ Vault is confirmed at $8/month. Tier names and benefit lines are still   │
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
    tagline: "The world, open.",
    priceMonthlyCents: 0,
    blurb:
      "Walk into the farmhouse, watch the public scenes, read the story so far. No account, no card, no countdown. What is free today stays free.",
    cta: "Start exploring",
    commitment: "Free forever",
    available: true,
  },
  {
    id: "vault",
    name: "Vault",
    tagline: "The rooms that are locked.",
    priceMonthlyCents: 800,
    priceYearlyCents: 8000,
    blurb:
      "The full scene library, the mature cuts, the private journals, and the parts of each location a visitor can see but not open. New material lands every month.",
    cta: "Open the Vault",
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
      "Everything in the Vault, plus the production side: monthly breakdowns, the scripts and shot plans, and your name in the credits of what you helped fund.",
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
 * that has since been withdrawn must still be recognised, not silently
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
  group: "Watching" | "The world" | "Behind it";
}

/**
 * PLACEHOLDER benefit copy. Every line here is a promise the product has to
 * keep, so keep them specific and keep them true — the moment one of these is
 * aspirational rather than real, the whole page stops being trustworthy.
 */
export const BENEFITS: Benefit[] = [
  {
    id: "public-scenes",
    label: "Public scenes",
    detail: "The scenes released openly, in full, at full quality.",
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
    id: "full-library",
    label: "The full scene library",
    detail:
      "Every scene in the vault, including the ones that never go public.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "mature",
    label: "Mature cuts",
    detail:
      "The unedited versions of scenes that are trimmed for the public release.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "extended",
    label: "Extended and alternate edits",
    detail:
      "Longer cuts, different endings, and the takes that changed the scene.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "early",
    label: "Early access",
    detail: "New scenes land for members before they land anywhere else.",
    from: "vault",
    group: "Watching",
  },
  {
    id: "open-world",
    label: "Walk the locations",
    detail:
      "The farmhouse and every public location, explorable room by room.",
    from: "free",
    group: "The world",
  },
  {
    id: "locked-rooms",
    label: "Locked rooms",
    detail:
      "The doors that stay shut for visitors — and the objects inside them.",
    from: "vault",
    group: "The world",
  },
  {
    id: "journals",
    label: "Private journals",
    detail:
      "Luna's writing, in her own words, between the scenes you've watched.",
    from: "vault",
    group: "The world",
  },
  {
    id: "artifacts",
    label: "Character artifacts",
    detail:
      "Letters, photographs and objects that fill in what the scenes leave out.",
    from: "vault",
    group: "The world",
  },
  {
    id: "variants",
    label: "Member-only variants",
    detail:
      "Locations at other hours and in other weather, with their own moments.",
    from: "vault",
    group: "The world",
  },
  {
    id: "bts",
    label: "Selected behind the scenes",
    detail: "How a few of the public scenes came together.",
    from: "free",
    group: "Behind it",
  },
  {
    id: "commentary",
    label: "Creator commentary",
    detail: "Melissa talking through the choices, scene by scene.",
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
    detail: "The written material behind each scene, as it was actually shot.",
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

export const BENEFIT_GROUPS = ["Watching", "The world", "Behind it"] as const;

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
    q: "What happens to what I've unlocked if I leave?",
    a: "Locked material closes again when your membership ends, and everything public stays open to you exactly as before. If you come back later, your progress through the world is still there.",
  },
  {
    q: "Does the free part get worse over time?",
    a: "No. Public scenes stay public and the open locations stay open. Membership adds rooms; it never takes them away.",
  },
  {
    q: "How often does new material arrive?",
    a: "New scenes and world material land monthly. If a month is thin, the production breakdown will say so plainly rather than padding it out.",
  },
  {
    q: "Is the mature material separate?",
    a: "It is always labelled before you open it, and it is never the only way to follow the story. You can watch the whole arc without it.",
  },
  {
    q: "Where does the money go?",
    a: "Into making the next scenes — cast, locations, post, and the time to do it properly. Nothing here is funded by advertising or by selling anything about you.",
  },
];
