/**
 * The conversion funnel's own tables: traffic_daily (copied out of Clarity by
 * the cron) and play_starts (counted by the player). See lib/db/schema.sql for
 * why each exists.
 *
 * Same shape as the other lib/db modules: a thin layer over Neon, no ORM, and
 * every read degrading to empty — including when the tables have not been
 * created yet — so /admin/conversion shows "not measured yet" instead of a 500.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import type { TrafficDay } from "@/lib/analytics/clarity";

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export const PLAY_VIEWERS = ["member", "free", "anon"] as const;
export type PlayViewer = (typeof PLAY_VIEWERS)[number];
export const PLAY_SOURCES = ["instagram", "other"] as const;
export type PlaySource = (typeof PLAY_SOURCES)[number];

export interface StoredTrafficDay {
  day: string;
  windowDays: number;
  data: TrafficDay;
}

export async function saveTrafficDay(
  day: string,
  windowDays: number,
  data: TrafficDay,
): Promise<void> {
  await sql()`
    INSERT INTO traffic_daily (day, window_days, data)
    VALUES (${day}, ${windowDays}, ${JSON.stringify(data)}::jsonb)
    ON CONFLICT (day) DO UPDATE
      SET window_days = EXCLUDED.window_days,
          data = EXCLUDED.data,
          fetched_at = now()
  `;
}

/** Days ending on or after `since` (YYYY-MM-DD), oldest first. */
export async function trafficSince(since: string): Promise<StoredTrafficDay[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const rows = await sql()`
      SELECT to_char(day, 'YYYY-MM-DD') AS day, window_days, data
      FROM traffic_daily WHERE day >= ${since} ORDER BY day
    `;
    return rows.map((r) => ({
      day: r.day as string,
      windowDays: Number(r.window_days),
      data: r.data as TrafficDay,
    }));
  } catch (error) {
    console.error("trafficSince failed", error);
    return [];
  }
}

export async function recordPlay(
  slug: string,
  viewer: PlayViewer,
  source: PlaySource,
): Promise<void> {
  await sql()`
    INSERT INTO play_starts (day, slug, viewer, source, n)
    VALUES ((now() AT TIME ZONE 'UTC')::date, ${slug}, ${viewer}, ${source}, 1)
    ON CONFLICT (day, slug, viewer, source) DO UPDATE
      SET n = play_starts.n + 1
  `;
}

export interface PlayRow {
  slug: string;
  viewer: PlayViewer;
  source: PlaySource;
  n: number;
}

export interface PlaySummary {
  rows: PlayRow[];
  /** First day anything was counted, or null if never — the page says "since". */
  firstDay: string | null;
}

export async function playsSince(since: string): Promise<PlaySummary> {
  if (!process.env.DATABASE_URL) return { rows: [], firstDay: null };
  try {
    const db = sql();
    const [rows, first] = await Promise.all([
      db`
        SELECT slug, viewer, source, SUM(n)::int AS n
        FROM play_starts WHERE day >= ${since}
        GROUP BY slug, viewer, source
      `,
      db`SELECT to_char(MIN(day), 'YYYY-MM-DD') AS d FROM play_starts`,
    ]);
    return {
      rows: rows.map((r) => ({
        slug: r.slug as string,
        viewer: r.viewer as PlayViewer,
        source: r.source as PlaySource,
        n: Number(r.n),
      })),
      firstDay: (first[0]?.d as string | null) ?? null,
    };
  } catch (error) {
    console.error("playsSince failed", error);
    return { rows: [], firstDay: null };
  }
}

/** Memberships whose row was created in the window — the access record's count of new members. */
export async function membershipsCreatedSince(since: string): Promise<number | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const rows = await sql()`
      SELECT COUNT(*)::int AS n FROM memberships WHERE created_at >= ${since}::date
    `;
    return Number(rows[0]?.n ?? 0);
  } catch (error) {
    console.error("membershipsCreatedSince failed", error);
    return null;
  }
}
