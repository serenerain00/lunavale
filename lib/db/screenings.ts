/**
 * Private screenings — a festival's view of one film, behind a password.
 *
 * Not content. Nothing here is in a catalog, sitemap or menu, and neither
 * membership tier opens it: the only key is the unguessable token in the URL
 * plus the password. Rows are made by scripts/screening.mjs, which explains
 * the why (2026-11-16, Melissa's festival submission).
 *
 * The unlock cookie is an HMAC of the token under a per-screening secret, so
 * issuing a new password (which rotates the secret) signs everybody out.
 */

import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

export interface Screening {
  token: string;
  title: string;
  credit: string | null;
  blobPath: string;
  posterPath: string | null;
  passwordHash: string;
  cookieSecret: string;
  closesAt: Date;
}

/** Only token-shaped strings ever reach the database. */
const TOKEN = /^[A-Za-z0-9_-]{24}$/;

export async function openScreening(token: string): Promise<Screening | null> {
  if (!TOKEN.test(token) || !process.env.DATABASE_URL) return null;
  const rows = (await neon(process.env.DATABASE_URL)`
    SELECT token, title, credit, blob_path, poster_path, password_hash,
           cookie_secret, closes_at
    FROM screenings WHERE token = ${token} AND closes_at > now()
  `) as Record<string, unknown>[];
  const r = rows[0];
  if (!r) return null;
  return {
    token: r.token as string,
    title: r.title as string,
    credit: (r.credit as string | null) ?? null,
    blobPath: r.blob_path as string,
    posterPath: (r.poster_path as string | null) ?? null,
    passwordHash: r.password_hash as string,
    cookieSecret: r.cookie_secret as string,
    closesAt: new Date(r.closes_at as string),
  };
}

export function passwordMatches(s: Screening, attempt: string): boolean {
  const [saltHex, hashHex] = s.passwordHash.split(":");
  if (!saltHex || !hashHex) return false;
  const want = Buffer.from(hashHex, "hex");
  const got = scryptSync(attempt.trim(), Buffer.from(saltHex, "hex"), want.length);
  return timingSafeEqual(want, got);
}

export function cookieName(s: Screening): string {
  return `scr_${s.token.slice(0, 8)}`;
}

export function cookieValue(s: Screening): string {
  return createHmac("sha256", s.cookieSecret).update(s.token).digest("base64url");
}

export function unlocked(s: Screening, value: string | undefined): boolean {
  if (!value) return false;
  const want = Buffer.from(cookieValue(s));
  const got = Buffer.from(value);
  return want.length === got.length && timingSafeEqual(want, got);
}
