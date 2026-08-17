"use client";

import { useState } from "react";
import { AfterWatch } from "@/components/media/AfterWatch";
import { VideoPlayer } from "@/components/media/VideoPlayer";

/**
 * The player and whatever comes after it.
 *
 * This exists because "has it finished" is client state and the thing it opens
 * has to render UNDERNEATH the player, in the page — so the flag cannot live
 * inside VideoPlayer, and the watch page is a server component and cannot hold
 * it either. One small client boundary around both, and the page keeps its
 * server rendering, its metadata and its access checks.
 *
 * ONCE SHOWN, IT STAYS. Replaying the scene does not take the comment box away
 * mid-sentence, which is exactly what somebody typing into it would do to
 * themselves by hitting play again to check a detail.
 */
export function SceneWatch({
  slug,
  poster,
  title,
  surveyAnswered,
  preview,
}: {
  slug: string;
  poster: string;
  title: string;
  surveyAnswered: boolean;
  /** What just ended was the public preview, not the whole scene. */
  preview: boolean;
}) {
  const [finished, setFinished] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-black ring-1 ring-hairline">
        <div className="relative aspect-video">
          <VideoPlayer
            slug={slug}
            poster={poster}
            title={title}
            onEnded={() => setFinished(true)}
          />
        </div>
      </div>

      {finished && (
        <AfterWatch
          slug={slug}
          surveyAnswered={surveyAnswered}
          preview={preview}
        />
      )}
    </>
  );
}
