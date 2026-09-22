/**
 * The series — what Luna Vale is now, and what it is releasing.
 *
 * IT IS A SERIES. IT WAS BEING CALLED A FILM. Until 2026-09-16 the site said
 * "film" in a dozen places, the About page floated the idea that it "may not
 * stay a film", and the survey asked visitors to vote on series-or-film. That
 * was honest while the answer was genuinely open. It is not open any more, and
 * a site that asks a question it has already answered reads as either
 * undecided or inattentive — CLAUDE.md's rule about undecided facts applies:
 * state it plainly or leave it off.
 *
 * THE TITLE OF EPISODE 1 IS DELIBERATELY ABSENT. Melissa, 2026-09-16: "call it
 * something interesting. but im thinking about redoing it, so just hold off on
 * the title for now." So the card says Episode 1 and nothing else. The moment a
 * placeholder title ships it is on Instagram, in an email, and in somebody's
 * bookmark, and taking it back costs more than waiting cost.
 *
 * NO DATE, EITHER. "Coming soon" is the most this file is allowed to say until
 * there is a date that will actually hold — the same rule that keeps a release
 * schedule out of lib/content/releases.ts.
 */

export interface Episode {
  /** Position in the season. 1-based, and shown. */
  number: number;
  /** Absent until Melissa names it — see the header. */
  title?: string;
  /** Once it exists, the clip slug it plays from. */
  slug?: string;
  /** Card art. Falls back to the trailer's poster while unreleased. */
  poster?: string;
  runtimeSeconds?: number;
  /** Nothing to play yet. */
  comingSoon: boolean;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

/** What the series is called. The show, not the site. */
export const SERIES_TITLE = "Between Us";

/** The line under the title, everywhere it appears. */
export const SERIES_SUBTITLE = "A Luna Vale Series";

export const SEASONS: Season[] = [
  {
    number: 1,
    episodes: [
      {
        /*
          LANDED 2026-09-21. `comingSoon: false` is what flips the whole front
          page: hasReleasedEpisode() drives the Season 1 shelf note, which
          stops saying the first episode is on its way.

          NAMED 2026-09-21: "call it Episode 1 (Pilot)". The hold from
          2026-09-16 — "im thinking about redoing it, so just hold off on the
          title for now" — is lifted, and this is the name rather than a
          placeholder, so it is safe to put in a share link and an email.

          IT IS SET IN BOTH PLACES ON PURPOSE. This field names the card on the
          Season 1 shelf; `title` on the matching entry in videos.ts names the
          page it opens and anything else that reads the library. They have to
          say the same thing, and nothing enforces that but a person, so this
          note is the enforcement.
        */
        number: 1,
        title: "Episode 1 (Pilot)",
        slug: "pilot",
        poster: "/posters/pilot.jpg",
        runtimeSeconds: 1116,
        comingSoon: false,
      },
    ],
  },
];

/** The season being released now. */
export function currentSeason(): Season {
  return SEASONS[SEASONS.length - 1];
}

/**
 * Whether any episode has actually shipped.
 *
 * The home page needs this because a Season 1 shelf containing one
 * "coming soon" card says something quite different from a shelf with an
 * episode in it, and the copy around it has to change with the fact rather
 * than being rewritten by hand on the day.
 */
export function hasReleasedEpisode(): boolean {
  return SEASONS.some((s) => s.episodes.some((e) => !e.comingSoon));
}
