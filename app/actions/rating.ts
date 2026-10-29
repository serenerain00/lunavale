"use server";

/**
 * Rating a clip or a post, one tap at the end of it.
 *
 * NO ACCOUNT REQUIRED, for the reason in app/clips/actions.ts. The piece is
 * checked against the catalog rather than trusted (a server action is a public
 * endpoint), and a rating is attributed to a random per-browser key so tapping
 * again changes the vote instead of adding one.
 */

import { getVideo } from "@/lib/content/videos";
import { clipAccess, getClip } from "@/lib/content/posts";
import { canWatch } from "@/lib/access/entitlement";
import { databaseConfigured, saveRating } from "@/lib/db/ratings";
import { authConfigured } from "@/lib/billing/provider";
import type { RatingKind } from "@/lib/content/ratings";

export interface RatingResult {
  ok: boolean;
  error?: string;
}

export async function rate(input: {
  kind: RatingKind;
  slug: string;
  stars: number;
  viewerKey: string;
}): Promise<RatingResult> {
  if (!databaseConfigured()) {
    return { ok: false, error: "Ratings aren't reaching us right now." };
  }

  const stars = Math.round(Number(input.stars));
  if (!(stars >= 1 && stars <= 5)) return { ok: false, error: "Pick one to five stars." };

  // A uuid from the browser. Bounded so nobody can store an essay in it.
  const viewerKey = String(input.viewerKey ?? "");
  if (!/^[A-Za-z0-9-]{8,64}$/.test(viewerKey)) {
    return { ok: false, error: "That didn't save. Try once more?" };
  }

  let wasMember: boolean;
  if (input.kind === "clip") {
    const video = getVideo(input.slug);
    if (!video) return { ok: false, error: "That clip doesn't exist." };
    wasMember = await canWatch(video);
  } else if (input.kind === "post") {
    const clip = getClip(input.slug);
    if (!clip) return { ok: false, error: "That post doesn't exist." };
    wasMember = await canWatch({ access: clipAccess(clip) });
  } else {
    return { ok: false, error: "That didn't save. Try once more?" };
  }

  let userId: string | null = null;
  if (authConfigured()) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      userId = (await auth()).userId ?? null;
    } catch {
      userId = null;
    }
  }

  try {
    await saveRating({ kind: input.kind, slug: input.slug, stars, viewerKey, userId, wasMember });
  } catch {
    return { ok: false, error: "That didn't save. Try once more?" };
  }
  return { ok: true };
}
