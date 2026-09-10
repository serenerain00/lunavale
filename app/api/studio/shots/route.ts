/**
 * Shot recipes — save and delete. Owner-only.
 *
 * UPSERT ON A CLIENT-MINTED ID, so "save" is one verb rather than a decision
 * about whether this shot exists yet. The builder holds a draft with an id
 * from the moment it opens; saving it twice is saving it once.
 */

import { isOwner, notOwner } from "@/lib/access/owner";
import { databaseConfigured, deleteShot, saveShot } from "@/lib/db/studio";
import { emptyCamera, type ShotCamera } from "@/lib/studio/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isOwner())) return notOwner();
  if (!databaseConfigured()) {
    return Response.json(
      { error: "DATABASE_URL is not set — nowhere to save this." },
      { status: 503 },
    );
  }

  const b = (await request.json()) as Record<string, unknown>;
  const str = (k: string) => String(b[k] ?? "").trim();
  const orNull = (v: string) => (v === "" ? null : v);
  const list = (k: string) => (Array.isArray(b[k]) ? (b[k] as string[]) : []);

  const id = str("id");
  if (!id) return Response.json({ error: "No id." }, { status: 400 });

  await saveShot({
    id,
    title: str("title") || "Untitled shot",
    sceneSlug: orNull(str("sceneSlug")),
    placeId: orNull(str("placeId")),
    characterIds: list("characterIds"),
    refIds: list("refIds"),
    camera: { ...emptyCamera, ...((b.camera as ShotCamera) ?? {}) },
    lightingId: str("lightingId") || "practicals",
    timeId: str("timeId") || "night",
    aspectId: str("aspectId") || "16-9",
    action: str("action"),
    extra: str("extra"),
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isOwner())) return notOwner();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "No id." }, { status: 400 });
  await deleteShot(id);
  return Response.json({ ok: true });
}
