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
  /**
   * Whether the loop should be silent. Owned by the parent, because the button
   * that toggles it has to live in the hero's copy layer — this element sits
   * in a `-z-10` container and nothing inside it can be clicked.
   */
  muted?: boolean;
  /**
   * Called when the browser REFUSES to unmute, so the parent can put its
   * button back to "muted" instead of showing a sound icon over silence.
   *
   * This is not a rare path. Autoplay with sound is blocked for any visitor
   * without prior engagement on the domain, so a remembered "sound on"
   * preference is an intention, not a guarantee, and the UI has to be able to
   * be told it did not happen.
   */
  onSoundRefused?: () => void;
}

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

export function AmbientVideo({
  src,
  poster,
  muted = true,
  onSoundRefused,
}: AmbientVideoProps) {
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

  /*
   * Mute state is applied IMPERATIVELY, not as a prop.
   *
   * React does not reliably reflect `muted` into the DOM element — it is one
   * of the handful of properties it sets once at mount — so a controlled
   * `muted={...}` silently stops working after the first toggle. Setting it on
   * the node is the only version that holds.
   *
   * Unmuting an already-playing video is normally allowed without a gesture;
   * what browsers refuse is STARTING playback with sound. Safari can pause it
   * anyway, so play() is re-issued and a rejection is reported upward rather
   * than leaving a sound button on over a silent or stopped video.
   */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
    if (muted) return;
    void el.play().catch(() => {
      el.muted = true;
      onSoundRefused?.();
    });
  }, [muted, enabled, onSoundRefused]);

  if (!enabled) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      // Always muted for the FIRST play: every browser refuses autoplay with
      // sound for a visitor with no prior engagement, and a refused play()
      // leaves a still frame instead of a hero. The effect above turns sound
      // on afterwards if it was asked for.
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
