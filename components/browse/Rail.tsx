/**
 * Rail — the horizontal collection slider used across the catalog.
 *
 * The problem it solves: a plain `overflow-x-auto` row hides content with no
 * affordance. On desktop there is often no visible scrollbar at all, so cards
 * past the edge simply cease to exist for the visitor.
 *
 * So the rail makes hidden content *visible as hidden*:
 *   - the next card always peeks past the edge (Gestalt continuity — a cut-off
 *     shape reads as "there is more"; a flush edge reads as "that's all")
 *   - a scrim fades in on whichever side still has content
 *   - arrow controls appear only when there is somewhere to go, and vanish at
 *     each end, so the control state always matches the content state
 *   - a progress bar reports both position and how much row there is
 *
 * Interaction is layered so every input gets its native best:
 *   touch → platform momentum scrolling and snap, never intercepted
 *   mouse → click-drag like a product slider, plus arrow buttons
 *   keys  → tab walks the cards and the browser scrolls them in; ← / → page
 *           the rail when focus is inside it
 *
 * Reduced motion is honoured: paging jumps instead of animating.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RailProps {
  children: React.ReactNode;
  /** Accessible name for the group, e.g. the shelf heading. */
  label: string;
}

/** Remaining scroll below this many pixels counts as "at the edge". */
const EDGE_EPSILON = 2;
/** Drag distance (px) past which the pointer-up must not count as a click. */
const DRAG_SLOP = 6;

interface Metrics {
  /** Pixels of content hidden to the left and to the right. */
  start: number;
  end: number;
  /** Visible fraction of the row, 0–1. Exactly 1 means nothing is hidden. */
  ratio: number;
}

const NO_OVERFLOW: Metrics = { start: 0, end: 0, ratio: 1 };

export function Rail({ children, label }: RailProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<Metrics>(NO_OVERFLOW);

  const overflowing = metrics.ratio < 1;
  const atStart = metrics.start <= EDGE_EPSILON;
  const atEnd = metrics.end <= EDGE_EPSILON;

  /* ------------------------------------------------------------- measuring */

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;

    const max = el.scrollWidth - el.clientWidth;
    setMetrics(
      max <= EDGE_EPSILON
        ? NO_OVERFLOW
        : {
            start: el.scrollLeft,
            end: max - el.scrollLeft,
            ratio: el.clientWidth / el.scrollWidth,
          },
    );
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    measure();
    el.addEventListener("scroll", measure, { passive: true });

    // Catches viewport resizes, font swaps and images settling in — each of
    // which changes how much of the row overflows.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure, children]);

  /* ---------------------------------------------------------------- paging */

  const page = useCallback((direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;

    // Step by whole cards so the row never comes to rest mid-card.
    const items = el.children;
    const stride =
      items.length > 1
        ? (items[1] as HTMLElement).offsetLeft -
          (items[0] as HTMLElement).offsetLeft
        : el.clientWidth;
    const perPage = Math.max(1, Math.floor(el.clientWidth / stride));

    el.scrollBy({
      left: direction * stride * perPage,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      page(e.key === "ArrowRight" ? 1 : -1);
    },
    [page],
  );

  /* -------------------------------------------------------------- dragging */

  const drag = useRef({
    active: false,
    captured: false,
    startX: 0,
    startScroll: 0,
    moved: 0,
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Touch and pen keep the platform's own scrolling — it beats anything
    // re-implemented here (momentum, rubber-banding, snap physics).
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scroller.current;
    if (!el || !overflowing) return;

    // Note what a drag *would* start from, but claim nothing yet — see the
    // capture comment in onPointerMove.
    drag.current = {
      active: true,
      captured: false,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = scroller.current;
    if (!state.active || !el) return;

    const dx = e.clientX - state.startX;
    state.moved = Math.max(state.moved, Math.abs(dx));

    if (!state.captured) {
      // Below the slop this is still a click, not a drag. Capturing here would
      // be a bug: while a pointer is captured, both pointerdown and pointerup
      // retarget to the capturing element, so the browser fires `click` on the
      // rail instead of the card and plain clicks stop navigating. Wait until
      // the movement proves intent, and only then take the pointer.
      if (state.moved <= DRAG_SLOP) return;
      state.captured = true;
      el.setPointerCapture(e.pointerId);
      // Snap fights a JS-driven scrollLeft; suspend it for the drag, then let
      // it settle the row onto the nearest card on release.
      el.style.scrollSnapType = "none";
      // A drag across cards otherwise leaves a trail of selected synopsis text.
      el.style.userSelect = "none";
    }

    el.scrollLeft = state.startScroll - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = scroller.current;
    if (!state.active || !el) return;

    state.active = false;
    if (!state.captured) return;
    state.captured = false;

    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.style.scrollSnapType = "";
    el.style.userSelect = "";
  };

  // A drag that happens to end on a card would otherwise navigate. Swallow it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved > DRAG_SLOP) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /*
    Images and links are natively draggable. Without this, pressing on a card
    and moving starts an HTML5 drag of the poster: the browser fires
    pointercancel, the rail stops following the cursor, and the visitor is left
    dragging a ghost image around the page. Cancelling dragstart at the rail
    covers every card in it, whatever it contains.
  */
  const onDragStart = (e: React.DragEvent) => e.preventDefault();

  return (
    <div>
      <div className="relative">
        {/*
          Full-bleed on mobile so the peeking card runs to the screen edge,
          while the first card still lines up with the heading above it.
          scroll-px matches the inset — without it, mandatory snapping scrolls
          straight past the padding and the row sits 20px out of alignment.
          The small desktop inset leaves room for card lift and focus rings.
        */}
        <div
          ref={scroller}
          role="group"
          aria-label={label}
          aria-roledescription="carousel"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={onDragStart}
          className={`rail-scroller -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 py-2 sm:-mx-2 sm:gap-5 sm:scroll-px-2 sm:px-2 ${
            overflowing ? "cursor-grab active:cursor-grabbing" : ""
          }`}
        >
          {children}
        </div>

        {/* Edge scrims — the quiet signal that the row continues. */}
        <Scrim side="start" visible={!atStart} />
        <Scrim side="end" visible={!atEnd} />

        {/* Pointer controls, sized to the 44px touch minimum. Hidden below sm,
            where the gesture is the interface and a button would only cover a
            card. They sit inside the rail so they can never push the page wide. */}
        {overflowing && (
          <>
            <Arrow
              direction={-1}
              hidden={atStart}
              label={`Scroll ${label} back`}
              onClick={() => page(-1)}
            />
            <Arrow
              direction={1}
              hidden={atEnd}
              label={`Scroll ${label} forward`}
              onClick={() => page(1)}
            />
          </>
        )}
      </div>

      {overflowing && <Progress metrics={metrics} />}
    </div>
  );
}

/** One item in a rail: sets the responsive width and the snap target. */
export function RailItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[78vw] max-w-80 shrink-0 snap-start sm:w-80">
      {children}
    </div>
  );
}

/** The responsive `sizes` hint that matches RailItem's width. */
export const RAIL_ITEM_SIZES = "(max-width: 640px) 78vw, 320px";

function Scrim({ side, visible }: { side: "start" | "end"; visible: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 -mx-5 w-14 transition-opacity duration-(--duration-quick) sm:-mx-2 sm:w-20 ${
        side === "start"
          ? "left-0 bg-gradient-to-r from-void via-void/70 to-transparent"
          : "right-0 bg-gradient-to-l from-void via-void/70 to-transparent"
      } ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}

function Arrow({
  direction,
  hidden,
  label,
  onClick,
}: {
  direction: 1 | -1;
  hidden: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={hidden}
      aria-label={label}
      className={`absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-hairline bg-void/85 text-ivory backdrop-blur-md transition-[opacity,color,border-color] duration-(--duration-quick) hover:border-amber hover:text-amber disabled:pointer-events-none disabled:opacity-0 sm:grid ${
        direction === -1 ? "left-0" : "right-0"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={direction === -1 ? "rotate-180" : undefined}
      >
        <path
          d="M9 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * How far through the row you are, and how much row there is. Presentational
 * only — the scroller itself is the control, so this stays hidden from AT.
 * No transition: it must track the finger frame-for-frame, not lag behind it.
 */
function Progress({ metrics }: { metrics: Metrics }) {
  const total = metrics.start + metrics.end;
  const travelled = total === 0 ? 0 : metrics.start / total;
  // Floor the thumb so a very long row still shows a grabbable-looking mark.
  const width = Math.max(metrics.ratio, 0.12);

  return (
    <div aria-hidden className="mt-3 h-px w-full overflow-hidden bg-hairline">
      <div
        className="h-px bg-amber/80"
        style={{
          width: `${width * 100}%`,
          transform: `translateX(${(travelled * (1 - width) * 100) / width}%)`,
        }}
      />
    </div>
  );
}
