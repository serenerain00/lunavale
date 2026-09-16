/**
 * apply-schema.mjs — put lib/db/schema.sql into the database.
 *
 * WHY THIS EXISTS. docs/architecture/BILLING_SETUP.md tells you to run the
 * schema with psql, and psql is not installed on this machine. The Neon driver
 * already is, so this is the same job with no new tooling.
 *
 * THE SCHEMA IS IDEMPOTENT — every statement in it is CREATE TABLE IF NOT
 * EXISTS, CREATE INDEX IF NOT EXISTS or ADD COLUMN IF NOT EXISTS — so running
 * this against a live database is additive and safe to repeat. It creates what
 * is missing and leaves everything else alone. It never drops anything.
 *
 * Usage:
 *   vercel env pull .env.local
 *   node --env-file=.env.local scripts/apply-schema.mjs
 *   node --env-file=.env.local scripts/apply-schema.mjs --dry-run
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { neon } from "@neondatabase/serverless";

const ROOT = path.join(import.meta.dirname, "..");
const dryRun = process.argv.includes("--dry-run");

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set.\n" +
      "Run `vercel env pull .env.local`, then:\n" +
      "  node --env-file=.env.local scripts/apply-schema.mjs",
  );
  process.exit(1);
}

const text = await readFile(path.join(ROOT, "lib/db/schema.sql"), "utf8");

/**
 * Split into statements. Safe here because the schema is plain DDL — no
 * functions, no triggers, no dollar-quoting (checked before this was written).
 * Comments are stripped first so a semicolon inside one cannot split anything.
 */
const statements = text
  .split("\n")
  .filter((line) => !line.trimStart().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`${statements.length} statements in lib/db/schema.sql`);
if (dryRun) {
  for (const s of statements) console.log(`  ${s.split("\n")[0].slice(0, 78)}…`);
  process.exit(0);
}

const sql = neon(process.env.DATABASE_URL);
let applied = 0;
for (const statement of statements) {
  const head = statement.split("\n")[0].slice(0, 70);
  try {
    await sql.query(statement);
    applied += 1;
    console.log(`  ok   ${head}`);
  } catch (error) {
    console.error(`  FAIL ${head}\n       ${error.message}`);
    process.exit(1);
  }
}
console.log(`\n${applied} statements applied.`);
