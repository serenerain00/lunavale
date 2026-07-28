/**
 * Gated still image — the only way a members-only still reaches a viewer.
 *
 * The stills equivalent of app/api/stream: the entitlement check happens here
 * and nowhere else matters. A premium still never sits at a permanent public
 * URL (CLAUDE.md); it is delivered per request, after the gate.
 *
 * Two backends, chosen at request time by lib/media/storage.ts, same as video:
 *
 *   Production — private Vercel Blob. After the gate passes we mint a
 *   short-lived signed URL and redirect to it. A URL scraped out of devtools
 *   stops working within the hour.
 *
 *   Local — the file on disk under stills-private/, streamed straight back with
 *   nothing configured.
 *
 * `?size=thumb` serves the small grid copy; the default serves the full frame
 * for the lightbox. Free galleries do not come through here at all — their
 * images are static /public files (see lib/content/gallery.ts).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { canWatch } from "@/lib/access/entitlement";
import { getGallery } from "@/lib/content/gallery";
import {
  blobConfigured,
  stillBlobPathFor,
  stillFileName,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STILLS_DIR = path.join(process.cwd(), "stills-private");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gallery: string; n: string }> },
) {
  const { gallery: galleryId, n: rawN } = await params;

  const gallery = getGallery(galleryId);
  // Only gated galleries are served here; a free set would leak nothing, but it
  // has no private copy to find, so treat it as not found.
  if (!gallery || !gallery.gated) {
    return new Response("Not found", { status: 404 });
  }

  const n = Number(rawN);
  if (!Number.isInteger(n) || n < 1 || n > gallery.count) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await canWatch({ access: gallery.access }))) {
    return new Response("Membership required", { status: 403 });
  }

  const size =
    new URL(request.url).searchParams.get("size") === "thumb" ? "thumb" : "full";

  // ---- Production path: signed redirect to private Blob storage ------------
  if (blobConfigured()) {
    try {
      const { issueSignedToken, presignUrl } = await import("@vercel/blob");
      const pathname = stillBlobPathFor(galleryId, n, size);
      const validUntil = Date.now() + SIGNED_URL_TTL_SECONDS * 1000;

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

      return Response.redirect(presignedUrl, 307);
    } catch (error) {
      console.error(`still: blob lookup failed for ${galleryId}/${n}`, error);
      return new Response("Image unavailable", { status: 404 });
    }
  }

  // ---- Local path: read it off disk ---------------------------------------
  // Components are built from our own data, but resolve-and-verify anyway so a
  // bad id can never escape the stills directory.
  const dir = path.join(STILLS_DIR, galleryId);
  const filePath = path.join(dir, stillFileName(n, size));
  if (path.dirname(filePath) !== dir || path.dirname(dir) !== STILLS_DIR) {
    return new Response("Invalid image path", { status: 400 });
  }

  try {
    const bytes = await readFile(filePath);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        // Private so no shared cache holds a premium frame; the browser may
        // still reuse it within the session.
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 404 });
  }
}
