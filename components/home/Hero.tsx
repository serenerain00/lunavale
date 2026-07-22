import Image from "next/image";
import Link from "next/link";
import { AmbientVideo } from "@/components/home/AmbientVideo";
import type { Hero as HeroContent } from "@/lib/content/hero";

interface HeroProps {
  hero: HeroContent;
  /** Whether the viewer already has a membership. */
  member: boolean;
  /** Whether this viewer may actually watch the hero's scene. */
  unlocked: boolean;
}

/**
 * The landing hero: twelve seconds of a real scene at full bleed, the fewest
 * possible words on top of it, and a play button that plays the scene you are
 * looking at. Which scene that is rotates daily — see lib/content/hero.ts.
 *
 * Height is capped in `svh` rather than `vh` so a phone's collapsing browser
 * chrome can't crop the buttons off the bottom, and floored in `rem` so the
 * composition doesn't collapse on a short laptop window.
 */
export function Hero({ hero, member, unlocked }: HeroProps) {
  const { video } = hero;

  return (
    <section className="relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden [height:78svh] sm:[height:82svh]">
      <div className="absolute inset-0 -z-10">
        {/*
          Keyed on the slug so a rotation change swaps the element rather than
          mutating one in place — otherwise the browser can hold the previous
          day's decoded frame while the new source loads.
        */}
        <Image
          key={hero.poster}
          src={hero.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center] sm:object-center"
        />
        <AmbientVideo key={hero.loop} src={hero.loop} poster={hero.poster} />

        {/*
          Three scrims, each doing one job, kept as light as legibility allows
          — the footage is the pitch, so every extra percent of black is a
          percent of the sell given away.

          Vertical: contrast for the copy, weighted to the bottom third where
          the copy actually is. Horizontal: protects the left edge on wide
          screens without flattening the subject. Foot: blends into the page
          so the rails below read as the same surface.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 via-40% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-void/70 via-void/10 via-45% to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-void to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
        <p className="text-xs uppercase tracking-[0.22em] text-amber">
          An explorable cinematic universe
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-light leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
          Enter the world of Luna.
        </h1>

        {/* The pitch stays generic — a first-time visitor needs to know what
            this place is before they need to know which scene is playing
            behind it. The button carries the tie-in by naming the scene. */}
        <p className="mt-5 max-w-lg text-base leading-relaxed text-stone sm:text-lg">
          Original scenes from the lakehouse, the farmhouse, and the places in
          between. Walk into a location, or watch the story straight through.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <Link
            href={`/watch/${video.slug}`}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white sm:px-7"
          >
            {/* A locked hero says so on the button rather than promising
                playback and delivering a paywall on the next screen. */}
            {unlocked ? <PlayGlyph /> : <LockGlyph />}
            Play {video.title}
          </Link>
          <Link
            href="/world/farmhouse"
            className="inline-flex min-h-12 items-center rounded-full bg-charcoal/70 px-6 text-sm text-ivory backdrop-blur-md transition-colors duration-(--duration-quick) hover:bg-charcoal sm:px-7"
          >
            Step into the farmhouse
          </Link>
          {/* Hidden on phones: three stacked full-width buttons push the fold
              past the hero, and the header already carries a pinned Join. */}
          {!member && (
            <Link
              href="/membership"
              className="hidden min-h-12 items-center rounded-full border border-amber/50 px-6 text-sm text-amber-soft transition-colors duration-(--duration-quick) hover:bg-amber hover:text-void sm:inline-flex sm:px-7"
            >
              Membership
            </Link>
          )}
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

function LockGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
