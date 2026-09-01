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
  /**
   * How many of a GATED gallery's stills are open to everybody — the first N,
   * in order. They are written to public/gallery/<id>/ alongside the private
   * copies and served from there, so a visitor sees real frames rather than a
   * locked wall, and the count of what they are missing is stated honestly.
   *
   * Only meaningful when `gated` is true. Keep it small: it is a shop window,
   * not the set.
   */
  freePreviewCount?: number;
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
  /* ------------------------------------------------------ the night she left */
  {
    id: "luna-josh-break",
    title: "Six Months",
    subtitle: "The night she left",
    description: [
      "Sixty-nine frames from the night Luna finally goes. She packs two bags meaning to drive to the lakehouse, and she calls Tyson before she does it — she already knows Josh will try to stop her.",
      "Most of what is here is the lakehouse, and that is the ache of it. The lakehouse has never held a bad memory for her. It is her family's: her mother and father, summers, a house that was always loud and always full and always laughing. Tyson has been in it for twenty years. Josh has been in it since she was twenty-eight. She is arriving now for the first time because something went wrong, and every warm room she walks through is one she is remembering rather than living in.",
    ],
    count: 69,
    gated: true,
    // Two open frames, the house rule for a gated set. They are the shop
    // window and the only images here that sit at a public URL.
    freePreviewCount: 2,
    cover: "/gallery/luna-josh-break/cover.jpg",
    feelings: ["hurt", "distance"],
    // The lakehouse, not the farmhouse — the scene STARTS at the farmhouse but
    // the overwhelming majority of these frames are the lake, which is where
    // somebody browsing by place would expect to find them.
    place: "lakehouse",
    about: ["luna", "josh", "tyson"],
    sceneSlug: "luna-josh-break",
    journalEntryId: "the-night-i-left",
    // `stills` is deliberately omitted for now: it carries per-frame captions
    // and journal pull-quotes, and inventing sixty-nine of those would be
    // writing over the top of Melissa's own material. The wall works without
    // it; captions can be added a frame at a time.
    access: "premium",
    mature: true,
    // Same call as the scene: he blocks her leaving and tries to get her out
    // of the car. Controlling, not violent.
    notes: ["control"],
  },
  /* ------------------------------------------------ the morning after that */
  {
    /*
      THE MORNING AFTER the set above — she wakes at the lakehouse for the
      first time without him. Eight frames, and they are ordered as the scene
      is: two in the present, five in the memory, and one of her alone at the
      end of it.

      ORDER IS CURATED, NOT CHRONOLOGICAL. The sources are macOS screenshots
      and their timestamps run 11:09pm to 1:23am in the order Melissa made
      them, which is not the order they read in. They were renamed 01–08 while
      staging into stills-src/ so the wall tells the story rather than the
      production. The one that matters most is 08: it is the LAST frame here
      and the second-to-last one made — her sitting up alone in the bed after
      he has gone, which is the sentence the whole set is built around.

      Every `journal` excerpt below is verbatim from `asking-for-less`, which
      is Melissa's own writing. Nothing here is captioned in an invented voice.

      GATED, with the house's two open frames — and worth knowing that this is
      the only gated gallery attached to a FREE scene. Everything in these
      images can be watched by anybody, in motion, for nothing. What is behind
      the wall is not the moment but the frames: 3220px stills against a 720p
      stream. Defensible, and stated here so nobody has to reverse-engineer
      whether it was deliberate. Flip `gated` and `access` if it reads wrong.

      The two open ones are 01 and 02 — both the present tense, her alone.
      Josh appears for the first time at 03, behind the wall, which is also
      how the scene is built.
    */
    id: "five-more-minutes",
    title: "Five More Minutes",
    subtitle: "The first morning without him",
    description: [
      "Eight frames from Luna's first morning at the lakehouse alone. She wakes, and the other side of the bed is the first thing she notices.",
      "What follows is not where she is. It is the farmhouse, and the mornings she used to spend trying to keep Josh in bed a little longer — nothing important, nothing either of them needed to be anywhere for. He would kiss her back like he wanted the same thing. The set ends where those mornings always ended, which is the point she is only now able to see.",
    ],
    count: 8,
    gated: true,
    freePreviewCount: 2,
    cover: "/gallery/five-more-minutes/cover.jpg",
    feelings: ["distance", "grief"],
    // The lakehouse, where she wakes up. The middle five frames are the
    // farmhouse, but a set is filed where it happens, not where it remembers —
    // same call as the scene.
    place: "lakehouse",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-bed-flashback",
    journalEntryId: "asking-for-less",
    stills: [
      {
        journal: {
          entryId: "asking-for-less",
          excerpt:
            "I used to think missing someone meant they had to be gone.",
        },
      },
      {},
      {
        journal: {
          entryId: "asking-for-less",
          excerpt:
            "I remember mornings when I would try to keep him in bed. Nothing important. I just wanted him close. Five more minutes. A few kisses.",
        },
      },
      {},
      {},
      {},
      {
        journal: {
          entryId: "asking-for-less",
          excerpt: "He'd kiss me back like he wanted the same thing.",
        },
      },
      {
        journal: {
          entryId: "asking-for-less",
          excerpt: "And then he'd leave anyway.",
        },
      },
    ],
    access: "premium",
    mature: true,
  },
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

  /* ------------------------------------------------------------ gingerale */
  {
    // The stills from the funny one. Ordered by capture time, not filename —
    // the screenshots are named "… at 11.21 AM" and "… at 12.18 PM", which
    // sort backwards alphabetically and would have run the morning in reverse.
    //
    // GATED, even though the SCENE is free. Those are different products: the
    // forty-seven seconds are the thing that travels and the stills are part
    // of what a membership is. Two are open, which is the newer pattern, and
    // this direction is the safe one — a gated set can be opened later, and
    // "what is free today stays free" means the reverse is not true.
    id: "gingerale",
    title: "Ginger Ale",
    subtitle: "Luna & Tyson",
    description: [
      "The morning after, in her kitchen, over a can of Canada Dry — twenty years of friendship doing the only thing it does easily.",
      "It is the lightest set here, and it is the one that explains why the rest of it costs her so much.",
    ],
    count: 11,
    gated: true,
    freePreviewCount: 2,
    cover: "/gallery/gingerale/cover.jpg",
    feelings: ["trust", "desire"],
    place: "lakehouse",
    about: ["luna", "tyson"],
    sceneSlug: "luna-tyson-gingerale",
    access: "premium",
    mature: false,
  },

  /* ------------------------------------------------- the afternoon he went */
  {
    // The same island as `gingerale`, and the opposite weather. That set is
    // the friendship doing the one thing it does easily; this is the first
    // afternoon it costs her something to be in the room.
    //
    // ORDERED BY THE SCENE, NOT BY CAPTURE TIME — which is a departure from
    // casey-bar, and deliberate. These are thirteen frames spread over two and
    // a half hours of Melissa working, so capture order is the order she made
    // them in rather than the order they happen in, and it opens on a close-up
    // of him and ends in the middle. Run as the scene runs, it reads: she is
    // writing, he comes through, they talk, she goes back to the book.
    //
    // ONE FRAME PULLED as an exact duplicate — the 9.17 and 9.37 screenshots
    // are the same frame captured twice (SSIM 1.000). Count is 13, not 14.
    //
    // STILL 01 IS THE COVER AND IT IS THE BEST IMAGE HERE: her alone at the
    // island with the book open and the lake in the whole of the window. It is
    // also the opening shot of the 0:50 assembly that got replaced, so the set
    // is the only place that frame survives.
    //
    // NOT the same image as the scene's poster, on purpose. The poster is the
    // wide with both of them in it, because a scene card has to say who is in
    // it; a gallery card can afford to be the quieter one.
    id: "wasnt-planning-on-it",
    title: "Wasn't Planning On It",
    subtitle: "Luna & Tyson",
    description: [
      "Thirteen frames from an afternoon at the lakehouse. Luna is writing at the island. Tyson comes through with his keys and says he is going to head out for a bit, and she asks him where — which in twenty years she has never once done.",
      "Nothing in it is a fight. He answers every question with a question, she says one true thing she would like back, and then she goes on writing without looking up. The set is mostly her face doing arithmetic she has not admitted she is doing.",
    ],
    count: 13,
    gated: true,
    freePreviewCount: 2,
    cover: "/gallery/wasnt-planning-on-it/cover.jpg",
    feelings: ["desire", "distance"],
    place: "lakehouse",
    about: ["luna", "tyson"],
    sceneSlug: "luna-ty-wasntplanningonit",
    journalEntryId: "who-is-she",
    stills: [
      {
        journal: {
          entryId: "who-is-she",
          excerpt:
            "He has said that to me a hundred times in twenty years and I have never once asked him where.",
        },
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        journal: {
          entryId: "who-is-she",
          excerpt:
            "He didn't answer it. He asked me who said there was a she, which is not a no.",
        },
      },
      {},
      {},
      {
        journal: {
          entryId: "who-is-she",
          excerpt:
            "I said it without looking up, and I have been sitting here since with the pen in my hand not writing anything.",
        },
      },
    ],
    access: "premium",
    mature: false,
  },

  /* --------------------------------------------------------------- casey's */
  {
    // The same bar as `the-bar`, a different night and a third person in it.
    // Kept as its own set rather than folded into that one: the-bar is the two
    // of them alone saying things sideways, and this is what that looks like
    // when somebody else is standing there.
    //
    // ORDERED BY CAPTURE TIME, not filename — the source screenshots are named
    // "… at 4.13.41 PM" and "… at 11.40.47 PM", which sort backwards
    // alphabetically and would have run the night in reverse.
    //
    // No captions yet. The ones on the-bar are Melissa's voice and the wrong
    // thing to invent — the set reads fine without them and they can be added
    // per still whenever she wants.
    //
    // SIX STILLS PULLED, 2026-08-27, and the count went 31 -> 25. Six frames
    // showed a LONG-HAIRED woman standing in for Casey. Casey has short hair —
    // the undercut, the tank top, the tattoos — so those six were a wrong
    // render rather than a character, and Melissa's instruction is that the
    // long-haired woman appears nowhere on the site.
    //
    // Old numbers 02, 05, 07, 08, 13, 14. The clearest of them is old 14, the
    // two women side by side at the bar, which is what settles that they are
    // not the same person. The frames are kept, not deleted, in
    // stills-src/_pulled/casey-bar-long-hair/ with a note.
    //
    // THE SET RENUMBERED. Everything after a pulled frame shifted down, so the
    // free previews and the cover are different images than they were, and the
    // remote copies had to be overwritten rather than size-skipped.
    id: "casey-bar",
    title: "Your Date",
    subtitle: "Luna, Tyson & Casey",
    description: [
      "The same bar, and the first night Luna has walked into it and found somebody else already standing where she stands.",
      "Casey is a friend from the track. That is the whole of what anybody says out loud, and Luna spends the night deciding whether to believe it — which is not really a question about Casey.",
    ],
    count: 25,
    gated: true,
    freePreviewCount: 2,
    cover: "/gallery/casey-bar/cover.jpg",
    feelings: ["hurt", "distance"],
    place: "bar",
    about: ["luna", "tyson", "casey"],
    sceneSlug: "luna-tyson-casey-bar",
    access: "premium",
    mature: true,
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

  /* ---------------------------------------------------------------- Mexico */
  {
    // Seven days, and the warmest material in the story — see
    // LUNA_VALE_CONTEXT.md.
    //
    // NOT A FLASHBACK any more (Melissa, 2026-08-17). This used to be five
    // years into the ten, and the description said Luna was "trying to get
    // back to" this week — which was true when the trip predated the breakup
    // and is now backwards. She is already back with him when the plane lands.
    // The week is not what she is reaching for; it is what she got, and what
    // everything after it gets measured against.
    //
    // Gated, but with the first two stills open. That is the shop window
    // Melissa asked for: roughly 10% of the set, real frames rather than a
    // locked wall, and the page states plainly how many more there are.
    id: "josh-luna-beach",
    title: "Mexico",
    subtitle: "Luna & Josh, seven days",
    description: [
      "He booked it himself and told her on a Tuesday like it was nothing. Seven days, weeks after she took him back, and whatever they had been carrying they put down at the airport and neither of them went back for it.",
      "This is the best week of her life and she knows it while it is happening. It is the proof that the man he becomes is not the only man he is — which is exactly what makes everything after it cost so much.",
    ],
    count: 15,
    gated: true,
    freePreviewCount: 2,
    cover: "/gallery/josh-luna-beach/cover.jpg",
    feelings: ["trust", "desire"],
    place: "mexico",
    about: ["luna", "josh"],
    sceneSlug: "luna-josh-beach",
    clipId: "beach-preview",
    journalEntryId: "mexico-the-last-night",
    stills: [
      { caption: "The walk down, on the first evening." },
      {},
      {},
      {
        journal: {
          entryId: "mexico-the-last-night",
          excerpt:
            "He put his phone in the safe on the first morning and never mentioned it once.",
        },
      },
      {},
      {},
      {},
      {
        journal: {
          entryId: "mexico-the-last-night",
          excerpt:
            "And he looked at me. That is all it is, in the end. He looked at me and he waited for the ends of my sentences.",
        },
      },
      {},
      {},
      {},
      { caption: "They stayed in the water until the light went." },
      {},
      {},
      {
        journal: {
          entryId: "mexico-the-last-night",
          excerpt: "I want to remember it exactly. In case I need it.",
        },
      },
    ],
    access: "premium",
    mature: true,
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
      "Six miles at the far end of the lake, headphones in, nobody to talk to and nobody to be all right for. Her favorite hour of the week and the only one in the story she does not spend managing somebody else.",
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

  /* -------------------------------------------------------- the phone call */
  {
    // Frames from "Long Distance". The scene itself is free — this is the
    // model working as intended: the scene brings people in, the stills are
    // one of the things they get for paying.
    //
    // ORDER IS DELIBERATE and not the order the frames were captured in.
    // 01 is Cathy and 02 is Luna picking up, so the two open previews are one
    // of each — a visitor sees both ends of the call and neither of them
    // alone. The set then runs the conversation and finishes on the wide from
    // behind, which is where she stops taking part.
    //
    // Cover is Cathy rather than still 01 by coincidence: she is new, and it
    // keeps the gallery card from being the same frame as the scene's poster.
    id: "the-phone-call",
    title: "The Phone Call",
    subtitle: "Luna and her mother",
    description: [
      "A week after she moved out, and nine days of watching her mother's name come up and putting the phone face down. This is the one she finally answers.",
      "Two rooms two thousand miles apart, and the distance is in the frames before either of them says anything about it: Cathy surrounded by photographs of all of them, Luna with an entire lake behind her and nobody in the house.",
    ],
    count: 8,
    gated: true,
    freePreviewCount: 2,
    cover: "/gallery/the-phone-call/cover.jpg",
    feelings: ["grief", "distance"],
    place: "lakehouse",
    about: ["luna", "cathy", "josh"],
    sceneSlug: "luna-cathy-phone",
    journalEntryId: "my-mother-called",
    stills: [
      { caption: "Atlanta. A lamp on, and a shelf of photographs of everybody she can't reach." },
      { caption: "Nine days of letting it ring." },
      {},
      {},
      {
        caption: "She has known him ten years and never once from inside the room.",
        journal: {
          entryId: "my-mother-called",
          excerpt:
            "She isn't wrong about what she heard. He does sound like that. He is hurting. Both of those are true and neither of them is the thing.",
        },
      },
      {},
      {},
      { caption: "Thirty seconds of her mother talking, and she is already at the glass." },
    ],
    access: "premium",
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
    // Linked 2026-08-19, when the room finally got a scene. These four stills
    // predate it by two weeks and still 04's caption — "she turns up and he
    // keeps working" — turns out to describe the scene's opening exactly.
    sceneSlug: "ty-luna-garage",
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
  // A free set, or one of a gated set's open preview stills, comes straight
  // from /public. Everything else goes through the entitlement check.
  if (!gallery.gated || n <= (gallery.freePreviewCount ?? 0)) {
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
