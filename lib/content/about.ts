/**
 * About — the page for somebody who just arrived and has no idea what this is.
 *
 * WHY IT EXISTS. The work goes out on Instagram as fragments, out of order,
 * jumping between a month-one night at a bar and something that happens much
 * later, and the comments say the same thing back: this isn't clear. That is
 * not a flaw in the scenes. It is the entirely reasonable response of somebody
 * handed the middle of a story with no way to find the beginning — and the
 * site, until now, answered that question nowhere. The home page opens on
 * atmosphere and the cast pages assume you already care.
 *
 * SO THIS PAGE DOES TWO JOBS, and the second one is the one that actually
 * fixes the comments:
 *
 *   1. Who Luna is and what the story is, in about ninety seconds of reading.
 *   2. An explicit statement that the releases are NOT in order, on purpose,
 *      and that nobody has missed an episode. A viewer who thinks they are
 *      confused stops watching; a viewer who knows the shape is deliberate
 *      keeps going.
 *
 * WHAT IT WILL NOT DO IS SPOIL. Everything below is the premise — what you
 * would know ten minutes in. The turns are not here: not the lie, not what
 * Josh becomes, not where it ends up. That is the story, the story is the
 * product, and a page written to reduce confusion must not solve it by giving
 * the plot away.
 *
 * DRAFT PROSE, written to Melissa's canon in LUNA_VALE_CONTEXT.md. The beats
 * are hers; the sentences are not.
 */

export interface AboutSection {
  /** Stable id — used as the heading anchor. */
  id: string;
  heading: string;
  body: string[];
  /**
   * Places to go from this section, rendered as a row underneath it.
   *
   * Structured rather than written into the prose as markdown links: the only
   * section that wants them needs two, and parsing link syntax to save two
   * fields would be the wrong trade. See `bold()` in the page for the same
   * reasoning about emphasis.
   */
  links?: { href: string; label: string }[];
}

/** The premise. Free, always — this is the page's whole reason for existing. */
export const premise: AboutSection[] = [
  {
    id: "what-this-is",
    heading: "What this is",
    body: [
      "Luna Vale is a story about three people, told in clips you watch, pages from a diary you were never meant to read, and photographs from rooms they were alone in.",
      "It is set on a working farm, at a lakehouse, in a bar, on a track, and along the roads between them. It is for adults, and it is quiet rather than loud — the kind of story where the worst thing that happens in a room is something somebody doesn't say.",
    ],
  },
  {
    id: "luna",
    heading: "Who Luna is",
    body: [
      "Luna spent ten years with Josh. By the end of them he had stopped noticing her, and they spent six months apart.",
      "Then he called. Coffee, and dinner the same night, and it started again — and she went back knowing exactly what she was going back to.",
      "That is the thing worth understanding about her before anything else: she is not naïve and she is not a victim. She sees the situation clearly, chooses badly anyway, and knows she is doing it. Most of the story happens inside her rather than in front of her.",
    ],
  },
  {
    id: "the-two-men",
    heading: "The two men",
    body: [
      "**Josh** is ten years of her life. He is charming, commanding, physical, and when he is the man she fell for there is nowhere else she wants to be. He runs a shop and a farm and puts work first. What she feels with him is a thrill she can no longer entirely separate from fear.",
      "**Tyson** has been her best friend for twenty years. Ex-military, friend of the family, Josh's second cousin, and around the farm often enough to be part of it. He is the one who kept her head above water through the six months Josh was gone.",
      "Somewhere in those six months it stopped being only friendship, on both sides. Neither of them will say so. That is where you are coming in.",
    ],
  },
  {
    id: "around-them",
    heading: "And the people around them",
    body: [
      "**Rick** is Josh's father — dominance with charisma, and most of the reason Josh is the way he is. He loves his son in a form his son has never been able to use. He is disappointed in Josh for losing Luna, and he always thought she was too good for him; he holds both at once and says neither in a way that helps anybody.",
      "**Cathy** is Luna's mother, sixty-five and two thousand miles away in Atlanta. She calls until Luna picks up. She has known Josh for ten years and never once from inside the room, so when he calls her sounding wrecked she believes him — and she is not wrong about what she heard.",
      "**Avery** is Luna's sister, ten years younger, still in Atlanta with their mother. She does not ask Luna how she is. She never has. She calls and talks about nothing until Luna is laughing, and then waits.",
      "None of them is one of the three. They matter for what they explain about Luna, Josh and Tyson — and the story stays those three.",
    ],
  },
];

/**
 * Where to start.
 *
 * THIS SECTION USED TO SAY THE OPPOSITE. It was called "It isn't in order, and
 * that's on purpose", and it existed to reassure somebody who had watched four
 * clips out of sequence that they had not missed an episode. That was an
 * honest answer to a real complaint for as long as there was no order to offer.
 *
 * There is one now (lib/content/chronology.ts, 2026-09-16), so the reassurance
 * became a lie about the product — and worse, an instruction to expect
 * confusion from a library that is no longer confusing. The `id` is kept
 * because it is an anchor somebody may have linked to.
 */
export const howToWatch: AboutSection = {
  id: "out-of-order",
  heading: "Start at the beginning",
  body: [
    "These were made in whatever order they finished, which is how anything gets made. They are not shown to you that way. The clips are arranged the way they happen to Luna, and each one tells you where it sits, so you can follow the shape of it rather than guessing.",
    "They are moments rather than episodes, so there are gaps — this is not the whole story and it is not meant to be. Start at the top, or dip in wherever the picture looks interesting. Each one stands on its own and nothing assumes you have seen the last one.",
    "Her journal runs the same way. It is the same story from inside her head, on the nights it happened, and several pages are open to anyone.",
  ],
};

/**
 * Being made right now — the section that turns a reader into a participant.
 *
 * THREE CLAIMS, and all three are promises the product has to keep, so they
 * are worded as what is actually true rather than as what would sell hardest:
 *
 *   "In production" — it is. Scenes are still being shot and cut.
 *   "Members shape what gets made next" — the mechanism was Overheard until
 *     it was archived on 2026-08-10 (see lib/content/overheard.ts). It is now
 *     the per-scene comment box and the survey, which are the two things that
 *     actually reach her. Still no vote, no poll, no roadmap board: the copy
 *     points at what exists rather than implying machinery.
 *   "It may become a series" — a conversation, and said as one. Not
 *     "announcing", not "coming soon". If it firms up, this paragraph is the
 *     place to say so; if it dies, this paragraph comes out.
 *
 * "Low budget" is stated as "independently, on a small budget", which is the
 * same fact without the apology. For this audience it is a reason to care,
 * not a warning about quality — but only if it is said like one.
 *
 * The Virgin River comparison is Melissa's reference for the shape and is
 * deliberately NOT on the page. Name-checking a network show is pitch-deck
 * language, and the tone rules in CLAUDE.md rule that out. The idea it stands
 * for — ordinary days, a few places, runs for years rather than resolving —
 * is in the copy on its own terms.
 */
export const inProduction: AboutSection = {
  id: "being-made",
  heading: "It's being made right now",
  body: [
    "This isn't a finished thing being rolled out on a schedule. It's in production while you read this, made independently, on a small budget, by a very small number of people.",
    "Which is worth saying plainly about one thing: it's finished for a phone. That's the screen it's graded and mastered for, and it's where it looks the way it's meant to. A television will show you the budget. When there's money for a higher-resolution finish there will be one, and until then that's the honest trade — the story is the part the budget went on.",
    "It's a series. That was an open question for a while and it isn't any more, and it's the right shape for this story: it's built out of ordinary days, in a handful of places, between people whose situation doesn't resolve neatly. That kind of story runs for years. It doesn't finish in ninety minutes.",
    "Here's the part worth knowing. What gets made next isn't fixed. Who it follows, which room it happens in, what finally gets said out loud — those are still open, and members are in the conversation where they get decided. A character somebody can't stop thinking about, a room they want to go back into, a question they want answered: at this size, that genuinely moves things.",
    "The way to be in that conversation is to say something. There's a box at the end of every clip that goes straight to Melissa, and a short survey about where this should go next. She reads all of it.",
  ],
  links: [
    { href: "/survey", label: "Answer six questions" },
    { href: "/membership", label: "What membership opens" },
  ],
};

/** Where to send somebody who has just read the above and wants to begin. */
export interface StartingPoint {
  href: string;
  label: string;
  detail: string;
}

export const startingPoints: StartingPoint[] = [
  {
    href: "/clips",
    label: "The clips",
    detail:
      "Moments from the series, arranged the way they happen rather than the way they were made. A look at what season one is walking into.",
  },
  {
    href: "/clips/interview",
    label: "The cast interview",
    detail:
      "The three of them sitting down together, talking about who they are. Six minutes, free, and the easiest way in.",
  },
  {
    href: "/journal",
    label: "Luna's journal",
    detail:
      "Her own account of the same nights. Several entries are open to everyone, and they give away the voice without giving away a turn.",
  },
  {
    // MOVED HERE 2026-09-16 when it came out of the nav. A page nobody links
    // to is a page nobody reads, and this was about to become one.
    href: "/twenty-questions",
    label: "Twenty questions with Luna",
    detail:
      "Readers asked, and she answered — about Josh, about Tyson, and about what she is not saying to either of them.",
  },
  // "The world" was here — "walk into the farmhouse and the lakehouse and find
  // the story by looking around instead of pressing play". Removed 2026-09-15
  // with the rest of it: the rooms are off the site until they are finished
  // (WORLD_ENABLED in lib/content/world.ts). Put this back when they return.
];
