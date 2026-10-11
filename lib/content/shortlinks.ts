/**
 * Short links for Instagram: lunavale38.com/go/<code>.
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
    campaign: "bio-2026-10",
    note: "The Instagram bio link. Re-point `to` (and bump `campaign`) instead of editing the bio.",
    addedOn: "2026-10-11",
  },
  {
    code: "suit",
    to: "/clips/luna-ty-suit",
    medium: "reel",
    campaign: "it-suits-you-30",
    note: "The It Suits You promo (scripts/promo/specs/it-suits-you.json).",
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
];

export function shortLinkDestination(link: ShortLink, medium: ShortMedium = link.medium): string {
  const q = new URLSearchParams({
    utm_source: "instagram",
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
