"use client";

/**
 * The live preview: what the shot FRAMES, drawn honestly.
 *
 * TWO VIEWS, because they answer different questions. The frame view answers
 * "how much of her is in this and where" — figure height, eyeline, horizon,
 * thirds, headroom. The plan view answers "where am I standing" — the camera
 * dot swung round her by azimuth, with the lens's field of view drawn as a
 * wedge so an 18mm and a 135mm are visibly different decisions.
 *
 * IT DOES NOT PRETEND TO BE HER. When a face reference exists at the chosen
 * angle it is dropped into the frame at the right size and position, which
 * makes this a real preview of a real shot. When one does not, the silhouette
 * stays and the panel says so out loud rather than showing a front-on photo
 * turned sideways and letting her think the angle exists.
 *
 * SVG, not canvas and not three.js. Everything here is flat geometry that has
 * to re-draw on every slider tick; React updating fifteen attributes is both
 * simpler and faster than a render loop, and CLAUDE.md asks for a real reason
 * before 3D. The reason will arrive with the pose module; it has not yet.
 */

import { byId, azimuths, lenses, type Aspect } from "@/lib/studio/vocab";
import { framing, heightRelation } from "@/lib/studio/framing";
import type { ShotCamera } from "@/lib/studio/types";

const W = 520;

export function FramingDiagram({
  camera,
  aspect,
  faceUrl,
}: {
  camera: ShotCamera;
  aspect: Aspect;
  faceUrl: string | null;
}) {
  const f = framing({
    sizeId: camera.sizeId,
    heightId: camera.heightId,
    tiltId: camera.tiltId,
    lensId: camera.lensId,
    aspect,
  });
  const H = Math.round(W / f.aspect);

  // The figure: `figure` is its height as a fraction of the frame, positioned
  // so the eyeline lands where the shot size says it should.
  const figH = f.figure * H;
  const eyeY = f.eyeline * H;
  // Eyes sit about 6% down a standing figure.
  const topY = eyeY - figH * 0.06;
  const figW = figH * 0.26;
  const cx = W / 2;

  const horizonY = f.horizon * H;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-sm border border-hairline bg-void">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img"
             aria-label={`Framing preview: ${aspect.label}`}>
          <defs>
            <clipPath id="studio-frame">
              <rect x="0" y="0" width={W} height={H} />
            </clipPath>
          </defs>

          <g clipPath="url(#studio-frame)">
            <rect x="0" y="0" width={W} height={H} fill="#12100e" />

            {/* Ground plane, so height and tilt are legible at a glance. */}
            {!f.horizonOffFrame && (
              <>
                <rect x="0" y={horizonY} width={W} height={H - horizonY} fill="#1c1917" />
                <line x1="0" y1={horizonY} x2={W} y2={horizonY}
                      stroke="#6f665c" strokeWidth="1" strokeDasharray="4 4" />
                <text x="8" y={horizonY - 6} fill="#6f665c" fontSize="11">horizon</text>
              </>
            )}

            {/* The figure, or her actual face when a reference at this angle exists. */}
            {camera.sizeId === "insert" ? (
              <g>
                <rect x={cx - 90} y={H / 2 - 60} width={180} height={120} rx="6"
                      fill="#262220" stroke="#6f665c" strokeDasharray="5 4" />
                <text x={cx} y={H / 2 + 5} fill="#a89f94" fontSize="13" textAnchor="middle">
                  object fills frame
                </text>
              </g>
            ) : faceUrl ? (
              <image href={faceUrl} x={cx - figW * 1.9} y={topY}
                     width={figW * 3.8} height={figH}
                     preserveAspectRatio="xMidYMin slice" opacity="0.92" />
            ) : (
              <g fill="#3a3431" stroke="#6f665c" strokeWidth="1">
                {/* Schematic standing figure — head, shoulders, torso, legs. */}
                <circle cx={cx} cy={topY + figH * 0.045} r={figH * 0.048} />
                <path d={`M ${cx - figW * 0.5} ${topY + figH * 0.32}
                          Q ${cx} ${topY + figH * 0.1} ${cx + figW * 0.5} ${topY + figH * 0.32}
                          L ${cx + figW * 0.42} ${topY + figH * 0.56}
                          L ${cx - figW * 0.42} ${topY + figH * 0.56} Z`} />
                <rect x={cx - figW * 0.34} y={topY + figH * 0.55}
                      width={figW * 0.68} height={figH * 0.45} rx={figW * 0.1} />
              </g>
            )}

            {/* Thirds. */}
            {[1, 2].map((i) => (
              <g key={i} stroke="rgba(242,236,228,0.09)" strokeWidth="1">
                <line x1={(W / 3) * i} y1="0" x2={(W / 3) * i} y2={H} />
                <line x1="0" y1={(H / 3) * i} x2={W} y2={(H / 3) * i} />
              </g>
            ))}

            {/* Eyeline — the one guide worth calling out by name. */}
            {camera.sizeId !== "insert" && (
              <>
                <line x1="0" y1={eyeY} x2={W} y2={eyeY} stroke="#c98a3e" strokeWidth="1" opacity="0.7" />
                <text x={W - 8} y={eyeY - 6} fill="#c98a3e" fontSize="11" textAnchor="end">eyeline</text>
              </>
            )}

            {/* Headroom, when the head is actually in frame. */}
            {camera.sizeId !== "insert" && topY > 0 && topY < H * 0.5 && (
              <>
                <line x1={cx + figW} y1="0" x2={cx + figW} y2={topY}
                      stroke="#6f665c" strokeWidth="1" />
                <text x={cx + figW + 6} y={Math.max(12, topY / 2)} fill="#6f665c" fontSize="11">
                  {Math.round((topY / H) * 100)}% headroom
                </text>
              </>
            )}
          </g>
          <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="none" stroke="#c98a3e" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      <PlanView camera={camera} hfov={f.hfov} />

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] text-stone sm:grid-cols-4">
        <Stat k="Frame" v={aspect.label} />
        <Stat k="Lens" v={`${byId(lenses, camera.lensId).mm}mm · ${Math.round(f.hfov)}° h`} />
        <Stat k="Stand-off" v={`${f.distance.toFixed(1)}m`} />
        <Stat k="Camera" v={heightRelation(camera.heightId)} />
      </dl>
    </div>
  );
}

/** Top-down: her at the centre, the camera swung round by azimuth. */
function PlanView({ camera, hfov }: { camera: ShotCamera; hfov: number }) {
  const S = 160;
  const c = S / 2;
  const r = S * 0.36;
  const az = byId(azimuths, camera.azimuthId).degrees;
  // 0° is front-on, which in plan is directly below her (she faces down-screen).
  const rad = ((az + 90) * Math.PI) / 180;
  const camX = c + Math.cos(rad) * r;
  const camY = c + Math.sin(rad) * r;

  const half = (hfov / 2) * (Math.PI / 180);
  const toC = Math.atan2(c - camY, c - camX);
  const reach = r * 1.9;
  const p1 = [camX + Math.cos(toC - half) * reach, camY + Math.sin(toC - half) * reach];
  const p2 = [camX + Math.cos(toC + half) * reach, camY + Math.sin(toC + half) * reach];

  return (
    <div className="flex items-center gap-4 rounded-sm border border-hairline bg-obsidian p-3">
      <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} className="shrink-0" role="img"
           aria-label="Plan view of the camera position">
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(242,236,228,0.08)" strokeDasharray="3 4" />
        <polygon points={`${camX},${camY} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`}
                 fill="#c98a3e" opacity="0.13" />
        {/* Her, and which way she is facing (down-screen). */}
        <circle cx={c} cy={c} r="7" fill="#f2ece4" />
        <line x1={c} y1={c} x2={c} y2={c + 17} stroke="#f2ece4" strokeWidth="2" />
        <circle cx={camX} cy={camY} r="5" fill="#c98a3e" />
      </svg>
      <div className="text-[12px] leading-relaxed text-stone">
        <p className="text-ivory">{byId(azimuths, camera.azimuthId).label}</p>
        <p>
          She faces the white line. The amber dot is you, and the wedge is what the{" "}
          {byId(lenses, camera.lensId).mm}mm actually sees.
        </p>
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-stone-dim">{k}</dt>
      <dd className="text-ivory">{v}</dd>
    </div>
  );
}
