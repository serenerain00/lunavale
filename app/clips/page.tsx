import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { clips } from "@/lib/content/clips";
import { formatDuration } from "@/lib/content/videos";

export const metadata: Metadata = {
  title: "Clips",
  description:
    "The vertical cuts from Luna's world — the ones that ran on Instagram, collected in one place. Free to watch.",
  alternates: { canonical: "/clips" },
};

export default async function ClipsPage() {
  const { active: member } = await getMembership();

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Shot for a phone
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Clips.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            The vertical cuts that ran on Instagram, kept together here so they
            don&rsquo;t disappear down someone else&rsquo;s feed. All free, all
            with sound.
          </p>
        </header>

        {/*
          Three across on a phone, which is what a vertical grid wants to be —
          the posters are 9:16, so more columns than that and each one is a
          strip. No rail here on purpose: a portrait card in a horizontal
          scroller ends up taller than the viewport on mobile.
        */}
        <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {clips.map((clip) => (
            <Link
              key={clip.id}
              href={`/clips/${clip.id}`}
              data-reveal-item
              className="group relative block overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
            >
              <div className="relative aspect-[9/16]">
                <Image
                  src={clip.poster}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover brightness-90 transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.04] group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />

                <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-void/70 px-2 py-0.5 text-[0.65rem] font-medium text-stone backdrop-blur-sm">
                    Free
                  </span>
                  {clip.mature && (
                    <span className="rounded-full bg-void/70 px-2 py-0.5 text-[0.65rem] font-medium text-stone backdrop-blur-sm">
                      Mature
                    </span>
                  )}
                </div>

                <span className="absolute bottom-2.5 right-2.5 rounded bg-void/70 px-1.5 py-0.5 text-[0.65rem] tabular-nums text-stone backdrop-blur-sm">
                  {formatDuration(clip.durationSeconds)}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <h2 className="font-display text-base leading-tight text-ivory">
                    {clip.title}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </Reveal>
      </main>
    </>
  );
}
