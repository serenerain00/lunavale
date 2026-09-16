"use client";

/**
 * The shot builder. Canon in, two prompts out.
 *
 * IT READS THE PUBLISHED STORY. The scene picker is lib/content/videos.ts, and
 * choosing one fills in place, cast and the environment's style suffix from
 * what is actually on the site. That is the difference between a prompt tool
 * and a prompt tool that cannot drift: there is no second, remembered version
 * of where the bar is or who is in it.
 *
 * IT SAYS WHAT IT CANNOT DO. The gaps panel is not a validation error list —
 * it is the honest running commentary. No face reference at this angle means
 * no generator on earth is going to give you this angle from what is in the
 * library, and the tool says so in those words rather than emitting a
 * confident prompt that will quietly produce a stranger.
 *
 * TWO PROMPTS BECAUSE THE PIPELINE HAS TWO STEPS — anchor still, then motion
 * for Kling / Runway / Veo / Sora. See lib/studio/prompt.ts for why the motion
 * prompt is deliberately thin.
 */

import { useMemo, useState } from "react";
import {
  aspects,
  azimuths,
  byId,
  cameraHeights,
  lenses,
  lighting,
  movements,
  shotSizes,
  tilts,
  timesOfDay,
  type Option,
} from "@/lib/studio/vocab";
import { compileShot, compileForTarget, type PromptTarget } from "@/lib/studio/prompt";
import type { ShotCamera, ShotRecipe, StudioRef } from "@/lib/studio/types";
import { refKinds } from "@/lib/studio/types";
import { FramingDiagram } from "@/components/studio/FramingDiagram";
import { INPUT, SELECT, type PlaceOpt, type Person } from "@/components/studio/RefLibrary";

export interface SceneOpt {
  slug: string;
  title: string;
  placeId: string;
  characterIds: string[];
}

export function ShotBuilder({
  draft,
  setDraft,
  refs,
  people,
  places,
  scenes,
  onSave,
  saving,
}: {
  draft: ShotRecipe;
  setDraft: (d: ShotRecipe) => void;
  refs: StudioRef[];
  people: Person[];
  places: PlaceOpt[];
  scenes: SceneOpt[];
  onSave: () => void;
  saving: boolean;
}) {
  const names = useMemo(
    () => Object.fromEntries(people.map((p) => [p.id, p.label])),
    [people],
  );
  const compiled = useMemo(
    () => compileShot(draft, refs, names),
    [draft, refs, names],
  );
  // Where this is going. Kept in the builder rather than in the recipe: it is
  // about the tool you happen to be pasting into today, not about the shot.
  const [target, setTarget] = useState<PromptTarget>("chatgpt");
  const targeted = useMemo(
    () => (target === "video" ? null : compileForTarget(draft, refs, names, target)),
    [draft, refs, names, target],
  );

  const set = <K extends keyof ShotRecipe>(k: K, v: ShotRecipe[K]) =>
    setDraft({ ...draft, [k]: v });
  const setCam = <K extends keyof ShotCamera>(k: K, v: ShotCamera[K]) =>
    setDraft({ ...draft, camera: { ...draft.camera, [k]: v } });

  /** The face reference at the chosen angle, if one exists — drives the preview. */
  const faceUrl = useMemo(() => {
    const who = draft.characterIds[0];
    const match = refs.find(
      (r) =>
        draft.refIds.includes(r.id) &&
        r.kind === "face" &&
        r.characterId === who &&
        r.angleId === draft.camera.azimuthId,
    );
    return match ? `/api/studio/refs/${match.id}` : null;
  }, [refs, draft.refIds, draft.characterIds, draft.camera.azimuthId]);

  /**
   * Every reference belonging to these people, for auto-attaching.
   *
   * WHY AUTO-ATTACH AT ALL. The first version made you click each tile, under
   * a heading that said "References attached" while none were — so picking
   * Luna and uploading four pictures of her produced a red panel saying
   * nothing was attached for Luna, with her four pictures visible directly
   * underneath it. Picking somebody IS the instruction to use their
   * references; taking one back out is the deliberate act, and still one
   * click.
   */
  const refsFor = (ids: string[]) =>
    refs.filter((r) => r.characterId && ids.includes(r.characterId)).map((r) => r.id);

  function toggleCharacter(id: string) {
    const on = draft.characterIds.includes(id);
    const characterIds = on
      ? draft.characterIds.filter((x) => x !== id)
      : [...draft.characterIds, id];
    const theirs = refsFor([id]);
    const refIds = on
      ? draft.refIds.filter((x) => !theirs.includes(x))
      : [...new Set([...draft.refIds, ...theirs])];
    setDraft({ ...draft, characterIds, refIds });
  }

  function pickScene(slug: string) {
    const s = scenes.find((x) => x.slug === slug);
    if (!s) {
      set("sceneSlug", null);
      return;
    }
    // Pre-fill from published canon rather than from memory.
    setDraft({
      ...draft,
      sceneSlug: s.slug,
      placeId: s.placeId,
      characterIds: s.characterIds,
      // The cast came from canon, so their references come with them.
      refIds: [...new Set([...draft.refIds, ...refsFor(s.characterIds)])],
      title: draft.title.trim() || s.title,
    });
  }

  const toggleRef = (id: string) =>
    set(
      "refIds",
      draft.refIds.includes(id)
        ? draft.refIds.filter((x) => x !== id)
        : [...draft.refIds, id],
    );

  const relevant = refs.filter(
    (r) =>
      r.characterId === null ||
      draft.characterIds.includes(r.characterId) ||
      draft.refIds.includes(r.id),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
      {/* ------------------------------------------------------- controls -- */}
      <div className="space-y-7">
        <section className="space-y-3">
          <input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full rounded-sm border border-hairline bg-charcoal px-3 py-2 font-display text-lg text-ivory"
            placeholder="Name this shot"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Scene it belongs to" hint="Fills place and cast from the site">
              <select value={draft.sceneSlug ?? ""} onChange={(e) => pickScene(e.target.value)} className={SELECT}>
                <option value="">Not tied to a scene</option>
                {scenes.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Place">
              <select value={draft.placeId ?? ""} onChange={(e) => set("placeId", e.target.value || null)} className={SELECT}>
                <option value="">No place</option>
                {places.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Who is in it">
            <div className="flex flex-wrap gap-2">
              {people.map((p) => {
                const on = draft.characterIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleCharacter(p.id)}
                    className={`rounded-sm border px-2.5 py-1 text-[13px] ${
                      on
                        ? "border-amber/50 bg-amber/15 text-amber-soft"
                        : "border-hairline text-stone hover:text-ivory"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="What she is doing" hint="The one part no vocabulary can supply">
            <textarea
              value={draft.action}
              onChange={(e) => set("action", e.target.value)}
              rows={2}
              className={INPUT}
              placeholder="standing at the kitchen window with a coffee going cold, not drinking it"
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-lg text-ivory">Camera</h3>
          <Picker label="Shot size" options={shotSizes} value={draft.camera.sizeId} onChange={(v) => setCam("sizeId", v)} />
          <Picker label="Angle on her" options={azimuths} value={draft.camera.azimuthId} onChange={(v) => setCam("azimuthId", v)}
                  footnote="The only control here that needs a reference to exist. Coverage is in the library tab." />
          <Picker label="Camera height" options={cameraHeights} value={draft.camera.heightId} onChange={(v) => setCam("heightId", v)} />
          <Picker label="Tilt" options={tilts} value={draft.camera.tiltId} onChange={(v) => setCam("tiltId", v)} />
          <Picker label="Lens" options={lenses} value={draft.camera.lensId} onChange={(v) => setCam("lensId", v)} />
          <Picker label="Movement" options={movements} value={draft.camera.movementId} onChange={(v) => setCam("movementId", v)}
                  footnote="This is the half that becomes the motion prompt." />
        </section>

        <section className="space-y-4">
          <h3 className="font-display text-lg text-ivory">Light and frame</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Lighting">
              <select value={draft.lightingId} onChange={(e) => set("lightingId", e.target.value)} className={SELECT}>
                {lighting.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Time">
              <select value={draft.timeId} onChange={(e) => set("timeId", e.target.value)} className={SELECT}>
                {timesOfDay.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Aspect">
              <select value={draft.aspectId} onChange={(e) => set("aspectId", e.target.value)} className={SELECT}>
                {aspects.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </Field>
          </div>
          <p className="text-[12px] text-stone-dim">{byId(aspects, draft.aspectId).where}</p>
        </section>

        <section className="space-y-3">
          <h3 className="font-display text-lg text-ivory">
            References{" "}
            <span className="text-sm text-stone">
              — {draft.refIds.length} of {relevant.length} attached
            </span>
          </h3>
          <p className="text-[12px] text-stone-dim">
            Picking somebody attaches their references. Click a tile to drop one
            from this shot; dimmed means it is not in the prompt.
          </p>
          {relevant.length === 0 ? (
            <p className="text-sm text-stone">Nothing in the library for this cast yet.</p>
          ) : (
            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {relevant.map((r) => {
                const on = draft.refIds.includes(r.id);
                return (
                  <li key={r.id}>
                    <button type="button" onClick={() => toggleRef(r.id)}
                            className={`block w-full overflow-hidden rounded-sm border ${
                              on ? "border-amber" : "border-hairline opacity-50 hover:opacity-90"
                            }`}
                            title={`${r.label} — ${refKinds.find((k) => k.id === r.kind)?.label}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- gated proxy route */}
                      <img src={`/api/studio/refs/${r.id}`} alt={r.label} className="aspect-square w-full object-cover" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <Field label="Anything else to hold constant">
            <textarea value={draft.extra} onChange={(e) => set("extra", e.target.value)} rows={2}
                      className={INPUT} placeholder="Silver ring, right hand. Hair down, unstyled." />
          </Field>
        </section>
      </div>

      {/* --------------------------------------------------------- output -- */}
      <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <FramingDiagram camera={draft.camera} aspect={byId(aspects, draft.aspectId)} faceUrl={faceUrl} />

        {compiled.gaps.length > 0 && (
          <section className="space-y-1.5 rounded-sm border border-wine/40 bg-wine/10 p-3">
            <h4 className="text-[12px] uppercase tracking-wide text-stone">What is missing</h4>
            <ul className="space-y-1 text-[13px] text-stone">
              {compiled.gaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          </section>
        )}

        {/*
          ONE BUTTON PER DESTINATION. The four-block version was written for
          image-to-video and was actively wrong for a chat generator: two of
          the blocks (motion, negative) are noise to ChatGPT, and the two that
          matter arrived split so they had to be pasted twice. See PromptTarget
          in lib/studio/prompt.ts for why the shapes genuinely differ.
        */}
        <div className="flex gap-1.5">
          {(
            [
              ["chatgpt", "ChatGPT"],
              ["gemini", "Gemini"],
              ["video", "Video"],
            ] as [PromptTarget, string][]
          ).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTarget(id)}
                    className={`rounded-sm border px-2.5 py-1 text-[12px] ${
                      id === target
                        ? "border-amber/50 bg-amber/15 text-amber-soft"
                        : "border-hairline text-stone hover:text-ivory"
                    }`}>
              {label}
            </button>
          ))}
        </div>

        {targeted ? (
          <>
            {targeted.caution && (
              <p className="rounded-sm border border-wine/40 bg-wine/10 p-2.5 text-[12px] text-stone">
                {targeted.caution}
              </p>
            )}
            <Copyable
              title={target === "gemini" ? "Paste into Gemini" : "Paste into ChatGPT"}
              body={targeted.text}
              note={
                target === "gemini"
                  ? "One paste. Gemini holds a long description and takes the Avoid line literally."
                  : "One paste. No negative prompt — ChatGPT puts whatever you forbid into the frame."
              }
            />
            {targeted.attach.length > 0 && (
              <section className="space-y-1.5 rounded-sm border border-hairline bg-obsidian p-3">
                <h4 className="text-[12px] uppercase tracking-wide text-stone">
                  Then attach these {targeted.attach.length} file
                  {targeted.attach.length > 1 ? "s" : ""}
                </h4>
                <ul className="ml-4 list-disc text-[13px] text-stone">
                  {targeted.attach.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
                <p className="text-[12px] text-stone-dim">
                  These are the labels they were uploaded under, so they are the filenames on your
                  machine. The Library tab has each one if you need to pull it back down.
                </p>
              </section>
            )}
          </>
        ) : (
          <>
            <Copyable title="1 — Anchor still" body={compiled.anchor}
                      note="Make this frame first. Every noun lives here." />
            <Copyable title="2 — Motion" body={compiled.motion}
                      note="Paste with the anchor into Kling / Runway / Veo / Sora. Thin on purpose — the look comes from the frame." />
            {compiled.consistency && (
              <Copyable title="Consistency" body={compiled.consistency}
                        note="The details that go missing on shot nine. Paste alongside, every time." />
            )}
            <Copyable title="Negative" body={compiled.negative} note="If your tool takes one." />
          </>
        )}

        {target === "video" && compiled.referenceBrief.length > 0 && (
          <section className="space-y-2 rounded-sm border border-hairline bg-obsidian p-3">
            <h4 className="text-[12px] uppercase tracking-wide text-stone">Hand it these, in this order</h4>
            {compiled.referenceBrief.map((g) => (
              <div key={g.heading}>
                <p className="text-[12px] text-amber-soft">{g.heading}</p>
                <ul className="ml-4 list-disc text-[13px] text-stone">
                  {g.items.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        <button type="button" onClick={onSave} disabled={saving}
                className="w-full rounded-sm border border-amber/50 bg-amber/10 px-4 py-2.5 text-sm text-amber-soft hover:bg-amber/20 disabled:opacity-50">
          {saving ? "Saving…" : "Save this shot"}
        </button>
      </div>
    </div>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
  footnote,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  footnote?: string;
}) {
  const current = options.find((o) => o.id === value);
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] uppercase tracking-wide text-stone-dim">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)}
                  className={`rounded-sm border px-2 py-1 text-[12px] ${
                    o.id === value
                      ? "border-amber/50 bg-amber/15 text-amber-soft"
                      : "border-hairline text-stone hover:text-ivory"
                  }`}>
            {o.label}
          </button>
        ))}
      </div>
      {current?.note && <p className="text-[12px] text-stone">{current.note}</p>}
      {footnote && <p className="text-[12px] text-stone-dim">{footnote}</p>}
    </div>
  );
}

function Copyable({ title, body, note }: { title: string; body: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="space-y-1.5 rounded-sm border border-hairline bg-obsidian p-3">
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-[12px] uppercase tracking-wide text-stone">{title}</h4>
        <button type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(body);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1400);
                }}
                className="text-[12px] text-amber-soft hover:underline">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-ivory">{body}</p>
      {note && <p className="text-[12px] text-stone-dim">{note}</p>}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-[11px] uppercase tracking-wide text-stone-dim">{label}</span>
      {children}
      {hint && <span className="block text-[12px] text-stone-dim">{hint}</span>}
    </label>
  );
}
