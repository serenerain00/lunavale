/**
 * ClipCard — one clip on a shelf, with its place in the story on it.
 *
 * WHY THE NUMBER. The whole point of the 2026-09-16 reorder is that these now
 * run in the order they happen, and an order nobody can see is not an order.
 * The number is the cheapest possible way to say "this is the fourth thing
 * that happens", and it is what lets somebody pick the row back up three days
 * later without having to remember a title.
 *
 * It is omitted — not faked — where there is no position, which is how the
 * posts shelf and the trailer reuse this card without lying about a sequence
 * they are not part of.
 *
 * ACCESS IS A SIGNPOST, NOT A GATE, and it is rendered the way CatalogCard
 * renders it: both states ship inside the cached HTML and the client shows the
 * right one, so this card never forces the page it sits on to become dynamic.
 * Whether the bytes arrive is decided server-side by /api/stream and is
 * untouched by anything here.
 */

import Image from "next/image";
import Link from "next/link";
import { Guest } from "@/components/access/Viewer";
import { RAIL_ITEM_SIZES } from "@/components/browse/Rail";

export interface ClipCardProps {
  href: string;
  title: string;
  poster: string;
  /** Runtime, already formatted — "4:11". */
  meta?: string;
  /** Position in the story. Omit where there isn't one. */
  position?: number;
  premium?: boolean;
  mature?: boolean;
  /** Vertical art (a post) rather than 16:9. */
  portrait?: boolean;
  /** Nothing to play yet — renders flat and does not pretend to be a link. */
  comingSoon?: boolean;
}

export function ClipCard({
  href,
  title,
  poster,
  meta,
  position,
  premium,
  mature,
  portrait,
  comingSoon,
}: ClipCardProps) {
  const art = (
    <div
      className={`relative overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline ${
        portrait ? "aspect-[9/16]" : "aspect-video"
      }`}
    >
      <Image
        src={poster}
        alt=""
        fill
        sizes={RAIL_ITEM_SIZES}
        className={`object-cover transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] ${
          premium
            ? "brightness-[0.55] [html[data-member]_&]:brightness-90 [html[data-member]_&]:group-hover:brightness-100"
            : "brightness-90 group-hover:brightness-100"
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/10 to-transparent" />

      {position !== undefined && (
        <span className="absolute left-3 top-3 rounded bg-void/75 px-2 py-0.5 text-xs font-medium tabular-nums text-ivory backdrop-blur-sm">
          {position}
        </span>
      )}

      <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5">
        {premium && (
          <Guest>
            <span className="rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium text-amber-soft backdrop-blur-sm">
              Members
            </span>
          </Guest>
        )}
        {mature && (
          <span className="rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium text-stone backdrop-blur-sm">
            Mature
          </span>
        )}
      </div>

      {meta && (
        <span className="absolute bottom-3 right-3 rounded bg-void/70 px-2 py-0.5 text-xs tabular-nums text-stone backdrop-blur-sm">
          {meta}
        </span>
      )}

      {comingSoon && (
        <span className="absolute inset-x-3 bottom-3 rounded bg-void/80 px-2.5 py-1.5 text-center text-xs font-medium text-amber-soft backdrop-blur-sm">
          Coming soon
        </span>
      )}
    </div>
  );

  const caption = (
    <p className="mt-2.5 truncate text-sm text-ivory">{title}</p>
  );

  // No destination, no anchor. A "coming soon" card that navigates nowhere is
  // worse than one that plainly is not a link.
  if (comingSoon) {
    return (
      <div className="group block">
        {art}
        {caption}
      </div>
    );
  }

  return (
    <Link href={href} className="group block">
      {art}
      {caption}
    </Link>
  );
}
