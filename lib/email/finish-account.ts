/**
 * "One step left" — the reminder to somebody who paid and has not made an
 * account. Sent automatically from 2026-10-18, an hour after payment, once.
 *
 * WHY. Since 2026-08-27 checkout runs before sign-up, so a buyer can pay and
 * close the tab. On 2026-10-18 two of the seven people who paid that day had
 * no account hours later; Melissa approved this exact email and it was sent to
 * both by hand, then asked for it to happen on its own ("ok do all of the
 * above"). The words are hers-approved; change them only with her.
 *
 * ONCE PER ADDRESS, EVER: any email_sends row whose campaign starts with
 * "finish-account" (the hand-sent one was "finish-account-2026-10-18") stops a
 * second one. And it re-checks, at send time, that the payment is still
 * unclaimed, still active, and that no Clerk account exists for the address —
 * so somebody who signs up at minute 59 gets nothing.
 *
 * THE LINK carries the paid Checkout Session, so the claim works even if they
 * sign up with a different address or with Google (app/welcome/page.tsx).
 * Transactional, about something they bought — no marketing, no unsubscribe
 * needed, and none offered. Replies go to OWNER_EMAIL, a person.
 */
import "server-only";
import { neon } from "@neondatabase/serverless";
import { stripe } from "@/lib/billing/stripe";
import { send } from "@/lib/email/send";
import { autoMade } from "@/lib/billing/auto-account";
import { claimPendingBySubscription } from "@/lib/db/memberships";

export const CAMPAIGN = "finish-account";
const SITE = process.env.SITE_URL ?? "https://lunavale38.com";

export function composeFinishAccount(firstName: string | null, link: string) {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  const subject = "One step left to start watching Between Us";
  const text = `${hi}

Thank you for joining Between Us — your membership is paid for and active.

There's one step left: create your account, and every episode and scene unlocks.

Finish setting up your account:
${link}

The link is tied to your purchase, so it works whether you sign up with this email address or continue with Google or Apple.

If anything gets in the way, just reply to this email and I'll sort it out personally.

Melissa
Creator, Between Us`;
  const html = `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#222;max-width:520px">
<p>${escape(hi)}</p>
<p>Thank you for joining <em>Between Us</em> — your membership is paid for and active.</p>
<p>There's one step left: create your account, and every episode and scene unlocks.</p>
<p><a href="${link}" style="display:inline-block;background:#b8862f;color:#111;padding:10px 18px;border-radius:3px;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:15px">Finish setting up your account →</a></p>
<p>The link is tied to your purchase, so it works whether you sign up with this email address or continue with Google or Apple.</p>
<p>If anything gets in the way, just reply to this email and I'll sort it out personally.</p>
<p>Melissa<br>Creator, <em>Between Us</em></p></div>`;
  return { subject, text, html };
}

function escape(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/** First word of a Stripe customer name, if it looks like a name. */
function firstNameOf(name: string | null | undefined): string | null {
  const w = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return /^[A-Za-z][A-Za-z'’-]{1,20}$/.test(w) ? w[0].toUpperCase() + w.slice(1).toLowerCase() : null;
}

async function clerkAccount(email: string): Promise<{ id: string; madeFor: string | null } | null> {
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const users = await client.users.getUserList({ emailAddress: [email], limit: 1 });
  const user = users.data[0];
  if (!user) return null;
  return { id: user.id, madeFor: autoMade(user)?.subscription ?? null };
}

export interface FinishAccountSummary {
  candidates: number;
  sent: string[];
  skipped: { reason: string }[];
  failed: number;
  dry: boolean;
}

export async function runFinishAccount({ send: doSend }: { send: boolean }): Promise<FinishAccountSummary> {
  const db = neon(process.env.DATABASE_URL!);
  // Paid at least an hour ago, at most a week ago; unclaimed; still active.
  const rows = (await db`
    SELECT email, stripe_subscription_id
    FROM pending_memberships
    WHERE claimed_at IS NULL
      AND status IN ('active', 'trialing')
      AND created_at < now() - interval '1 hour'
      AND created_at > now() - interval '7 days'
      AND NOT EXISTS (
        SELECT 1 FROM email_sends s
        WHERE s.email = pending_memberships.email AND s.campaign LIKE ${CAMPAIGN + "%"}
      )
  `) as { email: string; stripe_subscription_id: string | null }[];

  const out: FinishAccountSummary = { candidates: rows.length, sent: [], skipped: [], failed: 0, dry: !doSend };
  for (const r of rows) {
    if (!r.stripe_subscription_id) {
      out.skipped.push({ reason: "no subscription id" });
      continue;
    }
    const account = await clerkAccount(r.email);
    if (account) {
      // Made by /welcome for exactly this payment (lib/billing/auto-account.ts),
      // and the webhook landed after they had gone: attach it here rather than
      // wait for their next visit. Matched on the subscription the account was
      // made for, never on the address alone.
      if (doSend && account.madeFor && account.madeFor === r.stripe_subscription_id) {
        await claimPendingBySubscription(account.id, r.stripe_subscription_id);
        out.skipped.push({ reason: "account made at checkout; payment attached" });
      } else {
        out.skipped.push({ reason: "already has an account" });
      }
      continue;
    }
    const sessions = await stripe().checkout.sessions.list({ subscription: r.stripe_subscription_id, limit: 1 });
    const session = sessions.data[0];
    if (!session || session.status !== "complete") {
      out.skipped.push({ reason: "no completed checkout session" });
      continue;
    }
    const claim = `/membership/claim?session_id=${encodeURIComponent(session.id)}`;
    const link = `${SITE}/sign-up?redirect_url=${encodeURIComponent(claim)}&email=${encodeURIComponent(r.email)}`;
    const mail = composeFinishAccount(firstNameOf(session.customer_details?.name), link);
    if (!doSend) {
      out.sent.push("(dry)");
      continue;
    }
    const res = await send({ to: r.email, ...mail, replyTo: process.env.OWNER_EMAIL || null });
    if (!res.ok) {
      console.error("finish-account send failed", res.error);
      out.failed += 1;
      continue;
    }
    await db`INSERT INTO email_sends (campaign, email) VALUES (${CAMPAIGN}, ${r.email})`;
    out.sent.push(res.id ?? "sent");
  }
  return out;
}
