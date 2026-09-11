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
 * is the pretense that a beginning is the most representative slice — on this
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
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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
/**
 * HOW LONG A PREVIEW IS, by how long the scene is. Melissa's policy,
 * 2026-09-11, replacing the flat fifteen seconds:
 *
 *   longer than 3:00  ->  1:00
 *   longer than 2:00  ->  0:45
 *   anything shorter  ->  0:30
 *
 * IT ARRIVED WITH "keep all videos behind membership" and the two halves are
 * one idea. Every scene is now gated, and in exchange the window on each one
 * got substantially bigger — nineteen scenes went UP from fifteen seconds and
 * only three came down. One wall, and a great deal more visible through it.
 *
 * NEVER MORE THAN HALF THE SCENE, which is not a departure from her numbers
 * but the rule underneath them: at exactly sixty seconds her own tier is
 * thirty, which is half. Extending that downwards is what stops a 0:41 scene
 * handing over thirty of its forty-one seconds. It only ever binds below a
 * minute — every scene above that gets the tier exactly.
 *
 * The old MAX_FRACTION of one third no longer applies to the single-window
 * path; these tiers ARE the fraction rule now, and they are more generous by
 * design. It still governs hand-built segment edits below.
 */
function previewSecondsFor(duration) {
  const tier = duration > 180 ? 60 : duration > 120 ? 45 : 30;
  return Math.min(tier, Math.floor(duration / 2));
}

const OVERRIDES = {
  /*
    MOSTLY EMPTIED 2026-09-11, when previewSecondsFor() above became the
    policy. Every entry that used to live here was one of Melissa's per-scene
    calls on release — "release the first 2min and 15seconds", "let folks
    preview the middle, 90 seconds", "the first 1:30 free to watch. its safe" —
    and the new tiers replace all of them. She pointed at ty-luna-garage
    specifically, which held the biggest of them at 2:15, and said it should
    not be that open.

    Three of the retired numbers were ABOVE the new tier and come down:
    ty-luna-garage 135 -> 60, luna-josh-first-night 90 -> 60, luna-ty-shop-kiss
    90 -> 60. All three move in the direction of showing less, so every safety
    margin recorded in their old notes gets wider, not narrower. The rest
    (luna-tyson-casey-bar 60, luna-josh-break 60,
    luna-ty-lakehouse-confrontation 30) already equalled their tier, which is a
    decent sign the tiers match how she has been choosing all along.

    The reasoning for each is in git, not lost, and restoring one is a line.
  */

  /*
    THE ONE THAT STAYS, and it is not a monetization decision.

    luna-ty-panic-attack runs 6:30, so the tier says a minute. Its window is
    thirty seconds and the reason written down when Melissa set it is that a
    preview is served with no account and no age check, and thirty seconds of
    this scene is thirty seconds of a panic attack. The scene carries the
    `panic` content note for exactly that.

    The new policy is about how much of a scene to give away. This number is
    about what a stranger is shown without warning, which is a different
    question, so it survives a rule that did not consider it. Doubling it to
    sixty is Melissa's call to make deliberately rather than mine to make by
    applying a tier.
  */
  "luna-ty-panic-attack": 30,
};

/**
 * `preview.segments` for one scene block, or null.
 *
 * Bracket-matched rather than regexed to a closing "]": the value is an array
 * OF arrays, and the first "]" in it is the end of the first pair, not the end
 * of the field. A lazy regex here would silently return half the edit, which
 * is the kind of bug that ships a fifteen-second preview claiming to be
 * thirty.
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

  const nums = block.slice(open, close + 1).match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const pairs = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pairs.push([nums[i], nums[i + 1]]);
  return pairs.length > 0 ? pairs : null;
}

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
    // behavior and still right for a scene that opens on its best question.
    const hookStart = Number(block.match(/hookStart: ([\d.]+)/)?.[1] ?? 0);
    const segments = parseSegments(block);
    if (slug && access === "premium" && file && duration) {
      out.push({ slug, file, duration, hookStart, segments });
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

/**
 * Cut a preview that is more than one window, by rendering each piece and
 * concatenating them.
 *
 * Each piece is re-encoded to identical settings first, so the join itself can
 * be a stream copy and cannot re-compress anything twice.
 *
 * The FADES are the whole reason this is not four lines. A hard splice between
 * two points in a continuous take pops audibly — the room tone and the score
 * are both mid-phrase — so every piece gets 60ms of audio ramp at each end,
 * which is short enough to be inaudible as a fade and long enough to kill the
 * click. The picture is left to cut hard, because a visible dissolve would
 * make two windows look like one continuous shot, which is a lie about the
 * edit.
 *
 * The 0.25s fade IN on the first piece is the same one the single-window path
 * uses, and for the same reason: a window that opens mid-scene lands hard.
 * There is no fade at the END, also as before — these are meant to stop
 * mid-breath. The hard cut IS the hook.
 */
function cutSegments(src, segments, out) {
  const dir = mkdtempSync(path.join(tmpdir(), "lv-preview-"));
  try {
    const parts = segments.map(([from, to], i) => {
      const part = path.join(dir, `part${i}.mp4`);
      const dur = to - from;
      const vf = i === 0 ? "fade=t=in:st=0:d=0.25" : null;
      const af = [
        i === 0 ? "afade=t=in:st=0:d=0.25" : "afade=t=in:st=0:d=0.06",
        `afade=t=out:st=${(dur - 0.06).toFixed(3)}:d=0.06`,
      ].join(",");
      execFileSync(
        "ffmpeg",
        [
          "-nostdin", "-y", "-loglevel", "error",
          "-ss", String(from),
          "-i", src,
          "-t", String(dur),
          ...(vf ? ["-vf", vf] : []),
          "-af", af,
          "-c:v", "libx264", "-preset", "medium", "-crf", "23",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
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
}

let cut = 0;
for (const scene of scenes) {
  const segments = scene.segments;
  const segmentSeconds = segments
    ? segments.reduce((n, [from, to]) => n + (to - from), 0)
    : 0;

  /*
    A HAND-MADE EDIT IS NOT CLAMPED, it is checked and complained about.

    The single-window path takes Math.min against the one-third rule, so an
    over-long override comes out quietly shortened — which is right for a
    number in the OVERRIDES table and wrong for a list of in and out points.
    Truncating segments would silently drop the last piece of somebody's cut
    and still call it a preview. So this warns and proceeds: the cap exists to
    stop a preview eating the scene, and a person who wrote two windows by hand
    has already decided.
  */
  if (segments && segmentSeconds > scene.duration * MAX_FRACTION) {
    console.error(
      `  WARNING ${scene.slug}: segments total ${segmentSeconds.toFixed(1)}s of a ${scene.duration}s scene — over the one-third rule. Cutting it anyway.`,
    );
  }

  const seconds = segments
    ? segmentSeconds
    : (OVERRIDES[scene.slug] ?? previewSecondsFor(scene.duration));
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
    (segments
      ? ` in ${segments.length} pieces: ${segments.map(([f, t]) => `${mmss(f)}-${mmss(t)}`).join(" + ")}`
      : start
        ? ` from ${mmss(start)}`
        : " from the top");

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
  if (segments) {
    cutSegments(src, segments, out);
  } else {
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
  }
  cut += 1;
  console.log(`  ${plan}  -> ${outName}`);
}

if (!listOnly) {
  console.log(`\n${cut} previews cut.`);
  console.log("Add `preview` to each scene in lib/content/videos.ts, then:");
  console.log("  node --env-file=.env.local scripts/upload-media.mjs");
}
