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
 * DRAFT PROSE, written to Melissa's canon in LUNA_VAULT_CONTEXT.md. The beats
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
      "Luna Vault is a story about three people, told in scenes you watch, pages from a diary you were never meant to read, and photographs from rooms they were alone in.",
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
      "**Tyson** has been her best friend for twenty years. Ex-military, friend of the family, distant cousin of Josh's, and around the farm often enough to be part of it. He is the one who kept her head above water through the six months Josh was gone.",
      "Somewhere in those six months it stopped being only friendship, on both sides. Neither of them will say so. That is where you are coming in.",
    ],
  },
  {
    id: "around-them",
    heading: "And the people around them",
    body: [
      "**Rick** is Josh's father — dominance with charisma, and most of the reason Josh is the way he is. He loves his son in a form his son has never been able to use. He is disappointed in Josh for losing Luna, and he always thought she was too good for him; he holds both at once and says neither in a way that helps anybody.",
      "He is not one of the three. Neither are the others who arrive later — Luna's mother among them. They matter because of what they explain about Luna, Josh and Tyson, and the story stays those three.",
    ],
  },
];

/**
 * The section that answers the actual complaint. Kept separate from `premise`
 * so it can be given its own weight on the page — it is the reason a confused
 * viewer stays rather than scrolling on.
 */
export const howToWatch: AboutSection = {
  id: "out-of-order",
  heading: "It isn't in order, and that's on purpose",
  body: [
    "Scenes are released as they are finished, not as they happen. A night from the first month can land after something from much later; a five-year-old memory can arrive in the middle of the present.",
    "So if you have watched a few and felt like you missed one — you didn't. There is no episode you skipped. The pieces are being handed to you out of sequence and they are meant to add up gradually.",
    "Two things make it click faster. Every scene says where it sits when you open it, and Luna's journal runs in the order it actually happened — so if you would rather have the spine before the fragments, start there.",
  ],
};

/**
 * Being made right now — the section that turns a reader into a participant.
 *
 * THREE CLAIMS, and all three are promises the product has to keep, so they
 * are worded as what is actually true rather than as what would sell hardest:
 *
 *   "In production" — it is. Scenes are still being shot and cut.
 *   "Members shape what gets made next" — the mechanism is Overheard and
 *     nothing more formal. There is no vote, no poll, no roadmap board, so
 *     the copy points at the room instead of implying machinery that would
 *     have to be built to make the sentence true.
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
    "This isn't a finished thing being rolled out on a schedule. The film is in production while you read this — made independently, on a small budget, by a very small number of people.",
    "Which is the part worth knowing: the next scene isn't fixed yet. What gets made, who it follows and which room it happens in are still open questions, and members are in the conversation where those get decided. A character somebody can't stop thinking about, a room they want to go back into, a question they want answered — at this size, that genuinely moves things.",
    "**Overheard** is where that happens. Luna, Tyson, Josh and Rick post there most days, and members write back — ask them things, tell them what they should have done, or say straight out what isn't working. It goes to Melissa, who is in there too.",
    "And it may not stay a film. There is a conversation going on about extending it into a series, which is a shape this story can take: it is built out of ordinary days, in a handful of places, between people whose situation does not resolve neatly. That is the kind of story that runs for years rather than finishing in ninety minutes.",
  ],
  links: [
    { href: "/overheard", label: "The Overheard wall" },
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
    href: "/watch/interview",
    label: "The interview",
    detail:
      "The cast, sitting down together, talking about who they are. Six minutes, free, and the least confusing way in.",
  },
  {
    href: "/journal",
    label: "Luna's journal",
    detail:
      "Her own account, in order. Several entries are open to everyone — they establish the voice without giving away a single turn.",
  },
  {
    href: "/browse",
    label: "The free scenes",
    detail:
      "A dozen scenes, in full and at full quality, with no account needed.",
  },
  {
    href: "/world",
    label: "The world",
    detail:
      "Walk into the farmhouse and the lakehouse and find the story by looking around instead of pressing play.",
  },
];
