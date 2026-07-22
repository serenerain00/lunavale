/**
 * Preview override — seeing the member experience without buying it.
 *
 * Needed for two reasons that don't go away: the member UI has to be
 * reviewable while it's being built, and once billing is live the only other
 * way to look at it is to actually pay every time.
 *
 * This is a back door, so it is built like one:
 *
 *   In development it is open, because the alternative is friction on every
 *   local run and nothing here is reachable from the internet.
 *
 *   In production it does nothing at all unless PREVIEW_SECRET is set, and
 *   then only for a request carrying that secret. No secret in the
 *   environment means the door is not merely locked, it isn't in the wall.
 *
 *   The secret is compared in constant time, so the endpoint can't be used to
 *   guess it a character at a time.
 *
 *   Anything it unlocks is labelled. `getMembership().preview` stays true, so
 *   PreviewNotice keeps telling you this isn't a real membership — the one
 *   thing worse than a back door is one you forget you're standing in.
 */

import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getTier, type TierId } from "@/lib/content/membership";

export const PREVIEW_COOKIE = "lv_preview";

/** Whether the override exists in this environment at all. */
export function previewAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return Boolean(process.env.PREVIEW_SECRET);
}

/** Whether a supplied key may switch preview on. */
export function previewKeyValid(key: string | undefined): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const secret = process.env.PREVIEW_SECRET;
  if (!secret || !key) return false;

  // Length differences leak through timingSafeEqual (it throws), so compare
  // fixed-width digests rather than the raw strings.
  const a = Buffer.from(sha(key));
  const b = Buffer.from(sha(secret));
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The cookie value to write for a tier.
 *
 * SIGNED, because a cookie is client-controlled. Guarding only the page that
 * sets it would be theatre: anyone could read the cookie name out of this
 * source and hand themselves `lv_preview=vault`. The signature means forging
 * one requires PREVIEW_SECRET, which is the thing actually being protected.
 */
export function previewCookieValue(tier: TierId): string {
  const secret = process.env.PREVIEW_SECRET;
  return secret ? `${tier}.${sign(tier, secret)}` : tier;
}

/**
 * The tier this request is previewing, if any.
 *
 * Re-checks `previewAllowed()` on every read rather than trusting that the
 * cookie could only have been set legitimately: unsetting PREVIEW_SECRET must
 * close the door on sessions already holding it open.
 */
export async function previewTier(): Promise<TierId | undefined> {
  if (!previewAllowed()) return undefined;

  const raw = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (!raw) return undefined;

  const secret = process.env.PREVIEW_SECRET;
  if (!secret) {
    // previewAllowed() has already established this is not production, so an
    // unsigned value is acceptable — there is no secret to sign with.
    return getTier(raw)?.id;
  }

  const [tier, signature] = raw.split(".");
  if (!tier || !signature) return undefined;
  if (!constantTimeEqual(signature, sign(tier, secret))) return undefined;

  return getTier(tier)?.id;
}

function sign(tier: string, secret: string): string {
  return createHmac("sha256", secret).update(tier).digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  const left = Buffer.from(sha(a));
  const right = Buffer.from(sha(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function sha(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}
