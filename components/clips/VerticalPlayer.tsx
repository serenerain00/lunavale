/**
 * VerticalPlayer — a 9:16 clip, played the way it was shot.
 *
 * These ran on Instagram, so the expectation is a phone-shaped frame that
 * starts playing on its own. The compromise the platform rules force, and the
 * right one: it autoplays MUTED, with the sound control as the largest thing
 * on the surface. Autoplay with sound is banned outright, and it is also how
 * you get someone's speakers blaring in an office.
 *
 * Reduced motion turns autoplay off entirely and leaves the poster and the
 * standard controls — a clip that starts moving by itself is exactly what that
 * preference is asking us not to do.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/content/clips";

interface VerticalPlayerProps {
  clip: Clip;
}

export function VerticalPlayer({ clip }: VerticalPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // play() rejects when the browser declines autoplay. That is a normal
    // outcome, not an error — the poster and controls are still there.
    void video.play().catch(() => {});
  }, []);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    // Unmuting is a deliberate act, so start it playing if it wasn't.
    if (!next) void video.play().catch(() => {});
  };

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="relative overflow-hidden rounded-xl bg-black ring-1 ring-hairline">
        <video
          ref={videoRef}
          // aspect-[9/16] on the wrapper would fight a clip that isn't exactly
          // 9:16; letting the element size itself keeps every clip honest.
          className="block h-auto w-full"
          poster={clip.poster}
          controls
          playsInline
          loop
          muted
          preload="metadata"
          aria-label={clip.title}
        >
          <source src={`/api/stream/${clip.id}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={!muted}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline px-5 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
      >
        {muted ? <MutedGlyph /> : <SoundGlyph />}
        {muted ? "Turn the sound on" : "Mute"}
      </button>
    </div>
  );
}

function SoundGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MutedGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 5L6 9H3v6h3l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5l5 5m0-5l-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
