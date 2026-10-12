"use client";

import { useState } from "react";
import { assignVariant, trackOnce } from "@/components/analytics/experiments";
import { AfterWatch } from "@/components/media/AfterWatch";
import { PreviewEndCard } from "@/components/media/PreviewEndCard";
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
  watched,
  price,
}: {
  slug: string;
  poster: string;
  title: string;
  surveyAnswered: boolean;
  /** What just ended was the public preview, not the whole scene. */
  preview: boolean;
  /** For the preview-card experiment: "the first 1:00 of 18:36". */
  watched?: string;
  /** For the preview-card experiment: the membership price, "$8". */
  price?: string;
}) {
  const [finished, setFinished] = useState(false);
  const [card, setCard] = useState(false);

  function ended() {
    setFinished(true);
    // A/B: reaching the end of a preview is the exposure. Assignment happens
    // here, at the moment the two arms start to differ, so everybody counted
    // actually saw (or did not see) the card. Outside the experiment's dates
    // assignVariant() returns null and this is today's behaviour exactly.
    if (!preview || !watched || !price) return;
    const variant = assignVariant("preview-card");
    if (!variant) return;
    trackOnce("preview-card", "exposed");
    if (variant === "card") setCard(true);
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-black ring-1 ring-hairline">
        <div className="relative aspect-video">
          <VideoPlayer
            slug={slug}
            poster={poster}
            title={title}
            onEnded={ended}
          />
          {card && watched && price && (
            <PreviewEndCard
              watched={watched}
              title={title}
              price={price}
              onDismiss={() => setCard(false)}
            />
          )}
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
