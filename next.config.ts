import type { NextConfig } from "next";

/**
 * The fifteen ids that lived at /clips/<id> before 2026-09-16.
 *
 * WRITTEN OUT RATHER THAN IMPORTED from lib/content/posts.ts on purpose. This
 * is a historical fact about which URLs were once reachable, not a live view
 * of the library — importing it would mean that renaming a post, or deleting
 * one, silently changed which old links still work. It is also why the list
 * must never gain an entry: anything published after the rename was born at
 * /posts and has no old address to honour.
 */
const POST_IDS = [
  "one-week-in",
  "her-place",
  "pilot-interview",
  "the-blonde-guy",
  "luna-ty-nyc-vertical",
  "luna-josh-rain",
  "beach-preview",
  "one-more",
  "discipline",
  "run-at-the-lake",
  "apartment-window",
  "close-quarters",
  "still-awake",
  "morning-after",
  "said-out-loud",
] as const;

const nextConfig: NextConfig = {
  /**
   * Slug renames, kept permanently.
   *
   * A scene slug is the URL (CLAUDE.md: public pages stay deep-linkable), so
   * renaming one breaks every link already shared — including the ones the
   * site itself put in front of people. A 308 keeps those working and hands
   * search engines the new address instead of a dead one.
   *
   * Entries here are cheap and permanent. Do not remove one because it looks
   * old: the whole point is that a link from a year ago still lands.
   */
  async redirects() {
    return [
      {
        // Renamed 2026-08-12 at Melissa's request: the word "sex" is out of
        // the URL. The scene is "First Night" and the slug now says so, which
        // also matches luna-josh-first-morning.
        //
        // Live for a few hours as the old slug, so this is not theoretical —
        // the release went out and the address was reachable.
        source: "/watch/josh-luna-bed-sex",
        destination: "/clips/luna-josh-first-night",
        permanent: true,
      },
      {
        // The stream route is hit by the player with the slug, so an open tab
        // or a cached page from before the rename would ask for the old one.
        // Redirecting it means those keep playing instead of erroring, and the
        // entitlement check still runs at the destination — this moves the
        // address, it does not skip the gate.
        source: "/api/stream/josh-luna-bed-sex",
        destination: "/api/stream/luna-josh-first-night",
        permanent: true,
      },

      /*
       * THE 2026-09-16 RENAME. Two words on this site meant the wrong things.
       *
       * The 3-to-5-minute story pieces lived at /watch and were called
       * "scenes"; the vertical Instagram cuts lived at /clips and were called
       * "clips". So the word a visitor saw on Instagram ("clip") and the word
       * the site used for the same shape of thing pointed at two different
       * libraries. Melissa's call: the story pieces are CLIPS, and the
       * Instagram cuts are POSTS.
       *
       * Both namespaces move, and neither loses a link. Every clip URL has
       * been shared somewhere — Instagram captions, the release emails that
       * are about to start going out, whatever Google has indexed over two
       * months — and a 308 keeps all of it landing while handing search
       * engines the new address.
       *
       * ORDER MATTERS IN THIS ARRAY. /clips/:id → /posts/:id is listed FIRST
       * and would otherwise catch the new clip URLs too, sending
       * /clips/josh-luna-pool to a post that does not exist. It is safe only
       * because `has` pins it to the exact ids that were posts on the day of
       * the rename — a fixed, closed list that cannot grow. A new post gets a
       * /posts URL from birth and never needs to be here.
       */
      // NOTE THAT BARE /clips IS NOT REDIRECTED. Before today it was the posts
      // grid, and somebody may have it bookmarked — but from today it is the
      // clips index, and the forward-looking meaning has to win. That bookmark
      // now lands on a library of clips with "Posts" in the nav, which is a
      // fair place to arrive. Redirecting it would cost every future visitor
      // the obvious URL to save one old bookmark.
      ...POST_IDS.map((id) => ({
        source: `/clips/${id}`,
        destination: `/posts/${id}`,
        permanent: true,
      })),

      // Everything else under /watch is a story clip and keeps its slug.
      {
        source: "/watch/:slug",
        destination: "/clips/:slug",
        permanent: true,
      },
      {
        source: "/watch",
        destination: "/clips",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
