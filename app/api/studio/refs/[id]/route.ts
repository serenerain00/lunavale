/**
 * One reference: the bytes, an edit, or a delete. Owner-only on every verb.
 *
 * GET STREAMS THE BYTES rather than redirecting to a signed Blob URL, which is
 * the one place Studio departs from /api/still. The export deck draws these
 * into a canvas and reads the pixels back; a cross-origin redirect taints the
 * canvas and export throws. Proxying keeps everything same-origin. The cost
 * note in lib/media/presign.ts does not apply — that is about a member opening
 * a gallery of twenty-nine gated tiles, and this route has one user.
 *
 * DELETE REMOVES THE ROW AND LEAVES THE OBJECT. Deliberate: an orphaned
 * private blob costs a fraction of a cent and a wrongly-deleted reference
 * costs a re-shoot. Sweeping them is a script, not a click.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { isOwner, notOwner } from "@/lib/access/owner";
import { deleteRef, getRef, updateRef } from "@/lib/db/studio";
import {
  STUDIO_URL_TTL_SECONDS,
  extFor,
  refBlobPath,
  studioBlobConfigured,
} from "@/lib/studio/storage";
import type { RefKind } from "@/lib/studio/types";
import { refKinds } from "@/lib/studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DIR = path.join(process.cwd(), "studio-private");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isOwner())) return notOwner();
  const { id } = await params;

  const ref = await getRef(id);
  if (!ref) return notOwner();
  const ext = extFor(ref.mime);
  if (!ext) return notOwner();

  const headers = {
    "Content-Type": ref.mime,
    // Private so no shared cache holds working material; the browser may still
    // reuse it for the length of a session, which is what makes the grid quick.
    "Cache-Control": "private, max-age=3600",
  };

  if (studioBlobConfigured()) {
    try {
      const { issueSignedToken, presignUrl } = await import("@vercel/blob");
      const pathname = refBlobPath(id, ext);
      const validUntil = Date.now() + STUDIO_URL_TTL_SECONDS * 1000;
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
      const upstream = await fetch(presignedUrl);
      if (!upstream.ok || !upstream.body) {
        return new Response("Image unavailable", { status: 404 });
      }
      return new Response(upstream.body, { status: 200, headers });
    } catch (error) {
      console.error(`studio: blob read failed for ${id}`, error);
      return new Response("Image unavailable", { status: 404 });
    }
  }

  // Local: read it off disk. The id is a UUID from the database, but resolve
  // and verify anyway so nothing can ever climb out of the folder.
  const filePath = path.join(LOCAL_DIR, `${id}.${ext}`);
  if (path.dirname(filePath) !== LOCAL_DIR) {
    return new Response("Invalid path", { status: 400 });
  }
  try {
    const bytes = await readFile(filePath);
    return new Response(new Uint8Array(bytes), { status: 200, headers });
  } catch {
    return new Response("Image unavailable", { status: 404 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isOwner())) return notOwner();
  const { id } = await params;

  const body = (await request.json()) as Record<string, unknown>;
  const str = (k: string) => String(body[k] ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);

  const kind = str("kind") as RefKind;
  if (!refKinds.some((k) => k.id === kind)) {
    return Response.json({ error: "Unknown reference kind." }, { status: 400 });
  }

  await updateRef(id, {
    kind,
    characterId: orNull(str("characterId")),
    label: str("label"),
    angleId: orNull(str("angleId")),
    placeId: orNull(str("placeId")),
    notes: str("notes"),
  });
  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isOwner())) return notOwner();
  const { id } = await params;
  await deleteRef(id);
  return Response.json({ ok: true });
}
