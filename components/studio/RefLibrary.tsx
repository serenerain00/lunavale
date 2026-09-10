"use client";

/**
 * The reference library — upload, tag, and see what is missing.
 *
 * THE COVERAGE GRID IS THE POINT, not the upload button. A wall of thumbnails
 * tells her what she has; the grid at the top tells her what she has NOT, per
 * character, per angle, which is the question that actually blocks a shot. An
 * empty cell there is the honest version of "the tool cannot rotate her head":
 * that angle does not exist yet, and here is exactly which one to go and make.
 *
 * TAGGING IS COMPULSORY-ISH BY DESIGN. Kind and character are pickers with no
 * blank option worth choosing, because an untagged library is a folder, and she
 * already has folders. The angle field only appears for face and body refs,
 * which are the only kinds the shot builder looks angles up in.
 */

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { azimuths } from "@/lib/studio/vocab";
import { refKinds, type RefKind, type StudioRef } from "@/lib/studio/types";

export interface Person { id: string; label: string }
export interface PlaceOpt { id: string; label: string }

export function RefLibrary({
  refs,
  people,
  places,
  onChanged,
  blobConfigured,
}: {
  refs: StudioRef[];
  people: Person[];
  places: PlaceOpt[];
  onChanged: () => void;
  /** With Blob set up the browser uploads direct; without it, files go to disk. */
  blobConfigured: boolean;
}) {
  const [filterWho, setFilterWho] = useState<string>("");
  const [filterKind, setFilterKind] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const shown = refs.filter(
    (r) =>
      (!filterWho || r.characterId === filterWho) &&
      (!filterKind || r.kind === filterKind),
  );

  /**
   * THE BYTES DO NOT GO THROUGH A FUNCTION. `upload()` sends the file straight
   * from this browser to Blob using a token minted by /api/studio/refs/token,
   * because a serverless request body is far too small for a real photograph —
   * the multipart version of this returned a bare 413 from the platform before
   * any of our code ran. Only the metadata is POSTed, afterwards.
   *
   * The id is minted here and IS the blob filename, so the row and the object
   * agree without a second round trip to find out what the object got called.
   */
  async function addFiles(files: FileList) {
    setError(null);
    setBusy(true);
    const list = Array.from(files);
    try {
      for (const [i, file] of list.entries()) {
        setProgress(list.length > 1 ? `${i + 1} of ${list.length}: ${file.name}` : file.name);

        const ext = EXT[file.type];
        if (!ext) throw new Error(`${file.name} is not a JPEG, PNG, WebP or AVIF.`);
        if (file.size > MAX_BYTES) {
          throw new Error(`${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB — the cap is 25MB.`);
        }

        // Decoded here anyway to show a preview, so the dimensions come along
        // rather than putting an image decoder on the server.
        const dims = await imageSize(file);
        const id = crypto.randomUUID();

        if (blobConfigured) {
          await upload(`studio/refs/${id}.${ext}`, file, {
            access: "private",
            contentType: file.type,
            handleUploadUrl: "/api/studio/refs/token",
            onUploadProgress: ({ percentage }) =>
              setProgress(
                `${list.length > 1 ? `${i + 1}/${list.length} ` : ""}${file.name} — ${Math.round(percentage)}%`,
              ),
          });
          await post("/api/studio/refs", {
            id,
            kind: filterKind || "face",
            characterId: filterWho,
            label: file.name.replace(/\.[^.]+$/, ""),
            width: dims.w,
            height: dims.h,
            mime: file.type,
            bytes: file.size,
          });
        } else {
          // No Blob configured: the old multipart path, straight to disk.
          const form = new FormData();
          form.set("file", file);
          form.set("kind", filterKind || "face");
          form.set("characterId", filterWho);
          form.set("label", file.name.replace(/\.[^.]+$/, ""));
          form.set("width", String(dims.w));
          form.set("height", String(dims.h));
          const res = await fetch("/api/studio/refs", { method: "POST", body: form });
          if (!res.ok) {
            const body = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(body.error ?? `Upload failed (${res.status})`);
          }
        }
      }
      startTransition(onChanged);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const b = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(b.error ?? `Failed (${res.status})`);
    }
  }

  return (
    <div className="space-y-8">
      <Coverage refs={refs} people={people} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Who">
            <select value={filterWho} onChange={(e) => setFilterWho(e.target.value)} className={SELECT}>
              <option value="">Everyone</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Kind">
            <select value={filterKind} onChange={(e) => setFilterKind(e.target.value)} className={SELECT}>
              <option value="">All kinds</option>
              {refKinds.map((k) => (
                <option key={k.id} value={k.id}>{k.label}</option>
              ))}
            </select>
          </Field>
          <div className="ml-auto">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="rounded-sm border border-amber/50 bg-amber/10 px-4 py-2 text-sm text-amber-soft hover:bg-amber/20 disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Add references"}
            </button>
          </div>
        </div>
        <p className="text-[12px] text-stone-dim">
          New uploads take the filters above as their starting tags — set Who and Kind first and a
          batch lands already filed. JPEG, PNG, WebP or AVIF, 25MB each.
        </p>
        {progress && <p className="text-[12px] text-amber-soft">{progress}</p>}
        {error && <p className="text-sm text-wine">{error}</p>}
      </section>

      {shown.length === 0 ? (
        <p className="text-sm text-stone">
          Nothing here yet. Start with Luna: front, three-quarter both sides, and profile. Those
          four are what every other shot is built on.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((r) => (
            <RefCard key={r.id} r={r} people={people} places={places} onChanged={onChanged} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * What exists, and — the useful half — what does not. One row per person, one
 * column per angle, so the hole in the library is a visible hole.
 */
function Coverage({ refs, people }: { refs: StudioRef[]; people: Person[] }) {
  const cast = people.filter((p) => refs.some((r) => r.characterId === p.id));
  if (cast.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="font-display text-lg text-ivory">Angle coverage</h3>
      <p className="text-[12px] text-stone-dim">
        Faces only. An empty cell is an angle nothing can invent for you — it is a shot to go and
        make, not a slider to drag.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-[12px]">
          <thead>
            <tr className="text-stone-dim">
              <th className="py-1 pr-3 text-left font-normal">&nbsp;</th>
              {azimuths.map((a) => (
                <th key={a.id} className="px-2 py-1 text-left font-normal whitespace-nowrap">
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cast.map((p) => (
              <tr key={p.id} className="border-t border-hairline">
                <td className="py-1.5 pr-3 text-ivory whitespace-nowrap">{p.label}</td>
                {azimuths.map((a) => {
                  const n = refs.filter(
                    (r) => r.characterId === p.id && r.kind === "face" && r.angleId === a.id,
                  ).length;
                  return (
                    <td key={a.id} className="px-2 py-1.5">
                      <span
                        className={
                          n
                            ? "inline-block rounded-sm bg-amber/20 px-1.5 text-amber-soft"
                            : "inline-block rounded-sm bg-charcoal px-1.5 text-stone-dim"
                        }
                      >
                        {n || "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RefCard({
  r,
  people,
  places,
  onChanged,
}: {
  r: StudioRef;
  people: Person[];
  places: PlaceOpt[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    kind: r.kind as RefKind,
    characterId: r.characterId ?? "",
    label: r.label,
    angleId: r.angleId ?? "",
    placeId: r.placeId ?? "",
    notes: r.notes,
  });
  const [saving, setSaving] = useState(false);

  const needsAngle = draft.kind === "face" || draft.kind === "body";
  const needsPlace = draft.kind === "environment" || draft.kind === "lighting";

  async function save() {
    setSaving(true);
    await fetch(`/api/studio/refs/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    setOpen(false);
    onChanged();
  }

  async function remove() {
    if (!confirm(`Delete "${r.label}"? The image stays in storage; the record goes.`)) return;
    await fetch(`/api/studio/refs/${r.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <li className="overflow-hidden rounded-sm border border-hairline bg-obsidian">
      {/* eslint-disable-next-line @next/next/no-img-element -- gated proxy route, not an optimizable static asset */}
      <img
        src={`/api/studio/refs/${r.id}`}
        alt={r.label}
        className="aspect-square w-full cursor-pointer object-cover"
        onClick={() => setOpen((o) => !o)}
      />
      <div className="space-y-1 p-2">
        <p className="truncate text-[13px] text-ivory">{r.label}</p>
        <p className="text-[11px] text-stone-dim">
          {refKinds.find((k) => k.id === r.kind)?.label}
          {r.angleId ? ` · ${azimuths.find((a) => a.id === r.angleId)?.label}` : ""}
        </p>
        {open && (
          <div className="space-y-2 pt-2">
            <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                   className={INPUT} placeholder="Label" />
            <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as RefKind })} className={SELECT}>
              {refKinds.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
            <select value={draft.characterId} onChange={(e) => setDraft({ ...draft, characterId: e.target.value })} className={SELECT}>
              <option value="">Nobody</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            {needsAngle && (
              <select value={draft.angleId} onChange={(e) => setDraft({ ...draft, angleId: e.target.value })} className={SELECT}>
                <option value="">Angle not set</option>
                {azimuths.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            )}
            {needsPlace && (
              <select value={draft.placeId} onChange={(e) => setDraft({ ...draft, placeId: e.target.value })} className={SELECT}>
                <option value="">No place</option>
                {places.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            )}
            <textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                      rows={2} className={INPUT}
                      placeholder={draft.kind === "tattoo" ? "Placement — inner left forearm, 4in" : "Notes"} />
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={saving}
                      className="flex-1 rounded-sm border border-amber/50 bg-amber/10 px-2 py-1 text-[12px] text-amber-soft disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={remove}
                      className="rounded-sm border border-hairline px-2 py-1 text-[12px] text-stone hover:text-wine">
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-stone-dim">{label}</span>
      {children}
    </label>
  );
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 25 * 1024 * 1024;

async function imageSize(file: File): Promise<{ w: number; h: number }> {
  try {
    const bmp = await createImageBitmap(file);
    const out = { w: bmp.width, h: bmp.height };
    bmp.close();
    return out;
  } catch {
    return { w: 0, h: 0 };
  }
}

export const SELECT =
  "w-full rounded-sm border border-hairline bg-charcoal px-2 py-1.5 text-[13px] text-ivory";
export const INPUT =
  "w-full rounded-sm border border-hairline bg-charcoal px-2 py-1.5 text-[13px] text-ivory placeholder:text-stone-dim";
