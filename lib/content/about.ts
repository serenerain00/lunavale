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
}

/** The premise. Free, always — this is the page's whole reason for existing. */
export const premise: AboutSection[] = [
  {
    id: "what-this-is",
    heading: "What this is",
    body: [
      "Luna Vault is a story about four people, told in scenes you watch, pages from a diary you were never meant to read, and photographs from rooms they were alone in.",
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
    id: "rick",
    heading: "And Josh's father",
    body: [
      "Rick is dominance with charisma, and most of the reason Josh is the way he is. He loves his son in a form his son has never been able to use.",
      "He is disappointed in Josh for losing Luna, and he always thought she was too good for him. He holds both at once and says neither in a way that helps anybody.",
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
