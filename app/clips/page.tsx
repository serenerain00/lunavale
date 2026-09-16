import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ClipCard } from "@/components/shelf/ClipCard";
import { PAGE } from "@/components/ui/layout";
import { inStoryOrder, inReleaseOrder } from "@/lib/content/chronology";
import { getCategory, clipsInCategory, categories } from "@/lib/content/categories";
import { formatDuration } from "@/lib/content/videos";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Clips",
  description:
    "Every clip from Between Us, in the order it happens. Start at the beginning and watch it through.",
  path: "/clips",
});

export const revalidate = 3600;

/**
 * The clip library.
 *
 * THIS PAGE DID NOT EXIST UNTIL 2026-09-16. The clips lived at /watch/<slug>
 * with no index at all — the only ways in were the home page rail, the
 * filter-by-feeling catalog at /browse, and a link somebody had been sent. So
 * there was no answer to the most ordinary question a visitor has, which is
 * "show me all of them, from the start".
 *
 * ORDER IS THE POINT, AND IT IS THE DEFAULT. Story order — see
 * lib/content/chronology.ts, which derives it from the journal rather than
 * inventing it. Newest-first is one click away because that is the other
 * thing people look for, but it is not what the page opens on: somebody
 * arriving at a library of 46 pieces they have never seen is not looking for
 * the most recent one, they are looking for the first one.
 *
 * THE SORT IS A LINK, NOT A CLIENT TOGGLE. `?sort=latest` keeps both views
 * static, shareable and crawlable, and keeps this page out of the dynamic,
 * uncacheable category that cost $118 a month the last time the home page fell
 * into it. No state, no hydration, no flash of the wrong order.
 *
 * A GRID RATHER THAN SHELVES, because this is the place you come to see all of
 * it at once. The home page uses rails; an index that made you scroll 46 cards
 * sideways would be hiding its own contents.
 */
export default async function ClipsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>;
}) {
  const { sort, category } = await searchParams;
  const latest = sort === "latest";

  // The category rows on the home page open this page filtered. An unknown id
  // falls back to everything rather than to an empty page or a 404 — a
  // hand-edited URL should land somewhere useful.
  const picked = category ? getCategory(category) : undefined;
  const base = latest ? inReleaseOrder() : inStoryOrder();
  const clips = picked
    ? (() => {
        const ids = new Set(clipsInCategory(picked.id).map((v) => v.slug));
        return base.filter((v) => ids.has(v.slug));
      })()
    : base;

  // Positions always come from the story, never from the row the card sits in.
  // In the latest view the numbers jump around, which is correct and useful:
  // it shows you where a new clip belongs.
  const positionOf = new Map(inStoryOrder().map((v, i) => [v.slug, i + 1]));

  return (
    <>
      <SiteHeader />

      <main className={`${PAGE} flex-1 pb-24`}>
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Between Us
          </p>
          {/*
            WAS "The story so far, in order." — Melissa, 2026-09-16: "its not
            really in order, lets just say a peek into whats coming."

            She is right, and the overclaim was in the noun as much as the
            adverb. These are moments, not episodes: they do not add up to a
            continuous story you could watch end to end, so calling them "the
            story so far" promised something the library does not deliver, and
            somebody who started at the top and hit a gap would have been
            right to feel misled.

            The sequence is still real and still useful, so it stays — as an
            arrangement the page offers, not as a claim that it is complete.
          */}
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] tracking-tight text-ivory sm:text-6xl">
            {picked ? picked.label : "A peek at what\u2019s coming."}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone sm:text-xl">
            {picked?.note ??
              "These are moments from the series \u2014 the ones already shot, arranged the way they happen to Luna rather than the way they went up. Start anywhere. Each one stands on its own."}
          </p>
        </header>

        {/* Sort keeps whichever category is on, so switching order does not
            silently drop the filter the visitor arrived with. */}
        <div
          role="group"
          aria-label="Sort"
          className="mb-6 inline-flex rounded-full border border-hairline p-1"
        >
          <SortLink href={href({ category, sort: undefined })} active={!latest}>
            In order
          </SortLink>
          <SortLink href={href({ category, sort: "latest" })} active={latest}>
            Latest
          </SortLink>
        </div>

        {/* Every category, always — this is the page's own navigation, and a
            filtered view has to offer the way back to everything. */}
        <nav aria-label="Categories" className="mb-8 flex flex-wrap gap-2">
          <Chip href={href({ category: undefined, sort })} active={!picked}>
            Everything
          </Chip>
          {categories().map((c) => (
            <Chip
              key={c.id}
              href={href({ category: c.id, sort })}
              active={picked?.id === c.id}
            >
              {c.label}
            </Chip>
          ))}
        </nav>

        <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clips.map((v) => (
            <li key={v.slug}>
              <ClipCard
                href={`/clips/${v.slug}`}
                title={v.title}
                poster={v.poster}
                meta={formatDuration(v.durationSeconds)}
                position={positionOf.get(v.slug)}
                premium={v.access === "premium"}
                mature={v.mature}
              />
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone">
                {v.synopsis}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

/** Builds a /clips URL, dropping empty params rather than writing `?sort=`. */
function href({
  category,
  sort,
}: {
  category?: string;
  sort?: string;
}): string {
  const q = new URLSearchParams();
  if (category) q.set("category", category);
  if (sort) q.set("sort", sort);
  const s = q.toString();
  return s ? `/clips?${s}` : "/clips";
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-9 items-center rounded-full border px-4 text-sm transition-colors duration-(--duration-quick) ${
        active
          ? "border-amber bg-amber/10 text-amber"
          : "border-hairline text-stone hover:border-amber hover:text-amber"
      }`}
    >
      {children}
    </Link>
  );
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm transition-colors duration-(--duration-quick) ${
        active
          ? "bg-ivory text-void"
          : "text-stone hover:text-amber"
      }`}
    >
      {children}
    </Link>
  );
}
