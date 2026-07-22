/**
 * VideoPlayer — cinematic playback surface over the gated stream route.
 * No autoplay-with-sound (content rule). Poster shows until play.
 *
 * Handles a failed source explicitly. When /api/stream returns anything other
 * than video — media not uploaded, an expired signed URL, a network drop — the
 * browser's own response is to grey out the controls and say nothing, which
 * reads as "this site is broken" and gives the viewer nothing to do. A missing
 * file is a real state and gets a real message.
 */
"use client";

import { useState } from "react";

interface VideoPlayerProps {
  slug: string;
  poster: string;
  title: string;
}

export function VideoPlayer({ slug, poster, title }: VideoPlayerProps) {
  const [failed, setFailed] = useState(false);
  // Changing the key remounts the element, which is the only reliable way to
  // make a <video> re-attempt a source it has already given up on.
  const [attempt, setAttempt] = useState(0);

  if (failed) {
    return (
      <div
        className="relative flex h-full w-full items-center justify-center bg-black"
        style={{
          backgroundImage: `url(${poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-void/80" />
        <div className="relative flex flex-col items-center gap-3 p-6 text-center">
          <p className="max-w-sm text-balance leading-relaxed text-ivory">
            This one won&rsquo;t play right now.
          </p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setAttempt((n) => n + 1);
            }}
            className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <video
      key={attempt}
      className="h-full w-full bg-black"
      controls
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={title}
      onError={() => setFailed(true)}
    >
      <source src={`/api/stream/${slug}`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
