import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { billingLive } from "@/lib/billing/provider";

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
    if (userId) redirect("/membership/claim");
  }

  const paid = await readSession(sessionId);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
        {paid ? (
          <>
            <p className="text-xs uppercase tracking-[0.2em] text-amber">
              That&rsquo;s paid
            </p>
            <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl">
              You&rsquo;re in the LunaVerse.
            </h1>
            <p className="mt-4 leading-relaxed text-stone">
              The whole library, the locked rooms, and every page of her journal
              are yours. There is one small thing left: an account, so the site
              knows you when you come back.
            </p>

            <Link
              href={signUpHref(paid.email)}
              className="mt-8 inline-flex min-h-11 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
            >
              Make your account
            </Link>

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
 * Clerk sign-up, pointed back at the claim route, with the paying address
 * pre-filled so the two cannot drift apart by a typo.
 */
function signUpHref(email: string | null): string {
  const back = encodeURIComponent("/membership/claim");
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
