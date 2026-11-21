import Image from "next/image";
import Link from "next/link";
import { PAGE } from "@/components/ui/layout";
import { RELATIONSHIPS } from "@/lib/content/story-intro";

/**
 * The three relationships, directly under the hero: who these people are,
 * before anything asks for money. See lib/content/story-intro.ts for the
 * why and the canon checks.
 *
 * Every card opens a FREE clip, so a newcomer's first tap after the pilot
 * button is never a locked door. Server component, no per-viewer state, so
 * the home page stays static.
 *
 * id="the-story" is the target of the hero's "Explore the series" button.
 */
export function StoryIntro() {
  return (
    <section
      id="the-story"
      aria-labelledby="the-story-heading"
      className={`${PAGE} scroll-mt-20 pt-10 sm:pt-14`}
    >
      <h2
        id="the-story-heading"
        className="font-display text-2xl font-semibold tracking-tight text-ivory sm:text-3xl"
      >
        The story
      </h2>
      <ul className="mt-5 grid gap-5 sm:grid-cols-3 sm:gap-6">
        {RELATIONSHIPS.map((r) => (
          <li key={r.id}>
            <Link href={`/clips/${r.clipSlug}`} className="group block">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline">
                <Image
                  src={r.image}
                  alt={r.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover brightness-90 transition-transform duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-[1.03] group-hover:brightness-100"
                />
              </div>
              <h3 className="mt-3 font-display text-lg text-ivory group-hover:text-amber">
                {r.title}
              </h3>
              <p className="mt-1 leading-relaxed text-stone">{r.line}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
