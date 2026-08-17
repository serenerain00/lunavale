/**
 * find-hooks.mjs — propose preview windows that end one beat before the answer.
 *
 * WHAT THIS IS FOR. Previews used to be the first fifteen seconds of a scene,
 * which is the one window guaranteed to contain no payoff: openings establish.
 * Melissa's rewrite (2026-08-10) is that a preview should stop immediately
 * before the thing you want to know — the confession, the answer, the
 * decision — so the last thing a visitor feels is a question.
 *
 * WHAT IT DOES NOT DO IS DECIDE. It transcribes the scene, scores every line
 * for how badly you would want to hear what comes next, and prints the best
 * candidates WITH the surrounding dialogue. A person picks. That matters here
 * for two reasons:
 *
 *   1. The transcript is unreliable by design. Melissa mixes music over
 *      dialogue on purpose (it is not a fault to be fixed), so on a scored
 *      scene whisper will mishear lines and miss others entirely. A scorer
 *      trusted to act alone would cut confidently in the wrong place.
 *
 *   2. "The strongest moment" is a judgement about a story, and the story is
 *      in LUNA_VAULT_CONTEXT.md and the journal, not in the audio. The scorer
 *      can find where somebody asks a question. It cannot know that the
 *      question matters.
 *
 * So: this narrows six minutes to five candidates, a human reads them against
 * the canon, and the answer goes into `preview.hookStart` in videos.ts where
 * it is reviewable and stays put.
 *
 * Usage:
 *   node scripts/find-hooks.mjs <slug> [...]     # propose windows
 *   node scripts/find-hooks.mjs --all            # every premium scene
 *   node scripts/find-hooks.mjs <slug> --json    # machine-readable
 *
 * Requires whisper-cli (brew install whisper-cpp) and a model at
 * ~/.cache/whisper.cpp/ggml-small.en.bin — see WHISPER_MODEL below.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const ROOT = path.join(import.meta.dirname, "..");
const WHISPER_MODEL =
  process.env.WHISPER_MODEL ??
  path.join(os.homedir(), ".cache/whisper.cpp/ggml-small.en.bin");
const WORK = path.join(os.tmpdir(), "luna-hooks");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const wantAll = args.includes("--all");
const slugs = args.filter((a) => !a.startsWith("--"));

/**
 * Preview length, mirroring make-previews.mjs EXACTLY — including its
 * per-scene overrides and its one-third-of-runtime cap.
 *
 * It was a flat 15 here at first, which quietly produced wrong hookStart
 * values for the two scenes that get a minute: the tool subtracted 15 from the
 * end of the window and the cutter then ran 60 seconds from that point, ending
 * three quarters of a minute past the line the hook was chosen for. If these
 * two ever disagree again, the candidates are silently wrong rather than
 * visibly broken, so they are kept in one shape.
 */
const MAX_SECONDS = 15;
const MAX_FRACTION = 1 / 3;
const OVERRIDES = { "josh-luna-wall": 60, "luna-tyson-casey-bar": 60 };
const windowFor = (slug, duration) =>
  Math.min(OVERRIDES[slug] ?? MAX_SECONDS, Math.floor(duration * MAX_FRACTION));

/**
 * Lines that make somebody need the next one.
 *
 * These are weights on a hunch, not science, and they are deliberately about
 * SHAPE rather than vocabulary: a question with no answer yet, a sentence that
 * stops, a name said on its own. Vocabulary lists ("love", "sorry") reward
 * melodrama, which is the exact register CLAUDE.md rules out.
 */
function scoreLine(text, next, gapAfter) {
  const t = text.trim();
  let score = 0;
  const why = [];

  if (/\?$/.test(t)) {
    score += 3;
    why.push("ends on a question");
  }
  // An unfinished sentence — the transcript's own em dash, or no terminator.
  if (/[—-]$/.test(t) || !/[.?!]$/.test(t)) {
    score += 2;
    why.push("unfinished");
  }
  // A pause after the line is a person deciding whether to answer.
  if (gapAfter >= 1.5) {
    score += 3;
    why.push(`${gapAfter.toFixed(1)}s of silence after it`);
  } else if (gapAfter >= 0.8) {
    score += 1.5;
    why.push(`${gapAfter.toFixed(1)}s pause`);
  }
  // Short lines land harder than long ones.
  const words = t.split(/\s+/).length;
  if (words <= 6 && words >= 2) {
    score += 1.5;
    why.push("short");
  }
  // Second person: something is being asked OF someone.
  if (/\b(you|your)\b/i.test(t)) {
    score += 1;
    why.push("about the other person");
  }
  // The next line existing at all is what makes this a cliffhanger — if the
  // scene simply ends here there is nothing to withhold.
  if (!next) {
    score -= 4;
    why.push("nothing follows (scene ends)");
  }
  return { score, why };
}

function transcribe(src, slug) {
  if (!existsSync(WHISPER_MODEL)) {
    console.error(
      `No whisper model at ${WHISPER_MODEL}.\n` +
        `  curl -L -o "${WHISPER_MODEL}" \\\n` +
        `    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin`,
    );
    process.exit(1);
  }
  mkdirSync(WORK, { recursive: true });
  const wav = path.join(WORK, `${slug}.wav`);
  // 16kHz mono is what whisper wants; anything else it resamples internally.
  execFileSync(
    "ffmpeg",
    ["-nostdin", "-y", "-loglevel", "error", "-i", src, "-ar", "16000", "-ac", "1", wav],
    { stdio: "inherit" },
  );
  const base = path.join(WORK, slug);
  execFileSync(
    "whisper-cli",
    ["-m", WHISPER_MODEL, "-f", wav, "-oj", "-of", base, "-np", "-pp"],
    { stdio: ["ignore", "ignore", "inherit"] },
  );
  const json = JSON.parse(readFileSync(`${base}.json`, "utf8"));
  rmSync(wav, { force: true });
  return (json.transcription ?? []).map((s) => ({
    from: s.offsets.from / 1000,
    to: s.offsets.to / 1000,
    text: s.text.trim(),
  }));
}

/** Premium scenes, scraped the same way make-previews.mjs does it. */
function premiumScenes() {
  const text = readFileSync(path.join(ROOT, "lib/content/videos.ts"), "utf8");
  const out = [];
  for (const block of text.split(/\n {2}\{/)) {
    const slug = block.match(/slug: "([^"]+)"/)?.[1];
    const access = block.match(/access: "(\w+)"/)?.[1];
    const file = block.match(/file: "([^"]+)"/)?.[1];
    const title = block.match(/title: "([^"]+)"/)?.[1];
    const duration = Number(block.match(/durationSeconds: (\d+)/)?.[1]);
    if (slug && access === "premium" && file && duration) {
      out.push({ slug, file, title, duration });
    }
  }
  return out;
}

const all = premiumScenes();
const chosen = wantAll ? all : all.filter((s) => slugs.includes(s.slug));
if (chosen.length === 0) {
  console.error(
    slugs.length
      ? `No premium scene matched: ${slugs.join(", ")}`
      : "Usage: node scripts/find-hooks.mjs <slug> | --all",
  );
  process.exit(1);
}

const report = [];
for (const scene of chosen) {
  const src = path.join(ROOT, "stories", scene.file);
  if (!existsSync(src)) {
    console.error(`  MISSING ${scene.file}`);
    continue;
  }
  if (!asJson) console.error(`transcribing ${scene.slug}…`);
  const lines = transcribe(src, scene.slug);

  const WINDOW = windowFor(scene.slug, scene.duration);
  const scored = lines.map((line, i) => {
    const next = lines[i + 1];
    const gapAfter = next ? next.from - line.to : 0;
    const { score, why } = scoreLine(line.text, next, gapAfter);
    // A window has to fit before it: you cannot end at 0:04.
    const fits = line.to >= WINDOW;
    return { ...line, i, score: fits ? score : -99, why, next: next?.text ?? "" };
  });

  const best = [...scored].sort((a, b) => b.score - a.score).slice(0, 5);
  report.push({
    slug: scene.slug,
    title: scene.title,
    duration: scene.duration,
    window: WINDOW,
    lineCount: lines.length,
    candidates: best.map((c) => ({
      // End ON the line, so the preview contains it and stops. The window
      // starts WINDOW seconds earlier, clamped to the top of the scene.
      hookStart: Math.max(0, Math.round((c.to - WINDOW) * 10) / 10),
      endsAt: Math.round(c.to * 10) / 10,
      score: Math.round(c.score * 10) / 10,
      why: c.why,
      lastLine: c.text,
      withheld: c.next,
    })),
    transcript: lines,
  });
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const r of report) {
    const mmss = (n) =>
      `${Math.floor(n / 60)}:${String(Math.round(n) % 60).padStart(2, "0")}`;
    console.log(`\n${"=".repeat(72)}\n${r.title} (${r.slug}) — ${mmss(r.duration)}, ${r.lineCount} lines\n`);
    if (r.lineCount === 0) {
      console.log("  NO SPEECH FOUND. Either the mix buries it or there is none.");
      continue;
    }
    r.candidates.forEach((c, n) => {
      console.log(`  ${n + 1}. start ${mmss(c.hookStart)} → ends ${mmss(c.endsAt)}   [${c.score}]  ${c.why.join(", ")}`);
      console.log(`     last line : "${c.lastLine}"`);
      console.log(`     withheld  : "${c.withheld}"\n`);
    });
  }
}
