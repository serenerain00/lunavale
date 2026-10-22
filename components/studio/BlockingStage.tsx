"use client";

/**
 * The 3D half of Blocking: mannequins, block props, a free camera.
 *
 * Loaded with next/dynamic and ssr:false from Blocking.tsx — three.js does not
 * render on a server, and nothing else in Studio pays for it until the tab is
 * opened. Owner-only page, so CLAUDE.md's 3D restraint is about the public
 * world, not this: here the 3D IS the feature (see lib/studio/blocking.ts).
 *
 * CONTROLS. Drag orbits, right-drag pans, scroll zooms — OrbitControls as
 * stock, because that is what every 3D tool she has touched does. Clicking a
 * body part selects the joint that part hangs from and puts a rotate gizmo on
 * it; the panel beside the stage has the same joint as sliders.
 *
 * MOVING PEOPLE. Melissa, 2026-10-18: "i need to be able to move the person,
 * so if i wnat them standing closer to gether". With the `move` tool, a drag
 * that starts on a body slides that person across the floor instead of
 * orbiting — under the pointer, at whatever height they are (sitting on a
 * chair stays sitting). With `rotate`, dragging left and right turns them.
 * A drag that starts on empty floor still orbits.
 *
 * THE DOT. Melissa, 2026-10-20: "most the shots i do are torso up, so i need
 * like a marker / dot near each model, clicking on it gives me the move tool".
 * The floor and the pelvis gizmo are out of frame in a torso-up shot, so each
 * figure carries a dot on its chest — DOM, via drei's Html, so it is never in
 * the snapshot. Pressing on it makes that person active and, from the camera
 * tool, switches to move; dragging it moves (or turns) them.
 *
 * THE SNAPSHOT IS THE FRAME, at delivery size: the drawing buffer is resized
 * to the aspect's pixel size for one render, read, and put back. Helpers (the
 * gizmo, the selection glow) are hidden by the parent for that frame.
 *
 * A VIEWFINDER, NOT A FRAME (Melissa, 2026-10-21: "make the pose and angle
 * builder wide screen to give me more room to move characters"). The canvas
 * is as wide as the screen; the shot is the rectangle `frameRect()` (lib/studio/blocking) puts in
 * the middle of it, and the parent darkens everything outside. The lens
 * applies to that rectangle — the camera's real field of view is widened so
 * the frame inside it sees exactly what a camera of this lens and aspect
 * would — and the readout, "in frame" and the snapshot all use the frame, so
 * the extra room is only room.
 */


/* eslint-disable react-hooks/immutability -- Imperative Three.js: the camera, controls and scratch objects are mutated in place, as R3F intends. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  FIGURE_TONES,
  JOINT_ORDER,
  PROPORTIONS,
  azimuthDeg,
  fovFor,
  frameRect,
  spineOffsets,
  type Blocking,
  type BlockingFigure,
  type BlockingProp,
  type JointId,
  type Proportions,
  type Vec3,
} from "@/lib/studio/blocking";

export type Tool = "camera" | "move" | "rotate";

export type Selection =
  | { type: "joint"; figureId: string; joint: JointId }
  | { type: "prop"; propId: string }
  | null;

export interface CameraReading {
  figureId: string;
  /** Metres from the camera to her head. */
  distance: number;
  cameraY: number;
  eyeY: number;
  /** Degrees; positive looks down. */
  pitch: number;
  /** Degrees, negative = camera on her left. */
  bodyAzimuth: number;
  headAzimuth: number;
  mm: number;
  /** A standing figure's height as a share of frame height, at her distance. */
  fill: number;
  inFrame: boolean;
}

export interface StageApi {
  capture: (px: [number, number]) => Promise<Blob>;
  read: (figureId: string) => CameraReading | null;
  /** Head turn and nod (degrees, in the chest's frame) that would face the camera. */
  lookAtCamera: (figureId: string) => { turn: number; nod: number } | null;
  /** Put the camera at an azimuth around a figure, at a height relative to her eyes. */
  placeCamera: (figureId: string, azimuth: number, eyeDelta: number | "overhead" | "floor") => void;
  cameraState: () => Blocking["camera"];
  /** Move the camera to a saved/computed position, target and lens (shot presets). */
  setCamera: (c: Blocking["camera"]) => void;
  /** Where a figure's chest is on screen, CSS px from the canvas's top left. */
  screen: (figureId: string) => { x: number; y: number; visible: boolean } | null;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function BlockingStage({
  blocking,
  aspect,
  selection,
  mode,
  hideHelpers,
  tool,
  activeFigure,
  onTool,
  onSelect,
  onActive,
  onFigure,
  onProp,
  onCamera,
  api,
}: {
  blocking: Blocking;
  aspect: number;
  selection: Selection;
  mode: "rotate" | "translate";
  hideHelpers: boolean;
  tool: Tool;
  activeFigure: string | null;
  onTool: (t: Tool) => void;
  onSelect: (s: Selection) => void;
  onActive: (figureId: string) => void;
  onFigure: (f: BlockingFigure) => void;
  onProp: (p: BlockingProp) => void;
  onCamera: (c: Blocking["camera"]) => void;
  api: React.MutableRefObject<StageApi | null>;
}) {
  // One registry of live Object3Ds, keyed `${figureId}:${joint}` or `prop:${id}`,
  // so the gizmo and the readout can reach the real node.
  const nodes = useRef(new Map<string, THREE.Object3D>());
  const register = useCallback(
    (key: string) => (o: THREE.Object3D | null) => {
      if (o) nodes.current.set(key, o);
      else nodes.current.delete(key);
    },
    [],
  );

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: blocking.camera.position, fov: 40, near: 0.05, far: 200 }}
      onPointerMissed={(e) => {
        if (e.button === 0) onSelect(null);
      }}
    >
      <color attach="background" args={["#3a3835"]} />
      <hemisphereLight args={["#f2eee6", "#3b3936", 1.1]} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.45} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={() => onSelect(null)}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#55524d" roughness={0.95} />
      </mesh>
      {blocking.grid && <gridHelper args={[20, 20, "#8a8680", "#6a6762"]} position={[0, 0.002, 0]} />}

      <People
        figures={blocking.figures}
        tool={tool}
        activeFigure={activeFigure}
        showDots={!hideHelpers}
        nodes={nodes}
        onTool={onTool}
        onActive={onActive}
        onFigure={onFigure}
      >
        {(f, i, marker) => (
          <Figure
            fig={f}
            marker={marker}
            tone={FIGURE_TONES[i % FIGURE_TONES.length].hex}
            selectedJoint={
              !hideHelpers && selection?.type === "joint" && selection.figureId === f.id ? selection.joint : null
            }
            register={register}
            onSelect={onSelect}
          />
        )}
      </People>

      {blocking.props.map((p) => (
        <group
          key={p.id}
          ref={register(`prop:${p.id}`)}
          position={p.position}
          rotation={[0, rad(p.rotationY), 0]}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            if (e.delta > 4) return;
            e.stopPropagation();
            onSelect({ type: "prop", propId: p.id });
          }}
        >
          <PropMesh kind={p.kind} selected={!hideHelpers && selection?.type === "prop" && selection.propId === p.id} />
        </group>
      ))}

      <Rig
        blocking={blocking}
        aspect={aspect}
        nodes={nodes}
        onCamera={onCamera}
        api={api}
      />

      {!hideHelpers && (
        <Gizmo
          selection={selection}
          mode={mode}
          nodes={nodes}
          blocking={blocking}
          onFigure={onFigure}
          onProp={onProp}
        />
      )}
    </Canvas>
  );
}

/* ------------------------------------------------------------------ rig -- */

function Rig({
  blocking,
  aspect,
  nodes,
  onCamera,
  api,
}: {
  blocking: Blocking;
  aspect: number;
  nodes: React.MutableRefObject<Map<string, THREE.Object3D>>;
  onCamera: (c: Blocking["camera"]) => void;
  api: React.MutableRefObject<StageApi | null>;
}) {
  const { camera, gl, scene, size, invalidate } = useThree();
  const controls = useRef<OrbitControlsImpl>(null);
  const mm = blocking.camera.mm;

  // Lens → field of view, across the long side of the SHOT frame — then
  // widened, so that frame (smaller than the canvas) sees exactly that.
  const frameVfov = fovFor(mm, aspect).vfov;
  const fr = frameRect(size.width, size.height, aspect);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const f = frameRect(size.width, size.height, aspect);
    cam.fov = f.h > 0 ? deg(2 * Math.atan(Math.tan(rad(frameVfov) / 2) * (size.height / f.h))) : frameVfov;
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, mm, aspect, frameVfov, size.width, size.height, invalidate]);

  // Restore the saved camera once.
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !controls.current) return;
    restored.current = true;
    camera.position.set(...blocking.camera.position);
    controls.current.target.set(...blocking.camera.target);
    controls.current.update();
  }, [camera, blocking.camera]);

  const state = (): Blocking["camera"] => {
    const t = controls.current?.target ?? new THREE.Vector3();
    return {
      position: camera.position.toArray().map(round3) as Vec3,
      target: t.toArray().map(round3) as Vec3,
      mm,
    };
  };

  useEffect(() => {
    const world = (key: string) => {
      const o = nodes.current.get(key);
      if (!o) return null;
      o.updateWorldMatrix(true, false);
      return o;
    };

    const horizForward = (o: THREE.Object3D) => {
      const v = new THREE.Vector3(0, 0, 1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
      return { x: v.x, z: v.z, len: Math.hypot(v.x, v.z) };
    };

    const eyeOf = (figureId: string) => {
      const head = world(`${figureId}:head`);
      if (!head) return null;
      const fig = blocking.figures.find((f) => f.id === figureId);
      const k = fig ? PROPORTIONS[fig.build].height / 1.7 : 1;
      return { head, eye: head.localToWorld(new THREE.Vector3(0, 0.1 * k, 0.04 * k)), k };
    };

    api.current = {
      capture: async ([w, h]) => {
        const prevRatio = gl.getPixelRatio();
        // Scale the buffer so the FRAME inside it is at delivery size, within
        // what the GPU allows, then cut the frame out.
        const maxSide = gl.capabilities.maxTextureSize || 8192;
        const pr = Math.min(Math.max(w / fr.w, h / fr.h), maxSide / Math.max(size.width, size.height));
        gl.setPixelRatio(pr);
        gl.render(scene, camera);
        const out = document.createElement("canvas");
        out.width = w;
        out.height = h;
        out.getContext("2d")?.drawImage(gl.domElement, fr.x * pr, fr.y * pr, fr.w * pr, fr.h * pr, 0, 0, w, h);
        gl.setPixelRatio(prevRatio);
        const blob = await new Promise<Blob>((resolve, reject) =>
          out.toBlob((b) => (b ? resolve(b) : reject(new Error("Snapshot failed."))), "image/png"),
        );
        invalidate();
        return blob;
      },

      read: (figureId) => {
        const e = eyeOf(figureId);
        const chest = world(`${figureId}:chest`);
        if (!e || !chest) return null;
        const cam = camera as THREE.PerspectiveCamera;
        const toCam = new THREE.Vector3().subVectors(cam.position, e.eye);
        const flat = { x: toCam.x, z: toCam.z };
        let body = horizForward(chest);
        if (body.len < 0.3) body = horizForward(world(`${figureId}:pelvis`) ?? chest);
        let face = horizForward(e.head);
        if (face.len < 0.3) face = body;

        const dir = new THREE.Vector3();
        cam.getWorldDirection(dir);
        const pitch = deg(Math.atan2(-dir.y, Math.hypot(dir.x, dir.z)));
        // Distance along the view axis, which is what decides how big she is.
        const along = toCam.clone().negate().dot(dir);
        const frameH = 2 * Math.max(along, 0.05) * Math.tan(rad(frameVfov) / 2);
        const ndc = e.eye.clone().project(cam);

        return {
          figureId,
          distance: toCam.length(),
          cameraY: cam.position.y,
          eyeY: e.eye.y,
          pitch,
          bodyAzimuth: azimuthDeg(body, flat),
          headAzimuth: azimuthDeg(face, flat),
          mm,
          fill: (1.7 * e.k) / frameH,
          inFrame:
            along > 0 &&
            Math.abs(ndc.x) <= fr.w / Math.max(size.width, 1) &&
            Math.abs(ndc.y) <= fr.h / Math.max(size.height, 1),
        };
      },

      lookAtCamera: (figureId) => {
        const neck = world(`${figureId}:neck`);
        const chest = world(`${figureId}:chest`);
        if (!neck || !chest) return null;
        const at = neck.getWorldPosition(new THREE.Vector3());
        const local = chest.worldToLocal(camera.position.clone()).sub(chest.worldToLocal(at.clone()));
        const turn = deg(Math.atan2(local.x, local.z));
        const nod = deg(Math.atan2(-local.y, Math.hypot(local.x, local.z)));
        return { turn: clamp(turn, -85, 85), nod: clamp(nod, -50, 50) };
      },

      placeCamera: (figureId, azimuth, eyeDelta) => {
        const e = eyeOf(figureId);
        const chest = world(`${figureId}:chest`);
        if (!e || !chest || !controls.current) return;
        const body = horizForward(chest);
        const f = body.len > 0.3 ? { x: body.x / body.len, z: body.z / body.len } : { x: 0, z: 1 };
        // Rotate her forward by the azimuth. Negative azimuth = her left = +X side.
        const a = rad(-azimuth);
        const dx = f.x * Math.cos(a) + f.z * Math.sin(a);
        const dz = -f.x * Math.sin(a) + f.z * Math.cos(a);
        const dist = Math.max(camera.position.distanceTo(controls.current.target), 1.2);
        const target = e.eye.clone();
        if (eyeDelta === "overhead") {
          camera.position.set(target.x + dx * 0.05, target.y + dist, target.z + dz * 0.05);
        } else {
          const y = eyeDelta === "floor" ? 0.15 : target.y + eyeDelta;
          const flat = Math.sqrt(Math.max(dist * dist - (y - target.y) ** 2, 0.5));
          camera.position.set(target.x + dx * flat, y, target.z + dz * flat);
        }
        controls.current.target.copy(target);
        controls.current.update();
        invalidate();
        onCamera(state());
      },

      cameraState: state,

      setCamera: (c) => {
        if (!controls.current) return;
        camera.position.set(...c.position);
        controls.current.target.set(...c.target);
        controls.current.update();
        invalidate();
        // The lens comes with it: state() would report the old one until rerender.
        onCamera({ position: [...c.position] as Vec3, target: [...c.target] as Vec3, mm: c.mm });
      },

      screen: (figureId) => {
        const chest = world(`${figureId}:chest`);
        if (!chest) return null;
        const p = chest.getWorldPosition(new THREE.Vector3());
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const ahead = p.clone().sub(camera.position).dot(dir) > 0;
        const ndc = p.project(camera);
        return {
          x: ((ndc.x + 1) / 2) * size.width,
          y: ((1 - ndc.y) / 2) * size.height,
          visible: ahead && Math.abs(ndc.x) <= 1.05 && Math.abs(ndc.y) <= 1.05,
        };
      },
    };
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={false}
      zoomSpeed={0.8}
      panSpeed={0.9}
      minDistance={0.15}
      maxDistance={40}
      onEnd={() => onCamera(state())}
    />
  );
}

/* --------------------------------------------------------- people drag -- */

/** Pixels of horizontal drag per degree of turn, in the rotate tool. */
const PX_PER_DEG = 2;

/**
 * Each figure in a group that, with the move or rotate tool, takes a
 * pointer-down on the body and moves or turns the whole figure; plus the chest
 * dot, which does the same from anywhere in the frame.
 *
 * MOVE follows the pointer on a level plane through the grab point, offset
 * kept, so the part grabbed stays under the cursor. ROTATE turns the pelvis
 * (the whole body) by horizontal distance dragged, whichever way the camera
 * faces. Window listeners rather than pointer capture: the drag survives the
 * pointer leaving the body, and the canvas, mid-move.
 */
function People({
  figures,
  tool,
  activeFigure,
  showDots,
  nodes,
  onTool,
  onActive,
  onFigure,
  children,
}: {
  figures: BlockingFigure[];
  tool: Tool;
  activeFigure: string | null;
  showDots: boolean;
  nodes: React.MutableRefObject<Map<string, THREE.Object3D>>;
  onTool: (t: Tool) => void;
  onActive: (figureId: string) => void;
  onFigure: (f: BlockingFigure) => void;
  children: (f: BlockingFigure, i: number, marker: ReactNode) => ReactNode;
}) {
  const { camera, gl } = useThree();
  const controls = useThree((st) => st.controls) as OrbitControlsImpl | null;
  // The drag's window listeners outlive the render that started them.
  const latest = useRef(figures);
  useEffect(() => { latest.current = figures; }, [figures]);

  const drag = (id: string, as: "move" | "rotate", cx: number, cy: number, grabY: number) => {
    // Level with the point grabbed, not the floor: from a near-eye-level
    // camera the floor behind a chest is metres away, and a small hand
    // movement would throw the body across the room.
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -grabY);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pointAt = (x: number, y: number) => {
      const r = gl.domElement.getBoundingClientRect();
      ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.ray.intersectPlane(plane, new THREE.Vector3());
    };
    const f0 = latest.current.find((f) => f.id === id);
    const p0 = pointAt(cx, cy);
    if (!f0 || (as === "move" && !p0)) return false;
    onActive(id);
    const off = p0 ? { x: f0.position[0] - p0.x, z: f0.position[2] - p0.z } : { x: 0, z: 0 };
    const yaw0 = (f0.joints.pelvis ?? [0, 0, 0])[1];
    if (controls) controls.enabled = false;
    const cursor = as === "move" ? "grabbing" : "ew-resize";
    gl.domElement.style.cursor = cursor;
    document.body.style.cursor = cursor;
    const move = (ev: PointerEvent) => {
      const f = latest.current.find((x) => x.id === id);
      if (!f) return;
      if (as === "move") {
        const p = pointAt(ev.clientX, ev.clientY);
        if (!p) return;
        onFigure({ ...f, position: [round3(p.x + off.x), f.position[1], round3(p.z + off.z)] });
      } else {
        const pel = f.joints.pelvis ?? [0, 0, 0];
        let yaw = yaw0 + (ev.clientX - cx) / PX_PER_DEG;
        yaw = ((((yaw + 180) % 360) + 360) % 360) - 180;
        onFigure({ ...f, joints: { ...f.joints, pelvis: [pel[0], Math.round(yaw), pel[2]] } });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (controls) controls.enabled = true;
      gl.domElement.style.cursor = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return true;
  };

  const chestY = (id: string) => {
    const n = nodes.current.get(`${id}:chest`);
    return n ? n.getWorldPosition(new THREE.Vector3()).y : 1.3;
  };

  const hoverCursor = tool === "move" ? "grab" : tool === "rotate" ? "ew-resize" : "";

  return (
    <>
      {figures.map((f, i) => {
        const active = f.id === activeFigure;
        const marker = showDots ? (
          <Html center zIndexRange={[20, 0]}>
            <button
              type="button"
              aria-label="Move this person (M), turn them (R)"
              title={tool === "rotate" ? "Drag to turn · R" : "Drag to move · M"}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                // A press on the dot is a request to move them: from the camera
                // tool it switches to move; rotate stays rotate.
                const as = tool === "rotate" ? "rotate" : "move";
                if (tool === "camera") onTool("move");
                drag(f.id, as, e.clientX, e.clientY, chestY(f.id));
              }}
              style={{
                cursor: tool === "rotate" ? "ew-resize" : "grab",
                background: FIGURE_TONES[i % FIGURE_TONES.length].hex,
                touchAction: "none",
              }}
              className={`block h-4 w-4 rounded-full border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6)] transition-opacity ${
                active ? "border-amber opacity-100" : "border-white/80 opacity-60 hover:opacity-100"
              }`}
            />
          </Html>
        ) : null;
        return (
          <group
            key={f.id}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              if (tool === "camera" || e.nativeEvent.button !== 0) return;
              if (drag(f.id, tool, e.nativeEvent.clientX, e.nativeEvent.clientY, e.point.y)) e.stopPropagation();
            }}
            onPointerOver={() => { if (hoverCursor) gl.domElement.style.cursor = hoverCursor; }}
            onPointerOut={() => { gl.domElement.style.cursor = ""; }}
          >
            {children(f, i, marker)}
          </group>
        );
      })}
    </>
  );
}

/* ---------------------------------------------------------------- gizmo -- */

function Gizmo({
  selection,
  mode,
  nodes,
  blocking,
  onFigure,
  onProp,
}: {
  selection: Selection;
  mode: "rotate" | "translate";
  nodes: React.MutableRefObject<Map<string, THREE.Object3D>>;
  blocking: Blocking;
  onFigure: (f: BlockingFigure) => void;
  onProp: (p: BlockingProp) => void;
}) {
  if (!selection) return null;
  const key = selection.type === "joint" ? `${selection.figureId}:${selection.joint}` : `prop:${selection.propId}`;
  const obj = nodes.current.get(key);
  if (!obj) return null;

  if (selection.type === "prop") {
    const p = blocking.props.find((x) => x.id === selection.propId);
    if (!p) return null;
    return (
      <TransformControls
        object={obj}
        mode={mode}
        space="world"
        size={0.8}
        showY={mode === "rotate"}
        showX={mode === "translate"}
        showZ={mode === "translate"}
        onObjectChange={() =>
          onProp({
            ...p,
            position: [round3(obj.position.x), 0, round3(obj.position.z)],
            rotationY: round1(deg(obj.rotation.y)),
          })
        }
      />
    );
  }

  const fig = blocking.figures.find((f) => f.id === selection.figureId);
  if (!fig) return null;
  const moving = mode === "translate" && selection.joint === "pelvis";
  return (
    <TransformControls
      object={obj}
      mode={moving ? "translate" : "rotate"}
      space={moving ? "world" : "local"}
      size={0.6}
      // Along the floor only; height has its own slider.
      showY={!moving}
      onObjectChange={() => {
        if (moving) {
          onFigure({ ...fig, position: obj.position.toArray().map(round3) as Vec3 });
        } else {
          const r = obj.rotation;
          onFigure({
            ...fig,
            joints: { ...fig.joints, [selection.joint]: [round1(deg(r.x)), round1(deg(r.y)), round1(deg(r.z))] },
          });
        }
      }}
    />
  );
}

/* --------------------------------------------------------------- figure -- */

/**
 * The joint and segment helpers live at module level and read the figure from
 * context. Defined inside Figure they would be new component types on every
 * render, so every drag of the gizmo would remount the whole body — and drop
 * the very node the gizmo is attached to.
 */
interface FigureCtxValue {
  fig: BlockingFigure;
  selectedJoint: JointId | null;
  mat: THREE.Material;
  hot: THREE.Material;
  register: (key: string) => (o: THREE.Object3D | null) => void;
  onPick: (j: JointId) => void;
}
const FigureCtx = createContext<FigureCtxValue | null>(null);
const useFig = () => useContext(FigureCtx)!;

function J({ id, at, children }: { id: JointId; at: Vec3; children: ReactNode }) {
  const { fig, register, onPick } = useFig();
  const r = fig.joints[id] ?? [0, 0, 0];
  const reg = useMemo(() => register(`${fig.id}:${id}`), [register, fig.id, id]);
  return (
    <group
      ref={reg}
      position={at}
      rotation={[rad(r[0]), rad(r[1]), rad(r[2]), JOINT_ORDER[id]]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 4) return;
        // Only the innermost joint under the pointer takes the click.
        if ((e.object.userData.joint as string) !== id) return;
        e.stopPropagation();
        onPick(id);
      }}
    >
      {children}
    </group>
  );
}

function useMat(joint: JointId) {
  const { selectedJoint, mat, hot } = useFig();
  return selectedJoint === joint ? hot : mat;
}

function Cap({ joint, r, len, at, rot }: { joint: JointId; r: number; len: number; at?: Vec3; rot?: Vec3 }) {
  const m = useMat(joint);
  return (
    <mesh position={at ?? [0, -len / 2, 0]} rotation={rot} castShadow userData={{ joint }} material={m}>
      <capsuleGeometry args={[r, Math.max(len - 2 * r, 0.001), 6, 14]} />
    </mesh>
  );
}

function Ball({ joint, r, at, scale }: { joint: JointId; r: number; at: Vec3; scale?: Vec3 }) {
  const m = useMat(joint);
  return (
    <mesh position={at} scale={scale} castShadow userData={{ joint }} material={m}>
      <sphereGeometry args={[r, 24, 16]} />
    </mesh>
  );
}

function Box({ joint, size, at }: { joint: JointId; size: Vec3; at: Vec3 }) {
  const m = useMat(joint);
  return (
    <mesh position={at} castShadow userData={{ joint }} material={m}>
      <boxGeometry args={size} />
    </mesh>
  );
}

const EYE = new THREE.MeshStandardMaterial({ color: "#1d1a17", roughness: 0.4 });

function Arm({ side, p, s, k }: { side: "L" | "R"; p: Proportions; s: ReturnType<typeof spineOffsets>; k: number }) {
  const x = side === "L" ? p.shoulderHalf : -p.shoulderHalf;
  const sh = `shoulder${side}` as JointId;
  const el = `elbow${side}` as JointId;
  const wr = `wrist${side}` as JointId;
  // Thumb toward the front, on the inside edge of the hand.
  const thumbX = side === "L" ? -0.012 : 0.012;
  return (
    <J id={sh} at={[x, s.neck * 0.8, 0]}>
      <Ball joint={sh} r={p.limb * 1.35} at={[0, 0, 0]} />
      <Cap joint={sh} r={p.limb * 1.05} len={p.upperArm} />
      <J id={el} at={[0, -p.upperArm, 0]}>
        <Ball joint={el} r={p.limb * 0.95} at={[0, 0, 0]} />
        <Cap joint={el} r={p.limb * 0.85} len={p.forearm} />
        <J id={wr} at={[0, -p.forearm, 0]}>
          <Box joint={wr} size={[0.028 * k, p.hand * 0.84, 0.085 * k]} at={[0, -p.hand * 0.42, 0]} />
          <Cap joint={wr} r={0.011 * k} len={0.07 * k} at={[thumbX, -0.04 * k, 0.04 * k]} rot={[rad(-30), 0, 0]} />
        </J>
      </J>
    </J>
  );
}

function Leg({ side, p, k }: { side: "L" | "R"; p: Proportions; k: number }) {
  const x = side === "L" ? p.hipHalf : -p.hipHalf;
  const hip = `hip${side}` as JointId;
  const knee = `knee${side}` as JointId;
  const ankle = `ankle${side}` as JointId;
  return (
    <J id={hip} at={[x, -0.07 * k, 0]}>
      <Cap joint={hip} r={p.limb * 1.6} len={p.thigh} />
      <J id={knee} at={[0, -p.thigh, 0]}>
        <Ball joint={knee} r={p.limb * 1.25} at={[0, 0, 0]} />
        <Cap joint={knee} r={p.limb * 1.15} len={p.shin} />
        <J id={ankle} at={[0, -p.shin, 0]}>
          <Box joint={ankle} size={[0.085 * k, 0.055 * k, 0.24 * k]} at={[0, -0.025 * k, 0.065 * k]} />
        </J>
      </J>
    </J>
  );
}

function Figure({
  fig,
  tone,
  marker,
  selectedJoint,
  register,
  onSelect,
}: {
  fig: BlockingFigure;
  tone: string;
  /** The chest dot (see People). Rides on the chest, so it follows any pose. */
  marker?: ReactNode;
  selectedJoint: JointId | null;
  register: (key: string) => (o: THREE.Object3D | null) => void;
  onSelect: (s: Selection) => void;
}) {
  const onPick = useCallback(
    (joint: JointId) => onSelect({ type: "joint", figureId: fig.id, joint }),
    [onSelect, fig.id],
  );
  const p = PROPORTIONS[fig.build];
  const s = spineOffsets(p);
  const k = p.height / 1.7;

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: tone, roughness: 0.62 }), [tone]);
  const hot = useMemo(
    () => new THREE.MeshStandardMaterial({ color: tone, roughness: 0.5, emissive: "#c98a2b", emissiveIntensity: 0.55 }),
    [tone],
  );
  const ctx = useMemo(
    () => ({ fig, selectedJoint, mat, hot, register, onPick }),
    [fig, selectedJoint, mat, hot, register, onPick],
  );

  return (
    <FigureCtx.Provider value={ctx}>
      <J id="pelvis" at={fig.position}>
        <Ball joint="pelvis" r={1} at={[0, -0.03 * k, 0]} scale={[p.hipHalf + 0.068 * k, 0.095 * k, 0.1 * k]} />
        <J id="spine" at={[0, s.spine, 0]}>
          <Ball joint="spine" r={1} at={[0, s.chest * 0.45, 0]} scale={[p.torso * 0.82, s.chest * 0.7, p.torso * 0.62]} />
          <J id="chest" at={[0, s.chest, 0]}>
            {marker && <group position={[0, s.neck * 0.45, p.torso * 0.75]}>{marker}</group>}
            <Ball joint="chest" r={1} at={[0, s.neck * 0.48, 0]} scale={[p.shoulderHalf * (fig.build === "woman" ? 0.8 : 0.86), s.neck * 0.58, p.torso * 0.7]} />
            {fig.build === "woman" && (
              <>
                <Ball joint="chest" r={0.046} at={[0.058, s.neck * 0.4, p.torso * 0.48]} />
                <Ball joint="chest" r={0.046} at={[-0.058, s.neck * 0.4, p.torso * 0.48]} />
              </>
            )}
            <J id="neck" at={[0, s.neck, 0]}>
              <Cap joint="neck" r={0.042 * k} len={s.head + 0.05 * k} at={[0, s.head / 2, 0]} />
              <J id="head" at={[0, s.head, 0]}>
                <Ball joint="head" r={1} at={[0, s.skull, 0.005]} scale={[0.08 * k, 0.11 * k, 0.096 * k]} />
                {/* Chin, tucked into the skull, so a nod reads as a nod. */}
                <Ball joint="head" r={1} at={[0, s.skull * 0.5, 0.045 * k]} scale={[0.045 * k, 0.04 * k, 0.045 * k]} />
                {/* Nose and eyes: which way the face points has to be unmistakable from any angle. */}
                <mesh position={[0, s.skull * 0.88, 0.098 * k]} rotation={[rad(90), 0, 0]} castShadow userData={{ joint: "head" }} material={selectedJoint === "head" ? hot : mat}>
                  <coneGeometry args={[0.016 * k, 0.04 * k, 12]} />
                </mesh>
                <mesh position={[0.031 * k, s.skull * 1.06, 0.085 * k]} material={EYE} userData={{ joint: "head" }}>
                  <sphereGeometry args={[0.011 * k, 12, 8]} />
                </mesh>
                <mesh position={[-0.031 * k, s.skull * 1.06, 0.085 * k]} material={EYE} userData={{ joint: "head" }}>
                  <sphereGeometry args={[0.011 * k, 12, 8]} />
                </mesh>
              </J>
            </J>
            <Arm side="L" p={p} s={s} k={k} />
            <Arm side="R" p={p} s={s} k={k} />
          </J>
        </J>
        <Leg side="L" p={p} k={k} />
        <Leg side="R" p={p} k={k} />
      </J>
    </FigureCtx.Provider>
  );
}

/* ---------------------------------------------------------------- props -- */

function PropBox({ s, at, mat }: { s: Vec3; at: Vec3; mat: THREE.Material }) {
  return (
    <mesh position={at} material={mat} castShadow receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

function PropMesh({ kind, selected }: { kind: BlockingProp["kind"]; selected: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#7b7771",
        roughness: 0.9,
        emissive: selected ? "#c98a2b" : "#000000",
        emissiveIntensity: selected ? 0.25 : 0,
      }),
    [selected],
  );
  const B = (s: Vec3, at: Vec3, key?: string) => <PropBox key={key} s={s} at={at} mat={mat} />;
  switch (kind) {
    case "chair":
      return (
        <>
          {B([0.46, 0.05, 0.46], [0, 0.425, 0])}
          {B([0.46, 0.46, 0.04], [0, 0.68, -0.21])}
          {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([x, z]) => B([0.04, 0.4, 0.04], [x, 0.2, z], `${x}${z}`))}
        </>
      );
    case "couch":
      return (
        <>
          {B([2.0, 0.42, 0.9], [0, 0.21, 0])}
          {B([2.0, 0.42, 0.2], [0, 0.63, -0.35])}
          {B([0.2, 0.22, 0.9], [-0.9, 0.53, 0])}
          {B([0.2, 0.22, 0.9], [0.9, 0.53, 0])}
        </>
      );
    case "bed":
      return (
        <>
          {B([1.6, 0.35, 2.1], [0, 0.175, 0])}
          {B([1.54, 0.25, 2.0], [0, 0.475, 0.02])}
          {B([1.6, 1.1, 0.08], [0, 0.55, -1.06])}
          {B([0.6, 0.12, 0.38], [-0.38, 0.66, -0.75])}
          {B([0.6, 0.12, 0.38], [0.38, 0.66, -0.75])}
        </>
      );
    case "table":
      return (
        <>
          {B([1.4, 0.04, 0.8], [0, 0.73, 0])}
          {[[-0.64, -0.34], [0.64, -0.34], [-0.64, 0.34], [0.64, 0.34]].map(([x, z]) => B([0.05, 0.71, 0.05], [x, 0.355, z], `${x}${z}`))}
        </>
      );
    case "counter":
      return B([2.0, 0.92, 0.62], [0, 0.46, 0]);
    case "wall":
      return B([3, 2.6, 0.1], [0, 1.3, 0]);
    case "door":
      return (
        <>
          {B([0.1, 2.1, 0.14], [-0.5, 1.05, 0])}
          {B([0.1, 2.1, 0.14], [0.5, 1.05, 0])}
          {B([1.1, 0.1, 0.14], [0, 2.15, 0])}
        </>
      );
  }
}

/* ---------------------------------------------------------------- utils -- */

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
