/**
 * Files the DATABASE ROW for a reference. The bytes never come through here.
 *
 * TWO PATHS, and which one runs is decided by whether Blob is configured:
 *
 *   BLOB (production, and locally too since the token is in .env.local) — the
 *   browser has already uploaded straight to Blob using a token from
 *   /api/studio/refs/token, and POSTs a few hundred bytes of JSON here to
 *   record what it just did. This is the path that matters, because it is the
 *   only one a real photograph fits through: a multipart POST of the file
 *   itself hits the platform's request body limit and comes back as a bare 413
 *   before any of this code runs.
 *
 *   NO BLOB (a clean checkout with nothing configured) — the file does come
 *   through as multipart and is written to studio-private/ on disk. Kept so
 *   the app still runs locally with no environment at all, which is the rule
 *   the rest of lib/media/storage.ts follows.
 *
 * DIMENSIONS COME FROM THE CLIENT in both paths, which sounds wrong and is
 * fine. The browser has already decoded the image to show a preview, so it
 * knows; doing it again on the server means an image decoder in the bundle for
 * a number used to lay out a grid. They are not a security boundary.
 */

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isOwner, notOwner } from "@/lib/access/owner";
import { addRef, databaseConfigured, getRef } from "@/lib/db/studio";
import { MAX_REF_BYTES, extFor } from "@/lib/studio/storage";
import type { RefKind } from "@/lib/studio/types";
import { refKinds } from "@/lib/studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DIR = path.join(process.cwd(), "studio-private");

/**
 * JSON body — the browser has finished a client upload and is filing the row.
 * The id it sends is the one it used as the blob filename, so it has to be a
 * UUID and it has to not already exist.
 */
async function recordUploaded(request: Request) {
  const b = (await request.json()) as Record<string, unknown>;
  const str = (k: string) => String(b[k] ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);

  const id = str("id");
  if (!UUID.test(id)) {
    return Response.json({ error: "Bad id." }, { status: 400 });
  }
  if (await getRef(id)) {
    return Response.json({ error: "Already filed." }, { status: 409 });
  }

  const mime = str("mime");
  if (!extFor(mime)) {
    return Response.json({ error: `${mime || "That"} is not an image Studio accepts.` }, { status: 415 });
  }

  const kind = str("kind") as RefKind;
  if (!refKinds.some((k) => k.id === kind)) {
    return Response.json({ error: "Unknown reference kind." }, { status: 400 });
  }

  await addRef({
    id,
    kind,
    characterId: orNull(str("characterId")),
    label: str("label") || "Untitled",
    angleId: orNull(str("angleId")),
    placeId: orNull(str("placeId")),
    notes: str("notes"),
    width: Number(b.width) || 0,
    height: Number(b.height) || 0,
    mime,
    bytes: Number(b.bytes) || 0,
  });
  return Response.json({ id });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!(await isOwner())) return notOwner();
  if (!databaseConfigured()) {
    return Response.json(
      { error: "DATABASE_URL is not set — Studio has nowhere to file this." },
      { status: 503 },
    );
  }

  // Client upload already happened; this is just the row.
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    return recordUploaded(request);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file." }, { status: 400 });
  }

  const ext = extFor(file.type);
  if (!ext) {
    return Response.json(
      { error: `${file.type || "That"} is not an image Studio accepts (JPEG, PNG, WebP, AVIF).` },
      { status: 415 },
    );
  }
  if (file.size > MAX_REF_BYTES) {
    return Response.json(
      { error: `That is ${(file.size / 1024 / 1024).toFixed(1)}MB. A reference is capped at 25MB.` },
      { status: 413 },
    );
  }

  const str = (k: string) => String(form.get(k) ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);

  const kind = str("kind") as RefKind;
  if (!refKinds.some((k) => k.id === kind)) {
    return Response.json({ error: "Unknown reference kind." }, { status: 400 });
  }

  const id = randomUUID();
  const bytes = Buffer.from(await file.arrayBuffer());

  // Only reached with no Blob configured. With a token set the browser goes
  // direct and never sends the file here, which is the whole point.
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_DIR, `${id}.${ext}`), bytes);

  await addRef({
    id,
    kind,
    characterId: orNull(str("characterId")),
    label: str("label") || file.name.replace(/\.[^.]+$/, ""),
    angleId: orNull(str("angleId")),
    placeId: orNull(str("placeId")),
    notes: str("notes"),
    width: Number(form.get("width")) || 0,
    height: Number(form.get("height")) || 0,
    mime: file.type,
    bytes: file.size,
  });

  return Response.json({ id });
}
