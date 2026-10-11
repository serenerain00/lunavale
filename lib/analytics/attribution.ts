/**
 * Where a visitor came from — carried, first-party, from the landing page to
 * the Stripe checkout, so a payment can be traced back to the post that
 * started it.
 *
 * TWO COOKIES, NO IDENTITY.
 *   lv_ft  first touch: the first outside source ever seen. Never overwritten.
 *          90 days.
 *   lv_lt  last touch: the most recent outside source. Overwritten whenever a
 *          visit arrives from somewhere (a tagged link, another site, the
 *          Instagram app); a direct or internal page view leaves it alone.
 *          30 days.
 * Each holds only campaign labels — source, medium, campaign, content, the
 * landing path and a date. No id, no email, nothing that tells one person
 * from another; two people who tapped the same Reel carry identical cookies.
 * They are first-party, are never sent to a third party except as checkout
 * metadata on our own Stripe account, and no other site can read them.
 *
 * At checkout, app/membership/start/route.ts copies both onto the Checkout
 * Session's metadata (see toStripeMetadata). That is the whole join: Stripe
 * already records who paid, and now each payment says which link it came
 * through. lib/billing/checkout-funnel.ts reads it back for /admin/conversion.
 *
 * TAGGING CONVENTION for links we publish (docs/analytics/ATTRIBUTION.md):
 *   utm_source=instagram&utm_medium=<bio|story|reel|post|dm>
 *   &utm_campaign=<post id or slug>&utm_content=<variant, optional>
 * Untagged visits still count: Instagram's link shim (l.instagram.com) and its
 * in-app browser are recognised, they just cannot say which post.
 */

export const FIRST_TOUCH_COOKIE = "lv_ft";
export const LAST_TOUCH_COOKIE = "lv_lt";
export const FIRST_TOUCH_DAYS = 90;
export const LAST_TOUCH_DAYS = 30;

export interface Touch {
  /** instagram, threads, google, newsletter, … */
  s: string;
  /** reel, story, bio, referral, organic, inapp, … */
  m: string;
  /** Campaign — for us, the post. Empty when the link was not tagged. */
  c: string;
  /** Variant within a campaign. */
  t: string;
  /** Path the visit landed on. */
  l: string;
  /** Day seen, YYYY-MM-DD. */
  d: string;
}

/** Labels only: lower-case, short, and nothing but [a-z0-9._-/]. */
function clean(v: string | null | undefined, max = 60): string {
  return (v ?? "").toLowerCase().replace(/[^a-z0-9._\-/]/g, "").slice(0, max);
}

const OWN_HOST = /(^|\.)lunavale38\.com$/;
const PAYMENT_HOST = /(^|\.)stripe\.com$|(^|\.)clerk\.|accounts\.google\.com$/;

/**
 * Work out this page view's source, or null if it has none worth recording
 * (direct, internal, or a bounce back from Stripe or a sign-in page — those
 * would otherwise overwrite the real last touch with "stripe").
 */
export function touchFrom(
  href: string,
  referrer: string,
  userAgent: string,
  today: string,
): Touch | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const p = url.searchParams;
  const landing = clean(url.pathname, 80) || "/";
  const make = (s: string, m: string): Touch => ({
    s: clean(s),
    m: clean(m),
    c: clean(p.get("utm_campaign")),
    t: clean(p.get("utm_content")),
    l: landing,
    d: today,
  });

  if (p.get("utm_source")) return make(p.get("utm_source")!, p.get("utm_medium") ?? "");

  let refHost = "";
  try {
    refHost = referrer ? new URL(referrer).hostname : "";
  } catch {}
  if (refHost && !OWN_HOST.test(refHost) && !PAYMENT_HOST.test(refHost)) {
    if (/instagram\.com$/.test(refHost)) return make("instagram", "referral");
    if (/threads\.(net|com)$/.test(refHost)) return make("threads", "referral");
    if (/facebook\.com$/.test(refHost)) return make("facebook", "referral");
    if (/(^|\.)google\./.test(refHost)) return make("google", "organic");
    return make(refHost.replace(/^www\./, ""), "referral");
  }

  // Inside Instagram's own browser the referrer is often stripped, but the
  // browser names itself. Only on arrival from outside — a page view inside
  // the site has our own host as referrer and was handled above.
  if (!refHost && /Instagram/.test(userAgent)) return make("instagram", "inapp");
  if (!refHost && /FBAN|FBAV/.test(userAgent)) return make("facebook", "inapp");
  return null;
}

export function encodeTouch(t: Touch): string {
  return encodeURIComponent(JSON.stringify(t));
}

export function decodeTouch(raw: string | undefined | null): Touch | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    if (!v || typeof v !== "object") return null;
    return {
      s: clean(v.s),
      m: clean(v.m),
      c: clean(v.c),
      t: clean(v.t),
      l: clean(v.l, 80),
      d: clean(v.d, 10),
    };
  } catch {
    return null;
  }
}

/**
 * Flattened for Stripe metadata (string values, ≤500 chars, ≤50 keys).
 * Empty fields are left out so a session without attribution carries nothing.
 */
export function toStripeMetadata(
  first: Touch | null,
  last: Touch | null,
): Record<string, string> {
  const out: Record<string, string> = {};
  const put = (prefix: string, t: Touch | null) => {
    if (!t) return;
    const pairs: [string, string][] = [
      ["source", t.s],
      ["medium", t.m],
      ["campaign", t.c],
      ["content", t.t],
      ["landing", t.l],
      ["date", t.d],
    ];
    for (const [k, v] of pairs) if (v) out[`${prefix}_${k}`] = v;
  };
  put("ft", first);
  put("lt", last);
  return out;
}
