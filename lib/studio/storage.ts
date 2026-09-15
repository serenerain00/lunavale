/**
 * Where Studio's reference images live.
 *
 * SAME PRIVATE MODEL AS takes-private, AND FOR A SHARPER REASON. This library
 * is Melissa's working material: faces, wardrobe screenshots, tattoo plates,
 * frames from attempts that did not work. It is the most openly-constructed
 * imagery in the project and none of it is finished. Shipped to /public it
 * would be permanent, ungated URLs showing exactly how the thing is made.
 *
 * So: PRIVATE Vercel Blob in production under `studio/refs/`, a gitignored
 * `studio-private/` folder on disk locally, and nothing anywhere near the
 * repo or a deployment. See .vercelignore, which is what actually enforces it.
 *
 * WHY THE ROUTE STREAMS BYTES INSTEAD OF REDIRECTING, which is the one place
 * this departs from /api/still. The export deck draws these into a canvas and
 * reads the pixels back out; a redirect to a Blob URL is cross-origin, which
 * taints the canvas and makes export throw. Proxying costs one function per
 * image and that is affordable here in a way it is not on a members' gallery:
 * this route has exactly one user, behind the owner gate, and lib/media/
 * presign.ts's warning is about members loading twenty-nine tiles at once.
 */

import "server-only";

export const STUDIO_URL_TTL_SECONDS = 60 * 10;

/** Blob path for a reference, e.g. "studio/refs/<id>.jpg". */
export function refBlobPath(id: string, ext: string): string {
  return `studio/refs/${id}.${ext}`;
}

export function studioBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** The extension for an accepted mime type, or null if it is not one. */
export function extFor(mime: string): string | null {
  return ALLOWED[mime] ?? null;
}

/** 25MB. A reference is a reference; a master does not belong in here. */
export const MAX_REF_BYTES = 25 * 1024 * 1024;
