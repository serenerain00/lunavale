/**
 * "Previously on Between Us" — the recap, as approved content.
 *
 * APPROVED BY MELISSA 2026-10-11, word for word. Change it only with her.
 *
 * WRITTEN ONLY FROM WHAT IS ALREADY PUBLIC. Every line is drawn from the
 * episode's own synopsis on the site (lib/content/videos.ts), never from
 * LUNA_VALE_CONTEXT.md. That is the whole spoiler rule in one sentence: a
 * recap may remind people of what they could already have seen, and nothing
 * else. In particular it says nothing about what Tyson feels, and Josh is
 * "ten years together", never a husband — see the canon notes.
 *
 * Ordered, oldest first. When an episode ships, its recap is added here once
 * Melissa has approved the words, and every email that uses the recap picks
 * it up.
 */

export interface Recap {
  /** Episode slug, as in /clips/<slug>. */
  slug: string;
  /** How the episode is named inside the recap. */
  label: string;
  text: string;
}

export const PREVIOUSLY_ON: Recap[] = [
  {
    slug: "pilot",
    label: "Episode 1",
    text:
      "After ten years together, Luna and Josh have built a whole life on the assumption that they’ll always find their way back to each other. One ordinary night shows her how far apart they’ve grown, and she leaves. The person she calls is Tyson, her best friend of twenty years. He answers.",
  },
  {
    slug: "episode-2",
    label: "Episode 2: Breathe",
    text:
      "A grocery run and a stop at Rick’s to sign paperwork pull her back toward the life she just walked out of, and finally to the farmhouse, and Josh. It was supposed to be a quick handoff. It wasn’t.",
  },
  {
    slug: "episode-3",
    label: "Episode 3: The Space Between",
    text:
      "She finds the journal from her first year with Josh and reads it cover to cover, looking for the moment loving each other stopped being enough. Then Tyson finds her reading. Later that night, Josh calls.",
  },
];

/** The newest recapped episode — what "watch the latest" points at. */
export function latestRecapped(): Recap {
  return PREVIOUSLY_ON[PREVIOUSLY_ON.length - 1];
}
