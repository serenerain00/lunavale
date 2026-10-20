/**
 * log-billing.mjs — write one line to the billing log that /admin shows.
 *
 * Run it every time a money action is taken by hand: a refund, a cancel, a
 * voided invoice, two logins linked, an email about any of those. Melissa
 * reads the log on /admin instead of having to ask (2026-10-20).
 *
 *   node --env-file=.env.local scripts/log-billing.mjs \
 *     --kind=refund --who="Andrea" --amount=882 --refs="re_…" \
 *     --summary="Refunded her second payment — she was charged twice."
 *
 * kind: refund | cancel | void | link | email | note
 */
import process from "node:process";
import { neon } from "@neondatabase/serverless";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const kind = arg("kind"), who = arg("who"), summary = arg("summary");
const KINDS = ["refund", "cancel", "void", "link", "email", "note"];
if (!KINDS.includes(kind) || !who || !summary) {
  console.error(`Need --kind=(${KINDS.join("|")}) --who=… --summary=…  [--amount=cents] [--refs=…] [--at=ISO]`);
  process.exit(1);
}
const amount = arg("amount") ? Number(arg("amount")) : null;
const sql = neon(process.env.DATABASE_URL);
const at = arg("at") ?? new Date().toISOString();
await sql`INSERT INTO billing_actions (at, kind, who, summary, amount_cents, refs)
          VALUES (${at}, ${kind}, ${who}, ${summary}, ${amount}, ${arg("refs") ?? null})`;
console.log(`logged ${kind} · ${who}`);
