import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideo, videos, formatDuration } from "@/lib/content/videos";
import { canWatch, isMember } from "@/lib/access/entitlement";
import { entriesForScene } from "@/lib/content/journal";
import { galleryForScene } from "@/lib/content/gallery";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { JournalCard } from "@/components/journal/JournalCard";
import { LockedNotice } from "@/components/membership/LockedNotice";
import { Reveal } from "@/components/motion/Reveal";
import { ContentNotice } from "@/components/ui/ContentNotice";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { SiteHeader } from "@/components/ui/SiteHeader";

interface WatchPageProps {
  params: Promise<{ slug: string }>;
}

// Pre-render the known scene routes; still deep-linkable and server-gated.
export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) return { title: "Scene not found" };
  return {
    title: video.title,
    description: video.synopsis,
    openGraph: {
      title: video.title,
      description: video.synopsis,
      images: [video.poster],
    },
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) notFound();

  const [allowed, member] = await Promise.all([canWatch(video), isMember()]);
  // A scene can exist as two edits (Video.premium). The stream route decides
  // which one actually plays; this only decides what the page SAYS about it,
  // and must agree with that decision or the runtime is a surprise.
  const cut = member && video.premium ? video.premium : null;
  const runtime = cut ? cut.durationSeconds : video.durationSeconds;
  // Her voice, tied to the scene — so it reaches people watching, not only
  // those who go to /journal. Stills from the same event get a link too.
  const journalEntries = entriesForScene(slug);
  const stills = galleryForScene(slug);

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 sm:px-8">
        <nav className="py-5 text-sm">
          <Link
            href="/browse"
            className="text-stone transition-colors hover:text-ivory"
          >
            ← Back to the catalog
          </Link>
        </nav>

        {/* Above the player, so it is read before anything plays — including
            any note that belongs only to the members' cut, which is the one
            about to play for them. */}
        <ContentNotice
          notes={[...(video.notes ?? []), ...(cut?.notes ?? [])]}
          className="mb-4"
        />

        {/* An explicit cut says so before it plays, never after. */}
        {cut?.explicit && (
          <p className="mb-4 rounded-lg border border-amber/25 bg-amber/5 px-4 py-3 text-sm leading-relaxed text-stone">
            <span className="font-medium text-amber-soft">Explicit · 18+</span>{" "}
            — you&rsquo;re watching the full cut, which is graphic. The public
            version of this scene is shorter and is not.
          </p>
        )}

        <div className="overflow-hidden rounded-xl bg-black ring-1 ring-hairline">
          <div className="relative aspect-video">
            {allowed ? (
              <VideoPlayer
                slug={video.slug}
                poster={video.poster}
                title={video.title}
              />
            ) : (
              <LockedNotice cover={video.poster} subject="This scene" />
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone">
            <span className="tabular-nums">{formatDuration(runtime)}</span>
            {(video.mature || cut?.explicit) && (
              <>
                <span aria-hidden>·</span>
                <RatingBadge mature={video.mature} explicit={cut?.explicit} />
              </>
            )}
            {video.access === "premium" && (
              <>
                <span aria-hidden>·</span>
                <span className="text-amber">Members</span>
              </>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-light text-ivory sm:text-4xl">
            {video.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone">
            {video.synopsis}
          </p>

          {/* Stated plainly, once, under the scene — the longer cut is a real
              thing they can have, not a nag. No countdown, no interruption of
              what they are already watching. See MONETIZATION.md. */}
          {video.premium && !member && (
            <p className="mt-5 max-w-2xl rounded-lg border border-hairline px-4 py-3 text-sm leading-relaxed text-stone">
              Members watch a longer cut of this scene —{" "}
              {formatDuration(video.premium.durationSeconds)} against{" "}
              {formatDuration(video.durationSeconds)}
              {video.premium.explicit && ", and explicit"}.{" "}
              <Link
                href="/membership"
                className="text-amber underline-offset-4 transition-colors hover:underline"
              >
                What membership opens
              </Link>
            </p>
          )}

          {stills && (
            <Link
              href={`/gallery/${stills.id}`}
              className="mt-5 inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
            >
              See the stills from this scene — {stills.count} frames →
            </Link>
          )}
        </div>

        {journalEntries.length > 0 && (
          <section aria-labelledby="scene-journal" className="mt-14">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber">
                From Luna&rsquo;s journal
              </p>
              <h2
                id="scene-journal"
                className="mt-2 font-display text-2xl font-light text-ivory"
              >
                What she wrote about this
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-stone">
                The same night, in her own hand — the version she only ever meant
                for herself.
              </p>
            </div>
            <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {journalEntries.map((entry) => (
                <JournalCard key={entry.id} entry={entry} unlocked={member} />
              ))}
            </Reveal>
          </section>
        )}
      </main>
    </>
  );
}
