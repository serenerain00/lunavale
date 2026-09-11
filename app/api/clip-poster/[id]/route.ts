/**
 * Poster for an EXPLICIT clip — the only poster on this site behind a gate.
 *
 * Every other poster is a static file under /public, which is right: a card
 * for a scene is advertising. An explicit clip is the one case where the still
 * frame is itself the thing being withheld, and lib/content/clips.ts has said
 * so since the flag existed — "its poster is withheld on the public grid".
 *
 * It was not actually withheld. It was a public JPEG with a CSS blur over it,
 * its path printed in the page source, and it was in the clip's Open Graph
 * metadata as well, so a link preview rendered it unblurred. Fixed 2026-09-11.
 *
 * Same shape as /api/still: entitlement first, then a short-lived signed URL
 * from private Blob in production, or the file off disk in development.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { canWatch } from "@/lib/access/entitlement";
import { getClip, clipAccess } from "@/lib/content/clips";
import {
  blobConfigured,
  clipPosterBlobPathFor,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DIR = path.join(process.cwd(), "clips-private");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const clip = getClip(id);
  // Only explicit clips have a private poster; everything else is a /public
  // file and has no business coming through here.
  if (!clip || !clip.explicit) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await canWatch({ access: clipAccess(clip) }))) {
    return new Response("Membership required", { status: 403 });
  }

  if (blobConfigured()) {
    try {
      const { issueSignedToken, presignUrl } = await import("@vercel/blob");
      const pathname = clipPosterBlobPathFor(id);
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
      console.error(`clip-poster: blob lookup failed for ${id}`, error);
      return new Response("Image unavailable", { status: 404 });
    }
  }

  // Local: off disk. The id came from our own content module, but resolve and
  // verify anyway so nothing can climb out of the folder.
  const filePath = path.join(LOCAL_DIR, `${id}.jpg`);
  if (path.dirname(filePath) !== LOCAL_DIR) {
    return new Response("Invalid path", { status: 400 });
  }
  try {
    const bytes = await readFile(filePath);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 404 });
  }
}
