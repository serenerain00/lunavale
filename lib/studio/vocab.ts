/**
 * The film vocabulary Studio speaks.
 *
 * WHY THIS IS DATA AND NOT A DROPDOWN FULL OF STRINGS. Every option here ends
 * up in two places at once: the live framing diagram (which needs numbers) and
 * the emitted prompt (which needs words). A shot size is 0.62 of frame height
 * AND the phrase "medium shot"; a lens is a horizontal field of view AND the
 * phrase "50mm". Keeping them together is what stops the picture on screen and
 * the sentence you paste into Kling from drifting apart.
 *
 * THE MOVEMENT LIST IS CLAUDE.md's, DELIBERATELY. Push in, pull back, pan,
 * dolly, orbit, track, rack focus, fade through black, environmental reveal —
 * that is the camera language this product is written in, and the tool should
 * not invent a second one. A shot planned here uses the same words as the
 * transitions in the world.
 *
 * `prompt` is what goes to the generator. `label` is what Melissa reads. They
 * are different on purpose: "MCU" is a good control and a bad prompt.
 */

export interface Option {
  id: string;
  label: string;
  /** The phrase that goes into the emitted prompt. */
  prompt: string;
  /** One line on what it does, shown under the control. */
  note?: string;
}

/* ------------------------------------------------------------- shot size -- */

export interface ShotSize extends Option {
  /**
   * How much of the frame HEIGHT a standing adult fills, 0-1. Drives the
   * silhouette in the diagram. An extreme close-up is >1 because the head
   * overflows the frame, which is the whole point of it.
   */
  fill: number;
  /** Where the eyeline sits as a fraction from the top of frame. */
  eyeline: number;
  /**
   * The framing clause, which has to sit AFTER the subject or the sentence
   * falls apart: "medium close-up of Luna, framed from the chest" reads, and
   * "medium close-up, framed from the chest of Luna" says something about her
   * chest. Separate field rather than one string for exactly that reason.
   */
  qualifier?: string;
}

export const shotSizes: ShotSize[] = [
  {
    id: "ews",
    label: "Extreme wide",
    prompt: "extreme wide shot",
    qualifier: "figure small in the landscape",
    fill: 0.18,
    eyeline: 0.44,
    note: "The place is the subject. She is scale, not face.",
  },
  {
    id: "ws",
    label: "Wide",
    prompt: "wide shot",
    qualifier: "full figure with room around her",
    fill: 0.55,
    eyeline: 0.3,
    note: "Whole body, whole room. Where she is matters as much as who.",
  },
  {
    id: "fs",
    label: "Full",
    prompt: "full shot",
    qualifier: "framed head to feet",
    fill: 0.86,
    eyeline: 0.16,
    note: "Head to feet, filling the frame. Wardrobe reads completely.",
  },
  {
    id: "mws",
    label: "Medium wide",
    prompt: "medium wide shot",
    qualifier: "framed from mid-thigh",
    fill: 1.35,
    eyeline: 0.2,
    note: "Mid-thigh up. The old cowboy shot — body language without the feet.",
  },
  {
    id: "ms",
    label: "Medium",
    prompt: "medium shot",
    qualifier: "framed from the waist",
    fill: 2.0,
    eyeline: 0.26,
    note: "Waist up. The conversation shot.",
  },
  {
    id: "mcu",
    label: "Medium close",
    prompt: "medium close-up",
    qualifier: "framed from the chest",
    fill: 3.1,
    eyeline: 0.3,
    note: "Chest up. Close enough to read a decision being made.",
  },
  {
    id: "cu",
    label: "Close",
    prompt: "close-up",
    qualifier: "face filling the frame",
    fill: 5.2,
    eyeline: 0.36,
    note: "Face fills the frame. Nothing to hide behind.",
  },
  {
    id: "ecu",
    label: "Extreme close",
    prompt: "extreme close-up",
    qualifier: "eyes and mouth only, face overflowing the frame",
    fill: 9.0,
    eyeline: 0.44,
    note: "One feature. Use it once a scene or it stops meaning anything.",
  },
  {
    id: "insert",
    label: "Insert",
    prompt: "insert shot",
    qualifier: "object filling the frame, hands only",
    fill: 0,
    eyeline: 0.5,
    note: "The mug, the ring, the invoice. No face at all.",
  },
];

/* ------------------------------------------------------ height and angle -- */

export interface CameraHeight extends Option {
  /** Lens height off the floor in metres. Places the horizon in the diagram. */
  metres: number;
}

export const cameraHeights: CameraHeight[] = [
  { id: "floor", label: "Floor", prompt: "camera on the floor looking up", metres: 0.15, note: "Almost never neutral. She becomes enormous." },
  { id: "low", label: "Low", prompt: "low camera height", metres: 0.7, note: "Waist height. Gives her weight without shouting about it." },
  { id: "chest", label: "Chest", prompt: "camera at chest height", metres: 1.25, note: "Slightly under eyeline. Warm, close, still hers." },
  { id: "eye", label: "Eye", prompt: "camera at eye level", metres: 1.6, note: "Neutral. The default, and the one to justify leaving." },
  { id: "high", label: "High", prompt: "high camera height looking down", metres: 2.1, note: "Above her eyeline. She gets smaller in the room." },
  { id: "overhead", label: "Overhead", prompt: "overhead shot looking straight down", metres: 3.2, note: "Straight down. Reads as fate rather than a person." },
];

export interface Tilt extends Option {
  /** Degrees. Negative looks up at her, positive looks down. */
  degrees: number;
}

export const tilts: Tilt[] = [
  { id: "up-hard", label: "Looking up, hard", prompt: "strong low angle looking up at her", degrees: -22 },
  { id: "up", label: "Looking up", prompt: "low angle", degrees: -10 },
  { id: "level", label: "Level", prompt: "level angle", degrees: 0 },
  { id: "down", label: "Looking down", prompt: "high angle", degrees: 10 },
  { id: "down-hard", label: "Looking down, hard", prompt: "strong high angle looking down at her", degrees: 22 },
];

/**
 * Where the camera stands relative to where she is facing. Degrees are the
 * control; the phrase is the prompt.
 *
 * THIS IS THE ONE THAT CANNOT BE FAKED, and the picker says so in the UI. A
 * generator will honour "three-quarter back" only if you hand it a reference
 * of her from three-quarter back. The library tab is where that gets fixed.
 */
export interface Azimuth extends Option {
  degrees: number;
}

export const azimuths: Azimuth[] = [
  { id: "front", label: "Front on", prompt: "facing camera straight on", degrees: 0 },
  { id: "three-q-l", label: "3/4 front, left", prompt: "three-quarter view from her left", degrees: -40 },
  { id: "three-q-r", label: "3/4 front, right", prompt: "three-quarter view from her right", degrees: 40 },
  { id: "profile-l", label: "Profile, left", prompt: "full profile from her left", degrees: -90 },
  { id: "profile-r", label: "Profile, right", prompt: "full profile from her right", degrees: 90 },
  { id: "three-q-back-l", label: "3/4 behind, left", prompt: "three-quarter rear view over her left shoulder", degrees: -140 },
  { id: "three-q-back-r", label: "3/4 behind, right", prompt: "three-quarter rear view over her right shoulder", degrees: 140 },
  { id: "back", label: "Behind", prompt: "from directly behind her, face unseen", degrees: 180 },
];

/* ------------------------------------------------------------------ lens -- */

export interface Lens extends Option {
  mm: number;
  /** Horizontal field of view in degrees on full frame. Drives the plan view. */
  hfov: number;
}

export const lenses: Lens[] = [
  { id: "18", label: "18mm", prompt: "18mm wide lens, visible perspective distortion", mm: 18, hfov: 90, note: "Room swallows her. Edges bend. Use on purpose." },
  { id: "24", label: "24mm", prompt: "24mm wide lens, deep focus", mm: 24, hfov: 74, note: "Environmental. She and the room in one breath." },
  { id: "35", label: "35mm", prompt: "35mm lens, natural perspective", mm: 35, hfov: 54, note: "Documentary-neutral. Safe and honest." },
  { id: "50", label: "50mm", prompt: "50mm lens, natural compression, shallow depth of field", mm: 50, hfov: 40, note: "How the eye sees it. The default." },
  { id: "85", label: "85mm", prompt: "85mm portrait lens, compressed background, shallow depth of field", mm: 85, hfov: 24, note: "Background melts. The intimacy lens." },
  { id: "135", label: "135mm", prompt: "135mm telephoto, heavily compressed, very shallow depth of field", mm: 135, hfov: 15, note: "Watching from across a room. Voyeur distance." },
];

/* -------------------------------------------------------------- movement -- */

/**
 * CLAUDE.md's camera language, verbatim, plus the two states that are not
 * moves. This is the list that matters most for Kling / Runway / Veo / Sora:
 * the anchor still decides what it looks like, and this decides what it does.
 */
export const movements: Option[] = [
  { id: "static", label: "Locked off", prompt: "static locked-off camera, no camera movement", note: "Nothing moves but her. The hardest one to earn." },
  { id: "push", label: "Push in", prompt: "slow push in toward her", note: "Pressure. Use when she is deciding something." },
  { id: "pull", label: "Pull back", prompt: "slow pull back away from her", note: "Abandonment. The room gets bigger around her." },
  { id: "pan", label: "Pan", prompt: "slow pan across the room", note: "Turning the head. Reveals by rotation." },
  { id: "dolly", label: "Dolly", prompt: "smooth dolly move alongside her", note: "Travelling with her, not toward her." },
  { id: "orbit", label: "Orbit", prompt: "slow orbit around her", note: "Circles the subject. Expensive-looking, easy to overdo." },
  { id: "track", label: "Track", prompt: "tracking shot following her as she moves", note: "Follows movement. Needs her to actually go somewhere." },
  { id: "rack", label: "Rack focus", prompt: "rack focus from foreground to her", note: "Shifts what matters without moving an inch." },
  { id: "reveal", label: "Environmental reveal", prompt: "camera moves to reveal the space around her", note: "The room is the twist." },
  { id: "handheld", label: "Handheld", prompt: "subtle handheld movement, breathing frame", note: "Nerves. A little goes a very long way." },
];

/* ----------------------------------------------------------------- light -- */

export const lighting: Option[] = [
  { id: "firelight", label: "Firelight", prompt: "warm firelight from below and to one side, deep shadow elsewhere" },
  { id: "candle", label: "Candlelight", prompt: "candlelight only, very low key, warm falloff into black" },
  { id: "practicals", label: "Practicals", prompt: "warm practical lamps in frame, pools of light against darkness" },
  { id: "worklamp", label: "Single work lamp", prompt: "one hard work lamp, strong directional light, everything else dark" },
  { id: "window", label: "Window daylight", prompt: "soft directional daylight from a window, gentle falloff" },
  { id: "overcast", label: "Overcast", prompt: "flat overcast daylight, no hard shadows, muted" },
  { id: "bluehour", label: "Blue hour", prompt: "cool blue dusk outside against warm interior light" },
  { id: "moon", label: "Moon on water", prompt: "cold moonlight off dark water, silver rim light" },
  { id: "headlights", label: "Headlights", prompt: "hard headlight beams cutting across, everything else in darkness" },
  { id: "fluoro", label: "Cold overhead", prompt: "cold overhead fluorescents against warm task lamps" },
];

export const timesOfDay: Option[] = [
  { id: "dawn", label: "Dawn", prompt: "first light, cold and grey" },
  { id: "morning", label: "Morning", prompt: "mid-morning" },
  { id: "afternoon", label: "Afternoon", prompt: "late afternoon, low warm sun" },
  { id: "dusk", label: "Dusk", prompt: "dusk, the light going" },
  { id: "night", label: "Night", prompt: "night" },
  { id: "small-hours", label: "Small hours", prompt: "the small hours, everything asleep" },
];

/* ---------------------------------------------------------------- aspect -- */

export interface Aspect {
  id: string;
  label: string;
  w: number;
  h: number;
  /** Longest sensible delivery size, used as the export default. */
  px: [number, number];
  where: string;
}

export const aspects: Aspect[] = [
  { id: "16-9", label: "16:9", w: 16, h: 9, px: [1920, 1080], where: "The site, YouTube, the scene player" },
  { id: "9-16", label: "9:16", w: 9, h: 16, px: [1080, 1920], where: "Reels, TikTok, Shorts, the vertical clips" },
  { id: "4-5", label: "4:5", w: 4, h: 5, px: [1080, 1350], where: "Instagram feed — the tallest it allows" },
  { id: "1-1", label: "1:1", w: 1, h: 1, px: [1080, 1080], where: "Square feed, avatars, grid" },
  { id: "2-39", label: "2.39:1", w: 239, h: 100, px: [2048, 858], where: "Anamorphic — posters and title cards" },
  { id: "3-2", label: "3:2", w: 3, h: 2, px: [1620, 1080], where: "Stills galleries" },
];

/**
 * Where the platforms put their furniture, as fractions of the frame. Drawn as
 * a dimmed overlay in the export deck so a face never ends up under a caption
 * or a progress bar.
 */
export const safeAreas: Record<string, { top: number; bottom: number; left: number; right: number; note: string }> = {
  "9-16": { top: 0.13, bottom: 0.2, left: 0.05, right: 0.22, note: "Reels/TikTok: handle and caption bottom, action rail right" },
  "4-5": { top: 0.06, bottom: 0.12, left: 0.05, right: 0.05, note: "Feed: caption crops under it" },
  "1-1": { top: 0.06, bottom: 0.06, left: 0.05, right: 0.05, note: "Feed" },
  "16-9": { top: 0.05, bottom: 0.1, left: 0.04, right: 0.04, note: "Player controls sit in the bottom tenth" },
};

export function byId<T extends { id: string }>(list: T[], id: string | undefined): T {
  return list.find((o) => o.id === id) ?? list[0];
}
