/**
 * Studio's two records: a reference image, and a shot recipe.
 *
 * Both are working data rather than content. They change hourly, they are
 * Melissa's alone, and nothing public reads them — so they live in Neon (see
 * lib/db/studio.ts) rather than in a content module under lib/content, which
 * is where the things the site is MADE of live.
 */

/**
 * What a reference is FOR, which is not the same as what it shows. The kind
 * decides where it lands in an emitted prompt: a face reference is identity, a
 * wardrobe reference is description, an environment plate is the room. Getting
 * this wrong is the main way a generator drifts.
 */
export type RefKind =
  | "face"
  | "body"
  | "tattoo"
  | "wardrobe"
  | "hair"
  | "prop"
  | "environment"
  | "lighting"
  | "pose"
  | "frame";

export const refKinds: { id: RefKind; label: string; note: string }[] = [
  { id: "face", label: "Face", note: "Identity. Tag the angle — this is what the angle picker reads." },
  { id: "body", label: "Body / full", note: "Proportion and posture, head to feet." },
  { id: "tattoo", label: "Tattoo", note: "With the placement written down. The single most-dropped detail." },
  { id: "wardrobe", label: "Wardrobe", note: "A garment, screenshotted or shot. One per item." },
  { id: "hair", label: "Hair", note: "Length and styling change by chapter. Worth its own kind." },
  { id: "prop", label: "Prop", note: "The mug, the helmet, the Carrera, the wine glass." },
  { id: "environment", label: "Environment", note: "A plate of the room. Pairs with the panorama library." },
  { id: "lighting", label: "Lighting", note: "A look you want matched, from anywhere." },
  { id: "pose", label: "Pose", note: "Body position only. Identity comes from the face refs." },
  { id: "frame", label: "Finished frame", note: "Something you already made. Tomorrow's reference." },
];

export interface StudioRef {
  id: string;
  kind: RefKind;
  /** Character id from lib/content/taxonomy, when it is of a person. */
  characterId: string | null;
  label: string;
  /**
   * Azimuth id from lib/studio/vocab, for face and body refs. This is what
   * makes the angle control a lookup instead of a wish: the picker can only
   * offer angles that exist in here.
   */
  angleId: string | null;
  /** Place id from lib/content/taxonomy, for environment and lighting refs. */
  placeId: string | null;
  /** Free text — tattoo placement, which scene a garment belongs to, anything. */
  notes: string;
  width: number;
  height: number;
  mime: string;
  bytes: number;
  createdAt: Date;
}

export interface ShotCamera {
  sizeId: string;
  heightId: string;
  tiltId: string;
  azimuthId: string;
  lensId: string;
  movementId: string;
}

export interface ShotRecipe {
  id: string;
  title: string;
  /** Scene slug from lib/content/videos, when the shot belongs to one. */
  sceneSlug: string | null;
  placeId: string | null;
  characterIds: string[];
  refIds: string[];
  camera: ShotCamera;
  lightingId: string;
  timeId: string;
  aspectId: string;
  /** What she is doing. The one part no vocabulary can supply. */
  action: string;
  /** Anything to bolt on the end, hers to write. */
  extra: string;
  createdAt: Date;
  updatedAt: Date;
}

export const emptyCamera: ShotCamera = {
  sizeId: "ms",
  heightId: "eye",
  tiltId: "level",
  azimuthId: "three-q-l",
  lensId: "50",
  movementId: "static",
};
