import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideo, videos, formatDuration } from "@/lib/content/videos";
import { canWatch, isMember } from "@/lib/access/entitlement";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { enterPreviewMembership } from "@/app/actions/session";

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

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-24 sm:px-8">
        <nav className="py-5 text-sm">
          <Link
            href="/"
            className="text-stone transition-colors hover:text-ivory"
          >
            ← All scenes
          </Link>
        </nav>

        <div className="overflow-hidden rounded-xl bg-black ring-1 ring-hairline">
          <div className="relative aspect-video">
            {allowed ? (
              <VideoPlayer
                slug={video.slug}
                poster={video.poster}
                title={video.title}
              />
            ) : (
              <LockedState video={video} />
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone">
            <span className="tabular-nums">
              {formatDuration(video.durationSeconds)}
            </span>
            {video.mature && (
              <>
                <span aria-hidden>·</span>
                <span>Mature</span>
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
        </div>
      </main>
    </>
  );
}

function LockedState({
  video,
}: {
  video: NonNullable<ReturnType<typeof getVideo>>;
}) {
  return (
    <div className="absolute inset-0">
      <Image
        src={video.poster}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="object-cover brightness-[0.35]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3 py-1 text-sm text-amber-soft backdrop-blur-sm">
          Members only
        </span>
        <p className="max-w-md text-balance leading-relaxed text-ivory">
          This scene is part of the membership. Preview access to watch it and
          everything else in the Vault.
        </p>
        <form action={enterPreviewMembership}>
          <button
            type="submit"
            className="rounded-full bg-amber px-6 py-2.5 text-sm font-medium text-void transition-colors duration-[--duration-quick] hover:bg-amber-soft"
          >
            Preview membership
          </button>
        </form>
      </div>
    </div>
  );
}
