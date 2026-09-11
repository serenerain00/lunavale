import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerticalPlayer } from "@/components/clips/VerticalPlayer";
import { ContentNotice } from "@/components/ui/ContentNotice";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { canWatch } from "@/lib/access/entitlement";
import { clipAccess, clipNeighbours, clips, getClip } from "@/lib/content/clips";
import { getPerson } from "@/lib/content/taxonomy";
import { formatDuration } from "@/lib/content/videos";
import { ClipLocked } from "@/components/clips/ClipLocked";

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
      // NO OG IMAGE FOR AN EXPLICIT CLIP. A link preview renders it full size,
      // unblurred, in somebody else's feed — the one surface where "withheld
      // on the public grid" was never going to hold.
      images: clip.explicit ? [] : [clip.poster],
    },
  };
}

export default async function ClipPage({ params }: ClipPageProps) {
  const { id } = await params;
  const clip = getClip(id);
  if (!clip) notFound();

  const allowed = await canWatch({ access: clipAccess(clip) });
  const { previous, next } = clipNeighbours(clip.id);

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <nav className="py-5 text-sm">
          <Link
            href="/clips"
            className="text-stone transition-colors duration-(--duration-quick) hover:text-ivory"
          >
            ← All clips
          </Link>
        </nav>

        {/* Explicit is stated up front regardless of the notes vocabulary —
            it's a rating, not a content note. Only shown to someone who can
            actually open it; a non-member gets the locked panel instead. */}
        {allowed && clip.explicit && (
          <aside
            aria-label="Content rating"
            className="mx-auto mb-4 max-w-sm rounded-lg border border-amber/30 bg-charcoal/50 px-4 py-3 text-sm leading-relaxed text-stone"
          >
            <span className="font-medium text-amber-soft">
              Explicit · 18+.
            </span>{" "}
            This clip contains sexually explicit material.
          </aside>
        )}

        <ContentNotice notes={clip.notes} className="mx-auto mb-4 max-w-sm" />

        {allowed || clip.preview ? (
          <VerticalPlayer clip={clip} />
        ) : (
          <ClipLocked clip={clip} />
        )}

        {/* A visitor gets a real minute of the real clip and then this — the
            same shape as the note under the scene player, and the same rule
            behind it: state the numbers once, under the video, rather than
            running a countdown over the footage.

            "THE FIRST" IS SAFE TO SAY HERE, unlike on a scene. Clip previews
            have no hookStart and always begin at 0:00 (see Clip.preview), so
            this cannot make the claim the watch page had to stop making.

            The player above is genuinely playing the shorter file. There is no
            full cut behind it to reach. */}
        {!allowed && clip.preview && (
          <div className="mx-auto mt-4 max-w-sm rounded-lg border border-amber/25 bg-amber/[0.04] px-4 py-3 text-sm leading-relaxed text-stone">
            You&rsquo;re watching the first{" "}
            {formatDuration(clip.preview.durationSeconds)} of{" "}
            {formatDuration(clip.durationSeconds)}. The rest is part of{" "}
            <Link
              href="/membership"
              className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
            >
              the LunaVerse
            </Link>
            .
          </div>
        )}

        <div className="mx-auto mt-8 max-w-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone">
            {/* The runtime a viewer is actually being given. Printing the
                full 4:10 over a player holding sixty seconds would be the
                same small lie the scene page fixed on 2026-08-31. */}
            <span className="tabular-nums">
              {formatDuration(
                !allowed && clip.preview
                  ? clip.preview.durationSeconds
                  : clip.durationSeconds,
              )}
            </span>
            <span aria-hidden>·</span>
            <span>
              {clip.about.map((p) => getPerson(p)?.label ?? p).join(" & ")}
            </span>
            {(clip.mature || clip.explicit) && (
              <>
                <span aria-hidden>·</span>
                <RatingBadge mature={clip.mature} explicit={clip.explicit} />
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
                className="min-h-11 max-w-[45%] text-left text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
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
                className="min-h-11 max-w-[45%] text-right text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
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
