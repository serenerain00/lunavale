/**
 * Overheard storage — the public wall.
 *
 * Reading is open. Posting needs a free account, and a non-member gets
 * FREE_POST_ALLOWANCE posts before the LunaVerse is required to keep talking.
 *
 * The allowance is counted per Clerk user, not per browser: a cookie counter is
 * defeated by a private window, and tying it to a person also means every
 * poster has an email address attached.
 *
 * Guarded on DATABASE_URL like lib/db/memberships.ts — with no database the
 * wall reads as empty and posting reports itself unavailable, rather than
 * throwing and taking the page down.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";

export {
  FREE_POST_ALLOWANCE,
  MAX_POST_LENGTH,
} from "@/lib/content/overheard";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface OverheardPost {
  id: string;
  authorName: string;
  body: string;
  addressedTo: string | null;
  createdAt: Date;
}

/** The wall, newest first. Hidden posts are never returned. */
export async function recentPosts(limit = 50): Promise<OverheardPost[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, author_name, body, addressed_to, created_at
    FROM overheard_posts
    WHERE hidden = false
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Array<{
    id: string;
    author_name: string;
    body: string;
    addressed_to: string | null;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: String(r.id),
    authorName: r.author_name,
    body: r.body,
    addressedTo: r.addressed_to,
    createdAt: new Date(r.created_at),
  }));
}

/**
 * How many posts this person has left, ever. Counts hidden posts too — a
 * moderated post has still used its turn, otherwise "post something that gets
 * hidden, repeat" is an unlimited allowance.
 */
export async function postCountForUser(userId: string): Promise<number> {
  if (!databaseConfigured()) return 0;
  const rows = (await sql()`
    SELECT count(*)::int AS n FROM overheard_posts WHERE user_id = ${userId}
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

export async function addPost(input: {
  userId: string;
  authorName: string;
  body: string;
  addressedTo?: string | null;
}): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO overheard_posts (user_id, author_name, body, addressed_to)
    VALUES (${input.userId}, ${input.authorName}, ${input.body},
            ${input.addressedTo ?? null})
  `;
}

/** Moderation. Hiding rather than deleting keeps the audit trail and the count. */
export async function setHidden(id: string, hidden: boolean): Promise<void> {
  if (!databaseConfigured()) return;
  await sql()`UPDATE overheard_posts SET hidden = ${hidden} WHERE id = ${id}`;
}
