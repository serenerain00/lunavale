import Link from "next/link";
import { PlanChoice } from "@/components/membership/PlanChoice";
import {
  benefitsAddedBy,
  formatPrice,
  type Tier,
  type TierId,
} from "@/lib/content/membership";

interface TierCardProps {
  tier: Tier;
  /** The tier the viewer currently holds, so the card can reflect reality. */
  held: TierId;
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
export function TierCard({
  tier,
  held,
  yearlyOffered = false,
}: TierCardProps) {
  const isCurrent = tier.id === held;
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
      {isFree || isCurrent ? (
        <>
          <p className="mt-5 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-light tabular-nums text-ivory">
              {formatPrice(tier.priceMonthlyCents)}
            </span>
            {!isFree && <span className="text-sm text-stone">/ month</span>}
          </p>
          <p className="mt-1.5 text-xs text-stone-dim">{tier.commitment}</p>
          {details}
          <div className="mt-7">
            {isCurrent ? (
              <p className="rounded-full border border-amber/40 bg-amber/10 px-5 py-3 text-center text-sm text-amber-soft">
                Your current tier
              </p>
            ) : (
              <Link
                href="/browse"
                className="block rounded-full border border-hairline px-5 py-3 text-center text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                {tier.cta}
              </Link>
            )}
          </div>
        </>
      ) : (
        // One link into the whole flow: /membership/start handles checkout as a
        // single continuous path, and since 2026-08-27 it no longer stops at an
        // account first. The tier and interval are both validated server-side,
        // so a hand-edited href cannot invent a plan or a price.
        //
        // prefetch={false} lives inside PlanChoice and IS LOAD-BEARING: Next
        // prefetches a Link on hover, and the href is a GET route handler that
        // CREATES A STRIPE CHECKOUT SESSION — so a prefetch mints a real
        // session for somebody who has only moved their mouse. Stripe's record
        // showed the fingerprint: sessions a second apart, hover then click,
        // for every visitor who reached this button. Nobody was double-charged,
        // but the abandonment figure was roughly doubled, and that is the one
        // number this page is judged on.
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
