"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  sendSceneComment,
  type CommentResult,
} from "@/app/watch/actions";
import { MAX_COMMENT_BODY } from "@/lib/content/comments";
import { FollowForm } from "@/components/follow/FollowForm";

/**
 * What appears under a scene once it has finished playing.
 *
 * WHEN IT SHOWS: only after `ended` fires on the player. Not on load, not on
 * a timer, not on scroll. Somebody who watched the whole thing has earned the
 * right to be asked something; somebody who is still watching has not, and a
 * panel that appears mid-scene is an interruption of the exact thing this site
 * exists to deliver (MONETIZATION.md — a locked door may be a locked door, it
 * may not be a pitch that follows you around).
 *
 * IT APPEARS IN THE PAGE, BELOW THE PLAYER — never as an overlay across the
 * final frame. The last shot of a scene is part of the scene.
 *
 * THE COMMENT IS PRIVATE and the form says so plainly. Promising a comment
 * thread and then quietly filing it in an admin page would be the sort of
 * small dishonesty that costs more than the feature is worth.
 */
export function AfterWatch({
  slug,
  surveyAnswered,
  preview,
}: {
  slug: string;
  /** Hide the survey ask from somebody who has already answered it. */
  surveyAnswered: boolean;
  /**
   * They reached the end of the PREVIEW, not the end of the scene. Worth
   * distinguishing in the copy: telling somebody who saw sixty seconds that
   * "that's the end of it" is untrue, and they know it is untrue, which is a
   * poor moment to ask them what they thought.
   */
  preview: boolean;
}) {
  const [state, action, pending] = useActionState<
    CommentResult | null,
    FormData
  >(async (_prev, formData) => sendSceneComment(formData), null);

  return (
    <section
      aria-labelledby="after-watch"
      // Announced politely: a screen reader user who has just finished the
      // scene is told this arrived, without it stealing focus mid-sentence.
      aria-live="polite"
      className="mt-6 rounded-xl border border-amber/25 bg-amber/[0.04] p-5 sm:p-6"
    >
      <h2
        id="after-watch"
        className="font-display text-xl font-light text-ivory sm:text-2xl"
      >
        {state?.ok
          ? "She'll read it. Thank you."
          : preview
            ? "That's as far as the preview goes."
            : "That's the end of it."}
      </h2>

      {state?.ok ? (
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone">
          It goes straight to Melissa with the name of the scene attached, which
          is more useful to her than you might think.
        </p>
      ) : (
        <>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone">
            {preview
              ? "Even on that much — what did you make of it? This goes to Melissa. It isn't posted publicly and nobody else sees it."
              : "What did you make of it? This goes to Melissa — it isn't posted publicly and nobody else sees it."}
          </p>

          <form action={action} className="mt-4">
            <div aria-hidden className="hidden">
              <label htmlFor={`website-${slug}`}>Website</label>
              <input
                id={`website-${slug}`}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <input type="hidden" name="scene" value={slug} />

            <label htmlFor={`comment-${slug}`} className="sr-only">
              What did you think of this scene?
            </label>
            <textarea
              id={`comment-${slug}`}
              name="body"
              rows={3}
              maxLength={MAX_COMMENT_BODY}
              placeholder="What worked, what didn't, what you want to happen next…"
              className="w-full rounded-lg border border-hairline bg-void px-4 py-3 text-base leading-relaxed text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
            />

            {state?.error && (
              <p role="alert" className="mt-2 text-sm text-amber-soft">
                {state.error}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send it to her"}
              </button>
              <span className="text-xs text-stone-dim">
                No account, no email.
              </span>
            </div>
          </form>
        </>
      )}

      {/* THE ADDRESS, at the other moment worth asking: somebody has just
          watched the whole thing, or run out of preview wanting more.

          It sits BELOW the comment form and behind a rule, because the comment
          form promises "no account, no email" and that promise has to stay
          true. This is plainly a separate, optional thing they can ignore —
          not a condition attached to being heard.

          Note what is NOT here: no "join to unlock", no discount for an
          address, nothing that makes the list a cheaper membership. It is the
          third option for the many people who like this and are not going to
          pay for it today, and its only offer is being told when there is more
          (MONETIZATION.md — the conversion moments are the story's, not the
          interface's). */}
      <div className="mt-5 border-t border-hairline pt-4">
        <FollowForm
          source={`scene:${slug}`}
          compact
          label={
            preview
              ? "Want to know when the next one goes up?"
              : "Want to know when there's another?"
          }
          note="An email when a new scene or a page of her journal lands. Nothing else, and you can stop any time."
          done="You're on the list. You'll hear when the next one lands."
        />
      </div>

      {!surveyAnswered && (
        <p className="mt-5 border-t border-hairline pt-4 text-sm leading-relaxed text-stone">
          There are also six questions about where this should go next —
          including whether it should be a series or a film.{" "}
          <Link
            href="/survey"
            className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
          >
            Answer them
          </Link>
          .
        </p>
      )}
    </section>
  );
}
