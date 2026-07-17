/**
 * World model — the explorable layer: environments and the interactive objects
 * inside them. This is content DATA (positions, labels, links, access), kept
 * separate from the 3D rendering and the access logic.
 *
 * Model: World -> Environment -> Object -> content outcome (clip / journal /
 * memory). Objects reference video slugs from lib/content/videos.ts by id so
 * the explorable world and the conventional watch views share one source.
 *
 * Coordinates are in scene units (metres), origin at room centre, +y up.
 * Placeholder geometry lives in the scene component; when real 3D/plate art
 * arrives, only positions may need tuning — the data shape stays the same.
 */

import type { AccessLevel } from "@/lib/content/videos";

export type ObjectKind = "clip" | "journal" | "memory" | "artifact";

export interface WorldObject {
  /** Stable id, unique within the environment. Used in URLs (?focus=) and analytics. */
  id: string;
  /** Accessible label / panel title. */
  label: string;
  /** What kind of discovery this is — drives the panel layout and icon. */
  kind: ObjectKind;
  /** Short prompt shown on hover/focus. */
  hint: string;
  /** World position [x, y, z] of the object's focus point. */
  position: [number, number, number];
  /** Optional linked video slug (for kind === "clip"). */
  videoSlug?: string;
  /** Placeholder body copy until real content lands. */
  placeholder: string;
  /** Access required to open the discovery. */
  access: AccessLevel;
}

export interface Environment {
  slug: string;
  name: string;
  /** One-line evocative description. */
  tagline: string;
  /** Which character this place belongs to, for tone. */
  belongsTo: string;
  /** Interactive objects placed in the room. */
  objects: WorldObject[];
}

export const environments: Environment[] = [
  {
    slug: "farmhouse",
    name: "The Farmhouse",
    tagline: "Where Josh and Luna made a life — warm wood, low light, and everything left unsaid.",
    belongsTo: "Josh & Luna",
    objects: [
      {
        id: "hearth",
        label: "The Hearth",
        kind: "memory",
        hint: "Sit with the fire",
        position: [0, 0.6, -3.4],
        placeholder:
          "The fire Josh always kept going. A quiet memory of the two of them here, before things cooled.",
        access: "free",
      },
      {
        id: "kitchen-mug",
        label: "The Coffee Mug",
        kind: "memory",
        hint: "Pick it up",
        position: [2.6, 0.95, -1.2],
        placeholder:
          "A chipped mug on the counter. Josh and Luna's mornings lived in small rituals like this one.",
        access: "free",
      },
      {
        id: "first-morning-clip",
        label: "First Morning",
        kind: "clip",
        hint: "Watch the scene",
        position: [-2.7, 1.1, -1.6],
        videoSlug: "luna-josh-first-morning",
        placeholder: "A scene from the farmhouse.",
        access: "free",
      },
      {
        id: "luna-journal",
        label: "Luna's Journal",
        kind: "journal",
        hint: "Read her entry",
        position: [-2.8, 0.95, 1.8],
        placeholder:
          "Luna's handwriting fills these pages. Her private account of the farmhouse years — and why she left.",
        access: "premium",
      },
    ],
  },
];

export function getEnvironment(slug: string): Environment | undefined {
  return environments.find((e) => e.slug === slug);
}
