/**
 * AmbientVideo — a silent looping backdrop that knows when not to play.
 *
 * The poster image is always rendered by the parent underneath; this only ever
 * layers moving footage on top of it. So every refusal below degrades to a
 * perfectly good still hero rather than a hole in the page.
 *
 * It declines to load the video when:
 *   - the viewer prefers reduced motion (a full-bleed moving backdrop is
 *     exactly the kind of thing that rule exists for)
 *   - the screen is phone-sized, where a decorative background costs mobile
 *     data for something nobody came for
 *   - the browser reports a slow connection or Data Saver
 *
 * The <video> element is only mounted once those checks pass, so the bytes are
 * never requested in the cases above — `preload="none"` alone wouldn't be
 * enough, since a playing video downloads regardless.
 */
"use client";

import { useEffect, useRef, useState } from "react";

interface AmbientVideoProps {
  src: string;
  poster: string;
}

/** Below this width, the still hero is the better trade. */
const MIN_WIDTH = 640;

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

export function AmbientVideo({ src, poster }: AmbientVideoProps) {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);

    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;
    const thrifty =
      connection?.saveData === true ||
      (connection?.effectiveType != null &&
        /2g/.test(connection.effectiveType));

    const decide = () => setEnabled(!motion.matches && wide.matches && !thrifty);
    decide();

    // Someone who turns on Reduce Motion, or rotates a tablet into a phone-ish
    // width, gets the decision re-made rather than being stuck with it.
    motion.addEventListener("change", decide);
    wide.addEventListener("change", decide);
    return () => {
      motion.removeEventListener("change", decide);
      wide.removeEventListener("change", decide);
    };
  }, []);

  if (!enabled) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      // Decorative: the poster underneath carries the same image, and the
      // heading beside it carries the meaning.
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      // Cross-fade in over the poster so a slow start is a settle, not a snap.
      // If autoplay is refused outright, `ready` stays false and this simply
      // never becomes visible — the poster is still there.
      className={`absolute inset-0 size-full object-cover transition-opacity duration-(--duration-cinematic) ease-(--ease-cinematic) ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
