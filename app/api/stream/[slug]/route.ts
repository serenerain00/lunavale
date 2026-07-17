/**
 * Gated video stream.
 *
 * Serves media from `stories/` ONLY after a server-side entitlement check, with
 * HTTP Range support so the browser can seek. Premium scenes return 403 to
 * non-members — the file bytes never leave the server without authorization, and
 * no permanent media URL is exposed to the client (CLAUDE.md).
 *
 * Phase 3 note: `stories/` is gitignored and not deployed. On real infrastructure
 * this route becomes a signed-URL redirect / proxy to a hosted video provider.
 * The URL shape (/api/stream/[slug]) and the auth gate stay identical.
 */

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { getVideo } from "@/lib/content/videos";
import { canWatch } from "@/lib/access/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORIES_DIR = path.join(process.cwd(), "stories");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) {
    return new Response("Not found", { status: 404 });
  }

  if (!(await canWatch(video))) {
    return new Response("Membership required", { status: 403 });
  }

  // `video.file` comes from our own data, not user input, but resolve-and-verify
  // anyway so a bad entry can never escape the stories directory.
  const filePath = path.join(STORIES_DIR, video.file);
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
