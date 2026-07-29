/**
 * Character areas — everything in the world that belongs to one person,
 * gathered in one place.
 *
 * This file adds no new media. Scenes, clips, galleries, journal entries and
 * Between Takes notes all already know who they are about; what was missing was
 * a surface that asks the question the other way round — not "what happened at
 * the lakehouse" but "show me Tyson." That is the question an audience actually
 * has once they are attached to someone, and it is the one the catalog's
 * feeling/place axes cannot answer.
 *
 * The prose below is DRAFT, written to the canon in LUNA_VAULT_CONTEXT.md
 * (Melissa's, 2026-07-22). The beats are hers; the sentences are not. `id` is
 * load-bearing — it is the PersonId from taxonomy.ts and appears in URLs.
 *
 * Portraits are frames from the cast interview (public, free content), cropped
 * by scripts in stories/reels. They are deliberately not scene stills: a
 * character hub is about the person, and a still from a scene would tie them to
 * one moment in it.
 */

import { clipAccess, clips, type Clip } from "@/lib/content/clips";
import { galleries, type StillGallery } from "@/lib/content/gallery";
import { journal, type JournalEntry } from "@/lib/content/journal";
import { notes, type SetNote } from "@/lib/content/between-takes";
import { getPerson, type PersonId } from "@/lib/content/taxonomy";
import { videos, type Video } from "@/lib/content/videos";

export interface Character {
  /** The PersonId from taxonomy.ts. Appears in /characters/<id>. */
  id: PersonId;
  /** Display name. */
  name: string;
  /** Their standing in one phrase — sits under the name. */
  role: string;
  /** The hook, one sentence. Used on the index card and as meta description. */
  tagline: string;
  /** Portrait under /public. 3:4. */
  portrait: string;
  /** Two or three paragraphs. Who they are, without spoiling where it goes. */
  intro: string[];
  /**
   * The small, concrete things — the details that make a character feel like a
   * person rather than a role. Shown as a short list, deliberately specific.
   */
  details: string[];
  /**
   * A line of theirs worth pulling out. Sourced from the interview or the
   * scenes; attributed in `pullQuoteSource`.
   */
  pullQuote: string;
  pullQuoteSource: string;
}

export const characters: Character[] = [
  {
    id: "luna",
    name: "Luna",
    role: "The one it happens to",
    tagline:
      "Ten years with one man, twenty with the other, and no version of this where nobody gets hurt.",
    portrait: "/characters/luna.jpg",
    intro: [
      "The story is her interior life. Everything else — the farmhouse, the lake, both men — is weather moving across it.",
      "She has a streak: she likes danger, and she is loyal, and those two things point at different people. She is not a victim and she is not stupid. She sees the situation clearly, chooses badly, and knows she is doing it while she does it.",
      "What she is actually trying to work out is not which one of them to keep. It is whether there is a version of her life that she chose on purpose.",
    ],
    details: [
      "Writes everything down, then argues with what she wrote",
      "Runs six miles when she cannot think straight",
      "Moved to the lakehouse alone and has not stopped calling it temporary",
      "Has never once lied to Tyson, until she does",
    ],
    pullQuote: "She's trying to choose herself.",
    pullQuoteSource: "The cast interview",
  },
  {
    id: "tyson",
    name: "Tyson",
    role: "Her best friend of twenty years",
    tagline:
      "Ex-military, few words, and six months of keeping her head above water that turned into something neither of them will say.",
    portrait: "/characters/tyson.jpg",
    intro: [
      "Twenty years of friendship, and a rule underneath it that neither of them ever wrote down: they do not lie to each other. Not about anything. It has survived two decades of things worth lying about.",
      "He is ex-military, which shows up less in how he talks than in what he does not say. Extreme sports, motorcycles, track days — and a black 2020 Carrera he treats like something on loan from a man he respects. He will ride recklessly alone and will not take a hard corner with Luna in the passenger seat.",
      "Through the six months she was on her own, he made himself responsible for her getting through it. Somewhere in there it stopped being only that, on both sides. When Josh comes back, Tyson starts putting distance in — because distance is the only way left to keep hiding it.",
    ],
    details: [
      "Josh's distant cousin, and helps him on the farm",
      "Puts the groceries away in the wrong cupboards on purpose",
      "Does not ask how she is — asks what she has eaten, then waits",
      "Started the staring game with her at nineteen, over nothing",
    ],
    pullQuote: "He carries everything alone.",
    pullQuoteSource: "The cast interview",
  },
  {
    id: "josh",
    name: "Josh",
    role: "Her partner of ten years",
    tagline:
      "He called after six months apart, and she said yes to dinner when she had meant to say no.",
    portrait: "/characters/josh.jpg",
    intro: [
      "Ten years, and by the end of them he had gone lazy — stopped noticing the house, the calendar, her. He could not tell you the day it started, because there wasn't one.",
      "That is only half of him, and the half that makes the other half land. He is caring, passionate, commanding, genuinely funny, and she loved all of it. He owns a shop and a large farm and puts work first, which for most of the ten years read as reliability.",
      "Where he learned it is not a mystery. His father is the same combination — magnetic and in charge, and unable to tell the difference. Josh grew up being run rather than loved, and became a man who does that to the woman he wants to keep.",
      "Then he calls. Coffee, then dinner the same night, and it starts again — and once he begins to suspect what Luna and Tyson are to each other, the same intensity that made him magnetic turns into jealousy, then possession, then control.",
    ],
    details: [
      "Owns the shop and the farm; work comes first and always has",
      "Grazes her lower lip mid-sentence and knows exactly what it does",
      "Told Tyson about the dinner the same morning, casually, as family do",
      "Still stands up when his father stays sitting",
      "Is not sorry in the way she needs him to be sorry",
    ],
    pullQuote: "That I'm not the villain.",
    pullQuoteSource: "The cast interview",
  },
  {
    // Supporting, and deliberately given a page anyway: he is the explanation
    // for the lead. Thin on content for now — one scene and two notes — which
    // the hub states honestly rather than padding.
    id: "rick",
    name: "Rick",
    role: "Josh's father",
    tagline:
      "Dominance with charisma, and no idea how to put love into a form his son could use.",
    portrait: "/characters/rick.jpg",
    intro: [
      "Think boss. He runs a room by sitting still in it, and he has never once had to raise his voice to end a conversation.",
      "Josh did not invent himself. The charm that gets used as control, the certainty, the way being wanted and being obeyed blur into the same thing — all of it was learned in his father's study, from a man who is genuinely strong and genuinely cares, and who has never managed to deliver either in a form his son could do anything with.",
      "He is disappointed in Josh for losing Luna. He also always thought Luna was too good for him. He holds both at once without difficulty, and says neither in a way that helps — which is the whole inheritance, handed down intact.",
    ],
    details: [
      "Stays in the chair while Josh stands — until the last thing he says",
      "The framed photograph on the shelf behind him is the two of them",
      "Thought Luna was too good for his son, and never told his son that",
      "Cares, demonstrably. Not once in a language Josh can read",
    ],
    pullQuote: "You think you're handling it? You're not.",
    pullQuoteSource: "The Study",
  },
];

export function getCharacter(id: string): Character | undefined {
  return characters.find((c) => c.id === id);
}

/* --------------------------------------------------------- what they're in */

/**
 * Everything filed under one person, in the order a hub wants to show it.
 *
 * Access is NOT filtered here. The pages need to know a locked thing exists in
 * order to show it locked — a hub that silently omitted premium material would
 * make membership look like it unlocks nothing, which is the opposite of what
 * these pages are for. Gating happens at render, per card, as everywhere else.
 */
export interface CharacterContent {
  scenes: Video[];
  clips: Clip[];
  galleries: StillGallery[];
  journal: JournalEntry[];
  notes: SetNote[];
}

export function contentFor(id: PersonId): CharacterContent {
  return {
    // `hidden` keeps the cast interview out, the same way the catalog does.
    // It is about all three and belongs to none of them.
    scenes: videos.filter((v) => !v.hidden && v.about.includes(id)),
    clips: clips.filter((c) => c.about.includes(id)),
    galleries: galleries.filter((g) => g.about.includes(id)),
    journal: journal.filter((e) => e.about.includes(id)),
    notes: notes.filter((n) => n.author === id),
  };
}

/** Total pieces of content filed under a person — the index card's meta line. */
export function countFor(id: PersonId): number {
  const c = contentFor(id);
  return (
    c.scenes.length +
    c.clips.length +
    c.galleries.length +
    c.journal.length +
    c.notes.length
  );
}

/**
 * How much of a person's material is behind the Vault. Drives the honest
 * "N of M are members-only" line on the hub rather than a vague promise of
 * "more inside".
 */
export function lockedCountFor(id: PersonId): number {
  const c = contentFor(id);
  return (
    c.scenes.filter((s) => s.access === "premium").length +
    c.clips.filter((x) => clipAccess(x) === "premium").length +
    c.galleries.filter((g) => g.access === "premium").length +
    c.journal.filter((e) => e.access === "premium").length +
    c.notes.filter((n) => n.access === "premium").length
  );
}

/** The other two, for the "elsewhere in the world" row at the foot of a hub. */
export function others(id: PersonId): Character[] {
  return characters.filter((c) => c.id !== id);
}

/** Label for a person id, falling back to the taxonomy. */
export function nameFor(id: PersonId): string {
  return getCharacter(id)?.name ?? getPerson(id)?.label ?? id;
}
