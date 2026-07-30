/**
 * Overheard — the shared constants.
 *
 * Separate from lib/db/overheard.ts because that module is `server-only` and
 * the post form is a client component: importing the allowance from there
 * dragged the database client into the browser bundle and failed the build.
 * Numbers that both sides need live here; anything that touches Postgres
 * stays in lib/db.
 */

/** Posts a non-member may leave before the LunaVerse is required. */
export const FREE_POST_ALLOWANCE = 3;

/** Longest a single post may be — enough to say something, short enough to read. */
export const MAX_POST_LENGTH = 900;
