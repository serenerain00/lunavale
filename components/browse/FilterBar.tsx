import Link from "next/link";
import {
  facetCount,
  isActive,
  queryHref,
  toggle,
  type CatalogQuery,
} from "@/lib/content/catalog";
import { feelings, places } from "@/lib/content/taxonomy";

interface FilterBarProps {
  query: CatalogQuery;
}

/**
 * Faceted filters for /browse, rendered as plain links.
 *
 * No client JavaScript: each chip is an href to the same page with one facet
 * value toggled, so filtering works with JS disabled, survives a refresh, is
 * shareable, and stays crawlable. Counts are computed against the *rest* of
 * the query, and a chip that would return nothing is shown disabled rather
 * than leading the visitor into an empty room.
 */
export function FilterBar({ query }: FilterBarProps) {
  return (
    <nav
      aria-label="Filter the catalog"
      className="border-y border-hairline bg-void/80 py-3 backdrop-blur-md sm:py-4"
    >
      <FacetRow
        legend="Feeling"
        facet="feelings"
        options={feelings}
        query={query}
      />
      <div className="mt-2 sm:mt-3">
        <FacetRow
          legend="Place"
          facet="places"
          options={places}
          query={query}
        />
      </div>

      {isActive(query) && (
        <div className="mt-3 sm:mt-4">
          <Link
            href="/browse"
            className="text-sm text-stone underline decoration-hairline underline-offset-4 transition-colors duration-(--duration-quick) hover:text-amber"
          >
            Clear all filters
          </Link>
        </div>
      )}
    </nav>
  );
}

function FacetRow({
  legend,
  facet,
  options,
  query,
}: {
  legend: string;
  facet: "feelings" | "places";
  options: readonly { id: string; label: string }[];
  query: CatalogQuery;
}) {
  const selected = query[facet] as string[];

  return (
    // The legend stays beside the chips rather than above them: this bar is
    // sticky, and stacked labels cost two extra lines of a phone's viewport
    // on every scroll of the page beneath it.
    <div className="flex items-center gap-3 sm:gap-4">
      <h2 className="w-14 shrink-0 text-[0.6875rem] uppercase leading-tight tracking-[0.15em] text-stone-dim sm:w-16 sm:text-xs sm:tracking-[0.2em]">
        {legend}
      </h2>
      {/*
        On a phone these chips would wrap to three or four lines and the
        sticky bar would eat half the viewport. So the row scrolls sideways
        instead, bleeding to the screen edge so the next chip peeks in and the
        scroll is self-evident. From sm up there is room to wrap and show
        every option at once, which is the better read when it fits.
      */}
      <ul className="rail-scroller -mr-5 flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto pr-5 sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0">
        {options.map((option) => {
          const active = selected.includes(option.id);
          const nextQuery = toggle(query, facet, option.id);
          // How much this value holds, given the other facet's selection.
          const count = facetCount(query, facet, option.id);

          return (
            <li key={option.id} className="shrink-0">
              {!active && count === 0 ? (
                <span
                  aria-disabled="true"
                  title="Nothing in the catalog matches this combination yet"
                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 text-sm text-stone-dim opacity-60 sm:py-1.5"
                >
                  {option.label}
                </span>
              ) : (
                <Link
                  href={queryHref(nextQuery)}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  aria-label={
                    active
                      ? `Remove filter: ${option.label}`
                      : `Filter by ${option.label}`
                  }
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition-colors duration-(--duration-quick) sm:py-1.5 ${
                    active
                      ? "border-amber bg-amber/15 text-amber-soft"
                      : "border-hairline text-stone hover:border-amber hover:text-amber"
                  }`}
                >
                  {option.label}
                  <span className="text-xs tabular-nums opacity-70">
                    {active ? "×" : count}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
