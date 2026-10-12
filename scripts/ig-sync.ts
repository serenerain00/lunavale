/**
 * ig-sync.ts — pull Instagram's numbers through the official API, so the
 * weekly report no longer needs a manual export.
 *
 * API: Instagram API with Instagram Login (graph.instagram.com), read-only,
 * permissions instagram_business_basic + instagram_business_manage_insights.
 * Checked against Meta's reference on 2026-10-11:
 *   - media insights  GET /{media-id}/insights
 *       reels: reach, views, likes, comments, shares, saved, total_interactions,
 *              ig_reels_avg_watch_time
 *       feed:  the same, plus follows and profile_visits
 *     → Meta does NOT give follows per REEL through the API. The Business
 *       Suite export does, so when an export has been imported its per-reel
 *       follows are kept (marked followsSource "export").
 *   - account insights GET /{ig-user-id}/insights, follows_and_unfollows
 *     (day, total_value, breakdown follow_type) — gross follows and unfollows,
 *     which the export never had. Not returned under 100 followers.
 *   - followers_count on the user — snapshotted each run, so net follower
 *     change week to week is a real measurement, not an estimate.
 *   - Data can lag up to 48 hours; metrics are kept for 2 years.
 *
 * THE TOKEN never touches a file or the repo. It is read from the macOS
 * Keychain (service "instagram-graph-token"), refreshed when it is over a
 * day old (GET /refresh_access_token, valid 60 days from refresh), and the
 * new one written back to the Keychain. Run at least every 60 days and it
 * never expires; the weekly launchd job does that.
 *
 * Writes ~/lunavale-analytics/instagram/posts.json (the same shape
 * scripts/ig-import.ts writes, so the weekly report reads either) and appends
 * account snapshots to account.jsonl.
 *
 *   npx tsx scripts/ig-sync.ts            # sync
 *   npx tsx scripts/ig-sync.ts --check    # verify the token and permissions only
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const DIR = path.join(os.homedir(), "lunavale-analytics", "instagram");
const API = "https://graph.instagram.com";
const KEYCHAIN = { service: "instagram-graph-token", account: os.userInfo().username };
const check = process.argv.includes("--check");

function readToken(): string {
  try {
    return execFileSync("security", ["find-generic-password", "-a", KEYCHAIN.account, "-s", KEYCHAIN.service, "-w"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    throw new Error(`No Instagram token in the Keychain (service "${KEYCHAIN.service}").`);
  }
}

function writeToken(token: string) {
  execFileSync("security", ["add-generic-password", "-U", "-a", KEYCHAIN.account, "-s", KEYCHAIN.service, "-w", token], {
    stdio: "ignore",
  });
}

let token = "";

/** GET against the IG API. Errors carry Meta's message, never the token. */
async function get<T>(pathname: string, params: Record<string, string> = {}): Promise<T> {
  const u = new URL(pathname.startsWith("http") ? pathname : `${API}${pathname}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  u.searchParams.set("access_token", token);
  const res = await fetch(u);
  const body = (await res.json()) as T & { error?: { message: string; code: number } };
  if (!res.ok || body.error) {
    throw new Error(`Instagram API ${pathname}: ${body.error?.code ?? res.status} ${body.error?.message ?? ""}`);
  }
  return body;
}

async function refreshIfDue() {
  const stamp = path.join(DIR, ".token-refreshed");
  const last = existsSync(stamp) ? Number(readFileSync(stamp, "utf8")) : 0;
  if (Date.now() - last < 7 * 864e5) return; // weekly is plenty for a 60-day token
  try {
    const r = await get<{ access_token: string; expires_in: number }>("/refresh_access_token", { grant_type: "ig_refresh_token" });
    writeToken(r.access_token);
    token = r.access_token;
    writeFileSync(stamp, String(Date.now()));
    console.log(`token refreshed, valid ${Math.round(r.expires_in / 86400)} days`);
  } catch (e) {
    // A brand-new token (< 24 h old) cannot be refreshed yet; that is fine.
    console.log(`token not refreshed (${(e as Error).message.slice(0, 120)})`);
  }
}

interface Media {
  id: string; caption?: string; media_type: string; media_product_type?: string;
  permalink: string; timestamp: string;
}

async function allMedia(): Promise<Media[]> {
  const out: Media[] = [];
  let next: string | undefined = "/me/media";
  let params: Record<string, string> = { fields: "id,caption,media_type,media_product_type,permalink,timestamp", limit: "100" };
  while (next) {
    const page: { data: Media[]; paging?: { next?: string } } = await get(next, params);
    out.push(...page.data);
    next = page.paging?.next;
    params = {};
  }
  return out;
}

async function mediaInsights(m: Media): Promise<Record<string, number | null>> {
  const reel = m.media_product_type === "REELS";
  const metrics = reel
    ? ["reach", "views", "likes", "comments", "shares", "saved", "total_interactions", "ig_reels_avg_watch_time"]
    : ["reach", "views", "likes", "comments", "shares", "saved", "total_interactions", "follows", "profile_visits"];
  try {
    const r = await get<{ data: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }>(
      `/${m.id}/insights`, { metric: metrics.join(",") },
    );
    const out: Record<string, number | null> = {};
    for (const d of r.data) out[d.name] = d.total_value?.value ?? d.values?.[0]?.value ?? null;
    return out;
  } catch (e) {
    // Very new posts, album children and a few legacy types refuse insights.
    // Keep the post with empty metrics rather than drop it.
    console.log(`  no insights for ${m.permalink} (${(e as Error).message.slice(0, 80)})`);
    return {};
  }
}

async function main() {
  mkdirSync(DIR, { recursive: true });
  token = readToken();
  const me = await get<{ user_id: string; username: string; followers_count: number; media_count: number }>(
    "/me", { fields: "user_id,username,followers_count,media_count" },
  );
  console.log(`@${me.username}: ${me.followers_count} followers, ${me.media_count} posts`);
  if (check) {
    await get(`/${me.user_id}/insights`, { metric: "reach", period: "day", metric_type: "total_value" });
    console.log("token works; insights permission present");
    return;
  }
  await refreshIfDue();

  // Account: today's follower count, and the last 7 days' follows/unfollows.
  const until = Math.floor(Date.now() / 1000);
  let follows: number | null = null, unfollows: number | null = null;
  try {
    const r = await get<{ data: { total_value?: { breakdowns?: { results: { dimension_values: string[]; value: number }[] }[] } }[] }>(
      `/${me.user_id}/insights`,
      { metric: "follows_and_unfollows", period: "day", metric_type: "total_value", breakdown: "follow_type", since: String(until - 7 * 86400), until: String(until) },
    );
    for (const res of r.data[0]?.total_value?.breakdowns?.[0]?.results ?? []) {
      if (res.dimension_values[0] === "FOLLOWER") follows = res.value;
      if (res.dimension_values[0] === "NON_FOLLOWER") unfollows = res.value;
    }
  } catch (e) {
    console.log(`follows_and_unfollows unavailable (${(e as Error).message.slice(0, 100)})`);
  }
  appendFileSync(path.join(DIR, "account.jsonl"), JSON.stringify({
    at: new Date().toISOString(), followers: me.followers_count, media: me.media_count, last7d: { follows, unfollows },
  }) + "\n");

  // Posts: keep what an imported export knew that the API does not (per-reel follows, duration).
  const prevFile = path.join(DIR, "posts.json");
  const prev = existsSync(prevFile)
    ? new Map(((JSON.parse(readFileSync(prevFile, "utf8")) as { posts: { shortcode: string; follows: number | null; durationSeconds: number | null; followsSource?: string }[] }).posts).map((p) => [p.shortcode, p]))
    : new Map();

  const media = await allMedia();
  const posts = [];
  for (const m of media) {
    const i = await mediaInsights(m);
    const shortcode = m.permalink.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#]+)/)?.[1] ?? m.id;
    const old = prev.get(shortcode);
    const apiFollows = typeof i.follows === "number" ? i.follows : null;
    posts.push({
      id: m.id,
      shortcode,
      permalink: m.permalink,
      type: m.media_product_type === "REELS" ? "IG reel" : m.media_type === "CAROUSEL_ALBUM" ? "IG carousel" : "IG image",
      // The API's timestamp is UTC; the export's was account-local. Stored as UTC "YYYY-MM-DDTHH:MM".
      published: m.timestamp.slice(0, 16),
      durationSeconds: old?.durationSeconds ?? null, // the API does not report a reel's length
      caption: m.caption ?? "",
      campaign: null as string | null,
      views: i.views ?? null, reach: i.reach ?? null, likes: i.likes ?? null, shares: i.shares ?? null,
      comments: i.comments ?? null, saves: i.saved ?? null,
      follows: apiFollows ?? old?.follows ?? null,
      followsSource: apiFollows !== null ? "api" : old?.follows != null ? "export" : null,
      profileVisits: i.profile_visits ?? null,
      avgWatchMs: i.ig_reels_avg_watch_time ?? null,
      plays: i.views ?? null,
    });
    await new Promise((r) => setTimeout(r, 150)); // gentle on the rate limit
  }
  posts.sort((a, b) => a.published.localeCompare(b.published));
  writeFileSync(prevFile, JSON.stringify({ source: "api", importedAt: new Date().toISOString(), posts }, null, 2));
  console.log(`${posts.length} posts synced → ${prevFile}`);
}

main().catch((e) => {
  console.error(String(e.message ?? e));
  process.exit(1);
});
