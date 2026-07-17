/**
 * Preview-membership actions — STUB standing in for Phase 3 auth.
 *
 * These toggle the `lv_member` cookie the entitlement layer reads, so the locked
 * and unlocked experiences are demonstrable before real authentication exists.
 * Replace with sign-in / checkout flows in Phase 3; keep the redirect targets.
 */
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const MEMBER_COOKIE = "lv_member";

export async function enterPreviewMembership() {
  const store = await cookies();
  store.set(MEMBER_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  revalidatePath("/", "layout");
}

export async function exitPreviewMembership() {
  const store = await cookies();
  store.delete(MEMBER_COOKIE);
  revalidatePath("/", "layout");
}
