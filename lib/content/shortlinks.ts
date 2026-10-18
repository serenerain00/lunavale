/**
 * Short links for Instagram (and, since 2026-10-18, Facebook): lunavale38.com/go/<code>.
 *
 * Melissa, 2026-10-11: "adding those tags manually is a pain". So every promo
 * gets a code here, and the redirect adds the tracking tags for her —
 * utm_source=instagram, utm_medium, utm_campaign — in the format
 * docs/analytics/ATTRIBUTION.md defines. The landing page's attribution capture
 * then records it exactly as if she'd pasted the long link.
 *
 *   /go/suit          → medium from the entry (what the caption is for)
 *   /go/suit/story    → same, with utm_medium=story (for a Story link sticker)
 *
 * SERVED AS NEXT.JS REDIRECTS (next.config.ts), not a route: answered at the
 * edge, no function runs, so bot traffic on these costs nothing. And they are
 * TEMPORARY (307): `bio` gets re-pointed whenever there's something new, and a
 * permanent redirect would be cached by browsers on the old destination.
 *
 * PLAIN DATA, NO "@/" IMPORTS — next.config.ts imports this file, and the
 * config is loaded before the app's path aliases exist.
 *
 * `campaign` is the join key on /admin/conversion: for a promo, its post_id
 * (the promo spec's name); for the bio, `bio-<yyyy-mm>`, changed whenever the
 * bio's destination changes so the two periods stay separable.
 */

export const SHORT_MEDIUMS = ["reel", "story", "post", "bio", "dm"] as const;
export type ShortMedium = (typeof SHORT_MEDIUMS)[number];

export interface ShortLink {
  /** lower-case letters, digits, hyphens — what people type */
  code: string;
  /**
   * utm_source. Instagram unless said otherwise — the Facebook page arrived
   * 2026-10-18 and its links need to say they came from Facebook.
   */
  source?: "instagram" | "facebook";
  /** a path on this site */
  to: string;
  medium: ShortMedium;
  campaign: string;
  note: string;
  addedOn: string;
}

export const SHORT_LINKS: ShortLink[] = [
  {
    code: "bio",
    to: "/",
    medium: "bio",
    // "bio", NOT "bio-2026-10", until 2026-10-26: the bio already uses
    // utm_campaign=bio, and the measurement baseline runs Oct 11-25 — a new
    // label mid-baseline would split bio traffic in two. From Oct 26 the
    // measurement session's Test B alternates bio-home / bio-pilot weekly.
    campaign: "bio",
    note: "The Instagram bio link. Re-point `to` (and bump `campaign`) instead of editing the bio.",
    addedOn: "2026-10-11",
  },
  /*
   * THE LENGTH TEST, Oct 12-25 (approved by Melissa 2026-10-11; design in the
   * measurement session's week-2026-10-10 report). Two ~30s custom promos vs
   * two 1-2 min scene cuts, all Luna+Tyson, all "teaser" captions; decided on
   * follows per 1k reached. Campaign names are the measurement session's.
   */
  {
    code: "suit",
    to: "/clips/luna-ty-suit",
    medium: "reel",
    campaign: "len-promo-1",
    note: "Length test, promo 1: It Suits You (scripts/promo/specs/it-suits-you.json).",
    addedOn: "2026-10-11",
  },
  {
    // The code is printed on the video's end card — never rename it.
    code: "twenty",
    to: "/clips/ty-luna-young",
    medium: "reel",
    campaign: "len-promo-2",
    note: "Length test, promo 2: Twenty Years montage (specs/twenty-years.json). Lands on Pick Me Up, free, where the twenty years start.",
    addedOn: "2026-10-11",
  },
  {
    code: "mostnights",
    to: "/clips/luna-ty-couch",
    medium: "reel",
    campaign: "len-cut-1",
    note: "Length test, scene cut 1: Most Nights (1:49, free).",
    addedOn: "2026-10-11",
  },
  {
    code: "havefun",
    to: "/clips/young-luna-ty-apt",
    medium: "reel",
    campaign: "len-cut-2",
    note: "Length test, scene cut 2: Have Fun (1:35, free).",
    addedOn: "2026-10-11",
  },
  // "MEET THE THREE", weekly for 3 weeks — image/carousel posts with a Story link.
  ...[1, 2, 3].map((n) => ({
    code: `meet${n}`,
    to: "/characters",
    medium: "story" as const,
    campaign: `meet-three-${n}`,
    note: `Meet the three, week ${n}.`,
    addedOn: "2026-10-11",
  })),
  {
    // The Episode 2 trailer (scripts/promo/specs/ep2-trailer.json). Outside
    // the Oct 12-25 tests — no experiment, no arm — and posted on a day with
    // no other post, so it doesn't touch the one-a-day test.
    code: "ep2",
    to: "/clips/episode-2",
    medium: "reel",
    campaign: "ep2-trailer",
    note: "Episode 2 trailer, ~54s. The code is printed on its end card.",
    addedOn: "2026-10-11",
  },
  {
    code: "ep3",
    to: "/clips/episode-3",
    medium: "reel",
    campaign: "ep3",
    note: "Episode 3: The Space Between.",
    addedOn: "2026-10-11",
  },
  {
    // Printed on the Episode 4 trailer's end card — never rename it.
    code: "ep4",
    to: "/clips/episode-4",
    medium: "reel",
    campaign: "ep4-trailer",
    note: "Episode 4 trailer (~55s, scripts/promo/specs/ep4-trailer.json).",
    addedOn: "2026-10-17",
  },
  {
    // Melissa's new Facebook page took off on 2026-10-18 (~150 sessions in a
    // day). Visits from facebook.com were already attributed by referrer; this
    // is the link to paste into Facebook posts so they also carry a campaign,
    // and so visits from the Facebook app — which often strips the referrer —
    // are not lost. /go/fb/story etc. work the same way.
    code: "fb",
    source: "facebook",
    to: "/",
    medium: "post",
    campaign: "fb-page",
    note: "The Facebook page. Paste into posts and the page's website field.",
    addedOn: "2026-10-18",
  },
];

export function shortLinkDestination(link: ShortLink, medium: ShortMedium = link.medium): string {
  const q = new URLSearchParams({
    utm_source: link.source ?? "instagram",
    utm_medium: medium,
    utm_campaign: link.campaign,
  });
  return `${link.to}${link.to.includes("?") ? "&" : "?"}${q.toString()}`;
}

/** The redirect table for next.config.ts. */
export function shortLinkRedirects() {
  return SHORT_LINKS.flatMap((link) => [
    { source: `/go/${link.code}`, destination: shortLinkDestination(link), permanent: false },
    ...SHORT_MEDIUMS.map((m) => ({
      source: `/go/${link.code}/${m}`,
      destination: shortLinkDestination(link, m),
      permanent: false,
    })),
  ]);
}
