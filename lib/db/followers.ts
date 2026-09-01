/**
 * The list — addresses of people who want to know when something goes up.
 *
 * Same shape as lib/db/help.ts and lib/db/survey.ts: a thin module over Neon,
 * no ORM, and every read degrading to empty when DATABASE_URL is absent so the
 * app runs locally without a database rather than crashing.
 *
 * THIS MODULE DOES NOT SEND ANYTHING. It stores addresses and reads them back
 * for /admin. Mail goes out when Melissa writes it, from her mail provider,
 * which is the only arrangement where a list stays worth being on.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

/** Longest address accepted. The real-world limit is 254 (RFC 5321). */
export const MAX_EMAIL = 254;

/**
 * Is this plausibly an address?
 *
 * Deliberately permissive. The only address validation that is actually
 * correct is sending mail to it, and every regex stricter than this one is
 * known to reject real addresses — apostrophes, plus signs, new top-level
 * domains, non-ASCII. A typo gets caught by the mail bouncing; a valid address
 * turned away at the form is gone for good, which is the more expensive error.
 */
export function looksLikeEmail(value: string): boolean {
  if (value.length < 3 || value.length > MAX_EMAIL) return false;
  const at = value.indexOf("@");
  if (at < 1 || at !== value.lastIndexOf("@")) return false;
  const domain = value.slice(at + 1);
  return domain.includes(".") && !domain.startsWith(".") && !domain.endsWith(".") && !/\s/.test(value);
}

/** Trim and lower-case, so one person is one row. */
export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Add somebody to the list.
 *
 * ON CONFLICT DO NOTHING: signing up twice writes once and reports success
 * both times, which is what the person meant either way. It deliberately does
 * NOT resurrect a row that has been unsubscribed — coming back is something
 * they have to ask for, not something a forgotten form does to them.
 */
export async function addFollower(input: {
  email: string;
  source: string;
  userId?: string | null;
}): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO followers (email, source, user_id)
    VALUES (${input.email}, ${input.source}, ${input.userId ?? null})
    ON CONFLICT (email) DO NOTHING
  `;
}

export interface Follower {
  email: string;
  source: string;
  createdAt: Date;
}

/** How many people are on it. The one number worth watching weekly. */
export async function followerCount(): Promise<number> {
  if (!databaseConfigured()) return 0;
  const rows = (await sql()`
    SELECT count(*)::int AS n FROM followers WHERE unsubscribed_at IS NULL
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}

/** Newest first, for /admin. */
export async function recentFollowers(limit = 200): Promise<Follower[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT email, source, created_at
    FROM followers
    WHERE unsubscribed_at IS NULL
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as { email: string; source: string; created_at: string }[];
  return rows.map((r) => ({
    email: r.email,
    source: r.source,
    createdAt: new Date(r.created_at),
  }));
}

/**
 * Which moments actually earn an address.
 *
 * The reason `source` is recorded at all: the next capture point should go
 * where one already works, rather than wherever seemed likely. Scene sources
 * are rolled up — "scene:luna-josh-break" and "scene:ty-luna-garage" answer
 * the same question, which is whether finishing a scene makes people sign up.
 */
export async function followerSources(): Promise<
  { source: string; count: number }[]
> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT split_part(source, ':', 1) AS source, count(*)::int AS n
    FROM followers
    WHERE unsubscribed_at IS NULL
    GROUP BY 1
    ORDER BY n DESC
  `) as { source: string; n: number }[];
  return rows.map((r) => ({ source: r.source, count: r.n }));
}
