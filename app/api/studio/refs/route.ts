/**
 * Reference upload. Owner-only, private storage, nothing public ever.
 *
 * SERVER-SIDE UPLOAD rather than a client token handshake, which is the
 * simpler of the two and costs nothing here: Vercel Functions take request
 * bodies up to 100MB and a reference image is capped at 25 (lib/studio/
 * storage.ts). One person uploads to this. A presigned client upload would be
 * three moving parts to save an invocation nobody is counting.
 *
 * DIMENSIONS COME FROM THE CLIENT, which sounds wrong and is fine. The browser
 * has already decoded the image to show a preview, so it knows; doing it again
 * on the server means an image decoder in the bundle for a number used to draw
 * a grid. They are not a security boundary — they are layout.
 */

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isOwner, notOwner } from "@/lib/access/owner";
import { addRef, databaseConfigured } from "@/lib/db/studio";
import {
  MAX_REF_BYTES,
  extFor,
  refBlobPath,
  studioBlobConfigured,
} from "@/lib/studio/storage";
import type { RefKind } from "@/lib/studio/types";
import { refKinds } from "@/lib/studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOCAL_DIR = path.join(process.cwd(), "studio-private");

export async function POST(request: Request) {
  if (!(await isOwner())) return notOwner();
  if (!databaseConfigured()) {
    return Response.json(
      { error: "DATABASE_URL is not set — Studio has nowhere to file this." },
      { status: 503 },
    );
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

  if (studioBlobConfigured()) {
    const { put } = await import("@vercel/blob");
    // PRIVATE. A public blob here would be a permanent, ungated URL to
    // unfinished working material — see lib/studio/storage.ts.
    await put(refBlobPath(id, ext), bytes, {
      access: "private",
      contentType: file.type,
      addRandomSuffix: false,
    });
  } else {
    await mkdir(LOCAL_DIR, { recursive: true });
    await writeFile(path.join(LOCAL_DIR, `${id}.${ext}`), bytes);
  }

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
