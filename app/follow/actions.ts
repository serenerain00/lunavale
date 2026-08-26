"use server";

/**
 * Joining the list.
 *
 * NO ACCOUNT REQUIRED, and that is the entire point. The people worth
 * collecting here are the ones who arrived from a clip, watched something,
 * liked it, and are not going to spend eight dollars on a first visit. An
 * account would ask them for more than the thing they came to do.
 *
 * Spam is handled the way /help and /watch handle it: a honeypot field and a
 * hard length limit, not a captcha. A junk row costs one line on /admin.
 *
 * WHAT IT DOES NOT DO: send anything. No welcome mail, no confirmation loop,
 * no drip. The address goes in a table and Melissa writes to it when there is
 * something to say. See lib/db/followers.ts for why single opt-in is the right
 * call at this size.
 */

import { getVideo } from "@/lib/content/videos";
import { authConfigured } from "@/lib/billing/provider";
import {
  addFollower,
  databaseConfigured,
  looksLikeEmail,
  normaliseEmail,
  MAX_EMAIL,
} from "@/lib/db/followers";

export interface FollowResult {
  ok: boolean;
  error?: string;
}

export async function joinList(formData: FormData): Promise<FollowResult> {
  if (!databaseConfigured()) {
    return { ok: false, error: "That isn't reaching us right now." };
  }

  // Honeypot: hidden from people and from screen readers; bots fill it.
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const email = normaliseEmail(String(formData.get("email") ?? ""));
  if (!email) return { ok: false, error: "Put an address in first." };
  if (email.length > MAX_EMAIL) {
    return { ok: false, error: "That address is too long." };
  }
  if (!looksLikeEmail(email)) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  // WHERE THEY WERE STANDING, validated rather than trusted. A server action
  // is a public endpoint, and a source string invented by a caller would make
  // the one question this column exists to answer unanswerable.
  const raw = String(formData.get("source") ?? "").trim();
  let source: string;
  if (raw === "survey") {
    source = "survey";
  } else if (raw.startsWith("scene:") && getVideo(raw.slice(6))) {
    source = raw;
  } else {
    // Not an error worth showing anybody — the address is the thing that
    // matters, and refusing it over a mislabelled origin would be the tail
    // wagging the dog.
    source = "unknown";
  }

  let userId: string | null = null;
  if (authConfigured()) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      userId = (await auth()).userId ?? null;
    } catch {
      // Signed out, or Clerk is having a bad day. Neither is a reason to lose
      // the address.
      userId = null;
    }
  }

  try {
    await addFollower({ email, source, userId });
  } catch (err) {
    console.error("follow: insert failed", err);
    return { ok: false, error: "That didn't save. Try once more?" };
  }

  return { ok: true };
}
