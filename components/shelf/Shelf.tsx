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
import { PAGE } from "@/components/ui/layout";

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
  /**
   * Replaces the "See all" link in the top-right corner.
   *
   * It exists for the Season 1 row, which has nowhere to send anybody yet and
   * one genuinely useful thing to say instead — that a membership is how you
   * watch it. Taking over the slot rather than adding a second control keeps
   * the row to one action, which is the reason the shelves read cleanly.
   */
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Shelf({
  title,
  href,
  linkLabel,
  note,
  action,
  children,
}: ShelfProps) {
  const id = `shelf-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  /*
   * THE HEADING AND THE RAIL SHARE ONE CONTAINER, and they have to.
   *
   * Rail's scroller carries `-mx-5 px-5` (and `sm:-mx-2 sm:px-2`): the negative
   * margin pulls it out past its parent's padding so cards can scroll to the
   * screen edge, and its own matching padding puts the FIRST card back on the
   * parent's content edge. That only lands correctly when the parent is the
   * padded box — which is how /browse has always used it.
   *
   * The first version of this file padded the heading's own div and left
   * <Rail> as a bare sibling with no container at all. The result was exactly
   * what Melissa spotted on 2026-09-16: the titles sat 20px (32px at sm) in
   * from the posters underneath them. Wrapping both is the fix; nudging the
   * heading would have been correcting a symptom and would have broken again
   * the moment either padding changed.
   */
  return (
    <section aria-labelledby={id} className="pt-10 sm:pt-14">
      <div className={PAGE}>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            {/* BIGGER AND HEAVIER THAN IT WAS (2026-09-16, "we need bolder and
                bigger copy i think"). A row heading has to win against the
                poster art directly under it, and at text-xl/medium it was
                losing — the page read as a wall of pictures with captions
                rather than as a set of shelves. */}
            <h2
              id={id}
              className="font-display text-2xl font-semibold tracking-tight text-ivory sm:text-3xl"
            >
              {title}
            </h2>
            {note && (
              <p className="mt-1.5 text-sm leading-relaxed text-stone sm:text-base">
                {note}
              </p>
            )}
          </div>

          {action ??
            (href && (
              <Link
                href={href}
                className="shrink-0 text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                {linkLabel ?? "See all"} <span aria-hidden="true">→</span>
              </Link>
            ))}
        </div>

        <Rail label={title}>{children}</Rail>
      </div>
    </section>
  );
}
