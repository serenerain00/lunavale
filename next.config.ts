import type { NextConfig } from "next";

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
        destination: "/watch/luna-josh-first-night",
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
    ];
  },
};

export default nextConfig;
