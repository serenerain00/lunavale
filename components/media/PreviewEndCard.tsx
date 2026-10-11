/**
 * The card over the last frame when a free preview ends — the "card" arm of
 * the preview-card experiment (lib/analytics/experiments.ts). The control arm
 * is today's behaviour: the player stops, and the panel below it opens.
 *
 * WHY OVER THE PLAYER. On a phone the panel below is usually off-screen when
 * the preview stops, so the moment somebody is most interested ends on a
 * frozen frame and nothing else — 52 taps that did nothing on the Pilot in
 * three days (docs/conversion/INSTAGRAM_FIRST_VISIT_AUDIT.md).
 *
 * WHAT IT REFUSES, per CLAUDE.md: no countdown, no blur over the picture, no
 * "only today", no pressure. It states what they watched, what the rest
 * costs, that they can leave any time, and it can be dismissed in one tap —
 * after which the frame and the player's own controls are exactly as before.
 */
"use client";

import Link from "next/link";
import { trackOnce } from "@/components/analytics/experiments";

export function PreviewEndCard({
  watched,
  title,
  price,
  onDismiss,
}: {
  /** e.g. "the first 1:00 of 18:36" — said exactly as the page says it. */
  watched: string;
  title: string;
  /** e.g. "$8" */
  price: string;
  onDismiss: () => void;
}) {
  return (
    <div
      role="region"
      aria-label="Keep watching"
      aria-live="polite"
      className="absolute inset-0 z-10 flex items-center justify-center bg-void/95 p-3 text-center sm:bg-void/85 sm:p-5"
    >
      <div className="max-w-sm">
        {/* The eyebrow is dropped on phones: a 16:9 player at 390px is ~200px
            tall, and every line above the buttons pushes them into the
            native controls. */}
        <p className="hidden text-xs uppercase tracking-[0.2em] text-amber sm:block">Keep watching</p>
        <p className="font-display text-lg leading-snug text-ivory sm:mt-3 sm:text-2xl">
          That was {watched}.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-stone sm:mt-2 sm:text-sm">
          The rest of {title} is for members — {price} a month, cancel any time.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3">
          <Link
            href="/membership"
            onClick={() => trackOnce("preview-card", "cta_click")}
            className="inline-flex min-h-10 items-center rounded-full bg-amber px-4 text-sm font-medium text-void sm:min-h-11 sm:px-5 transition-colors duration-(--duration-quick) hover:bg-amber-soft"
          >
            Keep watching
          </Link>
          <button
            type="button"
            onClick={() => {
              trackOnce("preview-card", "dismiss");
              onDismiss();
            }}
            className="inline-flex min-h-10 items-center rounded-full border border-hairline px-4 text-sm text-ivory sm:min-h-11 sm:px-5 transition-colors duration-(--duration-quick) hover:border-amber"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
