/**
 * StillWall — the web-side view of an in-world still gallery.
 *
 * A grid of stills that opens into a full-view lightbox. Deliberately quiet:
 * no auto-advance, no captions competing with the image, the page behind it
 * dimmed rather than replaced.
 *
 * Two things it refuses to do:
 *   - dump forty stills on a phone. The wall opens with a readable handful and
 *     a "Show all" that expands in place, so the page has a scannable length
 *     before it has a complete one.
 *   - make touch visitors aim at small arrows. The lightbox is swipeable, and
 *     the controls are sized for thumbs and kept clear of the home indicator.
 */
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface StillWallProps {
  images: string[];
  /** Used to build meaningful alt text, e.g. "Dinner — still 3 of 14". */
  title: string;
}

/** Stills shown before the wall asks to be expanded. Two full rows at lg. */
const INITIAL_COUNT = 8;
/** Horizontal travel (px) that commits a swipe to the next still. */
const SWIPE_THRESHOLD = 56;

export function StillWall({ images, title }: StillWallProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  // Where focus goes when the lightbox closes — the thumbnail that opened it.
  const openerRef = useRef<HTMLButtonElement | null>(null);
  // First still revealed by "Show all", so focus can land on the new content.
  const firstRevealedRef = useRef<HTMLButtonElement | null>(null);

  const truncated = !expanded && images.length > INITIAL_COUNT;
  const visible = truncated ? images.slice(0, INITIAL_COUNT) : images;
  const hiddenCount = images.length - INITIAL_COUNT;

  const close = useCallback(() => {
    setOpenIndex(null);
    openerRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + images.length) % images.length,
      ),
    [images.length],
  );

  const showAll = () => {
    setExpanded(true);
    // Announce the new content by moving focus to it rather than leaving the
    // visitor at a button that just disappeared.
    requestAnimationFrame(() => firstRevealedRef.current?.focus());
  };

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              ref={i === INITIAL_COUNT ? firstRevealedRef : undefined}
              onClick={(e) => {
                openerRef.current = e.currentTarget;
                setOpenIndex(i);
              }}
              aria-label={`Open still ${i + 1} of ${images.length}`}
              className="group relative block aspect-video w-full overflow-hidden rounded-md bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover brightness-90 transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-105"
              />
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
            Show all {images.length} stills
            <span className="ml-2 text-stone">+{hiddenCount}</span>
          </button>
        </div>
      )}

      {openIndex !== null && (
        <Lightbox
          images={images}
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
  images,
  index,
  title,
  onStep,
  onClose,
}: {
  images: string[];
  index: number;
  title: string;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // The ref is the source of truth for the gesture; the state exists only so
  // the image can be painted mid-drag. Deciding from state would read a stale
  // value whenever move and up land in the same task.
  const [dragX, setDragX] = useState(0);
  const swipe = useRef({ active: false, startX: 0, startY: 0, dx: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);

    // Lock the page behind the overlay so scrolling doesn't leak through.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onStep, onClose]);

  /* Swipe. The image tracks the finger so the gesture is discoverable by
     accident — the first half-swipe teaches that swiping works. */

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { active: true, startX: e.clientX, startY: e.clientY, dx: 0 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const state = swipe.current;
    if (!state.active) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    // Vertical intent isn't a swipe — let it go rather than fighting it.
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
      aria-label={`${title} — still ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overscroll-contain bg-void/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-5xl touch-pan-y outline-none"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/*
          Stills vary in aspect ratio, so this renders at natural proportions
          rather than being forced into a fixed box. The files are already
          compressed web copies (see scripts/optimize-media.sh).
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${title} — still ${index + 1} of ${images.length}`}
          draggable={false}
          style={{
            transform: `translateX(${dragX}px)`,
            // Snap back under its own power; follow the finger 1:1 while held.
            transition: dragX === 0 ? "transform 300ms var(--ease-standard)" : "none",
          }}
          className="mx-auto max-h-[70vh] w-auto max-w-full select-none rounded-lg object-contain sm:max-h-[78vh]"
        />

        <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6">
          <StepButton label="Previous still" onClick={() => onStep(-1)}>
            ‹
          </StepButton>
          <span className="min-w-16 text-center text-sm tabular-nums text-stone">
            {index + 1} / {images.length}
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
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-11 items-center rounded-full border border-hairline bg-void/70 px-5 text-sm text-stone backdrop-blur-sm transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber sm:right-8 sm:top-8"
      >
        Close
      </button>
    </div>
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
