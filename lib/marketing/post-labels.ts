/**
 * Labels for Instagram posts — the fixed vocabulary the weekly report groups
 * by, so "which kind of post brings paying members" compares like with like.
 *
 * WHY A CLOSED VOCABULARY. Free-text tags drift ("tension", "tense",
 * "drama") and a pattern split three ways is no pattern. Characters and
 * themes reuse the site's own taxonomy (lib/content/taxonomy.ts); `humor` is
 * the one addition, because the growth brief asks for "character humor"
 * explicitly and none of the six feelings covers it.
 *
 * WHO LABELS. Claude proposes labels from the caption and the clip the post
 * was cut from; Melissa can correct any of them. Labels describe the POST
 * (what someone scrolling saw), not the story — they are never canon, and a
 * label is not a claim about what a character feels.
 *
 * KEYED BY THE INSTAGRAM SHORTCODE (the part of the permalink after /p/ or
 * /reel/), which is stable and is what the Instagram export carries. New
 * posts made through the growth queue carry the same fields at draft time.
 */

import type { FeelingId, PersonId } from "@/lib/content/taxonomy";

export type Theme = FeelingId | "humor";

/** How the first second or two earns the stop. */
export type Hook =
  | "line" // a spoken line, cold
  | "look" // a glance, a face, no words
  | "text" // words on screen first
  | "music" // the music bed carries the opening
  | "action" // something physical happens
  | "question"; // a question put to the viewer

export type CaptionStyle =
  | "quote" // a line from the scene
  | "question" // asks the reader something
  | "scene-setting" // where / when / what's happening
  | "first-person" // in a character's voice
  | "announcement" // "Episode 3 is up"
  | "minimal"; // a few words or emoji

export type Cta =
  | "none"
  | "link-in-bio"
  | "watch-episode" // names a specific episode or scene to go and watch
  | "join" // names the membership
  | "comment"; // asks for a comment

export interface PostLabels {
  characters: PersonId[];
  themes: Theme[];
  hook: Hook;
  captionStyle: CaptionStyle;
  cta: Cta;
  /** Site slug the post is cut from or points at (a clip or episode), or "promo" for a custom edit. */
  storyline: string;
  /** Who labelled it; "claude" until Melissa confirms or corrects it. */
  by: "claude" | "melissa";
}

/** Shortcode → labels. Filled from the Instagram export; see scripts/ig-import.ts. */
export const POST_LABELS: Record<string, PostLabels> = {};

export type DurationBand = "≤15s" | "16–30s" | "31–60s" | "61–180s" | ">180s";

export function durationBand(seconds: number): DurationBand {
  if (seconds <= 15) return "≤15s";
  if (seconds <= 30) return "16–30s";
  if (seconds <= 60) return "31–60s";
  if (seconds <= 180) return "61–180s";
  return ">180s";
}
