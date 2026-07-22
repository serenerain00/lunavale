/**
 * Luna's journal — her private account, filed by where it was written and who
 * it is about.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ EVERY ENTRY BELOW IS PLACEHOLDER. This is Luna's interior voice, which  │
 * │ is the most canon-sensitive writing in the product — CLAUDE.md: "Never  │
 * │ silently alter story canon." These were written to give the experience  │
 * │ something real to hold and to set a tone, NOT to establish what Luna    │
 * │ thinks. Replace the `body` of each one with Melissa's writing.          │
 * │                                                                         │
 * │ The `id`, `place`, `about` and `sceneSlug` fields are structural and    │
 * │ safe to keep; the prose is not.                                         │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Access: entries are premium by default. docs/monetization/MONETIZATION.md
 * lists journals under Vault Membership, the membership page sells "Luna's
 * writing, in her own words", and the journal objects already placed in the
 * farmhouse (lib/content/world.ts) are marked premium and say members can read
 * them. Making these free would make all three of those statements false. Two
 * are open as a taste of the handwriting — enough to know what you'd be
 * buying, not enough to be the whole thing.
 *
 * Content DATA only. One entry is one page of paper.
 */

import type { AccessLevel } from "@/lib/content/videos";
import type { PersonId, PlaceId } from "@/lib/content/taxonomy";

export interface JournalEntry {
  /** Stable id — appears in /journal/<id>. Do not rename casually. */
  id: string;
  /**
   * In-world dateline, written the way she'd write it at the top of a page.
   * Deliberately not a real date: the story's chronology isn't fixed yet, and
   * a wrong date is worse than an evocative one.
   */
  dateline: string;
  /** Which place it was written in — the browse axis. */
  place: PlaceId;
  /**
   * The specific spot, when it matters: "The firepit", "The porch", "Our
   * bedroom". Free text, because rooms are finer-grained than the place
   * taxonomy and not every entry needs one.
   */
  where?: string;
  /** Who the entry is about. An entry can be about more than one person. */
  about: PersonId[];
  /** The scene this sits beside, when it's the same night. */
  sceneSlug?: string;
  /** Paragraphs, in order. One entry fits one sheet of paper. */
  body: string[];
  access: AccessLevel;
  mature: boolean;
}

export const journal: JournalEntry[] = [
  {
    id: "firepit-first-night",
    dateline: "Late — the first cold night",
    place: "lakehouse",
    where: "The firepit",
    about: ["tyson"],
    sceneSlug: "tyson-luna-lakehouse-fire",
    access: "free",
    mature: false,
    body: [
      "He built the fire the way he does everything, like it had already been decided and he was just catching up to it. I watched him crouched over the wood and thought: I am not going to say anything tonight.",
      "I said something.",
      "Not the thing. Something next to the thing, close enough that he could have reached over and picked it up if he wanted to. He didn't. He let it sit between us and get warm and go out, and I have never been so grateful to anyone for not understanding me.",
      "The lake was completely still. I keep thinking about that. All that water and not one bit of it moving.",
    ],
  },
  {
    id: "lakehouse-mine",
    dateline: "The morning after everyone left",
    place: "lakehouse",
    where: "The back deck",
    about: ["luna"],
    access: "free",
    mature: false,
    body: [
      "First morning in this house that has been entirely mine. I made coffee in a kitchen nobody else has an opinion about and drank it standing up, outside, in the cold, because there was no one to tell me to come in.",
      "I keep waiting to feel the loss of it. I feel something, and I have been calling it loss for weeks now because that is the polite word for it, and this morning I am willing to write down that it might just be quiet.",
      "I bought this place before I knew I'd need it. That's the part I can't get over.",
    ],
  },
  {
    id: "kitchen-ordinary",
    dateline: "Tuesday, nothing happening",
    place: "farmhouse",
    where: "The kitchen",
    about: ["josh"],
    sceneSlug: "luna-josh-kitchen-kiss",
    access: "premium",
    mature: false,
    body: [
      "He came in from the field with dirt on him and stood in the doorway not saying anything, and I kept cutting because if I looked up I'd have had to decide what my face was doing.",
      "Eleven years. He still stands in a doorway like he's asking.",
      "That's the whole entry. I want a record that on an ordinary Tuesday, with nothing happening, it was still like that.",
    ],
  },
  {
    id: "farmhouse-note",
    dateline: "He'd already gone",
    place: "farmhouse",
    where: "The kitchen island",
    about: ["josh"],
    sceneSlug: "luna-josh-first-morning",
    access: "premium",
    mature: false,
    body: [
      "A note on the island. Didn't want to wake you. Coffee's still warm.",
      "I have thrown away every other note he has ever written me because they were about the truck, or the vet, or what time. I put this one in the drawer and I am not going to look at why.",
      "Coffee was cold. I drank it anyway, which I think tells you where I am.",
    ],
  },
  {
    id: "bedroom-ceiling",
    dateline: "3 a.m., can't sleep",
    place: "farmhouse",
    where: "Our bedroom",
    about: ["josh", "tyson"],
    sceneSlug: "luna-josh-bed",
    access: "premium",
    mature: true,
    body: [
      "Josh asleep beside me, breathing the way he has breathed next to me for eleven years, and I lay there running a conversation I had at a firepit two weeks ago like a tape.",
      "I want to be clear with myself, since this book is the only place I'm allowed to be: nothing happened. Nothing has happened. I am not writing a confession.",
      "I'm writing down that I have started to keep track of which things I don't mention, and the list is getting long enough that keeping it is its own kind of work.",
    ],
  },
  {
    id: "bar-honest",
    dateline: "After the bar",
    place: "bar",
    about: ["tyson"],
    sceneSlug: "luna-tyson-bar",
    access: "premium",
    mature: false,
    body: [
      "Loud enough in there that you have to lean in to be heard, which is a thing bars know about themselves.",
      "He asked me a direct question. I gave him a true answer. I have been turning that over all the way home because I could have given him a kind one instead, and I didn't, and he didn't flinch.",
      "There's a version of me that finds that unbearable. She wasn't out tonight.",
    ],
  },
  {
    id: "lake-said-it",
    dateline: "Out at the water, in the rain",
    place: "lake",
    where: "The dock",
    about: ["tyson"],
    sceneSlug: "ty-luna-lake-fight",
    access: "premium",
    mature: false,
    body: [
      "We went far enough out that nobody could hear, which is how I knew we both intended to say it.",
      "He got there first. He usually does. And the thing about hearing it out loud, in the rain, from someone who is not asking you for anything, is that afterwards you cannot go back to the arrangement where it hadn't been said.",
      "I didn't answer him. I want to write that down honestly. I stood there and let the rain do the talking and then I said we should go back, and we went back.",
      "That is not the same as saying no. I know exactly what it is.",
    ],
  },
  {
    id: "road-walking",
    dateline: "Walking back up the road",
    place: "farmhouse",
    where: "The farm road",
    about: ["tyson"],
    sceneSlug: "ty-luna-farm-road",
    access: "premium",
    mature: false,
    body: [
      "Left the truck at the bottom and walked, which added twenty minutes and gave neither of us anything to do with our hands.",
      "Neither of us named it. We talked about the fence line and the weather coming in and whether the far gate needs replacing before winter, and underneath every sentence was the sentence, and we both let it stay under.",
      "Twenty minutes is a long time to be that careful.",
    ],
  },
  {
    id: "park-after",
    dateline: "After the park",
    place: "park",
    about: ["josh", "tyson"],
    sceneSlug: "tyson-park-fight",
    access: "premium",
    mature: true,
    body: [
      "Open ground. Nowhere for either of them to put their eyes except on each other, and nowhere for me to stand that wasn't a side.",
      "The worst of it isn't what was said. It's that they've clearly both been carrying it long enough to have it ready.",
      "I have spent weeks telling myself that keeping quiet was a way of protecting people. Today I watched what it protected.",
    ],
  },
  {
    id: "bath-quiet",
    dateline: "Late, alone",
    place: "farmhouse",
    where: "The bathroom",
    about: ["luna"],
    sceneSlug: "luna-bathtub",
    access: "premium",
    mature: true,
    body: [
      "Candles because the overhead light is honest and I wasn't up to it.",
      "An hour in there, and for the first forty minutes I thought about both of them, and for the last twenty I didn't think about either of them, and that twenty is the only rest I've had in a month.",
      "Note for whoever I turn out to be after this: it was possible. Even in the middle of it. That's worth knowing.",
    ],
  },
  {
    id: "dinner-table",
    dateline: "After they'd all gone home",
    place: "farmhouse",
    where: "The long table",
    about: ["josh"],
    sceneSlug: "luna-josh-dinner-house",
    access: "premium",
    mature: false,
    body: [
      "Ten people at the table and I watched him be the man everyone thinks he is, and he is that man, that's the thing. It isn't a performance. I married someone genuinely good.",
      "So the question isn't whether he deserves it. The question is what you do when the answer to that is no and it changes nothing.",
      "Cleared up alone. Didn't mind.",
    ],
  },
  {
    id: "firepit-again",
    dateline: "Back at the firepit, months on",
    place: "lakehouse",
    where: "The firepit",
    about: ["luna", "tyson"],
    access: "premium",
    mature: false,
    body: [
      "Same chairs. Same wood pile. I sat in his one, on purpose, to see whether it would do anything to me.",
      "It did, and less than I expected, and I sat with the smaller number for a while and found I could stand it.",
      "The lake was moving tonight. Wind off the far shore. I don't think it means anything. I'm writing it down anyway, because the last time I was out here it was completely still, and I want the record to show that things move.",
    ],
  },
];

/* ------------------------------------------------------------------ query */

export function getEntry(id: string): JournalEntry | undefined {
  return journal.find((e) => e.id === id);
}

/** Entries written in a place, in the order they appear above. */
export function entriesInPlace(place: PlaceId): JournalEntry[] {
  return journal.filter((e) => e.place === place);
}

/** Entries about a person. */
export function entriesAbout(person: PersonId): JournalEntry[] {
  return journal.filter((e) => e.about.includes(person));
}

/** Entries sitting beside a scene, for cross-linking from /watch. */
export function entriesForScene(slug: string): JournalEntry[] {
  return journal.filter((e) => e.sceneSlug === slug);
}

/** The first line, used as a card preview. */
export function opening(entry: JournalEntry, max = 110): string {
  const first = entry.body[0] ?? "";
  if (first.length <= max) return first;
  // Cut on a word boundary so the preview never ends mid-word.
  return `${first.slice(0, first.lastIndexOf(" ", max))}…`;
}

/** Places that actually hold entries, in taxonomy order. */
export function placesWithEntries(): PlaceId[] {
  const seen = new Set<PlaceId>();
  for (const entry of journal) seen.add(entry.place);
  return [...seen];
}
