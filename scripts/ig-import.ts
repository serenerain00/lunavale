/**
 * ig-import.ts — Instagram's own numbers, from a Meta Business Suite export.
 *
 * Until the Meta API is connected, this is how per-post performance gets in:
 * Melissa exports Insights → Content (CSV, "Lifetime" values) and drops it in
 * ~/lunavale-analytics/instagram/raw/. This reads the newest file and writes
 * ~/lunavale-analytics/instagram/posts.json, which scripts/weekly-report.ts
 * reads. Re-running with a newer export replaces the numbers — they are
 * lifetime totals, so the latest export is simply the truth as of its date.
 *
 * WHAT THE EXPORT CARRIES (checked against the real file, 2026-10-11):
 * views, reach, likes, shares, follows, comments, saves, duration, caption,
 * publish time, permalink, post type. It does NOT carry profile visits or
 * link clicks — "drives website traffic" comes from our own tagged links
 * (docs/analytics/ATTRIBUTION.md), never from here.
 *
 * Publish time is exported as "MM/DD/YYYY HH:MM" in the account's time zone,
 * with no zone given; it is stored as written, with the date part used for
 * weekly grouping.
 *
 * Nothing here leaves this Mac. Captions are Melissa's own published words.
 *
 *   npx tsx scripts/ig-import.ts [path/to/export.csv]
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const DIR = path.join(os.homedir(), "lunavale-analytics", "instagram");

/** RFC 4180 CSV: quoted fields, doubled quotes, newlines inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim()));
}

function newestExport(): string {
  const raw = path.join(DIR, "raw");
  const files = existsSync(raw) ? readdirSync(raw).filter((f) => f.toLowerCase().endsWith(".csv")) : [];
  if (!files.length) throw new Error(`No CSV in ${raw}`);
  return path.join(raw, files.sort((a, b) => statSync(path.join(raw, b)).mtimeMs - statSync(path.join(raw, a)).mtimeMs)[0]);
}

const file = process.argv[2] ?? newestExport();
const [header, ...rows] = parseCsv(readFileSync(file, "utf8").replace(/^﻿/, ""));
const col = (name: string) => {
  const i = header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  if (i < 0) throw new Error(`Export has no "${name}" column — Meta may have changed the format. Columns: ${header.join(", ")}`);
  return i;
};
const C = {
  id: col("Post ID"), caption: col("Description"), duration: col("Duration (sec)"), published: col("Publish time"),
  permalink: col("Permalink"), type: col("Post type"), date: col("Date"), views: col("Views"), reach: col("Reach"),
  likes: col("Likes"), shares: col("Shares"), follows: col("Follows"), comments: col("Comments"), saves: col("Saves"),
};
const n = (v: string | undefined) => (v === undefined || v.trim() === "" ? null : Number(v.replace(/,/g, "")));

/** "10/10/2026 18:26" → "2026-10-10T18:26" (account-local, zone unstated). */
function isoLocal(s: string): string {
  const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (!m) return s.trim();
  const [, mo, d, y, h, mi] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${mi}`;
}

const posts = rows
  .filter((r) => (r[C.date] ?? "").trim().toLowerCase() === "lifetime")
  .map((r) => {
    const permalink = r[C.permalink].trim();
    return {
      id: r[C.id].trim(),
      shortcode: permalink.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#]+)/)?.[1] ?? r[C.id].trim(),
      permalink,
      type: r[C.type].trim(),
      published: isoLocal(r[C.published]),
      durationSeconds: n(r[C.duration]),
      caption: r[C.caption],
      // Historic posts carry no tag; new ones get theirs from the growth queue.
      campaign: null as string | null,
      views: n(r[C.views]), reach: n(r[C.reach]), likes: n(r[C.likes]), shares: n(r[C.shares]),
      follows: n(r[C.follows]), comments: n(r[C.comments]), saves: n(r[C.saves]),
      // The weekly report's column is "plays"; for reels, Meta now calls it views.
      plays: n(r[C.views]),
    };
  })
  .sort((a, b) => a.published.localeCompare(b.published));

const out = path.join(DIR, "posts.json");
writeFileSync(out, JSON.stringify({ source: path.basename(file), importedAt: new Date().toISOString(), posts }, null, 2));
console.log(`${posts.length} posts, ${posts[0]?.published.slice(0, 10)} → ${posts.at(-1)?.published.slice(0, 10)} → ${out}`);
