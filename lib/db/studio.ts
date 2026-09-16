/**
 * Studio's two tables. Same thin shape as lib/db/help.ts — Neon, no ORM, every
 * read degrading to empty without DATABASE_URL so the app still runs locally.
 *
 * These are the only tables in the schema nobody but the owner ever touches,
 * which is why there is no moderation flag, no user id and no rate limiting in
 * here: the gate is at the route, and there is one person on the other side of
 * it.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import type { RefKind, ShotCamera, ShotRecipe, StudioRef } from "@/lib/studio/types";
import { emptyCamera } from "@/lib/studio/types";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

/* -------------------------------------------------------------- references */

interface RefRow {
  id: string;
  kind: string;
  character_id: string | null;
  label: string;
  angle_id: string | null;
  place_id: string | null;
  notes: string;
  width: number;
  height: number;
  mime: string;
  bytes: number;
  created_at: string;
}

function toRef(r: RefRow): StudioRef {
  return {
    id: String(r.id),
    kind: r.kind as RefKind,
    characterId: r.character_id,
    label: r.label,
    angleId: r.angle_id,
    placeId: r.place_id,
    notes: r.notes ?? "",
    width: Number(r.width),
    height: Number(r.height),
    mime: r.mime,
    bytes: Number(r.bytes),
    createdAt: new Date(r.created_at),
  };
}

export async function allRefs(): Promise<StudioRef[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, kind, character_id, label, angle_id, place_id, notes,
           width, height, mime, bytes, created_at
    FROM studio_refs
    ORDER BY created_at DESC
  `) as RefRow[];
  return rows.map(toRef);
}

export async function getRef(id: string): Promise<StudioRef | null> {
  if (!databaseConfigured()) return null;
  const rows = (await sql()`
    SELECT id, kind, character_id, label, angle_id, place_id, notes,
           width, height, mime, bytes, created_at
    FROM studio_refs WHERE id = ${id}
  `) as RefRow[];
  return rows[0] ? toRef(rows[0]) : null;
}

export async function addRef(input: {
  id: string;
  kind: RefKind;
  characterId: string | null;
  label: string;
  angleId: string | null;
  placeId: string | null;
  notes: string;
  width: number;
  height: number;
  mime: string;
  bytes: number;
}): Promise<void> {
  await sql()`
    INSERT INTO studio_refs
      (id, kind, character_id, label, angle_id, place_id, notes,
       width, height, mime, bytes)
    VALUES
      (${input.id}, ${input.kind}, ${input.characterId}, ${input.label},
       ${input.angleId}, ${input.placeId}, ${input.notes},
       ${input.width}, ${input.height}, ${input.mime}, ${input.bytes})
  `;
}

export async function updateRef(
  id: string,
  patch: {
    kind: RefKind;
    characterId: string | null;
    label: string;
    angleId: string | null;
    placeId: string | null;
    notes: string;
  },
): Promise<void> {
  await sql()`
    UPDATE studio_refs SET
      kind = ${patch.kind},
      character_id = ${patch.characterId},
      label = ${patch.label},
      angle_id = ${patch.angleId},
      place_id = ${patch.placeId},
      notes = ${patch.notes}
    WHERE id = ${id}
  `;
}

export async function deleteRef(id: string): Promise<void> {
  await sql()`DELETE FROM studio_refs WHERE id = ${id}`;
}

/* ------------------------------------------------------------------- shots */

interface ShotRow {
  id: string;
  title: string;
  scene_slug: string | null;
  place_id: string | null;
  character_ids: string[] | null;
  ref_ids: string[] | null;
  camera: ShotCamera | null;
  lighting_id: string;
  time_id: string;
  aspect_id: string;
  action: string;
  extra: string;
  created_at: string;
  updated_at: string;
}

function toShot(r: ShotRow): ShotRecipe {
  return {
    id: String(r.id),
    title: r.title,
    sceneSlug: r.scene_slug,
    placeId: r.place_id,
    characterIds: r.character_ids ?? [],
    refIds: r.ref_ids ?? [],
    camera: { ...emptyCamera, ...(r.camera ?? {}) },
    lightingId: r.lighting_id,
    timeId: r.time_id,
    aspectId: r.aspect_id,
    action: r.action ?? "",
    extra: r.extra ?? "",
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export async function allShots(): Promise<ShotRecipe[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, title, scene_slug, place_id, character_ids, ref_ids, camera,
           lighting_id, time_id, aspect_id, action, extra, created_at, updated_at
    FROM studio_shots
    ORDER BY updated_at DESC
  `) as ShotRow[];
  return rows.map(toShot);
}

/** Insert or replace by id — the client owns the id so saving is idempotent. */
export async function saveShot(s: {
  id: string;
  title: string;
  sceneSlug: string | null;
  placeId: string | null;
  characterIds: string[];
  refIds: string[];
  camera: ShotCamera;
  lightingId: string;
  timeId: string;
  aspectId: string;
  action: string;
  extra: string;
}): Promise<void> {
  await sql()`
    INSERT INTO studio_shots
      (id, title, scene_slug, place_id, character_ids, ref_ids, camera,
       lighting_id, time_id, aspect_id, action, extra)
    VALUES
      (${s.id}, ${s.title}, ${s.sceneSlug}, ${s.placeId},
       ${s.characterIds}, ${s.refIds}, ${JSON.stringify(s.camera)},
       ${s.lightingId}, ${s.timeId}, ${s.aspectId}, ${s.action}, ${s.extra})
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      scene_slug = EXCLUDED.scene_slug,
      place_id = EXCLUDED.place_id,
      character_ids = EXCLUDED.character_ids,
      ref_ids = EXCLUDED.ref_ids,
      camera = EXCLUDED.camera,
      lighting_id = EXCLUDED.lighting_id,
      time_id = EXCLUDED.time_id,
      aspect_id = EXCLUDED.aspect_id,
      action = EXCLUDED.action,
      extra = EXCLUDED.extra,
      updated_at = now()
  `;
}

export async function deleteShot(id: string): Promise<void> {
  await sql()`DELETE FROM studio_shots WHERE id = ${id}`;
}
