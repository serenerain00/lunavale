import {
  BENEFIT_GROUPS,
  OFFERED_BENEFITS,
  TIERS,
  tierCovers,
} from "@/lib/content/membership";

/**
 * The full comparison, as a real table.
 *
 * The tier cards answer "what does the next step add"; this answers "does tier
 * X include Y", which is the question someone asks right before they decide to
 * trust the page. A genuine <table> with scoped headers means a screen reader
 * announces "Locked rooms, Vault, included" rather than reading a grid of
 * disembodied ticks — and it stays legible at 320px because the tier columns
 * are narrow and only the label column needs room.
 */
export function BenefitTable() {
  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">
        What each membership tier includes
      </caption>
      <thead>
        <tr className="border-b border-hairline">
          <th scope="col" className="py-3 pr-2 text-xs uppercase tracking-[0.15em] text-stone-dim">
            <span className="sr-only">Benefit</span>
          </th>
          {TIERS.map((tier) => (
            <th
              key={tier.id}
              scope="col"
              className="w-[18%] py-3 text-center font-display text-sm font-medium text-ivory sm:text-base"
            >
              {tier.name}
            </th>
          ))}
        </tr>
      </thead>

      {BENEFIT_GROUPS.filter((group) =>
        OFFERED_BENEFITS.some((b) => b.group === group),
      ).map((group) => (
        <tbody key={group}>
          <tr>
            <th
              scope="colgroup"
              colSpan={TIERS.length + 1}
              className="pb-2 pt-7 text-xs uppercase tracking-[0.18em] text-amber"
            >
              {group}
            </th>
          </tr>
          {OFFERED_BENEFITS.filter((b) => b.group === group).map((benefit) => (
            <tr key={benefit.id} className="border-t border-hairline align-top">
              <th
                scope="row"
                className="py-3 pr-3 text-sm font-normal text-ivory"
              >
                {benefit.label}
                <span className="mt-0.5 block text-xs font-normal leading-relaxed text-stone">
                  {benefit.detail}
                </span>
              </th>
              {TIERS.map((tier) => (
                <td key={tier.id} className="py-3 text-center align-middle">
                  <Mark included={tierCovers(tier.id, benefit.from)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

function Mark({ included }: { included: boolean }) {
  return included ? (
    <>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="mx-auto text-amber"
      >
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      {/* A dash, not a cross: this tier simply doesn't carry it. */}
      <span aria-hidden className="text-stone-dim">
        —
      </span>
      <span className="sr-only">Not included</span>
    </>
  );
}
