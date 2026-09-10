/**
 * The geometry behind the live preview.
 *
 * WHAT THE PREVIEW HONESTLY IS. It is a framing diagram, not a render — and
 * saying so in the tool is worth more than pretending otherwise, because the
 * pretence is what would waste her afternoon. Nothing that runs without a
 * model can show Luna's face from an angle no reference has; what CAN be shown,
 * exactly and instantly, is the thing that actually decides whether a shot
 * works: how much of her is in frame, where her eyeline sits, where the horizon
 * cuts, and how much room the lens leaves around her.
 *
 * All of it is one figure high (1.7m) and unitless after that, because none of
 * these numbers leave this file except as fractions of the frame.
 */

import { byId, cameraHeights, lenses, shotSizes, tilts, type Aspect } from "@/lib/studio/vocab";

const SUBJECT_M = 1.7;

export interface Framing {
  /** Frame box in a 0-1 space, aspect applied. */
  aspect: number;
  /** Figure height as a fraction of frame height. May exceed 1. */
  figure: number;
  /** Eyeline, fraction from top of frame. */
  eyeline: number;
  /** Horizon, fraction from top. Outside 0-1 means it is off frame. */
  horizon: number;
  /** Vertical field of view, degrees. */
  vfov: number;
  /** Horizontal field of view, degrees. */
  hfov: number;
  /** Roughly how far back the camera stands, metres. Sanity, not survey. */
  distance: number;
  /** True when the horizon is not visible in frame. */
  horizonOffFrame: boolean;
}

export function framing(input: {
  sizeId: string;
  heightId: string;
  tiltId: string;
  lensId: string;
  aspect: Aspect;
}): Framing {
  const size = byId(shotSizes, input.sizeId);
  const tilt = byId(tilts, input.tiltId);
  const lens = byId(lenses, input.lensId);

  const aspect = input.aspect.w / input.aspect.h;
  const hfov = lens.hfov;
  // Vertical FOV from horizontal, through the frame's aspect.
  const vfov =
    (2 * Math.atan(Math.tan((hfov * Math.PI) / 360) / aspect) * 180) / Math.PI;

  // How far back you stand to make a 1.7m figure fill `size.fill` of the frame.
  // Insert shots have no figure, so park the camera at arm's length.
  const framedHeight = size.fill > 0 ? SUBJECT_M / size.fill : 0.4;
  const distance = framedHeight / 2 / Math.tan((vfov * Math.PI) / 360);

  // Horizon sits at the optical centre when level and swings with tilt. A
  // positive tilt looks down, which pushes the horizon UP the frame.
  //
  // CAMERA HEIGHT IS DELIBERATELY NOT IN THIS. On flat ground the horizon is
  // always at the lens axis no matter how high the camera is — standing on a
  // chair does not move it. What height actually changes is where her feet
  // land relative to it, and how she reads in the room, which is what
  // heightRelation() below puts into words.
  const horizon = 0.5 - tilt.degrees / vfov;

  return {
    aspect,
    figure: size.fill,
    eyeline: size.eyeline,
    horizon,
    vfov,
    hfov,
    distance,
    horizonOffFrame: horizon < 0 || horizon > 1,
  };
}

/** Camera height relative to her eyeline, in plain words, for the readout. */
export function heightRelation(heightId: string): string {
  const m = byId(cameraHeights, heightId).metres;
  const eye = 1.6;
  const d = m - eye;
  if (Math.abs(d) < 0.12) return "level with her eyes";
  const cm = Math.round(Math.abs(d) * 100);
  return d < 0 ? `${cm}cm below her eyes` : `${cm}cm above her eyes`;
}
