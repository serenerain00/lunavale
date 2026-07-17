/**
 * VideoPlayer — cinematic playback surface over the gated stream route.
 * No autoplay-with-sound (content rule). Poster shows until play.
 */
"use client";

interface VideoPlayerProps {
  slug: string;
  poster: string;
  title: string;
}

export function VideoPlayer({ slug, poster, title }: VideoPlayerProps) {
  return (
    <video
      className="h-full w-full bg-black"
      controls
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={title}
    >
      <source src={`/api/stream/${slug}`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
