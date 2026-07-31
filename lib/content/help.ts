/**
 * Help — the limits both sides need.
 *
 * Separate from lib/db/help.ts because that module is `server-only` and the
 * form is a client component: importing these from there drags the database
 * client into the browser bundle and fails the build. Same split as
 * lib/content/overheard.ts, for the same reason.
 */

export const MAX_SUBJECT = 120;
export const MAX_BODY = 2000;
