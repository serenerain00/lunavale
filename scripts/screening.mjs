/**
 * screening.mjs — private, password-protected screening pages for festivals.
 *
 * WHY (2026-11-16). Melissa is submitting an 8-minute scene to an AI film
 * festival that takes a URL plus a password. The scene may or may not make
 * the series, and if it does it is seasons away, so it must never be
 * reachable by free visitors OR members. It is therefore NOT a clip: it is in
 * no content module, no catalog, no sitemap, no menu. It exists only as a row
 * in the `screenings` table and a private blob.
 *
 * THE REPO IS PUBLIC, so the token and password are generated here, stored
 * only in the database (password as a scrypt hash), and printed once. Never
 * commit them, never put them in a content file.
 *
 *   node --env-file=.env.local scripts/screening.mjs create \
 *     --file=stories/<folder>/<film>.mp4 --title="…" --closes=2027-03-31 \
 *     [--credit="…"] [--poster-at=48] [--note="AI film festival"]
 *   node --env-file=.env.local scripts/screening.mjs list
 *   node --env-file=.env.local scripts/screening.mjs close <token-prefix>
 *   node --env-file=.env.local scripts/screening.mjs extend <token-prefix> 2027-06-30
 *   node --env-file=.env.local scripts/screening.mjs password <token-prefix>   # new password
 *   node --env-file=.env.local scripts/screening.mjs replace <token-prefix> --file=… [--poster-at=50]
 *     (a new cut: same link, same password; the old film is deleted from Blob)
 *
 * The video is remuxed with +faststart (no re-encode, so no quality loss) so
 * it starts playing before it has fully downloaded.
 */

import { execFileSync } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { del, put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

const SITE = "https://lunavale38.com";
const [cmd, ...rest] = process.argv.slice(2);
const arg = (k) => rest.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const positional = rest.filter((a) => !a.startsWith("--"));
const sql = neon(process.env.DATABASE_URL);

/** No 0/O/1/l/I: it gets typed into a festival form by hand. */
function password() {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  const b = randomBytes(12);
  const s = [...b].map((x) => abc[x % abc.length]).join("");
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

function hash(pw) {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, 32).toString("hex")}`;
}

async function one(prefix) {
  if (!prefix || prefix.length < 6) throw new Error("Give at least 6 characters of the token.");
  const rows = await sql`SELECT token FROM screenings WHERE token LIKE ${prefix + "%"}`;
  if (rows.length !== 1) throw new Error(`${rows.length} screenings match ${prefix}`);
  return rows[0].token;
}

/** Remux with faststart + grab a poster, upload both under a fresh folder. */
async function uploadFilm(file, posterAt) {
  statSync(file);
  const id = randomBytes(8).toString("hex"); // blob folder, unrelated to the token
  const tmp = mkdtempSync(path.join(tmpdir(), "screening-"));
  try {
    const film = path.join(tmp, "film.mp4");
    const poster = path.join(tmp, "poster.jpg");
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", file, "-c", "copy", "-movflags", "+faststart", film]);
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", posterAt ?? "48", "-i", file,
      "-frames:v", "1", "-vf", "scale=1920:-2", "-q:v", "3", poster]);
    const blobPath = `screenings/${id}/film.mp4`;
    const posterPath = `screenings/${id}/poster.jpg`;
    console.log(`uploading ${(statSync(film).size / 1e6).toFixed(0)}MB…`);
    await put(blobPath, readFileSync(film), {
      access: "private", contentType: "video/mp4", multipart: true, addRandomSuffix: false,
    });
    await put(posterPath, readFileSync(poster), {
      access: "private", contentType: "image/jpeg", addRandomSuffix: false,
    });
    return { blobPath, posterPath };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (cmd === "replace") {
  const t = await one(positional[0]);
  const file = arg("file");
  if (!file) throw new Error("replace <prefix> --file=… [--poster-at=50]");
  const [old] = await sql`SELECT blob_path, poster_path FROM screenings WHERE token = ${t}`;
  const { blobPath, posterPath } = await uploadFilm(file, arg("poster-at"));
  await sql`UPDATE screenings SET blob_path = ${blobPath}, poster_path = ${posterPath} WHERE token = ${t}`;
  // Only after the row points at the new film, so the page never 404s mid-swap.
  const { list } = await import("@vercel/blob");
  const gone = (await list({ prefix: old.blob_path.replace(/film\.mp4$/, "") })).blobs.map((b) => b.url);
  if (gone.length) await del(gone);
  console.log(`replaced — same link and password, now ${file}`);
} else if (cmd === "create") {
  const file = arg("file"), title = arg("title"), closes = arg("closes");
  if (!file || !title || !closes) throw new Error("Need --file, --title and --closes=YYYY-MM-DD");
  const closesAt = new Date(`${closes}T23:59:59-05:00`);
  if (!(closesAt > new Date())) throw new Error("--closes must be in the future");

  const token = randomBytes(18).toString("base64url"); // 24 chars, 144 bits
  const pw = password();
  {
    const { blobPath, posterPath } = await uploadFilm(file, arg("poster-at"));
    await sql`INSERT INTO screenings (token, title, credit, blob_path, poster_path,
                password_hash, cookie_secret, closes_at, note)
              VALUES (${token}, ${title}, ${arg("credit") ?? null}, ${blobPath}, ${posterPath},
                ${hash(pw)}, ${randomBytes(32).toString("hex")}, ${closesAt.toISOString()},
                ${arg("note") ?? null})`;
    console.log(`\nURL:       ${SITE}/screening/${token}\nPassword:  ${pw}\nCloses:    ${closes}\n`);
    console.log("Printed once. Only the hash is stored — use `password` to issue a new one.");
  }
} else if (cmd === "list") {
  for (const r of await sql`SELECT token, title, closes_at, note, created_at FROM screenings ORDER BY created_at`) {
    const open = new Date(r.closes_at) > new Date();
    console.log(`${r.token.slice(0, 6)}…  ${open ? "OPEN  " : "closed"}  until ${r.closes_at.toISOString().slice(0, 10)}  ${r.title}${r.note ? `  (${r.note})` : ""}`);
  }
} else if (cmd === "close") {
  const t = await one(positional[0]);
  await sql`UPDATE screenings SET closes_at = now() WHERE token = ${t}`;
  console.log("closed — the page and video now 404");
} else if (cmd === "extend") {
  const t = await one(positional[0]);
  const d = new Date(`${positional[1]}T23:59:59-05:00`);
  if (Number.isNaN(d.getTime())) throw new Error("extend <prefix> YYYY-MM-DD");
  await sql`UPDATE screenings SET closes_at = ${d.toISOString()} WHERE token = ${t}`;
  console.log(`open until ${positional[1]}`);
} else if (cmd === "password") {
  const t = await one(positional[0]);
  const pw = password();
  // New cookie secret too, so anybody let in with the old password is out.
  await sql`UPDATE screenings SET password_hash = ${hash(pw)},
              cookie_secret = ${randomBytes(32).toString("hex")} WHERE token = ${t}`;
  console.log(`New password: ${pw}`);
} else {
  console.error("create | list | close <prefix> | extend <prefix> <date> | password <prefix> | replace <prefix> --file=…");
  process.exit(1);
}
