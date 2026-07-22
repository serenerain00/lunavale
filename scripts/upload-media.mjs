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

import { readFile, stat } from "node:fs/promises";
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
    for (const match of text.matchAll(/file:\s*"([^"]+)"/g)) {
      files.push(match[1]);
    }
  }
  return [...new Set(files)];
}

const files = (await mediaFiles()).filter(
  (file) => wanted.length === 0 || wanted.some((w) => file.startsWith(w)),
);

if (files.length === 0) {
  console.error("Nothing matched. Known slugs come from lib/content/*.ts");
  process.exit(1);
}

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

console.log(
  `\n${uploaded} uploaded, ${skipped} already current, ${missing} missing.`,
);
if (missing > 0) process.exitCode = 1;

function mb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
