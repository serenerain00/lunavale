import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { Reveal } from "@/components/motion/Reveal";
import {
  environments,
  readiness,
  type Environment,
} from "@/lib/content/world";
import { getVideo } from "@/lib/content/videos";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "The World of Luna",
  description:
    "Move through the places the story lives — the farmhouse, the lakehouse, the bar, the lake, and the rest of Luna's world.",
  path: "/world",
});

/** An environment's cover: the poster of the first scene you can find inside it. */
function coverFor(env: Environment): string | null {
  for (const room of env.rooms) {
    for (const obj of room.objects) {
      if (obj.videoSlug) {
        const v = getVideo(obj.videoSlug);
        if (v) return v.poster;
      }
    }
  }
  return null;
}

function roomCount(env: Environment): string {
  const n = env.rooms.length;
  return `${n} ${n === 1 ? "room" : "rooms"}`;
}

export default async function WorldPage() {

  return (
    <>
      <SiteHeader />

      <main className="flex-1 pb-24">
        <section className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.22em] text-amber">
            The world
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-light leading-[1.05] text-ivory sm:text-5xl">
            Move through the places the story lives.
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-stone">
            Every location is a room you can walk into — pick up what&rsquo;s
            left behind, and the scenes, memories, and pages of Luna&rsquo;s
            journal are waiting inside.
          </p>

          <Reveal className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => {
              const cover = coverFor(env);
              const accent = env.rooms[0]?.accent ?? "#3a3a40";
              const build = readiness(env);
              return (
                <Link
                  key={env.slug}
                  href={`/world/${env.slug}`}
                  data-reveal-item
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg ring-1 ring-hairline transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover brightness-[0.72] transition-[transform,filter] duration-(--duration-cinematic) ease-(--ease-cinematic) group-hover:scale-105 group-hover:brightness-90"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(160deg, ${accent} 0%, #14151a 90%)`,
                      }}
                    />
                  )}
                  {/* Scrim for legibility over the bottom third. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 via-50% to-transparent" />

                  {/* Said up front rather than discovered on arrival. A visitor
                      who walks into a placeholder box unwarned concludes the
                      product is bad; one who was told concludes it is early. */}
                  {build.state !== "built" && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-void/75 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-stone backdrop-blur-sm">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-amber/80"
                      />
                      {build.state === "placeholder"
                        ? "In progress"
                        : `${build.dressed} of ${build.total} built`}
                    </span>
                  )}

                  <div className="relative p-5">
                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-amber-soft">
                      {env.belongsTo}
                    </p>
                    <h2 className="mt-1.5 font-display text-2xl text-ivory">
                      {env.name}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone">
                      {env.tagline}
                    </p>
                    <p className="mt-3 text-xs tabular-nums text-stone-dim">
                      {roomCount(env)} · Explore →
                    </p>
                  </div>
                </Link>
              );
            })}
          </Reveal>
        </section>
      </main>
    </>
  );
}
