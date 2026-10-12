/**
 * ig-label.ts — label every imported Instagram post from its caption.
 *
 * Rules, not judgement, so anyone can see why a post got its label and the
 * same caption always gets the same one. Writes
 * ~/lunavale-analytics/instagram/labels.json (shortcode → PostLabels, by
 * "rules"). Hand corrections go in POST_LABELS (lib/marketing/post-labels.ts)
 * and win over these.
 *
 * WHAT A CAPTION CANNOT TELL US: the video's opening second. `hook` is null
 * for every imported post; it is filled for new posts at draft time by the
 * growth queue, which knows the edit.
 *
 * Themes are what the CAPTION frames the post around, not a claim about what
 * any character feels — see the note in post-labels.ts.
 *
 *   npx tsx scripts/ig-label.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { CaptionStyle, Cta, PostLabels, Theme } from "@/lib/marketing/post-labels";
import type { PersonId } from "@/lib/content/taxonomy";

const DIR = path.join(os.homedir(), "lunavale-analytics", "instagram");
const { posts } = JSON.parse(readFileSync(path.join(DIR, "posts.json"), "utf8")) as {
  posts: { shortcode: string; caption: string }[];
};

const has = (c: string, re: RegExp) => re.test(c);

/**
 * The series taglines that ride along on many captions ("BETWEEN US is a
 * cinematic drama about love, loyalty, friendship…"). They are the same on
 * every post, so reading themes from them labels everything "trust". Themes
 * are read from the caption with these sentences removed; the CTA is still
 * read from the whole caption, since "Subscribe at lunavale38.com" IS the ask.
 */
const TAGLINE =
  /between us\s*(is|—|-|:)?\s*a\s+(cinematic|slow-burn|story|drama|relationship)|a story about friendship|somewhere in these three people|twenty years of history|follow the story from the beginning|subscribe at|pilot (drops|dropping|is available)|#\S+/i;
const storyText = (c: string) =>
  c
    .split(/(?<=[.!?])\s+|\n+/)
    .filter((s) => !TAGLINE.test(s))
    .join(" ")
    .replace(/#\S+/g, "");

function characters(c: string): PersonId[] {
  const out = new Set<PersonId>(["luna"]); // her account: Luna is in, or narrating, every post
  if (has(c, /\btyson\b|\bty\b|tyty|#ty\b/i)) out.add("tyson");
  if (has(c, /\bjosh\b|#joshandluna/i)) out.add("josh");
  if (has(c, /\brick\b/i)) out.add("rick");
  if (has(c, /\bcathy\b|\bmom\b/i)) out.add("cathy");
  if (has(c, /\bavery\b/i)) out.add("avery");
  return [...out];
}

function themes(c: string): Theme[] {
  const t: Theme[] = [];
  if (has(c, /flirt|chemistry|passion|spark|kiss|🥵|wants? you|too much too fast|body ?language|romantic tension/i)) t.push("desire");
  if (has(c, /secret|\blie|truth|hiding|kept something|detective|interview|debt|nobody knows|9 years ago|nine years/i)) t.push("lies");
  if (has(c, /hurt|pain|💔|broke|fight|argu|leaving|left josh|packed a bag|walk(ed|ing) away|disappear/i)) t.push("hurt");
  if (has(c, /avoid|apart|distance|alone|miss(ed|ing)? (him|you|someone)|lets it ring|waiting|late\b/i)) t.push("distance");
  if (has(c, /friendsforever|best friend|twenty years|20 years|friendship|safe|loyal|protect|in her corner|constant/i)) t.push("trust");
  if (has(c, /grief|griev|funeral|passed away|lost (him|her)/i)) t.push("grief");
  if (has(c, /😂|😅|🤦|hungover|personality|insult|gift shop|trimmer|ginger ale|like an idiot|dead plants|giving each other shit|annoyed/i)) t.push("humor");
  return t; // empty = the caption frames no theme the vocabulary names
}

function captionStyle(c: string): CaptionStyle {
  const head = c.slice(0, 140);
  if (has(head, /trailer/i)) return "announcement";
  if (has(head, /sneak|sneek|leak|reveal|glimpse|peek|official (pilot )?scene|extended|blast from the past|new scene|freebie|scene 🎬|🎬 scene|future/i)) return "teaser";
  if (has(head, /🖊️|📓|journal/) || has(head, /^\W*I\b|\bI (didn't|don't|was|think|knew|forgot|hate|told|asked|spent|almost|should|swear|know|stayed)\b/)) return "first-person";
  if (has(head, /become a member|subscribe|register|pilot is on the way|ready for the release|tonight, it begins|drops tonight/i)) return "announcement";
  if (head.includes("?")) return "question";
  if (c.replace(/#\S+/g, "").trim().length < 60) return "minimal";
  return "scene-setting";
}

function cta(c: string): Cta {
  if (has(c, /become a member|subscribe|join (the|us)|lunavale38\.com|registered|lunaverse/i)) return "join";
  if (has(c, /link in (my )?bio/i)) return "link-in-bio";
  if (has(c, /watch (the|episode|it)|episode \w+ is (out|up|live)|pilot drops|tonight, it begins|don'?t (wanna )?miss/i)) return "watch-episode";
  if (has(c, /would you|comment|tell me|what do you think|who'?s side/i)) return "comment";
  return "none";
}

function storyline(c: string): string {
  if (has(c, /episode 4/i)) return "episode-4";
  if (has(c, /ep ?3|episode 3|episode three/i)) return "episode-3";
  if (has(c, /ep ?2|episode 2|episode two/i)) return "episode-2";
  if (has(c, /pilot|episode one|episode 1|first minute of between us|tonight, it begins/i)) return "pilot";
  if (has(c, /trailer/i)) return "trailer";
  if (has(c, /future|upcoming season|what'?s coming|glimpse into the future/i)) return "future-teaser";
  if (has(c, /behind the scenes|between takes|photo ?shoot|shoot day|shooting in|cast interview|filming/i)) return "behind-the-scenes";
  if (has(c, /🖊️|📓|journal|entry/)) return "journal";
  return "scene";
}

const labels: Record<string, PostLabels> = {};
for (const p of posts) {
  const c = p.caption;
  labels[p.shortcode] = {
    characters: characters(c),
    themes: themes(storyText(c)),
    hook: null,
    captionStyle: captionStyle(c),
    cta: cta(c),
    storyline: storyline(c),
    by: "rules",
  };
}
writeFileSync(path.join(DIR, "labels.json"), JSON.stringify(labels, null, 2));
const count = (k: keyof PostLabels) =>
  Object.values(labels).reduce<Record<string, number>>((a, l) => {
    for (const v of ([] as unknown[]).concat(l[k])) a[String(v)] = (a[String(v)] ?? 0) + 1;
    return a;
  }, {});
console.log(Object.keys(labels).length, "labelled");
for (const k of ["characters", "themes", "captionStyle", "cta", "storyline"] as const) console.log(k, JSON.stringify(count(k)));
