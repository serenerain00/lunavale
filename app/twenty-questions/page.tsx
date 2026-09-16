import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getCharacter } from "@/lib/content/characters";
import {
  interviewIntro,
  twentyQuestions,
} from "@/lib/content/twenty-questions";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Twenty Questions for Luna",
  description:
    "Readers sent in several hundred questions. Luna took twenty of them — her family, her mornings, the six months apart, and the one about Tyson she started to answer and then didn't.",
  path: "/twenty-questions",
});

/**
 * The reader Q&A, laid out as a published article.
 *
 * FREE, AND IT HAS TO BE. This exists to make a stranger care about Luna before
 * anything is asked of them — putting it behind the membership would be
 * charging admission to find out why you should be interested, which is the
 * same mistake the premise page exists to avoid.
 *
 * STATIC. Nothing per-viewer is read here, so it prerenders and serves from the
 * CDN like the rest of the public pages (see the note at the top of app/page.tsx
 * for why that matters at all).
 *
 * THE READING MEASURE IS DELIBERATELY NARROW. This is the longest continuous
 * prose on the site and the audience skews toward readers who will not thank us
 * for a 90-character line — max-w-2xl keeps it near 70 characters, and the
 * answers run at text-lg rather than the site's usual body size.
 *
 * The content, the ordering argument and everything invented in it are written
 * up in lib/content/twenty-questions.ts.
 */
export default function TwentyQuestionsPage() {
  const luna = getCharacter("luna")!;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <article>
          <header className="pt-12 sm:pt-16">
            <p className="text-xs uppercase tracking-[0.2em] text-amber">
              Reader Q&amp;A
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
              Twenty questions for Luna
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone">
              She answered nineteen of them.
            </p>
          </header>

          {/* The lead image is the cast-interview still, which is the one
              photograph on the site actually taken while somebody was asking
              her things. Portrait, floated beside the intro from sm up, so the
              piece opens like an article rather than a landing page. */}
          <div className="mt-10 sm:float-right sm:ml-8 sm:w-64">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-hairline">
              <Image
                src={luna.portrait}
                alt={luna.name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 16rem"
                className="object-cover object-[68%_center]"
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-stone-dim">
              Luna, photographed the same afternoon she answered these.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {interviewIntro.map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-stone">
                {para}
              </p>
            ))}
          </div>

          {/* Numbered, because a reader who leaves and comes back should be
              able to find where they stopped, and because the count is part of
              the promise the headline makes. */}
          {/* clear-right so the questions start BELOW the floated portrait.
              Without it the image runs down into Q1 and squeezes the first
              answer to about 45 characters a line, which is half the measure
              the rest of the piece reads at. */}
          <ol className="mt-14 space-y-12 sm:clear-right sm:space-y-14">
            {twentyQuestions.map((item, i) => (
              <li key={item.q} className="max-w-2xl">
                <div className="flex gap-4 sm:gap-5">
                  <span
                    aria-hidden
                    className="shrink-0 pt-1 font-display text-sm tabular-nums text-amber/70"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl font-medium leading-snug text-ivory sm:text-2xl">
                      {item.q}
                    </h2>
                    <div className="mt-3 space-y-3.5">
                      {item.a.map((para, j) => (
                        <p
                          key={j}
                          className="text-lg leading-relaxed text-stone"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {/* THE CLOSE POINTS AT THE JOURNAL, not at the membership. Somebody
              who has just read two thousand words of her wants more of her —
              the correct next thing is the book she keeps, and five entries of
              it are open. The ask can happen after she has been read. */}
          <div className="mt-16 max-w-2xl border-t border-hairline pt-8">
            <p className="text-lg leading-relaxed text-stone">
              She keeps a journal, and has for years. It is less careful than
              this.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/journal"
                className="inline-flex min-h-11 items-center rounded-full bg-ivory px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-white"
              >
                Read her journal
              </Link>
              <Link
                href="/characters/luna"
                className="inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
              >
                More about Luna
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
