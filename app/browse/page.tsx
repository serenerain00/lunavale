import type { Metadata } from "next";
import Link from "next/link";
import { isMember } from "@/lib/access/entitlement";
import { CatalogCard } from "@/components/browse/CatalogCard";
import { FilterBar } from "@/components/browse/FilterBar";
import {
  Rail,
  RailItem,
  RAIL_ITEM_SIZES,
} from "@/components/browse/Rail";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import {
  catalog,
  filterCatalog,
  isActive,
  parseQuery,
  queryHref,
  shelves,
  type CatalogItem,
  type CatalogQuery,
  type RawParams,
} from "@/lib/content/catalog";
import { getFeeling, getPlace } from "@/lib/content/taxonomy";

interface BrowsePageProps {
  searchParams: Promise<RawParams>;
}

export async function generateMetadata({
  searchParams,
}: BrowsePageProps): Promise<Metadata> {
  const query = parseQuery(await searchParams);
  const label = describe(query);

  return {
    title: label ? `Browse — ${label} | Luna Vault` : "Browse | Luna Vault",
    description:
      "Every scene and still in Luna's world, browsable by what it feels like and where it happens.",
    // Filtered views are variations of one page — keep /browse the indexed one.
    alternates: { canonical: "/browse" },
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const [member, params] = await Promise.all([isMember(), searchParams]);
  const query = parseQuery(params);
  const filtering = isActive(query);
  const results = filterCatalog(query);

  // When a single place is in focus and it exists as an explorable
  // environment, offer the way in — the catalog should feed the world.
  const focusedPlace =
    query.places.length === 1 ? getPlace(query.places[0]) : undefined;

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            The catalog
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Browse by what it feels like.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            Luna&rsquo;s world sorted by emotional context — trust, distance,
            what was said and what was kept back — or by the places it happened.
          </p>
        </header>

        <div className="sticky top-(--header-h) z-10">
          <FilterBar query={query} />
        </div>

        {filtering ? (
          <section aria-labelledby="results-heading" className="pt-8">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="results-heading"
                className="font-display text-2xl font-medium text-ivory"
              >
                {results.length}{" "}
                {results.length === 1 ? "result" : "results"}
                <span className="ml-2 text-base font-normal text-stone">
                  {describe(query)}
                </span>
              </h2>

              {focusedPlace?.environmentSlug && (
                <Link
                  href={`/world/${focusedPlace.environmentSlug}`}
                  className="rounded-full border border-hairline px-5 py-2 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                >
                  Step inside {focusedPlace.label} →
                </Link>
              )}
            </div>

            {results.length === 0 ? (
              <EmptyState />
            ) : (
              <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                  <CatalogCard key={item.id} item={item} unlocked={member} />
                ))}
              </Reveal>
            )}
          </section>
        ) : (
          <div className="pt-10">
            {catalog.length === 0 ? (
              <EmptyState />
            ) : (
              shelves().map((shelf, index, all) => (
                <Shelf
                  key={shelf.feelingId}
                  index={index}
                  total={all.length}
                  heading={shelf.label}
                  blurb={shelf.blurb}
                  href={queryHref({ feelings: [shelf.feelingId], places: [] })}
                  items={shelf.items}
                  member={member}
                />
              ))
            )}
          </div>
        )}
      </main>
    </>
  );
}

/**
 * One emotional-context row: a draggable rail rather than a page-wide grid.
 *
 * Six shelves as grids would be a wall of ninety cards; as rails they read as
 * six curated choices, each one card-deep until you commit. The rail itself
 * (components/browse/Rail.tsx) owns the affordances that keep the overflow
 * honest — peek, scrims, arrows, progress.
 */
function Shelf({
  index,
  total,
  heading,
  blurb,
  href,
  items,
  member,
}: {
  index: number;
  total: number;
  heading: string;
  blurb: string;
  href: string;
  items: CatalogItem[];
  member: boolean;
}) {
  const headingId = `shelf-${heading.toLowerCase()}`;
  // A shelf that already shows everything it has needs no door at the end and
  // no "show all" — offering to reveal the card you are looking at reads as a
  // mistake, and it is the kind of empty affordance that teaches people to
  // stop trusting the other ones.
  const complete = items.length < 3;

  return (
    <section aria-labelledby={headingId} className="mb-16 sm:mb-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="font-display text-xs tabular-nums tracking-[0.3em] text-stone-dim">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <h2
            id={headingId}
            className="mt-1.5 font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-balance text-stone">
            {blurb}
          </p>
        </div>

        {/* Second route to the same place as the end-cap tile, for anyone who
            decides before they scroll. Sized to the 44px touch minimum. */}
        {!complete && (
          <Link
            href={href}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
          >
            Show all {items.length}
          </Link>
        )}
      </div>

      <Reveal>
        <Rail label={heading}>
          {items.map((item) => (
            <RailItem key={item.id}>
              <CatalogCard
                item={item}
                unlocked={member}
                sizes={RAIL_ITEM_SIZES}
              />
            </RailItem>
          ))}
          {!complete && (
            <RailItem>
              <ShelfEndCap heading={heading} href={href} count={items.length} />
            </RailItem>
          )}
        </Rail>
      </Reveal>
    </section>
  );
}

/**
 * The tile that closes every rail. Reaching the end of a row is the moment a
 * visitor is most likely to want more of exactly this feeling, so the row ends
 * in a door rather than a dead stop — and it doubles as an unmistakable "that
 * was the last card" marker.
 */
function ShelfEndCap({
  heading,
  href,
  count,
}: {
  heading: string;
  href: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      data-reveal-item
      className="group flex h-full min-h-56 flex-col items-start justify-end gap-2 rounded-lg border border-dashed border-hairline bg-charcoal/40 p-5 transition-colors duration-(--duration-standard) hover:border-amber/50 hover:bg-charcoal/70"
    >
      <span className="font-display text-3xl font-light tabular-nums text-amber/80 transition-colors duration-(--duration-quick) group-hover:text-amber">
        {count}
      </span>
      <span className="font-display text-lg leading-tight text-ivory">
        Everything in {heading}
      </span>
      <span className="text-sm text-stone">
        Open the full set
        <span
          aria-hidden
          className="ml-1 inline-block transition-transform duration-(--duration-quick) group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-hairline bg-charcoal/50 p-10 text-center">
      <p className="text-stone">
        Nothing in the vault matches that yet. More of Luna&rsquo;s world is
        still being filmed.
      </p>
      <Link
        href="/browse"
        className="mt-4 inline-block text-sm text-amber underline decoration-hairline underline-offset-4"
      >
        Clear the filters
      </Link>
    </div>
  );
}

/** Human-readable summary of the active filters, e.g. "in hurt or lies · at the park". */
function describe(query: CatalogQuery): string {
  const parts: string[] = [];

  if (query.feelings.length) {
    const labels = query.feelings.map((id) => getFeeling(id)?.label ?? id);
    parts.push(`in ${joinOr(labels).toLowerCase()}`);
  }
  if (query.places.length) {
    const labels = query.places.map((id) => getPlace(id)?.label ?? id);
    parts.push(`at ${joinOr(labels).toLowerCase()}`);
  }

  return parts.join(" · ");
}

function joinOr(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
}
