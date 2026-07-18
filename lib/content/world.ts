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
];

export function getEnvironment(slug: string): Environment | undefined {
  return environments.find((e) => e.slug === slug);
}

export function getRoom(env: Environment, roomId: string): Room | undefined {
  return env.rooms.find((r) => r.id === roomId);
}
