import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { clipAccess, clips } from "@/lib/content/clips";
import { formatDuration } from "@/lib/content/videos";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Clips",
  description:
    "The vertical cuts from Luna's world — the short pieces, collected in one place.",
  path: "/clips",
});

export default async function ClipsPage() {
  const { active: member } = await getMembership();

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Shot for a phone
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Clips.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            The vertical cuts from Luna&rsquo;s world, kept together here so
            they don&rsquo;t disappear down someone else&rsquo;s feed. Most are
            free; a few are part of the membership.
          </p>
        </header>

        {/*
          Three across on a phone, which is what a vertical grid wants to be —
          the posters are 9:16, so more columns than that and each one is a
          strip. No rail here on purpose: a portrait card in a horizontal
          scroller ends up taller than the viewport on mobile.
        */}
        <Reveal className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {clips.map((clip) => {
            // A gated clip a non-member can't open has its poster withheld —
            // for a sex scene the still frame is exactly the thing not to show
            // on a public page. Members see it normally.
            //
            // A PUBLIC OPENING CHANGES THAT (2026-09-08). Where a gated clip
            // carries a preview, anybody can watch its first minute, so
            // blurring the card would be hiding a frame from the part that is
            // already open — and hiding it from the exact person the preview
            // exists to interest. The "Members" badge below still says the
            // clip is gated, because it is; only the withholding of the
            // picture is conditional.
            const gated = clipAccess(clip) === "premium";
            const locked = gated && !member && !clip.preview;

            return (
              <Link
                key={clip.id}
                href={`/clips/${clip.id}`}
                data-reveal-item
                className="group relative block overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
              >
                {/*
                  The clip's own shape, not an assumed one. `object-cover` in
                  a fixed 9:16 cell crops a square poster down the sides,
                  which is exactly the mangling this content kind exists to
                  avoid. Cards in a row are then different heights; the grid
                  aligns them to the top, which reads as a social grid rather
                  than a fault.
                */}
                <div
                  className="relative"
                  style={{ aspectRatio: `${clip.aspect?.[0] ?? 9} / ${clip.aspect?.[1] ?? 16}` }}
                >
                  <Image
                    src={clip.poster}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] ${
                      locked
                        ? "scale-105 brightness-[0.28] blur-xl"
                        : "brightness-90 group-hover:brightness-100"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />

                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    {gated ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-void/70 px-2 py-0.5 text-[0.72rem] font-medium text-amber-soft backdrop-blur-sm">
                        <LockGlyph />
                        Members
                      </span>
                    ) : (
                      <span className="rounded-full bg-void/70 px-2 py-0.5 text-[0.72rem] font-medium text-stone backdrop-blur-sm">
                        Free
                      </span>
                    )}
                    <RatingBadge
                      mature={clip.mature}
                      explicit={clip.explicit}
                      variant="pill"
                    />
                  </div>

                  <span className="absolute bottom-2.5 right-2.5 rounded bg-void/70 px-1.5 py-0.5 text-[0.72rem] tabular-nums text-stone backdrop-blur-sm">
                    {formatDuration(clip.durationSeconds)}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h2 className="font-display text-base leading-tight text-ivory">
                      {clip.title}
                    </h2>
                  </div>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </main>
    </>
  );
}

function LockGlyph() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
