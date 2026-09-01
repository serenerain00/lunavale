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
  // A FULL MINUTE, Melissa's call on 2026-08-15. The scene runs 5:44, so a
  // minute is under a fifth of it and well inside the one-third rule — but it
  // is four times the house default, so it is a decision rather than a
  // rounding. The first minute is her packing and him arriving, and it ends
  // before he puts a hand on her, which is the question the rest answers.
  "luna-josh-break": 60,

  // 2:15, Melissa's call on release, 2026-08-19: "release the first 2min and
  // 15seconds". The longest public window on the site by some way, and the
  // reasoning holds up on the footage rather than only on her say-so.
  //
  // The scene is 7:36 and it is two people arguing in a garage until it turns.
  // Sampled at five-second steps, the turn is at about 2:55 — he puts a hand
  // to her face and they are kissing by 3:05. 2:15 stops FORTY SECONDS short
  // of it, which is a wider margin than luna-josh-first-night's ten.
  //
  // It also does not cut anybody off mid-word: silencedetect puts a ~6s gap in
  // the dialogue from about 2:12 to 2:19, so the window ends in a pause.
  //
  // Under a third of the runtime, so it needs no exception to the fraction
  // rule — it is only an override because the house default of fifteen seconds
  // would end while they are still saying hello.
  "ty-luna-garage": 135,

  // 30s, Melissa's call on release, 2026-08-20: "this you can show 30sec
  // preview". A sixth of the 2:57 runtime, so well inside the fraction rule.
  //
  // MOVED OFF THE OPENING on 2026-08-20, when the full cut replaced the one
  // that started mid-attack. The scene now opens on about four quiet minutes
  // of her moving around the bedroom before the phone goes, so a window at
  // 0:00 spent its entire thirty seconds on a woman hanging up clothes and
  // ended before anything happened — checked at two-second steps, the phone is
  // still silent at 0:33.
  //
  // hookStart 44 instead: she notices the phone at about 0:48, answers at
  // 0:52, and by 0:54 it has already turned. The window ends at 1:14 with her
  // on her feet, still arguing, and the rest of the scene is what that call
  // does to her.
  //
  // Content in the window: a camisole, a phone, and someone shouting and
  // crying. No nudity, nothing explicit.
  //
  // THE `panic` NOTE MATTERS MORE HERE THAN ANYWHERE. A preview is served with
  // no account and no age check, and thirty seconds of this is thirty seconds
  // of a panic attack. Same reasoning already written down for
  // luna-truck-breakdown's public cut: the note has to be readable before the
  // thing it describes plays, not only for members.
  "luna-ty-panic-attack": 30,

  // 90s, Melissa's call on release, 2026-08-31: "let folks preview the middle
  // of the video, 90 seconds". Second only to ty-luna-garage's 2:15.
  //
  // THE MIDDLE, LITERALLY. The scene runs 4:23 and the window is 1:30–3:00,
  // centred on 2:15 — the true midpoint is 2:11. That is the instruction taken
  // at its word, and it also happens to be the right ninety seconds: sampled
  // at four-second steps, 0:00–0:45 is Tyson alone in the shop and on the
  // phone, and the arrival and the standing-around are over by about 1:30.
  // The window opens exactly where the distance starts to collapse.
  //
  // IT STOPS TWELVE SECONDS SHORT OF THE TURN. He is still being handled at
  // 3:08 — her laughing, his hand at her chin — and he leans in at about 3:12,
  // with the near-kiss sustained from 3:20 and the kiss itself around 3:45.
  // Ending at 3:00 is a wider margin than luna-josh-first-night's ten seconds,
  // narrower than ty-luna-garage's forty. The thing the scene is FOR — that
  // she is the one who closes it, and what she means by doing it small — is
  // entirely outside the window.
  //
  // IT COMES OUT AT 87s, NOT 90, AND THAT IS THE FRACTION RULE WORKING. 90 of
  // 263 is 34%, over the one-third ceiling, and the ceiling is a hard cap on
  // overrides by design — see the Math.min below, and note that every other
  // entry in this table is careful to sit under it. So the request is honoured
  // to within three seconds and the guardrail is left standing. If Melissa
  // wants a literal 90, that is a decision to raise the cap for this scene,
  // not something to slip past it.
  //
  // Content in the window: he is shirtless, as he is for the whole scene, and
  // she is in a tank top. It is faces and hands. Nothing explicit, no nudity.
  "luna-ty-shop-kiss": 90,

  // 30s, Melissa's call on release, 2026-09-01: "this is only going to show
  // the first 30sec". A quarter of the 1:53 runtime, so well inside the
  // fraction rule and no argument with the cap.
  //
  // THE OPENING, against this file's usual hookStart rule, and for the same
  // reason luna-josh-first-night takes it: here the opening IS the hook. He
  // spends the first ten seconds walking away from her across the deck, and
  // the situation — a man finding somewhere else to be in his own friend's
  // house — is stated before anybody says a word.
  //
  // WHAT IT STOPS SHORT OF, sampled at three-second steps: he does not raise
  // his voice until about 1:12, and the thing the scene exists for — the first
  // time he names Josh as the reason he cannot talk to her — is later still.
  // Thirty seconds ends forty-two seconds before the shouting and well before
  // the reason, which is the part worth paying for.
  //
  // Content in the window: two people in a living room, fully dressed, one of
  // them leaving the room. Nothing to flag.
  "luna-ty-lakehouse-confrontation": 30,
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
    // behavior and still right for a scene that opens on its best question.
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
