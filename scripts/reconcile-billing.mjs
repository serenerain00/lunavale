/**
 * reconcile-billing.mjs — make the memberships table agree with Stripe.
 *
 * WHY IT EXISTS. The webhook is the normal path and it is fine going forward,
 * but it only ever runs on NEW events. When it has a bug, every subscription
 * it mishandled stays wrong in the database until something goes back and
 * looks — and the whole problem with a billing table that disagrees with
 * Stripe is that nothing looks wrong. It just quietly shows the owner ten
 * happy members.
 *
 * That is exactly what happened: from 2026-08-28 the webhook read only
 * `cancel_at_period_end` and every cancellation on this site used `cancel_at`
 * instead, so four departures were recorded as renewals.
 *
 * STRIPE IS THE SOURCE OF TRUTH for status, period end and whether somebody is
 * leaving. This copies those three fields onto the matching row and touches
 * nothing else — it never creates a membership, never grants access, and never
 * writes to Stripe.
 *
 * Usage:
 *   node --env-file=.env.local scripts/reconcile-billing.mjs --dry-run
 *   node --env-file=.env.local scripts/reconcile-billing.mjs
 *   node --env-file=.env.local scripts/reconcile-billing.mjs --live   # live keys
 */

import process from "node:process";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

const dryRun = process.argv.includes("--dry-run");
const useLive = process.argv.includes("--live");

const key = useLive
  ? process.env.STRIPE_SECRET_KEY_LIVE
  : process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error(
    `No ${useLive ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY"}. Run:\n` +
      "  node --env-file=.env.local scripts/reconcile-billing.mjs",
  );
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const stripe = new Stripe(key);
const sql = neon(process.env.DATABASE_URL);

/** Same rule as the webhook's isLeaving(). Keep the two in step. */
const leaving = (s) => s.cancel_at_period_end === true || s.cancel_at != null;

/** Period end moved onto the subscription item in recent API versions. */
const periodEnd = (s) =>
  s.items?.data?.[0]?.current_period_end ?? s.current_period_end ?? null;

const subs = (await stripe.subscriptions.list({ status: "all", limit: 100 }))
  .data;
const rows = await sql`
  SELECT user_id, stripe_subscription_id, status, cancel_at_period_end,
         current_period_end
  FROM memberships
`;
const byId = new Map(rows.map((r) => [r.stripe_subscription_id, r]));

console.log(
  `${subs.length} subscription(s) in Stripe (${useLive ? "live" : "test"}), ` +
    `${rows.length} row(s) in memberships\n`,
);

let changed = 0;
for (const s of subs) {
  const row = byId.get(s.id);
  if (!row) {
    console.log(`  no local row for ${s.id} — skipped (this never creates one)`);
    continue;
  }
  const wantLeaving = leaving(s);
  const wantEnd = periodEnd(s) ? new Date(periodEnd(s) * 1000) : null;
  const haveEnd = row.current_period_end
    ? new Date(row.current_period_end)
    : null;

  const diffs = [];
  if (row.status !== s.status) diffs.push(`status ${row.status} -> ${s.status}`);
  if ((row.cancel_at_period_end === true) !== wantLeaving)
    diffs.push(`leaving ${row.cancel_at_period_end === true} -> ${wantLeaving}`);
  if (
    (wantEnd?.getTime() ?? null) !== (haveEnd?.getTime() ?? null) &&
    wantEnd !== null
  )
    diffs.push(
      `ends ${haveEnd?.toISOString().slice(0, 10) ?? "—"} -> ${wantEnd.toISOString().slice(0, 10)}`,
    );

  if (!diffs.length) continue;
  changed += 1;
  console.log(`  ${s.id}  ${diffs.join(", ")}`);
  if (dryRun) continue;

  await sql`
    UPDATE memberships
    SET status = ${s.status},
        cancel_at_period_end = ${wantLeaving},
        current_period_end = ${wantEnd},
        updated_at = now()
    WHERE stripe_subscription_id = ${s.id}
  `;
}

console.log(
  `\n${changed} row(s) ${dryRun ? "would change" : "updated"}, ` +
    `${subs.length - changed} already correct.`,
);
