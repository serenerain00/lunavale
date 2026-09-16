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
 *   - the browser reports a slow connection or Data Saver
 *
 * IT USED TO REFUSE ON PHONES TOO, below 640px, "where a decorative background
 * costs mobile data for something nobody came for". That was the right call
 * while the loop was decoration behind a generic headline. It stopped being
 * true on 2026-09-16, when the hero became the newest clip playing itself —
 * Melissa: "netflix has their hero auto play a clip from a series… gets the
 * visitors attention right away." Refusing on the device most of this
 * audience arrives on would have been refusing to ship the thing she asked
 * for.
 *
 * WHAT THAT COSTS, stated plainly: about 2–3MB of cellular data per visit for
 * a 24–30s loop. It is served straight from /public through the CDN, so it is
 * a cached static asset rather than a function invocation, and it cannot
 * repeat the August bill. Data Saver and 2g still opt out, which is the case
 * the width check was really standing in for.
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

    const connection = (
      navigator as Navigator & { connection?: NetworkInformation }
    ).connection;
    const thrifty =
      connection?.saveData === true ||
      (connection?.effectiveType != null &&
        /2g/.test(connection.effectiveType));

    const decide = () => setEnabled(!motion.matches && !thrifty);
    decide();

    // Someone who turns Reduce Motion on mid-visit gets the decision re-made
    // rather than being stuck with it.
    motion.addEventListener("change", decide);
    return () => motion.removeEventListener("change", decide);
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
