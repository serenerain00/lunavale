/**
 * The audience survey — what people think of it, and what they want it to be.
 *
 * WHY IT IS HERE RATHER THAN IN A SURVEY TOOL. Melissa asked (2026-08-09)
 * whether a hosted form would be easier and said she would rather have this
 * one, tailored. The tailoring is the argument: question two lists the actual
 * scenes from lib/content/videos.ts, so the answer comes back as a slug she
 * can act on rather than as free text somebody typed from memory. A hosted
 * form cannot know what she released this morning.
 *
 * It also keeps the answers in her own database next to the memberships and
 * the wall, on a page that looks like the rest of the world rather than like a
 * Google form dropped into it — and it means the results can sit on /admin
 * beside everything else she looks at.
 *
 * WHAT IT IS FOR, in her words: how people are enjoying the scenes and clips,
 * and whether they would want it as a series or a film on a major streaming
 * platform. Everything below serves one of those two questions. The temptation
 * with a survey is to ask twenty things because the form is already open; this
 * asks SIX, one of them optional, because the response rate on a survey is a
 * curve that falls off a cliff and the only answers that matter are the ones
 * people finish.
 *
 * OPEN TO EVERYONE, deliberately, including people with no account. The point
 * is to hear from the Instagram audience — the people who have watched a
 * fragment and have an opinion and no reason to sign up — and a survey that
 * only members can answer would measure the one group whose enthusiasm is
 * already proven.
 *
 * IDS ARE STORED, NOT LABELS. Every answer goes into the database as the
 * option's `id`, so rewording a question later does not orphan the answers
 * already given. Add options freely; RENAME them never.
 */

import { videos } from "@/lib/content/videos";

export interface SurveyOption {
  /** Stored verbatim. Stable forever — see the module note. */
  id: string;
  label: string;
  /** Optional clarifier under the label. */
  detail?: string;
}

export interface SurveyQuestion {
  id: string;
  /** The question as asked. */
  prompt: string;
  /** A line under it, when the question needs framing. */
  help?: string;
  kind: "single" | "multi" | "scene" | "text";
  required: boolean;
  options?: SurveyOption[];
  maxLength?: number;
}

/** The free-text answer's ceiling. Long enough for a paragraph, not an essay. */
export const MAX_COMMENT = 900;

/**
 * Cookie marking a browser as having answered, and the token stored in the
 * row so the two can be matched up.
 *
 * A year, because this is a one-off ask: somebody who answered in August
 * should not be asked again in October. It is a courtesy and not security — a
 * private window walks straight past it, deliberately, see schema.sql.
 *
 * IT LIVES HERE rather than beside the action that sets it because a
 * "use server" module may only export async functions. Exporting one string
 * from there silently invalidates every other export in the file, which
 * presents as "the module has no exports at all" at build time and sends you
 * hunting in the wrong place entirely.
 */
export const ANSWERED_COOKIE = "lv_survey";

/**
 * Scenes offered in the "which one stayed with you" question.
 *
 * Derived from the catalog rather than listed here, so a scene released today
 * is answerable today and nobody has to remember to update two files. The
 * interview is excluded — it is the cast talking about the story, not a scene
 * from it, and leaving it in would have it win on familiarity alone since it
 * is the one thing most visitors have actually seen.
 */
export function sceneOptions(): SurveyOption[] {
  return videos
    .filter((v) => !v.hidden && v.slug !== "interview")
    .map((v) => ({ id: v.slug, label: v.title }));
}

export const questions: SurveyQuestion[] = [
  {
    id: "enjoyment",
    prompt: "How are you finding it so far?",
    kind: "single",
    required: true,
    // Four options and no middle. A five-point scale with a neutral center
    // collects a pile of shrugs from people who did not want to be rude, and
    // "it's fine" tells her nothing she can use.
    options: [
      { id: "hooked", label: "Hooked", detail: "I want the next one now" },
      { id: "liking", label: "Really liking it" },
      { id: "mixed", label: "Some of it lands, some doesn't" },
      { id: "not-for-me", label: "Not for me" },
    ],
  },
  {
    id: "favourite_scene",
    prompt: "Which one has stayed with you?",
    help: "The one you'd send someone. Skip it if nothing has yet.",
    kind: "scene",
    required: false,
  },
  {
    id: "format",
    prompt: "If this got made properly — a series or a film?",
    kind: "single",
    required: true,
    options: [
      {
        id: "series",
        label: "A series",
        detail: "Ordinary days, a few places, running for years",
      },
      { id: "film", label: "A film", detail: "One story, told once, properly" },
      { id: "either", label: "Either — as long as it gets made" },
      { id: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "would_watch",
    prompt: "Would you watch it on a major streaming platform?",
    help: "Netflix, Prime, that kind of thing.",
    kind: "single",
    required: true,
    options: [
      { id: "day-one", label: "Day one" },
      { id: "probably", label: "Probably" },
      { id: "if-recommended", label: "If someone I trusted told me to" },
      { id: "no", label: "No" },
    ],
  },
  {
    id: "wants",
    prompt: "What do you want more of?",
    help: "Pick as many as you like.",
    kind: "multi",
    required: false,
    options: [
      { id: "luna-tyson", label: "Luna and Tyson" },
      { id: "luna-josh", label: "Luna and Josh" },
      { id: "the-family", label: "Cathy and Avery" },
      { id: "josh-rick", label: "Josh and his father" },
      { id: "journal", label: "Luna's journal" },
      { id: "stills", label: "The stills" },
      { id: "behind", label: "Behind the scenes — the takes, how it's made" },
      { id: "backstory", label: "How they got here — the years before" },
    ],
  },
  {
    id: "comment",
    prompt: "Anything you want to say to Melissa?",
    help: "Optional. She reads them.",
    kind: "text",
    required: false,
    maxLength: MAX_COMMENT,
  },
];

export function getQuestion(id: string): SurveyQuestion | undefined {
  return questions.find((q) => q.id === id);
}

/**
 * Whether an answer is one this question actually offers.
 *
 * The form is the wrong place to enforce this — anybody can post whatever they
 * like to a server action — so the check lives next to the questions and the
 * action calls it. An unknown id is dropped rather than stored, which keeps
 * the aggregate on /admin honest.
 */
export function isValidOption(questionId: string, optionId: string): boolean {
  const q = getQuestion(questionId);
  if (!q) return false;
  if (q.kind === "scene") return sceneOptions().some((o) => o.id === optionId);
  return (q.options ?? []).some((o) => o.id === optionId);
}

/** Label for a stored id, for the admin read-out. Falls back to the raw id. */
export function labelFor(questionId: string, optionId: string): string {
  const q = getQuestion(questionId);
  const pool = q?.kind === "scene" ? sceneOptions() : (q?.options ?? []);
  return pool.find((o) => o.id === optionId)?.label ?? optionId;
}
