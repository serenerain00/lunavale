/**
 * Gated take poster — the frame shown on a take's tile in the grid.
 *
 * The stills route (app/api/still) does this for gallery images and the stream
 * route does it for video; this is the same shape for the third kind. The
 * video itself goes through /api/stream like everything else, because a take
 * IS streamable media — only its poster needed somewhere to live.
 *
 * THE SLUG IS RESOLVED AGAINST OUR OWN DATA before any path is built, so the
 * only frames reachable here are ones the takes registry names. There is no
 * user-supplied path component anywhere in the filename, which is what keeps a
 * single dynamic segment safe.
 *
 * Takes are members-only without exception (TAKES_ACCESS), so unlike the still
 * route there is no free case to branch on.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { canWatch } from "@/lib/access/entitlement";
import { getTake, TAKES_ACCESS } from "@/lib/content/takes";
import {
  blobConfigured,
  takePosterBlobPathFor,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TAKES_DIR = path.join(process.cwd(), "takes-private");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const located = getTake(slug);
  if (!located) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await canWatch({ access: TAKES_ACCESS }))) {
    return new Response("Membership required", { status: 403 });
  }

  const { sceneSlug } = located;

  // ---- Production path: signed redirect to private Blob storage ------------
  if (blobConfigured()) {
    try {
      const { issueSignedToken, presignUrl } = await import("@vercel/blob");
      const pathname = takePosterBlobPathFor(sceneSlug, slug);
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
      console.error(`take: blob lookup failed for ${sceneSlug}/${slug}`, error);
      return new Response("Image unavailable", { status: 404 });
    }
  }

  // ---- Local path: read it off disk ---------------------------------------
  // Both components come from our own registry, but resolve-and-verify anyway
  // so a malformed entry can never escape the takes directory.
  const dir = path.join(TAKES_DIR, sceneSlug);
  const filePath = path.join(dir, `${slug}.jpg`);
  if (path.dirname(filePath) !== dir || path.dirname(dir) !== TAKES_DIR) {
    return new Response("Invalid image path", { status: 400 });
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
