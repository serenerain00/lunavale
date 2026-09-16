"use client";

/**
 * Back to top — one fixed control, bottom right, on every page.
 *
 * WHY IT EARNS ITS PLACE. The front page is a hero plus a dozen shelves and
 * /clips is a 46-card grid; on a phone that is a long way down and the only
 * way back was a flick-scroll or the browser's own status-bar tap, which
 * plenty of people do not know about. Melissa asked for it on 2026-09-16.
 *
 * IT HIDES UNTIL IT IS USEFUL. Nothing renders until the visitor is a screen
 * and a half down, because a "back to top" button visible at the top is
 * clutter that has already told you it is useless.
 *
 * IT KEEPS THE CORNER AND THE SURVEY TAB MOVES. On a phone the survey's "Six
 * questions" pill used to live in exactly this spot. The tab is the one that
 * gives way, because it is conditional — home page only, and only until
 * somebody answers — while this is on every page and permanent. Whichever of
 * two fixed things is rarer should be the one that adapts. See the matching
 * note in components/survey/SurveyDrawer.tsx.
 *
 * SMOOTH UNLESS THEY ASKED OTHERWISE. `prefers-reduced-motion` gets an instant
 * jump: a full-page smooth scroll is a large, unrequested animation and is
 * precisely what that setting is for.
 */

import { useEffect, useState } from "react";

/** How far down before it is worth offering. One and a half screens. */
const SHOW_AFTER = 1.5;

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const decide = () =>
      setShow(window.scrollY > window.innerHeight * SHOW_AFTER);
    decide();
    // Passive: this must never be able to delay a scroll.
    window.addEventListener("scroll", decide, { passive: true });
    window.addEventListener("resize", decide);
    return () => {
      window.removeEventListener("scroll", decide);
      window.removeEventListener("resize", decide);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    // Move focus with the view. Without this a keyboard or screen-reader user
    // is returned to the top visually and left at the bottom of the document,
    // which is worse than not having moved at all.
    document.getElementById("top")?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      // Kept in the DOM and faded, rather than mounted and unmounted, so it
      // arrives as a settle rather than a pop — and so `aria-hidden` can take
      // it out of the accessibility tree while it is invisible instead of the
      // tree changing shape on every scroll.
      aria-hidden={!show}
      tabIndex={show ? undefined : -1}
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 grid size-11 place-items-center rounded-full border border-hairline bg-void/80 text-stone shadow-lg shadow-void/50 backdrop-blur-md transition-[opacity,transform] duration-(--duration-standard) ease-(--ease-standard) hover:border-amber hover:text-amber motion-reduce:transition-none sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-6 ${
        show
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
