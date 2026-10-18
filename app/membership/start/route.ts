/**
 * /membership/start?tier=<id>&interval=<month|year> — the one entry point that
 * begins a membership.
 *
 * CHECKOUT NO LONGER WAITS FOR AN ACCOUNT (2026-08-27, Melissa's call after
 * watching people reach the membership page and leave).
 *
 * What it used to do: a signed-out visitor was sent to Clerk, made an account,
 * waited for a verification code in their email, typed it, came back here, and
 * only THEN saw a price field. Three screens stood between deciding to buy and
 * being able to. An earlier pass fixed the worst of it — the redirect carries
 * you back here rather than dumping you on the pricing page — but the account
 * itself was still a wall in front of the till.
 *
 * What it does now: a signed-out visitor goes straight to Stripe. Stripe
 * collects the email, the webhook parks the membership against that email in
 * `pending_memberships`, and /welcome turns it into an account afterwards, on
 * the other side of the payment, when they are already committed.
 *
 * WHY THAT IS SAFE. Nothing is granted by the cookie in production
 * (lib/access/entitlement.ts ignores it whenever billing is live), so a
 * pending membership opens nothing until a signed-in Clerk user with a
 * VERIFIED matching email claims it. Payment first does not mean access first.
 *
 * AND IT IS SELF-HEALING. If somebody pays and closes the tab before making an
 * account, the row sits there keyed by their email; whenever they sign up or
 * sign in with that address — that day or a month later — /account claims it.
 * Nobody can pay and end up with nothing.
 *
 * A SIGNED-IN buyer skips all of that and goes straight to Stripe as before,
 * with their Clerk id on the session.
 *
 * Handles both modes, same as the old action did:
 *   billing live  → Stripe Checkout (signed in or not)
 *   preview       → set the preview cookie → /account
 *
 * The tier and interval come from the query string and are both validated
 * against the real list, so a hand-edited URL cannot conjure a plan or a price.
 */

import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_COOKIE, isMember } from "@/lib/access/entitlement";
import { billingLive, isBillingInterval } from "@/lib/billing/provider";
import { getTier } from "@/lib/content/membership";
import { lockedForPayment, membershipForUser } from "@/lib/db/memberships";
import {
  FIRST_TOUCH_COOKIE,
  LAST_TOUCH_COOKIE,
  decodeTouch,
  toStripeMetadata,
} from "@/lib/analytics/attribution";
import { AB_COOKIE, abMetadata } from "@/lib/analytics/experiments";
import { PAID_COOKIE } from "@/lib/billing/paid-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const THIRTY_DAYS = 60 * 60 * 24 * 30;


/**
 * Whether this request is a browser guessing, rather than a person clicking.
 *
 * WHY THIS ROUTE NEEDS IT. It is a GET that MUTATES — it mints a live Stripe
 * Checkout session — which is the exact shape of thing speculative fetching
 * ruins. The Link that points here already carries `prefetch={false}`, and
 * that was added for this reason after hover-prefetch was found doubling the
 * session count. It is not enough: Next's prefetcher is only one of the
 * things that fetches a link early.
 *
 * CHROME'S SPECULATION RULES PRERENDER independently of anything Next does,
 * and a prerender is a real navigation request that runs this handler in full.
 * On 2026-09-17 a single click produced two live sessions one second apart —
 * 19:13:01 and 19:13:02, both signed out, identical metadata. Every completed
 * checkout in the Stripe record has the same fingerprint: one real session
 * and one or two ghosts beside it.
 *
 * NOBODY IS DOUBLE-CHARGED — an unused session simply expires — but it
 * roughly doubles the abandonment rate, which is the one number this funnel
 * is read by, and it means "sessions created" cannot be trusted as a measure
 * of intent. It also lets anything that crawls links mint sessions.
 *
 * `Sec-Purpose` covers Chromium prefetch AND prerender; `Purpose` and
 * `X-Purpose` cover older Chrome, Firefox and Safari; `Next-Router-Prefetch`
 * covers Next's own. Checking all four is cheap and none of them is ever set
 * on a real navigation.
 */
function speculative(request: NextRequest): boolean {
  const h = request.headers;
  return (
    (h.get("sec-purpose") ?? "").includes("prefetch") ||
    (h.get("purpose") ?? "").toLowerCase() === "prefetch" ||
    (h.get("x-purpose") ?? "").toLowerCase() === "preview" ||
    h.get("next-router-prefetch") === "1"
  );
}

/*
 * GET NO LONGER STARTS ANYTHING (2026-10-13).
 *
 * The header checks above were not enough. Stripe still showed two or three
 * live sessions per click, 1–3 seconds apart, every day of October, all
 * signed out and without any of those headers — some with Cash App missing,
 * which Stripe only drops for a request from outside the US: a link preview
 * or an in-app browser fetching the same URL from somewhere that is not the
 * person. Anything that can fetch a link will, and there is no list of them
 * to keep up with.
 *
 * So the Join button is now a FORM that POSTs here (components/membership/
 * PlanChoice.tsx). Nothing fetches a POST speculatively, previews never
 * submit forms, and the button disables itself once pressed. A GET — an old
 * link, a crawler, a sign-up redirect from before pay-first — goes to the
 * plans and creates nothing.
 */
export async function GET(request: NextRequest) {
  if (speculative(request)) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.redirect(new URL("/membership#tiers", request.nextUrl.origin), 303);
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  // Which button: "play" is the strip under the player (PlayJoin), "hero" the
  // home page's first screen (first-screen test, 2026-10-18), anything else is
  // the membership page. A label, from a fixed list.
  const raw = form?.get("from");
  const from = raw === "play" || raw === "hero" ? raw : null;
  return start(
    request,
    String(form?.get("tier") ?? ""),
    String(form?.get("interval") ?? "month"),
    from,
  );
}

async function start(
  request: NextRequest,
  tierParam: string,
  intervalParam: string,
  from: string | null = null,
) {
  const origin = request.nextUrl.origin;
  // 303 everywhere below: the answer to a POST, to be followed with a GET.
  const go = (url: string | URL) => NextResponse.redirect(url, 303);
  const tier = getTier(tierParam);

  // Unknown or free tier: nothing to start.
  if (!tier || tier.id === "free") {
    return go(new URL("/membership", origin));
  }

  // Anything that is not "year" is monthly, including nothing at all — so
  // every link that predates the yearly plan keeps buying what it always did.
  const interval = isBillingInterval(intervalParam) ? intervalParam : "month";

  if (billingLive()) {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    const { createCheckoutSession } = await import("@/lib/billing/stripe");

    // Where they came from, so the payment can be traced to a post. Labels
    // only; a missing or mangled cookie is just an unattributed checkout.
    // Plus which A/B variants they were in, for experiments live today, so a
    // test's checkouts and payments can be read straight from Stripe.
    const attribution = {
      ...toStripeMetadata(
        decodeTouch(request.cookies.get(FIRST_TOUCH_COOKIE)?.value),
        decodeTouch(request.cookies.get(LAST_TOUCH_COOKIE)?.value),
      ),
      ...abMetadata(request.cookies.get(AB_COOKIE)?.value),
      ...(from ? { entry: from } : {}),
    };

    // SIGNED OUT: straight to the card. No account, no verification code, no
    // second visit to this route. Stripe collects the email and the webhook
    // does the rest.
    // 2026-10-13: a customer paid, didn't make her account there and then,
    // and later paid a second time. Neither branch below may take a second
    // payment from somebody who has already made one.
    if (!userId) {
      const paid = request.cookies.get(PAID_COOKIE)?.value;
      if (paid && /^cs_(live|test)_[A-Za-z0-9]+$/.test(paid)) {
        return go(new URL(`/welcome?session_id=${encodeURIComponent(paid)}`, origin));
      }
      const url = await createCheckoutSession({
        tier: tier.id,
        userId: null,
        interval,
        attribution,
      });
      return go(url);
    }

    const [user, existing] = await Promise.all([
      currentUser(),
      membershipForUser(userId),
    ]);

    // Already a member (isMember also claims a payment made before the
    // account existed), or one whose card failed: never a new subscription.
    if ((await isMember()) || (existing && lockedForPayment(existing))) {
      return go(new URL("/account", origin));
    }

    const url = await createCheckoutSession({
      tier: tier.id,
      userId,
      interval,
      email: user?.primaryEmailAddress?.emailAddress,
      existingCustomerId: existing?.stripeCustomerId,
      attribution,
    });
    return go(url);
  }

  // ---- Preview mode: grant the labeled preview, no charge -----------------
  const res = go(new URL("/account?started=1", origin));
  res.cookies.set(MEMBER_COOKIE, tier.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return res;
}
