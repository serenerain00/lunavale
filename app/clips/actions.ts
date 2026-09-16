"use server";

/**
 * Leaving a comment on a scene, at the moment you finish it.
 *
 * NO ACCOUNT REQUIRED. The people most worth hearing from here arrived from
 * Instagram, watched a preview, and have no login — gating this would collect
 * feedback only from people who already pay, which is the group whose opinion
 * is least in doubt.
 *
 * Spam is handled the way /help handles it: a honeypot and a hard length
 * limit, not a captcha. These are never published, so the blast radius of a
 * junk row is one line on /admin rather than something live on the site.
 */

import { getVideo } from "@/lib/content/videos";
import { canWatch } from "@/lib/access/entitlement";
import {
  MAX_COMMENT_BODY,
  addSceneComment,
  databaseConfigured,
} from "@/lib/db/comments";
import { authConfigured } from "@/lib/billing/provider";

export interface CommentResult {
  ok: boolean;
  error?: string;
}

export async function sendSceneComment(
  formData: FormData,
): Promise<CommentResult> {
  if (!databaseConfigured()) {
    return { ok: false, error: "Comments aren't reaching us right now." };
  }

  // Honeypot: hidden from people and from screen readers; bots fill it.
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const slug = String(formData.get("scene") ?? "").trim();
  const video = getVideo(slug);
  // Checked against the catalog rather than trusted: a server action is a
  // public endpoint, and a comment filed against a scene that does not exist
  // is a row Melissa can never make sense of.
  if (!video) return { ok: false, error: "That scene doesn't exist." };

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Nothing to send yet." };
  if (body.length > MAX_COMMENT_BODY) {
    return {
      ok: false,
      error: `That's longer than ${MAX_COMMENT_BODY} characters.`,
    };
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

  // Recorded because it changes what the words mean. "That ended too soon"
  // from somebody who saw the sixty-second preview is a different sentence
  // from the same words after the whole scene.
  const wasMember = await canWatch(video);

  try {
    await addSceneComment({ sceneSlug: slug, body, userId, wasMember });
  } catch {
    return { ok: false, error: "That didn't save. Try once more?" };
  }
  return { ok: true };
}
