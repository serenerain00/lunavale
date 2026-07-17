import { videos } from "@/lib/content/videos";
import { isMember } from "@/lib/access/entitlement";
import { VideoCard } from "@/components/browse/VideoCard";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default async function Home() {
  const member = await isMember();

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-24 sm:px-8">
        {/* Hero — restrained, story-first, no AI framing */}
        <section className="py-16 sm:py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            An explorable cinematic universe
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-light leading-[1.1] text-ivory sm:text-6xl">
            Enter the world of Luna.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">
            Original scenes from the lakehouse, the farmhouse, and the places
            in between. Watch the free scenes, then unlock the rest.
          </p>
        </section>

        {/* Library */}
        <section aria-labelledby="library-heading">
          <h2
            id="library-heading"
            className="mb-6 font-display text-2xl font-medium text-ivory"
          >
            Scenes
          </h2>

          {videos.length === 0 ? (
            <p className="rounded-lg border border-hairline bg-charcoal/50 p-10 text-center text-stone">
              No scenes are available yet. Check back soon.
            </p>
          ) : (
            <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.slug} video={video} unlocked={member} />
              ))}
            </Reveal>
          )}
        </section>
      </main>
    </>
  );
}
