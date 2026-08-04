/**
 * Video library — the structured source of truth for browsable/watchable scenes.
 *
 * This is content DATA, deliberately separate from presentation and access logic
 * (per CLAUDE.md engineering rules). The UI reads from here; it never hard-codes
 * titles, files, or access levels inline.
 *
 * NOTE: titles and descriptions below are PLACEHOLDER copy derived from filenames.
 * Melissa owns the real canon — replace `title`/`synopsis` with approved wording.
 * The `slug`, `file`, and `access` fields are load-bearing and should stay stable.
 */

import type { ContentNoteId } from "@/lib/content/content-notes";
import type { FeelingId, PersonId, PlaceId } from "@/lib/content/taxonomy";

export type AccessLevel = "free" | "premium";

/**
 * The members-only edit of a scene that also has a public one. See
 * `Video.premium`.
 */
export interface PremiumCut {
  /** Basename of the proxy inside `stories/`. Never sent to a non-member. */
  file: string;
  /** Runtime of THIS cut — differs from the public one, that being the point. */
  durationSeconds: number;
  /**
   * What members actually get, WHEN IT IS NOT SIMPLY MORE MINUTES. A short
   * noun phrase, completing "Members watch …".
   *
   * The default pitch compares the two runtimes, which works when the cuts are
   * 0:15 and 2:53. It falls apart when they are 2:41 and 2:39: "a longer cut —
   * 2:41 against 2:39" prices a differently-edited scene at two seconds and
   * makes the membership look like a swindle. That is not honest just because
   * the arithmetic is right — the difference is real, it is simply not
   * duration, so the copy has to be able to name it.
   *
   * Set this whenever runtime is not the story. Leave it off and the runtime
   * comparison is used, which is correct for a teaser.
   */
  difference?: string;
  /**
   * Graphic rather than merely intimate. `mature` reads as "there is sex in
   * this"; `explicit` says it is shown. Surfaced as "Explicit · 18+" in place
   * of "Mature" (components/ui/RatingBadge.tsx), stated before anything plays,
   * and never carried by a public poster or a hero loop.
   */
  explicit?: boolean;
  /** Notes that apply to this cut only. See lib/content/content-notes.ts. */
  notes?: ContentNoteId[];
}

export interface Video {
  /** Stable identifier — used in URLs and to locate the media file. Do not rename casually. */
  slug: string;
  /** Display title. PLACEHOLDER — pending approved copy. */
  title: string;
  /** Short public-facing description. PLACEHOLDER. */
  synopsis: string;
  /** Basename of the media file inside `stories/` (proxy used for playback). */
  file: string;
  /** Poster image served from /public. */
  poster: string;
  /** Runtime in whole seconds (from ffprobe on the master). */
  durationSeconds: number;
  /** Whether this scene is publicly viewable or requires membership. */
  access: AccessLevel;
  /** Mature-content flag — surfaced as a label per content rules. */
  mature: boolean;
  /**
   * A fuller cut of the SAME scene, streamed to members in place of `file`.
   *
   * This is one scene with two edits, not two scenes: one slug, one card, one
   * page. A signed-out visitor gets `file` and is told a longer cut exists; a
   * member gets this one. The swap is made server-side in the stream route
   * after the tier check — the client is never handed both filenames, so the
   * members' cut cannot be reached by editing a URL.
   *
   * `poster` always belongs to the PUBLIC cut. Posters live in /public at a
   * permanent, unguessable-but-ungated URL, so a frame from an explicit
   * variant must never become one. Same reasoning as clips.ts.
   */
  premium?: PremiumCut;
  /**
   * What's in it beyond nudity. `mature` reads as sex to a viewer, so violence
   * and coercive control get their own notes, shown above the player before
   * anything plays. See lib/content/content-notes.ts.
   */
  notes?: ContentNoteId[];
  /**
   * Watchable but not part of the story catalog — the cast interview is the
   * hero, not a scene to browse under a feeling. Streaming and /watch still
   * work; lib/content/catalog.ts just leaves it off the shelves.
   */
  hidden?: boolean;
  /**
   * Emotional context — how this scene is browsed in the catalog. A scene can
   * carry more than one. PLACEHOLDER tagging pending Melissa's canon pass.
   */
  feelings: FeelingId[];
  /** Where in the world it happens. */
  place: PlaceId;
  /**
   * Who is in it. The third browse axis, shared with clips, galleries and the
   * journal — and what lib/content/characters.ts gathers a person's work by.
   */
  about: PersonId[];
}

export const videos: Video[] = [
  {
    // The cast interview — the pinned hero, playable in full from the home
    // page. Hidden from the browse catalog (it isn't a story scene); /watch and
    // streaming still work. See lib/content/hero.ts.
    slug: "interview",
    title: "The Interview",
    synopsis:
      "The cast sit down together — the world, the characters, and what it took to make it.",
    file: "interview.proxy.mp4",
    poster: "/posters/interview.jpg",
    durationSeconds: 363,
    access: "free",
    mature: false,
    hidden: true,
    feelings: [],
    place: "farmhouse",
    about: ["luna", "tyson", "josh"],
  },
  {
    slug: "luna-josh-first-morning",
    title: "First Morning",
    synopsis:
      "A quiet farmhouse morning between Luna and Josh — the calm before everything shifts.",
    file: "luna-josh-first-morning.proxy.mp4",
    poster: "/posters/luna-josh-first-morning.jpg",
    durationSeconds: 143,
    access: "free",
    mature: false,
    feelings: ["trust", "desire"],
    place: "farmhouse",
    about: ["luna", "josh"],
  },
  {
    slug: "tyson-luna-lakehouse-fire",
    title: "Fireside",
    synopsis:
      "Late at the lakehouse firepit, Luna and Tyson circle the things they haven't said.",
    file: "tyson-luna-lakehouse-fire.proxy.mp4",
    poster: "/posters/tyson-luna-lakehouse-fire.jpg",
    durationSeconds: 281,
    access: "premium",
    mature: true,
    feelings: ["desire", "distance"],
    place: "lakehouse",
    about: ["luna", "tyson"],
  },
  {
    slug: "tyson-park-fight",
    title: "The Park",
    synopsis:
      "Luna asks Tyson to meet her. He comes, and then says almost nothing at all — until he says one thing.",
    file: "tyson-park-fight.proxy.mp4",
    poster: "/posters/tyson-park-fight.jpg",
    durationSeconds: 155,
    access: "premium",
    mature: true,
    feelings: ["hurt", "lies"],
    place: "park",
    about: ["luna", "tyson"],
  },

  /* --------------------------------------------------------------------------
   * Scenes imported from the per-scene shooting folders under stories/.
   * Which assembled cut each one came from is recorded in
   * scripts/import-cuts.sh — including the folders deliberately skipped.
   *
   * All eight are `access: "free"` and `mature: true` by decision, pending a
   * canon pass. Titles, synopses and feeling tags are PLACEHOLDER: they were
   * written from the folder names and a look at the footage, not from story
   * canon, so treat every line below as a first draft.
   * ----------------------------------------------------------------------- */

  {
    slug: "luna-tyson-bar",
    title: "Last Call",
    synopsis:
      "Luna and Tyson at the bar, close enough to be overheard and talking anyway.",
    file: "luna-tyson-bar.proxy.mp4",
    poster: "/posters/luna-tyson-bar.jpg",
    durationSeconds: 71,
    access: "premium",
    mature: true,
    feelings: ["desire", "distance"],
    place: "bar",
    about: ["luna", "tyson"],
  },
  {
    slug: "josh-tyson-barn",
    title: "The Barn",
    synopsis:
      "Josh and Tyson at the tractor before the day starts. Two men who work well together, and everything neither of them is saying.",
    file: "josh-tyson-barn.proxy.mp4",
    poster: "/posters/josh-tyson-barn.jpg",
    durationSeconds: 68,
    access: "free",
    mature: false,
    feelings: ["distance"],
    place: "farmhouse",
    about: ["josh", "tyson"],
  },
  {
    slug: "luna-tyson-bathroom",
    title: "Groceries",
    synopsis:
      "Tyson lets himself in with shopping she didn't ask for. She's on her phone, and she doesn't put it down.",
    file: "luna-tyson-bathroom.proxy.mp4",
    poster: "/posters/luna-tyson-bathroom.jpg",
    durationSeconds: 76,
    access: "premium",
    mature: true,
    feelings: ["desire", "lies"],
    place: "lakehouse",
    about: ["luna", "tyson"],
  },
  {
    slug: "luna-josh-coffee",
    title: "Coffee",
    synopsis:
      "Six months of silence, and then a phone call. Neutral ground, chosen for exactly that reason.",
    file: "luna-josh-coffee.proxy.mp4",
    poster: "/posters/luna-josh-coffee.jpg",
    durationSeconds: 129,
    access: "free",
    mature: false,
    feelings: ["trust", "desire"],
    place: "coffee-shop",
    about: ["luna", "josh"],
  },
  {
    slug: "luna-josh-bed",
    title: "Sunday",
    synopsis:
      "A morning that neither of them is in any hurry to end.",
    file: "luna-josh-bed.proxy.mp4",
    poster: "/posters/luna-josh-bed.jpg",
    durationSeconds: 86,
    access: "premium",
    mature: true,
    feelings: ["desire", "trust"],
    place: "farmhouse",
    about: ["luna", "josh"],
  },
  {
    slug: "luna-josh-kitchen-kiss",
    title: "The Kitchen",
    synopsis:
      "Something ordinary in the farmhouse kitchen turns into something else.",
    file: "luna-josh-kitchen-kiss.proxy.mp4",
    poster: "/posters/luna-josh-kitchen-kiss.jpg",
    // Scored cut, swapped in 2026-07-29. The previous file's audio sat at
    // -51dB mean — the dialogue was in it but inaudible on a phone. This one
    // carries a song instead, at -16.7dB.
    durationSeconds: 154,
    access: "premium",
    mature: true,
    feelings: ["desire", "trust"],
    place: "farmhouse",
    about: ["luna", "josh"],
  },
  {
    slug: "luna-josh-dinner-house",
    title: "The Long Table",
    synopsis:
      "Dinner at the house, and the conversation neither of them starts.",
    file: "luna-josh-dinner-house.proxy.mp4",
    poster: "/posters/luna-josh-dinner-house.jpg",
    durationSeconds: 115,
    access: "premium",
    mature: true,
    feelings: ["trust", "distance"],
    place: "farmhouse",
    about: ["luna", "josh"],
  },
  {
    slug: "luna-josh-house",
    title: "The House",
    synopsis:
      "Dinner out, the drive back, and everything that surfaces once the door is closed.",
    file: "luna-josh-house.proxy.mp4",
    poster: "/posters/luna-josh-house.jpg",
    durationSeconds: 263,
    access: "premium",
    mature: true,
    feelings: ["trust", "distance"],
    place: "farmhouse",
    about: ["luna", "josh"],
  },
  {
    // Josh and his father. Free on purpose: it explains Josh rather than
    // advancing him, so it costs no turn to give away and it is the fastest
    // way to make a visitor understand why he is the way he is.
    slug: "josh-rick-study",
    title: "The Study",
    synopsis:
      "Two men sitting in a room. Only one of them gets up, and only for the last thing he says — which is about Luna.",
    file: "josh-rick-study.proxy.mp4",
    poster: "/posters/josh-rick-study.jpg",
    durationSeconds: 57,
    access: "free",
    mature: false,
    feelings: ["distance", "hurt"],
    place: "the-study",
    about: ["josh", "rick"],
  },
  {
    // Free, and the most useful free thing on the site for Josh. Everything
    // else public about him is charm; this is him being good at something that
    // costs him patience. A visitor has to like him here or his turn later
    // reads as a different man. What it cost her to be pushed through it is in
    // the journal, behind the LunaVerse — watch it free, read what she thought for
    // eight dollars.
    slug: "josh-luna-bolt",
    title: "The Bolt",
    synopsis:
      "A seized bolt on the tractor, and Luna ready to quit. Josh doesn't take the wrench off her — he tells her to give it one more.",
    file: "josh-luna-bolt.proxy.mp4",
    poster: "/posters/josh-luna-bolt.jpg",
    // Scored cut. The dialogue is identical to the unscored master —
    // "easy, don't force it, don't fight it… just give it one more" — so this
    // is the same scene with Melissa's music under it, not a different edit.
    durationSeconds: 57,
    access: "free",
    mature: false,
    feelings: ["trust", "desire"],
    place: "farmhouse",
    // Tyson is in it, in the doorway, for a few seconds and no lines.
    about: ["luna", "josh", "tyson"],
  },
  {
    // The beach, in full — 4m44s, and members-only. The free 9:16 preview of it
    // is a clip (lib/content/clips.ts, "beach-preview"), which is the shop
    // window for this one.
    //
    // NOTE: Melissa also delivered luna-josh-beach-sound.mov, the same cut with
    // a commercially released song mixed in. That file is deliberately NOT the
    // source here — see the licensing note in the commit and in clips.ts.
    slug: "luna-josh-beach",
    title: "The Beach",
    synopsis:
      "Mexico, five years in. A whole evening on the sand and in the water — the week that reminded her why.",
    file: "luna-josh-beach.proxy.mp4",
    poster: "/posters/luna-josh-beach.jpg",
    durationSeconds: 284,
    access: "premium",
    mature: true,
    feelings: ["desire", "trust"],
    place: "mexico",
    about: ["luna", "josh"],
  },
  {
    // The whole night, free — Melissa's call, 2026-07-31. It was briefly a 30s
    // teaser with the full cut behind the membership (Video.premium); she
    // decided the scene should be open instead. The teaser still exists at
    // stories/luna-tyson-dance-teaser.mp4 and is what went to Instagram; it is
    // just no longer what the site serves.
    //
    // This file is the SCORED cut, which carries commercially released
    // recordings whose rights are not cleared. Melissa has said she is handling
    // that. Noting it here because the scene is now public rather than behind a
    // login, so it is a known state, not an oversight.
    //
    // TO REVERT to a licence-clean cut: re-encode from
    // luna-tyson-dance/luna-tyson-dance.mp4 (1920x1080, dialogue only) with
    //   scripts/optimize-media.sh proxy-only luna-tyson-dance-full <that file>
    // and set durationSeconds to 232.
    slug: "luna-tyson-dance",
    title: "Something to Talk About",
    synopsis:
      "A month after he moved out, Tyson takes her somewhere loud. She makes him dance. For most of the night it works.",
    file: "luna-tyson-dance-full.proxy.mp4",
    poster: "/posters/luna-tyson-dance.jpg",
    durationSeconds: 239,
    access: "free",
    mature: false,
    feelings: ["trust", "desire", "distance"],
    place: "bar",
    about: ["luna", "tyson"],
  },
  {
    slug: "luna-bathtub",
    title: "Still Water",
    synopsis:
      "Luna alone, at the end of a day she hasn't told anyone about.",
    file: "luna-bathtub.proxy.mp4",
    poster: "/posters/luna-bathtub.jpg",
    durationSeconds: 287,
    access: "premium",
    mature: true,
    feelings: ["grief", "desire"],
    place: "farmhouse",
    about: ["luna"],
  },
  {
    // One scene, two edits — the same night, cut twice. The public one is the
    // DIALOGUE cut; members get the SCORED one in its place.
    //
    // TWO THINGS MELISSA SHOULD KNOW, both her call, neither a blocker:
    //
    //   1. LICENSING. The members' cut carries a commercially released
    //      recording, on a paid site, with no sync licence on file. Same
    //      situation as luna-tyson-dance, where she has said she is handling
    //      it. Noting it here so it stays a known state rather than becoming
    //      a surprise. To pull it, delete the `premium` block: the scene
    //      keeps working and everyone gets the dialogue cut.
    //   2. RESOLUTION. The scored cut is 1320x780; the dialogue cut is
    //      1920x1080. So the members' version is the SMALLER one, which is
    //      backwards from every other premium cut here — a paid edit should
    //      not be the lower-resolution edit. Worth a re-export at 1080 if the
    //      source allows it.
    //
    // The turn is Tyson, not Josh. Josh clocks him across the field and asks
    // whether Luna knew he would be here; the rest of the scene is Luna
    // trying to get a straight answer out of a man who has not picked up the
    // phone in a week. The synopsis stops short of what he actually says.
    slug: "luna-josh-fair",
    title: "Not Here",
    synopsis:
      "Week two of trying again, and Josh takes her to the fall fair. Tyson is there too — and he hasn't answered her calls in a week.",
    file: "luna-josh-fair.proxy.mp4",
    poster: "/posters/luna-josh-fair.jpg",
    durationSeconds: 159,
    access: "free",
    mature: false,
    premium: {
      file: "luna-josh-fair-music.proxy.mp4",
      durationSeconds: 161,
      // Two seconds longer, so the runtime pitch would be insulting. What is
      // actually on offer is the score.
      difference: "the scored cut — the same night, with the music it was edited to",
    },
    feelings: ["distance", "lies"],
    place: "fair",
    about: ["luna", "josh", "tyson"],
  },
  // "Breathe" (luna-truck-breakdown) was PULLED 2026-08-03, pending the recut
  // master. Melissa is replacing the source with a longer cut, so the fifteen-
  // second preview has to be reassembled against new picture and both proxies
  // re-encoded — and until that happens there is nothing behind this scene in
  // Blob. It shipped for a few hours with a card that 404'd on play, which is
  // why it is out rather than merely unlisted: `hidden` would have taken it
  // off the shelves and left /watch/luna-truck-breakdown just as broken.
  //
  // Same treatment as ty-luna-lake-fight above, for the same reason.
  //
  // TO RESTORE, once stories/luna-truck-breakdown/luna-truck-breakdown.mp4 is
  // the new master:
  //   scripts/make-preview-cut.sh luna-truck-breakdown      (repick the beats)
  //   scripts/optimize-media.sh import luna-truck-breakdown \
  //     stories/luna-truck-breakdown/luna-truck-breakdown-preview.mp4 2
  //   scripts/optimize-media.sh proxy-only luna-truck-breakdown-full \
  //     stories/luna-truck-breakdown/luna-truck-breakdown.mp4
  //   node --env-file=.env.local scripts/upload-media.mjs luna-truck-breakdown
  // then bring the entry back:  git show c060262 -- lib/content/videos.ts
  //
  // Her journal entry "the-drive" and the canon STAY. The entry keeps its
  // sceneSlug and simply stops rendering a scene link — getVideo returns
  // undefined and every surface already handles that.
  {
    // One scene, two edits. The public cut is the morning; members get the
    // longer, explicit one in its place — see `premium` and the note on the
    // field. PLACEHOLDER title and synopsis, pending Melissa's copy.
    slug: "ty-luna-bed",
    title: "The Morning",
    synopsis:
      "Twenty years of not saying it, and then a room with the light coming up in it.",
    file: "ty-luna-bed.proxy.mp4",
    poster: "/posters/ty-luna-bed.jpg",
    durationSeconds: 227,
    access: "premium",
    mature: true,
    premium: {
      file: "ty-luna-bed-explicit.proxy.mp4",
      durationSeconds: 354,
      explicit: true,
    },
    feelings: ["desire", "trust"],
    place: "lakehouse",
    about: ["luna", "tyson"],
  },
  // "Out at the Lake" (ty-luna-lake-fight) was pulled 2026-07-27 to be recut.
  // Its stills and poster are still on disk; re-add the entry here when the
  // new cut lands, then restore the world object and hero slug that went with
  // it (lib/content/world.ts "the-shore", lib/content/hero.ts).
  {
    // PLACEHOLDER placement: a road on the farm, filed under the farmhouse
    // because the property is the location. Give it its own place if the road
    // matters to the story.
    slug: "ty-luna-farm-road",
    title: "The Road Back",
    synopsis:
      "Tyson and Luna on the farm road, walking off something neither will name.",
    file: "ty-luna-farm-road.proxy.mp4",
    poster: "/posters/ty-luna-farm-road.jpg",
    durationSeconds: 128,
    access: "premium",
    mature: true,
    feelings: ["distance", "hurt"],
    place: "farmhouse",
    about: ["luna", "tyson"],
  },
];

export function getVideo(slug: string): Video | undefined {
  return videos.find((v) => v.slug === slug);
}

/** Format seconds as m:ss for display. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
