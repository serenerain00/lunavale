/**
 * Overheard storage — the members' wall.
 *
 * Reading and posting both require the LunaVerse (2026-08-03). It was a public
 * wall with a three-post allowance for anyone with a free account; the rows
 * from that period are still here, and `postCountForUser` still serves
 * app/admin's report on them.
 *
 * Posts are keyed to a Clerk user rather than a browser, which was originally
 * about making the allowance survive a private window. It still matters for a
 * different reason: every poster has a real identity and an email behind their
 * name on the wall.
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
  /** Transcript line key this answers: "post:123" or "cast:d4-2". */
  replyTo: string | null;
  /** Posted by Melissa. Rendered as a badge; never inferred from the name. */
  isOwner: boolean;
  /** Character byline, when Melissa answered in their voice. */
  castAs: string | null;
  createdAt: Date;
}

/** The wall, newest first. Hidden posts are never returned. */
export async function recentPosts(limit = 50): Promise<OverheardPost[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, author_name, body, addressed_to, reply_to, is_owner, cast_as, created_at
    FROM overheard_posts
    WHERE hidden = false
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Array<{
    id: string;
    author_name: string;
    body: string;
    addressed_to: string | null;
    reply_to: string | null;
    is_owner: boolean;
    cast_as: string | null;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: String(r.id),
    authorName: r.author_name,
    body: r.body,
    addressedTo: r.addressed_to,
    replyTo: r.reply_to,
    isOwner: r.is_owner,
    castAs: r.cast_as,
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
  replyTo?: string | null;
  isOwner?: boolean;
  castAs?: string | null;
}): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO overheard_posts (user_id, author_name, body, addressed_to, reply_to, is_owner, cast_as)
    VALUES (${input.userId}, ${input.authorName}, ${input.body},
            ${input.addressedTo ?? null}, ${input.replyTo ?? null},
            ${input.isOwner ?? false}, ${input.castAs ?? null})
  `;
}

/** Everything, including hidden, for the moderation view. */
export async function allPostsForModeration(limit = 200): Promise<
  (OverheardPost & { hidden: boolean })[]
> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, author_name, body, addressed_to, reply_to, is_owner, cast_as, hidden, created_at
    FROM overheard_posts
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Array<{
    id: string;
    author_name: string;
    body: string;
    addressed_to: string | null;
    reply_to: string | null;
    is_owner: boolean;
    cast_as: string | null;
    hidden: boolean;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: String(r.id),
    authorName: r.author_name,
    body: r.body,
    addressedTo: r.addressed_to,
    replyTo: r.reply_to,
    isOwner: r.is_owner,
    castAs: r.cast_as,
    hidden: r.hidden,
    createdAt: new Date(r.created_at),
  }));
}

/** Moderation. Hiding rather than deleting keeps the audit trail and the count. */
export async function setHidden(id: string, hidden: boolean): Promise<void> {
  if (!databaseConfigured()) return;
  await sql()`UPDATE overheard_posts SET hidden = ${hidden} WHERE id = ${id}`;
}

/** Overheard's own funnel: who signed up, who actually spoke, who ran out. */
export async function posterStats(allowance: number): Promise<{
  posters: number;
  spent: number;
}> {
  if (!databaseConfigured()) return { posters: 0, spent: 0 };
  const rows = (await sql()`
    SELECT count(*)::int AS posters,
           count(*) FILTER (WHERE n >= ${allowance})::int AS spent
    FROM (
      SELECT user_id, count(*)::int AS n
      FROM overheard_posts
      GROUP BY user_id
    ) per_user
  `) as Array<{ posters: number; spent: number }>;
  return rows[0] ?? { posters: 0, spent: 0 };
}
