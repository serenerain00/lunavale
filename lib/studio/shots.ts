/**
 * Shot presets for Blocking: the coverage a film actually gets, one click each.
 *
 * Melissa, 2026-10-22: "can we build in some presets … common, most used scene
 * angles from films … solo angles, closeups, closeups with someone blurred
 * foreground like OTS shots, 2shots, all variations, 3 shots all variations,
 * wide 3 and 2 shots … i wanna make it easier to pick what angles i need
 * instead of having to adjust the models all the time".
 *
 * A preset is three things: where the people stand (a layout, optional),
 * where the camera goes and what it frames (computed from where the people
 * actually are), and what the picture cannot say on its own. The mannequin
 * render has no depth of field, so "his shoulder soft in the foreground"
 * travels as words on the readout instead (`focus`).
 *
 * THE CAMERA IS SOLVED, NOT STORED. Each preset names a shot size and a lens;
 * the distance follows from the size, the lens and the frame's aspect, so a
 * close-up is a close-up in 9:16 and in 2.39:1 alike. Over-the-shoulder
 * shots do it the other way round, the way a camera crew does: the camera
 * goes just behind the near shoulder and the LENS is chosen to make the size.
 *
 * THE LINE. Two-person coverage keeps the camera on one side of the line
 * between them (the 180° rule), so an OTS on her and an OTS on him cut
 * together. Arranged, that side is the front of the stage (+Z); on people she
 * has placed herself, it is whichever side the camera is on now.
 *
 * Pure numbers and no renderer, like lib/studio/blocking.ts. Body sizes come
 * from PROPORTIONS, so a seated figure gets a seated eyeline.
 */
import {
  PROPORTIONS,
  fovFor,
  spineOffsets,
  type Blocking,
  type BlockingFigure,
  type JointId,
  type Vec3,
} from "@/lib/studio/blocking";

export type ShotGroup = "solo" | "two" | "three";
type Size = "ecu" | "cu" | "mcu" | "ms" | "mfs" | "fs" | "ws" | "ews";
type Height = "eye" | "low" | "high" | "overhead" | "floor";
type LayoutId = "facing" | "close" | "side" | "vee" | "depth2" | "circle" | "line" | "arc" | "depth3" | "twoAndOne";

type CameraSpec =
  /** On role 0 alone. `az` as the compass: 0 front, negative = her left. */
  | { kind: "single"; size: Size; az: number; height?: Height }
  /** Everyone in the preset, from the front of the group, turned `turn`° toward role 0. */
  | { kind: "group"; size: Size; turn?: number; height?: Height }
  /** On role 0 past role 1's shoulder. `tight` = a dirty close-up, `clean` = no shoulder at all. */
  | { kind: "ots"; size: Size; style: "ots" | "dirty" | "clean" }
  /** Through role 1's eyes, at role 0. */
  | { kind: "pov" }
  /** Roles 1 and 2 past role 0's shoulder. */
  | { kind: "otsGroup"; size: Size };

export interface ShotPreset {
  id: string;
  group: ShotGroup;
  label: string;
  /** What it is for, in a few words: shown under the label. */
  hint: string;
  /** People it frames. Solo presets frame whoever is selected and move nobody. */
  people: 1 | 2 | 3;
  layout?: LayoutId;
  camera: CameraSpec;
  mm: number;
  /**
   * Which person the variants are about, in words: "on" (a close-up ON her),
   * "over" (over HIS shoulder). Absent = one button, no variants.
   */
  variants?: "on" | "over";
  /** Arranged, the variant's person takes the lead spot (the front one in depth). */
  variantMoves?: boolean;
  /** What the picture cannot show. {0} {1} {2} are the people by role. */
  focus?: string;
}

/** On the blocking after a preset, until another or "clear": the readout quotes `focus`. */
export interface AppliedShot {
  id: string;
  label: string;
  /** Figure ids by role, for {0} {1} {2} in `focus`. */
  roles: string[];
  focus?: string;
}

/* ------------------------------------------------------------- presets -- */

const SHALLOW = "Shallow depth of field; the background falls away soft.";

export const SHOT_PRESETS: ShotPreset[] = [
  // ─── Solo: on whoever is selected. Nobody moves.
  { id: "ews", group: "solo", people: 1, label: "Extreme wide", hint: "Tiny in the place. Establishing, isolation.", camera: { kind: "single", size: "ews", az: 20 }, mm: 24 },
  { id: "ws", group: "solo", people: 1, label: "Wide", hint: "Whole body and the room around it.", camera: { kind: "single", size: "ws", az: 20 }, mm: 28 },
  { id: "fs", group: "solo", people: 1, label: "Full shot", hint: "Head to toe, filling the frame.", camera: { kind: "single", size: "fs", az: 15 }, mm: 35 },
  { id: "mfs", group: "solo", people: 1, label: "Medium full (cowboy)", hint: "Knees up. Body language and stance.", camera: { kind: "single", size: "mfs", az: 15 }, mm: 40 },
  { id: "ms", group: "solo", people: 1, label: "Medium", hint: "Waist up. The workhorse.", camera: { kind: "single", size: "ms", az: 20 }, mm: 50 },
  { id: "mcu", group: "solo", people: 1, label: "Medium close-up", hint: "Chest up. Dialogue.", camera: { kind: "single", size: "mcu", az: 25 }, mm: 65, focus: SHALLOW },
  { id: "cu", group: "solo", people: 1, label: "Close-up", hint: "Face and a little shoulder, just off the lens.", camera: { kind: "single", size: "cu", az: 25 }, mm: 85, focus: SHALLOW },
  { id: "cu-front", group: "solo", people: 1, label: "Close-up, straight on", hint: "Square to the lens. Confrontation, confession.", camera: { kind: "single", size: "cu", az: 0 }, mm: 85, focus: SHALLOW },
  { id: "cu-34", group: "solo", people: 1, label: "Close-up, three-quarter", hint: "The classic portrait angle.", camera: { kind: "single", size: "cu", az: 45 }, mm: 85, focus: SHALLOW },
  { id: "cu-profile", group: "solo", people: 1, label: "Profile close-up", hint: "Side on. Looking at something, or away.", camera: { kind: "single", size: "cu", az: 90 }, mm: 85, focus: SHALLOW },
  { id: "ecu", group: "solo", people: 1, label: "Extreme close-up", hint: "Eyes. The thing she will not say.", camera: { kind: "single", size: "ecu", az: 10 }, mm: 100, focus: "Very shallow depth of field; only the eyes are sharp." },
  { id: "low", group: "solo", people: 1, label: "Low angle", hint: "Looking up at them. Power, threat.", camera: { kind: "single", size: "ms", az: 20, height: "low" }, mm: 35 },
  { id: "high", group: "solo", people: 1, label: "High angle", hint: "Looking down on them. Small, exposed.", camera: { kind: "single", size: "ms", az: 20, height: "high" }, mm: 35 },
  { id: "overhead", group: "solo", people: 1, label: "Overhead", hint: "Straight down. Lying in bed, on the floor.", camera: { kind: "single", size: "fs", az: 0, height: "overhead" }, mm: 28 },
  { id: "back", group: "solo", people: 1, label: "From behind", hint: "Back of the head, looking where they look.", camera: { kind: "single", size: "ms", az: 180 }, mm: 50 },
  { id: "back-34", group: "solo", people: 1, label: "Three-quarter back", hint: "Over their own shoulder, cheek just visible.", camera: { kind: "single", size: "mcu", az: 145 }, mm: 50, focus: SHALLOW },

  // ─── Two: the first two people. Arranged unless "Arrange the people" is off.
  { id: "2-5050", group: "two", people: 2, layout: "facing", label: "Two-shot, 50/50", hint: "Facing each other, both in profile. Even.", camera: { kind: "group", size: "ms" }, mm: 40 },
  { id: "2-wide", group: "two", people: 2, layout: "facing", label: "Wide two-shot", hint: "Both, head to toe, with the room. Sets geography.", camera: { kind: "group", size: "ws" }, mm: 28 },
  { id: "2-fav", group: "two", people: 2, layout: "facing", variants: "on", label: "Two-shot, favoring", hint: "Facing each other, one face more open to us.", camera: { kind: "group", size: "ms", turn: 35 }, mm: 40 },
  { id: "2-side", group: "two", people: 2, layout: "side", label: "Side by side", hint: "Both facing us. A walk, a car, a bar.", camera: { kind: "group", size: "ms" }, mm: 40 },
  { id: "2-side-wide", group: "two", people: 2, layout: "side", label: "Side by side, full", hint: "Both facing us, head to toe.", camera: { kind: "group", size: "fs" }, mm: 35 },
  { id: "2-vee", group: "two", people: 2, layout: "vee", label: "Open two-shot (V)", hint: "Angled toward each other and the lens. Stage-style.", camera: { kind: "group", size: "mfs" }, mm: 35 },
  { id: "2-close", group: "two", people: 2, layout: "close", label: "Tight two-shot", hint: "Close together, both faces. Intimacy.", camera: { kind: "group", size: "mcu" }, mm: 65, focus: SHALLOW },
  { id: "2-depth", group: "two", people: 2, layout: "depth2", variants: "on", variantMoves: true, label: "Two-shot in depth", hint: "One near the lens, one behind. Both face us.", camera: { kind: "group", size: "ms" }, mm: 35, focus: "{0} in the foreground is in focus; {1}, behind, is slightly soft." },
  { id: "2-ots", group: "two", people: 2, layout: "facing", variants: "on", label: "Over-the-shoulder", hint: "On one, past the other's shoulder.", camera: { kind: "ots", size: "mcu", style: "ots" }, mm: 50, focus: "Shallow depth of field: {1}'s shoulder and the back of {1}'s head fill the near edge of the frame, soft and out of focus; {0} is sharp." },
  { id: "2-dirty", group: "two", people: 2, layout: "facing", variants: "on", label: "Dirty close-up", hint: "Close-up with a blurred sliver of the other.", camera: { kind: "ots", size: "cu", style: "dirty" }, mm: 85, focus: "Very shallow depth of field: a soft, out-of-focus sliver of {1}'s shoulder at the edge of the frame; {0}'s eyes are sharp." },
  { id: "2-clean", group: "two", people: 2, layout: "facing", variants: "on", label: "Clean single", hint: "Close-up from beside the other, them out of frame.", camera: { kind: "ots", size: "cu", style: "clean" }, mm: 85, focus: "{0} alone in frame, looking just past the lens at {1}, who is off-screen beside the camera. Shallow depth of field." },
  { id: "2-pov", group: "two", people: 2, layout: "facing", variants: "on", label: "Point of view", hint: "What the other one sees.", camera: { kind: "pov" }, mm: 35, focus: "Point of view: exactly what {1} sees, looking at {0}." },
  { id: "2-low", group: "two", people: 2, layout: "facing", label: "Low two-shot", hint: "Both, from below. Tension.", camera: { kind: "group", size: "ms", height: "low" }, mm: 28 },
  { id: "2-high", group: "two", people: 2, layout: "facing", label: "High two-shot", hint: "Both, from above.", camera: { kind: "group", size: "fs", height: "high" }, mm: 28 },
  { id: "2-overhead", group: "two", people: 2, layout: "close", label: "Overhead two-shot", hint: "Straight down on both. Bed, floor.", camera: { kind: "group", size: "fs", height: "overhead" }, mm: 28 },

  // ─── Three: the first three people.
  { id: "3-wide", group: "three", people: 3, layout: "circle", label: "Wide three-shot", hint: "In a loose circle, head to toe, with the room.", camera: { kind: "group", size: "ws" }, mm: 28 },
  { id: "3-medium", group: "three", people: 3, layout: "circle", label: "Three-shot, conversation", hint: "In a loose circle, waist up.", camera: { kind: "group", size: "ms" }, mm: 35 },
  { id: "3-fav", group: "three", people: 3, layout: "circle", variants: "on", label: "Three-shot, favoring", hint: "The circle, turned toward one face.", camera: { kind: "group", size: "ms", turn: 35 }, mm: 35 },
  { id: "3-line", group: "three", people: 3, layout: "line", label: "Three across", hint: "In a row, all facing us. Waist up.", camera: { kind: "group", size: "ms" }, mm: 35 },
  { id: "3-line-wide", group: "three", people: 3, layout: "line", label: "Three across, full", hint: "In a row, head to toe.", camera: { kind: "group", size: "fs" }, mm: 28 },
  { id: "3-arc", group: "three", people: 3, layout: "arc", label: "Three in an arc", hint: "Slight curve toward the lens, middle one leads.", camera: { kind: "group", size: "mfs" }, mm: 35 },
  { id: "3-ots", group: "three", people: 3, layout: "twoAndOne", variants: "over", variantMoves: true, label: "Over-the-shoulder three-shot", hint: "Two faces, past the third one's shoulder.", camera: { kind: "otsGroup", size: "ms" }, mm: 40, focus: "Shallow depth of field: {0}'s shoulder and the back of {0}'s head in the near foreground, soft and out of focus; {1} and {2} are sharp." },
  { id: "3-depth", group: "three", people: 3, layout: "depth3", label: "Three in depth", hint: "Staggered front to back, all facing us.", camera: { kind: "group", size: "mfs" }, mm: 35, focus: "Deep focus: all three are sharp." },
  { id: "3-high", group: "three", people: 3, layout: "circle", label: "High three-shot", hint: "The circle from above.", camera: { kind: "group", size: "fs", height: "high" }, mm: 24 },
];

/* -------------------------------------------------------------- layouts -- */

type Spot = { x: number; z: number; yaw: number };

const toward = (x: number, z: number): Spot => ({ x, z, yaw: deg(Math.atan2(-x, -z)) });

/** Slot 0 is role 0. The front of the stage (where the camera goes) is +Z. */
const LAYOUTS: Record<LayoutId, Spot[]> = {
  facing: [{ x: -0.5, z: 0, yaw: 90 }, { x: 0.5, z: 0, yaw: -90 }],
  close: [{ x: -0.19, z: 0, yaw: 90 }, { x: 0.19, z: 0, yaw: -90 }],
  side: [{ x: -0.33, z: 0, yaw: 0 }, { x: 0.33, z: 0, yaw: 0 }],
  vee: [{ x: -0.45, z: 0, yaw: 40 }, { x: 0.45, z: 0, yaw: -40 }],
  depth2: [{ x: -0.3, z: 0.9, yaw: 0 }, { x: 0.35, z: -0.5, yaw: 0 }],
  circle: [toward(0, -0.62), toward(-0.54, 0.31), toward(0.54, 0.31)],
  line: [{ x: -0.7, z: 0, yaw: 0 }, { x: 0, z: 0, yaw: 0 }, { x: 0.7, z: 0, yaw: 0 }],
  arc: [{ x: -0.75, z: 0.25, yaw: 18 }, { x: 0, z: -0.1, yaw: 0 }, { x: 0.75, z: 0.25, yaw: -18 }],
  depth3: [{ x: -0.55, z: 1.0, yaw: 0 }, { x: 0.05, z: 0, yaw: 0 }, { x: 0.6, z: -1.0, yaw: 0 }],
  twoAndOne: [{ x: 0, z: 0.75, yaw: 180 }, { x: -0.38, z: -0.45, yaw: 0 }, { x: 0.38, z: -0.45, yaw: 0 }],
};

/* ---------------------------------------------------------------- apply -- */

export interface ApplyResult {
  figures: BlockingFigure[];
  camera: Blocking["camera"];
  shot: AppliedShot;
  /** The person the readout should talk about. */
  subjectId: string;
}

/**
 * Put a preset on the stage.
 *
 * `figures` must already hold at least `preset.people` people (the builder
 * adds stand-ins first). `lead` is the variant: the index of the figure the
 * shot is ON (or, for "over", whose shoulder it is over). `arrange` moves the
 * people into the preset's layout; off, only the camera moves. Solo presets
 * never move anybody and are on `lead`.
 */
export function applyShot(
  preset: ShotPreset,
  figures: BlockingFigure[],
  opts: { lead: number; arrange: boolean; aspect: number; camera: Blocking["camera"] },
): ApplyResult {
  const n = preset.people;
  let figs = figures.map((f) => ({ ...f, joints: { ...f.joints } }));

  // Roles: role 0 is `lead`, the rest follow in list order.
  const pool = n === 1 ? [opts.lead] : [...Array(n).keys()];
  const roleIdx = n === 1 ? pool : [opts.lead, ...pool.filter((i) => i !== opts.lead)];

  const arranged = n > 1 && opts.arrange && preset.layout;
  if (arranged) {
    const spots = LAYOUTS[preset.layout!];
    // Two-person layouts stay put across variants, so an OTS on her and one on
    // him are the same two people in the same two places (that is what makes
    // them cut). The three-person OTS moves whoever it is over to the front.
    const slotOf = (i: number) => (preset.variantMoves ? roleIdx.indexOf(i) : i);
    figs = figs.map((f, i) => (i >= n ? f : place(f, spots[slotOf(i)])));
  }

  const roles = roleIdx.map((i) => figs[i]);
  const camSide = arranged ? { x: 0, z: 1 } : flat(sub3(opts.camera.position, centroid(roles)));
  const camera = solve(preset, roles, camSide, opts.aspect, Boolean(arranged));

  // Anyone the shot is not about steps out of it: behind the camera, which
  // is the one place no lens on this stage is pointing. (Off to the side
  // still landed them in the background of the reverse angle.)
  if (arranged) {
    const back = flat(sub3(camera.position, { x: camera.target[0], y: camera.target[1], z: camera.target[2] }));
    figs = figs.map((f, i) => {
      if (i < n) return f;
      const k = 1.6 + 0.8 * (i - n);
      return { ...f, position: [camera.position[0] + back.x * k, f.position[1], camera.position[2] + back.z * k] as Vec3 };
    });
  }

  return {
    figures: figs,
    camera,
    shot: { id: preset.id, label: preset.label, roles: roles.map((r) => r.id), focus: preset.focus },
    subjectId: preset.camera.kind === "otsGroup" ? roles[1].id : roles[0].id,
  };
}

/** `focus` with {0} {1} {2} filled in from the people's names. */
export function focusWords(shot: AppliedShot | undefined, name: (figureId: string) => string): string {
  if (!shot?.focus) return "";
  return shot.focus.replace(/\{(\d)\}/g, (_, d: string) => name(shot.roles[Number(d)] ?? ""));
}

/* --------------------------------------------------------------- solver -- */

function solve(preset: ShotPreset, roles: BlockingFigure[], camSide: XZ, aspect: number, arranged: boolean): Blocking["camera"] {
  const spec = preset.camera;
  const { hfov, vfov } = fovFor(preset.mm, aspect);

  if (spec.kind === "single") {
    const s = bodyOf(roles[0]);
    const dir = rotate(s.forward, -spec.az);
    const fr = frameFor(spec.size, s.eye, s.top, s.upright);
    let d = fr.h / 2 / tan(vfov / 2);
    if (spec.height === "overhead") return overhead(s.at, Math.max(fr.h, 2.1), vfov, preset.mm, s.forward);
    const y = heightFor(spec.height, spec.size, s.eye, fr.cy);
    d = Math.max(d, 0.35);
    return cam([s.at.x + dir.x * d, y, s.at.z + dir.z * d], [s.at.x, fr.cy, s.at.z], preset.mm);
  }

  if (spec.kind === "group") {
    const bodies = roles.map(bodyOf);
    const c = { x: avg(bodies.map((b) => b.at.x)), z: avg(bodies.map((b) => b.at.z)) };
    // Arranged, every layout is built to be filmed from +Z. On people she
    // placed herself, square up to them from the side the camera is on.
    let front = arranged ? camSide : perpToward(roles, camSide);
    if (spec.turn) {
      const a = rotate(front, spec.turn);
      const b = rotate(front, -spec.turn);
      front = dot(a, bodies[0].forward) >= dot(b, bodies[0].forward) ? a : b;
    }
    const eye = Math.max(...bodies.map((b) => b.eye));
    const top = Math.max(...bodies.map((b) => b.top));
    const fr = frameFor(spec.size, eye, top, bodies.every((b) => b.upright));
    if (spec.height === "overhead") {
      const spread = Math.max(...bodies.map((b) => Math.hypot(b.at.x - c.x, b.at.z - c.z))) * 2 + 0.9;
      return overhead(c, Math.max(fr.h, spread * Math.min(1, 1 / aspect) + 1.6), vfov, preset.mm, front);
    }
    const side = { x: front.z, z: -front.x };
    const across = bodies.map((b) => dot({ x: b.at.x - c.x, z: b.at.z - c.z }, side));
    const ahead = Math.max(...bodies.map((b) => dot({ x: b.at.x - c.x, z: b.at.z - c.z }, front)));
    const width = Math.max(...across) - Math.min(...across) + (spec.size === "mcu" || spec.size === "cu" ? 0.5 : 0.95);
    const mid = (Math.max(...across) + Math.min(...across)) / 2;
    const d = Math.max(fr.h / 2 / tan(vfov / 2), width / 2 / tan(hfov / 2)) + Math.max(ahead, 0);
    const y = heightFor(spec.height, spec.size, eye, fr.cy);
    const cx = c.x + side.x * mid;
    const cz = c.z + side.z * mid;
    return cam([cx + front.x * d, y, cz + front.z * d], [cx, fr.cy, cz], preset.mm);
  }

  if (spec.kind === "ots") {
    const s = bodyOf(roles[0]);
    const o = bodyOf(roles[1]);
    const u = norm({ x: s.at.x - o.at.x, z: s.at.z - o.at.z });
    const p = sideToward(u, camSide);
    // Behind the near person, and out to the side by how much of them should
    // show: a shoulder and the back of the head (ots), one soft edge of a
    // shoulder (dirty), or nothing at all (clean).
    const [back, out] = spec.style === "ots" ? [0.6, 0.3] : spec.style === "dirty" ? [0.55, 0.33] : [0.1, 0.65];
    const fr = frameFor(spec.size, s.eye, s.top, s.upright);
    const pos: Vec3 = [o.at.x - u.x * back + p.x * out, o.eye + 0.03, o.at.z - u.z * back + p.z * out];
    const target: Vec3 = [s.at.x, fr.cy, s.at.z];
    return cam(pos, target, lensFor(fr.h, dist(pos, target), aspect));
  }

  if (spec.kind === "pov") {
    const s = bodyOf(roles[0]);
    const o = bodyOf(roles[1]);
    const u = norm({ x: s.at.x - o.at.x, z: s.at.z - o.at.z });
    // Just in front of their face, so their own head is not in the way.
    const pos: Vec3 = [o.at.x + u.x * 0.16, o.eye, o.at.z + u.z * 0.16];
    return cam(pos, [s.at.x, s.eye - 0.08, s.at.z], preset.mm);
  }

  // otsGroup: roles 1 and 2 past role 0's shoulder.
  const fg = bodyOf(roles[0]);
  const faces = roles.slice(1).map(bodyOf);
  const m = { x: (faces[0].at.x + faces[1].at.x) / 2, z: (faces[0].at.z + faces[1].at.z) / 2 };
  const u = norm({ x: m.x - fg.at.x, z: m.z - fg.at.z });
  const p = sideToward(u, camSide.x === 0 && camSide.z === 1 ? { x: 1, z: 0 } : camSide);
  // Further back and out than a two-person OTS: their head is the near edge
  // of the frame, and both faces have to clear it.
  const pos: Vec3 = [fg.at.x - u.x * 1.0 + p.x * 0.7, fg.eye + 0.05, fg.at.z - u.z * 1.0 + p.z * 0.7];
  const eye = Math.max(...faces.map((f) => f.eye));
  const top = Math.max(...faces.map((f) => f.top));
  const fr = frameFor(spec.size, eye, top);
  const target: Vec3 = [m.x, fr.cy, m.z];
  const d = dist(pos, target);
  const across = Math.abs(dot({ x: faces[0].at.x - faces[1].at.x, z: faces[0].at.z - faces[1].at.z }, { x: u.z, z: -u.x }));
  const byWidth = mmFor(2 * Math.atan((across + 0.9) / 2 / d), aspect, "h");
  return cam(pos, target, Math.min(lensFor(fr.h, d, aspect), byWidth));
}

/* ------------------------------------------------------------- framing -- */

/** Vertical extent of the frame at the subject: centre height and height in metres. */
function frameFor(size: Size, eye: number, top: number, upright = true): { cy: number; h: number } {
  if (!upright) {
    // Lying down: the body runs across the frame, not up it, so the frame
    // centres on the face and only its size follows the shot size.
    const h = { ecu: 0.16, cu: 0.42, mcu: 0.7, ms: 1.05, mfs: 1.45, fs: 2.0, ws: 3.2, ews: 7.5 }[size];
    return { cy: eye - (size === "ecu" || size === "cu" ? 0.03 : 0.08), h };
  }
  switch (size) {
    case "ecu": return { cy: eye, h: 0.16 };
    case "cu": return { cy: eye - 0.07, h: 0.42 };
    case "mcu": return { cy: top + 0.05 - 0.35, h: 0.7 };
    case "ms": return { cy: top + 0.07 - 0.525, h: 1.05 };
    case "mfs": return { cy: top + 0.08 - 0.725, h: 1.45 };
    case "fs": { const h = top + 0.33; return { cy: top + 0.25 - h / 2, h }; }
    case "ws": { const h = Math.max(3.2, top * 1.9); return { cy: h * 0.38, h }; }
    case "ews": return { cy: 2.4, h: 7.5 };
  }
}

/** Camera height: eye level for close work, chest for wider, or the preset's angle. */
function heightFor(h: Height | undefined, size: Size, eye: number, cy: number): number {
  const close = size === "ecu" || size === "cu" || size === "mcu";
  if (h === "low") return Math.max(0.25, eye - (close ? 0.45 : 1.0));
  if (h === "high") return eye + (close ? 0.45 : 1.1);
  if (h === "floor") return 0.15;
  if (close) return eye;
  if (size === "ms") return eye - 0.08;
  if (size === "mfs" || size === "fs") return Math.max(cy + 0.25, eye - 0.35);
  return Math.max(1.3, Math.min(eye, 1.6));
}

function overhead(at: XZ, ground: number, vfov: number, mm: number, up: XZ): Blocking["camera"] {
  const d = ground / 2 / tan(vfov / 2);
  // A hair toward their feet so "up" in the frame is the top of their head.
  return cam([at.x - up.x * 0.02, 0.5 + d, at.z - up.z * 0.02], [at.x, 0.5, at.z], mm);
}

/** The lens that makes `h` metres fill the frame's height at distance `d`. */
function lensFor(h: number, d: number, aspect: number): number {
  return mmFor(2 * Math.atan(h / 2 / Math.max(d, 0.2)), aspect, "v");
}

/** Inverse of fovFor: a field of view (radians) across the short ("v") or long ("h") side → mm. */
function mmFor(fov: number, aspect: number, axis: "v" | "h"): number {
  // fovFor measures the long side; convert whichever side we have to it.
  const t = Math.tan(fov / 2);
  const landscape = aspect >= 1;
  const long = axis === "v" ? (landscape ? t * aspect : t) : landscape ? t : t / aspect;
  return Math.round(Math.min(200, Math.max(18, 18 / long)));
}

/* ---------------------------------------------------------------- bodies -- */

type XZ = { x: number; z: number };

/**
 * Eye and crown heights from the mannequin's own spine chain
 * (components/studio/BlockingStage.tsx: pelvis → spine → chest → neck → head,
 * eyes at 1.06 of the skull offset, the skull 0.11k tall). Upright; a bent
 * spine reads a little high, which only adds headroom.
 */
export function bodyOf(f: BlockingFigure) {
  const p = PROPORTIONS[f.build];
  const s = spineOffsets(p);
  const k = p.height / 1.7;
  const neckTop = s.spine + s.chest + s.neck + s.head;
  // The whole body turns with the pelvis, so a reclined driver's eyes sit
  // back and lower, and a person lying down has their eyes at pillow height.
  // Spine bends below the neck are ignored (a few centimetres).
  const pel = f.joints.pelvis ?? [0, 0, 0];
  const up = rotYXZ([0, 1, 0], pel);
  const fwd = rotYXZ([0, 0, 1], pel);
  const eyeH = neckTop + s.skull * 1.06;
  const eye: Vec3 = [
    f.position[0] + up[0] * eyeH + fwd[0] * 0.06,
    f.position[1] + up[1] * eyeH + fwd[1] * 0.06,
    f.position[2] + up[2] * eyeH + fwd[2] * 0.06,
  ];
  const upright = up[1] > 0.7;
  // Which way they face, on the floor plan. Lying on their back they face
  // the ceiling, so "in front of them" becomes the foot of the bed.
  const flatFwd = Math.hypot(fwd[0], fwd[2]) > 0.3 ? norm({ x: fwd[0], z: fwd[2] }) : norm({ x: -up[0], z: -up[2] });
  return {
    at: upright ? { x: f.position[0], z: f.position[2] } : { x: eye[0], z: eye[2] },
    eye: eye[1],
    top: upright ? f.position[1] + up[1] * (neckTop + s.skull + 0.11 * k) : eye[1] + 0.1,
    eye3: eye,
    forward: flatFwd,
    upright,
  };
}

/** A vector turned by a joint's Euler angles in degrees, YXZ order (Rz, then Rx, then Ry). */
function rotYXZ(v: Vec3, e: Vec3): Vec3 {
  const [ax, ay, az] = e.map(rad);
  let [x, y, z] = v;
  [x, y] = [x * Math.cos(az) - y * Math.sin(az), x * Math.sin(az) + y * Math.cos(az)];
  [y, z] = [y * Math.cos(ax) - z * Math.sin(ax), y * Math.sin(ax) + z * Math.cos(ax)];
  [x, z] = [x * Math.cos(ay) + z * Math.sin(ay), -x * Math.sin(ay) + z * Math.cos(ay)];
  return [x, y, z];
}

/** Into a layout spot: their pose kept, turned to the spot's facing, head straightened. */
function place(f: BlockingFigure, s: Spot): BlockingFigure {
  const pel = f.joints.pelvis ?? [0, 0, 0];
  const joints: Partial<Record<JointId, Vec3>> = { ...f.joints, pelvis: [pel[0], s.yaw, pel[2]], neck: [0, 0, 0], head: [0, 0, 0] };
  return { ...f, joints, position: [s.x, f.position[1], s.z] };
}

/** The group's front: square to the line between two people, or toward the camera for three. */
function perpToward(roles: BlockingFigure[], camSide: XZ): XZ {
  const want = norm(camSide);
  if (roles.length === 2) {
    const u = norm({ x: roles[1].position[0] - roles[0].position[0], z: roles[1].position[2] - roles[0].position[2] });
    return sideToward(u, want);
  }
  return want;
}

/** The unit perpendicular to `u` on the same side as `want`. */
function sideToward(u: XZ, want: XZ): XZ {
  const p = { x: u.z, z: -u.x };
  return dot(p, want) >= 0 ? p : { x: -p.x, z: -p.z };
}

function centroid(fs: BlockingFigure[]): XZ & { y: number } {
  const n = fs.length || 1;
  return {
    x: fs.reduce((a, f) => a + f.position[0], 0) / n,
    y: fs.reduce((a, f) => a + f.position[1], 0) / n,
    z: fs.reduce((a, f) => a + f.position[2], 0) / n,
  };
}

/* ------------------------------------------------------------------ math -- */

const rad = (d: number) => (d * Math.PI) / 180;
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
function deg(r: number) { return (r * 180) / Math.PI; }
const tan = (d: number) => Math.tan(rad(d));
const dot = (a: XZ, b: XZ) => a.x * b.x + a.z * b.z;
function norm(v: XZ): XZ {
  const l = Math.hypot(v.x, v.z);
  return l < 1e-6 ? { x: 0, z: 1 } : { x: v.x / l, z: v.z / l };
}
/** Turn a direction about Y by `d` degrees (three.js: positive turns +Z toward +X). */
function rotate(v: XZ, d: number): XZ {
  const a = rad(d);
  return { x: v.x * Math.cos(a) + v.z * Math.sin(a), z: -v.x * Math.sin(a) + v.z * Math.cos(a) };
}
const sub3 = (a: Vec3, b: { x: number; y: number; z: number }): Vec3 => [a[0] - b.x, a[1] - b.y, a[2] - b.z];
const flat = (v: Vec3): XZ => norm({ x: v[0], z: v[2] });
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const r2 = (n: number) => Math.round(n * 100) / 100;
function cam(position: Vec3, target: Vec3, mm: number): Blocking["camera"] {
  return { position: position.map(r2) as Vec3, target: target.map(r2) as Vec3, mm: Math.round(mm) };
}
