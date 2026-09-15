import Link from "next/link";
import { PlanChoice } from "@/components/membership/PlanChoice";
import { IfHeld, IfNotHeld } from "@/components/membership/HeldTier";
import { Guest, Member } from "@/components/access/Viewer";
import {
  benefitsAddedBy,
  formatPrice,
  type Tier,
} from "@/lib/content/membership";

interface TierCardProps {
  tier: Tier;
  /**
   * Whether a real yearly Stripe price exists for this tier. Read on the
   * server (the env var is not public) and passed down, so the toggle is only
   * ever offered where the money can actually be taken.
   */
  yearlyOffered?: boolean;
}

/**
 * One tier, priced, with the benefits it *adds* over the tier below it.
 *
 * Showing the delta rather than the full cumulative list is the honest framing
 * and the clearer one: the question in a visitor's head is "what does the next
 * step buy me", and answering it in four lines beats answering it in eighteen.
 * The full picture lives in the comparison table below on the same page.
 */
export function TierCard({ tier, yearlyOffered = false }: TierCardProps) {
  const isFree = tier.id === "free";
  const added = benefitsAddedBy(tier.id);

  // The middle of the card, built once and placed by whichever branch renders
  // it — identical either way, which is the point.
  const details = (
    <>
      <p className="mt-5 text-sm leading-relaxed text-stone">{tier.blurb}</p>
      {added.length > 0 && (
        <>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-stone-dim">
            {isFree ? "Included" : "Adds"}
          </p>
          <ul className="mt-3 flex flex-1 flex-col gap-2.5">
            {added.map((benefit) => (
              <li key={benefit.id} className="flex gap-2.5 text-sm">
                <CheckGlyph />
                <span className="text-ivory">
                  {benefit.label}
                  <span className="block text-xs leading-relaxed text-stone">
                    {benefit.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );

  return (
    <div
      data-reveal-item
      className={`relative flex h-full flex-col rounded-xl border p-6 sm:p-7 ${
        tier.featured
          ? "border-amber/40 bg-charcoal/80"
          : "border-hairline bg-charcoal/40"
      }`}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-amber px-3 py-1 text-xs font-medium text-void">
          Most take this one
        </span>
      )}

      <h3 className="font-display text-2xl font-medium text-ivory">
        {tier.name}
      </h3>
      <p className="mt-1 text-sm text-amber-soft">{tier.tagline}</p>

      {/* THE PAID CARD IS ONE UNIT — price, period, benefits, button — and it
          has to be, because the price and the button have to agree about which
          plan is selected. Keeping them in separate places is exactly how this
          card ended up printing "$80 yearly" beside a button that could only
          ever charge $8 a month.

          The free tier has nothing to choose, so it keeps the plain layout. */}
      {/* BOTH VARIANTS SHIP IN THE CACHED HTML and the client shows one —
          the same rule as the header and the home page. It costs the benefit
          list twice in the document, about a kilobyte, and it buys a page that
          is a static file instead of a serverless render for every visitor and
          every crawler. See components/membership/HeldTier.tsx.

          The free tier keeps the plain layout either way; only its button
          changes. The paid tier changes shape completely, which is why both
          shapes are here rather than one with a swapped label. */}
      {isFree ? (
        <>
          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-light tabular-nums text-ivory">
              {formatPrice(tier.priceMonthlyCents)}
            </span>
          </p>
          <p className="mt-1.5 text-xs text-stone-dim">{tier.commitment}</p>
          {details}
          {/* <Guest>/<Member> here rather than IfHeld, and the difference is
              which way the card fails while the answer is still in flight.

              IfHeld treats unknown as NOT held, which is right for the paid
              card — better to show a member a join button for one frame than
              to tell a stranger they already own something. On the FREE card
              that same default is wrong in the common case: every signed-out
              visitor does hold this tier, so unknown-means-not-held would
              print "Start exploring" and flip to "Your current tier" a moment
              later, on the state almost every visitor is in. <Guest> treats
              unknown as guest, which matches both the static HTML and the
              truth, and nothing visibly changes when /api/me answers. */}
          <div className="mt-7">
            <Guest>
              <p className="rounded-full border border-amber/40 bg-amber/10 px-5 py-3 text-center text-sm text-amber-soft">
                Your current tier
              </p>
            </Guest>
            <Member>
              <Link
                href="/browse"
                className="block rounded-full border border-hairline px-5 py-3 text-center text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                {tier.cta}
              </Link>
            </Member>
          </div>
        </>
      ) : (
        <>
          <IfHeld tier={tier.id}>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-light tabular-nums text-ivory">
                {formatPrice(tier.priceMonthlyCents)}
              </span>
              <span className="text-sm text-stone">/ month</span>
            </p>
            <p className="mt-1.5 text-xs text-stone-dim">{tier.commitment}</p>
            {details}
            <div className="mt-7">
              <p className="rounded-full border border-amber/40 bg-amber/10 px-5 py-3 text-center text-sm text-amber-soft">
                Your current tier
              </p>
            </div>
          </IfHeld>

          <IfNotHeld tier={tier.id}>
            {/* One link into the whole flow: /membership/start handles checkout
                as a single continuous path, and since 2026-08-27 it no longer
                stops at an account first. The tier and interval are both
                validated server-side, so a hand-edited href cannot invent a
                plan or a price.

                prefetch={false} lives inside PlanChoice and IS LOAD-BEARING:
                Next prefetches a Link on hover, and the href is a GET route
                handler that CREATES A STRIPE CHECKOUT SESSION — so a prefetch
                mints a real session for somebody who has only moved their
                mouse. Stripe's record showed the fingerprint: sessions a second
                apart, hover then click, for every visitor who reached this
                button. Nobody was double-charged, but the abandonment figure
                was roughly doubled, and that is the one number this page is
                judged on. */}
            <PlanChoice
              tierId={tier.id}
              cta={tier.cta}
              monthlyCents={tier.priceMonthlyCents}
              yearlyCents={tier.priceYearlyCents ?? null}
              commitment={tier.commitment}
              yearlyAvailable={yearlyOffered}
            >
              {details}
            </PlanChoice>
          </IfNotHeld>
        </>
      )}
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-amber"
    >
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
