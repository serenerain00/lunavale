"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SurveyForm } from "@/components/survey/SurveyForm";
import type { SurveyOption } from "@/lib/content/survey";

/**
 * The home-page survey: a band you can't miss, and a panel that slides in with
 * the questions already in it.
 *
 * WHY A DRAWER RATHER THAN A LINK. A link to /survey asks somebody to leave
 * the page they came for, on the promise that answering will be quick. Most
 * people decline that trade. The questions arriving where they already are
 * costs them nothing to start and nothing to abandon.
 *
 * IT ASKS THE THREE REQUIRED QUESTIONS and no more — how they are finding it,
 * series or film, would they watch it on a platform. Those three are exactly
 * what submitSurvey insists on, so an answer given here is a COMPLETE row in
 * the same table as a long-form one. There is no partial-response state and no
 * second code path. The other three live on /survey, linked from inside the
 * panel, which is the "whole thing" for anyone who wants to say more.
 *
 * MOTION is a transform and an opacity fade, and it is dropped entirely under
 * prefers-reduced-motion — the panel still opens, it simply arrives. Nothing
 * here animates layout.
 *
 * THE EDGE TAB (2026-08-26). The band now sits second on the page, directly
 * under the hero, which is prominent and also means it is gone by the time
 * anybody has watched anything — and "should this be a series?" is a better
 * question after two scenes than before them. So a tab follows them down: it
 * appears the moment the band scrolls out of view and opens the same panel.
 *
 * It is the handle for a drawer that already slides in from the right, so it
 * is pinned to the right edge and reads as the thing you pull. On a phone that
 * edge is thumb territory and a vertical tab is a sliver, so below `sm` it
 * becomes a pill in the bottom-right corner instead.
 *
 * FOCUS GOES BACK TO WHICHEVER CONTROL OPENED IT — the band's button or the
 * tab. Returning it to the band after the tab was used would fling a keyboard
 * user back up the page to a button they cannot see.
 */
export function SurveyDrawer({ scenes }: { scenes: SurveyOption[] }) {
  const [open, setOpen] = useState(false);
  // Mounted-but-closed for one frame, so the browser has something to
  // transition FROM. Opening straight into the final position just appears.
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const tabRef = useRef<HTMLButtonElement>(null);
  // Whichever of the two buttons was actually pressed, so focus goes back to
  // the one the visitor can see.
  const lastOpener = useRef<HTMLButtonElement | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  // Starts true so the tab is never painted over the band on first render —
  // before the observer has reported, "the band is on screen" is the safe
  // assumption, since the band is the second thing on the page.
  const [bandVisible, setBandVisible] = useState(true);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBandVisible(entry.isIntersecting),
      // A sliver still counts as visible: a band half off the top of the
      // screen does not need a second copy of itself in the corner.
      { threshold: 0 },
    );
    observer.observe(band);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setShown(true));
    // Captured now rather than read in the cleanup: by the time cleanup runs
    // the ref may point somewhere else, and the button we want focus returned
    // to is the one that was pressed to open this.
    const opener = lastOpener.current ?? openerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus moves into the panel, so a keyboard or screen-reader user is
    // taken to the questions rather than left behind on the page.
    panelRef.current?.focus();

    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      setShown(false);
      // And comes back to the button they pressed, not to the top of the page.
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <div
        ref={bandRef}
        className="rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Three questions
          </p>
          <h2 className="mt-3 font-display text-2xl font-light text-ivory sm:text-3xl">
            Should this be a series?
          </h2>
          <p className="mt-2 max-w-xl leading-relaxed text-stone">
            Luna is being made right now, and what happens to it is genuinely
            still open. Tell her what you make of it, and whether you&rsquo;d
            watch it somewhere like Netflix.
          </p>
        </div>
        <button
          ref={openerRef}
          type="button"
          onClick={() => {
            lastOpener.current = openerRef.current;
            setOpen(true);
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="mt-5 inline-flex min-h-11 shrink-0 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft sm:mt-0"
        >
          Answer them
        </button>
      </div>

      {/* THE TAB. Rendered always and hidden with opacity rather than
          unmounted, so it fades rather than blinking into existence on every
          scroll past the band. `pointer-events-none` while hidden keeps it
          from swallowing clicks on whatever is underneath it, and
          `aria-hidden` with tabIndex -1 keeps it out of the tab order and off
          screen readers while it is not really there. */}
      <button
        ref={tabRef}
        type="button"
        onClick={() => {
          lastOpener.current = tabRef.current;
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-hidden={bandVisible || open}
        tabIndex={bandVisible || open ? -1 : undefined}
        className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex min-h-11 max-w-[calc(100vw-2rem)] items-center rounded-full bg-amber px-5 text-sm font-medium text-void shadow-lg shadow-void/50 transition-[opacity,transform] duration-(--duration-standard) ease-(--ease-standard) hover:bg-amber-soft motion-reduce:transition-none sm:bottom-auto sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:rounded-l-lg sm:rounded-r-none sm:px-2.5 sm:py-5 sm:[writing-mode:vertical-rl] ${
          bandVisible || open
            ? "pointer-events-none translate-x-4 opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        Three questions
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className={`fixed inset-0 z-40 cursor-default bg-void/80 backdrop-blur-sm transition-opacity duration-(--duration-quick) motion-reduce:transition-none ${
              shown ? "opacity-100" : "opacity-0"
            }`}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Three questions about Luna"
            tabIndex={-1}
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-hairline bg-obsidian shadow-2xl outline-none transition-transform duration-300 ease-out motion-reduce:transition-none ${
              shown ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-amber">
                  Three questions
                </p>
                <p className="mt-1 text-sm text-stone">
                  About a minute. No account, no email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-5 pb-10 sm:px-7">
              <SurveyForm
                scenes={scenes}
                questionIds={["enjoyment", "format", "would_watch"]}
                compact
                footer={
                  <p className="border-t border-hairline pt-5 text-sm leading-relaxed text-stone">
                    There are three more — which scene stayed with you, what
                    you want more of, and anything you want to say to her.{" "}
                    <Link
                      href="/survey"
                      className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
                    >
                      Open the whole survey
                    </Link>
                    .
                  </p>
                }
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
