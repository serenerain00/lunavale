/**
 * One beat's run of attempts — the tiles, and the player they open into.
 *
 * The row IS the argument. Fourteen tiles in the order they were made, one of
 * them starred, tells you the good frame was chosen rather than found, and it
 * does that without a word of commentary. So the tile is deliberately plain:
 * a frame, a number, and a star if it made the cut. Nothing ranks the failures
 * against each other, because that is not the story.
 *
 * Playback is click-to-play, one take at a time, into a single player above
 * the row. Fourteen <video> elements each fetching a signed URL would be
 * fourteen requests for footage nobody asked to see yet, and any of them
 * autoplaying would break the content rule outright.
 */
"use client";

import { useState } from "react";
import type { TakeBeat } from "@/lib/content/takes";

interface TakeReelProps {
  beat: TakeBeat;
  /**
   * Poster URLs by take slug, signed in one batch while the page rendered.
   * Absent in local development, where there is no Blob to sign against and
   * /api/take reads the file off disk instead. See lib/media/presign.ts.
   */
  posters?: Record<string, string>;
}

export function TakeReel({ beat, posters }: TakeReelProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const open = beat.takes.find((t) => t.slug === openSlug) ?? null;
  const usedCount = beat.takes.filter((t) => t.used).length;

  function show(slug: string) {
    setFailed(false);
    setOpenSlug((current) => (current === slug ? null : slug));
  }

  return (
    <section className="mt-8 first:mt-0">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-display text-lg font-light text-ivory">
          {beat.label}
        </h3>
        <p className="text-xs text-stone-dim">
          {beat.takes.length} {beat.takes.length === 1 ? "take" : "takes"}
          {usedCount === 0 && " · none used"}
        </p>
      </header>

      {open && (
        <div className="mt-3 overflow-hidden rounded-lg bg-black ring-1 ring-hairline">
          <div className="relative aspect-video">
            {failed ? (
              <div className="flex h-full w-full items-center justify-center p-6 text-center">
                <p className="text-sm leading-relaxed text-stone">
                  This take won&rsquo;t play right now.
                </p>
              </div>
            ) : (
              <video
                key={open.slug}
                className="h-full w-full bg-black"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                aria-label={`${beat.label} — take ${open.n}`}
                onError={() => setFailed(true)}
              >
                <source src={`/api/stream/${open.slug}`} type="video/mp4" />
              </video>
            )}
          </div>
          <p className="flex items-center gap-2 px-3 py-2 text-xs text-stone-dim">
            <span className="tabular-nums">
              Take {String(open.n).padStart(2, "0")}
            </span>
            {open.used && (
              <span className="text-amber">· in the finished scene</span>
            )}
          </p>
        </div>
      )}

      <ul className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2">
        {beat.takes.map((take) => {
          const isOpen = take.slug === openSlug;
          return (
            <li key={take.slug} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => show(take.slug)}
                aria-pressed={isOpen}
                className={`group relative block w-32 overflow-hidden rounded-md ring-1 transition-colors duration-(--duration-quick) sm:w-40 ${
                  isOpen
                    ? "ring-amber"
                    : "ring-hairline hover:ring-stone-dim"
                }`}
              >
                {/* Not next/image: these are gated, per-request, short-lived
                    signed URLs. The optimizer would want to cache them at a
                    stable public path, which is the one thing they must not
                    have. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posters?.[take.slug] ?? `/api/take/${take.slug}`}
                  alt={`${beat.label} — take ${take.n}${
                    take.used ? ", the one in the finished scene" : ""
                  }`}
                  loading="lazy"
                  decoding="async"
                  className={`aspect-video w-full bg-charcoal object-cover transition-opacity duration-(--duration-quick) ${
                    take.used ? "" : "opacity-75 group-hover:opacity-100"
                  }`}
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-void/75 px-1.5 py-0.5 text-[0.65rem] tabular-nums text-stone backdrop-blur-sm">
                  {String(take.n).padStart(2, "0")}
                </span>
                {take.used && (
                  <span
                    className="absolute right-1.5 top-1.5 rounded bg-void/75 px-1.5 py-0.5 text-[0.65rem] text-amber backdrop-blur-sm"
                    title="In the finished scene"
                  >
                    ★
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
