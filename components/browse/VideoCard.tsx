import Image from "next/image";
import Link from "next/link";
import { formatDuration, type Video } from "@/lib/content/videos";

interface VideoCardProps {
  video: Video;
  /** Whether the current viewer is entitled to watch (drives the lock state). */
  unlocked: boolean;
}

export function VideoCard({ video, unlocked }: VideoCardProps) {
  const locked = video.access === "premium" && !unlocked;

  return (
    <Link
      href={`/watch/${video.slug}`}
      data-reveal-item
      className="group relative block overflow-hidden rounded-lg bg-charcoal ring-1 ring-hairline transition-transform duration-[--duration-standard] ease-[--ease-standard] hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={video.poster}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-[--duration-cinematic] ease-[--ease-cinematic] group-hover:scale-[1.04] ${
            locked ? "brightness-[0.55]" : "brightness-90 group-hover:brightness-100"
          }`}
        />
        {/* Bottom scrim for legible overlay text */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/90 via-void/10 to-transparent" />

        {/* Access + maturity badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium text-amber-soft backdrop-blur-sm">
              <LockGlyph />
              Members
            </span>
          ) : video.access === "free" ? (
            <span className="rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium text-stone backdrop-blur-sm">
              Free
            </span>
          ) : null}
          {video.mature && (
            <span className="rounded-full bg-void/70 px-2.5 py-1 text-xs font-medium text-stone backdrop-blur-sm">
              Mature
            </span>
          )}
        </div>

        <span className="absolute bottom-3 right-3 rounded bg-void/70 px-2 py-0.5 text-xs tabular-nums text-stone backdrop-blur-sm">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-xl font-medium leading-tight text-ivory">
          {video.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone">
          {video.synopsis}
        </p>
      </div>
    </Link>
  );
}

function LockGlyph() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
