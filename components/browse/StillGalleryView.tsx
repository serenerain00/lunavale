/**
 * StillGalleryView — the in-world view of a still gallery, with Luna's journal
 * threaded through it.
 *
 * It builds on the quiet StillWall idea (a grid that opens into a full-view
 * lightbox) and adds the two things this feature is about:
 *   - per-still captions and journal fragments, so her voice reaches people
 *     inside the images instead of only over in /journal;
 *   - members-only delivery. Gated stills come through /api/still, so they use a
 *     plain lazy <img>, never next/image — the image optimizer would cache an
 *     optimized copy at a public /_next/image URL and quietly undo the gate.
 *
 * Two things it refuses to do, inherited from StillWall:
 *   - dump the whole set on a phone (opens with a readable handful + "show all");
 *   - make touch visitors aim at small arrows (swipeable, thumb-sized controls,
 *     clear of the home indicator).
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ViewStillJournal {
  excerpt: string;
  href: string;
  dateline: string;
}

export interface ViewStill {
  /** Grid thumbnail src. */
  thumb: string;
  /** Full-size lightbox src. */
  full: string;
  caption?: string;
  journal?: ViewStillJournal;
}

interface StillGalleryViewProps {
  items: ViewStill[];
  /** Used for alt text and the lightbox label. */
  title: string;
  /** Gated stills use a plain <img>; free stills can use next/image. */
  gated: boolean;
}

/** Stills shown before the wall asks to be expanded. Two full rows at lg. */
const INITIAL_COUNT = 8;
/** Horizontal travel (px) that commits a swipe to the next still. */
const SWIPE_THRESHOLD = 56;

export function StillGalleryView({ items, title, gated }: StillGalleryViewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const firstRevealedRef = useRef<HTMLButtonElement | null>(null);

  const truncated = !expanded && items.length > INITIAL_COUNT;
  const visible = truncated ? items.slice(0, INITIAL_COUNT) : items;
  const hiddenCount = items.length - INITIAL_COUNT;

  const close = useCallback(() => {
    setOpenIndex(null);
    openerRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + items.length) % items.length,
      ),
    [items.length],
  );

  const showAll = () => {
    setExpanded(true);
    requestAnimationFrame(() => firstRevealedRef.current?.focus());
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((item, i) => (
          <li key={item.thumb}>
            <button
              type="button"
              ref={i === INITIAL_COUNT ? firstRevealedRef : undefined}
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setOpenIndex(i);
              }}
              aria-label={
                item.journal
                  ? `Open still ${i + 1} of ${items.length} — has a journal note`
                  : `Open still ${i + 1} of ${items.length}`
              }
              className="group relative block aspect-video w-full overflow-hidden rounded-md bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
            >
              {gated ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumb}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 size-full object-cover brightness-90 transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-105"
                />
              ) : (
                <Image
                  src={item.thumb}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover brightness-90 transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-105"
                />
              )}

              {/* A quiet marker that Luna wrote something on this frame. */}
              {item.journal && (
                <span
                  aria-hidden
                  className="absolute bottom-2 right-2 grid size-6 place-items-center rounded-full bg-void/70 text-amber-soft backdrop-blur-sm"
                >
                  <PenGlyph />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {truncated && (
        <div className="relative mt-6 text-center">
          <button
            type="button"
            onClick={showAll}
            className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
          >
            Show all {items.length} stills
            <span className="ml-2 text-stone">+{hiddenCount}</span>
          </button>
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          title={title}
          onStep={step}
          onClose={close}
        />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  title,
  onStep,
  onClose,
}: {
  items: ViewStill[];
  index: number;
  title: string;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const swipe = useRef({ active: false, startX: 0, startY: 0, dx: 0 });
  const current = items[index];

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

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { active: true, startX: e.clientX, startY: e.clientY, dx: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = swipe.current;
    if (!state.active) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (Math.abs(dy) > Math.abs(dx)) {
      state.active = false;
      state.dx = 0;
      setDragX(0);
      return;
    }
    state.dx = dx;
    setDragX(dx);
  };

  const onPointerUp = () => {
    const state = swipe.current;
    if (!state.active) return;
    state.active = false;
    if (Math.abs(state.dx) > SWIPE_THRESHOLD) onStep(state.dx < 0 ? 1 : -1);
    state.dx = 0;
    setDragX(0);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — still ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto overscroll-contain bg-void/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative my-auto w-full max-w-5xl touch-pan-y outline-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.full}
          alt={`${title} — still ${index + 1} of ${items.length}`}
          draggable={false}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: dragX === 0 ? "transform 300ms var(--ease-standard)" : "none",
          }}
          className="mx-auto max-h-[62vh] w-auto max-w-full select-none rounded-lg object-contain sm:max-h-[70vh]"
        />

        {current.caption && !current.journal && (
          <p className="mx-auto mt-4 max-w-2xl text-balance text-center leading-relaxed text-stone">
            {current.caption}
          </p>
        )}

        {current.journal && (
          <JournalFragment journal={current.journal} caption={current.caption} />
        )}

        <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
          <StepButton label="Previous still" onClick={() => onStep(-1)}>
            ‹
          </StepButton>
          <span className="min-w-16 text-center text-sm tabular-nums text-stone">
            {index + 1} / {items.length}
          </span>
          <StepButton label="Next still" onClick={() => onStep(1)}>
            ›
          </StepButton>
        </div>

        <p className="mt-3 text-center text-xs text-stone-dim sm:hidden">
          Swipe to move through the set
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-11 items-center rounded-full border border-hairline bg-void/70 px-5 text-sm text-stone backdrop-blur-sm transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber sm:right-8 sm:top-8"
      >
        Close
      </button>
    </div>
  );
}

/**
 * A journal fragment shown alongside the still it belongs to — her voice, in
 * the image. Handwriting stock so it reads as lifted straight from the journal,
 * with a way through to the full entry.
 */
function JournalFragment({
  journal,
  caption,
}: {
  journal: ViewStillJournal;
  caption?: string;
}) {
  return (
    <figure className="mx-auto mt-5 max-w-xl rounded-lg border-l-2 border-amber/50 bg-charcoal/60 px-5 py-4 backdrop-blur-sm">
      {caption && (
        <p className="mb-2 text-center text-sm leading-relaxed text-stone">
          {caption}
        </p>
      )}
      <blockquote className="font-hand text-xl leading-snug text-amber-soft sm:text-2xl">
        &ldquo;{journal.excerpt}&rdquo;
      </blockquote>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
        <span className="text-stone-dim">From Luna&rsquo;s journal — {journal.dateline}</span>
        <Link
          href={journal.href}
          className="text-amber transition-colors duration-(--duration-quick) hover:text-amber-soft"
        >
          Read the full entry →
        </Link>
      </figcaption>
    </figure>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 place-items-center rounded-full border border-hairline text-lg text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
    >
      <span aria-hidden>{children}</span>
    </button>
  );
}

function PenGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
