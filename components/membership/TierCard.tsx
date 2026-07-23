import Link from "next/link";
import {
  benefitsAddedBy,
  formatPrice,
  monthsSavedYearly,
  type Tier,
  type TierId,
} from "@/lib/content/membership";

interface TierCardProps {
  tier: Tier;
  /** The tier the viewer currently holds, so the card can reflect reality. */
  held: TierId;
}

/**
 * One tier, priced, with the benefits it *adds* over the tier below it.
 *
 * Showing the delta rather than the full cumulative list is the honest framing
 * and the clearer one: the question in a visitor's head is "what does the next
 * step buy me", and answering it in four lines beats answering it in eighteen.
 * The full picture lives in the comparison table below on the same page.
 */
export function TierCard({ tier, held }: TierCardProps) {
  const isCurrent = tier.id === held;
  const isFree = tier.id === "free";
  const added = benefitsAddedBy(tier.id);
  const monthsFree = monthsSavedYearly(tier);

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

      <p className="mt-5 flex items-baseline gap-1.5">
        <span className="font-display text-4xl font-light tabular-nums text-ivory">
          {formatPrice(tier.priceMonthlyCents)}
        </span>
        {!isFree && <span className="text-sm text-stone">/ month</span>}
      </p>
      <p className="mt-1.5 text-xs text-stone-dim">
        {tier.commitment}
        {monthsFree > 0 && (
          <>
            {" · "}
            {formatPrice(tier.priceYearlyCents!)} yearly, {monthsFree} months
            free
          </>
        )}
      </p>

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

      <div className="mt-7">
        {isCurrent ? (
          <p className="rounded-full border border-amber/40 bg-amber/10 px-5 py-3 text-center text-sm text-amber-soft">
            Your current tier
          </p>
        ) : isFree ? (
          <Link
            href="/browse"
            className="block rounded-full border border-hairline px-5 py-3 text-center text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
          >
            {tier.cta}
          </Link>
        ) : (
          // One link into the whole flow: /membership/start handles sign-in
          // and checkout as a single continuous path, so a new visitor never
          // lands back here to click again. The tier is validated server-side
          // against the real list, so a hand-edited href can't invent a plan.
          <Link
            href={`/membership/start?tier=${tier.id}`}
            className={`block rounded-full px-5 py-3 text-center text-sm font-medium transition-colors duration-(--duration-quick) ${
              tier.featured
                ? "bg-amber text-void hover:bg-amber-soft"
                : "border border-hairline text-ivory hover:border-amber hover:text-amber"
            }`}
          >
            {tier.cta}
          </Link>
        )}
      </div>
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
