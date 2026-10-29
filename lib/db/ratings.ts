/**
 * Star ratings — storage and the /admin read-out.
 *
 * See schema.sql ("Ratings") for the one-row-per-viewer rule. Same thin shape
 * as lib/db/comments.ts: Neon, no ORM, reads degrade to empty without
 * DATABASE_URL.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import type { RatingKind } from "@/lib/content/ratings";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export async function saveRating(input: {
  kind: RatingKind;
  slug: string;
  stars: number;
  viewerKey: string;
  userId: string | null;
  wasMember: boolean;
}): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO ratings (kind, slug, stars, viewer_key, user_id, was_member)
    VALUES (${input.kind}, ${input.slug}, ${input.stars}, ${input.viewerKey},
            ${input.userId}, ${input.wasMember})
    ON CONFLICT (kind, slug, viewer_key) DO UPDATE
      SET stars = EXCLUDED.stars,
          user_id = COALESCE(EXCLUDED.user_id, ratings.user_id),
          was_member = EXCLUDED.was_member,
          updated_at = now()
  `;
}

export interface RatingSummary {
  kind: RatingKind;
  slug: string;
  count: number;
  average: number;
  /** How many of each, index 0 = one star. */
  spread: [number, number, number, number, number];
  /** Of `count`, how many had only seen the preview. */
  previewOnly: number;
}

/** Every rated piece, most-rated first. */
export async function ratingSummaries(): Promise<RatingSummary[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT kind, slug,
           count(*)::int                                  AS n,
           avg(stars)::float                              AS avg,
           count(*) FILTER (WHERE stars = 1)::int         AS s1,
           count(*) FILTER (WHERE stars = 2)::int         AS s2,
           count(*) FILTER (WHERE stars = 3)::int         AS s3,
           count(*) FILTER (WHERE stars = 4)::int         AS s4,
           count(*) FILTER (WHERE stars = 5)::int         AS s5,
           count(*) FILTER (WHERE NOT was_member)::int    AS preview_only
    FROM ratings
    GROUP BY kind, slug
    ORDER BY n DESC, avg DESC
  `) as {
    kind: RatingKind;
    slug: string;
    n: number;
    avg: number;
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
    preview_only: number;
  }[];
  return rows.map((r) => ({
    kind: r.kind,
    slug: r.slug,
    count: r.n,
    average: r.avg,
    spread: [r.s1, r.s2, r.s3, r.s4, r.s5],
    previewOnly: r.preview_only,
  }));
}
