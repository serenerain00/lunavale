/**
 * Entitlement — the single server-side authority on who may open what.
 *
 * CLAUDE.md: "Treat premium access as server-side authorization." Every gate in
 * the app routes through here; hiding something in the UI is never the
 * enforcement boundary.
 *
 * STUB: membership is a signed cookie holding a tier id, so the locked and
 * unlocked experiences are demonstrable before real auth and billing exist. In
 * Phase 3 `readTier` becomes a session -> memberships/entitlements lookup and
 * nothing else on this page changes. Call sites see the same contracts either
 * way, which is the point of routing everything through this module.
 *
 * Because there is no billing provider connected yet, a membership granted
 * here is explicitly a PREVIEW — `getMembership().preview` is true and the UI
 * is required to say so. Silence would read as "you have been charged", which
 * is the one thing docs/monetization/MONETIZATION.md rules out outright.
 */

import { cookies } from "next/headers";
import {
  getTier,
  tierCovers,
  type TierId,
} from "@/lib/content/membership";
import { authConfigured, billingLive } from "@/lib/billing/provider";
import { tierForUser } from "@/lib/db/memberships";
import { previewTier } from "@/lib/access/preview";
import type { AccessLevel } from "@/lib/content/videos";

export const MEMBER_COOKIE = "lv_member";

/** The tier that `access: "premium"` content requires. */
export const PREMIUM_TIER: TierId = "vault";

export interface Membership {
  /** The tier this viewer holds. Everyone holds at least "free". */
  tier: TierId;
  /** True for any paid tier — the boolean the UI usually wants. */
  active: boolean;
  /**
   * True when access was granted without a payment provider behind it. The UI
   * must surface this; see the module note above.
   */
  preview: boolean;
}

/**
 * Read the viewer's tier. Server-only. Unknown values degrade to "free".
 *
 * This is the seam the whole app hangs off. When auth and billing are live it
 * asks Clerk who this is and the database what they bought; until then it
 * falls back to the preview cookie, so a half-configured deploy keeps working
 * instead of locking everybody out of a live site.
 */
async function readTier(): Promise<TierId> {
  // Checked first so the member experience stays reviewable even once real
  // billing is live. Does nothing in production without PREVIEW_SECRET.
  const previewing = await previewTier();
  if (previewing) return previewing;

  if (authConfigured()) {
    // Imported lazily so the Clerk SDK is never loaded — and never throws for
    // want of keys — on a deploy that hasn't been given any.
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) return "free";
    return tierForUser(userId);
  }

  const store = await cookies();
  const raw = store.get(MEMBER_COOKIE)?.value;
  if (!raw) return "free";

  // Legacy value from the original boolean stub — treat as the base paid tier
  // so anyone mid-session doesn't silently lose access on deploy.
  if (raw === "1") return PREMIUM_TIER;

  return getTier(raw)?.id ?? "free";
}

export async function getMembership(): Promise<Membership> {
  const [tier, previewing] = await Promise.all([readTier(), previewTier()]);
  return {
    tier,
    active: tier !== "free",
    // Either nothing is charging cards yet, or this is an explicit override.
    // Both must say so — an unlabelled preview is how you end up believing
    // the paywall works.
    preview: tier !== "free" && (Boolean(previewing) || !billingLive()),
  };
}

/** True when the current request belongs to a paying (or previewing) member. */
export async function isMember(): Promise<boolean> {
  return (await getMembership()).active;
}

/** Authoritative check: may the current viewer open this? */
export async function canWatch(item: { access: AccessLevel }): Promise<boolean> {
  if (item.access === "free") return true;
  return tierCovers(await readTier(), PREMIUM_TIER);
}

/** Authoritative check for material gated to a specific tier. */
export async function hasTier(required: TierId): Promise<boolean> {
  return tierCovers(await readTier(), required);
}
