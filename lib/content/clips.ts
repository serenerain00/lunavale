/**
 * Vertical clips — the social cuts that ran on Instagram.
 *
 * A separate content kind rather than more entries in lib/content/videos.ts,
 * for two concrete reasons:
 *
 *   1. Shape. They are portrait or square — social shapes, not 16:9. Dropped
 *      into a 16:9 rail they would either be pillarboxed into a sliver or
 *      cropped to nonsense, and every layout that touches them wants to know
 *      their aspect up front. Most are 9:16 and say nothing; one that is not
 *      declares `aspect` and every card respects it.
 *   2. Access. Most of them ran publicly on Instagram, so there is nothing
 *      left to gate — putting those behind the LunaVerse would be selling
 *      something anybody can already scroll past for free, which
 *      docs/monetization/MONETIZATION.md exists to prevent. But not all of
 *      them are the social cuts. Anything explicit was never on Instagram
 *      (it wouldn't have passed their rules), so it carries its own access
 *      and its own rating — see `access` and `explicit` below.
 *
 * Which camera export each one came from is recorded in
 * scripts/import-clips.sh, identified by frames at 15/45/75% of runtime.
 *
 * PLACEHOLDER: titles and captions were written from the footage, not from the
 * original Instagram posts. If those captions still exist, they are the real
 * copy and should replace these.
 */

import type { ContentNoteId } from "@/lib/content/content-notes";
import type { PersonId } from "@/lib/content/taxonomy";
import type { AccessLevel } from "@/lib/content/videos";

export interface Clip {
  /** Stable id — appears in /clips/<id>. Do not rename casually. */
  id: string;
  title: string;
  /** One line, the way a caption reads. PLACEHOLDER. */
  caption: string;
  /** Proxy basename inside stories/, served through the gated stream route. */
  file: string;
  /** Portrait poster under /public. */
  poster: string;
  durationSeconds: number;
  /**
   * The day this clip went up, ISO `YYYY-MM-DD`. THE INDEX IS SORTED BY IT,
   * newest first (Melissa, 2026-09-01: "keep the latest at the top. so the
   * latest should show first").
   *
   * Only set on clips published since the field existed. An undated clip is
   * treated as older than every dated one, which is true, and they hold their
   * authored order among themselves — so nothing had to be back-filled by
   * guesswork. Same rule and same reasoning as `Video.addedOn`.
   */
  addedOn?: string;
  /** Who's in it. */
  about: PersonId[];
  mature: boolean;
  /**
   * Explicit / X-rated — a stronger signal than `mature`, which reads as
   * "intimate" but not graphic. An explicit clip states so before it plays,
   * never autoplays, and its poster is withheld on the public grid. Explicit
   * implies mature; the badge shows "Explicit" in place of it.
   */
  explicit?: boolean;
  /**
   * Free unless stated. A gated clip streams only to members, and its poster
   * is locked on the index — the whole point of gating a sex scene is that a
   * signed-out visitor can't see it, which includes the still frame.
   */
  access?: AccessLevel;
  /** See lib/content/content-notes.ts. A clip carrying one does not autoplay. */
  notes?: ContentNoteId[];
  /**
   * The clip's own shape as [width, height], when it is not the 9:16 this
   * module was built around. Default is portrait and most entries never set it.
   *
   * WHY THIS EXISTS. The rule this module actually wants is "not 16:9", not
   * "exactly 9:16" — the square Instagram cut of the blonde-guy scene is
   * 1320x1256. The VIDEO element was already honest about it (see the comment
   * in VerticalPlayer: letting the element size itself keeps every clip
   * honest); the cards were not.
   *
   * IT DOES NOT APPLY TO THE /clips GRID, deliberately. Melissa's call
   * (2026-09-10): every card there is 9:16 so the wall stays visually
   * balanced, and the odd square one is cropped by CSS to match. This field
   * governs the places where the clip stands alone and its real proportions
   * are the point — the player and the locked card.
   */
  aspect?: [number, number];
  /**
   * When this clip is a preview of a longer scene, that scene's slug. Lets the
   * clip page say what the full thing is and where it lives, instead of leaving
   * a visitor to guess that thirty seconds is all there is.
   */
  fullSceneSlug?: string;
  /**
   * The opening of a members-only clip, played to somebody who may not watch
   * the rest. The portrait counterpart of Video.preview, added 2026-09-08 for
   * luna-ty-nyc-vertical.
   *
   * BEFORE THIS, A GATED CLIP WAS A CLOSED DOOR. `access: "premium"` meant the
   * stream route refused outright and the page showed a blurred poster, which
   * is the correct treatment for the explicit ones — the still frame is the
   * thing being withheld. It is the wrong treatment for a clip whose whole job
   * is to make somebody want the rest, and Melissa asked for exactly that:
   * "behind membership. show the first 1min."
   *
   * ALWAYS THE OPENING, and there is no `hookStart` here on purpose. Scenes
   * grew one when their windows moved off the top (see Video.preview); a
   * vertical cut is already the hook — it is the edit that opens on a face
   * instead of a lobby — so the first minute is the right minute, and the
   * page can honestly say "the first 1:00 of 4:10".
   *
   * A SEPARATE, SHORTER FILE, for the same reason scenes' previews are: the
   * route swaps to it after the entitlement check, so a non-member is never
   * sent a byte of the full cut. Cut by scripts/import-clips.sh.
   */
  preview?: {
    /** Basename of the preview proxy inside stories/. */
    file: string;
    durationSeconds: number;
  };
}

/** A clip's effective access. Free is the default, so entries stay terse. */
export function clipAccess(clip: Clip): AccessLevel {
  return clip.access ?? "free";
}

const authored: Clip[] = [
  {
    /*
      THE PILOT INTERVIEW. Melissa, 2026-09-10: a film crew comes to the
      lakehouse to speak with Luna, it is brief, and it exists to promote the
      pilot — which drops this month.

      IT IS NOT A SCENE AND MUST NOT READ AS ONE. Everything else in this file
      is the story; this is the story being talked about, in character, to a
      camera that is admitted to exist. So it carries no `fullSceneSlug` —
      there is no longer version of it to sell — and no `feelings`, because it
      is not a beat anybody can be filed under.

      FREE, and not a close call. It is an advertisement for the pilot. Gating
      it would be charging admission to a trailer.

      SHOT 9:16 at 1080x1920, so it needs no `aspect` — it is exactly the shape
      this content kind was built around.

      IT LANDS ON THE HOME PAGE BY ITSELF. `clipOfTheDay` shows the newest clip
      on the day it is added and then rotates it into the pool, and `isFeatured`
      badges it as new for a week. Nothing here pins it, which is the 2026-09-01
      decision this file already records — if the pilot needs more than a day at
      the top, that is a change to the rotation and not to this entry.

      PLACEHOLDER title and caption — hers to replace. The title says what the
      thing is rather than being evocative, because this one is marketing and a
      visitor deciding whether to spend forty-six seconds should not have to
      guess.
    */
    id: "pilot-interview",
    title: "The Pilot Interview",
    caption:
      "A film crew comes out to the lakehouse and sits her down. Forty-six seconds on the pilot, out this month.",
    file: "pilot-interview.proxy.mp4",
    poster: "/posters/pilot-interview.jpg",
    // 45, trimmed at 45.3. It fades to near-black by 43 and the fade is part
    // of the edit; only the true black after it was cut.
    durationSeconds: 45,
    addedOn: "2026-09-10",
    about: ["luna"],
    mature: false,
  },
  {
    id: "run-at-the-lake",
    title: "Run",
    caption: "Six miles, headphones in, nobody to talk to. Her favorite hour.",
    // Trimmed 2026-08-10 at 100.5s, from 103.7. What came off was 1.0s of
    // black and 1.8s of screen-recorded editing-app UI that had ridden along
    // on the export. Her end card is untouched, and the audio had already
    // faded to digital silence by 100.6 — so the cut needed no fade and the
    // trim is a stream copy, with no re-encode and no quality lost.
    file: "run-at-the-lake.proxy.mp4",
    poster: "/posters/run-at-the-lake.jpg",
    durationSeconds: 101,
    about: ["luna"],
    // The one clip in the set that isn't intimate. Flagging a woman going for
    // a run as mature would drain the label of the meaning it needs to carry
    // on the six below it.
    mature: false,
  },
  {
    id: "apartment-window",
    title: "The Apartment",
    caption: "A city night, and a conversation that doesn't stay a conversation.",
    file: "apartment-window.proxy.mp4",
    poster: "/posters/apartment-window.jpg",
    durationSeconds: 99,
    about: ["luna", "tyson"],
    mature: true,
  },
  {
    id: "close-quarters",
    title: "Close Quarters",
    caption: "Not enough room in it to pretend.",
    file: "close-quarters.proxy.mp4",
    poster: "/posters/close-quarters.jpg",
    durationSeconds: 52,
    about: ["luna", "tyson"],
    mature: true,
  },
  {
    id: "still-awake",
    title: "Still Awake",
    caption: "Long past the hour either of them meant to stop.",
    file: "still-awake.proxy.mp4",
    poster: "/posters/still-awake.jpg",
    durationSeconds: 213,
    about: ["luna", "tyson"],
    mature: true,
    // A sex scene: gated to members, rated explicit, poster withheld.
    explicit: true,
    access: "premium",
  },
  {
    id: "morning-after",
    title: "The Morning After",
    caption: "Nobody says anything, and it isn't awkward, which is its own problem.",
    file: "morning-after.proxy.mp4",
    poster: "/posters/morning-after.jpg",
    durationSeconds: 152,
    about: ["luna", "josh"],
    mature: true,
  },
  {
    // The free preview of "The Beach" (lib/content/videos.ts), which is
    // members-only and 4m44s. Deliberately the Luna-weighted cut: 18s of her
    // alone before anything happens, so what it withholds IS the pitch.
    //
    // LICENSING: built from luna-josh-beach-color.mp4, NOT from
    // luna-josh-beach-sound.mov. That file has a commercially released song
    // mixed into it, and this is a paid product — see stories/trailer/build.sh,
    // which sets the rule: Melissa's own music, nothing licensed. The audio
    // here is the master's own location sound.
    id: "beach-preview",
    title: "The Beach",
    caption:
      "Thirty seconds of an evening that runs nearly five minutes. The rest is in the LunaVerse.",
    file: "beach-preview.proxy.mp4",
    poster: "/posters/beach-preview.jpg",
    durationSeconds: 30,
    about: ["luna", "josh"],
    mature: true,
    fullSceneSlug: "luna-josh-beach",
  },
  {
    // The 9:16 of The Bolt, scored. Named for the line it turns on, which is
    // also the line her journal entry and Josh's set note both quote — the
    // three pieces say the same four words and arrive at different places.
    //
    // Free, and the best thing on the site to put in front of a stranger:
    // it is 58 seconds, it needs no context, and somebody wins something.
    id: "one-more",
    title: "One More",
    caption:
      "She can't shift it and she's done arguing about it. He doesn't take the wrench off her.",
    file: "one-more.proxy.mp4",
    poster: "/posters/one-more.jpg",
    durationSeconds: 58,
    about: ["luna", "josh"],
    mature: false,
  },
  {
    // Free, like the rest of the social cuts. It reads as a mood piece rather
    // than a turn, and it is the shortest route a stranger has to Tyson —
    // which is what the character pages need most.
    id: "discipline",
    title: "Discipline",
    caption:
      "The sign on his wall has been there for years. He has never once mentioned it.",
    file: "discipline.proxy.mp4",
    poster: "/posters/discipline.jpg",
    durationSeconds: 87,
    about: ["luna", "tyson"],
    mature: true,
  },
  {
    id: "said-out-loud",
    title: "Said Out Loud",
    caption: "The sentence she'd been carrying around for a month.",
    file: "said-out-loud.proxy.mp4",
    poster: "/posters/said-out-loud.jpg",
    durationSeconds: 69,
    about: ["luna"],
    mature: true,
  },
  {
    // THE ONLY PLACE ON THE SITE SHE LOOKS LIKE THIS WITH JOSH, and that is
    // the entire reason to publish it. Melissa, 2026-09-01: she was helping
    // him out on the farm, it starts to pour on the way back, "their edges
    // soften on the way back... she does smile with Josh."
    //
    // Everything else in the Josh material is the charming-then-controlling
    // arc, and a reader who has only met him through the journal has no
    // working picture of why she stayed for ten years. Three minutes of the
    // two of them soaked and laughing on a farm road answers that without
    // arguing about it — and it makes the rest of the arc land harder, because
    // you cannot lose something you were never shown.
    //
    // Trimmed at 186.4s from a 193.0s export: blackdetect puts 6.6s of black
    // on the end. That needed a new `end` argument on optimize-media.sh's
    // `vertical` branch, which had never had one.
    id: "luna-josh-rain",
    title: "Caught Out",
    caption:
      "Helping him on the farm, and the sky opens on the way back. Neither of them runs for cover.",
    file: "luna-josh-rain.proxy.mp4",
    poster: "/posters/luna-josh-rain.jpg",
    durationSeconds: 186,
    addedOn: "2026-09-01",
    about: ["luna", "josh"],
    // Kissing in the rain, both fully dressed the whole way through, nothing
    // shown. `mature` on this set means intimate rather than graphic, and this
    // is a couple soaked on a farm road — closer to `run-at-the-lake` than to
    // the six below it. Melissa's to overrule.
    mature: false,
  },
  {
    /*
      NEW YORK, vertical — and the first gated clip on the site with a public
      opening. Melissa, 2026-09-08: "behind membership. show the first 1min."

      THE BACKSTORY, hers, given the same day and the reason this copy can say
      anything at all: it is about five months into the break-up. Luna and
      Tyson are already feeling it and both refuse to talk about it — he gives
      her clear signals, she probes him for the truth, and neither will put a
      sentence to it. She has a modeling event in New York and invited him out
      for the weekend. This is the night of the company dinner party: drinks
      and her peers all evening, back to the hotel, more drinks in HIS room,
      and then the rest of it.

      SO IT SITS INSIDE THE SIX MONTHS, not after them. That matters more than
      anything else on this entry, because it decides what the copy is allowed
      to imply. The journal has these two arriving at it much later and the
      whole force of `the-night` is that it did not arrive as a decision — so
      nothing here calls this a beginning, and the caption stops where the
      refusal is still holding.

      THE HOTEL IS THE WHITMORE, which is not a choice anybody has to make: it
      is lettered on the desk behind him in the landscape cut and is legible in
      that scene's poster. Melissa asked for a five-star New York hotel; the
      footage had already named one, and a fictional one, which is the better
      outcome than borrowing a real business's name for this particular
      evening.

      It is its own edit rather than a crop — 4:10 against the scene's 4:55,
      and it opens on faces where the scene opens on a lobby. See
      scripts/import-clips.sh.
    */
    id: "luna-ty-nyc-vertical",
    // PLACEHOLDER title and caption — hers to replace.
    title: "New York",
    caption:
      "Five months in, two thousand miles from anybody who knows them, and a whole evening of nearly saying it.",
    file: "luna-ty-nyc-vertical.proxy.mp4",
    poster: "/posters/luna-ty-nyc-vertical.jpg",
    durationSeconds: 250,
    addedOn: "2026-09-08",
    about: ["luna", "tyson"],
    // Intimate the whole way and graphic nowhere. Same call as the landscape
    // cut, and NOT `explicit` — that field means it is shown.
    mature: true,
    access: "premium",
    preview: {
      file: "luna-ty-nyc-vertical-preview.proxy.mp4",
      durationSeconds: 60,
    },
    // The same night in 16:9, four minutes longer, and the page says so.
    fullSceneSlug: "luna-ty-nyc-hotel",
  },
  {
    /*
      THE BLONDE GUY, cut for Instagram. Melissa, 2026-09-09, dropped beside
      the full scene the same evening she replaced that scene's audio.

      FREE, and that is the rule this file was built on rather than a judgment
      call: a clip that runs publicly on Instagram has nothing left to gate,
      and putting it behind the LunaVerse would be selling something anybody
      can scroll past for free. It is also the best advert the newest scene
      has — a scored 1:29 that ends on the two of them in the street, with the
      full 3:03 one click away and members-only.

      SCORED, and the only cut of this material that is: -26.3 dB against the
      scene's -30.9. The scene itself is still the dialogue mix.

      NEARLY SQUARE at 1320x1256, which is neither of the two shapes this file
      was built for. It plays correctly — VerticalPlayer sizes itself — and the
      cost is the card, which crops to 9:16 like every other clip. See
      scripts/import-clips.sh for why the poster second is what it is.

      IT CONTAINS THE CONFRONTATION, including him taking the other man by the
      collar. Hence the note, and hence no autoplay: a clip carrying a content
      note waits to be pressed, which is the correct trade even on the one
      whose job is to be an advert.
    */
    id: "the-blonde-guy",
    // PLACEHOLDER title and caption — hers to replace. The title is Tyson's
    // line, which is the hinge of the whole thing.
    title: "Not Interested",
    caption:
      "She is waiting at the bar for a dinner he is very late to. Somebody else decides she looks like company.",
    file: "the-blonde-guy.proxy.mp4",
    poster: "/posters/the-blonde-guy.jpg",
    // 89, the trimmed length — the delivery ran 96.8s with 7.7s of black on
    // the end.
    durationSeconds: 89,
    addedOn: "2026-09-09",
    about: ["luna", "tyson"],
    // Nothing sexual, nobody undresses. `mature` on this set means intimate
    // rather than graphic and would point at the wrong thing entirely; what is
    // actually in it is the note below.
    mature: false,
    notes: ["violence"],
    // NOT 9:16 — this is the square Instagram post, 1320x1256 at source and
    // 720x686 as the proxy. Without this the grid card renders it in a 9:16
    // cell with `object-cover` and takes the sides off, which is the exact
    // mangling this content kind exists to prevent. See Clip.aspect.
    aspect: [720, 686],
    // The full 3:03, members-only, and the clip page says so rather than
    // leaving somebody to assume ninety seconds is all there is.
    fullSceneSlug: "ty-luna-blonde-guy-bar",
  },
];

/**
 * The clips, NEWEST FIRST.
 *
 * Sorted here rather than in the page, because array order is not only what the
 * index renders — clipNeighbours() reads it for the prev/next controls in the
 * player. Sorting in one place and leaving the other alone would have the
 * arrows walking a different sequence from the grid the visitor just came from.
 *
 * The sort is stable, so undated clips keep the order they are written in above
 * and sit below every dated one. That means adding a clip does NOT require
 * putting it in the right place by hand: give it an `addedOn` and it lands on
 * top by itself.
 */
export const clips: Clip[] = [...authored].sort((a, b) => {
  if (a.addedOn && b.addedOn) return b.addedOn.localeCompare(a.addedOn);
  if (a.addedOn) return -1;
  if (b.addedOn) return 1;
  return 0;
});

/**
 * How long a new clip is featured on the home page. Melissa, 2026-09-01:
 * "feature it on the home page for 7 days too."
 *
 * Seven rather than the fourteen `isRecent` gives a scene, and deliberately: a
 * scene is the product and a clip is an advert for it, so the clip's turn on
 * the front page should be the shorter one. It also means the section is
 * genuinely intermittent, which is what stops it reading as furniture.
 */
const FEATURE_DAYS = 7;

/** True while a clip is inside its window on the home page. */
export function isFeatured(clip: Clip, now: Date = new Date()): boolean {
  if (!clip.addedOn) return false;
  const days = (now.getTime() - new Date(clip.addedOn).getTime()) / 86_400_000;
  return days <= FEATURE_DAYS;
}

/**
 * The clip to feature, or undefined when there isn't one.
 *
 * SELF-EXPIRING BY DESIGN. Nothing has to be remembered or taken down: the
 * section renders while the newest clip is inside its seven days and vanishes
 * on its own afterwards. The home page is statically rendered with a one-hour
 * revalidate, so the disappearance lands within an hour of the deadline rather
 * than waiting for a deploy.
 *
 * Undated clips can never be featured, which is correct — they predate the
 * field and are not new.
 */
export function featuredClip(now: Date = new Date()): Clip | undefined {
  // clips is already newest-first, so the first dated one is the newest.
  const newest = clips.find((c) => c.addedOn);
  return newest && isFeatured(newest, now) ? newest : undefined;
}

/**
 * The clips the front page may show: free, and not explicit. Newest first.
 *
 * A GUARANTEE RATHER THAN A LIST, the same shape as heroes() in
 * lib/content/hero.ts. The daily rotation below walks whatever is in this
 * array, so the filter has to live here — the day a gated clip gets added,
 * nobody should have to remember that the home page picks at random from the
 * whole library.
 *
 * `explicit` is checked as well as access, and not only because the current
 * explicit clip is also premium. A clip's poster sits at a permanent ungated
 * URL under /public; an explicit one has no business being the first thing on
 * the front page even if somebody later marks it free.
 */
export function featurableClips(): Clip[] {
  return clips.filter((c) => clipAccess(c) === "free" && !c.explicit);
}

/**
 * The clip on the front page today. Rotates once a day.
 *
 * WHY IT ROTATES (Melissa, 2026-09-03: "lets rotate the new clip section on
 * the homepage daily so its not stagnant"). The section used to show the
 * newest clip and only the newest clip, for the seven days of its window — so
 * anybody coming back during that week saw the same card in the same place,
 * which is the definition of furniture.
 *
 * ANCHORED TO THE NEWEST CLIP'S OWN RELEASE DAY, not to the epoch, and that is
 * the part that makes this safe to do. On the day a clip lands the offset is
 * zero and the newest clip is what shows; the day after, the next one; and so
 * on round the pool. A new clip therefore still gets the front page on its
 * first day without being pinned there, which is what the seven-day window was
 * really for.
 *
 * WHAT IT COSTS, stated plainly: the seven-day feature is now a ONE-day
 * feature plus a turn in the rotation. That was Melissa's 2026-09-01 decision
 * and this supersedes it at her instruction — the old FEATURE_DAYS still
 * governs whether the card is BADGED as new (see isFeatured), so a clip that
 * comes back around within its week is still labelled new, truthfully.
 *
 * THE CHANGEOVER IS OFFSET EIGHT HOURS so the card turns over at about 4am on
 * the US east coast rather than at 8pm, which is when a plain UTC day boundary
 * would move it. This file's own history records the same trick on the hero
 * rotation before that became per-request; the reasoning was good then and has
 * not changed. The home page revalidates hourly, so the new clip lands within
 * an hour of the boundary rather than on a deploy.
 *
 * Deterministic from the date, deliberately — every CDN copy of the page has
 * to agree about what day it is. Do not make this random: unlike pickHero()
 * this section is not re-rendered per request, so a random pick would freeze
 * for an hour at a time and defeat the point.
 */
const ROTATION_OFFSET_MS = 8 * 60 * 60 * 1000;

function rotationDay(at: number): number {
  return Math.floor((at - ROTATION_OFFSET_MS) / 86_400_000);
}

export function clipOfTheDay(now: Date = new Date()): Clip | undefined {
  const pool = featurableClips();
  if (pool.length === 0) return undefined;

  // The newest dated clip's release day. Undated clips predate `addedOn`, so
  // if nothing is dated at all the anchor is simply day zero and the rotation
  // still turns — it just isn't lined up with anything in particular.
  const anchor = pool.find((c) => c.addedOn)?.addedOn;
  const anchorDay = anchor
    ? rotationDay(Date.parse(`${anchor}T00:00:00Z`) + ROTATION_OFFSET_MS)
    : 0;

  const delta = rotationDay(now.getTime()) - anchorDay;
  return pool[((delta % pool.length) + pool.length) % pool.length];
}

export function getClip(id: string): Clip | undefined {
  return clips.find((c) => c.id === id);
}

/** The clip before and after this one, for prev/next in the player. */
export function clipNeighbours(id: string): {
  previous?: Clip;
  next?: Clip;
} {
  const at = clips.findIndex((c) => c.id === id);
  if (at === -1) return {};
  return { previous: clips[at - 1], next: clips[at + 1] };
}
