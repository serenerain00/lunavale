/**
 * ig-push.ts — copy the Instagram numbers from this Mac into the database, so
 * the voice assistant (Erin) can answer questions about posts.
 *
 * Reads what scripts/ig-sync.ts already wrote — nothing here talks to
 * Instagram and nothing here needs the token:
 *   ~/lunavale-analytics/instagram/posts.json     per-post numbers
 *   ~/lunavale-analytics/instagram/account.jsonl  follower snapshots
 *   data/ig-posts.json                            post → campaign / short link
 * and upserts ig_post_stats and ig_account_snapshots (lib/db/schema.sql).
 *
 * Runs after the Monday sync (~/lunavale-analytics/bin/weekly.sh), and on
 * demand:
 *   npm run ig:refresh     # sync from Instagram, then push
 *   npx tsx --env-file=.env.local scripts/ig-push.ts
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const DIR = path.join(os.homedir(), "lunavale-analytics", "instagram");
const REPO = path.join(import.meta.dirname, "..");

interface Post {
  shortcode: string;
  type: string;
  published: string | null;
  durationSeconds: number | null;
  caption: string | null;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  follows: number | null;
  followsSource: string | null;
  avgWatchMs: number | null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set (run with --env-file=.env.local).");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const pack = JSON.parse(readFileSync(path.join(DIR, "posts.json"), "utf8")) as { importedAt: string; posts: Post[] };
  const map = JSON.parse(readFileSync(path.join(REPO, "data/ig-posts.json"), "utf8")) as {
    posts: { shortcode: string | null; campaign: string; go: string | null; asset: string | null }[];
  };
  const tracked = new Map(map.posts.filter((p) => p.shortcode).map((p) => [p.shortcode!, p]));
  const syncedAt = pack.importedAt;
  /** "stories/_promos/twenty-years-30.mp4" → "Twenty Years" — what Melissa calls it. */
const titleOf = (asset: string | null | undefined) =>
  asset
    ? path
        .basename(asset)
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/-(\d+|nomusic|music|final)$/gi, "")
        .replace(/^ep(\d+)-/i, "Episode $1 ")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
const int = (n: number | null | undefined) => (typeof n === "number" ? Math.round(n) : null);

  let n = 0;
  for (const p of pack.posts) {
    const t = tracked.get(p.shortcode);
    // posts.json times are UTC without a zone ("2026-06-25T05:05").
    const published = p.published ? new Date(/Z|[+-]\d\d:?\d\d$/.test(p.published) ? p.published : p.published + "Z") : null;
    const caption = (p.caption ?? "").replace(/\s+/g, " ").trim().slice(0, 120) || null;
    await sql`
      INSERT INTO ig_post_stats (shortcode, published_at, kind, caption_head, title, duration_s, campaign, short_link,
        views, reach, likes, comments, shares, saves, follows, follows_source, avg_watch_ms, synced_at)
      VALUES (${p.shortcode}, ${published}, ${p.type}, ${caption}, ${titleOf(t?.asset)}, ${p.durationSeconds}, ${t?.campaign ?? null}, ${t?.go ?? null},
        ${int(p.views)}, ${int(p.reach)}, ${int(p.likes)}, ${int(p.comments)}, ${int(p.shares)}, ${int(p.saves)},
        ${int(p.follows)}, ${p.followsSource}, ${int(p.avgWatchMs)}, ${syncedAt})
      ON CONFLICT (shortcode) DO UPDATE SET
        published_at = EXCLUDED.published_at, kind = EXCLUDED.kind, caption_head = EXCLUDED.caption_head, title = EXCLUDED.title,
        duration_s = EXCLUDED.duration_s, campaign = EXCLUDED.campaign, short_link = EXCLUDED.short_link,
        views = EXCLUDED.views, reach = EXCLUDED.reach, likes = EXCLUDED.likes, comments = EXCLUDED.comments,
        shares = EXCLUDED.shares, saves = EXCLUDED.saves, follows = EXCLUDED.follows,
        follows_source = EXCLUDED.follows_source, avg_watch_ms = EXCLUDED.avg_watch_ms, synced_at = EXCLUDED.synced_at`;
    n++;
  }

  const snaps = readFileSync(path.join(DIR, "account.jsonl"), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l) as { at: string; followers: number; last7d?: { follows?: number; unfollows?: number } });
  for (const s of snaps) {
    await sql`
      INSERT INTO ig_account_snapshots (at, followers, follows_7d, unfollows_7d)
      VALUES (${s.at}, ${s.followers}, ${s.last7d?.follows ?? null}, ${s.last7d?.unfollows ?? null})
      ON CONFLICT (at) DO NOTHING`;
  }

  console.log(`ig-push: ${n} posts (${tracked.size} tracked), ${snaps.length} account snapshots, synced ${syncedAt}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
