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

/**
 * Members-only stills follow the same private-Blob model as video: the
 * optimized copies live under `stills/<gallery>/` in PRIVATE Blob and on disk
 * under `stills-private/<gallery>/`, and only ever reach a viewer through the
 * gated /api/still route. `n` is 1-based; a thumbnail is the same name with a
 * `.t` before the extension (see scripts/optimize-media.sh private-stills).
 */
export function stillFileName(n: number, size: "thumb" | "full"): string {
  const nn = String(n).padStart(2, "0");
  return size === "thumb" ? `${nn}.t.jpg` : `${nn}.jpg`;
}

/** Blob path for a still, e.g. "stills/the-bar/03.jpg". */
export function stillBlobPathFor(
  gallery: string,
  n: number,
  size: "thumb" | "full",
): string {
  return `stills/${gallery}/${stillFileName(n, size)}`;
}

/**
 * Poster frame for a take. Takes follow the same private model as members-only
 * stills: on disk under `takes-private/<scene>/`, in PRIVATE Blob under
 * `takes/<scene>/`, and reachable only through the gated /api/take route.
 *
 * A take's frame is exactly as members-only as the take. Putting these in
 * /public would publish a still from every failed attempt at a permanent URL,
 * which is both the thing the membership sells and the most openly-AI imagery
 * in the product. See scripts/import-takes.sh.
 */
export function takePosterBlobPathFor(scene: string, slug: string): string {
  return `takes/${scene}/${slug}.jpg`;
}

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
