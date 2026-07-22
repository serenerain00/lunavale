import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerticalPlayer } from "@/components/clips/VerticalPlayer";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { clipNeighbours, clips, getClip } from "@/lib/content/clips";
import { getPerson } from "@/lib/content/taxonomy";
import { formatDuration } from "@/lib/content/videos";

interface ClipPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return clips.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: ClipPageProps): Promise<Metadata> {
  const { id } = await params;
  const clip = getClip(id);
  if (!clip) return { title: "Clip not found" };

  return {
    title: clip.title,
    description: clip.caption,
    openGraph: {
      title: clip.title,
      description: clip.caption,
      images: [clip.poster],
    },
  };
}

export default async function ClipPage({ params }: ClipPageProps) {
  const { id } = await params;
  const clip = getClip(id);
  if (!clip) notFound();

  const { active: member } = await getMembership();
  const { previous, next } = clipNeighbours(clip.id);

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <nav className="py-5 text-sm">
          <Link
            href="/clips"
            className="text-stone transition-colors duration-(--duration-quick) hover:text-ivory"
          >
            ← All clips
          </Link>
        </nav>

        <VerticalPlayer clip={clip} />

        <div className="mx-auto mt-8 max-w-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone">
            <span className="tabular-nums">
              {formatDuration(clip.durationSeconds)}
            </span>
            <span aria-hidden>·</span>
            <span>
              {clip.about.map((p) => getPerson(p)?.label ?? p).join(" & ")}
            </span>
            {clip.mature && (
              <>
                <span aria-hidden>·</span>
                <span>Mature</span>
              </>
            )}
          </div>
          <h1 className="mt-2 font-display text-2xl font-light text-ivory sm:text-3xl">
            {clip.title}
          </h1>
          <p className="mt-2 leading-relaxed text-stone">{clip.caption}</p>
        </div>

        {(previous || next) && (
          <nav
            aria-label="More clips"
            className="mx-auto mt-10 flex max-w-sm items-start justify-between gap-4 border-t border-hairline pt-5"
          >
            {previous ? (
              <Link
                href={`/clips/${previous.id}`}
                className="max-w-[45%] text-left text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                <span className="block text-xs text-stone-dim">Previous</span>
                {previous.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/clips/${next.id}`}
                className="max-w-[45%] text-right text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                <span className="block text-xs text-stone-dim">Next</span>
                {next.title}
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
