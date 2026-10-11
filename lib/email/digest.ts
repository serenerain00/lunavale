/**
 * The weekly "what's new" digest — sent automatically, Fridays, when there is
 * something new. Decided by Melissa 2026-10-11: weekly, members plus the
 * email list, sends itself.
 *
 * THIS REVERSES A STANDING DECISION, KNOWINGLY. scripts/announce.ts says "run
 * by hand, no cron, no every Friday", because a mailer that fires itself is a
 * schedule the site has to keep. The reason it changed: by October 26 items
 * had gone up in three weeks and exactly one email had gone out, and the
 * leading reason members gave for cancelling was "I don't use it enough"
 * (docs/retention/WIN_BACK_PLAN.md). The promise this makes is narrow on
 * purpose — "if something went up, you'll hear on Friday" — and it is still
 * silent in a week with nothing new.
 *
 * EACH PERSON GETS WHAT IS NEW TO THEM. The window for one address starts at
 * the last email we sent it (any campaign — the win-back, an announcement, a
 * previous digest), or when they joined or signed up, whichever is later, and
 * never more than 30 days back. Nobody is told twice about the same scene, and
 * nobody who got the win-back on Monday gets the same list again on Friday.
 * An address with nothing new in its window is skipped.
 *
 * SAFE BY CONSTRUCTION, the same guarantees as announce.ts:
 *   - nothing sends unless DIGEST_ENABLED=1 (the off switch is unsetting it)
 *   - opt-outs and unsubscribed followers are dropped (lib/db/email-list.ts)
 *   - every send is recorded under `digest-<date>`; a re-run skips them all
 *   - sendBulk() refuses any mail without an unsubscribe link
 *   - replies go to Melissa (OWNER_EMAIL), and she gets a summary each run
 */
import "server-only";
import { neon } from "@neondatabase/serverless";
import { releases, type Release } from "@/lib/content/releases";
import { compose } from "@/lib/email/announce";
import { send, sendBulk } from "@/lib/email/send";
import { unsubscribeUrl } from "@/lib/email/unsubscribe";
import { alreadySent, normalise, recordSent, suppressed } from "@/lib/db/email-list";

const MAX_LOOKBACK_DAYS = 30;

export function digestEnabled(): boolean {
  return process.env.DIGEST_ENABLED === "1";
}

export interface DigestSummary {
  campaign: string;
  enabled: boolean;
  sent: boolean;
  members: number;
  followers: number;
  suppressed: number;
  alreadyGotThis: number;
  nothingNew: number;
  recipients: number;
  delivered: number;
  failed: string[];
}

interface Person {
  email: string;
  audience: "member" | "follower";
  /** YYYY-MM-DD: joined (member) or signed up (follower). */
  since: string;
}

const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

/** Members with access today, with a verified primary address from Clerk. */
type Db = ReturnType<typeof neon<false, false>>;

async function members(db: Db): Promise<Person[]> {
  const rows = (await db`
    SELECT user_id, created_at FROM memberships
    WHERE status IN ('active', 'trialing')
      AND (current_period_end IS NULL OR current_period_end > now())
  `) as { user_id: string; created_at: string }[];
  if (rows.length === 0) return [];

  // LIVE directory. In production CLERK_SECRET_KEY is the live key; on a
  // laptop it is the test one, so the _LIVE override wins when present.
  // See announce.ts for the incident that taught this.
  const key = process.env.CLERK_SECRET_KEY_LIVE ?? process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("No Clerk secret key");
  const joined = new Map(rows.map((r) => [r.user_id, day(r.created_at)]));
  const out: Person[] = [];
  for (let i = 0; i < rows.length; i += 100) {
    const qs = rows.slice(i, i + 100).map((r) => `user_id=${encodeURIComponent(r.user_id)}`).join("&");
    const res = await fetch(`https://api.clerk.com/v1/users?limit=100&${qs}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Clerk ${res.status}`);
    const users = (await res.json()) as {
      id: string;
      primary_email_address_id: string | null;
      email_addresses: { id: string; email_address: string; verification: { status: string } | null }[];
    }[];
    for (const u of users) {
      const p = u.email_addresses.find((e) => e.id === u.primary_email_address_id);
      if (!p || p.verification?.status !== "verified") continue;
      out.push({ email: normalise(p.email_address), audience: "member", since: joined.get(u.id)! });
    }
  }
  return out;
}

async function followers(db: Db): Promise<Person[]> {
  const rows = (await db`
    SELECT email, created_at FROM followers WHERE unsubscribed_at IS NULL
  `) as { email: string; created_at: string }[];
  return rows.map((r) => ({ email: normalise(r.email), audience: "follower" as const, since: day(r.created_at) }));
}

/**
 * Run the digest. With `send: false` it resolves everything and sends
 * nothing; the summary says what would have happened.
 */
export async function runDigest(opts: { send: boolean; now?: Date; base?: string }): Promise<DigestSummary> {
  const now = opts.now ?? new Date();
  const today = day(now);
  const base = opts.base ?? process.env.SITE_URL ?? "https://lunavale38.com";
  const campaign = `digest-${today}`;
  const db = neon(process.env.DATABASE_URL!);

  const [m, f] = await Promise.all([members(db), followers(db)]);
  // A member who is also on the list gets the member version, once.
  const byEmail = new Map<string, Person>();
  for (const p of [...f, ...m]) byEmail.set(p.email, p);
  const everyone = [...byEmail.values()];
  const addrs = everyone.map((p) => p.email);

  const [off, done, last] = await Promise.all([
    suppressed(addrs),
    alreadySent(campaign, addrs),
    db`SELECT email, max(sent_at) AS t FROM email_sends WHERE email = ANY(${addrs}) GROUP BY email`.then(
      (rows) => rows as { email: string; t: string }[],
    ),
  ]);
  const lastSent = new Map(last.map((r) => [r.email, day(r.t)]));
  const floor = day(new Date(now.getTime() - MAX_LOOKBACK_DAYS * 864e5));
  // Posts stay out, as in announce.ts: the copy is not written for them.
  const feed = releases().filter((r) => r.kind !== "post" && r.date <= today);

  const summary: DigestSummary = {
    campaign,
    enabled: digestEnabled(),
    sent: false,
    members: m.length,
    followers: f.length,
    suppressed: 0,
    alreadyGotThis: 0,
    nothingNew: 0,
    recipients: 0,
    delivered: 0,
    failed: [],
  };

  const plan: { person: Person; items: Release[]; from: string }[] = [];
  for (const p of everyone) {
    if (off.has(p.email)) { summary.suppressed += 1; continue; }
    if (done.has(p.email)) { summary.alreadyGotThis += 1; continue; }
    // ">=" on the last-sent day: a scene that went up the same afternoon as
    // an email must not fall through the gap; repeating one is the lesser harm.
    const from = [lastSent.get(p.email), p.since, floor].filter(Boolean).sort().at(-1)!;
    const items = feed.filter((r) => r.date >= from);
    if (items.length === 0) { summary.nothingNew += 1; continue; }
    plan.push({ person: p, items, from });
  }
  summary.recipients = plan.length;

  if (!opts.send || !summary.enabled || plan.length === 0) return summary;
  summary.sent = true;

  for (const { person, items, from } of plan) {
    const unsub = unsubscribeUrl(base, person.email);
    const mail = compose(items, base, unsub, { shown: 8, countedFrom: from, audience: person.audience });
    const res = await sendBulk({
      to: person.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      replyTo: process.env.OWNER_EMAIL,
      unsubscribeUrl: unsub,
    });
    if (res.ok) {
      await recordSent(campaign, person.email);
      summary.delivered += 1;
    } else {
      summary.failed.push(res.error ?? "unknown");
    }
    // Resend's default limit is 2 a second.
    await new Promise((r) => setTimeout(r, 600));
  }

  // Melissa's copy: what went out, so a self-sending mailer is never silent.
  const owner = process.env.OWNER_EMAIL;
  if (owner) {
    await send({
      to: owner,
      subject: `Digest sent: ${summary.delivered} of ${summary.recipients}`,
      text: [
        `The weekly digest (${campaign}) went out.`,
        "",
        `Delivered: ${summary.delivered} of ${summary.recipients}`,
        `Skipped: ${summary.nothingNew} with nothing new, ${summary.suppressed} unsubscribed, ${summary.alreadyGotThis} already had it`,
        `Members: ${summary.members}, email list: ${summary.followers}`,
        ...(summary.failed.length ? ["", `Failed: ${summary.failed.length}`, ...summary.failed.slice(0, 5)] : []),
        "",
        "To stop the weekly digest: remove DIGEST_ENABLED in Vercel (Settings → Environment Variables).",
      ].join("\n"),
    });
  }
  return summary;
}
