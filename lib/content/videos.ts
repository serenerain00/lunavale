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
    access: "free",
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
    access: "free",
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
    access: "free",
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
    durationSeconds: 150,
    access: "free",
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
    access: "free",
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
    access: "free",
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
    // the journal, behind the Vault — watch it free, read what she thought for
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
    slug: "luna-bathtub",
    title: "Still Water",
    synopsis:
      "Luna alone, at the end of a day she hasn't told anyone about.",
    file: "luna-bathtub.proxy.mp4",
    poster: "/posters/luna-bathtub.jpg",
    durationSeconds: 287,
    access: "free",
    mature: true,
    feelings: ["grief", "desire"],
    place: "farmhouse",
    about: ["luna"],
  },
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
    access: "free",
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
    access: "free",
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
