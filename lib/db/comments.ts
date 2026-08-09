/**
 * Scene comments — storage and the /admin read-out.
 *
 * See schema.sql for why these are private rather than a public thread. Same
 * thin shape as lib/db/help.ts: Neon, no ORM, every read degrading to empty
 * without DATABASE_URL so the app still runs locally without one.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";

export { MAX_COMMENT_BODY } from "@/lib/content/comments";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface SceneComment {
  id: string;
  sceneSlug: string;
  body: string;
  userId: string | null;
  wasMember: boolean;
  handled: boolean;
  createdAt: Date;
}

export async function addSceneComment(input: {
  sceneSlug: string;
  body: string;
  userId?: string | null;
  wasMember?: boolean;
}): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO scene_comments (scene_slug, body, user_id, was_member)
    VALUES (${input.sceneSlug}, ${input.body}, ${input.userId ?? null},
            ${input.wasMember ?? false})
  `;
}

export async function recentSceneComments(limit = 30): Promise<SceneComment[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, scene_slug, body, user_id, was_member, handled, created_at
    FROM scene_comments
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as {
    id: string;
    scene_slug: string;
    body: string;
    user_id: string | null;
    was_member: boolean;
    handled: boolean;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: String(r.id),
    sceneSlug: r.scene_slug,
    body: r.body,
    userId: r.user_id,
    wasMember: r.was_member,
    handled: r.handled,
    createdAt: new Date(r.created_at),
  }));
}

/**
 * Which scenes people are actually moved to write about.
 *
 * Worth its own query rather than being counted off the recent list: the
 * interesting signal is the whole history, and the recent list is capped at
 * whatever fits on the page.
 */
export async function commentCountsByScene(): Promise<
  { sceneSlug: string; count: number }[]
> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT scene_slug, count(*)::int AS n
    FROM scene_comments
    GROUP BY scene_slug
    ORDER BY n DESC
  `) as { scene_slug: string; n: number }[];
  return rows.map((r) => ({ sceneSlug: r.scene_slug, count: r.n }));
}
