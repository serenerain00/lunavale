/**
 * Instagram numbers for the voice assistant and its report panel.
 *
 * READS THE DATABASE ONLY. The Instagram token never leaves Melissa's Mac:
 * scripts/ig-sync.ts pulls from Instagram there and scripts/ig-push.ts copies
 * the numbers into ig_post_stats / ig_account_snapshots. So everything here is
 * as fresh as the last sync, and every answer carries `syncedAt` so Erin can
 * say so rather than imply it's live.
 *
 * Site results (checkouts and payments) come only for posts whose link was
 * tracked — a /go/ short link with a campaign in data/ig-posts.json — and only
 * from the day attribution started (2026-10-11). An untracked post has no site
 * number, which is not the same as zero.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";
import { checkoutFunnel } from "@/lib/billing/checkout-funnel";

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface IgPost {
  shortcode: string;
  name: string;
  published: string | null;
  kind: string | null;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  /** Reels: only from a Business Suite export; null means "not known", not zero. */
  follows: number | null;
  /** Tracked posts only: people who began checkout / paid from its link. */
  site: { began: number; paid: number } | null;
}

export interface InstagramStats {
  syncedAt: string | null;
  followers: { now: number; at: string; follows7d: number | null; unfollows7d: number | null } | null;
  days: number;
  matched: string | null;
  posts: IgPost[];
  speak: string;
}

type Row = {
  shortcode: string;
  title: string | null;
  caption_head: string | null;
  campaign: string | null;
  short_link: string | null;
  published_at: string | null;
  kind: string | null;
  views: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  follows: number | null;
  follows_source: string | null;
  synced_at: string;
};

/** What to call a post out loud: its promo name, else the start of its caption. */
function nameOf(r: Row): string {
  if (r.title) return r.title;
  // No hashtags or emoji: this is said out loud.
  const c = (r.caption_head ?? "")
    .replace(/#\S+/g, "")
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (c) return c.length > 50 ? `${c.slice(0, 47).replace(/\s+\S*$/, "")}…` : c;
  return "an untitled post";
}

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2);

const FILLER = new Set(["the", "one", "video", "reel", "post", "how", "did", "about", "that", "with", "doing"]);
const queryWords = (query: string) => words(query).filter((w) => !FILLER.has(w));

/**
 * How well a post matches what she said: 2 = its promo name (what she calls
 * it), 1 = its caption, campaign or short link, 0 = not at all. A name match
 * wins over a newer post that merely mentions the same words in its caption.
 */
function matchScore(r: Row, q: string[]): number {
  if (q.length === 0) return 0;
  const has = (hay: string) => q.every((w) => hay.toLowerCase().includes(w));
  if (r.title && has(r.title)) return 2;
  return has([r.title, r.caption_head, r.campaign, r.short_link].join(" ")) ? 1 : 0;
}

export async function instagramStats(opts: { post?: string; days?: number } = {}): Promise<InstagramStats> {
  const days = Math.min(Math.max(Math.round(opts.days ?? 30), 1), 365);
  const since = new Date(Date.now() - days * 86_400_000);

  const [rowsRaw, snapsRaw] = await Promise.all([
    sql()`
      SELECT shortcode, title, caption_head, campaign, short_link, published_at, kind,
             views, reach, likes, comments, shares, saves, follows, follows_source, synced_at
      FROM ig_post_stats
      WHERE ${opts.post ? true : false} OR published_at >= ${since.toISOString()}
      ORDER BY published_at DESC NULLS LAST
    `,
    sql()`
      SELECT at, followers, follows_7d, unfollows_7d FROM ig_account_snapshots ORDER BY at DESC LIMIT 1
    `,
  ]);
  const rows = rowsRaw as Row[];
  const snaps = snapsRaw as { at: string; followers: number; follows_7d: number | null; unfollows_7d: number | null }[];

  const query = opts.post?.trim() || null;
  const q = query ? queryWords(query) : [];
  const picked = query
    ? rows
        .map((r) => ({ r, score: matchScore(r, q) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score) // stable: newest first within a score
        .map((x) => x.r)
        .slice(0, 5)
    : rows.slice(0, 30);

  // Site results for the tracked ones, from the earliest of them onward.
  const tracked = picked.filter((r) => r.campaign && r.published_at);
  const byCampaign = new Map<string, { began: number; paid: number }>();
  if (tracked.length) {
    const from = new Date(Math.min(...tracked.map((r) => new Date(r.published_at!).getTime())));
    const funnel = await checkoutFunnel(from).catch(() => null);
    for (const c of funnel?.campaigns ?? []) {
      const prev = byCampaign.get(c.campaign) ?? { began: 0, paid: 0 };
      byCampaign.set(c.campaign, { began: prev.began + c.began, paid: prev.paid + c.paid });
    }
  }

  const posts: IgPost[] = picked.map((r) => ({
    shortcode: r.shortcode,
    name: nameOf(r),
    published: r.published_at ? new Date(r.published_at).toISOString() : null,
    kind: r.kind,
    views: r.views,
    reach: r.reach,
    likes: r.likes,
    comments: r.comments,
    shares: r.shares,
    saves: r.saves,
    follows: r.kind?.toLowerCase().includes("reel") && r.follows_source !== "export" ? null : r.follows,
    site: r.campaign ? (byCampaign.get(r.campaign) ?? { began: 0, paid: 0 }) : null,
  }));

  const syncedAt = rows[0]?.synced_at ? new Date(rows[0].synced_at).toISOString() : null;
  const s = snaps[0];
  const followers = s
    ? { now: s.followers, at: new Date(s.at).toISOString(), follows7d: s.follows_7d, unfollows7d: s.unfollows_7d }
    : null;

  return { syncedAt, followers, days, matched: query, posts, speak: speakFor({ syncedAt, followers, days, matched: query, posts }) };
}

function asOf(iso: string | null): string {
  if (!iso) return "I don't have an Instagram sync yet";
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" });
  return `As of the last sync, ${day}`;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function lineFor(p: IgPost): string {
  const bits = [
    p.reach !== null ? `${p.reach} people reached` : null,
    p.views !== null ? `${p.views} views` : null,
    p.likes !== null ? plural(p.likes, "like") : null,
    p.shares !== null ? plural(p.shares, "share") : null,
    p.saves !== null ? plural(p.saves, "save") : null,
  ].filter(Boolean);
  let line = `${p.name}: ${bits.join(", ")}.`;
  if (p.site) line += ` Its link brought ${p.site.began} people to checkout and ${p.site.paid} paid.`;
  else line += " Its link wasn't tracked, so I can't tell what it did on the site.";
  return line;
}

function speakFor(r: Omit<InstagramStats, "speak">): string {
  const head = asOf(r.syncedAt);
  if (!r.syncedAt) return `${head}. Run the Instagram refresh on the Mac and ask again.`;
  if (r.matched) {
    if (r.posts.length === 0)
      return `${head}, I couldn't find that post. It may not be posted yet, or it went up after the sync.`;
    return `${head}. ${lineFor(r.posts[0])}${r.posts.length > 1 ? ` There are ${r.posts.length - 1} more that match; want them on screen?` : ""}`;
  }
  const f = r.followers;
  const net = f && f.follows7d !== null && f.unfollows7d !== null ? f.follows7d - f.unfollows7d : null;
  const followLine = f
    ? `you have ${f.now} followers${net !== null ? `, ${net >= 0 ? "up" : "down"} ${Math.abs(net)} over the last week` : ""}.`
    : "I don't have a follower count yet.";
  if (r.posts.length === 0) return `${head}, ${followLine} No posts in the last ${r.days} days.`;
  const byReach = [...r.posts].sort((a, b) => (b.reach ?? 0) - (a.reach ?? 0))[0];
  const byShares = [...r.posts].sort((a, b) => (b.shares ?? 0) - (a.shares ?? 0))[0];
  let s = `${head}, ${followLine} In the last ${r.days} days you posted ${r.posts.length} times. The biggest reach was ${byReach.name}, at ${byReach.reach ?? 0} people.`;
  if (byShares !== byReach && (byShares.shares ?? 0) > 0) s += ` The most shared was ${byShares.name}, with ${byShares.shares}.`;
  return s;
}
