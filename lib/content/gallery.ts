/**
 * Still galleries — sets of images from an event in Luna's world, browsed as an
 * in-world photo set with her journal threaded through it.
 *
 * Two delivery models, chosen per gallery by `gated`:
 *
 *   FREE galleries keep their optimized web copies in public/gallery/<id>/NN.jpg
 *   and are served straight off /public — the same as before.
 *
 *   MEMBERS-ONLY galleries (`gated: true`) must NOT sit at a permanent public URL
 *   (CLAUDE.md: "Never expose … permanent premium media URLs"). Their optimized
 *   copies live outside /public in stills-private/<id>/ (gitignored), ship to
 *   PRIVATE Vercel Blob via scripts/upload-media.mjs, and reach a viewer only
 *   through the gated /api/still route after an entitlement check — exactly how
 *   story video is handled. The ONLY public artefact is the card cover, a teaser
 *   like a scene's poster, committed at public/gallery/<id>/cover.jpg.
 *
 * Build the optimized copies with:
 *   scripts/optimize-media.sh stills          <id>   # free  (public)
 *   scripts/optimize-media.sh private-stills   <id>   # gated (private + cover)
 */

import type { ContentNoteId } from "@/lib/content/content-notes";
import type { AccessLevel } from "@/lib/content/videos";
import type { FeelingId, PersonId, PlaceId } from "@/lib/content/taxonomy";

/** A journal fragment tied to a specific still — Luna's voice, in the image. */
export interface StillJournal {
  /** Links to an entry in lib/content/journal.ts. */
  entryId: string;
  /** A verbatim fragment of that entry, shown on the still. */
  excerpt: string;
}

/** Per-still context. Sparse: index 0 describes still 01, and any still may
 *  carry a caption, a journal fragment, both, or neither. */
export interface Still {
  /** A short in-world line under the image in the lightbox. */
  caption?: string;
  /** A journal fragment surfaced while viewing this still. */
  journal?: StillJournal;
}

export interface StillGallery {
  /** Matches the source/optimized folder name. */
  id: string;
  title: string;
  subtitle: string;
  /** Rich context, shown above the wall — how to read this set. */
  description: string[];
  /** Number of stills, numbered 01..count. */
  count: number;
  /**
   * False → images live at /gallery/<id>/NN.jpg (public, free set).
   * True  → images are served through the gated /api/still route (members only).
   */
  gated: boolean;
  /** Compressed public cover used as the catalog card image and locked teaser. */
  cover: string;
  /** Emotional context — how this set is browsed in the catalog. */
  feelings: FeelingId[];
  /** Where in the world it happens. */
  place: PlaceId;
  /** Who it's about — cross-links to journal and people. */
  about: PersonId[];
  /** The scene this set is drawn from, if it exists as a watchable video. */
  sceneSlug?: string;
  /**
   * The vertical clip of the same event, when there is one. Some sets have a
   * clip but no landscape scene — the run is stills and a 9:16 cut and nothing
   * else — and without this the two would sit on the site unaware of each other.
   */
  clipId?: string;
  /** The journal entry written around this event (gallery-level pull-quote). */
  journalEntryId?: string;
  /** Per-still captions and journal fragments; index 0 = still 01. */
  stills?: Still[];
  access: AccessLevel;
  mature: boolean;
  notes?: ContentNoteId[];
}

export const galleries: StillGallery[] = [
  /* --------------------------------------------------------------- the bar */
  {
    id: "the-bar",
    title: "The Bar",
    subtitle: "Luna & Tyson",
    description: [
      "A bar too loud to talk in — which is the point. It's where you can say the real thing without anyone, including the person across the table, able to prove you said it.",
      "Tyson has spent weeks building distance between them, doing the gate, saying the right amount, leaving. Tonight he lets it slip, on purpose, and watches to see whether she catches it. She catches it.",
    ],
    count: 12,
    gated: true,
    cover: "/gallery/the-bar/cover.jpg",
    feelings: ["desire", "distance"],
    place: "bar",
    about: ["luna", "tyson"],
    sceneSlug: "luna-tyson-bar",
    journalEntryId: "last-call",
    stills: [
      { caption: "Home from the bar, and she is not going to sleep." },
      {
        journal: {
          entryId: "last-call",
          excerpt:
            "So I sat in a bar too loud to talk in, and had a conversation that never happened, and understood every word of it.",
        },
      },
      {},
      {
        caption:
          "Twenty years of a man who does not waste words — and tonight he was rationing them.",
      },
      {
        caption:
          "In the gaps he just looked at her. And when she noticed, he did not look away. He let her have it.",
      },
    ],
    access: "premium",
    mature: false,
  },

  /* -------------------------------------------------------------- the park */
  {
    id: "the-park",
    title: "The Park",
    subtitle: "Luna & Tyson",
    description: [
      "Open ground, nowhere to hide. She asked him to meet her; he drove out, walked over, and then stood in front of her and said nothing for what she is fairly sure was twenty minutes.",
      "It is the thing they learned in the military — go silent, move close, wait for the other to crack — except neither of them is lying now, and that is exactly the problem.",
    ],
    count: 14,
    gated: true,
    cover: "/gallery/the-park/cover.jpg",
    feelings: ["hurt", "distance", "desire"],
    place: "park",
    about: ["luna", "tyson"],
    sceneSlug: "tyson-park-fight",
    journalEntryId: "the-park",
    stills: [
      { caption: "The park, and he wouldn't look at her." },
      {},
      {
        caption:
          "She asked him to look at her — out loud, more than once. He looked at the water. He looked at the ground.",
      },
      {},
      {},
      {},
      {},
      {
        journal: {
          entryId: "the-park",
          excerpt:
            "And then he said it. Eight words. He said: you're standing here, and I can't do anything about it.",
        },
      },
      {},
      {},
      { caption: "Eight words with a whole life underneath them." },
      {},
      {
        caption:
          "Nothing, nothing, nothing — and then one sentence she'll be carrying around for a year.",
      },
      {},
    ],
    access: "premium",
    mature: false,
  },

  /* -------------------------------------------------------------- the bolt */
  {
    id: "josh-luna-bolt",
    title: "The Bolt",
    subtitle: "Luna & Josh",
    description: [
      "A bolt on the tractor that has been seized since before either of them owned the place, an afternoon that is far too hot for it, and Luna at the end of what she believes she is capable of.",
      "He does not take the wrench off her. That is the whole scene. He could do it in a second and they both know it, and he stands there with his hands off it and tells her to give it one more.",
    ],
    count: 17,
    gated: true,
    cover: "/gallery/josh-luna-bolt/cover.jpg",
    feelings: ["trust", "desire"],
    place: "farmhouse",
    about: ["luna", "josh", "tyson"],
    sceneSlug: "josh-luna-bolt",
    clipId: "one-more",
    journalEntryId: "the-bolt",
    stills: [
      { caption: "Two hours in and neither of them has said anything for a while." },
      {},
      {},
      { caption: "This is the part where she decides it is a fact about her rather than a fact about the bolt." },
      {},
      {},
      {},
      {
        journal: {
          entryId: "the-bolt",
          excerpt:
            "He didn't take the wrench. That's the part. Ten years and I know exactly how fast he could have done it himself.",
        },
      },
      {},
      {},
      { caption: "It goes. The noise she makes is not a dignified noise." },
      {},
      {},
      {},
      {
        caption:
          "Tyson, at the door. He works this farm — there is nothing strange about him being here. Only about how long he stands there before he goes.",
      },
      {},
      {
        caption:
          "He doesn't come in, and he never mentions it afterwards. Her account of this afternoon does not have him in it at all.",
      },
    ],
    access: "premium",
    mature: false,
  },

  /* --------------------------------------------------------------- the run */
  {
    // Free on purpose. It is the one set with no turn in it — Luna alone, an
    // hour that belongs to nobody else — so gating it would withhold a mood
    // rather than a plot point, and the scene it belongs beside ("Run") is
    // already open. This is the shop window: the best-looking thing a visitor
    // can see without paying, and the one that argues the rest is worth it.
    id: "the-run",
    title: "The Run",
    subtitle: "Luna, alone",
    description: [
      "Six miles at the far end of the lake, headphones in, nobody to talk to and nobody to be all right for. Her favourite hour of the week and the only one in the story she does not spend managing somebody else.",
      "She is not thinking anything through out here. That is the point of it. Everything she has been carrying is still there when she gets back — she just gets to put it down for an hour first.",
    ],
    count: 10,
    gated: false,
    cover: "/gallery/the-run/cover.jpg",
    feelings: ["grief", "trust"],
    place: "lake",
    about: ["luna"],
    clipId: "run-at-the-lake",
    stills: [
      { caption: "Hers now. The truck, the drive, and nobody expecting her anywhere." },
      {},
      { caption: "She checks the watch out of habit. She is not racing anybody." },
      {},
      {},
      { caption: "Mile five, and the face nobody gets to see." },
      {},
      {},
      {},
      { caption: "An hour, and then back to it." },
    ],
    access: "free",
    mature: false,
  },

  /* ------------------------------------------------------------ the garage */
  {
    id: "the-garage",
    title: "The Garage",
    subtitle: "Tyson",
    description: [
      "Ex-military, and it never fully left him. The sign on the wall says DISCIPLINE EQUALS FREEDOM and he has never once mentioned it, because it is not a slogan to him — it is just the arrangement he made with himself a long time ago and has kept since.",
      "This is where he goes instead of saying anything. The bike, the bar, the weight, the same order every time. It is the most honest room he has, and the only place in the story he lets himself be seen working at something.",
    ],
    count: 4,
    gated: true,
    cover: "/gallery/the-garage/cover.jpg",
    feelings: ["distance", "desire"],
    place: "garage",
    about: ["tyson", "luna"],
    stills: [
      {
        caption:
          "The Ninja, mid-strip. He will ride this at a speed he would never take a corner at with her in the car.",
      },
      {},
      {},
      {
        caption:
          "She turns up and he keeps working, which is how he keeps his hands and his eyes busy at the same time.",
      },
    ],
    access: "premium",
    mature: false,
  },

  /* ----------------------------------------------------------- the firepit */
  {
    id: "the-firepit",
    title: "The Firepit",
    subtitle: "Luna & Tyson",
    description: [
      "The lakehouse is hers now — water, firelight, the place she processes everything. Over six months Tyson quietly became the person who kept her head above water, and somewhere in there it stopped being only that.",
      "He builds the fire the way he does everything: like it has already been decided and he's just catching up to it. Ex-military hands, no wasted movement. Neither of them says the thing. They get very good at almost saying it.",
    ],
    count: 17,
    gated: true,
    cover: "/gallery/the-firepit/cover.jpg",
    feelings: ["trust", "distance", "desire"],
    place: "lakehouse",
    about: ["luna", "tyson"],
    sceneSlug: "tyson-luna-lakehouse-fire",
    journalEntryId: "firepit-not-saying",
    stills: [
      {
        journal: {
          entryId: "month-four",
          excerpt:
            "When his truck comes up the drive, something in me lifts before I have decided to let it.",
        },
      },
      {},
      {},
      {},
      {},
      {},
      {
        journal: {
          entryId: "firepit-not-saying",
          excerpt:
            "He built the fire the way he does everything — like it had already been decided and he was just catching up to it. Ex-military hands.",
        },
      },
      {},
      {
        caption:
          "Into everything with his hands — snowboards, motorcycles, a black Carrera he won't corner hard with her in it.",
      },
      {},
      {},
      {},
      {},
      {},
      {
        journal: {
          entryId: "not-just-a-friend",
          excerpt:
            "But it isn't gratitude. I know what gratitude feels like. This is not that.",
        },
      },
      {
        caption:
          "Before any of this. Ex-military — the stillness in him was learned somewhere she never saw.",
      },
      {},
    ],
    access: "premium",
    mature: false,
  },

  /* ------------------------------------------------------------- the night */
  {
    id: "the-night",
    title: "The Night",
    subtitle: "Luna & Tyson",
    description: [
      "Much later. There was no moment — no decision. They were in the kitchen arguing about something so small she can't reconstruct it, and he stopped mid-sentence and looked at her, and she had a full second to step back and did not step back.",
      "It wasn't nervous. It was the least nervous she has been with anyone in her life. He already knew everything about her — nothing to explain, nowhere to be a version of herself. It is the thing that undoes her, because now she knows the difference.",
    ],
    count: 13,
    gated: true,
    cover: "/gallery/the-night/cover.jpg",
    feelings: ["desire", "trust"],
    place: "lakehouse",
    about: ["luna", "tyson"],
    journalEntryId: "the-night",
    stills: [
      { caption: "No fear in it. Not one second." },
      {},
      {},
      {
        journal: {
          entryId: "the-night",
          excerpt:
            "He kept checking. Not out loud — he wouldn't insult either of us like that. He just watched, the way he has watched me for twenty years.",
        },
      },
      {},
      {},
      {},
      {},
      {},
      {
        caption:
          "Four in the morning, and she has never felt safer — or more certain she's just made everything considerably worse.",
      },
      {},
      {},
      {
        journal: {
          entryId: "what-it-was",
          excerpt:
            "So now I know. That is the problem with finding out — you can't go back to the part where you were only wondering.",
        },
      },
    ],
    access: "premium",
    mature: true,
  },

  /* -------------------------------------------------------- josh & luna bed */
  {
    id: "josh-luna-bed",
    title: "Our Bedroom",
    subtitle: "Luna & Josh",
    description: [
      "Ten years, then six months apart, then his name on her phone at seven in the morning like no time had passed. She gave him another chance. This is the bedroom they built a life in.",
      "He's the man she first fell for, walked back in wearing it like he'd never taken it off. And then, at the sink, not looking at her: how often does Tyson come up here. Said lightly. There is no version of that question that is really about the gate.",
    ],
    count: 12,
    gated: true,
    cover: "/gallery/josh-luna-bed/cover.jpg",
    feelings: ["desire", "lies"],
    place: "farmhouse",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-bed",
    journalEntryId: "he-asked-about-tyson",
    stills: [
      {
        caption:
          "The original. The one she met, before he stopped noticing the house, the calendar, her.",
      },
      {},
      {},
      {
        journal: {
          entryId: "he-asked-about-tyson",
          excerpt:
            "I have started keeping track of what I don't mention, and the list is now long enough to be its own kind of work.",
        },
      },
      {},
      {},
      {
        caption:
          "How often does Tyson come up here. Said lightly, at the sink, not looking at her.",
      },
      {},
    ],
    access: "premium",
    mature: true,
    notes: ["control"],
  },

  /* ----------------------------------------------------- farmhouse kitchen */
  {
    id: "farmhouse-kitchen",
    title: "The Kitchen",
    subtitle: "Luna & Josh",
    description: [
      "An ordinary Tuesday, nothing happening. He comes in from the field with dirt on him and stands in the doorway not saying anything, and she keeps cutting — because if she looks up she'll have to decide what her face is doing.",
      "Ten years in, he still crosses a room like he's asking and has already been answered. She wants it on the record that on a day with nothing happening, it was still like that.",
    ],
    count: 6,
    gated: true,
    cover: "/gallery/farmhouse-kitchen/cover.jpg",
    feelings: ["desire", "trust"],
    place: "farmhouse",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-kitchen-kiss",
    journalEntryId: "the-kitchen",
    stills: [
      { caption: "Tuesday. Nothing happening. On the record anyway." },
      {},
      {},
      {
        journal: {
          entryId: "the-kitchen",
          excerpt:
            "He came in from the field with dirt on him and stood in the doorway not saying anything, and I kept cutting.",
        },
      },
      {},
      {
        caption:
          "He still comes across a room like he's asking and has already been answered.",
      },
    ],
    access: "premium",
    mature: false,
  },

  /* --------------------------------------------------- josh & luna dinner (free) */
  {
    id: "josh-luna-dinner",
    title: "Dinner",
    subtitle: "Josh & Luna",
    description: [
      "Neutral ground was the coffee shop. This is after — dinner that same night, the one she meant to say no to and didn't.",
      "The long table where they used to eat. For one evening he's the original: making her laugh the ugly laugh she can't stop, getting closer than he needs to be, nothing you could point at, everything deliberate.",
    ],
    count: 14,
    gated: false,
    cover: "/gallery/josh-luna-dinner/cover.jpg",
    feelings: ["trust", "desire"],
    place: "farmhouse",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-dinner-house",
    journalEntryId: "the-long-table",
    access: "free",
    mature: false,
  },
];

/** All gitignored optimized copies a build step needs to know about. */
export const gatedGalleries = galleries.filter((g) => g.gated);

export function getGallery(id: string): StillGallery | undefined {
  return galleries.find((g) => g.id === id);
}

/** The still gallery drawn from a given scene, if one exists. */
export function galleryForScene(slug: string): StillGallery | undefined {
  return galleries.find((g) => g.sceneSlug === slug);
}

/**
 * The URL for one still. Free sets are static /public files; gated sets go
 * through the entitlement-checked /api/still route, which never hands back a
 * durable URL. `n` is 1-based (01..count).
 */
export function stillSrc(
  gallery: StillGallery,
  n: number,
  size: "thumb" | "full",
): string {
  if (!gallery.gated) {
    return `/gallery/${gallery.id}/${String(n).padStart(2, "0")}.jpg`;
  }
  return `/api/still/${gallery.id}/${n}${size === "thumb" ? "?size=thumb" : ""}`;
}

/** Every still's src, in display order — what the wall renders. */
export function galleryImages(
  gallery: StillGallery,
  size: "thumb" | "full",
): string[] {
  return Array.from({ length: gallery.count }, (_, i) =>
    stillSrc(gallery, i + 1, size),
  );
}

/** Per-still context for still `n` (1-based), if any. */
export function stillMeta(gallery: StillGallery, n: number): Still | undefined {
  return gallery.stills?.[n - 1];
}
