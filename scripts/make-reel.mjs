/**
 * make-reel.mjs — cut the vertical Instagram reel for a scene.
 *
 * THE REEL AND THE PREVIEW ARE THE SAME EDIT, and that is the entire point of
 * this file existing rather than the cut being made by hand once. Melissa,
 * 2026-09-02: "create a 30sec reel from that video as bait for IG… and then
 * have that be the preview." Both cuts read `preview.segments` out of
 * lib/content/videos.ts, so the thirty seconds on Instagram and the thirty
 * seconds a stranger can watch on the site cannot drift apart — change the in
 * and out points once and re-run both scripts.
 *
 * WHY THE PICTURE IS LETTERBOXED INTO A BLURRED FILL rather than cropped to
 * 9:16. Cropping was tried first and it is not close: the scenes are 1936x1080,
 * a true 9:16 crop keeps the middle 31% of the width, and this material puts
 * people at the EDGES of the frame. At 0:21 of ty-josh-fight a centre crop is a
 * barn door with both men outside it; a 4:5 crop still loses one of them. The
 * action is where the crop is not.
 *
 * So the full landscape frame sits at full width in the middle of a 1080x1920
 * canvas, over a blurred, darkened copy of itself. It is the standard treatment
 * for a film clip on a feed, nothing is lost, and it reads as "this is a scene
 * from something", which is the correct signal for bait.
 *
 * The picture is CENTRED vertically on purpose: Instagram overlays the bottom
 * of a reel with the caption, the audio strip and the buttons, and the right
 * edge with the action rail. Centred, the frame lands clear of all of it.
 *
 * NO BURNED-IN TEXT, no wordmark, no URL. Not an oversight — that is a branding
 * decision with a document behind it (docs/BRAND_AND_TONE.md) and it is
 * Melissa's, not this script's. If she wants a hook line and the domain burned
 * in, note that ffmpeg here has no drawtext: the way it has been done before is
 * a PIL-rendered PNG overlaid with -i, same as the title cards.
 *
 * SOURCE IS THE MASTER, not the 720p streaming proxy, looked up in
 * scripts/import-cuts.sh — the file that already records which export belongs
 * to which scene. A reel is going out at 1080 wide and there is no reason to
 * take it from a copy that has already been squeezed to 720p for streaming.
 *
 * Usage:
 *   node scripts/make-reel.mjs <slug> [source.mp4]
 *   node scripts/make-reel.mjs <slug> --list
 *
 * Writes stories/<slug>-reel.mp4, which is gitignored like every other master.
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const ROOT = path.join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const listOnly = args.includes("--list");
const positional = args.filter((a) => !a.startsWith("--"));
const slug = positional[0];
const sourceOverride = positional[1];

if (!slug) {
  console.error("usage: node scripts/make-reel.mjs <slug> [source.mp4]");
  process.exit(1);
}

/** Reels are 1080x1920. Everything below is derived from that one pair. */
const W = 1080;
const H = 1920;

/**
 * `preview.segments` for a scene, bracket-matched rather than regexed to the
 * first "]" — the value is an array of arrays and a lazy match returns half
 * the edit. Same parser as scripts/make-previews.mjs; duplicated rather than
 * shared because both files are plain node scripts reading TypeScript as text,
 * and a third module to hold nine lines would be worse than the repetition.
 */
function parseSegments(block) {
  const at = block.indexOf("segments:");
  if (at === -1) return null;
  const open = block.indexOf("[", at);
  if (open === -1) return null;

  let depth = 0;
  let close = -1;
  for (let i = open; i < block.length; i += 1) {
    if (block[i] === "[") depth += 1;
    else if (block[i] === "]") {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }
  if (close === -1) return null;

  const nums =
    block.slice(open, close + 1).match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const pairs = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pairs.push([nums[i], nums[i + 1]]);
  return pairs.length > 0 ? pairs : null;
}

/** The scene's block out of videos.ts, by slug. */
function sceneBlock() {
  const text = readFileSync(path.join(ROOT, "lib/content/videos.ts"), "utf8");
  for (const block of text.split(/\n {2}\{/)) {
    if (block.match(/slug: "([^"]+)"/)?.[1] === slug) return block;
  }
  return null;
}

/**
 * The master this scene was cut from, per scripts/import-cuts.sh.
 *
 * That file is already the manifest of which assembled export belongs to which
 * slug, so the reel reads it rather than keeping a second list that could
 * disagree with the first.
 */
function masterFor() {
  const text = readFileSync(path.join(ROOT, "scripts/import-cuts.sh"), "utf8");
  const line = text
    .split("\n")
    .find((l) => l.trim().startsWith(`"${slug}|`));
  if (!line) return null;
  return line.trim().replace(/^"/, "").split("|")[1] ?? null;
}

const block = sceneBlock();
if (!block) {
  console.error(`No scene with slug "${slug}" in lib/content/videos.ts.`);
  process.exit(1);
}

const segments = parseSegments(block);
if (!segments) {
  console.error(
    `"${slug}" has no preview.segments. A reel is cut from the same windows as\n` +
      `the preview — add them in lib/content/videos.ts first, or this would be\n` +
      `guessing at an edit.`,
  );
  process.exit(1);
}

const src = path.join(
  ROOT,
  sourceOverride ?? masterFor() ?? `stories/${slug}.proxy.mp4`,
);
const out = path.join(ROOT, "stories", `${slug}-reel.mp4`);
const total = segments.reduce((n, [from, to]) => n + (to - from), 0);
const mmss = (n) =>
  `${Math.floor(n / 60)}:${String(Math.round(n) % 60).padStart(2, "0")}`;

console.log(`  ${slug}  ${W}x${H}  ${total.toFixed(1)}s`);
console.log(`  source   ${path.relative(ROOT, src)}`);
console.log(
  `  windows  ${segments.map(([f, t]) => `${mmss(f)}-${mmss(t)}`).join(" + ")}`,
);

if (listOnly) process.exit(0);
if (!existsSync(src)) {
  console.error(`  MISSING  ${path.relative(ROOT, src)}`);
  process.exit(1);
}

/*
  The picture over a blurred copy of itself.

  bg: cover the whole 1080x1920 canvas, blur it hard, and pull the brightness
      down so it reads as a backing rather than as a second, confusing image.
      sigma=32 is past the point where anybody can make out what it is, which
      is what stops it competing with the frame in front of it.
  fg: the full landscape frame at canvas width, nothing cropped.

  Rendered per segment and concatenated afterwards, so the join is a stream
  copy and no piece is compressed twice.
*/
const FILTER =
  `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,` +
  `crop=${W}:${H},gblur=sigma=32,eq=brightness=-0.14:saturation=0.6[bg];` +
  `[0:v]scale=${W}:-2[fg];` +
  `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p`;

const dir = mkdtempSync(path.join(tmpdir(), "lv-reel-"));
try {
  const parts = segments.map(([from, to], i) => {
    const part = path.join(dir, `part${i}.mp4`);
    const dur = to - from;
    // Same fade grammar as the preview: a quarter-second up on the first piece
    // because it opens mid-scene, 60ms of audio ramp either side of every join
    // so the splice does not pop, and nothing at all on the end. It is bait; it
    // is supposed to stop rather than finish.
    const af = [
      i === 0 ? "afade=t=in:st=0:d=0.25" : "afade=t=in:st=0:d=0.06",
      `afade=t=out:st=${(dur - 0.06).toFixed(3)}:d=0.06`,
    ].join(",");
    const vf = i === 0 ? `${FILTER},fade=t=in:st=0:d=0.25` : FILTER;

    execFileSync(
      "ffmpeg",
      [
        "-nostdin", "-y", "-loglevel", "error",
        "-ss", String(from),
        "-i", src,
        "-t", String(dur),
        "-filter_complex", vf,
        "-r", "30",
        "-c:v", "libx264", "-preset", "slow", "-crf", "20",
        "-profile:v", "high", "-level", "4.1",
        "-maxrate", "12M", "-bufsize", "24M",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        part,
      ],
      { stdio: "inherit" },
    );
    return part;
  });

  const list = path.join(dir, "list.txt");
  writeFileSync(list, parts.map((f) => `file '${f}'`).join("\n"));
  execFileSync(
    "ffmpeg",
    [
      "-nostdin", "-y", "-loglevel", "error",
      "-f", "concat", "-safe", "0", "-i", list,
      "-c", "copy", "-movflags", "+faststart",
      out,
    ],
    { stdio: "inherit" },
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n  -> ${path.relative(ROOT, out)}`);
