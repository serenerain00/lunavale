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
  /**
   * The day this scene went up, ISO `YYYY-MM-DD`. Drives the "New" section on
   * the home page — see `latestScene()`.
   *
   * Only set on scenes released since the field existed. An undated scene is
   * treated as older than every dated one, which is true and means nothing had
   * to be back-filled by guesswork.
   */
  addedOn?: string;
  /** Whether this scene is publicly viewable or requires membership. */
  access: AccessLevel;
  /** Mature-content flag — surfaced as a label per content rules. */
  mature: boolean;
  /**
   * Graphic all the way through, rather than merely intimate.
   *
   * This lived only on PremiumCut, which assumes a scene has a tame public
   * edit and an explicit members' one. josh-luna-bed-sex has no tame edit —
   * past the first ninety seconds it is one thing the rest of the way — so
   * there was nowhere to say so, and the page would have labelled it "Mature"
   * like a kiss.
   *
   * `mature` reads as "there is sex in this". This says it is shown.
   */
  explicit?: boolean;
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
   * The opening of a members-only scene, played to people who aren't members.
   *
   * The model, per Melissa (2026-08-05): a visitor watches the start of any
   * premium scene and then meets the membership — a real piece of the real
   * thing rather than a locked poster.
   *
   * THIS IS A SEPARATE FILE AND HAS TO BE. The tempting version is to serve
   * the whole scene and stop the player after a minute, which hands the entire
   * file to anybody who opens devtools. A non-member is never sent the bytes
   * of what they have not paid for; the swap happens in the stream route,
   * server-side, after the entitlement check — the same place the members'
   * cut is chosen.
   *
   * Cut by scripts/make-previews.mjs, always from `file` rather than
   * `premium.file` (an explicit cut is the upgrade, not the shop window).
   *
   * IT IS NO LONGER ALWAYS THE OPENING. Every preview used to start at 0:00,
   * which meant it stopped rather than ended — the viewer got a beginning,
   * felt finished, and left. Melissa's rewrite of the strategy (2026-08-10) is
   * that a preview should end IMMEDIATELY BEFORE the thing you want to know:
   * the answer, the confession, the decision. `hookStart` is where that window
   * begins. Omitted still means the opening, which is right for scenes that
   * open on their own best question.
   *
   * Only meaningful on `access: "premium"`. Absent means the old behaviour:
   * the scene is locked outright and the stream route refuses it.
   */
  preview?: {
    /** Basename of the preview proxy inside `stories/`. */
    file: string;
    durationSeconds: number;
    /**
     * Seconds into the scene where the preview starts. Omitted = 0.
     *
     * Chosen per scene against the transcript and the canon, not by a
     * heuristic — see scripts/find-hooks.mjs, which proposes candidates for a
     * human to pick from rather than deciding.
     */
    hookStart?: number;
    /** Why this window, in a few words. Shows up nowhere; it is for Melissa. */
    hookNote?: string;
  };
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
    // Rescored 2026-08-06 from luna-josh-dinner-at-house/luna-josh-firstnight.
    // Same scene and same shots, re-exported with a new mix and a tighter
    // frame (1320x764 against the old 1320x890), which is why the poster moved
    // to 0:08 — the old grab sat outside the new crop.
    file: "luna-josh-first-morning.proxy.mp4",
    poster: "/posters/luna-josh-first-morning.jpg",
    durationSeconds: 141,
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
    preview: {
      file: "tyson-luna-lakehouse-fire-preview.proxy.mp4",
      durationSeconds: 15,
      hookStart: 224,
      hookNote:
        "ends on “Can I ask you something?” — the answer she is about to be asked for is “why are you so good to me”",
    },
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
    preview: {
      file: "tyson-park-fight-preview.proxy.mp4",
      durationSeconds: 15,
      hookStart: 49,
      hookNote:
        "ends hard on him saying stop — withholds her “since when did you start hiding from me” and his eight words",
    },
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
    preview: {
      file: "luna-tyson-bar-preview.proxy.mp4",
      durationSeconds: 15,
    },
    feelings: ["desire", "distance"],
    place: "bar",
    about: ["luna", "tyson"],
  },
  {
    // Casey's first scene, and the first time the bar has had a third person
    // in it. PLACE is `bar` and not `burnetts` — this is Luna and Tyson's
    // place, the one Last Call and the dance happen in. Burnett's is Cole's,
    // and Luna has never been in it.
    //
    // ABOUT includes casey. She is in the room for most of it and the whole
    // scene is Luna deciding who she is, which makes her a subject rather than
    // set dressing — see the note in taxonomy.ts.
    //
    // 60s PREVIEW, Melissa's call: "we can show the first 1min". That is the
    // fight in full before the ask, and it is registered in the OVERRIDES
    // table in scripts/make-previews.mjs so re-running the script does not
    // quietly cut it back to fifteen.
    //
    // SCORED CUT, swapped in 2026-08-09. It REPLACES the dialogue cut rather
    // than sitting beside it as a members' upgrade the way luna-josh-fair
    // does, because that split only earns its keep on a scene whose public cut
    // somebody can actually watch. This one is members-only already, so a
    // second members' cut would upgrade nobody and leave the dialogue version
    // serving nothing but the preview.
    //
    // Confirmed the music is really there rather than trusting the filename:
    // the scored mix has a continuous low band the dialogue one does not, and
    // its noise floor sits at 0.56 of the median against 0.49. It is a
    // re-export, not a remix — the two are not frame-aligned, and it runs
    // about 4s longer.
    //
    // 1320x852 (1.55) against the dialogue cut's 1936x1080 (1.79), so it
    // pillarboxes slightly in the 16:9 player. The wall's scored cut already
    // does this at 1.61; this is the most pronounced so far. Worth an export
    // at 16:9 whenever Melissa is back in the timeline.
    //
    // Delivered with 3.8s of black on the end, trimmed at 205.0s.
    slug: "luna-tyson-casey-bar",
    title: "Your Date",
    synopsis:
      "A fight with Josh leaves Luna in their bar on her own and several drinks in. Tyson comes in with someone he has never mentioned, and by the time she puts her glass down she has decided what it means.",
    file: "luna-tyson-casey-bar.proxy.mp4",
    poster: "/posters/luna-tyson-casey-bar.jpg",
    durationSeconds: 205,
    addedOn: "2026-08-09",
    access: "premium",
    mature: true,
    preview: {
      file: "luna-tyson-casey-bar-preview.proxy.mp4",
      durationSeconds: 60,
      hookStart: 131,
      hookNote:
        "ends on “I'm not drunk”, one beat before “I'll let you get back to your date”",
    },
    feelings: ["hurt", "distance"],
    place: "bar",
    about: ["luna", "tyson", "casey"],
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
    preview: {
      file: "luna-tyson-bathroom-preview.proxy.mp4",
      durationSeconds: 15,
    },
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
    preview: {
      file: "luna-josh-bed-preview.proxy.mp4",
      durationSeconds: 15,
    },
    feelings: ["desire", "trust"],
    place: "farmhouse",
    about: ["luna", "josh"],
  },
  {
    // NO PREVIEW, SETTLED — Melissa, 2026-08-12: the explicit scenes go behind
    // membership, so the sixty seconds do not get cut after all. Recorded
    // because she had earlier asked for the first minute and this reverses it.
    //
    // The reasoning she settled on is the one the rest of the file already
    // follows. Every other premium scene's preview is served to people with NO
    // ACCOUNT AND NO AGE CHECK, which is fine for a fight or a confession and
    // is a different thing entirely for a nine-minute explicit scene. It is
    // also the one kind of material the site has never put in front of a
    // signed-out visitor: ty-luna-bed's public cut is the tame one, and the
    // still-awake clip has no preview at all.
    //
    // CORRECTION, 2026-08-12: my earlier note here said there was no
    // non-explicit stretch to draw sixty seconds from. That was wrong. I had
    // sampled across the whole take and read the opening as part of the scene
    // it leads into. Melissa said the first ninety seconds are him waking her,
    // and she is right — checked frame by frame at 2s intervals:
    //
    //   0:00–1:35  the room dark, her asleep in a camisole, his face in the
    //              back of her neck, her waking up and laughing. Held, not
    //              undressed. No nudity, nothing explicit.
    //   ~1:40      it turns, and there is no way back after it.
    //
    // Kept here because it is the one thing worth knowing about this file: a
    // preview COULD come straight off the head, with no assembled beat cut, if
    // that call is ever revisited. Two caveats if it is. The opening is nearly
    // SILENT — mean -46.8dB over the first 95s, peaking at -27.1 — which plays
    // as a quiet room inside the full scene but reads as broken audio in a
    // sixty-second cut on a phone. And a preview that shows only the tenderness
    // sells a nine-minute explicit scene as something gentler than it is.
    //
    // It ships LOCKED.
    //
    // THE SCORED CUT IS OUTSTANDING. Melissa asked on 2026-08-12 whether the
    // published file was the one with music. It is not, and no scored export of
    // this scene has ever reached the repo — the only full-length file is the
    // 542s master, which sits in stories/josh-luna-bed-sex/ twice (identical
    // bytes, once at the top and once under video/), and the proxy carries its
    // audio unchanged. Measured against the thresholds this file already uses:
    //
    //   this scene   mean -35.6dB, peak -15.8dB, and 15 stretches below -50dB
    //   josh-rick-lake (confirmed NO SCORE)      mean -34.5dB
    //   luna-josh-kitchen-kiss (carries a song)  mean -16.7dB
    //
    // Windowed in 60s steps it runs -49dB at the head to -30dB at the end,
    // rising with the scene and never approaching the ~-16dB of a scored mix.
    // The fifteen dropouts settle it: no music bed goes silent fifteen times.
    //
    // So the standing rule that scored cuts get used has not been applied here
    // for want of a file. When the scored export lands, swap it in and delete
    // the silence caveat above — it exists only because this mix is bare.
    //
    // 886x534 MASTER, which is far below anything else here (the next lowest
    // is 1320x800). The proxy is encoded at native size rather than upscaled
    // to the usual 720 — upscaling adds bytes and invents no detail. Worth a
    // re-export at a proper size if the source allows it, and the scored
    // export is the natural moment to do it.
    //
    // Delivered with 6s of black on the end, trimmed at 537s.
    //
    // TITLE from Melissa, 2026-08-12, replacing my placeholder ("All Night").
    // Hers is the accurate one: it is the first night since he came back, and
    // the entry beside it is her account of the same morning.
    slug: "josh-luna-bed-sex",
    title: "First Night",
    synopsis:
      "He can't sleep, so he wakes her. Six in the morning, and six months since the last time.",
    file: "josh-luna-bed-sex.proxy.mp4",
    poster: "/posters/josh-luna-bed-sex.jpg",
    durationSeconds: 537,
    addedOn: "2026-08-12",
    access: "premium",
    mature: true,
    explicit: true,
    // "trust" added with the retitle: the scene's first ninety seconds are him
    // holding her and making her laugh, which is the axis a browser looking for
    // that would want it on. It is not only desire.
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
    preview: {
      file: "luna-josh-kitchen-kiss-preview.proxy.mp4",
      durationSeconds: 15,
    },
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
    preview: {
      file: "luna-josh-dinner-house-preview.proxy.mp4",
      durationSeconds: 15,
    },
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
    preview: {
      file: "luna-josh-house-preview.proxy.mp4",
      durationSeconds: 15,
    },
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
    // The second Josh-and-his-father scene, and FREE for the same reason the
    // study is: it explains Josh instead of advancing him. Two of these now
    // sit next to each other, which is the point — the study is Rick indoors
    // on his own ground, this is Rick outdoors with his hands busy.
    //
    // PLACE is `lake`, not `lakehouse` — "open water at the far edge of the
    // farm, well out of earshot" is exactly the shot, and it keeps Luna's
    // lakehouse out of a scene she is not in.
    //
    // NO SCORE, and Melissa does not intend to add one. It is the only scene
    // on the site carrying itself on dialogue alone: mean level -34.7dB with
    // peaks at -8.3dB, against about -16dB for anything scored. Do not "fix"
    // the quiet.
    //
    // Delivered with 2.1s of black on the end, trimmed at 57.2s. That is four
    // of the last five deliveries — see the note on josh-luna-wall.
    //
    // SYNOPSIS REWRITTEN 2026-08-10 from the actual dialogue, which is now
    // readable: whisper transcribes this scene cleanly precisely because it
    // has no score. The old one was written from the picture alone and said
    // nothing about what happens, because I could not hear it.
    //
    // What happens: Josh says he doesn't know how to fix this. Rick tells him
    // he doesn't — "you fix you". Rick has spoken to CATHY, who told him Luna
    // is staying out at the lakehouse. Josh admits she won't see him. Rick
    // says: good. Now you know how she felt.
    slug: "josh-rick-lake",
    title: "The Lake",
    synopsis:
      "Josh has come to his father for a way to fix it. Rick has a line in the water, has already spoken to her mother, and knows exactly where Luna is staying.",
    file: "josh-rick-lake.proxy.mp4",
    poster: "/posters/josh-rick-lake.jpg",
    durationSeconds: 57,
    addedOn: "2026-08-06",
    access: "free",
    mature: false,
    feelings: ["distance", "hurt"],
    place: "lake",
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
    preview: {
      file: "luna-josh-beach-preview.proxy.mp4",
      durationSeconds: 15,
    },
    feelings: ["desire", "trust"],
    place: "mexico",
    about: ["luna", "josh"],
  },
  {
    // Cathy's introduction, and the earliest thing in the present-day story —
    // a week after Luna moved out, which puts it just before the month-one
    // material below.
    //
    // FREE, deliberately. It has no turn in it to give away, it is
    // licence-clean (dialogue only, no score — checked on the spectrogram,
    // unlike luna-tyson-dance and luna-josh-fair), and it introduces a whole
    // character. That makes it the best shop-window scene in the library for
    // the /about funnel, which now tells confused arrivals to start at the
    // beginning.
    //
    // THE POSTER IS THE PREMISE: the phone face-up on the counter, screen lit,
    // reading "Mom", and Luna standing over it deciding. She has been dodging
    // her family for a week. It gives away nothing and explains everything.
    //
    // The cut is worth knowing about if it is ever recut: shots 8 and 9 run
    // 8.1s and 9.1s against 2-5s everywhere else, covering Luna walking to the
    // window and turning her back — while the audio runs 31 seconds without a
    // pause over 0.6s. Cathy talks straight through Luna's withdrawal. Picture
    // and sound carry the same idea independently, and shortening either would
    // cost it.
    slug: "luna-cathy-phone",
    title: "Long Distance",
    synopsis:
      "A week after she moved out, Luna finally picks up. Her mother has been calling — and Josh has been calling her mother.",
    file: "luna-cathy-phone.proxy.mp4",
    poster: "/posters/luna-cathy-phone.jpg",
    durationSeconds: 92,
    addedOn: "2026-08-03",
    access: "free",
    mature: false,
    feelings: ["grief", "distance"],
    place: "lakehouse",
    about: ["luna", "cathy", "josh"],
  },
  {
    // Avery's introduction, and the answer to the scene above it. Cathy got
    // nothing out of Luna and rang her other daughter about it; Avery calls
    // already knowing, which is the entire difference between them.
    //
    // FREE, for the same reason "Long Distance" is: no turn to protect, a new
    // character nobody would otherwise know exists, and it is the warmest
    // ninety seconds in the library. Gating a character's only appearance
    // would put someone on the cast page that nobody can actually meet. One
    // line to change if that call goes the other way.
    //
    // LOCATION — settled 2026-08-04. Her own place in Denver, on a night after
    // the lakehouse week, not the lakehouse itself. Same room as "The
    // Apartment" clip, which had been filed under nowhere until now.
    //
    // Nothing here names what is lit outside the window. It reads as a
    // skyline; Melissa may play it as her porch. Leaving it unsaid costs the
    // copy nothing and keeps the decision hers.
    //
    // THE POSTER IS THE PREMISE, again by luck: she is mid-journal-entry, pen
    // in hand, and the iPad beside her is lighting up with Avery's name. The
    // scene and the journal feature explaining each other in one frame.
    slug: "luna-avery-ipad",
    title: "Little Sister",
    synopsis:
      "Their mother has already made her calls. Avery rings from Atlanta knowing the answer, and for the first time in a week Luna laughs.",
    file: "luna-avery-ipad.proxy.mp4",
    poster: "/posters/luna-avery-ipad.jpg",
    durationSeconds: 95,
    addedOn: "2026-08-04",
    access: "free",
    mature: false,
    feelings: ["trust", "grief"],
    place: "apartment",
    about: ["luna", "avery"],
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
      // Was "A month after he moved out" until 2026-08-03, when the property
      // canon settled: the farm is Josh's, the lakehouse is Luna's, so she is
      // the one who left. This is live public copy on a free scene, which is
      // why it gets corrected rather than left as the one place on the site
      // still telling it the old way.
      "A month after she moved out, Tyson takes her somewhere loud. She makes him dance. For most of the night it works.",
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
    // EXPLICIT AND FULLY LOCKED as of 2026-08-12, on Melissa's instruction that
    // the explicit scenes sit behind membership. Checked the whole 287s rather
    // than trusting `mature`: she is nude throughout, and the intercut close
    // shots make it a sex scene she is having on her own. That is "shown", not
    // "intimate", so it takes `explicit` for the same reason josh-luna-bed-sex
    // does — the page said "Mature" for a nude scene, which was the wrong word.
    //
    // THE PREVIEW IS GONE, and it was the actual leak. A 15s cut is served to
    // people with NO ACCOUNT AND NO AGE CHECK, and this one opened on a wide
    // shot of her in the bath and cut to a hand on wet skin and her face. That
    // is the one thing the site has never shown a signed-out visitor.
    //
    // Removing the block is sufficient to close it: app/api/stream/[slug]
    // resolves the file from this data and nothing the client sends, so with no
    // `preview` here a non-member gets a 403 and the preview file is
    // unreachable. luna-bathtub-preview.proxy.mp4 is LEFT ON DISK rather than
    // deleted like the gingerale hook — there is no single master for this
    // scene (stories/luna-bathtub/ is three source parts), so a deleted cut
    // could not be regenerated.
    //
    // POSTER RE-GRABBED to 118s, two mouths about to meet. Posters live in
    // /public at a permanent ungated URL — no flag gates them, `explicit` only
    // drives a badge — so the old one was full-frame nudity on the public
    // browse grid, reachable by anyone with the URL and by any crawler. The new
    // frame carries the scene without carrying the nudity. If you want the
    // stronger fix, explicit posters need to move behind /api/still.
    slug: "luna-bathtub",
    title: "Still Water",
    synopsis:
      "Luna alone, at the end of a day she hasn't told anyone about.",
    file: "luna-bathtub.proxy.mp4",
    poster: "/posters/luna-bathtub.jpg",
    durationSeconds: 287,
    access: "premium",
    mature: true,
    explicit: true,
    feelings: ["grief", "desire"],
    place: "farmhouse",
    about: ["luna"],
  },
  {
    // The farmhouse confrontation. Josh has decided what Luna's face meant
    // when Tyson was in the room, and spends six unbroken minutes on it.
    //
    // MEMBERS-ONLY, WITH NO FREE CUT, and that is a deliberate departure from
    // every other scene here. The house pattern is a short public cut that
    // sells the longer one (Video.premium) — that would be wrong twice over
    // for this. A scene depicting strangulation is not a shop window, and a
    // pre-play disclaimer is close to meaningless if a minute of the thing it
    // describes is playing publicly two clicks away. One line to reverse if
    // Melissa disagrees; nothing else depends on it.
    //
    // THE NOTES ARE THE POINT, and two of them are `severe`, so the notice
    // renders raised and says "Before you play this" rather than "Contains".
    // `violence` is deliberately NOT among them: it is true but useless here,
    // and "physical violence" sitting alongside the specific words would blunt
    // them. See lib/content/content-notes.ts.
    //
    // THE POSTER WAS CHOSEN AGAINST THE OBVIOUS ONES. Most frames in this
    // scene are two faces close together in low light, and out of context they
    // read as a love scene — which is the single worst thing a card for this
    // could do. This one is 364s in: her brow drawn, a tear track on her
    // cheek, his face in shadow. It cannot be misread. It is dim (p95 49) and
    // that is correct rather than a defect.
    //
    // NOW THE SCORED CUT (2026-08-05). The dialogue-only master is still at
    // stories/josh-luna-wall/josh-luna-wall.mp4 if this needs reverting.
    //
    // The score became the scene rather than a members' upgrade, because this
    // scene has no free tier for an unscored version to live in — only the
    // one-minute preview, which is re-cut from this file so the public minute
    // carries the same mix. One version of the scene, not two.
    //
    // IT COSTS RESOLUTION: 1320x818 against the dialogue master's 1930x1080,
    // and 1.61 rather than 1.79, so it pillarboxes slightly in a 16:9 player.
    // Same trade as luna-josh-fair. Worth a re-export at 1080 if the source
    // allows it.
    //
    // Delivered with 18 seconds of black on the end; trimmed at 367.7s. That
    // is three of the last four deliveries, so check the tail every time.
    // One continuous six-minute take — scene detection finds no cuts at all.
    slug: "josh-luna-wall",
    title: "The Way You Looked at Him",
    synopsis:
      "Josh has decided what he saw in her face when Tyson was in the room. He never raises his voice, and he does not let her leave the wall.",
    file: "josh-luna-wall.proxy.mp4",
    poster: "/posters/josh-luna-wall.jpg",
    durationSeconds: 367,
    addedOn: "2026-08-05",
    access: "premium",
    mature: true,
    preview: {
      file: "josh-luna-wall-preview.proxy.mp4",
      durationSeconds: 60,
    },
    notes: ["strangling", "coercion", "control"],
    feelings: ["hurt", "lies"],
    place: "farmhouse",
    about: ["luna", "josh", "tyson"],
  },
  {
    // Cole's introduction, and the first time the promise to Josh is said out
    // loud anywhere in the story.
    //
    // PREMIUM, and this one is not a close call. Every other recent scene went
    // free because it had no turn in it to protect — this is the opposite. It
    // contains the mechanism the whole deadlock runs on: Tyson gave Josh his
    // word he would help win Luna back, months before he understood what he
    // felt. That is the thing people are paying to find out, so the title and
    // synopsis are written to intrigue on a locked card without giving it up.
    //
    // TRIMMED AT 41.3s. Both delivered masters ran long: the first had 63
    // seconds of black on the end, and the replacement still carried a CapCut
    // watermark outro after the hard cut. Neither belongs on a paid scene.
    // Source of truth is tyson-cole-bar-trimmed.mov beside the master; if the
    // scene is ever re-exported, check the tail before encoding.
    //
    // PLACE — `burnetts`, settled 2026-08-04. The bar is Cole's; his surname
    // is Burnett. Kept apart from `bar` (where Tyson takes Luna dancing)
    // because they are different rooms doing different jobs, and because it
    // matters that Tyson came HERE: to his friend's own counter, where Cole is
    // working and can't leave, in a room with other people in it. The least
    // private place to say the most private thing, which is probably the only
    // reason he manages to say it.
    slug: "tyson-cole-bar",
    title: "What Would You Do",
    synopsis:
      "There is one subject Tyson can't raise with Luna. So he takes it to the only other person who knows all of them.",
    file: "tyson-cole-bar.proxy.mp4",
    poster: "/posters/tyson-cole-bar.jpg",
    durationSeconds: 41,
    addedOn: "2026-08-04",
    access: "premium",
    mature: false,
    preview: {
      file: "tyson-cole-bar-preview.proxy.mp4",
      durationSeconds: 13,
      hookStart: 10,
      hookNote:
        "ends on Cole's “Would you?”, withholding “Luna isn't going to let you avoid her forever”",
    },
    feelings: ["distance", "lies"],
    place: "burnetts",
    about: ["tyson", "cole", "luna", "josh"],
  },
  {
    // One scene, two edits — the same night, cut twice. The public one is the
    // DIALOGUE cut; members get the SCORED one in its place.
    //
    // TWO THINGS MELISSA SHOULD KNOW, both her call, neither a blocker:
    //
    //   1. MUSIC. The members' cut is scored. This used to be written up as
    //      an unlicensed-music risk; that was probably wrong. The dance's
    //      working folder contains ES_ files ("ES_Give Me All That -
    //      Mondays.mp3"), which is Epidemic Sound's download naming, and an
    //      Epidemic Sound subscription licenses exactly this use. Treat the
    //      music as licensed unless Melissa says otherwise. To pull it
    //      anyway, delete the `premium` block: the scene keeps working and
    //      everyone gets the dialogue cut.
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
    addedOn: "2026-08-02",
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
{
    // "Breathe" — the hour after the wall. Luna leaves the farm and drives to
    // Tyson; this is the drive.
    //
    // RESTORED 2026-08-05 after being pulled on the 3rd for missing media.
    // The "recut master" that was being waited on turned out never to have
    // happened: the file delivered as "luna-truck-breakdown 2.mp4" is
    // byte-identical to the one that has been there since 1 August (same
    // sha256). So the assembled preview and both proxies, built from that
    // exact file, were still correct and only needed uploading.
    //
    // ONE SCENE, TWO EDITS. The public cut is fifteen seconds ASSEMBLED from
    // five beats across the first seventy seconds — see
    // scripts/make-preview-cut.sh, which records the spans. It stops before
    // Tyson appears at 2:06, so a visitor watches her alone and never learns
    // whether anyone is waiting at the end of the drive.
    //
    // THE FIGHT IS NO LONGER OFF SCREEN. When this was first written, what
    // Josh did was unsettled canon and deliberately unseen. It is settled now
    // (2026-08-05): it is josh-luna-wall, and the two are ONE NIGHT — the wall
    // is the event, this is the hour after it. The synopsis still does not say
    // so, because a visitor meeting this scene first should meet it the way
    // Luna does.
    slug: "luna-truck-breakdown",
    title: "Breathe",
    synopsis:
      "She leaves the farm at night without telling anyone and drives to Tyson. The whole way there, she is trying to hold herself together.",
    file: "luna-truck-breakdown.proxy.mp4",
    poster: "/posters/luna-truck-breakdown.jpg",
    durationSeconds: 15,
    access: "free",
    mature: false,
    // On the public cut too — fifteen seconds of it is still fifteen seconds
    // of a panic attack, and the note has to be readable before the thing it
    // describes plays, not only for members.
    notes: ["panic"],
    premium: {
      // SWAPPED TO THE SCORED CUT 2026-08-05. The dialogue-only full cut is
      // still on disk and in Blob as luna-truck-breakdown-full.proxy.mp4;
      // reverting is this block, two values.
      //
      // Not a straight re-mix of the same picture: 3:01 against 2:53 and
      // 1758x1080 against 1912x1080, so it is a re-framed edit as well as a
      // scored one. Both are 1080 tall, so the crop costs no resolution.
      //
      // MUSIC, same as luna-tyson-dance and luna-josh-fair. Previously noted
      // here as a licensing risk; see the fair's entry — the ES_ files in the
      // dance folder are Epidemic Sound, which licenses this use, so the
      // earlier alarm was most likely unfounded.
      file: "luna-truck-breakdown-music.proxy.mp4",
      durationSeconds: 181,
      // Runtime is not the pitch — 3:01 against a 0:15 teaser is true but
      // beside the point. What members get is the score.
      difference:
        "the scored cut — the whole drive, with the music it was edited to",
    },
    feelings: ["hurt", "distance"],
    place: "downtown",
    about: ["luna", "tyson"],
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
    access: "premium",
    mature: true,
    preview: {
      file: "ty-luna-bed-preview.proxy.mp4",
      durationSeconds: 15,
      hookStart: 65,
      hookNote:
        "ends on “Do you remember last night?”, withholding her answer",
    },
    premium: {
      file: "ty-luna-bed-explicit.proxy.mp4",
      durationSeconds: 354,
      explicit: true,
    },
    feelings: ["desire", "trust"],
    place: "lakehouse",
    about: ["luna", "tyson"],
  },
  {
    // The only funny scene on the site, and the transcript is the whole of it:
    // "Ty, did you drink my last ginger ale?" / "Why are you yelling?" /
    // "What's in your hand right now?" / "You're drinking my medicine." /
    // "I'll go buy more." / "Well, I'll be sober by then."
    //
    // PLACED NEXT TO ty-luna-bed BECAUSE IT LOOKS LIKE THE SAME MORNING —
    // she is hungover, he is shirtless in her kitchen, and that scene's own
    // dialogue mentions a wine hangover. That is an inference from the footage
    // and not something Melissa has said, so it is a placement rather than a
    // canon claim; move it if the two are different days.
    //
    // FREE — Melissa, 2026-08-11, overruling the premium call I shipped an
    // hour earlier. Her scene, her decision, and the reasoning holds up: it is
    // the most shareable thing on this site, the site's entire problem right
    // now is that strangers never reach it, and forty-six funny seconds travel
    // where a locked door does not.
    //
    // WHAT IT COSTS, recorded because free is a ONE-WAY DOOR here — three
    // separate places promise "what is free today stays free", so this cannot
    // quietly go back. It shows Tyson half-dressed in her kitchen the morning
    // after, which is the question the whole story is built on. That answer is
    // now public and permanent.
    //
    // No preview block: a free scene streams in full, so there is nothing to
    // preview. The 15s hook cut for it is deleted rather than left orphaned.
    //
    // SCORED CUT SHIPPED, per Melissa's standing rule that scored cuts get
    // used — verified rather than assumed: the scored mix has no silent second
    // in it where the dialogue cut has two. The trade is resolution and shape,
    // 1320x800 against the dialogue cut's 1912x1080, so this one pillarboxes
    // slightly where the dialogue version would not have.
    slug: "luna-tyson-gingerale",
    title: "Ginger Ale",
    synopsis:
      "Luna wants the one thing that will fix her head. Tyson is already drinking it, and has decided to enjoy this.",
    file: "luna-tyson-gingerale.proxy.mp4",
    poster: "/posters/luna-tyson-gingerale.jpg",
    durationSeconds: 47,
    addedOn: "2026-08-11",
    access: "free",
    mature: false,
    feelings: ["trust", "desire"],
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
    preview: {
      file: "ty-luna-farm-road-preview.proxy.mp4",
      durationSeconds: 15,
    },
    feelings: ["distance", "hurt"],
    place: "farmhouse",
    about: ["luna", "tyson"],
  },
];

/**
 * The most recently released scene, for the "New" section on the home page.
 *
 * Dated scenes only, newest first, ties broken by whichever is later in the
 * library. An undated scene never wins — the field was added on 2026-08-06 and
 * back-filling twenty older entries from memory would have invented facts to
 * power a badge.
 *
 * Returns undefined when nothing is dated, so the section simply does not
 * render rather than featuring something arbitrary.
 */
export function latestScene(): Video | undefined {
  const dated = videos.filter((v) => v.addedOn && !v.hidden);
  if (dated.length === 0) return undefined;
  return dated.reduce((newest, v) =>
    v.addedOn! >= newest.addedOn! ? v : newest,
  );
}

/** Whether a release is recent enough to still be worth calling new. */
export function isRecent(video: Video, now: Date = new Date()): boolean {
  if (!video.addedOn) return false;
  const days = (now.getTime() - new Date(video.addedOn).getTime()) / 86_400_000;
  return days <= 14;
}

export function getVideo(slug: string): Video | undefined {
  return videos.find((v) => v.slug === slug);
}

/** Format seconds as m:ss for display. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
