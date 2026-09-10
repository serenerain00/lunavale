"use client";

/**
 * Reframe and export — the one part of Studio that touches real pixels.
 *
 * WHAT IT IS FOR. One image goes out to four places at four shapes: the site
 * at 16:9, Reels and TikTok at 9:16, the feed at 4:5, a title card at 2.39:1.
 * Doing that by hand is the dullest hour of the week and it is also where the
 * mistakes happen — a face cropped under a TikTok caption, a title card with
 * the subject's head in the bottom third.
 *
 * SAFE AREAS ARE DRAWN, NOT DESCRIBED. The dimmed bands are where each platform
 * puts its own furniture (lib/studio/vocab.ts). Keep the face out of them and
 * nothing gets covered up. They are an overlay only and never exported.
 *
 * IT ALL HAPPENS IN THE BROWSER. No upload, no round trip, no server image
 * library — a canvas, a drawImage with the pan and zoom applied, and toBlob.
 * The reason the source can be read back out at all is that /api/studio/refs
 * streams bytes instead of redirecting to Blob; a cross-origin redirect would
 * taint the canvas and every export here would throw. See lib/studio/storage.ts.
 */

import { useEffect, useRef, useState } from "react";
import { aspects, safeAreas, byId } from "@/lib/studio/vocab";
import type { StudioRef } from "@/lib/studio/types";
import { SELECT } from "@/components/studio/RefLibrary";

export function ExportDeck({ refs }: { refs: StudioRef[] }) {
  const [sourceId, setSourceId] = useState<string>(refs[0]?.id ?? "");
  const [pasted, setPasted] = useState<string | null>(null);
  const [aspectId, setAspectId] = useState("16-9");
  const [zoom, setZoom] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [showSafe, setShowSafe] = useState(true);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const src = pasted ?? (sourceId ? `/api/studio/refs/${sourceId}` : null);
  const aspect = byId(aspects, aspectId);
  const safe = safeAreas[aspectId];

  useEffect(() => {
    if (!src) return;
    let live = true;
    const el = new Image();
    // Same-origin for the proxy route, and object URLs for local files — either
    // way the canvas stays clean and toBlob works. `live` drops a load that
    // finishes after the source has already changed.
    el.onload = () => {
      if (live) setImg(el);
    };
    el.src = src;
    return () => {
      live = false;
    };
  }, [src]);

  // Derived rather than stored, so clearing the source needs no setState in an
  // effect: with nothing selected there is nothing to draw, whatever loaded last.
  const shown = src ? img : null;

  /** Draw preview whenever anything moves. */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const W = 900;
    const H = Math.round((W / aspect.w) * aspect.h);
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a0908";
    ctx.fillRect(0, 0, W, H);
    if (shown) drawFitted(ctx, shown, W, H, zoom, ox, oy);

    if (showSafe && safe) {
      ctx.fillStyle = "rgba(10,9,8,0.55)";
      ctx.fillRect(0, 0, W, H * safe.top);
      ctx.fillRect(0, H * (1 - safe.bottom), W, H * safe.bottom);
      ctx.fillRect(0, 0, W * safe.left, H);
      ctx.fillRect(W * (1 - safe.right), 0, W * safe.right, H);
      ctx.strokeStyle = "rgba(201,138,62,0.5)";
      ctx.setLineDash([6, 5]);
      ctx.strokeRect(
        W * safe.left,
        H * safe.top,
        W * (1 - safe.left - safe.right),
        H * (1 - safe.top - safe.bottom),
      );
      ctx.setLineDash([]);
    }
  }, [shown, aspect, zoom, ox, oy, showSafe, safe]);

  async function download() {
    if (!shown) return;
    setBusy(true);
    try {
      const [W, H] = aspect.px;
      const out = document.createElement("canvas");
      out.width = W;
      out.height = H;
      const ctx = out.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#0a0908";
      ctx.fillRect(0, 0, W, H);
      // The overlay is a guide, never a pixel: only the image is drawn here.
      drawFitted(ctx, shown, W, H, zoom, ox, oy);
      const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/jpeg", 0.94));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(refs.find((r) => r.id === sourceId)?.label ?? "frame")
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase()}-${aspect.label.replace(":", "x")}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="space-y-3">
        <canvas ref={canvasRef} className="w-full rounded-sm border border-hairline bg-void" />
        {!shown && (
          <p className="text-sm text-stone">
            Pick something from the library, or drop a finished frame in below. Nothing is uploaded
            — the crop happens here in the browser.
          </p>
        )}
        {safe && showSafe && <p className="text-[12px] text-stone-dim">{safe.note}</p>}
      </div>

      <div className="space-y-4">
        <label className="block space-y-1">
          <span className="block text-[11px] uppercase tracking-wide text-stone-dim">Source</span>
          <select
            value={sourceId}
            onChange={(e) => {
              setPasted(null);
              setSourceId(e.target.value);
            }}
            className={SELECT}
          >
            <option value="">—</option>
            {refs.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="block text-[11px] uppercase tracking-wide text-stone-dim">Or a file</span>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-[12px] text-stone file:mr-2 file:rounded-sm file:border file:border-hairline file:bg-charcoal file:px-2 file:py-1 file:text-stone"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPasted(URL.createObjectURL(f));
            }}
          />
        </label>

        <div className="space-y-1">
          <span className="block text-[11px] uppercase tracking-wide text-stone-dim">Shape</span>
          <div className="flex flex-wrap gap-1.5">
            {aspects.map((a) => (
              <button key={a.id} type="button" onClick={() => setAspectId(a.id)}
                      className={`rounded-sm border px-2 py-1 text-[12px] ${
                        a.id === aspectId
                          ? "border-amber/50 bg-amber/15 text-amber-soft"
                          : "border-hairline text-stone hover:text-ivory"
                      }`}>
                {a.label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-stone-dim">
            {aspect.where} · exports {aspect.px[0]}×{aspect.px[1]}
          </p>
        </div>

        <Slider label="Zoom" value={zoom} min={1} max={4} step={0.01} onChange={setZoom} />
        <Slider label="Left / right" value={ox} min={-1} max={1} step={0.01} onChange={setOx} />
        <Slider label="Up / down" value={oy} min={-1} max={1} step={0.01} onChange={setOy} />

        <label className="flex items-center gap-2 text-[13px] text-stone">
          <input type="checkbox" checked={showSafe} onChange={(e) => setShowSafe(e.target.checked)} />
          Show safe areas
        </label>

        <button type="button" onClick={download} disabled={!shown || busy}
                className="w-full rounded-sm border border-amber/50 bg-amber/10 px-4 py-2 text-sm text-amber-soft hover:bg-amber/20 disabled:opacity-40">
          {busy ? "Exporting…" : `Export ${aspect.label}`}
        </button>
      </div>
    </div>
  );
}

/**
 * Cover-fit with zoom and offset. Offsets are -1..1 of the slack in each axis,
 * so dragging never pulls the image off its own edge.
 */
function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
  zoom: number,
  ox: number,
  oy: number,
) {
  const scale = Math.max(W / img.width, H / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const slackX = Math.max(0, dw - W) / 2;
  const slackY = Math.max(0, dh - H) / 2;
  const dx = (W - dw) / 2 + ox * slackX;
  const dy = (H - dh) / 2 + oy * slackY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function Slider({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block space-y-1">
      <span className="block text-[11px] uppercase tracking-wide text-stone-dim">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={(e) => onChange(Number(e.target.value))}
             className="w-full accent-amber" />
    </label>
  );
}
