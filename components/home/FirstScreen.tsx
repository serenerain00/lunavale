"use client";

/**
 * The first-screen test (lib/analytics/experiments.ts, "first-screen"):
 * how a non-member's home page opens. Melissa, 2026-10-18.
 *
 * HOW IT AVOIDS A FLASH ON A CACHED PAGE. The home page is static, so both
 * versions of the hero's words ship in the HTML: the control block carries
 * data-fs-variant="control", this one data-fs-variant="series", and CSS in
 * globals.css shows one. Which one is decided by <FirstScreenAssign/>, an
 * inline script that runs while the page is still parsing — before the hero
 * paints — and sets data-fs on <html>. Members (data-member, set by the
 * Viewer layer) always get control, whatever their cookie says.
 *
 * THE SAME FOOTAGE either way: only the words and buttons over it change,
 * so the test is about what a stranger is told, not what they are shown.
 */

import Link from "next/link";
import { useEffect } from "react";
import { useViewer } from "@/components/access/Viewer";
import { currentVariant, trackOnce } from "@/components/analytics/experiments";
import { clarityEvent, clarityTag } from "@/components/analytics/clarity";
import { EXPERIMENTS } from "@/lib/analytics/experiments";
import { AB_COOKIE, AB_COOKIE_DAYS } from "@/lib/analytics/experiments";
import { PAGE } from "@/components/ui/layout";
import { freeThroughLabel, getVideo, openNow } from "@/lib/content/videos";

export interface SeriesFacts {
  /** "Four" — episodes released. */
  episodesWord: string;
  /** "$8" */
  price: string;
  /** Free trailer slug, if there is one. */
  trailerSlug: string | null;
  /** Every released episode has a free opening (a preview, or is free). */
  everyEpisodeOpens: boolean;
}

/** The series version of the hero's words. Hidden unless html[data-fs=series]. */
export function SeriesHeroCopy({ facts, className = "" }: { facts: SeriesFacts; className?: string }) {
  // The pilot's free week (2026-10-22): the pilot is what plays behind this,
  // so the first button plays it and the free line is as loud as in the
  // control arm. Both arms carry the same offer; the test stays a test of
  // the words around it.
  const freeWeek = pilotFreeWeek();
  return (
    <div data-fs-variant="series" className={`${PAGE} pb-12 sm:pb-16 ${className}`}>
      <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-amber sm:text-base">
        Season one
      </p>
      <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ivory sm:text-7xl lg:text-8xl">
        Between Us
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone sm:text-xl">
        A slow-burn drama about Luna, Josh and Tyson. {facts.episodesWord} episodes out now,
        new ones weekly.
      </p>
      {freeWeek && (
        <p className="mt-3 text-lg font-medium text-amber sm:text-xl">
          Episode 1 is free to watch through {freeThroughLabel(getVideo("pilot")!.openUntil!)}
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
        {freeWeek ? (
          <Link
            href="/clips/pilot"
            onClick={() => trackOnce("first-screen", "pilot_play")}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white sm:px-7"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
            </svg>
            Watch the pilot
          </Link>
        ) : facts.trailerSlug && (
          <Link
            href={`/clips/${facts.trailerSlug}`}
            onClick={() => trackOnce("first-screen", "trailer_play")}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white sm:px-7"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
            </svg>
            Watch the trailer
          </Link>
        )}
        {/* To /membership, not straight to Stripe — Melissa, 2026-10-18:
            "i dont wanna put people on strip when they click join, they
            prob, wanna see the details". The details page's own Join is the
            one that opens checkout. */}
        <Link
          href="/membership"
          onClick={() => {
            trackOnce("first-screen", "join_click");
            clarityEvent("join_click");
          }}
          className="inline-flex min-h-12 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft sm:px-7"
        >
          {`Join · ${facts.price}/month`}
        </Link>
      </div>

      {/* Said by the button above while the pilot is free. */}
      {!freeWeek && (
        <p className="mt-4 text-sm text-stone-dim">
          Start with{" "}
          <Link href="/clips/pilot" className="text-stone underline decoration-hairline underline-offset-4 hover:text-ivory">
            the pilot
          </Link>
          {facts.everyEpisodeOpens
              ? " — every episode opens free."
              : "."}
        </p>
      )}
    </div>
  );
}

/**
 * Inline, parse-time assignment. Mirrors assignVariant() in
 * components/analytics/experiments.ts (same cookie, same format) but has to
 * run before React exists, so it is a string. Dates are read in the browser,
 * so a page cached before the start or after the end still behaves.
 */
export function FirstScreenAssign({ force = false }: { force?: boolean }) {
  const e = EXPERIMENTS["first-screen"];
  const js = `(function(){try{
var d=new Date().toISOString().slice(0,10);
if(!(${force ? "true" : "false"}||(d>="${e.startsOn}"&&d<="${e.endsOn}")))return;
var h=null;try{h=JSON.parse(localStorage.getItem("lv_viewer_hint")||"null")}catch(x){}
if(h&&h.member)return;
var m=document.cookie.match(/(?:^|; )${AB_COOKIE}=([^;]*)/),a={};
try{a=m?JSON.parse(decodeURIComponent(m[1])):{}}catch(x){a={}}
if(!a||typeof a!=="object")a={};
var v=a["first-screen"];
if(v!=="control"&&v!=="series"){v=Math.random()<0.5?"control":"series";a["first-screen"]=v;
document.cookie="${AB_COOKIE}="+encodeURIComponent(JSON.stringify(a))+"; Max-Age=${AB_COOKIE_DAYS * 86400}; Path=/; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"");}
document.documentElement.setAttribute("data-fs",v);
}catch(x){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

/**
 * Counts exposure once we know the viewer is not a member — both arms, so the
 * denominator is the same kind of person in each — and tags the Clarity
 * session with the arm so recordings can be filtered by it.
 */
export function FirstScreenExposure() {
  const viewer = useViewer();
  useEffect(() => {
    if (!viewer || viewer.member) return;
    const v = currentVariant("first-screen");
    if (!v) return;
    trackOnce("first-screen", "exposed");
    clarityTag("first_screen", v);
  }, [viewer]);
  return null;
}

/** The pilot's free week (Video.openUntil), so both test arms say it. */
function pilotFreeWeek(): boolean {
  const pilot = getVideo("pilot");
  return Boolean(pilot && openNow(pilot));
}
