/**
 * A/B experiments — the registry, and the rules every test is held to.
 *
 * Plan and reasoning: docs/conversion/INSTAGRAM_FIRST_VISIT_AUDIT.md §4.
 *
 * AN EXPERIMENT IS INERT OUTSIDE ITS DATES. Nobody is assigned and nothing is
 * recorded before `startsOn` or after `endsOn` (UTC days), so the 14-day
 * baseline that ends 2026-10-25 is not disturbed by code that has already
 * shipped. To stop a test early, move `endsOn` to yesterday and deploy.
 *
 * THE DECISION RULE IS WRITTEN HERE, BEFORE THE DATA. At this traffic only a
 * large effect is detectable (the audit has the sample sizes), and the
 * temptation with small numbers is to stop on the first good-looking day.
 * The rule below is what /admin/conversion prints next to the results, so
 * the verdict is read against what was decided in advance.
 *
 * NO IDENTITY. Assignment is a first-party cookie holding only experiment ids
 * and variant names (lv_ab). Events are counted, not logged: each one is sent
 * at most once per browser per experiment (the client remembers it sent it),
 * so a count approximates "visitors who did X" without anything server-side
 * that could tell one visitor from another. Checkouts carry the variant in
 * Stripe metadata (ab_<id>), alongside the attribution labels.
 */

export interface Experiment {
  id: string;
  /** The first is the control: today's behaviour, unchanged. */
  variants: readonly string[];
  /** Inclusive UTC days. */
  startsOn: string;
  endsOn: string;
  /** Events the client may report. The first is exposure (the denominator). */
  events: readonly string[];
  question: string;
  /** The proxy event that decides it. */
  decidesOn: string;
  decisionRule: string;
}

export const EXPERIMENTS: Record<string, Experiment> = {
  /*
   * THE NEWCOMER FIRST SCREEN — Melissa, 2026-10-18 ("ok do all of the
   * above", on the Facebook conversion audit). The Facebook launch put ~480
   * sessions a day on the home page, and the first phone screen was a random
   * pick from five MEMBERS-ONLY scenes: a scene title, a "Members" badge, a
   * padlocked Play, no series name, nothing free, no price (first price was
   * ~2.5 screens down; Facebook visitors scroll ~30% of the page).
   *
   * `series` keeps the same footage behind it and replaces only the words and
   * buttons over it: the series, how many episodes are out, Watch the trailer
   * (free), Join · $8/month to /membership (not straight to Stripe — Melissa
   * wants people to see the details first), and "start with
   * the pilot". Members never see it. Mechanics: components/home/FirstScreen.tsx.
   *
   * INSIDE THE OCT 11-25 BASELINE, by Melissa's decision — see BREAKS.
   */
  "first-screen": {
    id: "first-screen",
    variants: ["control", "series"],
    startsOn: "2026-10-18",
    endsOn: "2026-11-01",
    events: ["exposed", "trailer_play", "pilot_play", "join_click", "membership_view"],
    question:
      "For a non-member landing on the home page, does a first screen that names the series, says what is free and shows the price turn more visitors into paying members than today's random members-only scene?",
    decidesOn: "paid",
    decisionRule:
      "Exposed = a non-member saw the home page's first screen. Decided on confirmed payments (Stripe, ab_first-screen) per exposed visitor, by Nov 1 or 40 payments in the test, whichever is later. Ship `series` if its paid rate is at least 1.5x control's and play starts per exposed visitor did not fall by more than 10%. If it is at or below control, drop it. Anything in between is 'no large effect': Melissa decides. Checkouts opened and trailer plays are supporting evidence, never the verdict.",
  },
  "preview-card": {
    id: "preview-card",
    variants: ["control", "card"],
    startsOn: "2026-10-26",
    endsOn: "2026-11-15",
    events: ["exposed", "cta_click", "dismiss", "membership_view"],
    question:
      "When a free preview ends, does a card over the last frame (\"That was the first minute of 18:36…\") send more people to /membership than today's panel below the player?",
    decidesOn: "membership_view",
    decisionRule:
      "Exposed = a non-member reached the end of a preview. Ship the card if, by Nov 15 with at least 120 exposed per arm, its exposed → /membership rate is at least double control's. If the card is at or below control, drop it. Anything in between is 'no large effect': Melissa decides, and the card ships only if paid checkouts did not fall.",
  },
};

export const AB_COOKIE = "lv_ab";
export const AB_COOKIE_DAYS = 90;

export function utcDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function experimentLive(e: Experiment, today: string = utcDay()): boolean {
  // LOCAL TESTING ONLY: `NEXT_PUBLIC_AB_FORCE=<id> next dev` runs a test
  // before its dates. Ignored in any production build, so a forgotten env var
  // can never start a test early on the live site.
  if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_AB_FORCE === e.id) return true;
  return today >= e.startsOn && today <= e.endsOn;
}

/** {experiment id: variant}, keeping only known experiments and variants. */
export function parseAssignments(raw: string | undefined | null): Record<string, string> {
  if (!raw) return {};
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    if (!v || typeof v !== "object") return {};
    const out: Record<string, string> = {};
    for (const [id, variant] of Object.entries(v)) {
      const e = EXPERIMENTS[id];
      if (e && typeof variant === "string" && e.variants.includes(variant)) out[id] = variant;
    }
    return out;
  } catch {
    return {};
  }
}

export function serializeAssignments(a: Record<string, string>): string {
  return encodeURIComponent(JSON.stringify(a));
}

/**
 * For Stripe metadata: ab_<id> = variant, for experiments live today only —
 * a variant assigned during a test that has since ended says nothing about
 * this checkout.
 */
export function abMetadata(raw: string | undefined | null, today: string = utcDay()): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, variant] of Object.entries(parseAssignments(raw))) {
    if (experimentLive(EXPERIMENTS[id], today)) out[`ab_${id}`] = variant;
  }
  return out;
}
