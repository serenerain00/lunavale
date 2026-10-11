/**
 * winback.ts — the October 2026 win-back email, run by hand.
 *
 * Plan, data and approvals: docs/retention/WIN_BACK_PLAN.md. Copy:
 * lib/email/winback.ts. Recap: lib/content/recaps.ts (approved 2026-10-11).
 *
 *   Group A  members who switched renewal off and still have access.
 *            Source: the memberships table — the same record the site reads
 *            for access. Addresses from LIVE Clerk.
 *   Group B  memberships that have already ended, since 2026-09-01.
 *            Source: live Stripe, which still has the email after the access
 *            row is gone. Anyone who has since rejoined, or who is in group
 *            A, is left out.
 *
 * Built like scripts/announce.ts, deliberately, and with the same guarantees:
 *   - DRY RUN BY DEFAULT. Without --send it prints the exact email and the
 *     recipient count, and sends nothing.
 *   - Opt-outs are honoured (email_optouts, and unsubscribed followers).
 *   - email_sends records every address per campaign, so a re-run, a crash
 *     halfway, or a second terminal can never mail anybody twice.
 *   - Replies go to OWNER_EMAIL, a person.
 *   - --to sends one real email to one address with sample details, and is
 *     NOT recorded, so a test cannot make the real send think it is done.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/winback.ts --group=a
 *   npx tsx --env-file=.env.local scripts/winback.ts --group=a --to=me@x.com --send
 *   npx tsx --env-file=.env.local scripts/winback.ts --group=a --send
 *   (same for --group=b)
 *
 * Environment: DATABASE_URL, CLERK_SECRET_KEY_LIVE, STRIPE_SECRET_KEY_LIVE,
 * RESEND_API_KEY, MAIL_FROM, MAIL_SECRET, OWNER_EMAIL. See announce.ts for
 * why the LIVE Clerk and Stripe keys matter: the test ones contain nobody.
 */

import process from "node:process";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";
import { releases } from "@/lib/content/releases";
import {
  campaignFor,
  composeWinback,
  type WinbackGroup,
  type WinbackPerson,
} from "@/lib/email/winback";
import { unsubscribeConfigured, unsubscribeUrl } from "@/lib/email/unsubscribe";

const argv = process.argv.slice(2);
const flag = (name: string) =>
  argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const send = argv.includes("--send");
const only = flag("to")?.trim().toLowerCase();
const groupArg = flag("group");
const base = process.env.SITE_URL ?? "https://lunavale38.com";
const ENDED_SINCE = "2026-09-01";

function die(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

if (groupArg !== "a" && groupArg !== "b") die("Pass --group=a (leaving, still in) or --group=b (already gone).");
const group: WinbackGroup = groupArg;
const campaign = campaignFor(group);
const day = (d: Date | number) => new Date(d).toISOString().slice(0, 10);

interface Recipient extends WinbackPerson {
  email: string;
}

/* ------------------------------------------------------------- group A ---- */

async function groupA(): Promise<Recipient[]> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = (await sql`
    SELECT user_id, created_at, current_period_end FROM memberships
    WHERE status IN ('active', 'trialing') AND cancel_at_period_end
      AND current_period_end > now()
  `) as { user_id: string; created_at: string; current_period_end: string }[];

  const key = process.env.CLERK_SECRET_KEY_LIVE;
  if (!key?.startsWith("sk_live_")) die("CLERK_SECRET_KEY_LIVE is not a live key; it would find nobody.");

  const out: Recipient[] = [];
  // An empty filter would make Clerk list EVERY user. Nobody leaving, nobody to mail.
  if (rows.length === 0) return out;
  const qs = rows.map((r) => `user_id=${encodeURIComponent(r.user_id)}`).join("&");
  const res = await fetch(`https://api.clerk.com/v1/users?limit=100&${qs}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) die(`Clerk returned ${res.status}`);
  const users = (await res.json()) as {
    id: string;
    first_name: string | null;
    primary_email_address_id: string | null;
    email_addresses: { id: string; email_address: string; verification: { status: string } | null }[];
  }[];
  const byId = new Map(users.map((u) => [u.id, u]));

  for (const r of rows) {
    const u = byId.get(r.user_id);
    const primary = u?.email_addresses.find((e) => e.id === u.primary_email_address_id);
    // Verified primary only — see announce.ts for why.
    if (!primary || primary.verification?.status !== "verified") {
      console.log(`  one member without a verified primary address — skipped`);
      continue;
    }
    out.push({
      email: primary.email_address.trim().toLowerCase(),
      firstName: u?.first_name?.trim() || undefined,
      since: day(new Date(r.created_at)),
      accessUntil: day(new Date(r.current_period_end)),
    });
  }
  return out;
}

/* ------------------------------------------------------------- group B ---- */

async function groupB(exclude: Set<string>): Promise<Recipient[]> {
  const key = process.env.STRIPE_SECRET_KEY_LIVE;
  if (!key?.startsWith("sk_live_")) die("STRIPE_SECRET_KEY_LIVE is not a live key.");
  const stripe = new Stripe(key);

  // Anyone with a live subscription now has come back, or never left.
  const current = new Set<string>();
  for await (const s of stripe.subscriptions.list({ status: "all", limit: 100, expand: ["data.customer"] })) {
    const c = s.customer as Stripe.Customer | Stripe.DeletedCustomer;
    const email = "email" in c ? c.email?.toLowerCase() : undefined;
    if (email && ["active", "trialing", "past_due"].includes(s.status)) current.add(email);
  }

  const byEmail = new Map<string, Recipient>();
  for await (const s of stripe.subscriptions.list({ status: "canceled", limit: 100, expand: ["data.customer"] })) {
    if (!s.ended_at || day(s.ended_at * 1000) < ENDED_SINCE) continue;
    const c = s.customer as Stripe.Customer | Stripe.DeletedCustomer;
    if (!("email" in c) || !c.email) continue;
    const email = c.email.trim().toLowerCase();
    if (current.has(email) || exclude.has(email)) continue;
    const ended = day(s.ended_at * 1000);
    const prev = byEmail.get(email);
    if (prev && prev.since >= ended) continue;
    byEmail.set(email, { email, firstName: c.name?.trim().split(/\s+/)[0] || undefined, since: ended });
  }
  return [...byEmail.values()];
}

/* -------------------------------------------------------------- shared ---- */

async function suppressedAndSent(addrs: string[]) {
  const sql = neon(process.env.DATABASE_URL!);
  const off = (await sql`
    SELECT email FROM email_optouts WHERE email = ANY(${addrs})
    UNION
    SELECT email FROM followers WHERE email = ANY(${addrs}) AND unsubscribed_at IS NOT NULL
  `) as { email: string }[];
  const done = (await sql`
    SELECT email FROM email_sends WHERE campaign = ${campaign} AND email = ANY(${addrs})
  `) as { email: string }[];
  return { off: new Set(off.map((r) => r.email)), done: new Set(done.map((r) => r.email)) };
}

/** One Resend call; see announce.ts for why it is not imported from lib/email/send.ts. */
async function deliver(to: string, subject: string, text: string, html: string, unsub: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
      reply_to: process.env.OWNER_EMAIL || undefined,
      headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
}

async function main() {
  if (!unsubscribeConfigured()) die("MAIL_SECRET is not set; unsubscribe links cannot be signed.");
  if (!process.env.DATABASE_URL) die("DATABASE_URL is not set.");
  const all = releases();

  let recipients: Recipient[];
  if (only) {
    // A test: sample details, so it shows what a real recipient would see
    // without putting anybody else's dates in your inbox.
    recipients = [
      group === "a"
        ? { email: only, firstName: flag("name"), since: "2026-09-26", accessUntil: "2026-10-26" }
        : { email: only, firstName: flag("name"), since: "2026-10-06" },
    ];
  } else {
    const leaving = await groupA();
    const people = group === "a" ? leaving : await groupB(new Set(leaving.map((r) => r.email)));
    const { off, done } = await suppressedAndSent(people.map((p) => p.email));
    recipients = people.filter((p) => !off.has(p.email) && !done.has(p.email));
    console.log(`\n  Group ${group.toUpperCase()}: ${people.length} found`);
    if (off.size) console.log(`  ${off.size} opted out — skipped`);
    if (done.size) console.log(`  ${done.size} already got ${campaign} — skipped`);
    for (const r of recipients) {
      console.log(`    ${r.since}${r.accessUntil ? ` → ${r.accessUntil}` : ""}  ${r.firstName ? "named" : "no name"}`);
    }
  }

  // The preview is the first recipient's real email, printed exactly.
  const first = recipients[0];
  if (first) {
    // Signed for a placeholder address, so a dry run never prints a member's.
    // Name replaced too: the preview shows the shape, not the person.
    const sample = { ...first, firstName: first.firstName ? "{First name}" : undefined };
    const m = composeWinback(group, sample, all, base, unsubscribeUrl(base, "preview@example.com"));
    console.log(`\n  Campaign ${campaign}\n  Subject: ${m.subject}\n  ---`);
    console.log(m.text.split("\n").map((l) => `  ${l}`).join("\n"));
    console.log("  ---");
  }
  console.log(`\n  ${recipients.length} to send to`);

  if (!send) {
    console.log("\n  Dry run. Nothing was sent. Add --send to send it.\n");
    return;
  }
  if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM) die("RESEND_API_KEY and MAIL_FROM are required to send.");

  const sql = neon(process.env.DATABASE_URL);
  let sent = 0;
  for (const r of recipients) {
    const unsub = unsubscribeUrl(base, r.email);
    const m = composeWinback(group, r, all, base, unsub);
    try {
      await deliver(r.email, m.subject, m.text, m.html, unsub);
      if (!only) {
        await sql`
          INSERT INTO email_sends (campaign, email) VALUES (${campaign}, ${r.email})
          ON CONFLICT (campaign, email) DO NOTHING
        `;
      }
      sent += 1;
      console.log(`    sent  ${only ? r.email : "member"}`);
    } catch (err) {
      console.error(`    FAIL  ${err}`);
    }
    await new Promise((res) => setTimeout(res, 600));
  }
  console.log(`\n  ${sent} of ${recipients.length} sent.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
