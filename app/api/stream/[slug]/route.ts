/**
 * Gated media stream — the only way bytes reach a viewer.
 *
 * The entitlement check happens here and nowhere else matters: premium content
 * returns 403 to a non-member, and no durable media URL is ever handed to the
 * client (CLAUDE.md).
 *
 * Two backends, chosen at request time by lib/media/storage.ts:
 *
 *   Production — Vercel Blob. The blobs are PRIVATE, so their URLs are useless
 *   on their own. After the gate passes we mint a short-lived signed URL and
 *   redirect to it, which hands the range requests, seeking and CDN delivery to
 *   Blob instead of pushing 456MB of video through a serverless function. A URL
 *   scraped out of devtools stops working within the hour.
 *
 *   Local — the file on disk in stories/, streamed with Range support so
 *   seeking works with nothing configured.
 *
 * The URL shape (/api/stream/[slug]) and the gate are identical either way, so
 * nothing else in the app knows or cares which is in play.
 */

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getStreamable } from "@/lib/content/streamable";
import { canWatch } from "@/lib/access/entitlement";
import {
  blobConfigured,
  blobPathFor,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORIES_DIR = path.join(process.cwd(), "stories");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  // Scenes and vertical clips both stream through here — see
  // lib/content/streamable.ts for why that lookup lives in one place.
  const media = getStreamable(slug);
  if (!media) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await canWatch(media))) {
    return new Response("Membership required", { status: 403 });
  }

  // ---- Production path: signed redirect to private Blob storage ------------
  if (blobConfigured()) {
    try {
      // Imported lazily so local development never pays for the SDK, and so a
      // missing dependency can't break the on-disk path.
      const { issueSignedToken, presignUrl } = await import("@vercel/blob");
      const pathname = blobPathFor(media.file);
      const validUntil = Date.now() + SIGNED_URL_TTL_SECONDS * 1000;

      // Scoped to this one pathname and to reads only — a token minted for one
      // scene cannot be replayed against another, or used to write anything.
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

      // 307 keeps the method and lets the browser reissue its Range requests
      // straight at Blob, so the video never passes through this function.
      return Response.redirect(presignedUrl, 307);
    } catch (error) {
      console.error(`stream: blob lookup failed for ${media.file}`, error);
      return new Response("Media unavailable", { status: 404 });
    }
  }

  // ---- Local path: read it off disk ---------------------------------------
  // `media.file` comes from our own data, not user input, but resolve-and-verify
  // anyway so a bad entry can never escape the stories directory.
  const filePath = path.join(STORIES_DIR, media.file);
  if (path.dirname(filePath) !== STORIES_DIR) {
    return new Response("Invalid media path", { status: 400 });
  }

  let size: number;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    // Media absent locally (e.g. not yet downloaded) — surface honestly.
    return new Response("Media unavailable", { status: 404 });
  }

  const range = request.headers.get("range");
  const baseHeaders: Record<string, string> = {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
  };

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (!match) {
      return new Response("Invalid range", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const start = match[1] ? parseInt(match[1], 10) : 0;
    const end = match[2] ? parseInt(match[2], 10) : size - 1;

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start > end ||
      start < 0 ||
      end >= size
    ) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const nodeStream = createReadStream(filePath, { start, end });
    const body = Readable.toWeb(nodeStream) as unknown as ReadableStream;
    return new Response(body, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const nodeStream = createReadStream(filePath);
  const body = Readable.toWeb(nodeStream) as unknown as ReadableStream;
  return new Response(body, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(size) },
  });
}
