/**
 * Survey storage and the counts behind the /admin read-out.
 *
 * Same shape as lib/db/help.ts: a thin module over Neon, no ORM, and every
 * read degrading to empty when DATABASE_URL is absent so the app runs locally
 * without a database rather than crashing on a page nobody asked for.
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

export interface SurveyAnswer {
  enjoyment: string;
  format: string;
  wouldWatch: string;
  favouriteScene: string | null;
  wants: string[];
  comment: string | null;
  userId: string | null;
  clientToken: string;
}

/**
 * Record one response.
 *
 * ON CONFLICT DO NOTHING against `client_token`: a double submit — a slow
 * connection and an impatient second click — writes once and reports success
 * both times, which is what the person meant either way.
 */
export async function addSurveyResponse(a: SurveyAnswer): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO survey_responses
      (enjoyment, format, would_watch, favourite_scene, wants, comment,
       user_id, client_token)
    VALUES
      (${a.enjoyment}, ${a.format}, ${a.wouldWatch}, ${a.favouriteScene},
       -- The cast is for TypeScript only. Neon's template tag types its
       -- parameters as primitives, but the driver serialises a JS array into a
       -- Postgres TEXT[] correctly — verified against the real table before
       -- this shipped, along with the unnest() aggregate that reads it back.
       ${a.wants as unknown as string}, ${a.comment}, ${a.userId},
       ${a.clientToken})
    ON CONFLICT (client_token) DO NOTHING
  `;
}

export async function hasAnswered(clientToken: string): Promise<boolean> {
  if (!databaseConfigured() || !clientToken) return false;
  const rows = (await sql()`
    SELECT 1 FROM survey_responses WHERE client_token = ${clientToken} LIMIT 1
  `) as unknown[];
  return rows.length > 0;
}

export interface Tally {
  optionId: string;
  count: number;
}

export interface SurveyResults {
  total: number;
  enjoyment: Tally[];
  format: Tally[];
  wouldWatch: Tally[];
  favouriteScene: Tally[];
  wants: Tally[];
  /** Most recent free-text answers, newest first. */
  comments: { comment: string; createdAt: Date }[];
}

/**
 * Everything the admin page shows, in one round trip per question.
 *
 * Counted in SQL rather than by pulling rows and reducing in JS: this has to
 * stay a page Melissa can open when there are ten responses and when there are
 * ten thousand, and the difference is entirely whether the counting happens
 * here or in Postgres.
 */
export async function surveyResults(commentLimit = 25): Promise<SurveyResults> {
  const empty: SurveyResults = {
    total: 0,
    enjoyment: [],
    format: [],
    wouldWatch: [],
    favouriteScene: [],
    wants: [],
    comments: [],
  };
  if (!databaseConfigured()) return empty;

  const s = sql();
  const [totalRows, enjoyment, format, wouldWatch, scene, wants, comments] =
    await Promise.all([
      s`SELECT count(*)::int AS n FROM survey_responses`,
      s`SELECT enjoyment AS id, count(*)::int AS n FROM survey_responses
        GROUP BY enjoyment ORDER BY n DESC`,
      s`SELECT format AS id, count(*)::int AS n FROM survey_responses
        GROUP BY format ORDER BY n DESC`,
      s`SELECT would_watch AS id, count(*)::int AS n FROM survey_responses
        GROUP BY would_watch ORDER BY n DESC`,
      s`SELECT favourite_scene AS id, count(*)::int AS n FROM survey_responses
        WHERE favourite_scene IS NOT NULL
        GROUP BY favourite_scene ORDER BY n DESC`,
      // unnest, so a response that picked three things counts once for each.
      s`SELECT w AS id, count(*)::int AS n
        FROM survey_responses, unnest(wants) AS w
        GROUP BY w ORDER BY n DESC`,
      s`SELECT comment, created_at FROM survey_responses
        WHERE comment IS NOT NULL AND comment <> ''
        ORDER BY created_at DESC LIMIT ${commentLimit}`,
    ]);

  const tally = (rows: unknown[]): Tally[] =>
    (rows as { id: string; n: number }[]).map((r) => ({
      optionId: r.id,
      count: r.n,
    }));

  return {
    total: (totalRows as { n: number }[])[0]?.n ?? 0,
    enjoyment: tally(enjoyment as unknown[]),
    format: tally(format as unknown[]),
    wouldWatch: tally(wouldWatch as unknown[]),
    favouriteScene: tally(scene as unknown[]),
    wants: tally(wants as unknown[]),
    comments: (comments as { comment: string; created_at: string }[]).map(
      (r) => ({ comment: r.comment, createdAt: new Date(r.created_at) }),
    ),
  };
}
