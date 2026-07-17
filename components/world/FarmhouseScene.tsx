/**
 * FarmhouseScene — the walkable 3D placeholder room.
 *
 * Everything here is primitive geometry standing in for real art: warm walls, a
 * plank floor, a stone hearth with flickering firelight, and blocked-in furniture.
 * Interactive objects are glowing markers; you target them with the centre
 * crosshair and press E / click to open them.
 *
 * Swap-in point: replace the <Room/> primitives (and optionally load a .glb via
 * drei's useGLTF) with Melissa's real farmhouse model. Object positions come from
 * lib/content/world.ts, so content placement survives the art swap.
 */
"use client";

/* eslint-disable react-hooks/immutability -- Imperative Three.js: per-frame mutation of the camera and reused scratch vectors inside useFrame is the intended, performant R3F pattern; treating them as immutable would reallocate every frame. */

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import type { WorldObject } from "@/lib/content/world";

const ROOM = { width: 9, depth: 9, height: 3.2 };
const EYE_HEIGHT = 1.6;
const MOVE_SPEED = 3.2; // metres/second
const REACH = 2.6; // how close the crosshair must be to target an object

// Palette — the warm farmhouse direction, as THREE colors.
const COLOR = {
  wall: "#2a221c",
  floor: "#3a2c20",
  beam: "#1c150f",
  hearthStone: "#211b16",
  fire: "#c98a3e",
  furniture: "#463525",
  markerFree: "#e0b072",
  markerLocked: "#7a2f3d",
};

interface SceneProps {
  objects: WorldObject[];
  member: boolean;
  onHoverChange: (obj: WorldObject | null) => void;
  onActivate: (obj: WorldObject) => void;
  onLockChange: (locked: boolean) => void;
}

export function FarmhouseScene({
  objects,
  member,
  onHoverChange,
  onActivate,
  onLockChange,
}: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, EYE_HEIGHT, 3], fov: 70, near: 0.1, far: 100 }}
      gl={{ antialias: true }}
      shadows={false}
    >
      <color attach="background" args={["#0a0908"]} />
      <fog attach="fog" args={["#0a0908", 6, 16]} />
      <Room />
      <World
        objects={objects}
        member={member}
        onHoverChange={onHoverChange}
        onActivate={onActivate}
        onLockChange={onLockChange}
      />
    </Canvas>
  );
}

/** Static placeholder geometry for the room + hearth firelight. */
function Room() {
  const fireLight = useRef<THREE.PointLight>(null);
  const fireGlow = useRef<THREE.Mesh>(null);

  // Flicker the hearth so the room feels alive (paused automatically under
  // reduced motion via the parent gate — this component only mounts when moving).
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const flicker =
      1 + Math.sin(t * 11) * 0.12 + Math.sin(t * 27) * 0.06;
    if (fireLight.current) fireLight.current.intensity = 6 * flicker;
    if (fireGlow.current) {
      const m = fireGlow.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.4 * flicker;
    }
  });

  const w = ROOM.width / 2;
  const d = ROOM.depth / 2;

  return (
    <group>
      {/* Ambient + soft key so it's moody, not black */}
      <ambientLight intensity={0.25} color="#6f665c" />
      <hemisphereLight args={["#2a221c", "#100c08", 0.4]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color={COLOR.floor} roughness={0.9} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
        <planeGeometry args={[ROOM.width, ROOM.depth]} />
        <meshStandardMaterial color={COLOR.beam} roughness={1} />
      </mesh>
      {/* Walls */}
      <Wall position={[0, ROOM.height / 2, -d]} args={[ROOM.width, ROOM.height]} />
      <Wall
        position={[0, ROOM.height / 2, d]}
        rotation={[0, Math.PI, 0]}
        args={[ROOM.width, ROOM.height]}
      />
      <Wall
        position={[-w, ROOM.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        args={[ROOM.depth, ROOM.height]}
      />
      <Wall
        position={[w, ROOM.height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        args={[ROOM.depth, ROOM.height]}
      />

      {/* Ceiling beams */}
      {[-2.4, 0, 2.4].map((x) => (
        <mesh key={x} position={[x, ROOM.height - 0.15, 0]}>
          <boxGeometry args={[0.2, 0.2, ROOM.depth]} />
          <meshStandardMaterial color={COLOR.beam} roughness={1} />
        </mesh>
      ))}

      {/* Hearth on the back wall */}
      <mesh position={[0, 0.9, -d + 0.35]}>
        <boxGeometry args={[2.4, 1.8, 0.6]} />
        <meshStandardMaterial color={COLOR.hearthStone} roughness={1} />
      </mesh>
      {/* Firebox glow */}
      <mesh ref={fireGlow} position={[0, 0.55, -d + 0.68]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial
          color={COLOR.fire}
          emissive={COLOR.fire}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={fireLight}
        position={[0, 0.7, -d + 1]}
        color={COLOR.fire}
        intensity={6}
        distance={12}
        decay={2}
      />

      {/* Blocked-in furniture */}
      {/* Sofa facing hearth */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[2.6, 0.8, 1]} />
        <meshStandardMaterial color={COLOR.furniture} roughness={0.85} />
      </mesh>
      {/* Coffee table */}
      <mesh position={[0, 0.3, -1.3]}>
        <boxGeometry args={[1.4, 0.5, 0.7]} />
        <meshStandardMaterial color={COLOR.furniture} roughness={0.8} />
      </mesh>
      {/* Kitchen counter, right wall */}
      <mesh position={[w - 0.5, 0.5, -1.2]}>
        <boxGeometry args={[0.9, 1, 3.4]} />
        <meshStandardMaterial color={COLOR.furniture} roughness={0.8} />
      </mesh>
      {/* Writing desk, left wall */}
      <mesh position={[-w + 0.5, 0.45, 1.8]}>
        <boxGeometry args={[0.8, 0.9, 1.4]} />
        <meshStandardMaterial color={COLOR.furniture} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Wall({
  position,
  rotation = [0, 0, 0],
  args,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  args: [number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={args} />
      <meshStandardMaterial color={COLOR.wall} roughness={1} side={THREE.FrontSide} />
    </mesh>
  );
}

/**
 * World — movement, crosshair raycasting, and the interactive object markers.
 */
function World({
  objects,
  member,
  onHoverChange,
  onActivate,
  onLockChange,
}: Omit<SceneProps, never>) {
  const { camera } = useThree();

  // Marker meshes registered by id for raycasting.
  const markers = useRef<Map<string, THREE.Mesh>>(new Map());
  const objectById = useMemo(
    () => new Map(objects.map((o) => [o.id, o])),
    [objects],
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

  const registerMarker = useCallback((id: string, mesh: THREE.Mesh | null) => {
    if (mesh) markers.current.set(id, mesh);
    else markers.current.delete(id);
  }, []);

  const activateHovered = useCallback(() => {
    const id = hoveredId.current;
    if (!id) return;
    const obj = objectById.get(id);
    if (obj) {
      // Release the mouse so the content overlay is usable.
      if (document.pointerLockElement) document.exitPointerLock();
      onActivate(obj);
    }
  }, [objectById, onActivate]);

  // Keyboard: movement + E-to-activate.
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

  // Click while locked = activate whatever the crosshair is on.
  useEffect(() => {
    const onMouseDown = () => {
      if (document.pointerLockElement) activateHovered();
    };
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [activateHovered]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // Movement relative to look direction, on the XZ plane.
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

    // Crosshair raycast to find the targeted object.
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
      {objects.map((obj) => (
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
    // Gentle bob + hover emphasis.
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
    <mesh
      ref={mesh}
      position={object.position}
      userData={{ objectId: object.id }}
    >
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
