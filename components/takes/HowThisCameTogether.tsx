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
 * Renders nothing when a scene has no takes, so /watch doesn't need to guard.
 */

import Link from "next/link";
import { TakeReel } from "@/components/takes/TakeReel";
import {
  takeCount,
  takesForScene,
  unusedCount,
} from "@/lib/content/takes";

interface HowThisCameTogetherProps {
  sceneSlug: string;
  /** Decided server-side in lib/access/entitlement.ts — never in this file. */
  member: boolean;
}

export function HowThisCameTogether({
  sceneSlug,
  member,
}: HowThisCameTogetherProps) {
  const scene = takesForScene(sceneSlug);
  if (!scene || scene.beats.length === 0) return null;

  const total = takeCount(scene);
  const unused = unusedCount(scene);
  const beats = scene.beats.length;

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
        order they were made. {unused} of them never made it in — the near
        misses, the ones where a hand lands wrong, and the genuinely bad ones.
        Nothing has been tidied up.
      </p>

      {member ? (
        <div className="mt-8">
          {scene.beats.map((beat) => (
            <TakeReel key={beat.id} beat={beat} />
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
