/**
 * Who may be emailed, and who has said no.
 *
 * TWO TABLES, ONE RULE. `email_optouts` is the suppression list and
 * `email_sends` is the record of what already went out. Every send passes
 * through both: suppressed addresses are dropped, already-sent addresses are
 * skipped, and only a successful send is recorded. That makes the announcement
 * script safe to re-run, which matters because it is run by hand and hands
 * make mistakes.
 *
 * Guarded on DATABASE_URL like every other module here — except that this one
 * FAILS CLOSED. With no database, `suppressed()` cannot know who opted out, so
 * it says everyone did. A membership check that degrades to "no membership"
 * costs somebody a page they paid for and they can tell us; mail that degrades
 * to "send it anyway" reaches people who asked it not to, and nothing can be
 * taken back.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Normalised the same way everywhere, so one person is one row. */
export function normalise(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Record that this address wants no more mail.
 *
 * Idempotent: clicking unsubscribe twice is somebody making sure, not an
 * error, and they should see the same confirmation both times. The original
 * `created_at` is kept, because when they left is a fact and the second click
 * is not a new departure.
 */
export async function optOut(email: string, source = "release"): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  const db = sql();
  const addr = normalise(email);
  await db`
    INSERT INTO email_optouts (email, source)
    VALUES (${addr}, ${source})
    ON CONFLICT (email) DO NOTHING
  `;
  // The followers list has its own column and predates this table. Somebody
  // who unsubscribes should come off both, whichever list they were on, for
  // the reason in the schema: the link said "stop emailing me".
  await db`
    UPDATE followers SET unsubscribed_at = now()
    WHERE email = ${addr} AND unsubscribed_at IS NULL
  `;
}

/**
 * The subset of `candidates` that must NOT be emailed.
 *
 * Returns a Set of normalised addresses. Throws rather than returning empty
 * when there is no database — see the fail-closed note at the top.
 */
export async function suppressed(candidates: string[]): Promise<Set<string>> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  if (candidates.length === 0) return new Set();
  const addrs = candidates.map(normalise);
  const rows = (await sql()`
    SELECT email FROM email_optouts WHERE email = ANY(${addrs})
    UNION
    SELECT email FROM followers
      WHERE email = ANY(${addrs}) AND unsubscribed_at IS NOT NULL
  `) as { email: string }[];
  return new Set(rows.map((r) => r.email));
}

/** Addresses this campaign has already reached. */
export async function alreadySent(
  campaign: string,
  candidates: string[],
): Promise<Set<string>> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  if (candidates.length === 0) return new Set();
  const addrs = candidates.map(normalise);
  const rows = (await sql()`
    SELECT email FROM email_sends
    WHERE campaign = ${campaign} AND email = ANY(${addrs})
  `) as { email: string }[];
  return new Set(rows.map((r) => r.email));
}

/**
 * Record one successful send.
 *
 * Called per address rather than per batch, immediately after the provider
 * accepts it, so that a run interrupted halfway leaves a truthful record of
 * exactly what got out. A batch write at the end would lose that.
 */
export async function recordSent(
  campaign: string,
  email: string,
): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO email_sends (campaign, email)
    VALUES (${campaign}, ${normalise(email)})
    ON CONFLICT (campaign, email) DO NOTHING
  `;
}
