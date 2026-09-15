/**
 * InterviewHero — a hero whose video IS the content: click play and the whole
 * thing plays right here, with sound, no trip to a watch page.
 *
 * NAMED FOR THE CAST INTERVIEW, WHICH IT NO LONGER ONLY SERVES. From
 * 2026-09-15 it also carries the trailer, and anything else `playInline` is set
 * on. The file name is left alone because it is imported by app/page.tsx and a
 * rename buys nothing; the user-facing strings below, which said "interview" to
 * somebody watching a trailer, are fixed.
 *
 * Two video layers:
 *   - the muted ambient loop behind the copy (AmbientVideo, desktop-only), and
 *   - the full video, mounted but idle (preload="none", so nothing is
 *     fetched until asked for), revealed and played on the Play click.
 *
 * play() is called synchronously inside the click handler on purpose: that
 * keeps it inside the user gesture, which is what lets the video start WITH
 * sound. Deferring it to an effect after the re-render would lose the gesture
 * and the browser would refuse audio.
 */
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Guest } from "@/components/access/Viewer";
import { AmbientVideo } from "@/components/home/AmbientVideo";
import type { Hero as HeroContent } from "@/lib/content/hero";

interface InterviewHeroProps {
  hero: HeroContent;
}

export function InterviewHero({ hero }: InterviewHeroProps) {
  const { video } = hero;
  // Falls back to the front-door copy so a playInline hero added without its
  // own strings renders the site's line rather than nothing.
  const copy = hero.copy ?? {
    kicker: "An explorable cinematic universe",
    headline: "Enter the world of Luna.",
    blurb:
      "Start with the cast, in their own words — then step inside the world they made.",
    cta: "Play it",
  };
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  const play = () => {
    const el = ref.current;
    if (!el) return;
    setFailed(false);
    setPlaying(true);
    el.currentTime = 0;
    // Synchronous, inside the gesture → allowed to play with sound.
    void el.play().catch(() => {});
  };

  const stop = () => {
    ref.current?.pause();
    setPlaying(false);
  };

  return (
    <section className="relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden [height:78svh] sm:[height:82svh]">
      {/* Background: poster + muted loop + scrims (hidden while the full video plays). */}
      <div
        className={`absolute inset-0 -z-10 transition-opacity duration-(--duration-standard) ${
          playing ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={hero.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <AmbientVideo key={hero.loop} src={hero.loop} poster={hero.poster} />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 via-40% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/70 via-void/10 via-45% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/*
        The full thing. Always mounted (so play() has an element to act on
        within the click gesture) but preload="none", so nothing downloads until
        the visitor asks. Shown only while playing, contained on black so faces
        are never cropped.
      */}
      <div
        className={`absolute inset-0 z-10 bg-black transition-opacity duration-(--duration-standard) ${
          playing ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <video
          ref={ref}
          className="h-full w-full bg-black object-contain"
          controls={playing}
          playsInline
          preload="none"
          poster={video.poster}
          aria-label={video.title}
          onError={() => {
            if (playing) setFailed(true);
          }}
        >
          <source src={`/api/stream/${video.slug}`} type="video/mp4" />
        </video>

        {playing && (
          <button
            type="button"
            onClick={stop}
            aria-label={`Close ${video.title}`}
            className="absolute right-4 top-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-void/70 px-4 text-sm text-stone backdrop-blur-md transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber sm:right-6 sm:top-6"
          >
            Close
          </button>
        )}

        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-balance leading-relaxed text-ivory">
              {video.title} won&rsquo;t play right now.
            </p>
            <button
              type="button"
              onClick={play}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Copy + CTAs, hidden once the video takes over. */}
      <div
        className={`mx-auto w-full max-w-6xl px-5 pb-12 transition-opacity duration-(--duration-standard) sm:px-8 sm:pb-16 ${
          playing ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-amber">
          {copy.kicker}
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-light leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
          {copy.headline}
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-stone sm:text-lg">
          {copy.blurb}
        </p>

        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <button
            type="button"
            onClick={play}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white sm:px-7"
          >
            <PlayGlyph />
            {copy.cta}
          </button>
          {/*
            WAS "Step into the farmhouse", into /world/farmhouse. The world is
            off the site until it is finished (WORLD_ENABLED in
            lib/content/world.ts), so this points at the scenes instead — which
            is where somebody who just watched a trailer wants to go anyway.
          */}
          <Link
            href="/browse"
            className="inline-flex min-h-12 items-center rounded-full bg-charcoal/70 px-6 text-sm text-ivory backdrop-blur-md transition-colors duration-(--duration-quick) hover:bg-charcoal sm:px-7"
          >
            Watch the scenes
          </Link>
          <Guest>
            <Link
              href="/membership"
              className="hidden min-h-12 items-center rounded-full border border-amber/50 px-6 text-sm text-amber-soft transition-colors duration-(--duration-quick) hover:bg-amber hover:text-void sm:inline-flex sm:px-7"
            >
              Membership
            </Link>
          </Guest>
        </div>
      </div>
    </section>
  );
}

function PlayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
    </svg>
  );
}
