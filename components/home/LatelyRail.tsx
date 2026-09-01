/**
 * LatelyRail — what has gone up lately, as art rather than as a list.
 *
 * WHAT THIS REPLACED, and why. The section used to be a dense table: date,
 * kind, title, runtime, access, seven rows deep. It was accurate and it read
 * like a changelog — five columns of small text on a page whose whole argument
 * is that this is a film. Melissa's call, 2026-08-25: make it a carousel, let
 * a card open, and lead with the picture.
 *
 * THE DATA IS STILL DERIVED. Nothing here is hand-listed; it is the same
 * `recentReleases()` feed (lib/content/releases.ts), so the honesty property
 * that section was built for survives the redesign — the row cannot show
 * something that is not really published, and it goes quiet on its own if the
 * pace stops.
 *
 * TWO KINDS OF CARD, because there are two kinds of thing and pretending
 * otherwise would cost more than it saves. A scene is a poster. A journal page
 * is a sheet of paper in her hand — the same treatment JournalCard uses on the
 * index, so a visitor who has seen one recognizes the other. That difference
 * does the work the "SCENE / JOURNAL" column used to do, without the column.
 *
 * A CARD IS A REAL LINK FIRST. The click is intercepted to open the detail
 * panel, but the element is an anchor with a working href, so the row is
 * crawlable, middle-clickable, and still navigates with JavaScript off. The
 * expansion is an enhancement on top of a page that works without it.
 *
 * The panel follows the lightbox already in components/browse/StillWall.tsx —
 * same Escape handling, same body-scroll lock, same click-outside-to-close —
 * so the two full-screen surfaces on the site behave identically.
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rail, RailItem, RAIL_ITEM_SIZES } from "@/components/browse/Rail";
import { formatReleaseDate, type Release } from "@/lib/content/releases";
import { formatDuration } from "@/lib/content/videos";

interface LatelyRailProps {
  drops: Release[];
  /** Accessible name for the rail, from the heading above it. */
  label: string;
}

export function LatelyRail({ drops, label }: LatelyRailProps) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) =>
      setOpen((i) =>
        i === null ? i : (i + delta + drops.length) % drops.length,
      ),
    [drops.length],
  );

  return (
    <>
      <Rail label={label}>
        {drops.map((drop, i) => (
          <RailItem key={`${drop.kind}-${drop.href}`}>
            <ReleaseCard
              drop={drop}
              onOpen={() => setOpen(i)}
            />
          </RailItem>
        ))}
      </Rail>

      {open !== null && (
        <ReleasePanel
          drop={drops[open]}
          position={{ index: open, total: drops.length }}
          onStep={step}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ cards */

function ReleaseCard({
  drop,
  onOpen,
}: {
  drop: Release;
  onOpen: () => void;
}) {
  return (
    <Link
      href={drop.href}
      data-reveal-item
      onClick={(e) => {
        // Leave every modified click alone — a new tab, a new window and a
        // download are all people deliberately asking for the page itself.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        onOpen();
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden">
        {drop.poster ? (
          <>
            <Image
              src={drop.poster}
              alt=""
              fill
              sizes={RAIL_ITEM_SIZES}
              className="object-cover brightness-90 transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-100"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/10 to-transparent" />
          </>
        ) : (
          <PaperFace drop={drop} />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${
              drop.access === "free" ? "text-stone" : "text-amber-soft"
            }`}
          >
            {drop.access === "free" ? "Free" : "Members"}
          </span>
          {drop.mature && (
            <span className="rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium text-stone backdrop-blur-sm">
              Mature
            </span>
          )}
        </div>

        {drop.durationSeconds !== undefined && (
          <span className="absolute bottom-3 right-3 rounded bg-void/70 px-2 py-0.5 text-xs tabular-nums text-stone backdrop-blur-sm">
            {formatDuration(drop.durationSeconds)}
          </span>
        )}
      </div>

      {/* A JOURNAL CARD SAYS EVERYTHING ONCE. The paper above already carries
          her opening line in her own hand, so printing it again underneath in
          the site's typeface would be the same sentence twice on one card —
          and the handwriting is the better of the two. A scene has no such
          overlap: the poster is a picture and the synopsis is words. */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.7rem] uppercase tracking-[0.14em] text-stone-dim">
          {formatReleaseDate(drop.date)} ·{" "}
          {drop.kind === "scene" ? "Scene" : "Journal"}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-medium leading-tight text-ivory">
          {drop.title}
        </h3>
        {drop.where && (
          <p className="mt-1 text-sm text-stone-dim">{drop.where}</p>
        )}
        {drop.kind === "scene" && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone">
            {drop.blurb}
          </p>
        )}
      </div>
    </Link>
  );
}

/**
 * The card face for a journal page: ruled paper and her handwriting, the same
 * sheet JournalCard puts on the index. Deliberately NOT a gray placeholder and
 * not a borrowed film still — a page you can see the handwriting of and cannot
 * read is a better argument than either, and it is what the thing actually is.
 */
function PaperFace({ drop }: { drop: Release }) {
  return (
    <div className="absolute inset-0 bg-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(47,58,74,0.11) 21px 22px)",
          backgroundPosition: "0 2.5rem",
        }}
      />
      {/* The top of the sheet is left clear for the access badge, which sits
          at the same corner on every card in the rail. Without the inset the
          badge lands on her first line and the one thing the paper is for —
          being readable handwriting — is the thing it covers. */}
      <div className="relative px-4 pb-4 pt-12">
        <p className="font-hand line-clamp-3 text-xl leading-[1.375rem] text-ink">
          {drop.blurb}
        </p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper-shade to-transparent"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ panel */

function ReleasePanel({
  drop,
  position,
  onStep,
  onClose,
}: {
  drop: Release;
  position: { index: number; total: number };
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onStep, onClose]);

  const scene = drop.kind === "scene";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={drop.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-void/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-8"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-charcoal outline-none ring-1 ring-hairline"
      >
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {drop.poster ? (
            <Image
              src={drop.poster}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          ) : (
            <PaperFace drop={drop} />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-amber">
            {formatReleaseDate(drop.date)} ·{" "}
            {scene ? "Scene" : "Journal"}
            {drop.durationSeconds !== undefined && (
              <> · {formatDuration(drop.durationSeconds)}</>
            )}
            {drop.access === "premium" && <> · Members</>}
            {drop.mature && <> · Mature</>}
          </p>

          <h3 className="mt-3 font-display text-2xl font-light leading-tight text-ivory sm:text-3xl">
            {drop.title}
          </h3>
          {drop.where && (
            <p className="mt-1 text-sm text-stone-dim">{drop.where}</p>
          )}

          <p
            className={`mt-4 leading-relaxed ${
              scene ? "text-stone" : "font-hand text-2xl text-ivory"
            }`}
          >
            {scene ? drop.blurb : `“${drop.blurb}”`}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href={drop.href}
              className="inline-flex min-h-11 items-center rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white"
            >
              {scene ? "Watch the scene" : "Read the page"}
            </Link>
            <span className="text-xs tabular-nums text-stone-dim">
              {position.index + 1} / {position.total}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full border border-hairline bg-void/70 text-ivory backdrop-blur-md transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
