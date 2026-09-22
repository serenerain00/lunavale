/**
 * announce.ts — tell members there is something new.
 *
 * WHY IT EXISTS. Four of the first fourteen memberships cancelled inside a
 * week, and the site's answer to "is anything happening here" was a rail on
 * the home page that you had to come back to see. Nothing on this site has
 * ever gone out to the people paying for it. This is the smallest honest
 * version of that: what went up, with links, when Melissa decides to send it.
 *
 * IT IS RUN BY HAND, AND THAT IS THE DESIGN. No cron, no "every Friday", no
 * trigger on publish. lib/content/releases.ts refuses to promise a schedule
 * the site cannot keep, and a mailer that fires itself is that promise with a
 * bill attached.
 *
 * DRY RUN BY DEFAULT. With no --send it renders the exact email, resolves the
 * exact recipients, and sends nothing. Given what the failure looks like —
 * mail that has already arrived — the safe default is the only default.
 *
 * WHO GETS IT. Everybody with access right now, which deliberately includes
 * members who have cancelled and are running out their period. They paid, they
 * can still open everything, and they are the people most worth telling that
 * the thing they were waiting for has arrived. Anyone who opted out is
 * removed, and anyone this exact announcement already reached is skipped.
 *
 * Usage:
 *   npx tsx scripts/announce.ts                      # dry run, last 14 days
 *   npx tsx scripts/announce.ts --since=2026-09-01   # explicit window
 *   npx tsx scripts/announce.ts --show=5             # list 5, count the rest
 *   npx tsx scripts/announce.ts --to=me@example.com  # dry run at one address
 *   npx tsx scripts/announce.ts --to=me@example.com --send   # real test send
 *   npx tsx scripts/announce.ts --send               # the real thing
 *
 * Environment (all required for --send):
 *   DATABASE_URL     the memberships table and the opt-out list
 *   CLERK_SECRET_KEY_LIVE  members' addresses. MUST be the live key — the test
 *                    instance is a different directory and contains none of
 *                    your actual members. Falls back to CLERK_SECRET_KEY,
 *                    which on a laptop is the test key.
 *   RESEND_API_KEY   the mail provider
 *   MAIL_FROM        e.g. "Luna Vale <hello@lunavale38.com>", on a domain
 *                    verified in Resend — an unverified from-address is how a
 *                    first send lands every member in spam at once
 *   MAIL_SECRET      signs unsubscribe links; see lib/email/unsubscribe.ts
 *   OWNER_EMAIL      where replies go. Optional, and you want it set: people
 *                    reply to mail from a person, and without it the reply
 *                    goes to MAIL_FROM — which is usually a send-only address
 *                    nobody reads, so the reply is silently lost.
 *   SITE_URL         defaults to https://lunavale38.com
 */

import process from "node:process";
import { neon } from "@neondatabase/serverless";
import { releases, type Release } from "@/lib/content/releases";
import { compose, campaignId } from "@/lib/email/announce";
import { unsubscribeUrl, unsubscribeConfigured } from "@/lib/email/unsubscribe";

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit?.slice(name.length + 3);
};
const send = argv.includes("--send");
const only = flag("to");
const base = process.env.SITE_URL ?? "https://lunavale38.com";

function die(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/* ---------------------------------------------------------------- what ---- */

/**
 * The window. Defaults to the last fourteen days, which is long enough to be
 * worth an email and short enough that nothing in it feels like old news.
 */
const since =
  flag("since") ??
  new Date(Date.now() - 14 * 86_400_000).toISOString().slice(0, 10);

const included: Release[] = releases().filter((r) => r.date >= since);
if (included.length === 0) {
  die(`Nothing published since ${since}. Nothing to announce.`);
}

const campaign = campaignId(included);

/* ----------------------------------------------------------------- who ---- */

/**
 * Members who can open things today.
 *
 * Read from the local projection rather than from Stripe, because that is what
 * the site itself reads to decide access — see lib/access/entitlement.ts. If
 * the two ever disagree the answer is to run reconcile-billing.mjs, not to
 * give this script its own opinion about who is a member.
 *
 * `cancel_at_period_end` is deliberately NOT filtered on. See the header.
 */
async function memberUserIds(): Promise<string[]> {
  const url = process.env.DATABASE_URL;
  if (!url) die("DATABASE_URL is not set.");
  const sql = neon(url);
  const rows = (await sql`
    SELECT user_id FROM memberships
    WHERE status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  `) as { user_id: string }[];
  return rows.map((r) => r.user_id);
}

/**
 * Addresses, from Clerk.
 *
 * Only the VERIFIED primary address, and only that one. An unverified address
 * on somebody's account is an address they typed, not one they proved they
 * own, and mailing it means mailing whoever actually has it.
 */
async function addressesFor(userIds: string[]): Promise<Map<string, string>> {
  /*
   * LIVE KEY FIRST, and this is not a nicety — it is the difference between
   * sending and silently sending to nobody.
   *
   * Clerk's test and live instances are separate directories with separate
   * user ids. `.env.local` holds the TEST key, because that is what the dev
   * server needs and because live Clerk keys are domain-locked and will not
   * run on localhost. So this script, run from a laptop, was asking the TEST
   * instance for the ids of members who exist only in the LIVE one — and got
   * nothing back for every single one.
   *
   * It did not send anything wrong. It reported "14 without a verified primary
   * address" and sent zero, which is the right failure. But "no verified
   * address" and "wrong directory" look identical from here, so the message
   * below now says which key it used.
   *
   * Same convention as STRIPE_SECRET_KEY_LIVE, which exists for exactly this
   * reason.
   */
  const key = process.env.CLERK_SECRET_KEY_LIVE ?? process.env.CLERK_SECRET_KEY;
  if (!key) die("No CLERK_SECRET_KEY_LIVE or CLERK_SECRET_KEY — cannot resolve addresses.");
  const live = key.startsWith("sk_live_");
  console.log(`  resolving addresses against the ${live ? "LIVE" : "TEST"} Clerk instance`);
  if (!live) {
    console.log(
      "  WARNING: that is the test directory. Real members live in the live one.\n" +
        "  Set CLERK_SECRET_KEY_LIVE in .env.local or this will find nobody.",
    );
  }

  const out = new Map<string, string>();
  // Clerk's list endpoint takes repeated user_id params; 100 at a time is well
  // inside its limits and this list is nowhere near that.
  for (let i = 0; i < userIds.length; i += 100) {
    const batch = userIds.slice(i, i + 100);
    const qs = batch.map((id) => `user_id=${encodeURIComponent(id)}`).join("&");
    const res = await fetch(`https://api.clerk.com/v1/users?limit=100&${qs}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      die(`Clerk returned ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
    const users = (await res.json()) as {
      id: string;
      primary_email_address_id: string | null;
      email_addresses: {
        id: string;
        email_address: string;
        verification: { status: string } | null;
      }[];
    }[];
    for (const u of users) {
      const primary = u.email_addresses.find(
        (e) => e.id === u.primary_email_address_id,
      );
      if (!primary) continue;
      if (primary.verification?.status !== "verified") continue;
      out.set(u.id, primary.email_address.trim().toLowerCase());
    }
  }
  return out;
}

async function suppressedAndSent(
  addrs: string[],
): Promise<{ off: Set<string>; done: Set<string> }> {
  const sql = neon(process.env.DATABASE_URL!);
  const offRows = (await sql`
    SELECT email FROM email_optouts WHERE email = ANY(${addrs})
    UNION
    SELECT email FROM followers
      WHERE email = ANY(${addrs}) AND unsubscribed_at IS NOT NULL
  `) as { email: string }[];
  const doneRows = (await sql`
    SELECT email FROM email_sends
    WHERE campaign = ${campaign} AND email = ANY(${addrs})
  `) as { email: string }[];
  return {
    off: new Set(offRows.map((r) => r.email)),
    done: new Set(doneRows.map((r) => r.email)),
  };
}

/* ---------------------------------------------------------------- send ---- */

/**
 * One Resend call, written out here rather than imported from
 * lib/email/send.ts, which is `server-only` and cannot be loaded outside the
 * Next runtime. The duplicated part is an HTTP POST; the parts where
 * duplication would actually cause a bug — the copy and the unsubscribe
 * signature — are imported and shared.
 */
async function deliver(to: string, subject: string, text: string, html: string, unsub: string) {
  // Replies go to a human. See OWNER_EMAIL above.
  const replyTo = process.env.OWNER_EMAIL;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html,
      reply_to: replyTo || undefined,
      headers: {
        "List-Unsubscribe": `<${unsub}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
}

/* ----------------------------------------------------------------- run ---- */

async function main() {
  if (!unsubscribeConfigured()) {
    die(
      "MAIL_SECRET is not set. Without it the unsubscribe links cannot be\n" +
        "  signed, and mail nobody can get off is worse than no mail at all.",
    );
  }

  if (!process.env.OWNER_EMAIL) {
    console.log(
      "\n  NOTE: OWNER_EMAIL is not set, so replies will go to MAIL_FROM.\n" +
        "  If that is a send-only address, replies are lost silently.",
    );
  }

  console.log(`\n  Since ${since} — ${included.length} release(s)`);
  console.log(`  Campaign ${campaign}\n`);
  for (const r of included) {
    console.log(`    ${r.date}  ${r.access === "free" ? "free  " : "member"}  ${r.title}`);
  }

  // The preview is rendered against a real signed link so that what is printed
  // is byte-for-byte what a recipient would get.
  const sample = only ?? "preview@example.com";
  const mail = compose(included, base, unsubscribeUrl(base, sample), {
    shown: Number(flag("show") ?? 8),
    countedFrom: since,
  });
  console.log(`\n  Subject: ${mail.subject}`);
  console.log("  ---");
  console.log(mail.text.split("\n").map((l) => `  ${l}`).join("\n"));
  console.log("  ---\n");

  // --to addresses one person and asks Clerk and the membership table nothing.
  // It is how you send yourself the real email before sending it to customers.
  let recipients: string[];
  if (only) {
    recipients = [only.trim().toLowerCase()];
  } else {
    const ids = await memberUserIds();
    const byId = await addressesFor(ids);
    const all = [...new Set(byId.values())];
    const missing = ids.length - byId.size;
    const { off, done } = await suppressedAndSent(all);
    recipients = all.filter((a) => !off.has(a) && !done.has(a));

    console.log(`  ${ids.length} member(s) with access`);
    if (missing > 0) {
      console.log(`  ${missing} without a verified primary address — skipped`);
    }
    if (off.size) console.log(`  ${off.size} opted out — skipped`);
    if (done.size) console.log(`  ${done.size} already got this one — skipped`);
  }

  console.log(`  ${recipients.length} to send to`);

  if (!send) {
    console.log("\n  Dry run. Nothing was sent. Add --send to send it.\n");
    return;
  }
  if (!process.env.RESEND_API_KEY) die("RESEND_API_KEY is not set.");
  if (!process.env.MAIL_FROM) die("MAIL_FROM is not set.");
  if (recipients.length === 0) {
    console.log("\n  Nobody to send to.\n");
    return;
  }

  const sql = neon(process.env.DATABASE_URL!);
  let sent = 0;
  const failures: string[] = [];

  for (const to of recipients) {
    const unsub = unsubscribeUrl(base, to);
    const m = compose(included, base, unsub, {
      shown: Number(flag("show") ?? 8),
      countedFrom: since,
    });
    try {
      await deliver(to, m.subject, m.text, m.html, unsub);
      // Recorded per address, immediately, so an interrupted run leaves a
      // truthful record of exactly what got out. --to sends are not recorded:
      // a test to yourself must not make the real send think it is done.
      if (!only) {
        await sql`
          INSERT INTO email_sends (campaign, email) VALUES (${campaign}, ${to})
          ON CONFLICT (campaign, email) DO NOTHING
        `;
      }
      sent += 1;
      console.log(`    sent  ${to}`);
    } catch (err) {
      failures.push(`${to}: ${err}`);
      console.error(`    FAIL  ${to} — ${err}`);
    }
    // Resend's default rate limit is 2/second. Slower than it needs to be, and
    // it costs seconds on a list this size.
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\n  ${sent} sent, ${failures.length} failed.`);
  if (failures.length) {
    console.log("  Re-running sends only to the ones that failed.\n");
  } else {
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
