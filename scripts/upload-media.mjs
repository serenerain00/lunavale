/**
 * upload-media.mjs — push the streaming proxies to Vercel Blob.
 *
 * Story video is gitignored (456MB), so a git-based deploy ships none of it.
 * This is how it gets to production. Run it after adding or re-encoding a
 * proxy; it is safe to re-run, since it skips anything already uploaded at the
 * same size.
 *
 * EVERY UPLOAD IS PRIVATE. A public blob would be a permanent, ungated URL to
 * a premium scene — the exact thing the stream route exists to prevent. The
 * route mints a short-lived signed URL per request, after the entitlement
 * check, and that is the only way these bytes are reachable.
 *
 * Usage:
 *   vercel env pull .env.local        # gets BLOB_READ_WRITE_TOKEN
 *   node scripts/upload-media.mjs             # everything the app references
 *   node scripts/upload-media.mjs luna-tyson-bar   # just one slug
 *   node scripts/upload-media.mjs --dry-run
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { head, put } from "@vercel/blob";

const ROOT = path.join(import.meta.dirname, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const wanted = args.filter((a) => !a.startsWith("--"));

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    "BLOB_READ_WRITE_TOKEN is not set.\n" +
      "Run `vercel env pull .env.local` first, then re-run with:\n" +
      "  node --env-file=.env.local scripts/upload-media.mjs",
  );
  process.exit(1);
}

/**
 * The file list is read out of the content modules rather than globbed off
 * disk, so this uploads exactly what the app references — no stale proxies, and
 * nothing missing.
 */
async function mediaFiles() {
  const sources = ["lib/content/videos.ts", "lib/content/clips.ts"];
  const files = [];
  for (const source of sources) {
    const text = await readFile(path.join(ROOT, source), "utf8");
    // Matches both `file:` on a scene or clip and the `file:` inside a
    // Video.premium block — a scene's members-only cut is a separate proxy
    // that has to reach Blob too, and it is the one nobody notices is
    // missing until a member hits play and gets a 404.
    for (const match of text.matchAll(/file:\s*"([^"]+)"/g)) {
      files.push(match[1]);
    }
  }

  // Takes carry no `file:` field — the proxy name is derived from the slug
  // (lib/content/takes.ts `takeFile`), so there is nothing for the pattern
  // above to find. Read the slugs out of the generated manifests and rebuild
  // the same name here. Driven off the manifests rather than a glob over
  // stories/ so a take that was removed from the data does not keep getting
  // pushed.
  for (const slug of await takeSlugs()) {
    files.push(`${slug}.proxy.mp4`);
  }

  return [...new Set(files)];
}

const TAKES_DATA_DIR = path.join(ROOT, "lib/content/takes-data");

async function takeSlugs() {
  const slugs = [];
  let entries;
  try {
    entries = await readdir(TAKES_DATA_DIR);
  } catch {
    return slugs; // no scene has takes yet
  }
  for (const entry of entries) {
    if (!entry.endsWith(".ts")) continue;
    const text = await readFile(path.join(TAKES_DATA_DIR, entry), "utf8");
    for (const match of text.matchAll(/slug:\s*"(take-[^"]+)"/g)) {
      slugs.push(match[1]);
    }
  }
  return slugs;
}

const files = (await mediaFiles()).filter(
  (file) => wanted.length === 0 || wanted.some((w) => file.startsWith(w)),
);

if (files.length === 0 && wanted.length === 0) {
  console.error("Nothing matched. Known slugs come from lib/content/*.ts");
  process.exit(1);
}
// A slug that matches no video may still match a stills gallery below, so a
// filtered run with no video hits is not an error — fall through to stills.

let uploaded = 0;
let skipped = 0;
let missing = 0;

for (const file of files) {
  const local = path.join(ROOT, "stories", file);
  const pathname = `stories/${file}`;

  let size;
  try {
    size = (await stat(local)).size;
  } catch {
    console.error(`  MISSING  ${file} — not in stories/, re-run the import script`);
    missing += 1;
    continue;
  }

  // Skip anything already there at the same size. Re-encoding changes the
  // size, so a genuinely new cut still gets pushed.
  try {
    const existing = await head(pathname);
    if (existing.size === size) {
      console.log(`  skip     ${file} (${mb(size)})`);
      skipped += 1;
      continue;
    }
  } catch {
    // Not present yet — fall through and upload.
  }

  if (dryRun) {
    console.log(`  would    ${file} (${mb(size)})`);
    continue;
  }

  await put(pathname, await readFile(local), {
    access: "private",
    contentType: "video/mp4",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`  uploaded ${file} (${mb(size)})`);
  uploaded += 1;
}

// --- Members-only stills --------------------------------------------------
// Same private-Blob model as the video above: the optimized copies under
// stills-private/<gallery>/ ship to `stills/<gallery>/...` with access:private,
// and reach a viewer only through the gated /api/still route. Enumerated off
// disk rather than the content module, so whatever `optimize-media.sh
// private-stills` produced gets pushed.
const STILLS_DIR = path.join(ROOT, "stills-private");

async function stillFiles() {
  const out = [];
  let galleries;
  try {
    galleries = await readdir(STILLS_DIR, { withFileTypes: true });
  } catch {
    return out; // nothing optimized locally yet
  }
  for (const g of galleries) {
    if (!g.isDirectory()) continue;
    if (wanted.length && !wanted.some((w) => g.name.startsWith(w))) continue;
    const dir = path.join(STILLS_DIR, g.name);
    for (const f of await readdir(dir)) {
      if (f.endsWith(".jpg")) out.push({ gallery: g.name, file: f });
    }
  }
  return out;
}

for (const { gallery, file } of await stillFiles()) {
  const local = path.join(STILLS_DIR, gallery, file);
  const pathname = `stills/${gallery}/${file}`;
  const size = (await stat(local)).size;

  try {
    const existing = await head(pathname);
    if (existing.size === size) {
      console.log(`  skip     ${gallery}/${file} (${mb(size)})`);
      skipped += 1;
      continue;
    }
  } catch {
    // Not present yet — fall through and upload.
  }

  if (dryRun) {
    console.log(`  would    ${gallery}/${file} (${mb(size)})`);
    continue;
  }

  await put(pathname, await readFile(local), {
    access: "private",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`  uploaded ${gallery}/${file} (${mb(size)})`);
  uploaded += 1;
}

// --- Take poster frames ----------------------------------------------------
// takes-private/<scene>/<take-slug>.jpg -> `takes/<scene>/<take-slug>.jpg`,
// private, reachable only through the gated /api/take route. Identical shape
// to the stills loop above; separate because the prefix and the local
// directory differ, and folding them together would make both harder to read
// than the fifteen duplicated lines are worth.
const TAKES_DIR = path.join(ROOT, "takes-private");

async function takePosterFiles() {
  const out = [];
  let scenes;
  try {
    scenes = await readdir(TAKES_DIR, { withFileTypes: true });
  } catch {
    return out; // no takes imported locally yet
  }
  for (const s of scenes) {
    if (!s.isDirectory()) continue;
    if (wanted.length && !wanted.some((w) => s.name.startsWith(w))) continue;
    const dir = path.join(TAKES_DIR, s.name);
    for (const f of await readdir(dir)) {
      if (f.endsWith(".jpg")) out.push({ scene: s.name, file: f });
    }
  }
  return out;
}

for (const { scene, file } of await takePosterFiles()) {
  const local = path.join(TAKES_DIR, scene, file);
  const pathname = `takes/${scene}/${file}`;
  const size = (await stat(local)).size;

  try {
    const existing = await head(pathname);
    if (existing.size === size) {
      console.log(`  skip     ${scene}/${file} (${mb(size)})`);
      skipped += 1;
      continue;
    }
  } catch {
    // Not present yet — fall through and upload.
  }

  if (dryRun) {
    console.log(`  would    ${scene}/${file} (${mb(size)})`);
    continue;
  }

  await put(pathname, await readFile(local), {
    access: "private",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`  uploaded ${scene}/${file} (${mb(size)})`);
  uploaded += 1;
}

console.log(
  `\n${uploaded} uploaded, ${skipped} already current, ${missing} missing.`,
);
if (missing > 0) process.exitCode = 1;

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
