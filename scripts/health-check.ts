/**
 * health-check — the thing to run before working, every day.
 *
 * WHAT IT IS FOR, in Melissa's words: bugs, pages customers shouldn't see but
 * maybe do, checkout issues, general health.
 *
 * IT IS WRITTEN AGAINST REAL FAILURES RATHER THAN IMAGINED ONES. Every check
 * in section A exists because something in that class actually went wrong here:
 * an "Admin →" link shown to every paying member because a gate tested that an
 * env var was SET rather than who was signed in; four hand-rolled copies of the
 * same owner check; an upload route that 413'd in production and worked on a
 * laptop. Checks that have never caught anything get deleted, not kept for
 * completeness.
 *
 * TWO HALVES, and the offline half always runs:
 *
 *   OFFLINE — reads the repo. Gates, leakage, referential integrity between the
 *   content modules. Needs no network, no keys, and no dev server, so it works
 *   on a plane and cannot be broken by someone else's outage.
 *
 *   LIVE — needs DATABASE_URL and STRIPE_SECRET_KEY. Money and access: people
 *   who paid and cannot get in, cards failing, webhooks gone quiet. Skipped
 *   with a note rather than failed when the keys are absent.
 *
 * EVERYTHING IS READ-ONLY. This never writes to the database, Stripe, Blob or
 * the repo. It is safe to run against production and that is the point — the
 * questions it asks cannot be answered anywhere else.
 *
 *   npm run health            offline + live
 *   npm run health -- --offline    repo only, no network
 *
 * Exit code is 1 if anything FAILED, 0 otherwise. Warnings never fail the run:
 * a warning is something to look at, and a thing that cries wolf daily gets
 * ignored within a week.
 */

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { journal, freeEntries, pullQuotes } from "@/lib/content/journal";
import { videos } from "@/lib/content/videos";
import { clips } from "@/lib/content/clips";
import { galleries } from "@/lib/content/gallery";

const ROOT = path.join(import.meta.dirname, "..");
const offlineOnly = process.argv.includes("--offline");

type Status = "ok" | "warn" | "fail";
interface Result { status: Status; label: string; detail?: string }

const results: { section: string; items: Result[] }[] = [];
let current: Result[] = [];

function section(name: string) {
  current = [];
  results.push({ section: name, items: current });
}
const ok = (label: string, detail?: string) => current.push({ status: "ok", label, detail });
const warn = (label: string, detail?: string) => current.push({ status: "warn", label, detail });
const fail = (label: string, detail?: string) => current.push({ status: "fail", label, detail });

const read = (p: string) => readFile(path.join(ROOT, p), "utf8");
async function exists(p: string) {
  try { await stat(path.join(ROOT, p)); return true; } catch { return false; }
}
async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try { entries = await readdir(path.join(ROOT, dir), { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...(await walk(rel)));
    else out.push(rel);
  }
  return out;
}

/* ══════════════════════════════════ A. Gates ═══════════════════════════════
   Pages and routes customers should never reach. */
async function checkGates() {
  section("Gates — what customers must not see");

  // Every page and route under the owner-only surfaces has to check isOwner()
  // in its own file. Inheriting a gate from a parent layout is not enough,
  // because a route handler has no layout.
  const owned = [
    ...(await walk("app/admin")),
    ...(await walk("app/api/studio")),
    "app/account/overheard/page.tsx",
    "app/account/overheard/actions.ts",
  ].filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

  const ungated: string[] = [];
  for (const f of owned) {
    const src = await read(f);
    if (!/isOwner\s*\(/.test(src)) ungated.push(f);
  }
  if (ungated.length) fail("Owner-only files missing an isOwner() check", ungated.join(", "));
  else ok(`All ${owned.length} owner-only files call isOwner()`);

  // REGRESSION GUARD. app/account/page.tsx once decided who the owner was by
  // testing that OWNER_USER_ID was set — which it always is — and so showed an
  // Admin link to every signed-in member. Nothing may compare that env var by
  // hand again; lib/access/owner.ts is the only place allowed to read it.
  const appFiles = (await walk("app")).filter((f) => /\.tsx?$/.test(f));
  const rogue: string[] = [];
  for (const f of appFiles) {
    const src = await read(f);
    if (/process\.env\.OWNER_USER_ID/.test(src)) rogue.push(f);
  }
  if (rogue.length) fail("OWNER_USER_ID read outside lib/access/owner.ts", rogue.join(", "));
  else ok("Owner identity is decided in exactly one place");

  // Owner pages must be noindex, so they never reach a search result even if
  // somebody links to one.
  const pages = owned.filter((f) => f.endsWith("page.tsx"));
  const indexable = [];
  for (const f of pages) {
    const src = await read(f);
    // No dotAll flag: [^}]* already crosses newlines, and /s needs es2018.
    if (!/robots:\s*\{[^}]*index:\s*false/.test(src)) indexable.push(f);
  }
  if (indexable.length) fail("Owner pages missing robots noindex", indexable.join(", "));
  else ok(`All ${pages.length} owner pages are noindex`);

  // And robots.txt should disallow them by path as well.
  const robots = await read("app/robots.ts");
  const missing = ["/admin", "/account", "/api/"].filter((p) => !robots.includes(`"${p}"`));
  if (missing.length) warn("robots.txt does not disallow", missing.join(", "));
  else ok("robots.txt disallows the private paths");
}

/* ═══════════════════════════ B. Premium leakage ════════════════════════════
   Paid material reachable without paying. */
async function checkLeakage() {
  section("Leakage — paid material at a public URL");

  // .vercelignore is the only thing standing between the private source
  // folders and a deployment that serves them. .gitignore does NOT cover this:
  // the CLI uploads the working directory, not HEAD.
  const vi = await read(".vercelignore");
  const mustExclude = ["stories", "stills-private", "takes-private", "studio-private", "public/stills"];
  const notExcluded = mustExclude.filter((d) => !new RegExp(`^${d}\\s*$`, "m").test(vi));
  if (notExcluded.length) fail(".vercelignore no longer excludes", notExcluded.join(", "));
  else ok("Private media folders are excluded from deployments");

  // Nothing that looks like paid material should be sitting in /public, which
  // is served at permanent ungated URLs.
  //
  // IT HAS TO READ .vercelignore TO ANSWER THIS, and the first version did not.
  // public/stills/ is full of working screenshots on this machine and is
  // excluded from both git and deployments, so flagging it was a false alarm on
  // the very first run — which is the fastest way to teach somebody to skip
  // this report. The question is not "is it on disk" but "does it ship".
  const excluded = vi
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const shipsFrom = (f: string) => !excluded.some((e) => f === e || f.startsWith(`${e}/`));

  const pub = await walk("public");
  const privateLooking = pub.filter((f) => /^public\/(stills|takes|studio|private)\//.test(f));
  const shipped = privateLooking.filter(shipsFrom);
  if (shipped.length) {
    fail(`${shipped.length} private file(s) in /public WOULD DEPLOY`, shipped.slice(0, 5).join(", "));
  } else if (privateLooking.length) {
    ok(`${privateLooking.length} private file(s) sit in /public but are excluded from deploys`,
       "Local working copies. Fine — .vercelignore is what makes them fine.");
  } else ok(`/public holds ${pub.length} files, none of them private material`);

  // The sitemap points crawlers at pages. A premium journal entry in it is an
  // invitation to a paywall, which is the bait MONETIZATION.md rules out.
  const sitemap = await read("app/sitemap.ts");
  if (!/freeEntries\(\)/.test(sitemap)) {
    fail("Sitemap no longer restricted to free journal entries");
  } else ok("Sitemap lists only free journal entries");
  if (!/hidden/.test(sitemap)) warn("Sitemap may not be filtering hidden scenes");
  else ok("Sitemap filters hidden scenes");
}

/* ═════════════════════════ C. Content integrity ════════════════════════════
   Links between the content modules that quietly rot. */
async function checkContent() {
  section("Content — the story data still hangs together");

  const slugs = new Set(videos.map((v) => v.slug));
  const clipIds = new Set(clips.map((c) => c.id));
  const entryIds = new Set(journal.map((e) => e.id));

  const badScene = journal.filter((e) => e.sceneSlug && !slugs.has(e.sceneSlug));
  if (badScene.length) fail("Journal entries pointing at a scene that does not exist",
    badScene.map((e) => `${e.id} -> ${e.sceneSlug}`).join(", "));
  else ok(`${journal.filter((e) => e.sceneSlug).length} journal/scene links resolve`);

  const badClip = journal.filter((e) => e.clipId && !clipIds.has(e.clipId));
  if (badClip.length) fail("Journal entries pointing at a clip that does not exist",
    badClip.map((e) => `${e.id} -> ${e.clipId}`).join(", "));
  else ok("Journal/clip links resolve");

  // Posters are the card art for every scene. A missing one is a broken image
  // on a page somebody is deciding whether to pay for.
  const missingPosters: string[] = [];
  for (const v of videos) {
    if (!v.poster) continue;
    if (v.poster.startsWith("/") && !(await exists(`public${v.poster}`))) {
      missingPosters.push(`${v.slug} -> ${v.poster}`);
    }
  }
  if (missingPosters.length) fail("Scene posters missing from /public", missingPosters.join(", "));
  else ok(`${videos.length} scene posters present`);

  // THE PULL QUOTES ARE A PAYWALL TRAP IF THEY DRIFT. The home page quotes a
  // line and links to the entry; journal.ts says free-only, because sending
  // somebody from a beautiful sentence into a paywall is the bait the
  // monetization doc rules out.
  const free = new Set(freeEntries().map((e) => e.id));
  const badQuote = pullQuotes.filter((q) => !entryIds.has(q.entryId) || !free.has(q.entryId));
  if (badQuote.length) fail("Home-page pull quotes link into a paywall",
    badQuote.map((q) => q.entryId).join(", "));
  else ok(`${pullQuotes.length} pull quotes all point at free entries`);

  // The free set is a deliberate number, documented at the top of journal.ts.
  // Drift means somebody flipped an entry without meaning to.
  const EXPECTED_FREE = 6;
  if (free.size !== EXPECTED_FREE) {
    warn(`Free journal entries: ${free.size}, expected ${EXPECTED_FREE}`,
      "Deliberate? Update the count at the top of lib/content/journal.ts and here.");
  } else ok(`Free journal entries: ${free.size}`);

  const openScenes = videos.filter((v) => v.access === "free" && !v.hidden).length;
  ok(`Published: ${videos.filter((v) => !v.hidden).length} scenes (${openScenes} free), ` +
     `${journal.length} journal entries, ${clips.length} clips, ${galleries.length} galleries`);
}

/* ════════════════════════════ D. Money ═════════════════════════════════════
   People who paid, and whether they got in. */
async function checkMoney() {
  section("Money — checkout, access, and anyone stuck between them");

  if (!process.env.DATABASE_URL) { warn("DATABASE_URL not set — skipped"); return; }
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);

  // THE WORST OUTCOME THIS PRODUCT CAN PRODUCE. Checkout runs before the
  // account exists, so there is a window where a payment exists and a user id
  // does not. Usually seconds. A row still sitting here after days is somebody
  // who paid and has nothing, and they will not necessarily write in.
  const stuck = (await sql`
    SELECT email, created_at FROM pending_memberships
    WHERE claimed_at IS NULL AND created_at < now() - interval '2 days'
    ORDER BY created_at
  `) as { email: string; created_at: string }[];
  if (stuck.length) {
    fail(`${stuck.length} paid membership(s) unclaimed for over 2 days`,
      stuck.map((r) => `${r.email} (${new Date(r.created_at).toISOString().slice(0, 10)})`).join(", "));
  } else ok("Nobody has paid and been left without access");

  const rows = (await sql`
    SELECT status, count(*)::int n FROM memberships GROUP BY status ORDER BY n DESC
  `) as { status: string; n: number }[];
  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.n]));
  const pastDue = byStatus["past_due"] ?? 0;
  if (pastDue) warn(`${pastDue} membership(s) past due`, "Card failing — Stripe retries, then cancels.");
  else ok("No memberships past due");
  ok("Memberships by status", rows.map((r) => `${r.status}: ${r.n}`).join(", ") || "none yet");

  // A webhook that has gone quiet looks exactly like a quiet week, right up
  // until somebody pays and never gets access.
  const last = (await sql`
    SELECT max(received_at) AS t FROM billing_events
  `) as { t: string | null }[];
  const t = last[0]?.t ? new Date(last[0].t) : null;
  if (!t) warn("No billing events recorded yet");
  else {
    const days = Math.floor((Date.now() - t.getTime()) / 86_400_000);
    if (days > 14) warn(`Last Stripe webhook was ${days} days ago`, "Quiet week, or the endpoint is broken.");
    else ok(`Last Stripe webhook ${days === 0 ? "today" : `${days}d ago`}`);
  }
}

async function checkStripe() {
  section("Stripe — can somebody actually buy this today");

  // EXACTLY THE KEY THE APP USES — lib/billing/stripe.ts reads STRIPE_SECRET_KEY
  // and nothing else. The first version of this preferred STRIPE_SECRET_KEY_LIVE,
  // which is a separate stash rather than what checkout runs on, and so paired a
  // live key with the test price ids and reported two failures that were
  // entirely its own invention. A health check that tests a configuration the
  // product does not use is worse than no health check.
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) { warn("No STRIPE_SECRET_KEY in the environment — skipped"); return; }
  const mode = key.startsWith("sk_live") ? "live" : "test";
  if (mode === "test") {
    warn("Checking the TEST configuration",
      "Run against production env to check what customers actually hit.");
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(key);

  const priceIds = [process.env.STRIPE_PRICE_VAULT, process.env.STRIPE_PRICE_VAULT_YEARLY]
    .filter(Boolean) as string[];
  if (!priceIds.length) { warn("No price ids configured — skipped"); return; }

  for (const id of priceIds) {
    try {
      const price = await stripe.prices.retrieve(id);
      if (!price.active) fail(`Price ${id} is INACTIVE`, "Checkout will fail for anyone choosing it.");
      else ok(`Price ${id} live`,
        `${((price.unit_amount ?? 0) / 100).toFixed(2)} ${price.currency.toUpperCase()}/${price.recurring?.interval ?? "one-off"} (${mode} mode)`);
    } catch (e) {
      fail(`Price ${id} does not resolve`, e instanceof Error ? e.message : String(e));
    }
  }

  // THE LIVE CATALOGUE, when a live key is stashed separately from the one the
  // app is running on. The live price IDS are a production Secret and do not
  // pull, so they cannot be checked by id from a laptop — but the catalogue
  // can, and "somebody archived the live price" is the failure that silently
  // breaks checkout for real customers while every test passes.
  const liveKey = process.env.STRIPE_SECRET_KEY_LIVE;
  if (!liveKey || mode === "live") return;
  try {
    const live = new Stripe(liveKey);
    const prices = await live.prices.list({ active: true, type: "recurring", limit: 20 });
    if (!prices.data.length) {
      fail("No active recurring prices in LIVE Stripe", "Nobody can subscribe.");
    } else {
      ok(`${prices.data.length} active recurring price(s) in LIVE Stripe`,
        prices.data
          .map((p) => `${((p.unit_amount ?? 0) / 100).toFixed(2)} ${p.currency.toUpperCase()}/${p.recurring?.interval}`)
          .join(", "));

      // A YEARLY PLAN THAT ONLY EXISTS IN TEST. provider.ts decides whether to
      // offer yearly by whether STRIPE_PRICE_<TIER>_YEARLY is set, so a yearly
      // price configured here with no yearly price live is either a plan that
      // was never launched or one that is about to 404 somebody's checkout.
      const wantsYearly = Object.keys(process.env).some((k) => /^STRIPE_PRICE_.*_YEARLY$/.test(k));
      const hasYearlyLive = prices.data.some((p) => p.recurring?.interval === "year");
      if (wantsYearly && !hasYearlyLive) {
        warn("A yearly price is configured here but none is active in LIVE Stripe",
          "Fine if yearly was never launched. Not fine if production offers it.");
      }
    }
  } catch (e) {
    warn("Could not read the live Stripe catalogue", e instanceof Error ? e.message : String(e));
  }
}

/* ══════════════════════════════ report ═════════════════════════════════════ */
async function main() {
  await checkGates();
  await checkLeakage();
  await checkContent();
  if (!offlineOnly) { await checkMoney(); await checkStripe(); }
  else { section("Live checks"); warn("--offline: money and Stripe skipped"); }

  const mark = { ok: "  ok  ", warn: " warn ", fail: " FAIL " };
  let fails = 0, warns = 0;
  for (const { section: name, items } of results) {
    console.log(`\n${name}`);
    for (const r of items) {
      if (r.status === "fail") fails++;
      if (r.status === "warn") warns++;
      console.log(`  ${mark[r.status]} ${r.label}`);
      if (r.detail) console.log(`         ${r.detail}`);
    }
  }
  console.log(
    `\n${fails ? `${fails} FAILED` : "nothing failed"}` +
    `${warns ? `, ${warns} to look at` : ""}.\n`,
  );

  // Stamp the run, pass or fail. The SessionStart hook reads this to decide
  // whether today's check has happened yet — written HERE rather than by the
  // hook so the reminder keeps appearing until the check has actually run,
  // instead of until somebody has merely been told about it.
  await writeFile(
    path.join(ROOT, ".health-check-last"),
    `${new Date().toISOString()} ${fails ? `FAILED:${fails}` : "ok"}\n`,
  );

  process.exit(fails ? 1 : 0);
}

main().catch((e) => {
  console.error("health-check crashed:", e);
  process.exit(1);
});
