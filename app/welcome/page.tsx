import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ClarityEvent } from "@/components/analytics/ClarityEvent";
import { inAppBrowser } from "@/lib/access/in-app";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { billingLive } from "@/lib/billing/provider";
import { RememberPayment } from "@/components/membership/RememberPayment";
import { AutoSignIn } from "@/components/membership/AutoSignIn";
import { accountForPayment } from "@/lib/billing/auto-account";

export const metadata: Metadata = {
  title: "You're in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Where a brand-new member lands the second after paying.
 *
 * THE PAGE ONLY EXISTS BECAUSE CHECKOUT NOW COMES FIRST (2026-08-27). A
 * signed-out visitor goes straight from the membership page to the card, so at
 * this moment they have paid and have no account. This turns the address
 * Stripe just collected into one, in a single step, on the side of the payment
 * where they are already committed.
 *
 * THE ORDER OF THE PAGE IS THE POINT. The confirmation comes first and is
 * unconditional — the money has left, and the first thing anybody needs to see
 * is that it worked. The account ask is second and is framed as the small
 * remaining thing, because that is what it is. A page that led with "now make
 * an account" would read as a second toll gate after the till.
 *
 * IF THEY LEAVE INSTEAD, nothing is lost. The membership is parked against
 * their email (lib/db/schema.sql, pending_memberships) and is claimed
 * automatically the first time they sign up or sign in with that address —
 * today, or in a month. That is why this page can afford to be calm.
 *
 * IT NEVER GRANTS ACCESS ITSELF. Reading a Checkout Session tells you a
 * payment happened; it is not authorization, and entitlement still resolves
 * from a Clerk user against the memberships table. Everything here is copy.
 */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sessionId = String(params.session_id ?? "");

  // Already signed in — there is nothing to ask for. Claim and go.
  if (billingLive()) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (userId) redirect(claimHref(sessionId));
  }

  const paid = await readSession(sessionId);
  // Paying makes the account (lib/billing/auto-account.ts). Null when it is
  // switched off or anything goes wrong — then the page is the old one.
  const auto = paid ? await accountForPayment(sessionId) : null;
  const inApp = inAppBrowser((await headers()).get("user-agent"));

  // The account step as it has been since 2026-08-27: make an account
  // yourself. Still what everyone sees with AUTO_ACCOUNT off, and what the
  // automatic path falls back to if anything about it fails.
  const makeYourAccount = paid && (
    <>
      <Link
        href={signUpHref(paid.email, sessionId)}
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
      >
        Make your account
      </Link>

      {/* Inside Facebook's or Instagram's browser Google sign-in is
          refused, and this is the page a new member reaches seconds
          after paying. Two of seven buyers on 2026-10-18 had not made
          an account. See lib/access/in-app.ts. */}
      {/* 2026-10-21: "open in browser first" was not enough. Tina paid
          inside Instagram, then opened the site fresh in another
          browser — which had no idea she had paid — and paid again.
          "Open in browser" from THIS page carries the session id with
          it; opening the site some other way does not. So say which
          one, and say plainly not to pay twice. */}
      {inApp && (
        <div className="mt-4 rounded-lg border border-amber/40 p-4 text-sm leading-relaxed text-stone">
          <p>
            You&rsquo;re in {inApp === "facebook" ? "Facebook" : "Instagram"}&rsquo;s
            browser, where Google sign-in doesn&rsquo;t work. Make the account
            here with your email address.
          </p>
          <p className="mt-2">
            Rather use Safari or Chrome? Tap <span className="text-ivory">···</span>{" "}
            and choose <span className="text-ivory">Open in browser</span> from
            this page, and your payment comes with you.{" "}
            <span className="text-ivory">You don&rsquo;t need to pay again</span> —
            it&rsquo;s done.
          </p>
        </div>
      )}

      {paid.email && (
        <p className="mt-4 text-sm text-stone-dim">
          Use <span className="text-stone">{paid.email}</span> — that is
          the address the membership is against.
        </p>
      )}

      {/* Said plainly, because the alternative is somebody quietly
          worrying they have paid into a void if they close the tab. */}
      <p className="mt-8 border-t border-hairline pt-6 text-sm leading-relaxed text-stone-dim">
        If you close this now, nothing is lost. The membership is held
        against that email, and the first time you sign in with it —
        tonight or next month — it will be waiting.
      </p>
    </>
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        {paid ? (
          <>
            <RememberPayment sessionId={sessionId} />
            {/* The one moment Clarity can know a payment happened — it
                cannot see stripe.com. No id, no email: just the event. */}
            <ClarityEvent name="purchase" />
            <p className="text-xs uppercase tracking-[0.2em] text-amber">
              That&rsquo;s paid
            </p>
            <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl">
              You&rsquo;re in the LunaVerse.
            </h1>
            {/* "the locked rooms" was here. The world came off the site on
                2026-09-15 and there are no rooms to unlock — on the one page
                somebody reads thirty seconds after paying. */}
            <p className="mt-4 leading-relaxed text-stone">
              Every clip at full length, every page of her journal, and season
              one the moment it lands.
              {auto?.kind !== "ticket" && (
                <>
                  {" "}There is one small thing left: an account, so the site
                  knows you when you come back.
                </>
              )}
            </p>

            {auto?.kind === "ticket" ? (
              <AutoSignIn
                ticket={auto.ticket}
                email={auto.email}
                next={claimHref(sessionId)}
                fallback={makeYourAccount}
              />
            ) : auto?.kind === "existing" ? (
              <>
                <p className="mt-6 text-sm leading-relaxed text-stone">
                  You already have an account with{" "}
                  <span className="text-ivory">{auto.email}</span>. Sign in and
                  the membership is on it.
                </p>
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(claimHref(sessionId))}`}
                  className="mt-6 inline-flex min-h-11 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                >
                  Sign in
                </Link>
              </>
            ) : (
              makeYourAccount
            )}
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl">
              We haven&rsquo;t got a payment for this yet.
            </h1>
            <p className="mt-4 leading-relaxed text-stone">
              That either means the checkout was closed before it finished, or
              it is still settling. Nothing has been charged twice and nothing
              is stuck.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/membership"
                className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
              >
                Back to membership
              </Link>
              <Link
                href="/help"
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                Tell Melissa
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}

/**
 * The claim route, carrying the checkout session.
 *
 * THE SESSION IS WHAT MAKES A MISMATCHED EMAIL SURVIVABLE (2026-09-25). The
 * pre-filled address below is a suggestion, and "Continue with Google" ignores
 * it — one customer paid with Hotmail, signed up with Gmail, and was locked out
 * of what she had just bought. With the session id on the way back, the claim
 * route can match the payment itself rather than the address.
 */
function claimHref(sessionId: string): string {
  return sessionId
    ? `/membership/claim?session_id=${encodeURIComponent(sessionId)}`
    : "/membership/claim";
}

/**
 * Clerk sign-up, pointed back at the claim route, with the paying address
 * pre-filled so the two cannot drift apart by a typo.
 */
function signUpHref(email: string | null, sessionId: string): string {
  const back = encodeURIComponent(claimHref(sessionId));
  const prefill = email ? `&email=${encodeURIComponent(email)}` : "";
  return `/sign-up?redirect_url=${back}${prefill}`;
}

/**
 * What Stripe says about this session.
 *
 * Returns null for anything that is not a completed payment — an unknown id, a
 * session someone made up, one that was abandoned. There is nothing to protect
 * here (the page grants nothing), but showing "you're in" to somebody who is
 * not would be its own small lie.
 */
async function readSession(
  sessionId: string,
): Promise<{ email: string | null } | null> {
  if (!sessionId || !billingLive()) return null;
  try {
    const { stripe } = await import("@/lib/billing/stripe");
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    const done =
      session.payment_status === "paid" || session.status === "complete";
    if (!done) return null;
    return {
      email:
        session.customer_details?.email ?? session.customer_email ?? null,
    };
  } catch (error) {
    console.error("welcome: could not read checkout session", error);
    return null;
  }
}
