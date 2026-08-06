/**
 * make-previews.mjs — cut the public preview for every members-only scene.
 *
 * THE MODEL (Melissa, 2026-08-05): a visitor can watch the opening of any
 * premium scene, and then hits the membership. Not a locked door with a
 * poster behind it — a real piece of the real scene, and then the ask.
 *
 * WHY THESE ARE REAL FILES rather than a timer in the player. The obvious
 * implementation is to serve the whole scene and stop playback after fifteen
 * seconds, and it is worthless: the full file has already been delivered, and
 * anyone who opens devtools has the lot. Every other decision in this repo —
 * private Blob, per-request signed URLs, entitlement resolved server-side —
 * exists to stop exactly that. So the preview is its own file, and a
 * non-member is never sent the bytes of the thing they have not paid for.
 *
 * LENGTH: the lesser of 15s and a THIRD of the runtime. Melissa's call — it
 * started at 60s and came down on 2026-08-06.
 *
 * The FRACTION still matters even at fifteen seconds, and is the reason this
 * is not just a constant: "tyson-cole-bar" runs 0:41, so a flat fifteen would
 * hand over more than a third of it. It gets 0:13 instead. Every scene longer
 * than about three-quarters of a minute gets the full fifteen.
 *
 * IT IS ALWAYS THE OPENING. No hunting for a flattering fifteen seconds: a
 * visitor told they saw the start should have seen the start. It also removes
 * the temptation to cherry-pick, which on some of this material would be the
 * difference between a trailer and a misrepresentation.
 *
 * SOURCE IS `file`, NEVER `premium.file`. Where a scene has an explicit cut
 * (ty-luna-bed), the explicit one is the members' upgrade and must not be the
 * thing a stranger is shown the opening of.
 *
 * Usage:
 *   node scripts/make-previews.mjs            # every premium scene
 *   node scripts/make-previews.mjs <slug> …   # just these
 *   node scripts/make-previews.mjs --list     # show the plan, cut nothing
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const listOnly = args.includes("--list");
const wanted = args.filter((a) => !a.startsWith("--"));

/** Longest a preview may run, and the fraction of a short scene it may take. */
const MAX_SECONDS = 15;
const MAX_FRACTION = 1 / 3;

/**
 * Per-scene exceptions, in seconds. Melissa's call, scene by scene.
 *
 * The default is deliberately short and the same for everything, so an
 * override should have a reason attached — otherwise this table becomes the
 * real rule and the constant above becomes decoration.
 */
const OVERRIDES = {
  // The one scene where fifteen seconds is not a taste of anything. It is a
  // single unbroken six-minute take with no cuts to punctuate it, so fifteen
  // is barely an establishing beat — the confrontation has not had time to
  // read as one before it stops. Thirty gives it room to land while still
  // being a twelfth of the scene, against the sixth a minute would have been.
  "josh-luna-wall": 30,
};

/**
 * Scraped out of the content module rather than imported, for the same reason
 * upload-media.mjs does it: this is a plain node script and videos.ts is
 * TypeScript with path aliases.
 */
function premiumScenes() {
  const text = readFileSync(path.join(ROOT, "lib/content/videos.ts"), "utf8");
  const out = [];
  for (const block of text.split(/\n {2}\{/)) {
    const slug = block.match(/slug: "([^"]+)"/)?.[1];
    const access = block.match(/access: "(\w+)"/)?.[1];
    const file = block.match(/file: "([^"]+)"/)?.[1];
    const duration = Number(block.match(/durationSeconds: (\d+)/)?.[1]);
    if (slug && access === "premium" && file && duration) {
      out.push({ slug, file, duration });
    }
  }
  return out;
}

const scenes = premiumScenes().filter(
  (s) => wanted.length === 0 || wanted.includes(s.slug),
);

if (scenes.length === 0) {
  console.error("No premium scenes matched.");
  process.exit(1);
}

let cut = 0;
for (const scene of scenes) {
  const seconds = Math.min(
    OVERRIDES[scene.slug] ?? MAX_SECONDS,
    Math.floor(scene.duration * MAX_FRACTION),
  );
  const src = path.join(ROOT, "stories", scene.file);
  const outName = `${scene.slug}-preview.proxy.mp4`;
  const out = path.join(ROOT, "stories", outName);

  const mmss = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  const plan = `${scene.slug.padEnd(28)} ${mmss(scene.duration)} -> ${mmss(seconds)}`;

  if (listOnly) {
    console.log(`  ${plan}`);
    continue;
  }
  if (!existsSync(src)) {
    console.error(`  MISSING  ${scene.file} — run the import first`);
    continue;
  }

  // Re-encoded rather than stream-copied: a copy cuts on the nearest keyframe,
  // which at fifteen seconds could overshoot by a meaningful fraction of the
  // whole preview. Fade the last second so it stops rather than snapping.
  execFileSync(
    "ffmpeg",
    [
      "-nostdin", "-y", "-loglevel", "error",
      "-i", src,
      "-t", String(seconds),
      "-vf", `fade=t=out:st=${seconds - 1}:d=1`,
      "-af", `afade=t=out:st=${seconds - 1}:d=1`,
      "-c:v", "libx264", "-preset", "medium", "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
      out,
    ],
    { stdio: "inherit" },
  );
  cut += 1;
  console.log(`  ${plan}  -> ${outName}`);
}

if (!listOnly) {
  console.log(`\n${cut} previews cut.`);
  console.log("Add `preview` to each scene in lib/content/videos.ts, then:");
  console.log("  node --env-file=.env.local scripts/upload-media.mjs");
}
