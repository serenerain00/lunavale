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
 * The prose below is DRAFT, written to the canon in LUNA_VALE_CONTEXT.md
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
   * The dossier — the scannable facts, shown as a table above the prose.
   *
   * A LIST RATHER THAN A FIXED SCHEMA, because a fixed one would demand rows
   * that do not exist. Luna has no military history; Tyson has no children;
   * nobody has established what Josh drives. Fixed fields would leave those
   * blank or, worse, invite somebody to fill them in — and this is a story
   * where a made-up fact becomes canon the moment it is on a page.
   *
   * So: only what LUNA_VALE_CONTEXT.md actually establishes. Labels are kept
   * consistent where they apply (Age, From, Lives, Work) so the pages still
   * read as one set. If a row you want is missing, the canon is missing it.
   */
  facts?: { label: string; value: string }[];
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
      "She is from Atlanta. Josh was a man she met there on business, and for a while they did it long distance — and then, ten years ago, she left her mother, her sister and everyone she had known since she was a child, and moved to Colorado to live on his farm. That is the size of the bet, and it is worth holding onto when she is deciding whether to make another one.",
      "She has a streak: she likes danger, and she is loyal, and those two things point at different people. She is not a victim and she is not stupid. She sees the situation clearly, chooses badly, and knows she is doing it while she does it.",
      "What she is actually trying to work out is not which one of them to keep. It is whether there is a version of her life that she chose on purpose.",
    ],
    facts: [
      { label: "Age", value: "38" },
      { label: "From", value: "Atlanta, Georgia" },
      { label: "Lives", value: "Denver, Colorado — the lakehouse" },
      { label: "Work", value: "Models. Her own income, and the only part of her life that was never Josh's" },
      { label: "Family", value: "Cathy, her mother. Avery, her sister, ten years younger" },
      { label: "Josh", value: "Ten years, six months apart, and back again" },
      { label: "Tyson", value: "Twenty years. Best friend, and the thing neither of them says" },
    ],
    details: [
      "Models for a living — the one part of her life that was never his",
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
    facts: [
      { label: "Age", value: "38" },
      { label: "From", value: "Atlanta, Georgia" },
      { label: "Lives", value: "Denver — moved after he retired, for a change of pace" },
      { label: "Service", value: "Navy SEAL, ten years. Some of it deployed" },
      { label: "Work", value: "Several things at once. Contract work on Josh's farm is one of them" },
      { label: "Drives", value: "A black 2020 Porsche Carrera he treats like something on loan" },
      { label: "Family", value: "Josh's distant cousin — second or third, still being decided" },
      { label: "Cole", value: "Ten years a SEAL beside him, and the only person he can say it to" },
      { label: "Luna", value: "Twenty years. He was there for all six months she was alone" },
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
    facts: [
      { label: "From", value: "Denver, Colorado" },
      { label: "Lives", value: "The farm — where he and Luna spent the ten years" },
      { label: "Work", value: "Owns a shop and a large farm. Work first, always" },
      { label: "Family", value: "Rick, his father. Tyson, his distant cousin" },
      { label: "Luna", value: "Met her in Atlanta on business. Long distance, and then she moved" },
    ],
    details: [
      "Owns the shop and the farm; work comes first and always has",
      "Grazes her lower lip mid-sentence and knows exactly what it does",
      "Told Tyson about the dinner the same morning, casually, as family do",
      "Takes it sitting down, in the one room where he never argues back",
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
    facts: [
      { label: "Lives", value: "Denver, Colorado" },
      { label: "Work", value: "A CEO, and he owns a brewery" },
      { label: "Drinks", value: "Very fine liquor. Never anything cheap" },
      { label: "Family", value: "Josh's father" },
      { label: "Luna", value: "Always thought she was too good for his son. Never told his son" },
    ],
    details: [
      "The only man in the room who gets up, and only for the last line",
      "The framed photograph on the shelf behind him is the two of them",
      "Thought Luna was too good for his son, and never told his son that",
      "Cares, demonstrably. Not once in a language Josh can read",
    ],
    pullQuote: "You think you're handling it? You're not.",
    pullQuoteSource: "The Study",
  },
  {
    // PORTRAIT BREAKS THE RULE at the top of this file, and it has to. The
    // others are frames from the cast interview precisely so a character hub
    // is about the person rather than one moment of theirs — but Cathy is not
    // in the interview, which was shot before she existed. This is a 3:4 crop
    // from "Long Distance", chosen for being the most neutral frame of her in
    // it: listening, not yet upset. Replace it if she is ever interviewed.
    id: "cathy",
    name: "Cathy",
    role: "Luna's mother",
    tagline:
      "Two thousand miles away, defending a man she has only ever met with the door open.",
    portrait: "/characters/cathy.jpg",
    intro: [
      "Sixty-five, divorced, and in Atlanta — which is the problem. Her daughter is in Colorado, alone in a lakehouse in the dark, and the only thing Cathy can actually do about that is call her.",
      "She is a good mother and she is a pushy one, and those are not in tension. She calls until you answer. She asks the question again. Luna needs a breath before she picks up, the way most daughters do, and there is nothing underneath it — no damage, no old wound, a childhood that was genuinely fine.",
      "What there is, is a gap. She has known Josh for ten years and never once from inside the room, so when he calls her sounding wrecked she believes him, because he is not lying. She is holding one half of it and asking her daughter to be kinder about the half she can see.",
    ],
    facts: [
      { label: "Age", value: "65" },
      { label: "Lives", value: "Atlanta, Georgia — two thousand miles from all of it" },
      { label: "Family", value: "Divorced. Two daughters: Luna, and Avery ten years behind her" },
      { label: "Tyson", value: "Has known him twenty years. Made the two of them lunches as teenagers" },
      { label: "Josh", value: "Ten years, and never once from inside the room" },
    ],
    details: [
      "Made Luna and Tyson lunches when they were teenagers",
      "Was there for Luna the whole time Tyson was deployed",
      "Loves Tyson like a son, and knows exactly whose best friend he is",
      "A shelf of framed photographs of people she cannot get on the phone",
      "Two daughters, and she will get one of them to call the other",
    ],
    // Written to Melissa's canon rather than transcribed off the cut — the
    // same standing as the prose above, and the same caveat.
    pullQuote: "He doesn't sound like himself.",
    pullQuoteSource: "Long Distance",
  },
  {
    // PORTRAIT BREAKS THE RULE AGAIN, and differently from Cathy's. Avery has
    // never been in the same room as a camera in this story — she exists only
    // on the screen of Luna's iPad. So this is a crop of that screen, upscaled
    // about two-thirds, and it is softer than every other portrait here.
    //
    // Kept anyway, because the softness is not a defect on this one: it is
    // what a person looks like when the only way you ever see them is a video
    // call from two thousand miles away. Replace it the day Avery is shot in a
    // room.
    id: "avery",
    name: "Avery",
    role: "Luna's sister",
    tagline:
      "Ten years younger, two thousand miles away, and the only one who doesn't have to ask.",
    portrait: "/characters/avery.jpg",
    intro: [
      "Twenty-eight, ten years behind Luna, and close to her for every one of them. Luna wanted a baby sister before there was one, and got her — and until Luna left for Colorado she was the person Avery took everything to first. Less big sister than best friend, and it shows in how alike they are, down to the face.",
      "She is still in Atlanta, where their mother is, three years into a psychiatry residency and on the hours that come with it. So she does not call often. Usually there is a family matter, or their mother has worn her down into it — and Luna is no good at saying anything real down a phone line anyway.",
      "Which is why the call works when it works. Cathy calls to find out how her daughter is. Avery already knows, because their mother told her and because she would have known regardless. So she doesn't ask. She talks about nothing in particular until Luna is laughing, and then she waits, and lets her get to it herself.",
    ],
    facts: [
      { label: "Age", value: "28" },
      { label: "Lives", value: "Atlanta, Georgia, with their mother nearby" },
      { label: "Work", value: "Third-year psychiatry resident. Two years off qualifying, and the hours to match" },
      { label: "Family", value: "Cathy, her mother. Luna, ten years ahead of her" },
      { label: "Tyson", value: "Has known him as long as she has been alive. Calls him a brother" },
    ],
    details: [
      "Has never once asked Luna how she is",
      "Third-year psychiatry resident, which is most of why she doesn't call",
      "Opened with eleven minutes about a man at her work who microwaves fish",
      "Says okay rather than advice",
      "Has known Tyson as long as she has been alive, and calls him a brother",
      "The one person Luna has never been able to lie to",
    ],
    // From "avery-called" rather than from the scene: the line is in Luna's
    // account of the call, not in dialogue on screen. Draft prose, same
    // standing as the rest of the journal — see the header of journal.ts.
    pullQuote: "Okay. Tell me the rest.",
    pullQuoteSource: "Luna's journal",
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
 * How much of a person's material is behind the LunaVerse. Drives the honest
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
