/**
 * Scene comments — the shared shape, importable from the client.
 *
 * The limit lives here rather than in lib/db/comments.ts because that module
 * is "server-only" and the textarea that enforces it is not. Same split as
 * lib/content/help.ts and lib/db/help.ts, for the same reason.
 */

/** Long enough to say something real, short enough to stay a comment. */
export const MAX_COMMENT_BODY = 1200;
