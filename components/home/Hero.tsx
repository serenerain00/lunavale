import Image from "next/image";
import Link from "next/link";
import { AmbientVideo } from "@/components/home/AmbientVideo";

interface HeroProps {
  /** Where the primary "watch" button goes — a real, free scene. */
  watchHref: string;
  watchLabel: string;
  /** Whether the viewer already has a membership, which changes the second CTA. */
  member: boolean;
}

/** The public trailer loop, built by scripts/make-hero-loop.sh. */
const HERO_VIDEO = "/hero/lakehouse-loop.mp4";
const HERO_POSTER = "/hero/lakehouse-loop.jpg";

/**
 * The landing hero: one frame of the actual work, at full bleed, with the
 * fewest possible words on top of it.
 *
 * Height is capped in `svh` rather than `vh` so a phone's collapsing browser
 * chrome can't crop the buttons off the bottom, and floored in `rem` so the
 * composition doesn't collapse on a short laptop window.
 *
 * The scrims are doing real work, not decoration: the bottom one guarantees
 * text contrast over footage whose brightness changes every frame, and the
 * last one blends the image into the page background so the rails below read
 * as the same surface rather than a separate widget.
 */
export function Hero({ watchHref, watchLabel, member }: HeroProps) {
  return (
    <section className="relative isolate flex min-h-[34rem] flex-col justify-end overflow-hidden [height:78svh] sm:[height:82svh]">
      <div className="absolute inset-0 -z-10">
        <Image
          src={HERO_POSTER}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center] sm:object-center"
        />
        <AmbientVideo src={HERO_VIDEO} poster={HERO_POSTER} />

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
        <p className="mt-5 max-w-lg text-base leading-relaxed text-stone sm:text-lg">
          Original scenes from the lakehouse, the farmhouse, and the places in
          between. Walk into a location, or watch the story straight through.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <Link
            href={watchHref}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white sm:px-7"
          >
            <PlayGlyph />
            {watchLabel}
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
