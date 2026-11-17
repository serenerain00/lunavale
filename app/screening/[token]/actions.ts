"use server";

import { cookies } from "next/headers";
import {
  cookieName,
  cookieValue,
  openScreening,
  passwordMatches,
} from "@/lib/db/screenings";

export type UnlockResult = { ok: true } | { ok: false; error: string };

/** Checks the password and, if right, sets the unlock cookie for this film. */
export async function unlock(token: string, formData: FormData): Promise<UnlockResult> {
  const s = await openScreening(token);
  if (!s) return { ok: false, error: "This screening is no longer available." };

  const attempt = String(formData.get("password") ?? "");
  if (!attempt || !passwordMatches(s, attempt)) {
    // A small pause makes guessing slow; the token is already 144 bits.
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "That password isn't right." };
  }

  (await cookies()).set(cookieName(s), cookieValue(s), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: s.closesAt,
  });
  return { ok: true };
}
