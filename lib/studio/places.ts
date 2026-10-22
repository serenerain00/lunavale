/**
 * Places for Blocking: the furniture, the people on it, and a first camera.
 *
 * Melissa, 2026-10-22, after the shot presets: "oh ok so i still have to move
 * the models", then "yes do couch, table, bar, car, and bed". Angle presets
 * frame people where they are; these put them somewhere first: seated on
 * the couch, across a table, on two stools at a bar, in the front of a car,
 * in bed. Furniture replaces whatever was on the stage, and the heads turn to
 * meet each other's eyes.
 *
 * After a place, the shot presets run with "Arrange the people" OFF, so an
 * OTS at the table stays at the table instead of standing everyone up.
 *
 * Measurements are the props' own (BlockingStage PropMesh): couch seat 42cm,
 * chair 45cm, table 75cm, counter 92cm, stool 76cm, car seat 50cm, mattress
 * 60cm. A seated pelvis sits about 9cm above the seat it is on.
 */
import {
  POSES,
  mirrorFigure,
  type Blocking,
  type BlockingFigure,
  type BlockingProp,
  type JointId,
  type PropKind,
  type Vec3,
} from "@/lib/studio/blocking";
import { bodyOf } from "@/lib/studio/shots";

export type PlaceId = "couch" | "table" | "bar" | "car" | "bed";

interface Seat {
  x: number;
  /** Pelvis height. */
  y: number;
  z: number;
  /** Degrees; 0 faces +Z. */
  yaw: number;
  pose: string;
  /** Extra joints on top of the pose. */
  joints?: Partial<Record<JointId, Vec3>>;
  /** Look at this seat's eyes; null looks straight ahead. */
  look?: number | null;
  /** Set the head by hand instead (lying down, where looking is already done by the body). */
  head?: { turn: number; nod: number };
  /** Use the pose's mirror image (lying on the other side). */
  mirror?: boolean;
}

export interface PlaceSetting {
  id: string;
  place: PlaceId;
  label: string;
  hint: string;
  props: { kind: PropKind; x: number; z: number; rotY: number }[];
  seats: Seat[];
  camera: Blocking["camera"];
}

export const PLACE_LABELS: Record<PlaceId, string> = {
  couch: "Couch",
  table: "Table",
  bar: "Bar",
  car: "Car",
  bed: "Bed",
};

const COUCH_Y = 0.51;
const CHAIR_Y = 0.55;
const STOOL_Y = 0.85;
const CAR_Y = 0.59;
const BED = 0.6;

/** Forearms on a table or a bar. */
const ELBOWS_ON: Partial<Record<JointId, Vec3>> = {
  shoulderL: [-48, 0, 10], shoulderR: [-48, 0, -10], elbowL: [-72, 0, 0], elbowR: [-72, 0, 0],
};

export const PLACES: PlaceSetting[] = [
  // ─── Couch: the couch at the origin, its back to -Z.
  {
    id: "couch-talk", place: "couch", label: "Turned toward each other", hint: "Two on the couch, angled in, talking.",
    props: [{ kind: "couch", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: -0.42, y: COUCH_Y, z: -0.06, yaw: 28, pose: "sit-back", look: 1 },
      { x: 0.42, y: COUCH_Y, z: -0.06, yaw: -28, pose: "sit-back", look: 0 },
    ],
    camera: { position: [0.3, 1.1, 2.7], target: [0, 0.85, -0.1], mm: 35 },
  },
  {
    id: "couch-side", place: "couch", label: "Side by side", hint: "Two on the couch, facing front. TV, silence.",
    props: [{ kind: "couch", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: -0.42, y: COUCH_Y, z: -0.08, yaw: 0, pose: "sit-back", look: null },
      { x: 0.42, y: COUCH_Y, z: -0.08, yaw: 0, pose: "sit-back", look: null },
    ],
    camera: { position: [0, 1.05, 2.7], target: [0, 0.85, -0.1], mm: 35 },
  },
  {
    id: "couch-three", place: "couch", label: "Three on the couch", hint: "Middle one faces front, the others turn in.",
    props: [{ kind: "couch", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: -0.6, y: COUCH_Y, z: -0.06, yaw: 22, pose: "sit-back", look: 1 },
      { x: 0, y: COUCH_Y, z: -0.08, yaw: 0, pose: "sit-back", look: null },
      { x: 0.6, y: COUCH_Y, z: -0.06, yaw: -22, pose: "sit-back", look: 1 },
    ],
    camera: { position: [0, 1.1, 3.0], target: [0, 0.85, -0.1], mm: 32 },
  },

  // ─── Table: 1.4m long along X, chairs on its long sides and at the end.
  {
    id: "table-across", place: "table", label: "Across the table", hint: "Face to face, a table between them.",
    props: [{ kind: "table", x: 0, z: 0, rotY: 0 }, { kind: "chair", x: 0, z: -0.72, rotY: 0 }, { kind: "chair", x: 0, z: 0.72, rotY: 180 }],
    seats: [
      { x: 0, y: CHAIR_Y, z: -0.76, yaw: 0, pose: "sit", joints: ELBOWS_ON, look: 1 },
      { x: 0, y: CHAIR_Y, z: 0.76, yaw: 180, pose: "sit", joints: ELBOWS_ON, look: 0 },
    ],
    camera: { position: [2.5, 1.15, 0.2], target: [0, 1.0, 0], mm: 35 },
  },
  {
    id: "table-corner", place: "table", label: "Around the corner", hint: "One on the side, one at the end. Closer, less formal.",
    props: [{ kind: "table", x: 0, z: 0, rotY: 0 }, { kind: "chair", x: 0.35, z: -0.72, rotY: 0 }, { kind: "chair", x: 0.98, z: 0, rotY: -90 }],
    seats: [
      { x: 0.35, y: CHAIR_Y, z: -0.76, yaw: 0, pose: "sit", joints: ELBOWS_ON, look: 1 },
      { x: 1.02, y: CHAIR_Y, z: 0, yaw: -90, pose: "sit", joints: ELBOWS_ON, look: 0 },
    ],
    camera: { position: [-1.0, 1.25, 2.1], target: [0.5, 1.0, -0.3], mm: 35 },
  },
  {
    id: "table-three", place: "table", label: "Three at the table", hint: "Two across, one at the end.",
    props: [
      { kind: "table", x: 0, z: 0, rotY: 0 }, { kind: "chair", x: 0, z: -0.72, rotY: 0 },
      { kind: "chair", x: 0, z: 0.72, rotY: 180 }, { kind: "chair", x: 0.98, z: 0, rotY: -90 },
    ],
    seats: [
      { x: 0, y: CHAIR_Y, z: -0.76, yaw: 0, pose: "sit", joints: ELBOWS_ON, look: 2 },
      { x: 0, y: CHAIR_Y, z: 0.76, yaw: 180, pose: "sit", joints: ELBOWS_ON, look: 0 },
      { x: 1.02, y: CHAIR_Y, z: 0, yaw: -90, pose: "sit", joints: ELBOWS_ON, look: 0 },
    ],
    camera: { position: [-2.3, 1.35, 1.3], target: [0.2, 1.0, 0], mm: 28 },
  },

  // ─── Bar: the counter at the origin, stools on the room side (+Z), so
  // the camera starts behind the bar looking out at them.
  {
    id: "bar-talk", place: "bar", label: "Turned toward each other", hint: "Two on stools, angled in, elbows on the bar.",
    props: [{ kind: "counter", x: 0, z: 0, rotY: 0 }, { kind: "stool", x: -0.4, z: 0.66, rotY: 0 }, { kind: "stool", x: 0.4, z: 0.66, rotY: 0 }],
    seats: [
      { x: -0.4, y: STOOL_Y, z: 0.7, yaw: 150, pose: "sit", look: 1 },
      { x: 0.4, y: STOOL_Y, z: 0.7, yaw: -150, pose: "sit", look: 0 },
    ],
    camera: { position: [0.2, 1.4, -2.2], target: [0, 1.2, 0.65], mm: 35 },
  },
  {
    id: "bar-side", place: "bar", label: "Side by side", hint: "Both facing the bar, heads turned to talk.",
    props: [{ kind: "counter", x: 0, z: 0, rotY: 0 }, { kind: "stool", x: -0.36, z: 0.66, rotY: 0 }, { kind: "stool", x: 0.36, z: 0.66, rotY: 0 }],
    seats: [
      { x: -0.36, y: STOOL_Y, z: 0.7, yaw: 180, pose: "sit", joints: ELBOWS_ON, look: 1 },
      { x: 0.36, y: STOOL_Y, z: 0.7, yaw: 180, pose: "sit", joints: ELBOWS_ON, look: 0 },
    ],
    camera: { position: [0, 1.4, -2.2], target: [0, 1.2, 0.65], mm: 35 },
  },
  {
    id: "bar-three", place: "bar", label: "Three at the bar", hint: "A row of stools, the middle one between.",
    props: [
      { kind: "counter", x: 0, z: 0, rotY: 0 }, { kind: "stool", x: -0.62, z: 0.66, rotY: 0 },
      { kind: "stool", x: 0, z: 0.66, rotY: 0 }, { kind: "stool", x: 0.62, z: 0.66, rotY: 0 },
    ],
    seats: [
      { x: -0.62, y: STOOL_Y, z: 0.7, yaw: 160, pose: "sit", look: 1 },
      { x: 0, y: STOOL_Y, z: 0.7, yaw: 180, pose: "sit", joints: ELBOWS_ON, look: 0 },
      { x: 0.62, y: STOOL_Y, z: 0.7, yaw: -160, pose: "sit", look: 1 },
    ],
    camera: { position: [0, 1.45, -2.6], target: [0, 1.2, 0.65], mm: 30 },
  },

  // ─── Car: facing +Z, the driver on the car's left (+X). The first person
  // drives; the camera starts on the hood, through the windshield.
  {
    id: "car-driving", place: "car", label: "Driving", hint: "Both facing the road. Through the windshield.",
    props: [{ kind: "car", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: 0.37, y: CAR_Y, z: -0.1, yaw: 0, pose: "drive", look: null },
      { x: -0.37, y: CAR_Y, z: -0.1, yaw: 0, pose: "passenger", look: null },
    ],
    camera: { position: [0, 1.15, 2.2], target: [0, 1.05, -0.15], mm: 32 },
  },
  {
    id: "car-talking", place: "car", label: "Driving and talking", hint: "Driver's eyes on the road, passenger turned to them.",
    props: [{ kind: "car", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: 0.37, y: CAR_Y, z: -0.1, yaw: 0, pose: "drive", look: null },
      { x: -0.37, y: CAR_Y, z: -0.1, yaw: 18, pose: "passenger", look: 0 },
    ],
    camera: { position: [0, 1.15, 2.2], target: [0, 1.05, -0.15], mm: 32 },
  },
  {
    id: "car-parked", place: "car", label: "Parked, facing each other", hint: "Engine off, both turned in. The talk in the car.",
    props: [{ kind: "car", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: 0.37, y: CAR_Y, z: -0.1, yaw: -22, pose: "passenger", look: 1 },
      { x: -0.37, y: CAR_Y, z: -0.1, yaw: 22, pose: "passenger", look: 0 },
    ],
    camera: { position: [0, 1.15, 2.2], target: [0, 1.05, -0.15], mm: 32 },
  },

  // ─── Bed: headboard at -Z, mattress top at 60cm, lying with heads to the pillows.
  {
    id: "bed-back", place: "bed", label: "Lying side by side", hint: "Both on their backs, heads turned to each other.",
    props: [{ kind: "bed", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: -0.36, y: BED + 0.12, z: 0.12, yaw: 0, pose: "lie-back", head: { turn: 35, nod: 0 } },
      { x: 0.36, y: BED + 0.12, z: 0.12, yaw: 0, pose: "lie-back", head: { turn: -35, nod: 0 } },
    ],
    camera: { position: [1.7, 1.9, 0.9], target: [0, 0.75, -0.35], mm: 35 },
  },
  {
    id: "bed-facing", place: "bed", label: "Facing each other", hint: "Both on their sides, face to face on the pillows.",
    props: [{ kind: "bed", x: 0, z: 0, rotY: 0 }],
    seats: [
      { x: -0.24, y: BED + 0.17, z: 0.15, yaw: 90, pose: "lie-side", mirror: true, head: { turn: 0, nod: 0 } },
      { x: 0.24, y: BED + 0.17, z: 0.15, yaw: -90, pose: "lie-side", head: { turn: 0, nod: 0 } },
    ],
    // From high over the foot of the bed, looking down the pillows: both
    // faces in profile. From the foot at bed height it is all legs.
    camera: { position: [0, 2.3, 0.9], target: [0, 0.78, -0.6], mm: 35 },
  },
  {
    id: "bed-sitting", place: "bed", label: "Sitting up in bed", hint: "Backs to the headboard, legs out, talking.",
    props: [{ kind: "bed", x: 0, z: 0, rotY: 0 }],
    seats: [
      // Just in front of the pillows (which end at -0.56), leaning back on them.
      { x: -0.36, y: BED + 0.08, z: -0.45, yaw: 0, pose: "sit-legs-out", look: 1 },
      { x: 0.36, y: BED + 0.08, z: -0.45, yaw: 0, pose: "sit-legs-out", look: 0 },
    ],
    camera: { position: [0.2, 1.35, 2.4], target: [0, 1.05, -0.55], mm: 35 },
  },
];

/**
 * Put a place on the stage: the furniture (replacing what was there), the
 * first people seated in it, anyone else behind the camera, and the camera.
 * `figures` must hold at least `setting.seats.length` people.
 */
export function applyPlace(
  setting: PlaceSetting,
  figures: BlockingFigure[],
): { figures: BlockingFigure[]; props: BlockingProp[]; camera: Blocking["camera"] } {
  const n = setting.seats.length;
  let figs = figures.map((f, i) => (i < n ? seat(f, setting.seats[i]) : f));

  // Eyes meet: each head turns and nods toward the other's eyes.
  figs = figs.map((f, i) => {
    const s = setting.seats[i];
    if (i >= n || !s) return f;
    if (s.head) return withHead(f, s.head.turn, s.head.nod);
    if (s.look == null) return withHead(f, 0, leanNod(f));
    const me = bodyOf(f).eye3;
    const them = bodyOf(figs[s.look]).eye3;
    const yaw = (f.joints.pelvis ?? [0, 0, 0])[1];
    const dx = them[0] - me[0];
    const dz = them[2] - me[2];
    const turn = wrap(deg(Math.atan2(dx, dz)) - yaw);
    const nod = deg(Math.atan2(-(them[1] - me[1]), Math.hypot(dx, dz))) + leanNod(f);
    return withHead(f, clamp(turn, -85, 85), clamp(nod, -45, 45));
  });

  const c = setting.camera;
  const back = norm2(c.position[0] - c.target[0], c.position[2] - c.target[2]);
  figs = figs.map((f, i) => {
    if (i < n) return f;
    const k = 1.6 + 0.8 * (i - n);
    return { ...f, position: [c.position[0] + back.x * k, f.position[1], c.position[2] + back.z * k] as Vec3 };
  });

  const props: BlockingProp[] = setting.props.map((p) => ({
    id: crypto.randomUUID(),
    kind: p.kind,
    position: [p.x, 0, p.z],
    rotationY: p.rotY,
  }));

  return { figures: figs, props, camera: { position: [...c.position] as Vec3, target: [...c.target] as Vec3, mm: c.mm } };
}

function seat(f: BlockingFigure, s: Seat): BlockingFigure {
  const pose = (POSES.find((p) => p.id === s.pose) ?? POSES[0]).pose;
  const joints: Partial<Record<JointId, Vec3>> = {};
  for (const [k, v] of Object.entries({ ...pose.joints, ...(s.joints ?? {}) })) joints[k as JointId] = [...v] as Vec3;
  let out: BlockingFigure = { ...f, joints, position: [s.x, s.y, s.z] };
  if (s.mirror) out = mirrorFigure(out);
  const pel = out.joints.pelvis ?? [0, 0, 0];
  out.joints.pelvis = [pel[0], pel[1] + s.yaw, pel[2]];
  return out;
}

/** Leaning back (a couch, a car seat) tips the face up; this brings it level again. */
function leanNod(f: BlockingFigure): number {
  const x = (j: JointId) => (f.joints[j] ?? [0, 0, 0])[0];
  return -(x("pelvis") + x("spine") + x("chest"));
}

/** The same split across neck and head that the builder's head sliders use. */
function withHead(f: BlockingFigure, turn: number, nod: number): BlockingFigure {
  return {
    ...f,
    joints: {
      ...f.joints,
      neck: [nod * 0.35, turn * 0.4, 0],
      head: [nod * 0.65, turn * 0.6, 0],
    },
  };
}

const deg = (r: number) => (r * 180) / Math.PI;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));
const wrap = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;
function norm2(x: number, z: number) {
  const l = Math.hypot(x, z) || 1;
  return { x: x / l, z: z / l };
}
