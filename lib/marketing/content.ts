import "server-only";

/**
 * What there is to promote — read by the voice assistant and the report panel.
 *
 * Straight from the content modules (the source of truth), never a copy.
 * Titles and dates only: no synopses, so the assistant can't paraphrase story
 * that a listener hasn't seen into something that sounds like canon.
 */

import { recentReleases } from "@/lib/content/releases";
import { videos } from "@/lib/content/videos";
import { clips } from "@/lib/content/posts";

export interface ContentInventory {
  recent: { date: string; kind: string; title: string; access: "free" | "premium" }[];
  counts: { clipsFree: number; clipsMembers: number; posts: number; episodes: number };
  speak: string;
}

export function contentInventory(): ContentInventory {
  const recent = recentReleases(8).map((r) => ({
    date: r.date,
    kind: r.kind,
    title: r.title,
    access: r.access,
  }));
  const live = videos.filter((v) => !v.hidden);
  const episodes = live.filter((v) => /^(pilot|episode-\d+)$/.test(v.slug));
  const counts = {
    clipsFree: live.filter((v) => v.access === "free").length,
    clipsMembers: live.filter((v) => v.access !== "free").length,
    posts: clips.length,
    episodes: episodes.length,
  };
  const latest = recent[0];
  const speak =
    `There are ${counts.episodes} episodes, ${counts.clipsFree} free clips and ` +
    `${counts.clipsMembers} for members.` +
    (latest ? ` The newest is ${latest.title}, ${latest.access === "free" ? "free" : "for members"}.` : "");
  return { recent, counts, speak };
}
