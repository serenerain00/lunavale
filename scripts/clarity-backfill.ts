/**
 * clarity-backfill.ts — load the local Clarity snapshots into traffic_daily.
 *
 * The daily cron only starts counting the day it is deployed. Before that,
 * a launchd job on Melissa's Mac had been saving Clarity's raw answers to
 * ~/lunavale-analytics/clarity/snapshots/<day>/ — this turns each of those
 * into the same summarized row the cron writes, so the baseline starts from
 * the first snapshot rather than from deploy day.
 *
 * Reads overall.json, source.json and source_url.json; a snapshot without all
 * three is skipped and named. Idempotent: a day already stored is overwritten
 * with the same numbers. Spends no Clarity requests.
 *
 * Usage:
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/clarity-backfill.ts [--dry-run] [dir]
 *
 * --conditions=react-server is what lets the lib/ modules' `server-only`
 * import load outside Next.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { summarize } from "../lib/analytics/clarity";
import { saveTrafficDay } from "../lib/db/funnel";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dir =
  args.find((a) => !a.startsWith("--")) ??
  path.join(os.homedir(), "lunavale-analytics/clarity/snapshots");

const json = async (f: string) => JSON.parse(await readFile(f, "utf8"));

async function main() {
  for (const day of (await readdir(dir)).sort()) {
    const d = path.join(dir, day);
    const files = [
      "meta.json",
      "overall.json",
      "source.json",
      "source_url.json",
    ].map((f) => path.join(d, f));
    if (!files.every(existsSync)) {
      console.log(`${day}: skipped — needs overall, source and source_url`);
      continue;
    }
    const [meta, overall, source, sourceUrl] = await Promise.all(
      files.map(json),
    );
    // The snapshot's window ends when it was fetched; file it under that UTC day.
    const endDay = String(meta.fetchedAt).slice(0, 10);
    const data = summarize(overall, source, sourceUrl);
    console.log(
      `${endDay}: ${meta.numOfDays}d, ${data.sessions} sessions, ${data.instagram.sessions} from Instagram${dryRun ? " (dry run)" : ""}`,
    );
    if (!dryRun) await saveTrafficDay(endDay, meta.numOfDays, data);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
