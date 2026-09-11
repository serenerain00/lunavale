/**
 * /sitemap.xml — the map a search engine cannot build for itself.
 *
 * WHY THIS EXISTS. There was no sitemap and no `Sitemap:` line in robots.txt,
 * so /sitemap.xml fell through to the 404 — the same failure app/robots.ts was
 * written to fix, one file along. Two hundred and twenty-two crawlable pages
 * and nothing pointing at any of them but the internal links, which is a slow
 * and lossy way to be found by a site whose problem is being found at all.
 *
 * BUILT FROM THE CONTENT MODULES, never from a hand-kept list. A sitemap that
 * has to be edited whenever a scene lands is a sitemap that is wrong within a
 * fortnight, and a stale one is worse than none: it teaches a crawler that
 * this site advertises pages that do not exist.
 *
 * STATIC AT BUILD TIME. Nothing below reads a cookie or the database, so Next
 * emits a real file and it is served from the CDN. Same reasoning as robots.ts:
 * the cheapest possible response to the cheapest possible request.
 *
 * WHAT IS DELIBERATELY LEFT OUT
 *
 *   Everything in OFF_LIMITS in app/robots.ts — /account, /welcome, the auth
 *   routes, /membership/start. Listing a page here that robots.txt forbids is
 *   a contradiction, and Search Console reports it as one.
 *
 *   LOCKED JOURNAL PAGES. All ninety-odd entries have public URLs, and a
 *   member-only one renders a dateline and a single opening line. That is the
 *   right shop window for a person and thin, near-duplicate content to an
 *   index — ninety pages of it, which is how a small site teaches Google that
 *   most of what it publishes is thin. The free entries are listed and they
 *   are the ones written to be read cold anyway.
 *
 *   /survey and /help, which are tools rather than reading.
 *
 * PRIORITY AND CHANGEFREQUENCY are set but should be read as hints about
 * intent rather than instructions — Google has ignored both for years. They
 * cost nothing and they document what this site thinks it is.
 */
import type { MetadataRoute } from "next";
import { characters } from "@/lib/content/characters";
import { clips, clipAccess } from "@/lib/content/clips";
import { galleries } from "@/lib/content/gallery";
import { freeEntries } from "@/lib/content/journal";
import { environments } from "@/lib/content/world";
import { notes as setNotes } from "@/lib/content/between-takes";
import { videos } from "@/lib/content/videos";

const BASE = "https://lunavale38.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  ) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    // The front door and the two pages written for somebody who has never
    // heard of any of this.
    entry("/", 1.0, "daily"),
    entry("/about", 0.9, "monthly"),
    entry("/twenty-questions", 0.8, "monthly"),

    // The indexes.
    entry("/journal", 0.9, "daily"),
    entry("/browse", 0.8, "weekly"),
    entry("/characters", 0.8, "monthly"),
    entry("/clips", 0.8, "weekly"),
    entry("/world", 0.7, "monthly"),
    entry("/between-takes", 0.6, "weekly"),
    entry("/membership", 0.7, "monthly"),

    // Every scene has a public page: title, synopsis, poster, and for the
    // gated ones a real preview. All of it is meant to be landed on.
    ...videos.filter((v) => !v.hidden).map((v) => entry(`/watch/${v.slug}`, 0.8)),
    /*
      CLIPS, MINUS THE ONES WITH NOTHING PUBLIC ON THEM. This mapped every
      clip until 2026-09-11, which put a members-only explicit clip into the
      sitemap — i.e. submitted it to Google.

      The rule matches the scene line above rather than the journal line. A
      gated SCENE belongs here because it has a real public preview; a gated
      clip with a preview is the same and stays. A gated clip WITHOUT one is a
      closed door, and pointing a crawler at a closed door is the opposite of
      what a sitemap is for.

      And `explicit` is excluded outright, preview or not. Whether an X-rated
      page should be indexed at all is a different question from whether it has
      public content on it, and the answer to this one is no.
    */
    ...clips
      .filter((c) => !c.explicit && !(clipAccess(c) === "premium" && !c.preview))
      .map((c) => entry(`/clips/${c.id}`, 0.7)),
    ...characters.map((c) => entry(`/characters/${c.id}`, 0.7, "monthly")),
    ...environments.map((e) => entry(`/world/${e.slug}`, 0.6, "monthly")),
    ...galleries.map((g) => entry(`/gallery/${g.id}`, 0.6)),
    ...setNotes.map((n) => entry(`/between-takes/${n.id}`, 0.5)),

    // Free entries only — see the note above.
    ...freeEntries().map((e) => entry(`/journal/${e.id}`, 0.8)),
  ];
}
