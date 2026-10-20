import type { Metadata } from "next";
import Link from "next/link";
import { cancelMembership, payOutstanding } from "@/app/actions/session";
import { PreviewNotice } from "@/components/membership/PreviewNotice";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SignOut } from "@/components/ui/SignOut";
import { getMembership } from "@/lib/access/entitlement";
import { isOwner } from "@/lib/access/owner";
import { authConfigured, billingLive } from "@/lib/billing/provider";
import { lockedForPayment, membershipForUser } from "@/lib/db/memberships";
import {
  BENEFITS,
  benefitsFor,
  formatPrice,
  getTier,
  TIERS,
} from "@/lib/content/membership";

export const metadata: Metadata = {
  title: "Your membership",
  description: "Your membership status, what it opens, and how to end it.",
  // Personal state — never index it.
  robots: { index: false, follow: false },
};

interface AccountPageProps {
  searchParams: Promise<{ started?: string; ended?: string; welcome?: string; paid_elsewhere?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  // THE SAFETY NET FOR PAY-FIRST CHECKOUT, and it runs before anything is
  // read. Since 2026-08-27 somebody can pay before they have an account
  // (app/membership/start/route.ts), which leaves the membership parked
  // against their email. /membership/claim picks it up for anyone who follows
  // the path; this catches everybody else — the person who closed the tab on
  // /welcome, or paid on a phone and signed in a week later on a laptop.
  //
  // Costs one indexed read for a member who has nothing waiting, and it has to
  // happen before getMembership() or the page would render their old state and
  // tell a new member they are a visitor.
  await claimAnythingWaiting();

  const [{ tier, active, preview }, params, viewerIsOwner] = await Promise.all([
    getMembership(),
    searchParams,
    isOwner(),
  ]);
  const current = getTier(tier)!;
  const unlocked = benefitsFor(tier);
  // Arriving straight from sign-up (see signUpFallbackRedirectUrl in
  // app/layout.tsx). Only means anything to somebody without a membership —
  // a member who lands here with it is shown their membership as usual.
  const welcome = params.welcome === "1" && !active;

  // Real billing state, when there is any. Shown instead of the static tier
  // copy so the page reports what Stripe actually thinks rather than what the
  // content file says the plan costs.
  const record = billingLive() ? await currentRecord() : null;
  // Shut out by a failed renewal (2026-10-12): say so, and how to get back in,
  // instead of greeting a paying member as a visitor.
  const unpaid = !active && lockedForPayment(record);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            {active || unpaid ? "Your membership" : "Your account"}
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-ivory sm:text-4xl">
            {active
              ? current.name
              : unpaid
                ? "Your membership is paused"
                : welcome
                  ? "You\u2019re in. Here\u2019s where to start."
                  : "You\u2019re on the free side"}
          </h1>
          {/* SAID PLAINLY, 2026-10-10. A free account opens nothing a visitor
              can't already see, and people were making one expecting it to.
              Telling them is better than letting them find out by clicking. */}
          <p className="mt-3 max-w-xl leading-relaxed text-stone">
            {active
              ? current.tagline
              : unpaid
                ? "Your last payment didn\u2019t go through. Pay what\u2019s owed and everything opens again straight away."
                : "Everything free on the site is yours, and nothing here expires. Your account keeps your place, and if you ever join, the membership attaches to it in one step."}
          </p>
          {unpaid && (
            <form action={payOutstanding} className="mt-6">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
              >
                Update payment
              </button>
            </form>
          )}
        </header>

        {/* Transitions are announced rather than left to be inferred from a
            changed page — and the cancellation confirmation is unambiguous
            about there being nothing left to pay. */}
        {params.started === "1" && active && (
          <Banner tone="good">
            {/* Explicit space — a plain one is stripped where the text after
                an expression wraps. See LockedNotice. */}
            Your {current.name}{" "}
            membership is active. Everything below is open to you now.
          </Banner>
        )}
        {params.ended === "1" && !active && (
          <Banner tone="plain">
            Your membership has ended and you won&rsquo;t be charged again.
            You&rsquo;re back to visitor access — everything public is still
            yours.
          </Banner>
        )}

        {/* Sent here by Join instead of a second checkout (2026-10-20): this
            browser paid, and the payment belongs to a different login. */}
        {params.paid_elsewhere === "1" && !active && (
          <Banner tone="plain">
            This browser has already paid for a membership, and it&rsquo;s on a
            different account. Sign out and sign back in with the email you
            paid with, or reply to your receipt and Melissa will move it over.
            Nothing has been charged again.
          </Banner>
        )}

        {preview && <PreviewNotice className="mb-8" />}

        {active ? (
          <>
            <section
              aria-labelledby="status-heading"
              className="rounded-xl border border-hairline bg-charcoal/40 p-6"
            >
              <h2 id="status-heading" className="sr-only">
                Billing
              </h2>
              <dl className="grid gap-5 sm:grid-cols-3">
                <Field label="Tier" value={current.name} />
                <Field
                  label="Price"
                  value={`${formatPrice(current.priceMonthlyCents)} / month`}
                />
                {/* "RENEWS" WAS A LIE TO ANYBODY WHO HAD CANCELLED. This read
                    `status === "canceled"`, and Stripe does not move a
                    subscription to that status when somebody switches off
                    renewal — it stays "active" until the period actually runs
                    out. So for the entire month after cancelling, the page told
                    them their membership renews on the very date it ends.

                    cancel_at_period_end is the flag that was missing; it is
                    recorded from the webhook as of 2026-09-03. Access is
                    unchanged either way — they keep everything until the date
                    shown, which is the promise on the membership page and is
                    enforced in tierForUser(), not here. */}
                <Field
                  label={
                    record?.status === "canceled" || record?.cancelAtPeriodEnd
                      ? "Access until"
                      : "Renews"
                  }
                  value={
                    record?.currentPeriodEnd
                      ? record.currentPeriodEnd.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : current.commitment
                  }
                />
              </dl>
            </section>

            <section aria-labelledby="open-heading" className="pt-12">
              <h2
                id="open-heading"
                className="font-display text-2xl font-medium text-ivory"
              >
                What&rsquo;s open to you
              </h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {unlocked.map((benefit) => (
                  <li key={benefit.id} className="flex gap-2.5 text-sm">
                    <span aria-hidden className="mt-px text-amber">
                      ✓
                    </span>
                    <span className="text-ivory">
                      {benefit.label}
                      <span className="block text-xs leading-relaxed text-stone">
                        {benefit.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/browse"
                  className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                >
                  Go to the catalog
                </Link>
                {TIERS.filter((t) => t.id !== "free" && t.id !== tier).map(
                  (t) => (
                    <Link
                      key={t.id}
                      href="/membership#tiers"
                      className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                    >
                      Switch to {t.name}
                    </Link>
                  ),
                )}
              </div>
            </section>

            {/* Cancellation sits in the open, not buried under a settings
                sub-page. One click, no retention argument — the ethical rule
                and, as it happens, the thing that makes people comfortable
                joining in the first place. */}
            <section
              aria-labelledby="end-heading"
              className="mt-14 rounded-xl border border-hairline p-6"
            >
              <h2
                id="end-heading"
                className="font-display text-lg font-medium text-ivory"
              >
                Ending your membership
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone">
                {billingLive()
                  ? "This opens Stripe's billing portal, where you can cancel in one click. You keep access until the end of the period you've already paid for, and you won't be charged again."
                  : "One click, effective immediately, with no further charges. Everything public stays open to you, and rejoining later opens the rest again at once."}
              </p>
              <form action={cancelMembership} className="mt-5">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-wine hover:text-ivory"
                >
                  {billingLive() ? "Manage or cancel" : "End membership"}
                </button>
              </form>
            </section>
          </>
        ) : (
          <FreeSide />
        )}
        {/*
          OWNER ONLY. This used to test that OWNER_USER_ID was merely SET,
          which it always is in production — so every signed-in member was
          shown a link to /admin. The page itself 404s them correctly, so
          nothing leaked; it just told paying customers there was a door.
        */}
        {viewerIsOwner && (
          <div className="mt-10">
            <Link
              href="/admin"
              className="text-sm text-amber underline decoration-hairline underline-offset-4"
            >
              Admin →
            </Link>
          </div>
        )}

        {/* Always available, including on phones where the header hides it. */}
        <div className="mt-12 border-t border-hairline pt-6">
          <SignOut className="text-sm text-stone-dim underline decoration-hairline underline-offset-4 transition-colors hover:text-amber" />
        </div>

</main>
    </>
  );
}

/**
 * The free side, for a signed-in account with no membership.
 *
 * WHERE TO GO, THEN WHAT JOINING ADDS — in that order. Somebody who has just
 * made a free account wants to know what they can do now; the pitch comes
 * second and is the benefits list itself, so it can never drift from the
 * membership page or mention something that is switched off (the group chat
 * row drops out of BENEFITS when OVERHEARD_ARCHIVED is set).
 */
const FREE_PLACES = [
  {
    href: "/clips",
    label: "Clips",
    detail: "The ones released openly, in full, and the opening of some members-only ones.",
  },
  {
    href: "/journal",
    label: "Luna\u2019s journal",
    detail: "The pages she leaves open are marked \u201cFree to read.\u201d",
  },
  {
    href: "/posts",
    label: "Posts",
    detail: "The verticals from Instagram, the free ones in full.",
  },
  {
    href: "/characters",
    label: "Who everyone is",
    detail: "Luna, Tyson, Josh and the people around them.",
  },
];

function FreeSide() {
  const adds = BENEFITS.filter((b) => b.from === "vault");
  return (
    <>
      <section aria-labelledby="free-heading">
        <h2
          id="free-heading"
          className="font-display text-2xl font-medium text-ivory"
        >
          Open to you now
        </h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {FREE_PLACES.map((place) => (
            <li key={place.href}>
              <Link
                href={place.href}
                className="block h-full rounded-xl border border-hairline bg-charcoal/40 p-5 transition-colors duration-(--duration-quick) hover:border-amber"
              >
                <span className="font-display text-lg text-ivory">
                  {place.label} <span aria-hidden className="text-amber">→</span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-stone">
                  {place.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="adds-heading"
        className="mt-12 rounded-xl border border-hairline p-6 sm:p-8"
      >
        <h2
          id="adds-heading"
          className="font-display text-xl font-medium text-ivory"
        >
          What membership adds
        </h2>
        <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {adds.map((benefit) => (
            <li key={benefit.id} className="flex gap-2.5 text-sm">
              <span aria-hidden className="mt-px text-amber">
                +
              </span>
              <span className="text-ivory">
                {benefit.label}
                <span className="block text-xs leading-relaxed text-stone">
                  {benefit.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/membership"
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
        >
          {getTier("vault")!.cta}
        </Link>
        <p className="mt-3 text-xs text-stone-dim">
          {formatPrice(getTier("vault")!.priceMonthlyCents)} a month. Cancel
          from this page in one click.
        </p>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.15em] text-stone-dim">
        {label}
      </dt>
      <dd className="mt-1.5 text-ivory">{value}</dd>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "good" | "plain";
  children: React.ReactNode;
}) {
  return (
    <p
      // Polite: it describes a change the visitor just caused, so it should be
      // read out, but never interrupt what they are already hearing.
      role="status"
      className={`mb-6 rounded-lg border px-4 py-3 text-sm leading-relaxed ${
        tone === "good"
          ? "border-amber/40 bg-amber/10 text-amber-soft"
          : "border-hairline bg-charcoal/60 text-stone"
      }`}
    >
      {children}
    </p>
  );
}

/** The signed-in viewer's billing record, or null. */
/**
 * Attach a membership that was paid for before this account existed.
 *
 * Verified addresses only — that check is the entire security boundary of the
 * pay-first flow and it lives in the route and in claimPendingFor(); this is
 * simply the other place it is called from. Silent by design: for almost
 * everybody there is nothing waiting, and a person who does get one sees it as
 * the page already reporting them as a member.
 */
async function claimAnythingWaiting(): Promise<void> {
  if (!billingLive()) return;
  try {
    const { auth, currentUser } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return;

    const existing = await membershipForUser(userId);
    if (existing) return; // already attached — nothing to look for

    const user = await currentUser();
    const verified = (user?.emailAddresses ?? [])
      .filter((e) => e.verification?.status === "verified")
      .map((e) => e.emailAddress);

    const { claimPendingFor } = await import("@/lib/db/memberships");
    for (const email of verified) {
      if (await claimPendingFor(userId, email)) return;
    }
  } catch (error) {
    // Never break the account page over this. The claim is also attempted at
    // /membership/claim and again on the next visit here.
    console.error("account: claim check failed", error);
  }
}

async function currentRecord() {
  if (!authConfigured()) return null;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;
  return membershipForUser(userId);
}
