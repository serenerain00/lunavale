"use client";

import { useState } from "react";
import { VerticalPlayer } from "@/components/posts/VerticalPlayer";
import { StarRating } from "@/components/media/StarRating";
import type { Clip } from "@/lib/content/posts";

/**
 * A post's player and the stars after it — the vertical counterpart of
 * SceneWatch, for the same reason: "has it finished" is client state, and the
 * post page is a server component.
 *
 * Shown once the clip has played through the first time, in the page below
 * the frame, never over it. Once shown it stays, through every loop.
 */
export function PostWatch({ clip, preview }: { clip: Clip; preview: boolean }) {
  const [through, setThrough] = useState(false);

  return (
    <>
      <VerticalPlayer clip={clip} onPlayedThrough={() => setThrough(true)} />
      {through && (
        <section
          aria-label="Rate this post"
          aria-live="polite"
          className="mx-auto mt-4 max-w-sm rounded-xl border border-amber/25 bg-amber/[0.04] px-4 py-3"
        >
          <StarRating
            kind="post"
            slug={clip.id}
            prompt={preview ? "Even on that much, how was it?" : "How was it?"}
          />
        </section>
      )}
    </>
  );
}
