/**
 * Entitlement — the single server-side authority on who may watch what.
 *
 * CLAUDE.md: "Treat premium access as server-side authorization." Every gate in
 * the app must route through here; UI hiding is never the enforcement boundary.
 *
 * STUB: membership is currently a signed-out/signed-in cookie so the locked and
 * unlocked states are testable locally. In Phase 3 this is replaced by a real
 * auth + entitlements lookup (session -> memberships/entitlements tables). The
 * call sites and the `canWatch` contract stay the same.
 */

import { cookies } from "next/headers";
import type { Video } from "@/lib/content/videos";

const MEMBER_COOKIE = "lv_member";

/** True when the current request belongs to an active member. Server-only. */
export async function isMember(): Promise<boolean> {
  const store = await cookies();
  return store.get(MEMBER_COOKIE)?.value === "1";
}

/** Authoritative check: may the current viewer watch this video? */
export async function canWatch(video: Pick<Video, "access">): Promise<boolean> {
  if (video.access === "free") return true;
  return isMember();
}
