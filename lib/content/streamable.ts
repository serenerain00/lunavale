/**
 * One lookup over everything the stream route can serve.
 *
 * Scenes and vertical clips are separate content kinds with different shapes
 * and different access rules, but they share one gated delivery route. This is
 * the single place that maps a URL slug to a file and an access level, so
 * adding a third kind later means adding a branch here rather than teaching
 * the route about another module.
 */

import { CLIP_ACCESS, clips, getClip } from "@/lib/content/clips";
import { getVideo, videos, type AccessLevel } from "@/lib/content/videos";

export interface Streamable {
  slug: string;
  /** Basename of the proxy inside stories/. */
  file: string;
  access: AccessLevel;
}

export function getStreamable(slug: string): Streamable | undefined {
  const video = getVideo(slug);
  if (video) return { slug, file: video.file, access: video.access };

  const clip = getClip(slug);
  if (clip) return { slug, file: clip.file, access: CLIP_ACCESS };

  return undefined;
}

/**
 * Slugs are a single namespace across kinds because they share the stream
 * route. A duplicate would silently resolve to whichever kind is checked
 * first — a scene shadowing a clip, serving the wrong file behind the wrong
 * access rule. Cheap to check, so check it, and only in development where the
 * cost of the scan doesn't matter.
 */
if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  const clashes: string[] = [];
  for (const slug of [...videos.map((v) => v.slug), ...clips.map((c) => c.id)]) {
    if (seen.has(slug)) clashes.push(slug);
    seen.add(slug);
  }
  if (clashes.length) {
    throw new Error(
      `Duplicate media slug(s) across scenes and clips: ${clashes.join(", ")}. ` +
        `Slugs share one namespace because they share /api/stream/[slug].`,
    );
  }
}
