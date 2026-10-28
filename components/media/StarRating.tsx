"use client";

import { useId, useState, useTransition } from "react";
import { rate } from "@/app/actions/rating";
import { STAR_LABELS, type RatingKind } from "@/lib/content/ratings";

/**
 * Five stars, one tap, saved the moment you choose (Melissa, 2026-10-28:
 * "its quicker than sending a typed out message. we'll have both").
 *
 * REAL RADIO BUTTONS under the stars, so the keyboard and screen readers get
 * the native behavior for free: Tab into the group, arrows to move, and each
 * one announces its words ("Loved it") rather than "star 5".
 *
 * NO SUBMIT BUTTON. Choosing is the act; a second step is the thing this
 * exists to remove. Changing your mind is the same tap, and updates the one
 * row rather than adding another (see the ratings table).
 *
 * The browser remembers what you gave it, so coming back shows your stars.
 * localStorage can throw or be empty (private windows), and everything
 * degrades to an ordinary unremembered rating when it does.
 */
const VIEWER_KEY = "lv_viewer";

function viewerKey(): string {
  try {
    const existing = localStorage.getItem(VIEWER_KEY);
    if (existing) return existing;
    const made = crypto.randomUUID();
    localStorage.setItem(VIEWER_KEY, made);
    return made;
  } catch {
    // No storage: a key for this page view only. Still one vote per tap.
    return crypto.randomUUID();
  }
}

function storedRating(key: string): number {
  try {
    const n = Number(localStorage.getItem(key));
    return n >= 1 && n <= 5 ? n : 0;
  } catch {
    return 0;
  }
}

export function StarRating({
  kind,
  slug,
  prompt = "How was it?",
}: {
  kind: RatingKind;
  slug: string;
  prompt?: string;
}) {
  const id = useId();
  const storeKey = `lv_rating:${kind}:${slug}`;
  // Read straight from storage on first render. Safe because this only ever
  // mounts in the browser, after the player has ended, so there is no server
  // render for it to disagree with.
  const [stars, setStars] = useState(() => storedRating(storeKey));
  const [hover, setHover] = useState(0);
  const [saved, setSaved] = useState(() => storedRating(storeKey) > 0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function choose(n: number) {
    setStars(n);
    setError(null);
    start(async () => {
      const res = await rate({ kind, slug, stars: n, viewerKey: viewerKey() });
      if (res.ok) {
        setSaved(true);
        try {
          localStorage.setItem(storeKey, String(n));
        } catch {}
      } else {
        setSaved(false);
        setError(res.error ?? "That didn't save. Try once more?");
      }
    });
  }

  const shown = hover || stars;

  return (
    <fieldset>
      <legend className="text-sm text-stone">{prompt}</legend>
      <div
        className="mt-2 flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {STAR_LABELS.map((label, i) => {
          const n = i + 1;
          const inputId = `${id}-${n}`;
          return (
            <span key={n} className="relative">
              <input
                type="radio"
                id={inputId}
                name={`${id}-stars`}
                value={n}
                checked={stars === n}
                onChange={() => choose(n)}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                title={label}
                onMouseEnter={() => setHover(n)}
                // 44px target: the stars are drawn small, the tap area is not.
                className="flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors duration-(--duration-quick) peer-focus-visible:ring-2 peer-focus-visible:ring-amber"
              >
                <span className="sr-only">{label}</span>
                <StarGlyph filled={n <= shown} />
              </label>
            </span>
          );
        })}
        <span aria-live="polite" className="ml-2 text-xs text-stone-dim">
          {pending
            ? "Saving…"
            : error
              ? null
              : hover
                ? STAR_LABELS[hover - 1]
                : saved && stars
                  ? `Thank you. ${STAR_LABELS[stars - 1]}.`
                  : null}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-amber-soft">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function StarGlyph({ filled }: { filled: boolean }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={filled ? "text-amber" : "text-stone-dim"}
    >
      <path
        d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
