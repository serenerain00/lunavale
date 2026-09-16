import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ClipCard } from "@/components/shelf/ClipCard";
import { inStoryOrder, inReleaseOrder } from "@/lib/content/chronology";
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
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const latest = sort === "latest";
  const clips = latest ? inReleaseOrder() : inStoryOrder();

  // Positions always come from the story, never from the row the card sits in.
  // In the latest view the numbers jump around, which is correct and useful:
  // it shows you where a new clip belongs.
  const positionOf = new Map(inStoryOrder().map((v, i) => [v.slug, i + 1]));

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-[100rem] flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Between Us
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            The story so far, in order.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            These are the pieces season one comes out of. They were made in one
            order and they happen in another — this is the one they happen in,
            so you can start at the top and watch straight through.
          </p>
        </header>

        <div
          role="group"
          aria-label="Sort"
          className="mb-8 inline-flex rounded-full border border-hairline p-1"
        >
          <SortLink href="/clips" active={!latest}>
            In order
          </SortLink>
          <SortLink href="/clips?sort=latest" active={latest}>
            Latest
          </SortLink>
        </div>

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
