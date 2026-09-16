/**
 * Shelf — a titled row of cards, the unit the whole home page is built from.
 *
 * WHAT IT REPLACED. The home page was fifteen bespoke sections, each with its
 * own heading treatment, its own grid, its own "see all" phrasing and its own
 * argument for existing. It read as an essay with pictures, and Melissa's
 * verdict on 2026-09-16 was the right one: "it's very text heavy… think
 * hulu/netflix." The fix is not less writing in fifteen shapes, it is one
 * shape repeated, because that is what makes a library scannable — you learn
 * the pattern once on the first row and every row after it is free.
 *
 * A SHELF IS A HEADING, AN OPTIONAL WAY TO SEE THE REST, AND CARDS. It has no
 * opinion about what the cards are, which is why the journal and the cast can
 * sit in the same page rhythm as the clips without being forced to look like
 * posters.
 *
 * NO PER-SHELF BLURB, ON PURPOSE. Every sentence that used to introduce a
 * section was a sentence between the visitor and the thing itself. If a row
 * needs explaining, the heading is wrong.
 *
 * The horizontal behaviour — peeking cards, edge scrims, arrows that disappear
 * at the ends, keyboard paging, reduced-motion — all comes from Rail, which
 * already solved it for the catalog.
 */

import Link from "next/link";
import { Rail } from "@/components/browse/Rail";

interface ShelfProps {
  /** The row's name. Short enough to scan, specific enough to mean something. */
  title: string;
  /** Where "See all" goes. Omit and no link renders. */
  href?: string;
  /** Overrides the "See all" wording when a row needs its own verb. */
  linkLabel?: string;
  /**
   * A single quiet line under the heading. Use it only where the row would
   * otherwise be misread — "in the order they happen" earns its place because
   * the order is the point and is invisible otherwise.
   */
  note?: string;
  children: React.ReactNode;
}

export function Shelf({ title, href, linkLabel, note, children }: ShelfProps) {
  const id = `shelf-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section aria-labelledby={id} className="pt-10 sm:pt-14">
      <div className="mx-auto mb-4 flex w-full max-w-[100rem] items-baseline justify-between gap-4 px-5 sm:px-8">
        <div className="min-w-0">
          <h2
            id={id}
            className="font-display text-xl font-medium text-ivory sm:text-2xl"
          >
            {title}
          </h2>
          {note && (
            <p className="mt-1 text-sm leading-relaxed text-stone">{note}</p>
          )}
        </div>

        {href && (
          <Link
            href={href}
            className="shrink-0 text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
          >
            {linkLabel ?? "See all"} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <Rail label={title}>{children}</Rail>
    </section>
  );
}
