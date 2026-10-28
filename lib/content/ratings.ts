/**
 * Star ratings — the shared shape, importable from the client. Same split as
 * lib/content/comments.ts and lib/db/comments.ts.
 */

/** 'clip' is a scene in videos.ts; 'post' is a vertical in posts.ts. */
export type RatingKind = "clip" | "post";

/** Spoken by screen readers and shown on hover, one per star. */
export const STAR_LABELS = [
  "Didn't work for me",
  "It was okay",
  "Liked it",
  "Really liked it",
  "Loved it",
] as const;
