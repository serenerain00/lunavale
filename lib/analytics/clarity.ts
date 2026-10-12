/**
 * Clarity → one summarized day of traffic.
 *
 * The admin conversion page needs the top of the funnel — visitors, Instagram
 * visitors, who opened an episode page, who saw /membership — and only Clarity
 * sees those. Its export API is rationed (10 requests a project a day, last
 * 1–3 days only, 1,000 rows a request), so this asks THREE questions a day:
 *
 *   1. no dimension      → site totals, devices
 *   2. Source × Medium × Campaign
 *                        → sessions per source, so "Instagram visitors" is a
 *                          count of visits and not of pages — and per tagged
 *                          campaign, which is what ties a post to its traffic
 *                          (docs/analytics/ATTRIBUTION.md: campaign = post).
 *   3. Source × URL      → every page, split by where the session came from.
 *                          That one table answers "how many Instagram
 *                          visitors", "where do they land" and "how many of
 *                          them reached /membership" at once.
 *
 * URLS ARE CUT TO THEIR PATH. Meta appends a unique fbclid to every outbound
 * click, so the same page arrives as a hundred different URLs.
 *
 * PAGE COUNTS ARE SESSION-PAGES, not people: Clarity counts a session once per
 * URL it visited, so somebody who opens three episodes is three episode-page
 * sessions. The admin page says so next to the number.
 */
import "server-only";

const API = "https://www.clarity.ms/export-data/api/v1/project-live-insights";

/** Instagram's link shim, its in-app share, and a hand-tagged utm_source. */
export const INSTAGRAM_SOURCE = /instagram|^ig$/i;

export interface TrafficDay {
  sessions: number;
  botSessions: number;
  users: number;
  devices: Record<string, number>;
  instagram: {
    sessions: number;
    /**
     * Sessions per "medium|campaign" for Instagram traffic, e.g.
     * "reel|it-suits-you-30" or "bio|bio". Untagged visits are "referral|"
     * (the link shim) or "|". Added 2026-10-11; older rows lack it.
     */
    campaigns?: Record<string, number>;
    /** Session-pages per path, top 15, for "where do they land". */
    landings: Record<string, number>;
    episodePages: number;
    membership: number;
  };
  pages: {
    home: number;
    /** Every /clips/<slug> session-page; /clips itself is the index. */
    episodePages: number;
    membership: number;
    signIn: number;
    welcome: number;
  };
}

interface ClarityMetric {
  metricName: string;
  information: Record<string, unknown>[];
}

export function clarityToken(): string | undefined {
  return process.env.CLARITY_API_TOKEN || undefined;
}

export function pathOf(url: unknown): string {
  try {
    return new URL(String(url)).pathname.replace(/\/$/, "") || "/";
  } catch {
    return String(url ?? "");
  }
}

const isEpisodePage = (p: string) => /^\/clips\/[^/]+$/.test(p);
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

async function ask(
  token: string,
  days: number,
  dims: string[],
): Promise<ClarityMetric[]> {
  const q = new URLSearchParams({ numOfDays: String(days) });
  dims.forEach((d, i) => q.set(`dimension${i + 1}`, d));
  const res = await fetch(`${API}?${q}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Clarity ${dims.join("×") || "totals"}: HTTP ${res.status}`);
  return (await res.json()) as ClarityMetric[];
}

const traffic = (body: ClarityMetric[]) =>
  body.find((m) => m.metricName === "Traffic")?.information ?? [];

/** Pure: two raw Clarity responses in, one TrafficDay out. Shared with the backfill script. */
export function summarize(
  totals: ClarityMetric[],
  bySource: ClarityMetric[],
  bySourceUrl: ClarityMetric[],
): TrafficDay {
  const t = traffic(totals)[0] ?? {};
  const devices: Record<string, number> = {};
  for (const d of totals.find((m) => m.metricName === "Device")?.information ?? []) {
    devices[String(d.name)] = num(d.sessionsCount);
  }

  const day: TrafficDay = {
    sessions: num(t.totalSessionCount),
    botSessions: num(t.totalBotSessionCount),
    users: num(t.distinctUserCount),
    devices,
    instagram: { sessions: 0, landings: {}, episodePages: 0, membership: 0 },
    pages: { home: 0, episodePages: 0, membership: 0, signIn: 0, welcome: 0 },
  };

  const landings: Record<string, number> = {};
  for (const row of traffic(bySourceUrl)) {
    const p = pathOf(row.Url);
    const n = num(row.totalSessionCount);
    const ig = INSTAGRAM_SOURCE.test(String(row.Source ?? ""));

    if (p === "/") day.pages.home += n;
    if (isEpisodePage(p)) day.pages.episodePages += n;
    if (p === "/membership") day.pages.membership += n;
    if (p === "/sign-in") day.pages.signIn += n;
    if (p === "/welcome") day.pages.welcome += n;

    if (ig) {
      landings[p] = (landings[p] ?? 0) + n;
      if (isEpisodePage(p)) day.instagram.episodePages += n;
      if (p === "/membership") day.instagram.membership += n;
    }
  }

  // Instagram SESSIONS come from the per-source table. Summing the
  // landings above would count one visitor once per page they opened.
  const igRows = traffic(bySource).filter((r) => INSTAGRAM_SOURCE.test(String(r.Source ?? "")));
  day.instagram.sessions = igRows.reduce((a, r) => a + num(r.totalSessionCount), 0);
  const campaigns: Record<string, number> = {};
  for (const r of igRows) {
    const key = `${String(r.Medium ?? "").toLowerCase()}|${String(r.Campaign ?? "").toLowerCase()}`;
    campaigns[key] = (campaigns[key] ?? 0) + num(r.totalSessionCount);
  }
  day.instagram.campaigns = campaigns;
  day.instagram.landings = Object.fromEntries(
    Object.entries(landings).sort((a, b) => b[1] - a[1]).slice(0, 15),
  );
  return day;
}

/** Spends exactly three of the day's ten Clarity requests. */
export async function fetchTrafficDay(token: string, days = 1): Promise<TrafficDay> {
  const totals = await ask(token, days, []);
  const bySource = await ask(token, days, ["Source", "Medium", "Campaign"]);
  const bySourceUrl = await ask(token, days, ["Source", "URL"]);
  return summarize(totals, bySource, bySourceUrl);
}
