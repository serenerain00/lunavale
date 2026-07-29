/**
 * World model — the explorable layer: environments, the rooms inside them, and
 * the interactive objects inside each room. Content DATA only (positions, links,
 * access, scan references), kept separate from 3D rendering and access logic.
 *
 * Model: Environment -> Room -> Object -> content outcome (clip / journal /
 * memory / artifact). Objects reference video slugs from lib/content/videos.ts
 * so the explorable world and the conventional watch views share one source.
 *
 * Each Room has an optional `scan` slot. While it's undefined, the room renders
 * as tinted placeholder geometry. Drop a photogrammetry GLB into the slot (see
 * docs/world/SCAN_CAPTURE.md) and the real space replaces the placeholder with
 * no other code changes. Coordinates are scene metres, origin at room centre.
 */

import type { AccessLevel } from "@/lib/content/videos";

export type ObjectKind = "clip" | "journal" | "memory" | "artifact";

/** The physical item rendered for a hotspot (hover to highlight, click to open). */
export type ItemKind = "note" | "mug" | "journal" | "remote";

/**
 * Which hand-built furniture set dresses a room. The 3D scene switches on this
 * (not on room id, which can repeat across environments) to draw the right
 * geometry; an unimplemented dressing falls back to a generic shell, so the
 * room stays navigable while its bespoke build is still pending. Add a value
 * here and a matching case in WorldScene as each room is detailed.
 */
export type RoomDressing =
  | "kitchen-living"
  | "bedroom"
  | "workshop"
  | "porch"
  | "deck"
  | "great-room"
  | "dock"
  | "bar"
  | "shore"
  | "cafe"
  | "park"
  | "pit"
  | "trackside"
  | "barn"
  | "restaurant"
  | "street";

export interface WorldObject {
  /** Stable id, unique within the room. Used in URLs (?focus=) and analytics. */
  id: string;
  label: string;
  kind: ObjectKind;
  /** Which real item to render as the hotspot. */
  item?: ItemKind;
  /** Short prompt shown on hover/focus. */
  hint: string;
  /** World position [x, y, z] of the object's focus point. */
  position: [number, number, number];
  /** Optional linked video slug (for kind === "clip"). */
  videoSlug?: string;
  /** Placeholder body copy until real content lands. */
  placeholder: string;
  access: AccessLevel;
}

export interface RoomScan {
  /** Only GLB meshes today; splats can be added later. */
  type: "glb";
  /** Path under /public, e.g. /scans/farmhouse/dining-room.glb */
  src: string;
  /** Transform to seat the scan in scene space (tuned per scan on delivery). */
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
}

export interface RoomPano {
  /** Equirectangular 2:1 panorama under /public, e.g. /panos/farmhouse/dining-room.jpg */
  src: string;
  /** Yaw offset (radians) to face the panorama's focal point on entry. */
  rotationY?: number;
}

/** A photoreal Gaussian splat capture of a room (see docs/world/SPLAT_CAPTURE.md). */
export interface RoomSplat {
  /** Path to a .splat/.ply under /public, e.g. /splats/farmhouse/living.splat */
  src: string;
  /** Transform to seat the splat in scene space (tuned per capture on delivery). */
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/** A named vantage point within a room the camera can travel to (an "area"). */
export interface Vantage {
  id: string;
  label: string;
  /** Camera position. */
  camera: [number, number, number];
  /** Point the camera looks at. */
  target: [number, number, number];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  /** Camera start position when entering the room. */
  spawn: [number, number, number];
  /**
   * Interior rooms get an enclosed shell (walls, ceiling); exterior rooms get
   * open ground under the HDRI sky, with water where the scene calls for it.
   * Defaults to interior.
   */
  setting?: "interior" | "exterior";
  /** Which hand-built furniture set to draw (procedural path). */
  dressing?: RoomDressing;
  /**
   * Environment source, in priority order: a photoreal Gaussian splat, then a
   * 360° panorama, then a captured GLB scan, else placeholder geometry. Fill
   * whichever you have; the rest stays undefined.
   */
  splat?: RoomSplat;
  pano?: RoomPano;
  scan?: RoomScan;
  /** Placeholder tint so rooms feel distinct before real art arrives. */
  accent: string;
  /** Named vantage points to travel between (e.g. Kitchen, Living Room). */
  areas?: Vantage[];
  /** Optional still gallery hung on this room's wall (id from lib/content/gallery). */
  galleryId?: string;
  objects: WorldObject[];
}

export interface Environment {
  slug: string;
  name: string;
  tagline: string;
  belongsTo: string;
  rooms: Room[];
}

/* ------------------------------------------------------- build readiness -- */

/**
 * Whether a room has real captured art, or is still the placeholder box.
 *
 * DERIVED, never hand-set. A boolean anyone has to remember to flip would drift
 * the moment art landed, and the failure mode is the worst one available: a
 * room that says it is finished while rendering a tinted box with a stock
 * armchair in it. The instant a `splat`/`pano`/`scan` slot is filled, this
 * turns true and every "in progress" label in the app disappears on its own.
 */
export function hasRealArt(room: Room): boolean {
  return Boolean(room.splat ?? room.pano ?? room.scan);
}

export type BuildState = "built" | "partial" | "placeholder";

export interface Readiness {
  /** Rooms with captured art. */
  dressed: number;
  total: number;
  state: BuildState;
}

export function readiness(env: Environment): Readiness {
  const dressed = env.rooms.filter(hasRealArt).length;
  const total = env.rooms.length;
  return {
    dressed,
    total,
    state: dressed === 0 ? "placeholder" : dressed < total ? "partial" : "built",
  };
}

/**
 * What to tell a visitor standing in an undressed room. Said plainly: the
 * geometry is a stand-in, the things in the room are real. Being straight about
 * a half-built room costs less than letting somebody conclude this is what the
 * finished product looks like — and it is the difference between "unfinished"
 * and "bad", which a visitor cannot tell apart on their own.
 */
export const PLACEHOLDER_NOTICE =
  "This room is still being built. The layout you're standing in is a stand-in — everything in it is real and the space around it is being replaced.";

export const environments: Environment[] = [
  {
    slug: "farmhouse",
    name: "The Farmhouse",
    tagline:
      "Where Josh and Luna made a life — warm wood, low light, and everything left unsaid.",
    belongsTo: "Josh & Luna",
    rooms: [
      {
        id: "kitchen",
        name: "Kitchen & Living Room",
        description:
          "The open heart of the house — the kitchen where they'd slow-dance after dinner, opening onto the living room and its great stone fireplace.",
        spawn: [0, 1.7, 2],
        dressing: "kitchen-living",
        accent: "#6b5238",
        areas: [
          {
            id: "living-room",
            label: "Living Room",
            camera: [0, 1.7, 3.4],
            target: [0, 1.5, 7],
          },
          {
            id: "kitchen-area",
            label: "Kitchen",
            camera: [0, 1.7, -2.8],
            target: [0, 1.3, -6],
          },
          {
            id: "dinner-gallery",
            label: "Dinner Gallery",
            camera: [-1.2, 1.7, 0.5],
            target: [-4.5, 1.55, 0.5],
          },
        ],
        galleryId: "josh-luna-dinner",
        objects: [
          {
            id: "josh-note",
            label: "Josh's Note",
            kind: "journal",
            item: "note",
            hint: "Read it",
            position: [-0.55, 1.0, -4.55],
            placeholder:
              "A note left on the island before he went to work: \"Didn't want to wake you. Coffee's still warm. — J\". Small, ordinary, the kind of thing you only understand the weight of later.",
            access: "free",
          },
          {
            id: "kitchen-mug",
            label: "The Coffee Mug",
            kind: "memory",
            item: "mug",
            hint: "Pick it up",
            position: [0.7, 1.05, -4.55],
            placeholder:
              "A chipped mug on the island. Josh and Luna's mornings lived in small rituals like this one.",
            access: "free",
          },
          {
            id: "first-morning-clip",
            label: "First Morning",
            kind: "clip",
            item: "remote",
            hint: "Play on the TV",
            position: [0.35, 0.5, 3.3],
            videoSlug: "luna-josh-first-morning",
            placeholder: "A scene from the farmhouse.",
            access: "free",
          },
          {
            id: "luna-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her journal",
            position: [-1.4, 0.62, 2.0],
            placeholder:
              "Luna's journal, left on the sofa where she wrote most nights. Her private account — members can read the entries.",
            access: "premium",
          },
        ],
      },
      {
        id: "master-bedroom",
        name: "Master Bedroom",
        description:
          "The room they shared. Quiet now — where Luna kept the things she never said out loud.",
        spawn: [0, 1.6, 3],
        dressing: "bedroom",
        accent: "#5f4a5a",
        objects: [
          {
            id: "luna-journal",
            label: "Luna's Journal",
            kind: "journal",
            hint: "Read her entry",
            position: [-2.6, 0.95, 1.6],
            placeholder:
              "Luna's handwriting fills these pages — her private account of the farmhouse years, and why she left.",
            access: "premium",
          },
          {
            id: "bedside-photo",
            label: "The Photograph",
            kind: "memory",
            hint: "Look closer",
            position: [2.2, 1.0, -1.8],
            placeholder:
              "A photo of the two of them, early on. Before the distance.",
            access: "free",
          },
        ],
      },
      {
        id: "garage-shop",
        name: "The Garage & Shop",
        description:
          "Josh's place. Engine parts, sawdust, and the projects he disappeared into.",
        spawn: [0, 1.6, 3.5],
        dressing: "workshop",
        accent: "#4f5a4a",
        objects: [
          {
            id: "workbench",
            label: "Josh's Workbench",
            kind: "memory",
            hint: "Look over it",
            position: [-2.8, 1.0, -1.5],
            placeholder:
              "Tools laid out with a mechanic's order. This is where Josh went when he didn't want to talk.",
            access: "free",
          },
          {
            id: "project-car",
            label: "The Project",
            kind: "artifact",
            hint: "Examine it",
            position: [2.6, 0.8, -1.0],
            placeholder:
              "The build he never finished. There's a story in why he stopped.",
            access: "premium",
          },
        ],
      },
      {
        id: "front-porch",
        name: "The Front Porch",
        description:
          "The threshold of the house. Where conversations started, and where some of them ended.",
        spawn: [0, 1.6, 3],
        dressing: "porch",
        accent: "#5a5238",
        objects: [
          {
            id: "porch-swing",
            label: "The Porch Swing",
            kind: "memory",
            hint: "Sit a while",
            position: [-2.2, 1.0, -1.2],
            placeholder:
              "The swing that held a hundred slow evenings. Luna still remembers the rhythm of it.",
            access: "free",
          },
          {
            id: "porch-evening",
            label: "Evening on the Porch",
            kind: "memory",
            hint: "Stay for it",
            position: [2.4, 1.1, -1.6],
            placeholder:
              "One particular evening, near the end. Members can stay for the whole of it.",
            access: "premium",
          },
        ],
      },
    ],
  },

  /* ======================================================================
   * The rest of the world. Rooms carry a `dressing` naming the bespoke
   * furniture set they'll get; until that set is built in WorldScene they
   * render as navigable tinted shells with their real hotspots. Objects link
   * real video slugs (lib/content/videos.ts) so the explorable world and the
   * watch views stay one source of truth.
   * ==================================================================== */

  {
    slug: "lakehouse",
    name: "The Lakehouse",
    tagline:
      "Luna's own place now — water, firelight, and the room to feel all of it.",
    belongsTo: "Luna",
    rooms: [
      {
        id: "deck",
        name: "The Deck",
        description:
          "Out over the water, the firepit still ringed by two chairs. Where Luna processes everything, and where one night with Tyson refused to stay unspoken.",
        spawn: [0, 1.7, 3.5],
        setting: "exterior",
        dressing: "deck",
        accent: "#3a5560",
        objects: [
          {
            id: "fireside",
            label: "Fireside",
            kind: "clip",
            hint: "Stay by the fire",
            position: [0, 0.6, -2.2],
            videoSlug: "tyson-luna-lakehouse-fire",
            placeholder:
              "Late at the firepit, Luna and Tyson circle the things they haven't said. No fear in it — just the twenty years, and everything underneath.",
            access: "premium",
          },
          {
            id: "two-chairs",
            label: "Two Chairs",
            kind: "memory",
            hint: "Look closer",
            position: [-2.4, 1.0, -1.4],
            placeholder:
              "Two chairs, always two, pulled close to the fire. One of them was his more often than she'd admit.",
            access: "free",
          },
          {
            id: "luna-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.2, 0.7, -1.2],
            placeholder:
              "The pages she fills out here, alone by the water — the ones about Tyson she'd never let him see.",
            access: "premium",
          },
        ],
      },
      {
        id: "great-room",
        name: "The Great Room",
        description:
          "Firelight on the water through the glass. The quiet interior where she comes back to herself.",
        spawn: [0, 1.6, 3],
        dressing: "great-room",
        accent: "#4a3f4a",
        objects: [
          {
            id: "the-window",
            label: "The Window on the Water",
            kind: "memory",
            hint: "Look out",
            position: [0, 1.4, -4.4],
            placeholder:
              "The whole far wall is glass. On still nights the lake holds the fire twice.",
            access: "free",
          },
          {
            id: "luna-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [-2.6, 0.7, 1.4],
            placeholder:
              "Left open on the arm of the couch. Members can read what she wrote.",
            access: "premium",
          },
        ],
      },
      {
        id: "bedroom",
        name: "The Bedroom",
        description:
          "Up under the roof, facing the water. The room where twenty years of not saying it finally stopped.",
        spawn: [0, 1.6, 3],
        dressing: "bedroom",
        accent: "#584454",
        objects: [
          {
            // One object for one scene, even though two edits exist behind it.
            // The world never advertises the members' cut as a separate thing
            // to find — /watch decides what plays. Access stays "free" because
            // the public cut is: a locked object here would misrepresent what
            // clicking it does.
            id: "the-morning",
            label: "The Morning",
            kind: "clip",
            hint: "Watch",
            position: [0, 0.7, -2.8],
            videoSlug: "ty-luna-bed",
            placeholder:
              "The light coming up, and neither of them reaching for a reason to leave.",
            access: "free",
          },
          {
            id: "the-far-side",
            label: "The Far Side of the Bed",
            kind: "memory",
            hint: "Stand a while",
            position: [-2.4, 0.6, -1.2],
            placeholder:
              "Slept in. She hasn't decided yet whether to be glad about that.",
            access: "free",
          },
          {
            id: "bedroom-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.4, 0.8, -1.0],
            placeholder:
              "What she wrote the morning after, before he was properly awake.",
            access: "premium",
          },
        ],
      },
      {
        id: "dock",
        name: "The Dock",
        description:
          "Where the yard runs out and the water starts. The boat, and the keys she keeps meaning to use.",
        spawn: [0, 1.6, 4],
        setting: "exterior",
        dressing: "dock",
        accent: "#2f4a55",
        objects: [
          {
            id: "boat-keys",
            label: "The Boat Keys",
            kind: "artifact",
            hint: "Examine them",
            position: [-1.8, 1.0, -1.0],
            placeholder:
              "Keys on a nail by the cleat. There's a morning on the water tied to them she hasn't told anyone about.",
            access: "premium",
          },
          {
            id: "waters-edge",
            label: "The Water's Edge",
            kind: "memory",
            hint: "Stand a while",
            position: [2.2, 0.6, -2.2],
            placeholder:
              "The last plank before the drop. She stands here more than she'd like to.",
            access: "free",
          },
        ],
      },
    ],
  },

  {
    slug: "bar",
    name: "The Bar",
    tagline:
      "Low light, other people's noise, and room to finally say the real thing.",
    belongsTo: "Tyson & Luna",
    rooms: [
      {
        id: "the-bar",
        name: "The Bar",
        description:
          "Close enough to be overheard, talking anyway. Where Tyson told her he'd been noticing her — in a few words, the way he does.",
        spawn: [0, 1.6, 3],
        dressing: "bar",
        accent: "#5a3a2f",
        objects: [
          {
            id: "last-call",
            label: "Last Call",
            kind: "clip",
            item: "remote",
            hint: "Watch",
            position: [0, 0.7, -2.4],
            videoSlug: "luna-tyson-bar",
            placeholder:
              "Luna and Tyson at the bar, close enough to be overheard. A conversation that never quite happened, and they both understood every word.",
            access: "free",
          },
          {
            id: "second-drink",
            label: "The Second Drink",
            kind: "memory",
            item: "mug",
            hint: "Look closer",
            position: [1.6, 1.05, -1.6],
            placeholder:
              "The one that sat untouched between them while neither of them left.",
            access: "free",
          },
          {
            id: "bar-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [-1.8, 0.95, -1.2],
            placeholder:
              "What she wrote after — about the staring game, and the way he wouldn't look away.",
            access: "premium",
          },
        ],
      },
    ],
  },

  {
    slug: "lake",
    name: "The Lake",
    tagline:
      "Open water at the far edge of the farm, out of earshot — where things finally get said.",
    belongsTo: "Tyson & Luna",
    rooms: [
      {
        id: "the-shore",
        name: "The Far Shore",
        description:
          "Far enough from the house that they can raise their voices. So they did.",
        spawn: [0, 1.6, 3.5],
        setting: "exterior",
        dressing: "shore",
        accent: "#3f5245",
        objects: [
          // The "Out at the Lake" clip object was removed 2026-07-27 while the
          // scene is recut. Restore it here (kind: "clip", videoSlug:
          // "ty-luna-lake-fight") when the new cut is back in videos.ts.
          {
            id: "the-waterline",
            label: "The Waterline",
            kind: "memory",
            hint: "Stand a while",
            position: [-2.6, 0.5, -1.4],
            placeholder:
              "Where the ground gives way to water. She keeps ending up here.",
            access: "free",
          },
          {
            id: "lake-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.4, 0.7, -1.0],
            placeholder:
              "The entry she wrote the night of the fight, when she still couldn't tell whose fault it was.",
            access: "premium",
          },
        ],
      },
    ],
  },

  {
    slug: "coffee-shop",
    name: "The Coffee Shop",
    tagline:
      "Neutral ground, chosen for exactly that reason — where Josh restarts it.",
    belongsTo: "Josh & Luna",
    rooms: [
      {
        id: "the-cafe",
        name: "The Café",
        description:
          "Six months of silence, and then a phone call. He grazed her lip mid-sentence and all her defenses came down.",
        spawn: [0, 1.6, 2.5],
        dressing: "cafe",
        accent: "#6b4a30",
        objects: [
          {
            id: "coffee",
            label: "Coffee",
            kind: "clip",
            item: "mug",
            hint: "Watch",
            position: [0, 0.75, -2.2],
            videoSlug: "luna-josh-coffee",
            placeholder:
              "Neutral ground, chosen for exactly that reason. He touches her, gets close, makes her laugh — the man she first fell for.",
            access: "free",
          },
          {
            id: "the-corner-table",
            label: "The Corner Table",
            kind: "memory",
            hint: "Sit down",
            position: [-2.0, 0.9, -1.4],
            placeholder:
              "The table by the window they always took. She meant to say no here.",
            access: "free",
          },
          {
            id: "coffee-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.0, 0.9, -1.2],
            placeholder:
              "What she wrote about the lip, the laugh, and saying yes when she'd meant to say no.",
            access: "premium",
          },
        ],
      },
    ],
  },

  {
    slug: "park",
    name: "The Park",
    tagline: "Open ground, nowhere to hide.",
    belongsTo: "Tyson & Luna",
    rooms: [
      {
        id: "open-ground",
        name: "Open Ground",
        description:
          "She asked him to meet her. He came, stayed silent, wouldn't look at her — then said eight words she still can't put down.",
        spawn: [0, 1.6, 3.5],
        setting: "exterior",
        dressing: "park",
        accent: "#43542f",
        objects: [
          {
            id: "the-park",
            label: "The Park",
            kind: "clip",
            hint: "Watch",
            position: [0, 0.6, -2.6],
            videoSlug: "tyson-park-fight",
            placeholder:
              "Luna asks Tyson to meet her. He comes, and says almost nothing at all — until he says the one thing.",
            access: "premium",
          },
          {
            id: "the-space-between",
            label: "The Space Between",
            kind: "memory",
            hint: "Stand in it",
            position: [-2.2, 1.0, -1.6],
            placeholder:
              "\"You're standing here, and I can't do anything about it.\" Little words. All of it in them.",
            access: "premium",
          },
          {
            id: "park-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.4, 0.7, -1.2],
            placeholder:
              "The page she wrote afterward, trying to hold the eight words still long enough to understand them.",
            access: "premium",
          },
        ],
      },
    ],
  },

  {
    slug: "track",
    name: "The Track",
    tagline:
      "Tyson's world — engines, adrenaline, and the one corner he takes slow.",
    belongsTo: "Tyson",
    rooms: [
      {
        id: "the-pit",
        name: "The Pit",
        description:
          "The garage where Tyson lives between runs. Helmets on the shelf, and the black Carrera that's his baby.",
        spawn: [0, 1.6, 3.5],
        dressing: "pit",
        accent: "#3a3a40",
        objects: [
          {
            id: "helmet-shelf",
            label: "The Helmet Shelf",
            kind: "memory",
            hint: "Look them over",
            position: [-2.8, 1.4, -1.4],
            placeholder:
              "A shelf of helmets, each with its own dents and its own story. Ex-military, extreme sports — this is where Tyson comes from.",
            access: "free",
          },
          {
            id: "the-carrera",
            label: "The Carrera",
            kind: "artifact",
            hint: "Examine it",
            position: [2.4, 0.7, -1.2],
            placeholder:
              "A black 2020 Porsche Carrera, his one careful thing. He'll ride a motorcycle like he's daring it — but he won't take a hard corner with Luna in the passenger seat.",
            access: "premium",
          },
        ],
      },
      {
        id: "trackside",
        name: "Trackside",
        description:
          "Out on the tarmac, where he's fastest and most himself — except for one corner.",
        spawn: [0, 1.6, 3],
        setting: "exterior",
        dressing: "trackside",
        accent: "#4a4a3a",
        objects: [
          {
            id: "the-slow-corner",
            label: "The Slow Corner",
            kind: "memory",
            hint: "Stand a while",
            position: [0, 0.6, -3.0],
            placeholder:
              "The corner he takes slow every single lap she's ever been with him. He's never explained it. He doesn't have to.",
            access: "free",
          },
          {
            id: "track-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.4, 0.7, -1.4],
            placeholder:
              "About the slow corner, and what it means that the reckless one is careful with only her.",
            access: "premium",
          },
        ],
      },
    ],
  },

  {
    slug: "barn",
    name: "The Barn",
    tagline:
      "On the farm, before the day starts — two men and everything they don't say.",
    belongsTo: "Josh & Tyson",
    rooms: [
      {
        id: "the-barn",
        name: "The Barn",
        description:
          "Josh and Tyson at the tractor before the day starts. Family, co-workers, distant cousins — and the thing between them nobody names.",
        spawn: [0, 1.6, 3.5],
        dressing: "barn",
        accent: "#5a4a30",
        objects: [
          {
            id: "the-barn-scene",
            label: "The Barn",
            kind: "clip",
            hint: "Watch",
            position: [0, 0.7, -2.6],
            videoSlug: "josh-tyson-barn",
            placeholder:
              "Two men who work well together, and everything neither of them is saying. The morning Josh mentioned dinner with Luna, casual as weather.",
            access: "free",
          },
          {
            id: "the-tractor",
            label: "The Tractor",
            kind: "memory",
            hint: "Look it over",
            position: [-2.6, 0.9, -1.4],
            placeholder:
              "The old tractor they both keep running. More conversations happen over this engine than anywhere else on the farm.",
            access: "free",
          },
          {
            id: "the-loft",
            label: "The Hayloft",
            kind: "memory",
            hint: "Climb up",
            position: [2.4, 1.8, -1.6],
            placeholder:
              "Up in the loft, out of the wind. Some things only get said where no one walks in.",
            access: "premium",
          },
        ],
      },
    ],
  },

  {
    slug: "downtown",
    name: "Downtown",
    tagline:
      "Dinner out, the drive back, and everything that surfaces once the door closes.",
    belongsTo: "Josh & Luna",
    rooms: [
      {
        id: "the-restaurant",
        name: "The Restaurant",
        description:
          "The dinner she said yes to. Candlelight, the old charm, and the lie she was already telling by not telling Tyson.",
        spawn: [0, 1.6, 2.5],
        dressing: "restaurant",
        accent: "#4a2f38",
        objects: [
          {
            id: "the-house",
            label: "The House",
            kind: "clip",
            hint: "Watch",
            position: [0, 0.8, -2.4],
            videoSlug: "luna-josh-house",
            placeholder:
              "Dinner out, the drive back, and everything that surfaces once the door is closed.",
            access: "free",
          },
          {
            id: "the-set-table",
            label: "The Set Table",
            kind: "memory",
            hint: "Sit down",
            position: [-2.0, 0.9, -1.4],
            placeholder:
              "Two places, candle between them. He remembered how she took everything. That was always the problem.",
            access: "free",
          },
          {
            id: "restaurant-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.0, 0.9, -1.2],
            placeholder:
              "\"I can't tell Tyson I'm having dinner with Josh.\" The entry where the first real lie in twenty years gets written down.",
            access: "premium",
          },
        ],
      },
      {
        id: "the-drive",
        name: "The Drive Back",
        description:
          "City lights, then the dark road home. The quiet where the evening turns.",
        spawn: [0, 1.6, 3],
        setting: "exterior",
        dressing: "street",
        accent: "#2f2f3a",
        objects: [
          {
            id: "the-drive-back",
            label: "The Drive Back",
            kind: "memory",
            hint: "Stay for it",
            position: [0, 1.0, -3.0],
            placeholder:
              "The drive when neither of them talks, and both of them know the night isn't over.",
            access: "premium",
          },
          {
            id: "downtown-journal",
            label: "Luna's Journal",
            kind: "journal",
            item: "journal",
            hint: "Read her entry",
            position: [2.4, 0.9, -1.2],
            placeholder:
              "What she let herself write about the drive, once she was alone again.",
            access: "premium",
          },
        ],
      },
    ],
  },
];

export function getEnvironment(slug: string): Environment | undefined {
  return environments.find((e) => e.slug === slug);
}

export function getRoom(env: Environment, roomId: string): Room | undefined {
  return env.rooms.find((r) => r.id === roomId);
}
