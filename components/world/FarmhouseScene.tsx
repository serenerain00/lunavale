/**
 * FarmhouseScene — the 3D room.
 *
 * Renders the active room: a real photogrammetry GLB when the room has a `scan`
 * (see docs/world/SCAN_CAPTURE.md), a 360° panorama when it has a `pano`, else
 * textured placeholder geometry dressed with props. Day/night HDRI lighting +
 * sun/moon shadows; post-processing (N8AO, bloom, vignette).
 *
 * Navigation: cinematic waypoints — drag to look (OrbitControls, cursor free),
 * and the camera glides to whichever focus point is selected. Interactive
 * objects are glowing, clickable hotspots.
 */
"use client";

/* eslint-disable react-hooks/immutability -- Imperative Three.js: per-frame mutation of the camera and reused scratch vectors inside useFrame is the intended, performant R3F pattern; treating them as immutable would reallocate every frame. */

import { Component, Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Splat, useGLTF, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA, N8AO } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import type {
  Room,
  RoomScan,
  RoomPano,
  WorldObject,
  ItemKind,
} from "@/lib/content/world";
import { getGallery } from "@/lib/content/gallery";

export type TimeOfDay = "day" | "night";

const ROOM = { width: 9, depth: 15, height: 3.6 };

const COLOR = {
  fire: "#e5a24e",
};

interface SceneProps {
  room: Room;
  member: boolean;
  /** Current focus point (an object) or null for the room overview. */
  focus: WorldObject | null;
  /** An area vantage to fly to (overrides object framing when set). */
  vantage: { camera: [number, number, number]; target: [number, number, number] } | null;
  onHoverChange: (obj: WorldObject | null) => void;
  /** A hotspot was clicked in the scene. */
  onSelectObject: (obj: WorldObject) => void;
  /** A gallery projection was clicked — open the lightbox at that index. */
  onOpenImage: (images: string[], index: number) => void;
}

export function FarmhouseScene({
  room,
  member,
  focus,
  vantage,
  timeOfDay,
  onHoverChange,
  onSelectObject,
  onOpenImage,
}: SceneProps & { timeOfDay: TimeOfDay }) {
  const day = timeOfDay === "day";
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: room.spawn, fov: 60, near: 0.1, far: 100 }}
      gl={{ antialias: false }}
    >
      <Suspense fallback={null}>
        <Lighting day={day} />
        <RoomModel room={room} />
      </Suspense>
      <World
        room={room}
        member={member}
        focus={focus}
        vantage={vantage}
        onHoverChange={onHoverChange}
        onSelectObject={onSelectObject}
        onOpenImage={onOpenImage}
      />
      <EffectComposer multisampling={0}>
        <N8AO
          aoRadius={1.1}
          distanceFalloff={1}
          intensity={2.4}
          halfRes
          color="black"
        />
        <SMAA />
        <Bloom
          intensity={day ? 0.35 : 0.7}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.25}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={day ? 0.5 : 0.75} />
      </EffectComposer>
    </Canvas>
  );
}

/** Day/night lighting: HDRI sky + IBL, plus a sun or moon casting shadows. */
function Lighting({ day }: { day: boolean }) {
  return (
    <>
      <Environment
        files={day ? "/hdri/day.hdr" : "/hdri/night.hdr"}
        background
      />
      {day ? (
        <>
          <ambientLight intensity={0.5} color="#ffe7cc" />
          <directionalLight
            position={[11, 9, 3]}
            intensity={3.4}
            color="#fff1d8"
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-camera-near={0.5}
            shadow-camera-far={40}
            shadow-bias={-0.0004}
          />
        </>
      ) : (
        <>
          <ambientLight intensity={0.18} color="#5a4632" />
          <directionalLight
            position={[9, 11, 5]}
            intensity={0.55}
            color="#9fbdec"
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-camera-near={0.5}
            shadow-camera-far={40}
            shadow-bias={-0.0004}
          />
        </>
      )}
    </>
  );
}

/** Environment source, in priority order: splat, panorama, scan, else placeholder. */
function RoomModel({ room }: { room: Room }) {
  if (room.splat) return <SplatRoom splat={room.splat} />;
  if (room.pano) return <PanoRoom pano={room.pano} />;
  if (room.scan) return <ScannedRoom scan={room.scan} />;
  return <PlaceholderRoom room={room} />;
}

/** Photoreal Gaussian splat capture — its own baked lighting; hotspots overlay it. */
function SplatRoom({ splat }: { splat: NonNullable<Room["splat"]> }) {
  return (
    <group
      position={splat.position ?? [0, 0, 0]}
      rotation={splat.rotation ?? [0, 0, 0]}
      scale={splat.scale ?? 1}
    >
      {/* A little ambient so the overlaid hotspot items read against the splat. */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <Splat src={splat.src} />
    </group>
  );
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
    t.anisotropy = 8; // keep textures sharp at grazing angles (floor, counters)
  }
  return maps;
}

/**
 * Placeholder room: a real CC0 PBR shell (wood floor, plaster walls, walnut
 * beams) under warm low-key lighting, dressed with room-specific furniture.
 * Materials follow Melissa's reference direction; swap for a scan/pano anytime.
 */
function PlaceholderRoom({ room }: { room: Room }) {
  const floorMaps = usePBR("floor", 5);
  const wallMaps = usePBR("wallwood", 8);
  const woodMaps = usePBR("wood", 3);
  const stoneMaps = usePBR("stone", 2);

  // Warm reclaimed-wood plank walls (light tint so the grain reads, not muddy).
  const wallTint = "#d8c2a0";
  const beamCol = "#160f08";

  const w = ROOM.width / 2;
  const d = ROOM.depth / 2;
  // The kitchen is an open-concept great room: the right wall is glass, and the
  // front wall opens into the living room (both drawn by KitchenFurniture).
  const openRight = room.id === "kitchen";
  const openFront = room.id === "kitchen";

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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
      {!openFront && (
        <Wall
          maps={wallMaps}
          tint={wallTint}
          position={[0, ROOM.height / 2, d]}
          rotation={[0, Math.PI, 0]}
          args={[ROOM.width, ROOM.height]}
        />
      )}
      <Wall
        maps={wallMaps}
        tint={wallTint}
        position={[-w, ROOM.height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        args={[ROOM.depth, ROOM.height]}
      />
      {!openRight && (
        <Wall
          maps={wallMaps}
          tint={wallTint}
          position={[w, ROOM.height / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          args={[ROOM.depth, ROOM.height]}
        />
      )}

      {/* Ceiling beams (run the length of the great room) */}
      {[-3, -1, 1, 3].map((x) => (
        <mesh key={x} position={[x, ROOM.height - 0.15, 0]} castShadow>
          <boxGeometry args={[0.22, 0.24, ROOM.depth]} />
          <meshStandardMaterial {...woodMaps} />
        </mesh>
      ))}

      {room.id === "kitchen" ? (
        <KitchenFurniture wood={woodMaps} stone={stoneMaps} />
      ) : (
        <GenericFurniture wood={woodMaps} stone={stoneMaps} />
      )}
    </group>
  );
}

const METAL = { color: "#17181c", metalness: 0.75, roughness: 0.45 };

const MODELS = {
  barChair: "/models/bar_chair_round_01/bar_chair_round_01_1k.gltf",
  armchair: "/models/ArmChair_01/ArmChair_01_1k.gltf",
  plant: "/models/potted_plant_01/potted_plant_01_1k.gltf",
  plant2: "/models/potted_plant_02/potted_plant_02_1k.gltf",
  vase: "/models/ceramic_vase_01/ceramic_vase_01_1k.gltf",
  pot: "/models/brass_pot_01/brass_pot_01_1k.gltf",
  microwave: "/models/vintage_microwave/vintage_microwave_1k.gltf",
  kettle: "/models/vintage_electric_kettle/vintage_electric_kettle_1k.gltf",
  bowl: "/models/wooden_bowl_01/wooden_bowl_01_1k.gltf",
  cuttingBoard: "/models/wooden_cutting_board/wooden_cutting_board_1k.gltf",
  wine: "/models/wine_bottles_01/wine_bottles_01_1k.gltf",
};

const STAINLESS = { color: "#b9bdc4", metalness: 1, roughness: 0.3 };

/** A CC0 glTF prop, cloned so one model can be placed many times. */
function Prop({
  url,
  position,
  rotationY = 0,
  scale = 1,
}: {
  url: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
}) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);
  return (
    <primitive
      object={obj}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  );
}

/** A framed picture on the wall, using a poster image. */
function FramedPicture({
  src,
  position,
  rotationY,
  w = 0.7,
  h = 0.5,
}: {
  src: string;
  position: [number, number, number];
  rotationY: number;
  w?: number;
  h?: number;
}) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.04]} />
        <meshStandardMaterial color="#241812" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
    </group>
  );
}

/** Keeps a failed decor load from crashing the whole scene. */
class DecorBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Rustic mountain-farmhouse kitchen — island, stone hood, cabinets, pendants. */
function KitchenFurniture({ wood, stone }: { wood: PBRMaps; stone: PBRMaps }) {
  const candleFlame = useRef<THREE.Mesh>(null);
  const candleLight = useRef<THREE.PointLight>(null);
  const d = ROOM.depth / 2;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const cand = 1 + Math.sin(t * 9 + 2) * 0.18 + Math.sin(t * 23) * 0.1;
    if (candleLight.current) candleLight.current.intensity = 2.6 * cand;
    if (candleFlame.current) {
      (candleFlame.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        2.4 * cand;
    }
  });

  const w = ROOM.width / 2;

  return (
    <group>
      {/* Floor-to-ceiling stone chimney / range hood on the back wall */}
      <mesh position={[0, ROOM.height / 2, -d + 0.26]} castShadow receiveShadow>
        <boxGeometry args={[2.3, ROOM.height, 0.52]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      <mesh position={[0, 2.05, -d + 0.62]} castShadow>
        <boxGeometry args={[1.9, 0.55, 0.7]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      <Range position={[0, 0, -d + 0.55]} />

      {/* Lower cabinets + stone counters flanking the range */}
      {[-2.75, 2.75].map((x) => (
        <group key={x} position={[x, 0, -d + 0.35]}>
          <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.9, 0.86, 0.62]} />
            <meshStandardMaterial {...wood} />
          </mesh>
          {/* toe kick (recessed dark base) */}
          <mesh position={[0, 0.06, 0.24]}>
            <boxGeometry args={[2.9, 0.12, 0.14]} />
            <meshStandardMaterial color="#0d0906" roughness={1} />
          </mesh>
          {/* door seams + handles */}
          {[-0.96, 0, 0.96].map((dx) => (
            <group key={dx} position={[dx, 0.5, 0.315]}>
              <mesh position={[0.45, 0, 0.005]}>
                <boxGeometry args={[0.02, 0.78, 0.02]} />
                <meshStandardMaterial color="#0d0906" roughness={1} />
              </mesh>
              <mesh position={[0.3, 0.24, 0.03]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
                <meshStandardMaterial {...METAL} />
              </mesh>
            </group>
          ))}
          {/* stone counter */}
          <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
            <boxGeometry args={[3.0, 0.09, 0.66]} />
            <meshStandardMaterial {...stone} />
          </mesh>
          {/* upper cabinet */}
          <mesh position={[0, 2.35, 0.05]} castShadow>
            <boxGeometry args={[2.6, 0.72, 0.34]} />
            <meshStandardMaterial {...wood} />
          </mesh>
          <mesh position={[0, 2.05, 0.23]}>
            <boxGeometry args={[2.6, 0.02, 0.02]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}

      {/* Wrap-around counter along the left wall (kitchen end) */}
      <LeftWallCounter x={-w} zCenter={-5} length={5} wood={wood} stone={stone} />

      {/* Warm under-cabinet glow — kept low for a dim, intimate feel */}
      <pointLight position={[-2.4, 1.15, -d + 0.9]} color="#ffb060" intensity={1.3} distance={3} decay={2} />
      <pointLight position={[2.4, 1.15, -d + 0.9]} color="#ffb060" intensity={1.3} distance={3} decay={2} />
      <pointLight position={[-w + 0.9, 1.15, -5]} color="#ffb060" intensity={1.2} distance={3} decay={2} />

      {/* Island — seating overhang faces the living room (+z) */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.86, 1.4]} />
          <meshStandardMaterial {...wood} />
        </mesh>
        <mesh position={[0, 0.06, 0.6]}>
          <boxGeometry args={[2.8, 0.12, 0.16]} />
          <meshStandardMaterial color="#0d0906" roughness={1} />
        </mesh>
        {[-0.9, 0, 0.9].map((dx) => (
          <group key={dx} position={[dx, 0.5, 0.705]}>
            <mesh position={[0.45, 0, 0]}>
              <boxGeometry args={[0.02, 0.78, 0.02]} />
              <meshStandardMaterial color="#0d0906" roughness={1} />
            </mesh>
            <mesh position={[0.3, 0.26, 0.02]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
              <meshStandardMaterial {...METAL} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.95, 0.18]} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.1, 1.94]} />
          <meshStandardMaterial {...stone} />
        </mesh>
        <mesh position={[-1.1, 1.08, 0.2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.16, 10]} />
          <meshStandardMaterial color="#e8dcc4" roughness={0.6} />
        </mesh>
        <mesh ref={candleFlame} position={[-1.1, 1.2, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#ffd090" emissive="#ffb060" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <pointLight ref={candleLight} position={[-1.1, 1.23, 0.2]} color="#ff9a40" intensity={2.6} distance={3} decay={2} />
      </group>

      {/* Pendants over the island */}
      {[-0.8, 0, 0.8].map((x) => (
        <Pendant key={x} position={[x, 0, -5]} />
      ))}

      {/* Right-wall windows (full length) */}
      <Windows x={w} />

      {/* Fridge at the kitchen end of the left wall */}
      <Fridge x={-w} z={-3} />

      {/* Espresso machine on the right counter — Josh's splurge */}
      <EspressoMachine position={[3.35, 1.0, -d + 0.4]} />

      {/* Open-concept living room in the front half (fireplace + TV + sofas) */}
      <LivingRoom z={d} wood={wood} stone={stone} />

      {/* Prop models + framed pictures — guarded so a bad asset can't blank the room. */}
      <DecorBoundary>
        <Suspense fallback={null}>
          {/* stools wrapping the island */}
          <Prop url={MODELS.barChair} position={[-1.1, 0, -3.6]} rotationY={Math.PI} />
          <Prop url={MODELS.barChair} position={[-0.37, 0, -3.57]} rotationY={Math.PI} />
          <Prop url={MODELS.barChair} position={[0.37, 0, -3.57]} rotationY={Math.PI} />
          <Prop url={MODELS.barChair} position={[1.1, 0, -3.6]} rotationY={Math.PI} />
          <Prop url={MODELS.barChair} position={[1.85, 0, -5]} rotationY={-Math.PI / 2} />
          <Prop url={MODELS.barChair} position={[-1.85, 0, -5]} rotationY={Math.PI / 2} />

          {/* living-room greenery — lots of plants, per the reference */}
          <Prop url={MODELS.plant} position={[3.9, 0, 5.6]} />
          <Prop url={MODELS.plant2} position={[-3.9, 0, 5.6]} />
          <Prop url={MODELS.plant} position={[-3.9, 0, 1.6]} />
          <Prop url={MODELS.plant2} position={[3.2, 0, 6.9]} />
          {/* island */}
          <Prop url={MODELS.bowl} position={[0.9, 1.0, -5]} />
          {/* back + left counters */}
          <Prop url={MODELS.microwave} position={[-3.5, 1.0, -d + 0.42]} />
          <Prop url={MODELS.pot} position={[-2.5, 0.99, -d + 0.42]} />
          <Prop url={MODELS.kettle} position={[-1.8, 1.0, -d + 0.42]} />
          <Prop url={MODELS.cuttingBoard} position={[1.8, 1.0, -d + 0.42]} rotationY={0.15} />
          <Prop url={MODELS.vase} position={[2.6, 1.0, -d + 0.42]} />

          {/* a framed still on the left living-room wall */}
          <FramedPicture
            src="/posters/tyson-luna-lakehouse-fire.jpg"
            position={[-w + 0.03, 1.6, 3]}
            rotationY={Math.PI / 2}
          />
        </Suspense>
      </DecorBoundary>
    </group>
  );
}

/** A counter run along the left wall (runs along z), for an L-shaped kitchen. */
function LeftWallCounter({
  x,
  zCenter,
  length,
  wood,
  stone,
}: {
  x: number;
  zCenter: number;
  length: number;
  wood: PBRMaps;
  stone: PBRMaps;
}) {
  const zc = zCenter;
  const len = length;
  return (
    <group position={[x + 0.31, 0, zc]}>
      {/* lower cabinet */}
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.86, len]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      {/* toe kick */}
      <mesh position={[0.24, 0.06, 0]}>
        <boxGeometry args={[0.14, 0.12, len]} />
        <meshStandardMaterial color="#0d0906" roughness={1} />
      </mesh>
      {/* stone counter */}
      <mesh position={[0.02, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.09, len + 0.08]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      {/* door seams + handles along the run */}
      {[-1.6, -0.8, 0, 0.8, 1.6].map((dz) => (
        <group key={dz} position={[0.315, 0.5, dz]}>
          <mesh position={[0, 0, 0.38]}>
            <boxGeometry args={[0.02, 0.78, 0.02]} />
            <meshStandardMaterial color="#0d0906" roughness={1} />
          </mesh>
          <mesh position={[0.02, 0.24, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        </group>
      ))}
      {/* upper cabinets */}
      <mesh position={[-0.14, 2.35, 0]} castShadow>
        <boxGeometry args={[0.34, 0.72, 3.4]} />
        <meshStandardMaterial {...wood} />
      </mesh>
    </group>
  );
}

/** Floor-to-ceiling mullioned windows filling a wall, with real glass. */
function Windows({ x }: { x: number }) {
  const frame = { color: "#241812", roughness: 0.6, metalness: 0 };
  const H = ROOM.height;
  const zs = [-4, -2, 0, 2, 4]; // vertical mullions
  return (
    <group position={[x - 0.06, 0, 0]}>
      {/* Glass pane — clear, faintly reflective, so the snowy forest reads through it */}
      <mesh position={[0.02, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM.depth - 0.2, H - 0.2]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.16}
          roughness={0.04}
          metalness={0}
          transmission={0}
          ior={1.45}
          color="#cfe0ec"
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* sill + head */}
      {[0.08, H - 0.08].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.12, 0.16, ROOM.depth]} />
          <meshStandardMaterial {...frame} />
        </mesh>
      ))}
      {/* mid rail */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, ROOM.depth]} />
        <meshStandardMaterial {...frame} />
      </mesh>
      {/* vertical mullions */}
      {zs.map((z) => (
        <mesh key={z} position={[0, H / 2, z]} castShadow>
          <boxGeometry args={[0.1, H, 0.1]} />
          <meshStandardMaterial {...frame} />
        </mesh>
      ))}
    </group>
  );
}

/** Mullioned window section on the front wall, flanking the fireplace. */
function FrontWindow({ x, z }: { x: number; z: number }) {
  const frame = { color: "#241812", roughness: 0.6, metalness: 0 };
  const H = ROOM.height;
  const width = 2.4;
  return (
    <group position={[x, 0, z - 0.05]}>
      <mesh position={[0, H / 2, 0]}>
        <planeGeometry args={[width, H - 0.2]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.16}
          roughness={0.04}
          metalness={0}
          ior={1.45}
          color="#cfe0ec"
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-width / 2, 0, width / 2].map((bx) => (
        <mesh key={bx} position={[bx, H / 2, 0.03]} castShadow>
          <boxGeometry args={[0.08, H, 0.08]} />
          <meshStandardMaterial {...frame} />
        </mesh>
      ))}
      {[0.1, 1.6, H - 0.1].map((by) => (
        <mesh key={by} position={[0, by, 0.03]} castShadow>
          <boxGeometry args={[width, 0.08, 0.08]} />
          <meshStandardMaterial {...frame} />
        </mesh>
      ))}
    </group>
  );
}

/** The TV screen — shows a scene still, dimly lit like a screen at night. */
function TVScreen({ z }: { z: number }) {
  const tex = useTexture("/posters/luna-josh-first-morning.jpg");
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[0, 2.45, z]}>
      <planeGeometry args={[2.72, 1.5]} />
      <meshStandardMaterial
        map={tex}
        emissive="#ffffff"
        emissiveMap={tex}
        emissiveIntensity={0.9}
        toneMapped={false}
      />
    </mesh>
  );
}

/** One straight run of a sectional (base + individual seat/back cushions). */
function SofaSeg({
  position,
  rotationY,
  length,
  maps,
}: {
  position: [number, number, number];
  rotationY: number;
  length: number;
  maps: PBRMaps;
}) {
  const seats = Math.max(2, Math.round(length / 1.1));
  const seatW = length / seats;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* base frame */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.44, 0.98]} />
        <meshStandardMaterial {...maps} color="#b9ad92" roughness={1} />
      </mesh>
      {/* seat + back cushions */}
      {Array.from({ length: seats }).map((_, i) => {
        const x = -length / 2 + seatW * (i + 0.5);
        return (
          <group key={i}>
            <mesh position={[x, 0.54, 0.08]} castShadow>
              <boxGeometry args={[seatW - 0.05, 0.22, 0.82]} />
              <meshStandardMaterial {...maps} color="#cabfa6" roughness={1} />
            </mesh>
            <mesh position={[x, 0.76, -0.34]} castShadow>
              <boxGeometry args={[seatW - 0.05, 0.62, 0.3]} />
              <meshStandardMaterial {...maps} color="#c1b59a" roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Large wraparound (U-shaped) sectional facing the fireplace, with pillows and
 *  a throw draped over the back — the spot where Luna wrote in her journal. */
function Sectional({ z }: { z: number }) {
  const fabric = usePBR("fabric", 2.5);
  const backZ = z - 5.6; // back run, farthest from the fireplace
  const sideFront = z - 3.7;
  const sideZc = (backZ + sideFront) / 2;
  const sideLen = sideFront - backZ;
  return (
    <group>
      <SofaSeg position={[0, 0, backZ]} rotationY={0} length={5.0} maps={fabric} />
      <SofaSeg position={[-2.4, 0, sideZc]} rotationY={Math.PI / 2} length={sideLen} maps={fabric} />
      <SofaSeg position={[2.4, 0, sideZc]} rotationY={-Math.PI / 2} length={sideLen} maps={fabric} />
    </group>
  );
}

/** A small stack of books. */
function Books({ position }: { position: [number, number, number] }) {
  const books: [number, number, number, string][] = [
    [0, 0.03, 0.2, "#5a3a28"],
    [0.02, 0.09, -0.1, "#37473a"],
    [-0.02, 0.15, 0.35, "#6e5f47"],
  ];
  return (
    <group position={position}>
      {books.map(([x, y, r, c], i) => (
        <group key={i} position={[x, y, 0]} rotation={[0, r, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.48 - i * 0.03, 0.055, 0.33 - i * 0.02]} />
            <meshStandardMaterial color={c} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.001, 0]}>
            <boxGeometry args={[0.44 - i * 0.03, 0.05, 0.29 - i * 0.02]} />
            <meshStandardMaterial color="#e8dcc4" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A side table with a warm reading lamp. */
function TableLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#3a2418" roughness={0.7} />
      </mesh>
      {[
        [-0.2, -0.2],
        [0.2, -0.2],
        [-0.2, 0.2],
        [0.2, 0.2],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.14, p[1]]}>
          <boxGeometry args={[0.04, 0.28, 0.04]} />
          <meshStandardMaterial color="#2a1c12" />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.28, 10]} />
        <meshStandardMaterial color="#1c1a17" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.14, 0.18, 0.22, 16, 1, true]} />
        <meshStandardMaterial
          color="#e9c79a"
          emissive="#ffca8a"
          emissiveIntensity={0.9}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0.6, 0]} color="#ffb060" intensity={2.2} distance={4} decay={2} />
    </group>
  );
}

/** A small stack of firewood logs. */
function Firewood({ position }: { position: [number, number, number] }) {
  const logs: [number, number][] = [
    [-0.16, 0.1],
    [0, 0.1],
    [0.16, 0.1],
    [-0.08, 0.24],
    [0.08, 0.24],
    [0, 0.38],
  ];
  return (
    <group position={position}>
      {logs.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 10]} />
          <meshStandardMaterial color="#4a3423" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** A wood coffee table. */
function CoffeeTable({
  position,
  wood,
}: {
  position: [number, number, number];
  wood: PBRMaps;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.12, 0.7]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      {[
        [-0.55, -0.28],
        [0.55, -0.28],
        [-0.55, 0.28],
        [0.55, 0.28],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], 0.18, p[1]]} castShadow>
          <boxGeometry args={[0.08, 0.36, 0.08]} />
          <meshStandardMaterial color="#2a1c12" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The open-concept living room: floor-to-ceiling stone fireplace with a timber
 * mantel and a large mounted TV, flanked by windows, with sofas facing it.
 */
function LivingRoom({
  z,
  wood,
  stone,
}: {
  z: number;
  wood: PBRMaps;
  stone: PBRMaps;
}) {
  const fireLight = useRef<THREE.PointLight>(null);
  const fireGlow = useRef<THREE.Mesh>(null);
  const rug = usePBR("rug", 3);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const f = 1 + Math.sin(t * 10) * 0.16 + Math.sin(t * 24) * 0.09;
    if (fireLight.current) fireLight.current.intensity = 4 * f;
    if (fireGlow.current) {
      (fireGlow.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.7 * f;
    }
  });

  return (
    <group>
      {/* Stone chimney breast, floor to ceiling */}
      <mesh position={[0, ROOM.height / 2, z - 0.25]} castShadow receiveShadow>
        <boxGeometry args={[3.0, ROOM.height, 0.5]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      {/* Flanking windows */}
      <FrontWindow x={-3.2} z={z} />
      <FrontWindow x={3.2} z={z} />
      {/* Timber mantel */}
      <mesh position={[0, 1.4, z - 0.34]} castShadow>
        <boxGeometry args={[2.6, 0.3, 0.5]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      {/* mantel candlesticks */}
      {[-0.95, 0.95].map((x) => (
        <group key={x} position={[x, 1.55, z - 0.42]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.06, 12]} />
            <meshStandardMaterial color="#1c1a17" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.2, 10]} />
            <meshStandardMaterial color="#e8dcc4" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#ffd090" emissive="#ffb060" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.27, 0]} color="#ff9a40" intensity={1.4} distance={2.2} decay={2} />
        </group>
      ))}
      {/* Firebox + fire glow */}
      <mesh position={[0, 0.7, z - 0.42]}>
        <boxGeometry args={[1.3, 0.9, 0.12]} />
        <meshStandardMaterial color="#0a0806" roughness={1} />
      </mesh>
      <mesh ref={fireGlow} position={[0, 0.55, z - 0.46]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshStandardMaterial color="#ff8a30" emissive="#ff8a30" emissiveIntensity={1.7} toneMapped={false} />
      </mesh>
      <pointLight ref={fireLight} position={[0, 0.7, z - 0.95]} color="#ff7a28" intensity={4} distance={8} decay={2} />
      {/* Large wall-mounted TV above the mantel */}
      <mesh position={[0, 2.45, z - 0.32]} castShadow>
        <boxGeometry args={[2.9, 1.66, 0.09]} />
        <meshStandardMaterial color="#050506" metalness={0.5} roughness={0.3} />
      </mesh>
      <TVScreen z={z - 0.26} />
      {/* faint glow from the lit screen */}
      <pointLight position={[0, 2.45, z - 1.2]} color="#9fb8d8" intensity={0.9} distance={4} decay={2} />
      {/* Wraparound sectional facing the fireplace */}
      <Sectional z={z} />
      {/* Coffee table + rug inside the sectional */}
      <CoffeeTable position={[0, 0, z - 4.2]} wood={wood} />
      <mesh position={[0, 0.02, z - 4.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.4, 3.4]} />
        <meshStandardMaterial {...rug} color="#7a5236" roughness={1} />
      </mesh>
      {/* wood tray + books on the coffee table */}
      <mesh position={[-0.35, 0.47, z - 4.2]} castShadow>
        <boxGeometry args={[0.5, 0.04, 0.36]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      <Books position={[0.4, 0.46, z - 4.05]} />
      {/* side tables with warm lamps at the sectional ends */}
      <TableLamp position={[-3.5, 0, z - 5.6]} />
      <TableLamp position={[3.5, 0, z - 5.6]} />
      {/* pouf / ottoman near the opening */}
      <mesh position={[1.3, 0.22, z - 3.9]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.42, 20]} />
        <meshStandardMaterial color="#b8a888" roughness={0.95} />
      </mesh>
      {/* firewood beside the hearth */}
      <Firewood position={[-1.85, 0, z - 0.5]} />
      {/* warm living-room fill so it reads cozy, not murky */}
      <pointLight position={[0, 1.9, z - 4.2]} color="#ffcf9a" intensity={1.5} distance={8} decay={2} />
      <pointLight position={[0, 2.6, z - 6]} color="#ffdca8" intensity={0.9} distance={9} decay={2} />
    </group>
  );
}

/** A tall stainless double-door fridge standing against a wall. */
function Fridge({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x + 0.4, 0, z]}>
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 2.1, 0.78]} />
        <meshStandardMaterial {...STAINLESS} />
      </mesh>
      {/* door seams */}
      <mesh position={[0.37, 1.45, 0]}>
        <boxGeometry args={[0.02, 1.28, 0.8]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0.37, 0.55, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* handles */}
      {[1.5, 0.7].map((y) => (
        <mesh key={y} position={[0.38, y, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
    </group>
  );
}

/** A range/oven: stainless body, dark glass oven door, cooktop with burners. */
function Range({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.9, 0.66]} />
        <meshStandardMaterial {...STAINLESS} />
      </mesh>
      {/* oven door (dark glass) */}
      <mesh position={[0, 0.4, 0.34]}>
        <boxGeometry args={[0.92, 0.56, 0.02]} />
        <meshStandardMaterial color="#0c0d10" metalness={0.5} roughness={0.15} />
      </mesh>
      {/* handle */}
      <mesh position={[0, 0.72, 0.37]}>
        <boxGeometry args={[0.82, 0.04, 0.05]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* control panel + knobs */}
      <mesh position={[0, 0.86, 0.33]}>
        <boxGeometry args={[1.06, 0.12, 0.02]} />
        <meshStandardMaterial color="#17181c" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.42, -0.22, 0.22, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.86, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 12]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      ))}
      {/* cooktop + burners */}
      <mesh position={[0, 0.915, 0]}>
        <boxGeometry args={[1.06, 0.03, 0.62]} />
        <meshStandardMaterial color="#141414" roughness={0.35} metalness={0.4} />
      </mesh>
      {[
        [-0.26, -0.15],
        [0.26, -0.15],
        [-0.26, 0.15],
        [0.26, 0.15],
      ].map((p, i) => (
        <mesh
          key={i}
          position={[p[0], 0.935, p[1]]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.1, 0.1, 0.01, 20]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** A premium stainless/black espresso machine. */
function EspressoMachine({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.36, 0.42]} />
        <meshStandardMaterial {...STAINLESS} />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.44, 0.08, 0.42]} />
        <meshStandardMaterial color="#141416" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* group head */}
      <mesh position={[0, 0.12, 0.24]}>
        <cylinderGeometry args={[0.045, 0.045, 0.12, 12]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* portafilter handle */}
      <mesh position={[0, 0.06, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.16, 8]} />
        <meshStandardMaterial color="#141416" roughness={0.5} />
      </mesh>
      {/* steam wand */}
      <mesh position={[0.18, 0.2, 0.18]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* espresso cup */}
      <mesh position={[0, 0.02, 0.24]}>
        <cylinderGeometry args={[0.035, 0.03, 0.05, 12]} />
        <meshStandardMaterial color="#efe9dd" roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Warm intimate sitting-room dressing used for the non-kitchen rooms. */
function GenericFurniture({ wood, stone }: { wood: PBRMaps; stone: PBRMaps }) {
  const fireLight = useRef<THREE.PointLight>(null);
  const fireGlow = useRef<THREE.Mesh>(null);
  const candleLight = useRef<THREE.PointLight>(null);
  const candleFlame = useRef<THREE.Mesh>(null);
  const w = ROOM.width / 2;
  const d = ROOM.depth / 2;

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

  return (
    <group>
      {/* Hearth */}
      <mesh position={[0, 0.9, -d + 0.35]}>
        <boxGeometry args={[2.4, 1.8, 0.6]} />
        <meshStandardMaterial {...stone} />
      </mesh>
      <mesh ref={fireGlow} position={[0, 0.55, -d + 0.68]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial color={COLOR.fire} emissive={COLOR.fire} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <pointLight ref={fireLight} position={[0, 0.7, -d + 1]} color={COLOR.fire} intensity={9} distance={12} decay={1.8} />

      {/* Bedside-style lamp */}
      <group position={[w - 1.4, 0, 1.6]}>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.24, 8]} />
          <meshStandardMaterial color="#2a201a" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <coneGeometry args={[0.26, 0.34, 20, 1, true]} />
          <meshStandardMaterial color="#e9c79a" emissive="#ffca8a" emissiveIntensity={1.3} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.22, 0]} color="#ffb060" intensity={10} distance={7} decay={2} />
      </group>

      {/* Candle on the low table */}
      <group position={[0, 0, -1.1]}>
        <mesh position={[0, 0.62, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
          <meshStandardMaterial color="#e8dcc4" roughness={0.6} />
        </mesh>
        <mesh ref={candleFlame} position={[0, 0.75, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#ffd090" emissive="#ffb060" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
        <pointLight ref={candleLight} position={[0, 0.78, 0]} color="#ff9a40" intensity={3.4} distance={3.4} decay={2} />
      </group>

      {/* Blocked-in furniture (walnut) */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[2.6, 0.8, 1]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      <mesh position={[0, 0.3, -1.3]}>
        <boxGeometry args={[1.4, 0.5, 0.7]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      <mesh position={[w - 0.5, 0.5, -1.2]}>
        <boxGeometry args={[0.9, 1, 3.4]} />
        <meshStandardMaterial {...wood} />
      </mesh>
      <mesh position={[-w + 0.5, 0.45, 1.8]}>
        <boxGeometry args={[0.8, 0.9, 1.4]} />
        <meshStandardMaterial {...wood} />
      </mesh>
    </group>
  );
}

/** An amber glass pendant hanging from the ceiling. */
function Pendant({ position }: { position: [number, number, number] }) {
  const y = 2.25;
  return (
    <group position={position}>
      <mesh position={[0, (ROOM.height + y) / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, ROOM.height - y, 6]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* metal shade cap */}
      <mesh position={[0, y + 0.11, 0]}>
        <coneGeometry args={[0.11, 0.12, 16]} />
        <meshStandardMaterial color="#1c1a17" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* amber glass globe — glows without blowing out */}
      <mesh position={[0, y, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#ffcf8f"
          emissive="#ffab52"
          emissiveIntensity={0.85}
          transparent
          opacity={0.92}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, y - 0.1, 0]} color="#ffb060" intensity={3.2} distance={4.5} decay={2} />
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
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial {...maps} color={tint} side={THREE.FrontSide} />
    </mesh>
  );
}

/** Movement, crosshair raycasting, and interactive markers for the active room. */
/** Camera position + look target for a focus point (or the room overview). */
function focusView(room: Room, focus: WorldObject | null) {
  if (!focus) {
    return {
      pos: new THREE.Vector3(room.spawn[0], room.spawn[1], room.spawn[2]),
      target: new THREE.Vector3(0, 1.4, -3),
    };
  }
  const p = new THREE.Vector3(...focus.position);
  const target = p.clone();
  // Approach the asset from the open side of the room (toward the entrance).
  const dir = new THREE.Vector3(0, p.y, 3.8).sub(p);
  dir.y = 0;
  if (dir.lengthSq() < 1e-4) dir.set(0, 0, 1);
  dir.normalize();
  const pos = p.clone().add(dir.multiplyScalar(1.35));
  pos.y = p.y + 0.28;
  return { pos, target };
}

/** Yaw/pitch (Euler YXZ) that makes a camera at `pos` look at `target`. */
function lookYawPitch(pos: THREE.Vector3, target: THREE.Vector3) {
  const dummy = new THREE.Object3D();
  dummy.position.copy(pos);
  dummy.up.set(0, 1, 0);
  dummy.lookAt(target);
  const e = new THREE.Euler().setFromQuaternion(dummy.quaternion, "YXZ");
  return { yaw: e.y, pitch: e.x };
}

/**
 * First-person look navigation: drag turns your view where you stand (the
 * cursor stays free), and the camera glides between areas/hotspots. Rotation
 * happens around your own position, not a distant anchor.
 */
function World({
  room,
  member,
  focus,
  vantage,
  onHoverChange,
  onSelectObject,
  onOpenImage,
}: SceneProps) {
  const { camera, gl } = useThree();
  const gallery = room.galleryId ? getGallery(room.galleryId) : undefined;
  const yaw = useRef(0);
  const pitch = useRef(0);

  // Drag-to-look: rotate the view in place, cursor free.
  useEffect(() => {
    camera.rotation.order = "YXZ";
    const el = gl.domElement;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      gsap.killTweensOf(yaw);
      gsap.killTweensOf(pitch);
      yaw.current -= (e.clientX - lastX) * 0.005;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - (e.clientY - lastY) * 0.005,
        -1.2,
        1.2,
      );
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      dragging = false;
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [camera, gl]);

  // Glide position + turn to face the destination when focus/area/room changes.
  useEffect(() => {
    const { pos, target } = vantage
      ? {
          pos: new THREE.Vector3(...vantage.camera),
          target: new THREE.Vector3(...vantage.target),
        }
      : focusView(room, focus);
    const look = lookYawPitch(pos, target);
    // Take the shortest angular path for yaw.
    let destYaw = look.yaw;
    while (destYaw - yaw.current > Math.PI) destYaw -= Math.PI * 2;
    while (destYaw - yaw.current < -Math.PI) destYaw += Math.PI * 2;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(yaw);
    gsap.killTweensOf(pitch);

    if (reduce) {
      camera.position.copy(pos);
      yaw.current = destYaw;
      pitch.current = look.pitch;
      return;
    }
    gsap.to(camera.position, {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      duration: 1.15,
      ease: "power2.inOut",
    });
    gsap.to(yaw, { current: destYaw, duration: 1.15, ease: "power2.inOut" });
    gsap.to(pitch, {
      current: look.pitch,
      duration: 1.15,
      ease: "power2.inOut",
    });
  }, [focus, vantage, room, camera]);

  // Apply the look each frame.
  useFrame(() => {
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return (
    <>
      {room.objects.map((obj) => (
        <Marker
          key={obj.id}
          object={obj}
          locked={obj.access === "premium" && !member}
          active={focus?.id === obj.id}
          onHover={onHoverChange}
          onSelect={onSelectObject}
        />
      ))}
      {gallery && (
        <Suspense fallback={null}>
          <GalleryWall
            images={gallery.images}
            onOpen={(i) => onOpenImage(gallery.images, i)}
          />
        </Suspense>
      )}
    </>
  );
}

/** A row of glowing still "projections" hung along the left wall of the room. */
function GalleryWall({
  images,
  onOpen,
}: {
  images: string[];
  onOpen: (index: number) => void;
}) {
  const x = -ROOM.width / 2 + 0.05;
  const n = images.length;
  const z0 = -6;
  const z1 = 7;
  return (
    <>
      {images.map((src, i) => {
        const z = n > 1 ? z0 + (z1 - z0) * (i / (n - 1)) : (z0 + z1) / 2;
        return (
          <ArtFrame
            key={src}
            src={src}
            position={[x, 1.65, z]}
            onClick={() => onOpen(i)}
          />
        );
      })}
    </>
  );
}

/** A single framed, softly-glowing projection of a still. */
function ArtFrame({
  src,
  position,
  onClick,
}: {
  src: string;
  position: [number, number, number];
  onClick: () => void;
}) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  const [hover, setHover] = useState(false);
  const W = 0.92;
  const H = (W * 9) / 16; // stills are 16:9
  return (
    <group
      position={position}
      rotation={[0, Math.PI / 2, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh position={[0, 0, -0.012]}>
        <boxGeometry args={[W + 0.07, H + 0.07, 0.05]} />
        <meshStandardMaterial color="#1a120c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          map={tex}
          emissive="#ffffff"
          emissiveMap={tex}
          emissiveIntensity={hover ? 0.8 : 0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * A hotspot rendered as the real item (note, mug, journal, remote). It carries a
 * faint idle glow so it's discoverable, brightens on hover, and opens on click.
 */
function Marker({
  object,
  locked,
  active,
  onHover,
  onSelect,
}: {
  object: WorldObject;
  locked: boolean;
  active: boolean;
  onHover: (obj: WorldObject | null) => void;
  onSelect: (obj: WorldObject) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const emphasized = hovered || active;
  // Locked items glow a touch cooler; the glow signals interactivity.
  const glow = emphasized ? 0.55 : 0.08;
  const emissive = locked ? "#c8899a" : "#ffcf8f";

  return (
    <group
      position={object.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
        onHover(object);
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
        onHover(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(object);
      }}
    >
      <ItemMesh item={object.item ?? "note"} emissive={emissive} glow={glow} />
    </group>
  );
}

/** Small built geometry for each interactive item kind. */
function ItemMesh({
  item,
  emissive,
  glow,
}: {
  item: ItemKind;
  emissive: string;
  glow: number;
}) {
  if (item === "mug") {
    return (
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.045, 0.1, 20]} />
          <meshStandardMaterial
            color="#e8e2d6"
            roughness={0.4}
            emissive={emissive}
            emissiveIntensity={glow}
          />
        </mesh>
        <mesh position={[0.065, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.028, 0.009, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#e8e2d6" roughness={0.4} />
        </mesh>
      </group>
    );
  }
  if (item === "journal") {
    return (
      <group rotation={[0, 0.3, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.045, 0.16]} />
          <meshStandardMaterial
            color="#5a3a28"
            roughness={0.6}
            emissive={emissive}
            emissiveIntensity={glow}
          />
        </mesh>
        <mesh position={[0.006, 0.026, 0]}>
          <boxGeometry args={[0.2, 0.012, 0.14]} />
          <meshStandardMaterial color="#e8dcc4" roughness={0.7} />
        </mesh>
        {/* bookmark ribbon */}
        <mesh position={[0.05, 0.005, 0.1]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.018, 0.008, 0.09]} />
          <meshStandardMaterial color="#7a2f3d" roughness={0.7} />
        </mesh>
      </group>
    );
  }
  if (item === "remote") {
    return (
      <mesh castShadow>
        <boxGeometry args={[0.055, 0.02, 0.17]} />
        <meshStandardMaterial
          color="#1a1a1c"
          roughness={0.4}
          emissive={emissive}
          emissiveIntensity={glow}
        />
      </mesh>
    );
  }
  // note — a sheet of paper resting on the surface
  return (
    <mesh castShadow rotation={[-Math.PI / 2, 0, 0.18]}>
      <planeGeometry args={[0.16, 0.12]} />
      <meshStandardMaterial
        color="#efe9dc"
        roughness={0.75}
        side={THREE.DoubleSide}
        emissive={emissive}
        emissiveIntensity={glow}
      />
    </mesh>
  );
}
