/**
 * JournalPaper — one entry, on one sheet.
 *
 * The whole point is that this reads as a physical object someone left out,
 * not as another dark panel with text in it. So it is the one warm light
 * surface in the product: cream stock, ruled lines, a margin rule, ink that
 * sits slightly blue-black the way a ballpoint does, and a page that is
 * fractionally off-square because nobody puts paper down straight.
 *
 * The handwriting is a real accessibility problem and is treated as one. A
 * script face at paragraph length is hard work for anyone with dyslexia or low
 * vision, so every page carries a switch to plain text. The toggle is a real
 * control, not a preference buried in settings, because the people who need it
 * need it on the first page they open — and the setting is remembered so they
 * are never asked twice.
 */
"use client";

import { useSyncExternalStore } from "react";
import type { JournalEntry } from "@/lib/content/journal";

interface JournalPaperProps {
  entry: JournalEntry;
  /** Slight per-page tilt, so a wall of entries doesn't look printed. */
  tilt?: number;
}

/*
 * The plain-text preference is genuinely external state: it lives in
 * localStorage, it must survive navigation, and more than one page can be on
 * screen at once. useSyncExternalStore is the tool for exactly that — it also
 * gives a server snapshot, so hydration renders handwriting on both sides and
 * then switches, rather than reading storage during render and mismatching.
 */
/**
 * The page's vertical rhythm, in pixels. The ruled lines repeat on this, and
 * so does every margin in the writing — `leading-7` and `space-y-7` are both
 * 28px, which is why the text sits on the rules instead of drifting across
 * them. Change one of these and you have to change all of them.
 */
const RULE = 28;
/** Top padding, and therefore where the first rule and first line both begin. */
const RULE_START = RULE * 2;

const STORAGE_KEY = "lv-journal-plain";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Also follow the preference when it changes in another tab.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private browsing or storage disabled — handwriting is a fine default.
    return false;
  }
}

function writePreference(plain: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, plain ? "1" : "0");
  } catch {
    /* not worth failing the interaction over */
  }
  for (const listener of listeners) listener();
}

export function JournalPaper({ entry, tilt = 0 }: JournalPaperProps) {
  const plain = useSyncExternalStore(subscribe, readPreference, () => false);
  const toggle = () => writePreference(!plain);

  return (
    <figure className="relative mx-auto w-full max-w-2xl">
      <div
        style={{ rotate: `${tilt}deg` }}
        className="relative overflow-hidden rounded-sm bg-paper shadow-[0_18px_50px_-12px_rgba(0,0,0,0.75)]"
      >
        {/*
          Ruled lines, drawn rather than imaged so they stay crisp at any zoom
          and cost nothing to load. The line height below is locked to the same
          28px rhythm so the writing sits ON the rules instead of drifting
          across them.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 27px, rgba(47,58,74,0.13) 27px 28px)",
            // Rules start exactly where the first line of writing starts, so
            // the two stay locked together. Every vertical measure below is a
            // multiple of 28px for the same reason — one stray margin and the
            // writing walks off the lines by the bottom of the page.
            backgroundPosition: `0 ${RULE_START}px`,
          }}
        />
        {/* The margin rule, faded the way a real one is. Hidden on phones,
            where the page is too narrow to give up the width. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-10 hidden w-px bg-margin-rule/40 sm:block"
        />
        {/* A little uneven warmth across the stock, so it isn't flat cream. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 80% at 15% 0%, rgba(255,255,255,0.5), transparent 55%), radial-gradient(90% 70% at 100% 100%, rgba(160,140,105,0.28), transparent 60%)",
          }}
        />

        <div
          className="relative px-6 sm:pl-20 sm:pr-14"
          style={{ paddingTop: RULE_START, paddingBottom: RULE * 3 }}
        >
          {/* leading-7 everywhere, and a bottom margin of exactly one rule. */}
          <header className="mb-7">
            <p
              className={`leading-7 ${
                plain
                  ? "text-sm uppercase tracking-[0.15em] text-ink-soft"
                  : "font-hand text-2xl text-ink-soft"
              }`}
            >
              {entry.dateline}
            </p>
            {entry.where && (
              <p
                className={`leading-7 ${
                  plain ? "text-sm text-ink-soft" : "font-hand text-xl text-ink-soft"
                }`}
              >
                {entry.where}
              </p>
            )}
          </header>

          <div
            className={
              plain
                ? "space-y-7 text-[0.975rem] leading-7 text-ink"
                : "font-hand space-y-7 text-[1.45rem] leading-7 text-ink sm:text-[1.6rem]"
            }
          >
            {entry.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* Signed the way she'd sign it. Spelled out rather than initialled:
              Caveat's capital L is a loop that reads as a bracket on its own,
              and an unreadable glyph is the exact thing the plain-text switch
              exists to prevent. */}
          <p
            className={`mt-7 leading-7 ${
              plain ? "text-sm text-ink-soft" : "font-hand text-2xl text-ink-soft"
            }`}
          >
            — Luna
          </p>
        </div>
      </div>

      <figcaption className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={toggle}
          aria-pressed={plain}
          className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
        >
          {plain ? "Show her handwriting" : "Hard to read? Switch to plain text"}
        </button>
      </figcaption>
    </figure>
  );
}
