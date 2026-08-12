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
 * IT USED TO BE ALWAYS THE OPENING, on the argument that a visitor told they
 * saw the start should have seen the start. Melissa replaced that on
 * 2026-08-10: an opening makes somebody feel finished, and the job of a
 * preview is to make them feel the opposite. A window now starts at
 * `preview.hookStart` and ends one beat BEFORE the answer.
 *
 * THE HONESTY PROBLEM THAT ARGUMENT WAS PROTECTING IS REAL AND STILL HANDLED:
 * the page under the player states exactly what was shown and what the whole
 * runtime is, so nobody is told they saw the start of anything. What is gone
 * is the pretence that a beginning is the most representative slice — on this
 * material it usually is not.
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
  // is barely an establishing beat and thirty still cuts away mid-thought.
  // A minute lets the confrontation actually play. It is a sixth of the
  // scene, which is more than anything else here gives away — the trade is
  // deliberate and it is Melissa's.
  //
  // Note this preview now carries the SCORE, because the scene's `file` is
  // the scored cut as of 2026-08-05. The 60s version that existed before the
  // swap was from the dialogue master and sounded different.
  "josh-luna-wall": 60,

  // Melissa's call on release: "we can show the first 1min of it". Fifteen
  // seconds of this one is Luna alone at the bar before Tyson has walked in —
  // the situation the scene is about has not started yet. A minute gets a
  // visitor through the introduction and into the argument, which is the part
  // worth paying for the end of. Just under a third of the 3:24 runtime.
  "luna-tyson-casey-bar": 60,

  // Melissa, 2026-08-12: "The First Night should have the first 1:30 free to
  // watch. its safe" — and it is. The only explicit scene with a public window,
  // which is a real exception to how the rest of this file treats them, so the
  // margin matters: verified frame by frame that 0:00–1:35 is Josh waking her,
  // dark room, her in a camisole, nothing explicit and no nudity. It turns at
  // about 1:40, so a 90s cut stops a clear ten seconds short of the turn.
  //
  // THIS IS THE OPENING, deliberately, against the hookStart rule above. The
  // rule exists because an opening usually makes somebody feel finished; here
  // the opening IS the hook — he cannot sleep so he wakes her, and it is the
  // only stretch of the scene that can be shown at all.
  //
  // It is also very quiet: the score sits far down, around -49dB across this
  // window. Melissa has confirmed that is the mix and not a fault, so the cut
  // carries the audio untouched.
  "luna-josh-first-night": 90,
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
    // Where the hook window starts. Absent = the opening, which is the old
    // behaviour and still right for a scene that opens on its best question.
    const hookStart = Number(block.match(/hookStart: ([\d.]+)/)?.[1] ?? 0);
    if (slug && access === "premium" && file && duration) {
      out.push({ slug, file, duration, hookStart });
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
  // Clamped so a hookStart that outlived an edit cannot silently produce a
  // preview that runs off the end of the scene into nothing.
  const start = Math.max(0, Math.min(scene.hookStart, Math.max(0, scene.duration - seconds)));
  if (scene.hookStart && start !== scene.hookStart) {
    console.error(
      `  WARNING ${scene.slug}: hookStart ${scene.hookStart}s doesn't fit a ${seconds}s window in a ${scene.duration}s scene — using ${start}s`,
    );
  }
  const src = path.join(ROOT, "stories", scene.file);
  const outName = `${scene.slug}-preview.proxy.mp4`;
  const out = path.join(ROOT, "stories", outName);

  const mmss = (n) => `${Math.floor(n / 60)}:${String(Math.round(n) % 60).padStart(2, "0")}`;
  const plan =
    `${scene.slug.padEnd(28)} ${mmss(scene.duration)} -> ${mmss(seconds)}` +
    (start ? ` from ${mmss(start)}` : " from the top");

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
  // whole preview.
  //
  // NO FADE-OUT ANY MORE, and this is the point of the rewrite. A fade is the
  // grammar of an ending — it tells a viewer the thing is over and they are
  // free to go. These are meant to stop mid-breath, one beat before the answer,
  // so that the last thing somebody feels is a question rather than a full
  // stop. The hard cut IS the hook.
  //
  // The fade IN at the start stays, on the other hand: a window that begins
  // mid-scene lands hard, and a quarter-second up is the difference between
  // arriving somewhere and being dropped there.
  const fadeIn = start > 0 ? ["-vf", "fade=t=in:st=0:d=0.25", "-af", "afade=t=in:st=0:d=0.25"] : [];
  execFileSync(
    "ffmpeg",
    [
      "-nostdin", "-y", "-loglevel", "error",
      "-ss", String(start),
      "-i", src,
      "-t", String(seconds),
      ...fadeIn,
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
