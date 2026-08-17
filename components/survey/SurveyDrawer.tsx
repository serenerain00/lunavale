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
 */
export function SurveyDrawer({ scenes }: { scenes: SurveyOption[] }) {
  const [open, setOpen] = useState(false);
  // Mounted-but-closed for one frame, so the browser has something to
  // transition FROM. Opening straight into the final position just appears.
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setShown(true));
    // Captured now rather than read in the cleanup: by the time cleanup runs
    // the ref may point somewhere else, and the button we want focus returned
    // to is the one that was pressed to open this.
    const opener = openerRef.current;

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
      <div className="rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
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
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="mt-5 inline-flex min-h-11 shrink-0 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft sm:mt-0"
        >
          Answer them
        </button>
      </div>

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
