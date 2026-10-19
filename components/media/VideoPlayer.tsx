/**
 * VideoPlayer — cinematic playback surface over the gated stream route.
 * No autoplay-with-sound (content rule). Poster shows until play.
 *
 * Handles a failed source explicitly. When /api/stream returns anything other
 * than video — media not uploaded, an expired signed URL, a network drop — the
 * browser's own response is to gray out the controls and say nothing, which
 * reads as "this site is broken" and gives the viewer nothing to do. A missing
 * file is a real state and gets a real message.
 */
"use client";

import { clarityEvent } from "@/components/analytics/clarity";
import { useRef, useState } from "react";
import { useViewer } from "@/components/access/Viewer";
import {
  FIRST_TOUCH_COOKIE,
  LAST_TOUCH_COOKIE,
  decodeTouch,
} from "@/lib/analytics/attribution";

/**
 * "instagram" if this visit came from Instagram by either route we can see:
 * the attribution cookies (a tagged link, Instagram's link shim — see
 * lib/analytics/attribution.ts), or Instagram's/Facebook's in-app browser,
 * which names itself in the user agent for the whole visit.
 */
export function playSource(): "instagram" | "facebook" | "other" {
  const touches = [FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE].map((name) =>
    decodeTouch(document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1]),
  );
  if (touches.some((t) => t?.s === "instagram")) return "instagram";
  if (touches.some((t) => t?.s === "facebook")) return "facebook";
  // Instagram's in-app browser names itself "Instagram"; Facebook's says
  // FBAN/FBAV. Until 2026-10-18 both were counted as Instagram, which hid the
  // whole Facebook launch inside the Instagram number.
  if (/Instagram/.test(navigator.userAgent)) return "instagram";
  return /FBAN|FBAV/.test(navigator.userAgent) ? "facebook" : "other";
}

interface VideoPlayerProps {
  slug: string;
  poster: string;
  title: string;
  /**
   * Fired when playback reaches the end. The panel it opens lives BELOW the
   * player rather than over the last frame, which is why this is a callback
   * to a parent instead of state held in here.
   */
  onEnded?: () => void;
  /** Fired on every play; SceneWatch uses the first to show PlayJoin. */
  onPlay?: () => void;
}

export function VideoPlayer({
  slug,
  poster,
  title,
  onEnded,
  onPlay,
}: VideoPlayerProps) {
  const [failed, setFailed] = useState(false);
  // Changing the key remounts the element, which is the only reliable way to
  // make a <video> re-attempt a source it has already given up on.
  const [attempt, setAttempt] = useState(0);
  // One count per player, on the first play — pausing and resuming, or the
  // retry remount above, is the same person still watching.
  const counted = useRef(false);
  const viewer = useViewer();

  function countPlay() {
    if (counted.current) return;
    counted.current = true;
    clarityEvent("video_play");
    try {
      navigator.sendBeacon(
        "/api/play",
        JSON.stringify({
          slug,
          viewer: viewer?.member ? "member" : viewer?.signedIn ? "free" : "anon",
          source: playSource(),
        }),
      );
    } catch {
      // A missed count is not worth an error in front of somebody watching.
    }
  }

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
      onPlay={() => {
        countPlay();
        onPlay?.();
      }}
      onEnded={onEnded}
    >
      <source src={`/api/stream/${slug}`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
