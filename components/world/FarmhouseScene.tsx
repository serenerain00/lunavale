/**
 * FarmhouseScene — the walkable 3D room.
 *
 * Renders the active room: a real photogrammetry GLB when the room has a `scan`
 * (see docs/world/SCAN_CAPTURE.md), otherwise tinted placeholder geometry so the
 * interaction is fully playable before scans exist. Interactive objects are
 * glowing markers targeted with the centre crosshair (press E / click).
 *
 * Navigation: WASD + mouse-look via PointerLockControls, clamped to room bounds
 * (bounds apply to the placeholder; real scans get per-scan bounds on delivery).
 */
"use client";

/* eslint-disable react-hooks/immutability -- Imperative Three.js: per-frame mutation of the camera and reused scratch vectors inside useFrame is the intended, performant R3F pattern; treating them as immutable would reallocate every frame. */

import { Suspense, useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Room, RoomScan, RoomPano, WorldObject } from "@/lib/content/world";

const ROOM = { width: 9, depth: 9, height: 3.2 };
const EYE_HEIGHT = 1.6;
const MOVE_SPEED = 3.2; // metres/second
const REACH = 2.6; // how close the crosshair must be to target an object

const COLOR = {
  floor: "#5c4634",
  beam: "#33271c",
  hearthStone: "#3d332a",
  fire: "#e5a24e",
  markerFree: "#f0c48a",
  markerLocked: "#c8899a",
};

interface SceneProps {
  room: Room;
  member: boolean;
  onHoverChange: (obj: WorldObject | null) => void;
  onActivate: (obj: WorldObject) => void;
  onLockChange: (locked: boolean) => void;
}

export function FarmhouseScene({
  room,
  member,
  onHoverChange,
  onActivate,
  onLockChange,
}: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: room.spawn, fov: 70, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0b0805"]} />
      <fog attach="fog" args={["#0b0805", 7, 26]} />
      <Suspense fallback={null}>
        <RoomModel room={room} />
      </Suspense>
      <World
        room={room}
        member={member}
        onHoverChange={onHoverChange}
        onActivate={onActivate}
        onLockChange={onLockChange}
      />
    </Canvas>
  );
}

/** Environment source, in priority order: panorama, scan, else placeholder. */
function RoomModel({ room }: { room: Room }) {
  if (room.pano) return <PanoRoom pano={room.pano} />;
  if (room.scan) return <ScannedRoom scan={room.scan} />;
  return <PlaceholderRoom accent={room.accent} />;
}

/** Equirectangular 360° panorama, viewed from inside — stand and look around. */
function PanoRoom({ pano }: { pano: RoomPano }) {
  const texture = useTexture(pano.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh rotation={[0, pano.rotationY ?? 0, 0]}>
      <sphereGeometry args={[16, 60, 40]} />
      {/* Unlit, inside-facing, fog-exempt so the pano reads exactly as generated. */}
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        fog={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** Loads a captured room GLB and seats it in scene space. */
function ScannedRoom({ scan }: { scan: RoomScan }) {
  const gltf = useGLTF(scan.src);
  return (
    <group
      position={scan.position ?? [0, 0, 0]}
      rotation={[0, scan.rotationY ?? 0, 0]}
      scale={scan.scale ?? 1}
    >
      {/* Scans carry baked lighting; a soft ambient keeps them from reading flat. */}
      <ambientLight intensity={0.7} color="#d9c3a3" />
      <primitive object={gltf.scene} />
    </group>
  );
}

/** Load a CC0 PBR set (color/normal/roughness) and tile it. */
function usePBR(folder: string, repeat: number) {
  const maps = useTexture({
    map: `/textures/${folder}/color.jpg`,
    normalMap: `/textures/${folder}/normal.jpg`,
    roughnessMap: `/textures/${folder}/roughness.jpg`,
  });
  maps.map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [maps.map, maps.normalMap, maps.roughnessMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
  }
  return maps;
}

/**
 * Placeholder room, dressed with real CC0 PBR textures (wood floor, plaster
 * walls, walnut beams/furniture, stone hearth) under warm, candlelit, low-key
 * lighting — matching the intimate mood and materials of the reference still.
 */
function PlaceholderRoom({ accent }: { accent: string }) {
  const fireLight = useRef<THREE.PointLight>(null);
  const fireGlow = useRef<THREE.Mesh>(null);
  const candleLight = useRef<THREE.PointLight>(null);
  const candleFlame = useRef<THREE.Mesh>(null);

  const floorMaps = usePBR("floor", 5);
  const wallMaps = usePBR("wall", 3);
  const woodMaps = usePBR("wood", 3);
  const stoneMaps = usePBR("stone", 2);

  // A faint per-room tint on the plaster keeps rooms distinct without losing cream.
  const wallTint = useMemo(
    () =>
      new THREE.Color(accent).lerp(new THREE.Color("#e6d8bf"), 0.72).getStyle(),
    [accent],
  );
  const beamCol = "#160f08";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const fire = 1 + Math.sin(t * 11) * 0.12 + Math.sin(t * 27) * 0.06;
    const cand = 1 + Math.sin(t * 9 + 2) * 0.18 + Math.sin(t * 23) * 0.1;
    if (fireLight.current) fireLight.current.intensity = 9 * fire;
    if (fireGlow.current) {
      (fireGlow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.2 * fire;
    }
    if (candleLight.current) candleLight.current.intensity = 3.4 * cand;
    if (candleFlame.current) {
      (candleFlame.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2.4 * cand;
    }
  });

  const w = ROOM.width / 2;
  const d = ROOM.depth / 2;

  return (
    <group>
      {/* Barely-there warm fill; the fixtures below carry the room. */}
      <ambientLight intensity={0.14} color="#4a2f18" />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial {...floorMaps} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color={beamCol} roughness={1} />
      </mesh>
      {/* Walls */}
      <Wall maps={wallMaps} tint={wallTint} position={[0, ROOM.height / 2, -d]} args={[ROOM.width, ROOM.height]} />
      <Wall
        maps={wallMaps}
        tint={wallTint}
        position={[0, ROOM.height / 2, d]}
        rotation={[0, Math.PI, 0]}
        args={[ROOM.width, ROOM.height]}
      />
      <Wall
        maps={wallMaps}
        tint={wallTint}
        position={[-w, ROOM.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        args={[ROOM.depth, ROOM.height]}
      />
      <Wall
        maps={wallMaps}
        tint={wallTint}
        position={[w, ROOM.height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[ROOM.depth, ROOM.height]}
      />

      {/* Ceiling beams */}
      {[-2.4, 0, 2.4].map((x) => (
        <mesh key={x} position={[x, ROOM.height - 0.15, 0]}>
          <boxGeometry args={[0.2, 0.2, ROOM.depth]} />
          <meshStandardMaterial {...woodMaps} />
        </mesh>
      ))}

      {/* Hearth — a low, warm key on the back wall */}
      <mesh position={[0, 0.9, -d + 0.35]}>
        <boxGeometry args={[2.4, 1.8, 0.6]} />
        <meshStandardMaterial {...stoneMaps} />
      </mesh>
      <mesh ref={fireGlow} position={[0, 0.55, -d + 0.68]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial
          color={COLOR.fire}
          emissive={COLOR.fire}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={fireLight}
        position={[0, 0.7, -d + 1]}
        color={COLOR.fire}
        intensity={9}
        distance={12}
        decay={1.8}
      />

      {/* Bedside-style lamp — the main warm pool, like the reference */}
      <group position={[w - 1.4, 0, 1.6]}>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.24, 8]} />
          <meshStandardMaterial color="#2a201a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <coneGeometry args={[0.26, 0.34, 20, 1, true]} />
          <meshStandardMaterial
            color="#e9c79a"
            emissive="#ffca8a"
            emissiveIntensity={1.3}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0, 1.22, 0]}
          color="#ffb060"
          intensity={10}
          distance={7}
          decay={2}
        />
      </group>

      {/* A single candle on the low table */}
      <group position={[0, 0, -1.1]}>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
          <meshStandardMaterial color="#e8dcc4" roughness={0.6} />
        </mesh>
        <mesh ref={candleFlame} position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial
            color="#ffd090"
            emissive="#ffb060"
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          ref={candleLight}
          position={[0, 0.78, 0]}
          color="#ff9a40"
          intensity={3.4}
          distance={3.4}
          decay={2}
        />
      </group>

      {/* Blocked-in furniture (walnut) */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[2.6, 0.8, 1]} />
        <meshStandardMaterial {...woodMaps} />
      </mesh>
      <mesh position={[0, 0.3, -1.3]}>
        <boxGeometry args={[1.4, 0.5, 0.7]} />
        <meshStandardMaterial {...woodMaps} />
      </mesh>
      <mesh position={[w - 0.5, 0.5, -1.2]}>
        <boxGeometry args={[0.9, 1, 3.4]} />
        <meshStandardMaterial {...woodMaps} />
      </mesh>
      <mesh position={[-w + 0.5, 0.45, 1.8]}>
        <boxGeometry args={[0.8, 0.9, 1.4]} />
        <meshStandardMaterial {...woodMaps} />
      </mesh>
    </group>
  );
}

type PBRMaps = {
  map: THREE.Texture;
  normalMap: THREE.Texture;
  roughnessMap: THREE.Texture;
};

function Wall({
  maps,
  tint,
  position,
  rotation = [0, 0, 0],
  args,
}: {
  maps: PBRMaps;
  tint: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={args} />
      <meshStandardMaterial {...maps} color={tint} side={THREE.FrontSide} />
    </mesh>
  );
}

/** Movement, crosshair raycasting, and interactive markers for the active room. */
function World({
  room,
  member,
  onHoverChange,
  onActivate,
  onLockChange,
}: SceneProps) {
  const { camera } = useThree();

  const markers = useRef<Map<string, THREE.Mesh>>(new Map());
  const objectById = useMemo(
    () => new Map(room.objects.map((o) => [o.id, o])),
    [room.objects],
  );

  const keys = useRef<Record<string, boolean>>({});
  const hoveredId = useRef<string | null>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const center = useMemo(() => new THREE.Vector2(0, 0), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const halfW = ROOM.width / 2 - 0.4;
  const halfD = ROOM.depth / 2 - 0.4;
  // Panorama rooms are a fixed viewpoint: look around, don't walk.
  const canMove = !room.pano;

  // Re-spawn and clear hover when the room changes.
  useEffect(() => {
    camera.position.set(room.spawn[0], room.spawn[1], room.spawn[2]);
    hoveredId.current = null;
    onHoverChange(null);
    keys.current = {};
  }, [room.id, room.spawn, camera, onHoverChange]);

  const registerMarker = useCallback((id: string, mesh: THREE.Mesh | null) => {
    if (mesh) markers.current.set(id, mesh);
    else markers.current.delete(id);
  }, []);

  const activateHovered = useCallback(() => {
    const id = hoveredId.current;
    if (!id) return;
    const obj = objectById.get(id);
    if (obj) {
      if (document.pointerLockElement) document.exitPointerLock();
      onActivate(obj);
    }
  }, [objectById, onActivate]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === "KeyE") activateHovered();
    };
    const up2 = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up2);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up2);
    };
  }, [activateHovered]);

  useEffect(() => {
    const onMouseDown = () => {
      if (document.pointerLockElement) activateHovered();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [activateHovered]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    if (canMove) {
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, up).normalize();

      const k = keys.current;
      const move = new THREE.Vector3();
      if (k["KeyW"] || k["ArrowUp"]) move.add(forward);
      if (k["KeyS"] || k["ArrowDown"]) move.sub(forward);
      if (k["KeyD"] || k["ArrowRight"]) move.add(right);
      if (k["KeyA"] || k["ArrowLeft"]) move.sub(right);
      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(MOVE_SPEED * dt);
        camera.position.x = THREE.MathUtils.clamp(
          camera.position.x + move.x,
          -halfW,
          halfW,
        );
        camera.position.z = THREE.MathUtils.clamp(
          camera.position.z + move.z,
          -halfD,
          halfD,
        );
      }
      camera.position.y = EYE_HEIGHT;
    }

    raycaster.setFromCamera(center, camera);
    const meshes = Array.from(markers.current.values());
    const hits = raycaster.intersectObjects(meshes, false);
    const hit = hits.find((h) => h.distance <= REACH);
    const newId = hit ? (hit.object.userData.objectId as string) : null;
    if (newId !== hoveredId.current) {
      hoveredId.current = newId;
      onHoverChange(newId ? objectById.get(newId) ?? null : null);
    }
  });

  return (
    <>
      <PointerLockControls
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
      {room.objects.map((obj) => (
        <Marker
          key={obj.id}
          object={obj}
          locked={obj.access === "premium" && !member}
          hoveredRef={hoveredId}
          register={registerMarker}
        />
      ))}
    </>
  );
}

function Marker({
  object,
  locked,
  hoveredRef,
  register,
}: {
  object: WorldObject;
  locked: boolean;
  hoveredRef: React.RefObject<string | null>;
  register: (id: string, mesh: THREE.Mesh | null) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    register(object.id, mesh.current);
    return () => register(object.id, null);
  }, [object.id, register]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const hovered = hoveredRef.current === object.id;
    m.position.y = object.position[1] + Math.sin(clock.elapsedTime * 2) * 0.04;
    const target = hovered ? 1.5 : 1;
    m.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      hovered ? 2.4 : 1,
      0.15,
    );
  });

  const color = locked ? COLOR.markerLocked : COLOR.markerFree;

  return (
    <mesh ref={mesh} position={object.position} userData={{ objectId: object.id }}>
      <icosahedronGeometry args={[0.12, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        toneMapped={false}
      />
    </mesh>
  );
}
