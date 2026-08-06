/**
 * "How this came together" — the cutting-room floor, under the finished scene.
 *
 * Placed here rather than in a destination of its own because this is the
 * moment someone is most curious: they have just watched the scene, and the
 * question "how much of this was luck" is already in the room. It answers by
 * showing the work.
 *
 * The locked state states the real numbers — how many attempts, how many never
 * made it in — and shows no frames at all. That is the honest trade: a visitor
 * learns exactly what is behind the door without being handed any of it. Per
 * docs/monetization/MONETIZATION.md it says its piece once and links out; it
 * does not follow anybody around.
 *
 * WHEN NOTHING IS STARRED the summary says so instead of counting. `unused`
 * is "takes without a star", and the default copy calls that "never made it
 * in" — which is true when the starring is reliable and a lie when it isn't.
 * On a scene shot as one continuous take in one setup, frame-matching cannot
 * separate the attempts at all (measured: zero gap between best and
 * runner-up), so every take is unstarred and the default line would assert
 * that 250 clips were all rejected. They were not; we just cannot tell which.
 *
 * Renders nothing when a scene has no takes, so /watch doesn't need to guard.
 */

import Link from "next/link";
import { TakeReel } from "@/components/takes/TakeReel";
import {
  takeCount,
  takesForScene,
  unusedCount,
} from "@/lib/content/takes";
import { signTakePosters } from "@/lib/media/presign";

interface HowThisCameTogetherProps {
  sceneSlug: string;
  /** Decided server-side in lib/access/entitlement.ts — never in this file. */
  member: boolean;
}

export async function HowThisCameTogether({
  sceneSlug,
  member,
}: HowThisCameTogetherProps) {
  const scene = takesForScene(sceneSlug);
  if (!scene || scene.beats.length === 0) return null;

  const total = takeCount(scene);
  const unused = unusedCount(scene);
  const beats = scene.beats.length;

  // Signed here, once, for the whole grid — and only after `member` has been
  // decided upstream. Twenty-nine tiles used to mean twenty-nine calls to
  // /api/take, and another twenty-nine on every reload, because a 307 is not
  // cacheable. See lib/media/presign.ts. Null (no Blob configured, i.e. local
  // development) falls back to the route, which reads the files off disk.
  const posters = member
    ? await signTakePosters(
        sceneSlug,
        scene.beats.flatMap((b) => b.takes.map((t) => t.slug)),
      )
    : null;

  return (
    <section
      aria-labelledby="how-this-came-together"
      className="mt-14 border-t border-hairline pt-8"
    >
      <h2
        id="how-this-came-together"
        className="font-display text-2xl font-light text-ivory"
      >
        How this came together
      </h2>
      <p className="mt-2 max-w-2xl leading-relaxed text-stone">
        {total} attempts at {beats} {beats === 1 ? "moment" : "moments"}, in the
        order they were made.{" "}
        {unused === total ? (
          <>
            Which of them made the finished scene isn&rsquo;t marked here.
            It is one unbroken take in one setup, and the attempts are too
            alike to tell apart with any confidence — so rather than guess,
            none of them is starred.
          </>
        ) : (
          <>
            {/* Explicit space — a plain one is stripped where the text after
                an expression wraps. See LockedNotice. */}
            {unused}{" "}
            of them never made it in — the near misses, the ones where a hand
            lands wrong, and the genuinely bad ones. Nothing has been tidied
            up.
          </>
        )}
      </p>

      {member ? (
        <div className="mt-8">
          {scene.beats.map((beat) => (
            <TakeReel
              key={beat.id}
              beat={beat}
              posters={posters ? Object.fromEntries(posters) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="mt-5 max-w-2xl rounded-lg border border-hairline px-4 py-3 text-sm leading-relaxed text-stone">
          Members watch all {total} of them.{" "}
          <Link
            href="/membership"
            className="text-amber underline-offset-4 transition-colors duration-(--duration-quick) hover:underline"
          >
            What membership opens
          </Link>
        </div>
      )}
    </section>
  );
}
