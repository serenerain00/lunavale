"use server";

/**
 * Posting to Overheard.
 *
 * The allowance is enforced HERE, on the server, after the auth check — not in
 * the form. A disabled button is a hint; this is the rule. Anyone can call a
 * server action, so the count has to be re-read and re-checked on every write,
 * and it is deliberately checked against the database rather than anything the
 * client sent along.
 */

import { revalidatePath } from "next/cache";
import { authConfigured } from "@/lib/billing/provider";
import { isMember } from "@/lib/access/entitlement";
import {
  FREE_POST_ALLOWANCE,
  MAX_POST_LENGTH,
} from "@/lib/content/overheard";
import {
  addPost,
  databaseConfigured,
  postCountForUser,
} from "@/lib/db/overheard";
import { CAST_THREAD, resolveMention } from "@/lib/content/overheard";

export interface PostResult {
  ok: boolean;
  /** Shown above the form. Deliberately plain — no shaming, per MONETIZATION.md. */
  error?: string;
}

export async function submitPost(formData: FormData): Promise<PostResult> {
  if (!databaseConfigured()) {
    return { ok: false, error: "Overheard isn't available right now." };
  }
  if (!authConfigured()) {
    return { ok: false, error: "Sign-in isn't available right now." };
  }

  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You need an account to post. It's free." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Nothing to post." };
  if (body.length > MAX_POST_LENGTH) {
    return {
      ok: false,
      error: `That's longer than ${MAX_POST_LENGTH} characters. Trim it a little.`,
    };
  }

  // A reply target has to name a line that exists. A cast key is checked
  // against the script; a post key is trusted only in shape, because a post
  // that was later hidden is still a legitimate thing to have replied to and
  // re-querying for it on every write buys nothing.
  const rawReply = String(formData.get("replyTo") ?? "").trim();
  const replyTo =
    /^post:\d+$/.test(rawReply) ||
    (rawReply.startsWith("cast:") &&
      CAST_THREAD.some((m) => `cast:${m.id}` === rawReply))
      ? rawReply
      : null;

  // The allowance. Members are unlimited; everyone else gets three, ever.
  const member = await isMember();
  if (!member) {
    const used = await postCountForUser(userId);
    if (used >= FREE_POST_ALLOWANCE) {
      return {
        ok: false,
        error:
          "That's your three. Join the LunaVerse to keep talking — everything you've already said stays up.",
      };
    }
  }

  // A display name, with fallbacks: Clerk lets people have neither a username
  // nor a first name, and "" next to a post looks like a bug.
  // Melissa posts under her own name with a badge. Checked against the env var,
  // not against whatever she happens to have called herself in Clerk.
  const isOwner = Boolean(
    process.env.OWNER_USER_ID && userId === process.env.OWNER_USER_ID,
  );

  // Melissa can answer in a character's voice. The row still records HER
  // user_id — only the byline changes — so the allowance, the moderation view
  // and any future audit all still point at a real account.
  const rawCast = String(formData.get("castAs") ?? "").trim();
  const castAs =
    isOwner && rawCast && rawCast !== "Melissa" ? resolveMention(rawCast) : null;

  const user = await currentUser();
  const authorName = castAs
    ? castAs
    : isOwner
    ? "Melissa"
    : user?.username?.trim() ||
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      "A visitor";

  await addPost({ userId, authorName, body, replyTo, isOwner, castAs });
  revalidatePath("/overheard");
  return { ok: true };
}
