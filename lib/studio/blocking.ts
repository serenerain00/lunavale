/**
 * Blocking — a posable mannequin and a real camera, as data.
 *
 * WHY THIS EXISTS. Melissa, 2026-10-17: "half my time is trying to get the
 * anchor images perfect … its so hard to describe, and it takes a sec to
 * generate so im here waiting and then the result isnt usable". Words are a
 * bad way to specify an angle. A picture of a mannequin from that exact angle
 * is a good one, and ChatGPT and Gemini both follow a pose/framing reference
 * far more faithfully than they follow "three-quarter from her left, slightly
 * low". So: pose it, frame it, take the picture, hand the picture over.
 *
 * WHAT IT STILL CANNOT DO, said for the same reason lib/studio/framing.ts says
 * it: the mannequin gives the generator the angle and the body. The FACE at
 * that angle still comes from her face references. A mannequin from behind
 * plus a front-on face reference is a much better ask than words alone, but
 * it is still an ask.
 *
 * Everything here is plain numbers so it saves inside the shot recipe (as
 * `camera.blocking`, a JSON column that already exists — no migration) and so
 * the readout can be computed without a renderer.
 *
 * CONVENTIONS. Metres, Y up, a figure at rest faces +Z. Her LEFT is +X. Joint
 * rotations are Euler angles in DEGREES, applied in YXZ order for the spine
 * and head (turn first, then nod, so a turned head still nods the way a head
 * does) and XYZ for the limbs (readable in the saved JSON, and what the
 * sliders show). Limbs hang along -Y from their joint, so:
 *   shoulder / hip  X negative = swing forward,   Z = out to the side
 *   elbow           X negative = bend (forearm forward)
 *   knee            X positive = bend (shin back)
 *   neck / head     Y = turn (positive = to HER left), X = nod (positive =
 *                   chin down), Z = tilt (positive = ear toward HER right shoulder)
 */

import type { AppliedShot } from "@/lib/studio/shots";

export type Build = "woman" | "man";

export type JointId =
  | "pelvis"
  | "spine"
  | "chest"
  | "neck"
  | "head"
  | "shoulderL"
  | "elbowL"
  | "wristL"
  | "shoulderR"
  | "elbowR"
  | "wristR"
  | "hipL"
  | "kneeL"
  | "ankleL"
  | "hipR"
  | "kneeR"
  | "ankleR";

export type Vec3 = [number, number, number];

export interface BlockingFigure {
  id: string;
  /** Character id from lib/content/taxonomy, or null for a stand-in. */
  characterId: string | null;
  build: Build;
  /** World position of the pelvis. */
  position: Vec3;
  /** Degrees, Euler XYZ, per joint. Missing joints are at rest. */
  joints: Partial<Record<JointId, Vec3>>;
}

export type PropKind = "chair" | "couch" | "bed" | "table" | "counter" | "wall" | "door";

export interface BlockingProp {
  id: string;
  kind: PropKind;
  position: Vec3;
  /** Degrees about Y. */
  rotationY: number;
}

export interface Blocking {
  figures: BlockingFigure[];
  props: BlockingProp[];
  camera: { position: Vec3; target: Vec3; mm: number };
  grid: boolean;
  /** The last readout, in words — what the prompt quotes. Set on "Use this camera". */
  readout?: string;
  /** The shot preset last applied (lib/studio/shots.ts), for its words on focus. */
  shot?: AppliedShot;
}

/* ------------------------------------------------------------- skeleton -- */

/** Proportions per build. Built at these sizes; nothing is scaled at render. */
export interface Proportions {
  height: number;
  pelvisY: number;
  shoulderHalf: number;
  hipHalf: number;
  upperArm: number;
  forearm: number;
  hand: number;
  thigh: number;
  shin: number;
  /** Radii, roughly: limbs thinner on the woman, shoulders narrower. */
  limb: number;
  torso: number;
}

export const PROPORTIONS: Record<Build, Proportions> = {
  woman: {
    height: 1.68, pelvisY: 0.94, shoulderHalf: 0.175, hipHalf: 0.09,
    upperArm: 0.28, forearm: 0.24, hand: 0.17, thigh: 0.43, shin: 0.4,
    limb: 0.042, torso: 0.13,
  },
  man: {
    height: 1.83, pelvisY: 1.02, shoulderHalf: 0.215, hipHalf: 0.095,
    upperArm: 0.31, forearm: 0.27, hand: 0.19, thigh: 0.47, shin: 0.44,
    limb: 0.05, torso: 0.155,
  },
};

/** Spine segment lengths as a share of height, so both builds stay in proportion. */
export function spineOffsets(p: Proportions) {
  const k = p.height / 1.7;
  return { spine: 0.08 * k, chest: 0.2 * k, neck: 0.22 * k, head: 0.07 * k, skull: 0.11 * k };
}

/** Spine joints turn-then-nod; limbs swing-then-spread. See CONVENTIONS. */
export const JOINT_ORDER: Record<JointId, "YXZ" | "XYZ"> = {
  pelvis: "YXZ", spine: "YXZ", chest: "YXZ", neck: "YXZ", head: "YXZ",
  shoulderL: "XYZ", elbowL: "XYZ", wristL: "XYZ", shoulderR: "XYZ", elbowR: "XYZ", wristR: "XYZ",
  hipL: "XYZ", kneeL: "XYZ", ankleL: "XYZ", hipR: "XYZ", kneeR: "XYZ", ankleR: "XYZ",
};

export const JOINT_LABEL: Record<JointId, string> = {
  pelvis: "Hips (whole body)",
  spine: "Lower back",
  chest: "Chest",
  neck: "Neck",
  head: "Head",
  shoulderL: "Left shoulder",
  elbowL: "Left elbow",
  wristL: "Left wrist",
  shoulderR: "Right shoulder",
  elbowR: "Right elbow",
  wristR: "Right wrist",
  hipL: "Left hip",
  kneeL: "Left knee",
  ankleL: "Left ankle",
  hipR: "Right hip",
  kneeR: "Right knee",
  ankleR: "Right ankle",
};

/* -------------------------------------------------------------- presets -- */

type Pose = { lift: number; joints: Partial<Record<JointId, Vec3>> };

/**
 * `lift` is where the pelvis sits as a share of standing pelvis height, so a
 * preset works for both builds. Arms rest a few degrees off the body or they
 * read as glued to it.
 */
export const POSES: { id: string; label: string; pose: Pose }[] = [
  {
    id: "stand",
    label: "Standing",
    pose: { lift: 1, joints: { shoulderL: [0, 0, 6], shoulderR: [0, 0, -6], elbowL: [-8, 0, 0], elbowR: [-8, 0, 0] } },
  },
  {
    id: "relaxed",
    label: "Weight on one leg",
    pose: {
      lift: 0.99,
      joints: {
        pelvis: [0, 8, -4], chest: [0, -6, 5], head: [0, -4, -3],
        hipL: [-4, 0, 4], hipR: [6, 0, -2], kneeR: [14, 0, 0], ankleR: [-8, 0, 0],
        shoulderL: [4, 0, 7], shoulderR: [-4, 0, -9], elbowL: [-10, 0, 0], elbowR: [-14, 0, 0],
      },
    },
  },
  {
    id: "walk",
    label: "Walking",
    pose: {
      lift: 0.98,
      joints: {
        hipL: [-24, 0, 0], kneeL: [12, 0, 0], ankleL: [-6, 0, 0], hipR: [16, 0, 0], kneeR: [22, 0, 0], ankleR: [10, 0, 0],
        shoulderL: [18, 0, 5], shoulderR: [-20, 0, -5], elbowL: [-12, 0, 0], elbowR: [-28, 0, 0],
        chest: [0, 5, 0],
      },
    },
  },
  {
    id: "sit",
    label: "Sitting (chair)",
    pose: {
      lift: 0.6,
      joints: {
        hipL: [-88, 0, 3], hipR: [-88, 0, -3], kneeL: [86, 0, 0], kneeR: [86, 0, 0],
        shoulderL: [-28, 0, 8], shoulderR: [-28, 0, -8], elbowL: [-48, 0, 0], elbowR: [-48, 0, 0],
        spine: [4, 0, 0],
      },
    },
  },
  {
    id: "sit-back",
    label: "Sitting back (couch)",
    pose: {
      lift: 0.5,
      joints: {
        pelvis: [-18, 0, 0], spine: [-4, 0, 0], chest: [8, 0, 0], head: [10, 0, 0],
        hipL: [-62, 0, 6], hipR: [-62, 0, -6], kneeL: [72, 0, 0], kneeR: [72, 0, 0],
        shoulderL: [-12, 0, 16], shoulderR: [-12, 0, -16], elbowL: [-40, 0, 0], elbowR: [-40, 0, 0],
      },
    },
  },
  {
    id: "floor-knees",
    label: "On the floor, knees up",
    pose: {
      lift: 0.14,
      joints: {
        spine: [10, 0, 0], chest: [6, 0, 0],
        hipL: [-110, 0, 4], hipR: [-110, 0, -4], kneeL: [130, 0, 0], kneeR: [130, 0, 0],
        shoulderL: [-52, 0, 8], shoulderR: [-52, 0, -8], elbowL: [-28, 0, 0], elbowR: [-28, 0, 0],
      },
    },
  },
  {
    id: "kneel",
    label: "Kneeling",
    pose: {
      lift: 0.58,
      joints: {
        hipL: [-4, 0, 3], hipR: [-4, 0, -3], kneeL: [92, 0, 0], kneeR: [92, 0, 0], ankleL: [40, 0, 0], ankleR: [40, 0, 0],
        shoulderL: [-6, 0, 8], shoulderR: [-6, 0, -8], elbowL: [-20, 0, 0], elbowR: [-20, 0, 0],
      },
    },
  },
  {
    id: "lie-back",
    label: "Lying on her back",
    pose: {
      lift: 0.13,
      joints: {
        pelvis: [-90, 0, 0], head: [-6, 0, 0],
        shoulderL: [0, 0, 14], shoulderR: [0, 0, -14], elbowL: [-10, 0, 0], elbowR: [-10, 0, 0],
        ankleL: [30, 0, 0], ankleR: [30, 0, 0],
      },
    },
  },
  {
    id: "lie-side",
    label: "Lying on her side",
    pose: {
      lift: 0.19,
      joints: {
        // Tipped over onto her right side, still facing +Z.
        pelvis: [0, 0, 90], head: [0, 0, -12],
        hipL: [-30, 0, 0], kneeL: [40, 0, 0], hipR: [-15, 0, 0], kneeR: [25, 0, 0],
        shoulderR: [-80, 0, 0], elbowR: [-40, 0, 0], shoulderL: [-20, 0, 10], elbowL: [-30, 0, 0],
      },
    },
  },
];

/** A figure in a named pose, at a place on the floor, facing `yaw` degrees. */
export function posedFigure(
  base: Omit<BlockingFigure, "joints" | "position">,
  poseId: string,
  at: { x: number; z: number; yaw: number },
): BlockingFigure {
  const pose = (POSES.find((p) => p.id === poseId) ?? POSES[0]).pose;
  const pr = PROPORTIONS[base.build];
  const joints: Partial<Record<JointId, Vec3>> = {};
  for (const [k, v] of Object.entries(pose.joints)) joints[k as JointId] = [...v] as Vec3;
  const pel = joints.pelvis ?? [0, 0, 0];
  joints.pelvis = [pel[0], pel[1] + at.yaw, pel[2]];
  return { ...base, joints, position: [at.x, pr.pelvisY * pose.lift, at.z] };
}

/** Swap left and right — for when the pose is right and the side is wrong. */
export function mirrorFigure(f: BlockingFigure): BlockingFigure {
  const swap: Record<string, string> = {
    shoulderL: "shoulderR", elbowL: "elbowR", wristL: "wristR",
    hipL: "hipR", kneeL: "kneeR", ankleL: "ankleR",
  };
  for (const [a, b] of Object.entries(swap)) swap[b] = a;
  const joints: Partial<Record<JointId, Vec3>> = {};
  for (const [k, v] of Object.entries(f.joints)) {
    if (!v) continue;
    const to = (swap[k] ?? k) as JointId;
    // Mirroring across the body's own YZ plane flips the sign of Y and Z turns.
    joints[to] = k === "pelvis" ? [v[0], v[1], -v[2]] : [v[0], -v[1], -v[2]];
  }
  return { ...f, joints };
}

/* ---------------------------------------------------------------- props -- */

export const PROPS: Record<PropKind, { label: string; note: string }> = {
  chair: { label: "Chair", note: "Seat at 45cm" },
  couch: { label: "Couch", note: "Seat at 42cm, 2m long" },
  bed: { label: "Bed", note: "Queen, mattress top at 60cm" },
  table: { label: "Table", note: "75cm high" },
  counter: { label: "Counter / bar", note: "92cm high" },
  wall: { label: "Wall", note: "3m wide, 2.6m high" },
  door: { label: "Doorway", note: "Frame, 2.1m" },
};

/* --------------------------------------------------------------- colours -- */

/**
 * Each figure gets a clearly different tone so the prompt can say which is
 * who ("the pale figure is Luna, the dark one is Tyson"). Tones, not hues:
 * a red mannequin leaks red into the image.
 */
export const FIGURE_TONES = [
  { name: "pale", hex: "#d8c9b2" },
  { name: "dark", hex: "#5f4c3e" },
  { name: "gray-blue", hex: "#8a98a6" },
];

export function defaultBuild(characterId: string | null): Build {
  // Women in the published cast, from lib/content/characters.ts. Anyone else
  // defaults to a man's build; the toggle is one click either way.
  return characterId && ["luna", "cathy", "avery"].includes(characterId) ? "woman" : "man";
}

/* --------------------------------------------------------------- readout -- */

/** Full-frame lens → field of view across the LONG side of the frame. */
/**
 * The shot frame inside a W×H stage, centered, as large as fits. CSS px. The
 * stage is wider than the shot (Blocking's viewfinder); this is the shot.
 */
export function frameRect(W: number, H: number, aspect: number) {
  if (W <= 0 || H <= 0) return { x: 0, y: 0, w: W, h: H };
  const w = Math.min(W, H * aspect);
  const h = w / aspect;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

export function fovFor(mm: number, aspect: number): { hfov: number; vfov: number } {
  const longSide = 2 * Math.atan(18 / mm);
  const rad =
    aspect >= 1
      ? { h: longSide, v: 2 * Math.atan(Math.tan(longSide / 2) / aspect) }
      : { v: longSide, h: 2 * Math.atan(Math.tan(longSide / 2) * aspect) };
  return { hfov: (rad.h * 180) / Math.PI, vfov: (rad.v * 180) / Math.PI };
}

/**
 * Signed horizontal angle, degrees, from a facing direction to the camera.
 * Negative = camera on HER left, matching lib/studio/vocab azimuths.
 */
export function azimuthDeg(forward: { x: number; z: number }, toCamera: { x: number; z: number }): number {
  const dot = forward.x * toCamera.x + forward.z * toCamera.z;
  const crossY = forward.z * toCamera.x - forward.x * toCamera.z;
  return (-Math.atan2(crossY, dot) * 180) / Math.PI;
}

/** How an azimuth reads in words, finer than the eight vocab ids. */
export function azimuthWords(deg: number, pron: "her" | "his" = "her"): string {
  const a = Math.abs(deg);
  const side = deg < 0 ? `${pron} left` : `${pron} right`;
  if (a < 12) return "straight on";
  if (a < 30) return `slightly to ${side}`;
  if (a < 60) return `three-quarter from ${side}`;
  if (a < 75) return `between three-quarter and profile, from ${side}`;
  if (a < 105) return `full profile from ${side}`;
  if (a < 160) return `three-quarter behind, over ${side} shoulder`;
  return "from directly behind";
}
