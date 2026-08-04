/**
 * Batch-signing for gated images, so a wall of them costs one render instead
 * of one function invocation per tile.
 *
 * THE PROBLEM THIS SOLVES. /api/still and /api/take each do the same three
 * things per request: check entitlement, mint a signed Blob URL, 307 to it.
 * That is correct and it is also once per image. A gallery is 8-17 images and
 * the takes grid on "The Phone Call" is 29 — so a single member opening that
 * page fired 29 functions, and because a 307 carries no cache headers, every
 * reload fired 29 more. On a plan billed by active CPU that is the most
 * expensive thing on the site, and it buys nothing: the page has ALREADY
 * checked entitlement server-side before it renders a single tile.
 *
 * So the page signs the whole set while it renders and hands the URLs
 * straight to the img tags. Zero extra invocations, and the browser and Blob's
 * own CDN can cache the images normally.
 *
 * SECURITY IS UNCHANGED, and this is the part worth being sure about:
 *
 *   - The gate still happens server-side, before signing. Nothing here decides
 *     who may look; callers pass only sets they have already cleared.
 *   - The URLs are the same short-lived, read-only, single-pathname tokens the
 *     routes were minting. Their lifetime is SIGNED_URL_TTL_SECONDS and they
 *     cannot be replayed against another object.
 *   - They now sit in the page's HTML rather than behind a redirect. That is
 *     not a new exposure: a signed URL was always one devtools panel away, and
 *     lib/media/storage.ts says so — the protection is the expiry, not the
 *     indirection.
 *
 * The routes STAY. They are the fallback when Blob is not configured (local
 * development reads the files off disk), and they remain the entitlement
 * boundary for anything that reaches them directly.
 */

import "server-only";
import {
  blobConfigured,
  stillBlobPathFor,
  takePosterBlobPathFor,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/media/storage";

/**
 * Sign a batch of blob pathnames. Returns a map keyed by the SAME pathnames,
 * or null when Blob is not configured — callers then fall back to the routes.
 *
 * One failure fails the batch rather than half-rendering a wall: a page of
 * images where some are signed and some are broken is worse to look at than a
 * page that quietly uses the routes instead.
 */
async function signAll(
  pathnames: string[],
): Promise<Map<string, string> | null> {
  if (!blobConfigured() || pathnames.length === 0) return null;

  try {
    const { issueSignedToken, presignUrl } = await import("@vercel/blob");
    const validUntil = Date.now() + SIGNED_URL_TTL_SECONDS * 1000;

    const signed = await Promise.all(
      pathnames.map(async (pathname) => {
        const token = await issueSignedToken({
          pathname,
          operations: ["get"],
          validUntil,
        });
        const { presignedUrl } = await presignUrl(token, {
          operation: "get",
          access: "private",
          pathname,
          validUntil,
        });
        return [pathname, presignedUrl] as const;
      }),
    );
    return new Map(signed);
  } catch (error) {
    console.error("presign: batch failed, falling back to routes", error);
    return null;
  }
}

/**
 * Direct URLs for specific gated stills, keyed by their 1-based number, or
 * null to fall back to /api/still.
 *
 * Takes the numbers explicitly rather than a count because a gated gallery's
 * open preview stills are ordinary files in /public — already free, already on
 * the CDN, and nothing to sign. Only the gated remainder needs this.
 */
export async function signGalleryStills(
  galleryId: string,
  numbers: number[],
): Promise<Map<number, { thumb: string; full: string }> | null> {
  const paths = numbers.flatMap((n) => [
    stillBlobPathFor(galleryId, n, "thumb"),
    stillBlobPathFor(galleryId, n, "full"),
  ]);

  const urls = await signAll(paths);
  if (!urls) return null;

  return new Map(
    numbers.map((n) => [
      n,
      {
        thumb: urls.get(stillBlobPathFor(galleryId, n, "thumb")) ?? "",
        full: urls.get(stillBlobPathFor(galleryId, n, "full")) ?? "",
      },
    ]),
  );
}

/** Direct URLs for take posters, keyed by take slug, or null to use /api/take. */
export async function signTakePosters(
  sceneSlug: string,
  takeSlugs: string[],
): Promise<Map<string, string> | null> {
  const paths = takeSlugs.map((s) => takePosterBlobPathFor(sceneSlug, s));
  const urls = await signAll(paths);
  if (!urls) return null;

  return new Map(
    takeSlugs.map((s) => [
      s,
      urls.get(takePosterBlobPathFor(sceneSlug, s)) ?? "",
    ]),
  );
}
