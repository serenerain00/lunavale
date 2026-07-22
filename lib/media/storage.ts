/**
 * Where the media actually lives.
 *
 * Story video is far too large for git (456MB of proxies) and Vercel is not a
 * video host, so production reads from Vercel Blob and local development reads
 * from the `stories/` folder on disk. This module is the only place that knows
 * which, so the stream route stays a pure question of "may this person watch".
 *
 * The switch is an env var, not a build flag: with no BLOB_READ_WRITE_TOKEN the
 * app behaves exactly as it did before, which is what keeps local development
 * working with nothing configured.
 *
 * PRIVACY IS THE WHOLE POINT. The blobs are uploaded with `access: "private"`
 * (see scripts/upload-media.ts), so a Blob URL is useless on its own. Playback
 * goes through a short-lived signed URL minted per request, AFTER the
 * entitlement check — which means a member cannot copy a link out of devtools
 * and hand a premium scene to somebody, at least not for longer than the
 * lifetime below.
 */

import "server-only";

/** How long a minted playback URL stays valid. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Blob path for a media file, e.g. "stories/luna-tyson-bar.proxy.mp4". */
export function blobPathFor(file: string): string {
  return `stories/${file}`;
}

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
