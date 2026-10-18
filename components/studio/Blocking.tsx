"use client";

/**
 * Blocking — pose a mannequin, frame it, take the picture.
 *
 * Melissa, 2026-10-17: "a 3d model of a human that i can rotate, pan, tilt,
 * zoom in/out of freely, that will allow me to frame a character by example
 * … then take a pic of it and give it to gpt to create that img in this
 * angle". And then: "i need the model to change head angle, like if i need to
 * frame them looking right, but head on … or i need them to turn their neck".
 *
 * So the head gets its own controls, always on screen for the selected figure
 * (turn, nod, tilt, look at camera), rather than being one joint among
 * seventeen you have to find and click.
 *
 * "TAKE THE SHOT" DOES THREE THINGS: renders the frame at delivery size, reads
 * the camera back into the shot's own settings (size, height, tilt, angle,
 * lens — so the prompt and the picture agree), and offers the picture three
 * ways: copy (paste straight into ChatGPT), download, or file it in the
 * library as a pose reference attached to this shot, which is what makes the
 * prompt tell the generator to follow it.
 */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { upload } from "@vercel/blob/client";
import {
  FIGURE_TONES,
  JOINT_LABEL,
  POSES,
  PROPS,
  azimuthWords,
  defaultBuild,
  mirrorFigure,
  posedFigure,
  type Blocking as BlockingData,
  type BlockingFigure,
  type BlockingProp,
  type JointId,
  type PropKind,
  type Vec3,
} from "@/lib/studio/blocking";
import { aspects, azimuths, byId, cameraHeights, lenses, shotSizes, tilts } from "@/lib/studio/vocab";
import type { ShotRecipe } from "@/lib/studio/types";
import type { CameraReading, Selection, StageApi } from "@/components/studio/BlockingStage";
import { SELECT, type Person } from "@/components/studio/RefLibrary";

const BlockingStage = dynamic(
  () => import("@/components/studio/BlockingStage").then((m) => m.BlockingStage),
  { ssr: false, loading: () => <div className="grid h-full place-items-center text-sm text-stone">Loading the stage…</div> },
);

const MAX_FIGURES = 3;

function newFigure(characterId: string | null, index: number): BlockingFigure {
  return posedFigure(
    { id: crypto.randomUUID(), characterId, build: defaultBuild(characterId) },
    "stand",
    // Side by side, a little apart, facing the default camera.
    { x: (index - 0) * 0.9 * (index % 2 ? 1 : -1), z: 0, yaw: 0 },
  );
}

export function initialBlocking(characterIds: string[]): BlockingData {
  const ids = characterIds.slice(0, MAX_FIGURES);
  const figures = ids.length ? ids.map((id, i) => newFigure(id, i)) : [newFigure(null, 0)];
  return {
    figures,
    props: [],
    camera: { position: [0.9, 1.5, 3.2], target: [0, 1.3, 0], mm: 50 },
    grid: true,
  };
}

export function Blocking({
  draft,
  setDraft,
  people,
  blobConfigured,
  onChanged,
}: {
  draft: ShotRecipe;
  setDraft: Dispatch<SetStateAction<ShotRecipe>>;
  people: Person[];
  blobConfigured: boolean;
  onChanged: () => void;
}) {
  const [b, setB] = useState<BlockingData>(
    () => draft.camera.blocking ?? initialBlocking(draft.characterIds),
  );
  const [selection, setSelection] = useState<Selection>(null);
  const [activeFigure, setActiveFigure] = useState<string>(b.figures[0]?.id ?? "");
  const [mode, setMode] = useState<"rotate" | "translate">("rotate");
  const [hide, setHide] = useState(false);
  const [reading, setReading] = useState<CameraReading | null>(null);
  const [shot, setShot] = useState<{ url: string; blob: Blob } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const api = useRef<StageApi | null>(null);

  const aspect = byId(aspects, draft.aspectId);
  const ratio = aspect.w / aspect.h;
  const names = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p.label])), [people]);
  const fig = b.figures.find((f) => f.id === activeFigure) ?? b.figures[0];

  // Into the shot recipe, a beat after the last change, so saving the shot
  // saves the blocking with it. Not on every gizmo tick.
  useEffect(() => {
    const t = setTimeout(() => {
      setDraft((d) => ({ ...d, camera: { ...d.camera, blocking: b } }));
    }, 300);
    return () => clearTimeout(t);
  }, [b, setDraft]);

  // Live readout, a few times a second — cheap, and it is the whole feedback loop.
  useEffect(() => {
    const t = setInterval(() => {
      if (api.current && fig) setReading(api.current.read(fig.id));
    }, 250);
    return () => clearInterval(t);
  }, [fig]);

  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url); }, [shot]);

  const updateFigure = useCallback(
    (f: BlockingFigure) => setB((x) => ({ ...x, figures: x.figures.map((y) => (y.id === f.id ? f : y)) })),
    [],
  );
  const updateProp = useCallback(
    (p: BlockingProp) => setB((x) => ({ ...x, props: x.props.map((y) => (y.id === p.id ? p : y)) })),
    [],
  );
  const onCamera = useCallback((c: BlockingData["camera"]) => setB((x) => ({ ...x, camera: c })), []);
  const onSelect = useCallback((s: Selection) => {
    setSelection(s);
    if (s?.type === "joint") setActiveFigure(s.figureId);
  }, []);

  const setJoint = (f: BlockingFigure, j: JointId, v: Vec3) => updateFigure({ ...f, joints: { ...f.joints, [j]: v } });
  const jointOf = (f: BlockingFigure, j: JointId): Vec3 => f.joints[j] ?? [0, 0, 0];

  /* ---- head: one control split across neck and head, as a real neck does -- */
  const head = fig ? headOf(fig) : { turn: 0, nod: 0, tilt: 0 };
  function setHead(next: Partial<typeof head>) {
    if (!fig) return;
    const h = { ...head, ...next };
    updateFigure({
      ...fig,
      joints: {
        ...fig.joints,
        neck: [h.nod * 0.35, h.turn * 0.4, h.tilt * 0.3],
        head: [h.nod * 0.65, h.turn * 0.6, h.tilt * 0.7],
      },
    });
  }

  function lookAtCamera() {
    if (!fig || !api.current) return;
    const r = api.current.lookAtCamera(fig.id);
    if (r) setHead({ turn: Math.round(r.turn), nod: Math.round(r.nod) });
  }

  /* ---- the camera, in film words --------------------------------------- */
  const derived = reading ? toVocab(reading) : null;
  const who = fig?.characterId ? names[fig.characterId] ?? fig.characterId : "the figure";
  const words = reading && derived && fig ? describe(reading, derived, who, fig.build) : null;

  async function takeShot() {
    if (!api.current || !fig) return;
    setBusy(true);
    setStatus(null);
    setSelection(null);
    setHide(true);
    try {
      // Two frames for the gizmo and the highlight to leave the picture.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const blob = await api.current.capture(aspect.px);
      setShot({ url: URL.createObjectURL(blob), blob });
      const r = api.current.read(fig.id);
      if (r) {
        const v = toVocab(r);
        const text = describe(r, v, who, fig.build);
        setB((x) => ({ ...x, readout: text }));
        setDraft((d) => ({
          ...d,
          camera: { ...d.camera, ...v.ids, blocking: { ...b, readout: text } },
        }));
        setStatus("Camera copied into the shot: " + v.summary);
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Snapshot failed.");
    } finally {
      setHide(false);
      setBusy(false);
    }
  }

  async function copyShot() {
    if (!shot) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": shot.blob })]);
      setStatus("Copied. Paste it into ChatGPT with the face references and the prompt from the Shot tab.");
    } catch {
      setStatus("This browser would not copy an image. Use Download instead.");
    }
  }

  function downloadShot() {
    if (!shot) return;
    const a = document.createElement("a");
    a.href = shot.url;
    a.download = `${(draft.title || "blocking").replace(/[^\w-]+/g, "-").toLowerCase()}-mannequin.png`;
    a.click();
  }

  function legend(): string {
    const parts = b.figures.map((f, i) => {
      const n = f.characterId ? names[f.characterId] ?? f.characterId : "a stand-in";
      return b.figures.length > 1 ? `The ${FIGURE_TONES[i % FIGURE_TONES.length].name} figure is ${n}.` : `The figure is ${n}.`;
    });
    return ["Mannequin blocking.", ...parts, b.readout ?? ""].filter(Boolean).join(" ");
  }

  async function saveShot() {
    if (!shot) return;
    setBusy(true);
    setStatus("Filing in the library…");
    try {
      const id = crypto.randomUUID();
      const label = `${draft.title.trim() || "Blocking"} — mannequin`;
      const dims = await new Promise<{ w: number; h: number }>((res) => {
        const img = new Image();
        img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
        img.src = shot.url;
      });
      const meta = {
        kind: "pose",
        characterId: fig?.characterId ?? "",
        label,
        angleId: "",
        notes: legend(),
        width: dims.w,
        height: dims.h,
      };
      if (blobConfigured) {
        await upload(`studio/refs/${id}.png`, shot.blob, {
          access: "private",
          contentType: "image/png",
          handleUploadUrl: "/api/studio/refs/token",
        });
        const res = await fetch("/api/studio/refs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...meta, mime: "image/png", bytes: shot.blob.size }),
        });
        if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? `Save failed (${res.status})`);
        setDraft((d) => ({ ...d, refIds: [...new Set([...d.refIds, id])] }));
      } else {
        const form = new FormData();
        form.set("file", new File([shot.blob], `${id}.png`, { type: "image/png" }));
        for (const [k, v] of Object.entries(meta)) form.set(k, String(v));
        const res = await fetch("/api/studio/refs", { method: "POST", body: form });
        const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
        if (!res.ok || !body.id) throw new Error(body.error ?? `Save failed (${res.status})`);
        const newId = body.id;
        setDraft((d) => ({ ...d, refIds: [...new Set([...d.refIds, newId])] }));
      }
      onChanged();
      setStatus("Saved to the library as a pose reference and attached to this shot. The Shot tab's prompt now tells the generator to follow it.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  /* ---- figures and props ------------------------------------------------ */
  function addFigure() {
    if (b.figures.length >= MAX_FIGURES) return;
    const used = new Set(b.figures.map((f) => f.characterId));
    const next = draft.characterIds.find((id) => !used.has(id)) ?? null;
    const f = newFigure(next, b.figures.length);
    setB((x) => ({ ...x, figures: [...x.figures, f] }));
    setActiveFigure(f.id);
  }

  function applyPose(f: BlockingFigure, poseId: string) {
    const yaw = jointOf(f, "pelvis")[1];
    const posed = posedFigure(f, poseId, { x: f.position[0], z: f.position[2], yaw });
    updateFigure(posed);
  }

  function addProp(kind: PropKind) {
    const p: BlockingProp = { id: crypto.randomUUID(), kind, position: [0, 0, -0.6], rotationY: 0 };
    setB((x) => ({ ...x, props: [...x.props, p] }));
    setSelection({ type: "prop", propId: p.id });
    setMode("translate");
  }

  const selectedProp = selection?.type === "prop" ? b.props.find((p) => p.id === selection.propId) : undefined;
  const selectedJoint = selection?.type === "joint" ? selection : null;
  const jointFig = selectedJoint ? b.figures.find((f) => f.id === selectedJoint.figureId) : undefined;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      {/* ------------------------------------------------------------ stage -- */}
      <div className="space-y-3">
        <div
          className="relative mx-auto overflow-hidden rounded-sm border border-hairline bg-charcoal"
          style={{ aspectRatio: `${aspect.w} / ${aspect.h}`, width: `min(100%, calc(72vh * ${ratio}))` }}
        >
          <BlockingStage
            blocking={b}
            aspect={ratio}
            selection={selection}
            mode={mode}
            hideHelpers={hide}
            onSelect={onSelect}
            onFigure={updateFigure}
            onProp={updateProp}
            onCamera={onCamera}
            api={api}
          />
          {/* Thirds, for framing. Outside the canvas, so never in the snapshot. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-1/3 border-l border-white/10" />
            <div className="absolute inset-y-0 left-2/3 border-l border-white/10" />
            <div className="absolute inset-x-0 top-1/3 border-t border-white/10" />
            <div className="absolute inset-x-0 top-2/3 border-t border-white/10" />
          </div>
        </div>

        <p className="text-center text-[12px] text-stone-dim">
          Drag to orbit · right-drag (or two fingers) to pan · scroll or pinch to zoom · click a body part to bend it
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="button"
            onClick={takeShot}
            disabled={busy}
            className="rounded-sm bg-amber px-4 py-2 text-sm font-medium text-ink hover:bg-amber-soft disabled:opacity-50"
          >
            Take the shot
          </button>
          <label className="flex items-center gap-2 text-[13px] text-stone">
            Lens
            <input
              type="range" min={14} max={200} step={1} value={b.camera.mm}
              onChange={(e) => onCamera({ ...(api.current?.cameraState() ?? b.camera), mm: Number(e.target.value) })}
              className="w-36 accent-amber"
            />
            <span className="w-12 tabular-nums text-ivory">{b.camera.mm}mm</span>
          </label>
          <div className="flex gap-1">
            {lenses.map((l) => (
              <button key={l.id} type="button"
                onClick={() => onCamera({ ...(api.current?.cameraState() ?? b.camera), mm: l.mm })}
                className={chip(b.camera.mm === l.mm)}>{l.mm}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[13px] text-stone">
            <input type="checkbox" checked={b.grid} onChange={(e) => setB((x) => ({ ...x, grid: e.target.checked }))} className="accent-amber" />
            Floor grid
          </label>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[12px] uppercase tracking-wider text-stone-dim">Camera to {who}</span>
            {[["Front", 0], ["¾ left", -40], ["Profile L", -90], ["Behind L", -140], ["Behind", 180], ["Behind R", 140], ["Profile R", 90], ["¾ right", 40]].map(([label, a]) => (
              <button key={label} type="button" className={chip(false)}
                onClick={() => fig && api.current?.placeCamera(fig.id, a as number, reading ? reading.cameraY - reading.eyeY : 0)}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-[12px] uppercase tracking-wider text-stone-dim">Height</span>
            {([["Floor", "floor"], ["Low", -0.8], ["Chest", -0.35], ["Eye", 0], ["High", 0.5], ["Overhead", "overhead"]] as [string, number | "floor" | "overhead"][]).map(([label, d]) => (
              <button key={label} type="button" className={chip(false)}
                onClick={() => fig && api.current?.placeCamera(fig.id, reading?.bodyAzimuth ?? 0, d)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-hairline bg-charcoal/60 p-3 text-[13px] leading-relaxed text-stone">
          {words ? (
            <>
              <p className="text-ivory">{words}</p>
              {reading && !reading.inFrame && <p className="mt-1 text-wine">{who}&rsquo;s face is out of frame.</p>}
              {derived && <p className="mt-1 text-stone-dim">In Studio terms: {derived.summary}</p>}
            </>
          ) : (
            "Reading the camera…"
          )}
        </div>

        {status && <p className="text-[13px] text-amber-soft">{status}</p>}

        {shot && (
          <div className="flex flex-wrap items-start gap-4 border-t border-hairline pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL, not a site image */}
            <img src={shot.url} alt="The mannequin frame just taken" className="w-64 rounded-sm border border-hairline" />
            <div className="space-y-2">
              <p className="text-[13px] text-stone">{aspect.px[0]}×{aspect.px[1]} PNG</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyShot} className={btn}>Copy image</button>
                <button type="button" onClick={downloadShot} className={btn}>Download</button>
                <button type="button" onClick={saveShot} disabled={busy} className={btn}>Save to library &amp; attach</button>
              </div>
              <p className="max-w-sm text-[12px] leading-relaxed text-stone-dim">
                Give ChatGPT this picture <em>and</em> her face references. The mannequin fixes the angle and the body;
                the face at that angle still comes from her references.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------ panel -- */}
      <aside className="space-y-6 text-[13px]">
        <section className="space-y-2">
          <h3 className="text-[12px] uppercase tracking-wider text-stone-dim">People</h3>
          {b.figures.map((f, i) => (
            <div key={f.id}
              className={`space-y-2 rounded-sm border p-2.5 ${f.id === fig?.id ? "border-amber/50 bg-amber/5" : "border-hairline"}`}
              onClick={() => setActiveFigure(f.id)}
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: FIGURE_TONES[i % FIGURE_TONES.length].hex }} />
                <select value={f.characterId ?? ""} onChange={(e) => updateFigure({ ...f, characterId: e.target.value || null })} className={`${SELECT} flex-1`}>
                  <option value="">Stand-in</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <button type="button" className={chip(false)}
                  onClick={() => updateFigure({ ...f, build: f.build === "woman" ? "man" : "woman" })}>
                  {f.build === "woman" ? "Woman" : "Man"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select value="" onChange={(e) => e.target.value && applyPose(f, e.target.value)} className={`${SELECT} flex-1`}>
                  <option value="">Start from a pose…</option>
                  {POSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <button type="button" className={chip(false)} onClick={() => updateFigure(mirrorFigure(f))} title="Swap left and right">Mirror</button>
                <button type="button" className={chip(false)}
                  onClick={() => { onSelect({ type: "joint", figureId: f.id, joint: "pelvis" }); setMode("translate"); }}>
                  Move
                </button>
                {b.figures.length > 1 && (
                  <button type="button" className="text-stone-dim hover:text-wine"
                    onClick={(e) => { e.stopPropagation(); setB((x) => ({ ...x, figures: x.figures.filter((y) => y.id !== f.id) })); setSelection(null); }}>
                    ✕
                  </button>
                )}
              </div>
              <Slider label="Facing" min={-180} max={180} value={jointOf(f, "pelvis")[1]}
                onChange={(v) => { const p = jointOf(f, "pelvis"); setJoint(f, "pelvis", [p[0], v, p[2]]); }} />
            </div>
          ))}
          {b.figures.length < MAX_FIGURES && (
            <button type="button" onClick={addFigure} className="text-amber-soft hover:underline">+ Add a person</button>
          )}
        </section>

        {fig && (
          <section className="space-y-2">
            <h3 className="text-[12px] uppercase tracking-wider text-stone-dim">
              Head — {fig.characterId ? names[fig.characterId] : "stand-in"}
            </h3>
            <Slider label="Turn" hint="− her right · her left +" min={-90} max={90} value={head.turn} onChange={(v) => setHead({ turn: v })} />
            <Slider label="Nod" hint="− chin up · chin down +" min={-60} max={60} value={head.nod} onChange={(v) => setHead({ nod: v })} />
            <Slider label="Tilt" hint="ear to shoulder" min={-40} max={40} value={head.tilt} onChange={(v) => setHead({ tilt: v })} />
            <div className="flex gap-2">
              <button type="button" className={btn} onClick={lookAtCamera}>Look at camera</button>
              <button type="button" className={btn} onClick={() => setHead({ turn: 0, nod: 0, tilt: 0 })}>Straight ahead</button>
            </div>
          </section>
        )}

        {selectedJoint && jointFig && (
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[12px] uppercase tracking-wider text-stone-dim">{JOINT_LABEL[selectedJoint.joint]}</h3>
              {selectedJoint.joint === "pelvis" && (
                <div className="flex gap-1">
                  <button type="button" className={chip(mode === "rotate")} onClick={() => setMode("rotate")}>Rotate</button>
                  <button type="button" className={chip(mode === "translate")} onClick={() => setMode("translate")}>Move</button>
                </div>
              )}
            </div>
            {(["X", "Y", "Z"] as const).map((axis, i) => (
              <Slider key={axis} label={axis === "X" ? "Bend" : axis === "Y" ? "Twist" : "Side"} min={-180} max={180}
                value={jointOf(jointFig, selectedJoint.joint)[i]}
                onChange={(v) => {
                  const cur = [...jointOf(jointFig, selectedJoint.joint)] as Vec3;
                  cur[i] = v;
                  setJoint(jointFig, selectedJoint.joint, cur);
                }} />
            ))}
            {selectedJoint.joint === "pelvis" && (
              <Slider label="Height" min={0} max={1.4} step={0.01} value={jointFig.position[1]} unit="m"
                onChange={(v) => updateFigure({ ...jointFig, position: [jointFig.position[0], v, jointFig.position[2]] })} />
            )}
            <button type="button" className={btn} onClick={() => setJoint(jointFig, selectedJoint.joint, [0, 0, 0])}>Reset this joint</button>
          </section>
        )}

        <section className="space-y-2">
          <h3 className="text-[12px] uppercase tracking-wider text-stone-dim">Furniture</h3>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(PROPS) as PropKind[]).map((k) => (
              <button key={k} type="button" className={chip(false)} title={PROPS[k].note} onClick={() => addProp(k)}>+ {PROPS[k].label}</button>
            ))}
          </div>
          {selectedProp && (
            <div className="space-y-2 rounded-sm border border-hairline p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-ivory">{PROPS[selectedProp.kind].label}</span>
                <div className="flex gap-1">
                  <button type="button" className={chip(mode === "translate")} onClick={() => setMode("translate")}>Move</button>
                  <button type="button" className={chip(mode === "rotate")} onClick={() => setMode("rotate")}>Rotate</button>
                  <button type="button" className="ml-2 text-stone-dim hover:text-wine"
                    onClick={() => { setB((x) => ({ ...x, props: x.props.filter((p) => p.id !== selectedProp.id) })); setSelection(null); }}>
                    Remove
                  </button>
                </div>
              </div>
              <Slider label="Turn" min={-180} max={180} value={selectedProp.rotationY} onChange={(v) => updateProp({ ...selectedProp, rotationY: v })} />
            </div>
          )}
        </section>

        <button type="button" className="text-[12px] text-stone-dim hover:text-wine"
          onClick={() => { const n = initialBlocking(draft.characterIds); setB(n); setActiveFigure(n.figures[0].id); setSelection(null); }}>
          Start the blocking over
        </button>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- bits -- */

function Slider({ label, hint, min, max, step = 1, value, unit = "°", onChange }: {
  label: string; hint?: string; min: number; max: number; step?: number; value: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-[12px] text-stone">
        <span>{label}{hint && <span className="ml-2 text-stone-dim">{hint}</span>}</span>
        <span className="tabular-nums text-ivory">{unit === "m" ? value.toFixed(2) : Math.round(value)}{unit}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-amber" />
    </label>
  );
}

const btn = "rounded-sm border border-hairline px-2.5 py-1 text-[13px] text-ivory hover:border-amber/50 disabled:opacity-50";
const chip = (on: boolean) =>
  `rounded-sm border px-2 py-0.5 text-[12px] ${on ? "border-amber/50 bg-amber/15 text-amber-soft" : "border-hairline text-stone hover:text-ivory"}`;

function headOf(f: BlockingFigure) {
  const n = f.joints.neck ?? [0, 0, 0];
  const h = f.joints.head ?? [0, 0, 0];
  return { nod: Math.round(n[0] + h[0]), turn: Math.round(n[1] + h[1]), tilt: Math.round(n[2] + h[2]) };
}

/* ---------------------------------------------------- reading → words -- */

function nearest<T>(list: T[], value: (t: T) => number, x: number): T {
  return list.reduce((a, b) => (Math.abs(value(b) - x) < Math.abs(value(a) - x) ? b : a));
}

function wrap(d: number) {
  return ((((d + 180) % 360) + 360) % 360) - 180;
}

function toVocab(r: CameraReading) {
  const az = nearest(azimuths, (a) => Math.abs(wrap(a.degrees - r.headAzimuth)), 0);
  const lens = nearest(lenses, (l) => l.mm, r.mm);
  const tilt = nearest(tilts, (t) => t.degrees, r.pitch);
  const delta = r.cameraY - r.eyeY;
  const height =
    r.pitch > 60 ? byId(cameraHeights, "overhead")
    : r.cameraY < 0.3 ? byId(cameraHeights, "floor")
    : nearest(cameraHeights.filter((h) => !["floor", "overhead"].includes(h.id)), (h) => h.metres, 1.6 + delta);
  const size = nearest(shotSizes.filter((s) => s.fill > 0), (s) => Math.log(s.fill), Math.log(Math.max(r.fill, 0.01)));
  const ids = { sizeId: size.id, heightId: height.id, tiltId: tilt.id, azimuthId: az.id, lensId: lens.id };
  return { ids, summary: `${size.label.toLowerCase()}, ${height.label.toLowerCase()} height, ${tilt.label.toLowerCase()}, face ${az.label.toLowerCase()}, ${lens.label}` };
}

function describe(r: CameraReading, v: ReturnType<typeof toVocab>, who: string, build: "woman" | "man"): string {
  const [pron, Pron, subj] = build === "man" ? ["his", "His", "He"] as const : ["her", "Her", "She"] as const;
  const size = byId(shotSizes, v.ids.sizeId);
  const cm = Math.round((r.cameraY - r.eyeY) * 100);
  const rel = Math.abs(cm) < 8 ? `level with ${pron} eyes` : `${Math.abs(cm)} cm ${cm < 0 ? "below" : "above"} ${pron} eye line`;
  const pitch = Math.abs(r.pitch) < 2 ? "level" : `tilted ${r.pitch > 0 ? "down" : "up"} ${Math.round(Math.abs(r.pitch))}°`;
  const body = azimuthWords(r.bodyAzimuth, pron);
  const face = azimuthWords(r.headAzimuth, pron);
  const turned = Math.abs(wrap(r.headAzimuth - r.bodyAzimuth)) > 15;
  return [
    `Camera ${r.distance.toFixed(1)} m from ${who}, ${rel} (${r.cameraY.toFixed(2)} m off the floor), ${pitch}, ${Math.round(r.mm)}mm lens.`,
    turned ? `${Pron} body is seen ${body}; ${pron} face is turned so it is seen ${face}.` : `${subj} is seen ${face}.`,
    `A ${size.prompt}, ${size.qualifier}.`,
  ].join(" ");
}
