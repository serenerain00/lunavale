/**
 * The compiler: a recipe in, the text you paste out.
 *
 * THIS IS THE POINT OF THE WHOLE TOOL. Studio does not make pictures. It makes
 * the exact input to whatever does, and it makes the same input again next
 * week — which is the thing that actually costs time, because continuity
 * across forty shots is what breaks, not any single image.
 *
 * IT EMITS TWO PROMPTS, BECAUSE THE PIPELINE HAS TWO STEPS. Kling, Runway, Veo
 * and Sora all take a still and animate it, so:
 *
 *   ANCHOR — what the start frame looks like. Every noun: who, wearing what,
 *   where, lit how, from which angle, on what lens. No verbs of camera.
 *
 *   MOTION — what happens over the next few seconds. The camera move and her
 *   action, and almost nothing else. Image-to-video models take the look from
 *   the frame you gave them; describing the look again here is the commonest
 *   way to make them redraw it and lose the face.
 *
 * THE STYLE SUFFIXES ARE LIFTED FROM docs/world/PANORAMA_PROMPTS.md, VERBATIM,
 * and that is deliberate rather than lazy. Eighteen rooms were generated
 * against those exact strings. A shot of Luna in the farmhouse that uses
 * different words for the farmhouse will not sit in the same world as the
 * farmhouse, and the whole product is one world.
 *
 * THE CONSISTENCY BLOCK IS SEPARATE FROM THE ANCHOR ON PURPOSE. Tattoo
 * placement, wardrobe, hair length — these are the details that quietly go
 * missing on shot nine and are expensive to notice on shot forty. They come
 * out as their own paste-able block so they survive being edited around.
 */

import {
  aspects,
  azimuths,
  byId,
  cameraHeights,
  lenses,
  lighting,
  movements,
  shotSizes,
  tilts,
  timesOfDay,
  type Option,
} from "@/lib/studio/vocab";
import type { ShotRecipe, StudioRef } from "@/lib/studio/types";

/**
 * Per-place look, matching the shared style suffixes in PANORAMA_PROMPTS.md.
 * Places that share a suffix there share one here.
 */
const placeStyle: Record<string, string> = {
  farmhouse:
    "rustic modern farmhouse, honey-to-walnut reclaimed wood, hand-hewn beams, plaster and stone, warm amber low light, cream and greige neutrals, moody and intimate",
  lakehouse:
    "modern lakeside timber and glass, pale oak and charcoal stone, big windows onto dark water, cool blue hour outside and warm firelight inside, moody and intimate",
  lake:
    "modern lakeside timber and glass, pale oak and charcoal stone, big windows onto dark water, cool blue hour outside and warm firelight inside, moody and intimate",
  bar:
    "low-lit interior, deep green and oxblood, brass and smoked glass, pools of warm light against darkness, film-noir contrast",
  burnetts:
    "low-lit interior, deep green and oxblood, brass and smoked glass, pools of warm light against darkness, film-noir contrast",
  downtown:
    "low-lit interior, deep green and oxblood, brass and smoked glass, pools of warm light against darkness, film-noir contrast",
  garage:
    "working motorsport garage, polished concrete, steel shelving, cold overhead fluorescents against warm task lamps",
  "coffee-shop": "soft naturalistic daylight, muted earth tones, unstyled and real",
  park: "soft naturalistic daylight, muted earth tones, unstyled and real",
  fair: "strung festival lights over a dark field, warm bulbs against blue night, carnival colour kept muted",
  mexico: "hot coastal light, bleached sand and deep water, white plaster and dark wood, salt haze",
  "new-york": "anonymous luxury hotel interior, cool grey and brass, city glow through glass, two thousand miles from anywhere",
  apartment: "small city apartment at night, one lamp, city light through the window, lived-in",
  "the-study": "a dim panelled study, leather and old wood, one green banker's lamp, decades of the same chair",
};

/** Held constant across everything so shots cut together. */
const HOUSE_STYLE =
  "cinematic photoreal film still, 35mm film grain, natural skin texture, muted desaturated palette, practical light only, no text, no watermark, no logo";

/** What consistently ruins these, in the order it ruins them. */
const NEGATIVE =
  "no text, no watermark, no logo, no extra fingers, no distorted hands, no plastic skin, no beauty retouching, no teeth showing in a neutral expression, no bright saturated colour, no lens flare, no motion blur on the face, no second person in frame unless specified, no modern phone unless specified";

export interface CompiledShot {
  anchor: string;
  motion: string;
  consistency: string;
  negative: string;
  /** Reference images the generator should be handed, grouped by their job. */
  referenceBrief: { heading: string; items: string[] }[];
  /** Things Studio knows are missing. Shown as warnings, not errors. */
  gaps: string[];
}

function phrase(o: Option): string {
  return o.prompt;
}

export function compileShot(
  recipe: ShotRecipe,
  refs: StudioRef[],
  names: Record<string, string>,
): CompiledShot {
  const chosen = refs.filter((r) => recipe.refIds.includes(r.id));
  const size = byId(shotSizes, recipe.camera.sizeId);
  const height = byId(cameraHeights, recipe.camera.heightId);
  const tilt = byId(tilts, recipe.camera.tiltId);
  const azimuth = byId(azimuths, recipe.camera.azimuthId);
  const lens = byId(lenses, recipe.camera.lensId);
  const move = byId(movements, recipe.camera.movementId);
  const light = byId(lighting, recipe.lightingId);
  const time = byId(timesOfDay, recipe.timeId);

  const who = recipe.characterIds.map((id) => names[id] ?? id);
  const subject =
    who.length === 0
      ? "a woman"
      : who.length === 1
        ? who[0]
        : `${who.slice(0, -1).join(", ")} and ${who[who.length - 1]}`;

  const wardrobe = chosen
    .filter((r) => r.kind === "wardrobe")
    .map((r) => (r.notes.trim() ? `${r.label} (${r.notes.trim()})` : r.label));

  const style = recipe.placeId ? placeStyle[recipe.placeId] : undefined;

  /* ---- the anchor: every noun, no camera verbs ---------------------------- */
  const anchorParts = [
    size.id === "insert" ? phrase(size) : `${phrase(size)} of ${subject}`,
    size.qualifier,
    recipe.action.trim(),
    size.id === "insert" ? "" : phrase(azimuth),
    wardrobe.length ? `wearing ${wardrobe.join(", ")}` : "",
    style,
    phrase(time),
    phrase(light),
    phrase(height),
    tilt.id === "level" ? "" : phrase(tilt),
    phrase(lens),
    HOUSE_STYLE,
  ];

  /* ---- the motion: the move and the action, and as little else as possible */
  const motionParts = [
    phrase(move),
    // The action goes in VERBATIM. It is written as a participle phrase
    // ("standing at the window…"), so bolting a pronoun on the front produces
    // "she standing at the window" — and a motion prompt is read by a model
    // that will happily reproduce the broken grammar as broken movement.
    recipe.action.trim(),
    "performance stays subtle, no sudden movement, identity and wardrobe unchanged from the source frame",
  ];

  /* ---- consistency: the things that go missing on shot nine --------------- */
  const consistencyLines: string[] = [];
  for (const id of recipe.characterIds) {
    const forThis = chosen.filter((r) => r.characterId === id);
    const tats = forThis.filter((r) => r.kind === "tattoo");
    const hair = forThis.filter((r) => r.kind === "hair");
    const name = names[id] ?? id;
    if (tats.length)
      consistencyLines.push(
        `${name} — tattoos: ${tats.map((t) => `${t.label}${t.notes.trim() ? `, ${t.notes.trim()}` : ""}`).join("; ")}`,
      );
    if (hair.length)
      consistencyLines.push(
        `${name} — hair: ${hair.map((h) => `${h.label}${h.notes.trim() ? `, ${h.notes.trim()}` : ""}`).join("; ")}`,
      );
  }
  if (wardrobe.length) consistencyLines.push(`Wardrobe: ${wardrobe.join("; ")}`);
  if (recipe.extra.trim()) consistencyLines.push(recipe.extra.trim());

  /* ---- the reference brief ------------------------------------------------ */
  const groups: { heading: string; items: string[] }[] = [];
  const group = (heading: string, kinds: string[]) => {
    const items = chosen
      .filter((r) => kinds.includes(r.kind))
      .map((r) => refLine(r, names));
    if (items.length) groups.push({ heading, items });
  };
  group("Identity — hand these first", ["face", "body"]);
  group("Wardrobe", ["wardrobe", "hair"]);
  group("Marks and props", ["tattoo", "prop"]);
  group("Room and light", ["environment", "lighting"]);
  group("Pose and previous frames", ["pose", "frame"]);

  /* ---- gaps: what Studio can see is not there ----------------------------- */
  const gaps: string[] = [];
  const faces = chosen.filter((r) => r.kind === "face");
  if (recipe.characterIds.length && faces.length === 0 && size.id !== "insert") {
    gaps.push(
      "No face reference attached. Identity will drift — pick one in the library, or accept that this is a new person.",
    );
  }
  // AN UNTAGGED FACE IS NOT A FRONT-ON FACE, and this used to say it was.
  // `byId` falls back to the first option when it gets null, so a reference
  // uploaded without an angle — which is every reference, since the uploader
  // does not ask — was reported as "Front on". The panel then told you that
  // you had two front-on shots of Luna when it had no idea what either one
  // was. Untagged is its own state and says so.
  const untagged = faces.filter((r) => !r.angleId);
  const tagged = faces.filter((r) => r.angleId);
  const wantedAngle = recipe.camera.azimuthId;
  const haveAngle = tagged.some((r) => r.angleId === wantedAngle);

  if (untagged.length && size.id !== "insert") {
    gaps.push(
      `${untagged.length} face reference${untagged.length > 1 ? "s have" : " has"} no angle recorded, so the angle picker cannot use ${untagged.length > 1 ? "them" : "it"}. Set it in the library — it is the one tag that does real work.`,
    );
  }
  if (tagged.length && !haveAngle && size.id !== "insert") {
    gaps.push(
      `No face reference at "${azimuth.label}". You have ${tagged
        .map((f) => byId(azimuths, f.angleId ?? "front").label)
        .join(", ")}. Nothing can invent this angle from what is here — shoot or generate one and add it.`,
    );
  }
  for (const id of recipe.characterIds) {
    if (!chosen.some((r) => r.characterId === id)) {
      gaps.push(`Nothing attached for ${names[id] ?? id}.`);
    }
  }
  if (!recipe.placeId) gaps.push("No place set, so no environment style suffix. Shots will not cut together.");
  if (!recipe.action.trim()) gaps.push("No action written. The anchor will be a portrait, not a moment.");

  return {
    anchor: join(anchorParts),
    motion: join(motionParts),
    consistency: consistencyLines.join("\n"),
    negative: NEGATIVE,
    referenceBrief: groups,
    gaps,
  };
}

function refLine(r: StudioRef, names: Record<string, string>): string {
  const who = r.characterId ? `${names[r.characterId] ?? r.characterId} — ` : "";
  const angle = r.angleId ? ` (${byId(azimuths, r.angleId).label})` : "";
  const note = r.notes.trim() ? ` — ${r.notes.trim()}` : "";
  return `${who}${r.label}${angle}${note}`;
}

function join(parts: (string | undefined)[]): string {
  return parts
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .join(", ");
}


/* ─────────────────────────────── by target ─────────────────────────────── */

/**
 * Where the prompt is going. The three take genuinely different shapes, and
 * handing one the other's format is most of why a good shot comes back wrong.
 *
 *   VIDEO — Kling, Runway, Veo, Sora. Two prompts: a still, then a motion
 *   line. Comma-separated nouns, plus a negative. This is what `compileShot`
 *   emits and what the four blocks in the builder have always been.
 *
 *   CHATGPT — one paragraph of ordinary English. It is a conversation, not a
 *   tag parser: a comma-salad of forty nouns reads to it as a list to
 *   summarize rather than a specification to follow. It also does not take a
 *   negative prompt in any useful sense — "no X" reliably puts X in the frame —
 *   so exclusions are phrased as positives or dropped.
 *
 *   GEMINI — the same paragraph shape, but it holds a longer, denser
 *   description without losing the thread, and it takes an explicit "Avoid:"
 *   line. It is also, in Melissa's words, the one with fewer constraints:
 *   material this story is full of — a hand at a throat, two people in a bed —
 *   comes back from ChatGPT refused or sanded down into something that is not
 *   the scene. That is the whole reason there are two buttons.
 *
 * NEITHER OF THE CHAT TARGETS GETS A MOTION LINE. They make stills. Pasting
 * "slow push in toward her" into an image generator asks it to draw a camera
 * move, and it will try.
 */
export type PromptTarget = "chatgpt" | "gemini" | "video";

export interface TargetedPrompt {
  /** The single block to copy. */
  text: string;
  /** The reference files to attach, by the label they were uploaded under. */
  attach: string[];
  /** Said above the button, when there is something worth saying. */
  caution?: string;
}

export function compileForTarget(
  recipe: ShotRecipe,
  refs: StudioRef[],
  names: Record<string, string>,
  target: Exclude<PromptTarget, "video">,
): TargetedPrompt {
  const chosen = refs.filter((r) => recipe.refIds.includes(r.id));
  const size = byId(shotSizes, recipe.camera.sizeId);
  const azimuth = byId(azimuths, recipe.camera.azimuthId);
  const lens = byId(lenses, recipe.camera.lensId);
  const height = byId(cameraHeights, recipe.camera.heightId);
  const tilt = byId(tilts, recipe.camera.tiltId);
  const light = byId(lighting, recipe.lightingId);
  const time = byId(timesOfDay, recipe.timeId);
  const aspect = byId(aspects, recipe.aspectId);

  const who = recipe.characterIds.map((id) => names[id] ?? id);
  const subject = who.length ? who.join(" and ") : "a woman";
  const identity = chosen.filter((r) => r.kind === "face" || r.kind === "body");
  const wardrobe = chosen
    .filter((r) => r.kind === "wardrobe" || r.kind === "hair")
    .map((r) => (r.notes.trim() ? `${r.label} (${r.notes.trim()})` : r.label));
  const marks = chosen
    .filter((r) => r.kind === "tattoo")
    .map((r) => `${r.label}${r.notes.trim() ? ` — ${r.notes.trim()}` : ""}`);
  const style = recipe.placeId ? placeStyle[recipe.placeId] : undefined;

  const lines: string[] = [];
  lines.push(
    `A cinematic, photorealistic film still, ${aspect.label}. Not an illustration and not a render — a frame from a film.`,
  );
  lines.push("");

  if (identity.length) {
    lines.push(
      `WHO: ${subject}. Use the attached reference image${identity.length > 1 ? "s" : ""} for her face and keep her exactly as she appears there — same bone structure, same colouring, same hair. This is a specific woman, not a type.`,
    );
  } else {
    lines.push(`WHO: ${subject}.`);
  }

  const framing =
    size.id === "insert"
      ? `${size.prompt}, ${size.qualifier}`
      : `a ${size.prompt}, ${size.qualifier}, seen ${azimuth.prompt}`;
  lines.push(
    `THE SHOT: ${framing}.${recipe.action.trim() ? ` She is ${stripPronoun(recipe.action.trim())}.` : ""}`,
  );

  if (style) lines.push(`THE ROOM: ${style}.`);
  lines.push(`LIGHT: ${time.prompt}, ${light.prompt}.`);
  lines.push(
    `CAMERA: ${lens.prompt}, ${height.prompt}${tilt.id === "level" ? "" : `, ${tilt.prompt}`}.`,
  );

  if (wardrobe.length) lines.push(`WEARING: ${wardrobe.join("; ")}.`);
  if (marks.length) lines.push(`MUST STAY CONSISTENT: ${marks.join("; ")}.`);
  if (recipe.extra.trim()) lines.push(`ALSO: ${recipe.extra.trim()}`);

  lines.push("");
  lines.push(
    "LOOK: 35mm film grain, natural skin texture with pores and imperfection, muted desaturated palette, practical light only, shallow depth of field. Nothing glossy, nothing retouched, no beauty filter.",
  );

  if (target === "gemini") {
    // Gemini takes an explicit exclusion list and does the right thing with it.
    lines.push(
      "AVOID: text, watermarks, logos, plastic or airbrushed skin, beauty retouching, bright saturated colour, lens flare, a posed smile, extra fingers, anyone else in frame unless named above.",
    );
  }

  return {
    text: lines.join("\n"),
    attach: chosen.map((r) => r.label),
    caution:
      target === "chatgpt"
        ? "ChatGPT refuses or sands down intimate and violent material — a hand at a throat, two people in a bed. For those, use the Gemini block."
        : undefined,
  };
}

/** "she stands at the window" and "stands at the window" both read right. */
function stripPronoun(s: string): string {
  return s.replace(/^(she|he|they)\s+/i, "");
}
