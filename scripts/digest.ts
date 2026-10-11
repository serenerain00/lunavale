/**
 * digest.ts — see what this week's digest would do, from a laptop.
 *
 * The digest sends itself on Fridays (app/api/cron/digest, lib/email/digest.ts).
 * This is the dry run: it resolves the same recipients against live Clerk and
 * the live database and prints the counts. It never sends.
 *
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/digest.ts
 *   npx tsx --conditions=react-server --env-file=.env.local scripts/digest.ts --date=2026-10-16
 */
import { runDigest } from "../lib/email/digest";

const date = process.argv.find((a) => a.startsWith("--date="))?.slice(7);
runDigest({ send: false, now: date ? new Date(`${date}T14:00:00Z`) : undefined })
  .then((s) => console.log(JSON.stringify(s, null, 2)))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
