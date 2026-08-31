/**
 * /robots.txt — the crawl rules, served as a real static file.
 *
 * WHY THIS FILE EXISTS AT ALL. Until now there was no robots.txt and no
 * public/robots.txt either, so /robots.txt fell through to the app's dynamic
 * 404 — which meant every crawler that asked for it was answered by a
 * serverless function rendering a full HTML error page. A file whose entire
 * job is to be cheap was the most expensive possible response.
 *
 * Next builds this at build time (nothing dynamic is read below), so it is
 * served from the CDN and costs a function invocation only when the cache is
 * cold.
 *
 * WHAT IT CAN AND CANNOT DO. robots.txt is a request, not a wall. Google,
 * Bing and the other well-behaved crawlers honor it; the traffic that ran the
 * August 2026 bill to $420 — roughly 25 requests per second, sustained, at a
 * point when the site had two members — was largely the kind that does not.
 * The enforcement for those lives in the Vercel firewall (BotID / Attack
 * Challenge Mode), not here. This file handles the honest half.
 *
 * INDEXING IS DELIBERATELY LEFT OPEN for real search engines. The site wants
 * to be found; what it does not want is to be crawled by everything, forever,
 * including the parts that cost money to render.
 */
import type { MetadataRoute } from "next";

/**
 * Paths no crawler has any business in.
 *
 * /api/* is the expensive surface — every one of these is a function
 * invocation, and /api/stream and /api/still additionally reach Blob. The
 * rest are per-viewer pages that are worthless in an index and dynamic by
 * nature, so a crawler walking them is pure cost with no upside.
 */
const OFF_LIMITS = [
  "/api/",
  "/account",
  "/admin",
  "/preview",
  "/welcome",
  "/sign-in",
  "/sign-up",
  "/membership/start",
  "/membership/claim",
];

/**
 * Crawlers that take content for model training or resale scraping.
 *
 * Blocking these is Melissa's call to make and the default here is to block:
 * Luna Vale is original work that is being sold, and the whole premise of the
 * membership is that the deeper material is worth paying for. Handing the free
 * half to a scraper for free is a choice, and it should be an explicit one.
 *
 * Removing a name from this list re-opens it to that crawler. Adding a name
 * costs nothing.
 */
const SCRAPERS = [
  // AI training / retrieval
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "FacebookBot",
  "Bytespider",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
  "Diffbot",
  "omgili",
  "omgilibot",
  "Timpibot",
  "YouBot",
  "ImagesiftBot",
  // SEO / commercial crawlers with no benefit to a site like this one
  "AhrefsBot",
  "SemrushBot",
  "DataForSeoBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "PetalBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Everyone else, including Googlebot and Bingbot.
        userAgent: "*",
        allow: "/",
        disallow: OFF_LIMITS,
        // Honored by Bing, Yandex and most well-behaved crawlers; ignored by
        // Google, which is rate-limited from Search Console instead. Ten
        // seconds is generous for a site of this size and still caps a single
        // crawler at ~8,600 requests a day rather than millions.
        crawlDelay: 10,
      },
      {
        userAgent: SCRAPERS,
        disallow: "/",
      },
    ],
    host: "https://lunavale38.com",
  };
}
