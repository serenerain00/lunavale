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
  frameRect,
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
import type { CameraReading, Selection, StageApi, Tool } from "@/components/studio/BlockingStage";
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
  const [tool, setTool] = useState<Tool>("camera");
  const [reading, setReading] = useState<CameraReading | null>(null);
  const [shot, setShot] = useState<{ url: string; blob: Blob } | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const api = useRef<StageApi | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [readOpen, setReadOpen] = useState(false);
  // The docks fold away with P. Remembered per browser — a convenience only.
  // Blocking mounts only when its tab is opened, on the client, so reading
  // storage in the initializer cannot mismatch a server render.
  const [panels, setPanels] = useState(() => {
    try { return typeof window === "undefined" || localStorage.getItem("studio.blocking.panels") !== "0"; } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem("studio.blocking.panels", panels ? "1" : "0"); } catch {}
  }, [panels]);
  const down = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const aspect = byId(aspects, draft.aspectId);
  const ratio = aspect.w / aspect.h;
  const frame = frameRect(box.w, box.h, ratio);
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

  // Shortcuts (Melissa, 2026-10-20): M move, R rotate — the same key again, or
  // Esc, hands the drag back to the camera. Not while typing in a field, and
  // not with a modifier, so Cmd-R still reloads.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
        // Range sliders are inputs too, but typing never happens in one.
        if (!(t.tagName === "INPUT" && (t as HTMLInputElement).type === "range")) return;
      }
      const k = e.key.toLowerCase();
      if (k === "m") setTool((x) => (x === "move" ? "camera" : "move"));
      else if (k === "r") setTool((x) => (x === "rotate" ? "camera" : "rotate"));
      else if (k === "p") setPanels((x) => !x);
      else if (e.key === "Escape") setTool("camera");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  /**
   * A click (not a drag) anywhere on the stage opens the tool menu for the
   * nearest person within reach of it, or closes it if nobody is near —
   * whether the click landed on them, on their dot, or on the floor beside.
   */
  function onStageClick(e: React.PointerEvent) {
    const d = down.current;
    down.current = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5 || e.button !== 0) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || !api.current) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: { id: string; dist: number } | null = null;
    for (const f of b.figures) {
      const p = api.current.screen(f.id);
      if (!p || !p.visible) continue;
      // Measured to the chest, so allow a body's height of reach.
      const dist = Math.hypot(x - p.x, (y - p.y) * 0.6);
      if (!best || dist < best.dist) best = { id: f.id, dist };
    }
    if (best && best.dist < Math.max(140, box.h * 0.22)) {
      setActiveFigure(best.id);
      setMenuFor(best.id);
    } else {
      setMenuFor(null);
    }
  }

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

  const menuFig = menuFor ? b.figures.find((f) => f.id === menuFor) : undefined;
  const menuIndex = menuFig ? b.figures.indexOf(menuFig) : -1;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ stage --
          Wide on purpose (2026-10-21): as wide as the window, not the page,
          so there is room to walk people about. The shot is the lit
          rectangle in the middle; everything outside it is darkened room. */}
      <div className="relative left-1/2 w-[calc(100vw-3rem)] max-w-[120rem] -translate-x-1/2 space-y-3">
        <div
          ref={stageRef}
          className="relative h-[min(86vh,62vw)] min-h-[30rem] overflow-hidden rounded-sm border border-hairline bg-charcoal"
          onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={onStageClick}
        >
          <BlockingStage
            blocking={b}
            aspect={ratio}
            selection={selection}
            mode={mode}
            hideHelpers={hide}
            tool={tool}
            activeFigure={fig?.id ?? null}
            onTool={setTool}
            onSelect={onSelect}
            onActive={setActiveFigure}
            onFigure={updateFigure}
            onProp={updateProp}
            onCamera={onCamera}
            api={api}
          />
          {/* The shot frame, the room around it dimmed, and thirds inside it.
              All DOM over the canvas, so never in the snapshot. */}
          {frame.w > 0 && (
            <div
              aria-hidden
              className="pointer-events-none absolute border border-amber/40"
              style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h, boxShadow: "0 0 0 9999px rgba(12, 11, 10, 0.55)" }}
            >
              <div className="absolute inset-y-0 left-1/3 border-l border-white/10" />
              <div className="absolute inset-y-0 left-2/3 border-l border-white/10" />
              <div className="absolute inset-x-0 top-1/3 border-t border-white/10" />
              <div className="absolute inset-x-0 top-2/3 border-t border-white/10" />
              <span className="absolute left-1.5 top-1 text-[11px] text-amber-soft/70">{aspect.label} · the shot</span>
            </div>
          )}
          {/* ---------------------------------------------------- on-canvas --
              The tools float on the stage (2026-10-21) so the stage keeps the
              room: a toolbar that never hides, a camera dock on the left, an
              inspector on the right, the readout and the shutter at the
              bottom. P (or "Panels") folds the two docks away. */}
          <Dock label="Tools" className={`left-3 top-3 flex ${panels ? "max-w-[calc(100%-20rem)]" : "max-w-[calc(100%-1.5rem)]"} flex-wrap items-center gap-1 p-1`}>
            {([["camera", "Camera", "Esc", "Drag to orbit · right-drag or two fingers to pan · scroll to zoom · click a body part to bend it"],
               ["move", "Move", "M", "Drag a person, or their dot, across the floor"],
               ["rotate", "Rotate", "R", "Drag a person, or their dot, left or right to turn them"]] as [Tool, string, string, string][]).map(([t, label, key, hint]) => (
              <button key={t} type="button" title={hint} className={seg(tool === t)} onClick={() => setTool(t)}>
                {label} <kbd className="ml-0.5 font-sans text-[10px] opacity-60">{key}</kbd>
              </button>
            ))}
            <span className="mx-1 h-5 w-px bg-white/10" />
            <label className="flex items-center gap-1.5 px-1 text-[12px] text-stone" title="Lens">
              <input
                type="range" min={14} max={200} step={1} value={b.camera.mm}
                onChange={(e) => onCamera({ ...(api.current?.cameraState() ?? b.camera), mm: Number(e.target.value) })}
                className="w-20 accent-amber"
                aria-label="Lens"
              />
              <span className="w-10 tabular-nums text-ivory">{b.camera.mm}mm</span>
            </label>
            {lenses.map((l) => (
              <button key={l.id} type="button" className={seg(b.camera.mm === l.mm)}
                onClick={() => onCamera({ ...(api.current?.cameraState() ?? b.camera), mm: l.mm })}>{l.mm}</button>
            ))}
            <span className="mx-1 h-5 w-px bg-white/10" />
            <button type="button" className={seg(b.grid)} onClick={() => setB((x) => ({ ...x, grid: !x.grid }))}>Grid</button>
            <button type="button" className={seg(panels)} aria-pressed={panels} onClick={() => setPanels((x) => !x)}
              title="Show or hide the camera dock and the inspector">
              Panels <kbd className="ml-0.5 font-sans text-[10px] opacity-60">P</kbd>
            </button>
          </Dock>

          {panels && (
            <Dock label="Camera" className="left-3 top-16 w-[8.75rem] space-y-3 p-2.5">
              <p className="truncate text-[11px] uppercase tracking-wider text-stone-dim" title={`Camera to ${who}`}>Camera → {who}</p>
              {/* Seen from above, the person in the middle facing down the
                  page, so "Front" is the spot in front of them. */}
              <div className="grid grid-cols-3 gap-1">
                {COMPASS.map((c, k) =>
                  c ? (
                    <button key={c.short} type="button" title={c.label} aria-label={`Camera ${c.label}`}
                      className={`${seg(reading ? Math.abs(wrap(c.az - reading.bodyAzimuth)) < 20 : false)} h-8 px-0`}
                      onClick={() => fig && api.current?.placeCamera(fig.id, c.az, reading ? reading.cameraY - reading.eyeY : 0)}>
                      {c.short}
                    </button>
                  ) : (
                    <span key={k} className="grid h-8 place-items-center">
                      <span className="h-3 w-3 rounded-full" style={{ background: FIGURE_TONES[Math.max(0, b.figures.findIndex((f) => f.id === fig?.id)) % FIGURE_TONES.length].hex }} />
                    </span>
                  ),
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-wider text-stone-dim">Height</p>
                {HEIGHTS.map(([label, d]) => (
                  <button key={label} type="button" className={`${seg(false)} block w-full text-left`}
                    onClick={() => fig && api.current?.placeCamera(fig.id, reading?.bodyAzimuth ?? 0, d)}>
                    {label}
                  </button>
                ))}
              </div>
            </Dock>
          )}

          {panels && (
            <Dock label="Inspector" className="bottom-16 right-3 top-3 w-72 space-y-5 overflow-y-auto overscroll-contain p-3 text-[13px]">
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
                      <button type="button" className={chip(tool === "move" && f.id === fig?.id)}
                        onClick={(e) => { e.stopPropagation(); setActiveFigure(f.id); setTool("move"); }}>
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
                    {(() => {
                      const other = nearestOther(f, b.figures);
                      if (!other) return null;
                      const d = floorDistance(f, other);
                      return (
                        <Slider label={`Apart from ${other.characterId ? names[other.characterId] ?? "them" : "the stand-in"}`}
                          hint={spacingWords(d)} min={0.15} max={4} step={0.01} unit="m" value={d}
                          onChange={(v) => updateFigure(atDistance(f, other, v))} />
                      );
                    })()}
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
                onClick={() => { const n = initialBlocking(draft.characterIds); setB(n); setActiveFigure(n.figures[0].id); setSelection(null); setMenuFor(null); }}>
                Start the blocking over
              </button>
            </Dock>
          )}

          <Dock label="Camera readout" className={`bottom-3 left-3 ${panels ? "max-w-[min(42rem,calc(100%-26rem))]" : "max-w-[min(42rem,calc(100%-12rem))]"} p-0`}>
            <button type="button" onClick={() => setReadOpen((x) => !x)} aria-expanded={readOpen}
              className="block w-full px-3 py-2 text-left text-[12px] leading-relaxed text-stone hover:text-ivory">
              {reading && !reading.inFrame && <span className="mr-2 text-wine">{who}&rsquo;s face is out of frame ·</span>}
              {readOpen && words ? (
                <>
                  <span className="text-ivory">{words}</span>
                  {derived && <span className="mt-1 block text-stone-dim">In Studio terms: {derived.summary}</span>}
                </>
              ) : (
                <span className="line-clamp-1">{derived ? derived.summary : "Reading the camera…"}</span>
              )}
            </button>
          </Dock>

          <Dock label="Shutter" className="bottom-3 right-3 p-0">
            <button
              type="button"
              onClick={takeShot}
              disabled={busy}
              className="rounded-md bg-amber px-5 py-2.5 text-sm font-medium text-ink shadow-lg hover:bg-amber-soft disabled:opacity-50"
            >
              Take the shot
            </button>
          </Dock>

          {menuFig && !hide && (
            <FloatingTools api={api} figureId={menuFig.id} box={box} onClose={() => setMenuFor(null)}>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: FIGURE_TONES[menuIndex % FIGURE_TONES.length].hex }} />
                <select value={menuFig.characterId ?? ""} onChange={(e) => updateFigure({ ...menuFig, characterId: e.target.value || null })} className={`${SELECT} flex-1`}>
                  <option value="">Stand-in</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <button type="button" aria-label="Close" className="px-1 text-stone-dim hover:text-ivory" onClick={() => setMenuFor(null)}>✕</button>
              </div>
              <div className="flex gap-1">
                {([["move", "Move", "M"], ["rotate", "Rotate", "R"], ["camera", "Camera", "Esc"]] as [Tool, string, string][]).map(([t, label, key]) => (
                  <button key={t} type="button" className={`${chip(tool === t)} flex-1`} onClick={() => setTool(t)}>
                    {label} <kbd className="ml-0.5 font-sans text-[10px] opacity-60">{key}</kbd>
                  </button>
                ))}
              </div>
              <Slider label="Facing" min={-180} max={180} value={jointOf(menuFig, "pelvis")[1]}
                onChange={(v) => { const p = jointOf(menuFig, "pelvis"); setJoint(menuFig, "pelvis", [p[0], v, p[2]]); }} />
              {(() => {
                const other = nearestOther(menuFig, b.figures);
                if (!other) return null;
                const d = floorDistance(menuFig, other);
                return (
                  <Slider label={`Apart from ${other.characterId ? names[other.characterId] ?? "them" : "the stand-in"}`}
                    hint={spacingWords(d)} min={0.15} max={4} step={0.01} unit="m" value={d}
                    onChange={(v) => updateFigure(atDistance(menuFig, other, v))} />
                );
              })()}
              {fig?.id === menuFig.id && (
                <>
                  <Slider label="Head turn" min={-90} max={90} value={head.turn} onChange={(v) => setHead({ turn: v })} />
                  <Slider label="Head nod" min={-60} max={60} value={head.nod} onChange={(v) => setHead({ nod: v })} />
                  <div className="flex gap-1">
                    <button type="button" className={`${chip(false)} flex-1`} onClick={lookAtCamera}>Look at camera</button>
                    <button type="button" className={`${chip(false)} flex-1`} onClick={() => setHead({ turn: 0, nod: 0, tilt: 0 })}>Straight</button>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1">
                <select value="" onChange={(e) => e.target.value && applyPose(menuFig, e.target.value)} className={`${SELECT} flex-1`}>
                  <option value="">Pose…</option>
                  {POSES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
                <button type="button" className={chip(false)} onClick={() => updateFigure(mirrorFigure(menuFig))} title="Swap left and right">Mirror</button>
                <button type="button" className={chip(false)} title="Put the camera on them, from the front"
                  onClick={() => api.current?.placeCamera(menuFig.id, 0, reading && fig?.id === menuFig.id ? reading.cameraY - reading.eyeY : 0)}>
                  Frame
                </button>
              </div>
            </FloatingTools>
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
    </div>
  );
}

/**
 * The per-person tool menu that sits next to whoever you clicked near
 * (Melissa, 2026-10-21: "my tools are already by my mouse where im moving and
 * adjusting character position" — Fitts's law). Follows its person every
 * frame without re-rendering the builder: the position is written straight to
 * the element. Flips to their other side near the edge.
 */
function FloatingTools({ api, figureId, box, onClose, children }: {
  api: React.MutableRefObject<StageApi | null>;
  figureId: string;
  box: { w: number; h: number };
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      const p = api.current?.screen(figureId);
      if (el && p) {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const gap = 56;
        let x = p.x + gap;
        if (x + w > box.w - 8) x = p.x - gap - w;
        x = Math.min(Math.max(x, 8), Math.max(box.w - w - 8, 8));
        const y = Math.min(Math.max(p.y - h / 2, 8), Math.max(box.h - h - 8, 8));
        el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
        el.style.opacity = p.visible ? "1" : "0.4";
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [api, figureId, box.w, box.h]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Tools for this person"
      className="absolute left-0 top-0 z-20 w-64 space-y-2 rounded-md border border-hairline bg-ink/95 p-2.5 text-[13px] shadow-xl backdrop-blur"
      style={{ transform: "translate(-9999px, 0)" }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {children}
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

/* ------------------------------------------------------------ spacing -- */
// Pelvis to pelvis, along the floor.

function floorDistance(a: BlockingFigure, b: BlockingFigure) {
  return Math.hypot(a.position[0] - b.position[0], a.position[2] - b.position[2]);
}

function nearestOther(f: BlockingFigure, all: BlockingFigure[]) {
  let best: BlockingFigure | null = null;
  for (const o of all) if (o.id !== f.id && (!best || floorDistance(f, o) < floorDistance(f, best))) best = o;
  return best;
}

/** Slide `f` along the line from `other`, so the other person stays put. */
function atDistance(f: BlockingFigure, other: BlockingFigure, d: number): BlockingFigure {
  let dx = f.position[0] - other.position[0];
  let dz = f.position[2] - other.position[2];
  const len = Math.hypot(dx, dz);
  if (len < 1e-3) { dx = 1; dz = 0; } else { dx /= len; dz /= len; }
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return { ...f, position: [r(other.position[0] + dx * d), f.position[1], r(other.position[2] + dz * d)] };
}

function spacingWords(m: number) {
  const ft = `${(m * 3.281).toFixed(1)} ft`;
  if (m < 0.35) return `${ft} · touching`;
  if (m < 0.6) return `${ft} · close`;
  if (m < 1.2) return `${ft} · talking distance`;
  return `${ft} · apart`;
}

/** Camera spots around the person, seen from above with them facing down the page. null is them. */
const COMPASS: ({ short: string; label: string; az: number } | null)[] = [
  { short: "BR", label: "Behind, her right", az: 140 }, { short: "B", label: "Behind", az: 180 }, { short: "BL", label: "Behind, her left", az: -140 },
  { short: "PR", label: "Profile, her right", az: 90 }, null, { short: "PL", label: "Profile, her left", az: -90 },
  { short: "¾R", label: "Three-quarter, her right", az: 40 }, { short: "F", label: "Front", az: 0 }, { short: "¾L", label: "Three-quarter, her left", az: -40 },
];

const HEIGHTS: [string, number | "floor" | "overhead"][] = [
  ["Overhead", "overhead"], ["High", 0.5], ["Eye", 0], ["Chest", -0.35], ["Low", -0.8], ["Floor", "floor"],
];

/** A floating panel on the stage. Clicks inside it are not clicks on the stage. */
function Dock({ label, className, children }: { label: string; className: string; children: React.ReactNode }) {
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div role="group" aria-label={label}
      className={`absolute z-10 rounded-md border border-white/10 bg-ink/80 shadow-lg backdrop-blur-sm ${className}`}
      onPointerDown={stop} onPointerUp={stop} onWheel={stop}>
      {children}
    </div>
  );
}

const seg = (on: boolean) =>
  `rounded px-2 py-1 text-[12px] ${on ? "bg-amber/20 text-amber-soft" : "text-stone hover:bg-white/5 hover:text-ivory"}`;

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
