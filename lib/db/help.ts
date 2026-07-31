/**
 * Help messages — anyone to Melissa, without her address ever being public.
 *
 * The forwarding step is deliberately optional. With RESEND_API_KEY set, a
 * message also lands in her inbox; without it, everything still works and the
 * messages wait on /admin. That means this ships and is useful today rather
 * than being blocked on choosing a mail provider — and nothing is lost either
 * way, because the database is the record and the email is only a nudge.
 */

import "server-only";
import { neon } from "@neondatabase/serverless";

export { MAX_SUBJECT, MAX_BODY } from "@/lib/content/help";

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface HelpMessage {
  id: string;
  replyTo: string | null;
  subject: string;
  body: string;
  handled: boolean;
  createdAt: Date;
}

export async function addHelpMessage(input: {
  replyTo?: string | null;
  userId?: string | null;
  subject: string;
  body: string;
}): Promise<void> {
  if (!databaseConfigured()) throw new Error("DATABASE_URL is not set");
  await sql()`
    INSERT INTO help_messages (reply_to, user_id, subject, body)
    VALUES (${input.replyTo ?? null}, ${input.userId ?? null},
            ${input.subject}, ${input.body})
  `;
}

export async function recentHelpMessages(limit = 50): Promise<HelpMessage[]> {
  if (!databaseConfigured()) return [];
  const rows = (await sql()`
    SELECT id, reply_to, subject, body, handled, created_at
    FROM help_messages
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Array<{
    id: string;
    reply_to: string | null;
    subject: string;
    body: string;
    handled: boolean;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: String(r.id),
    replyTo: r.reply_to,
    subject: r.subject,
    body: r.body,
    handled: r.handled,
    createdAt: new Date(r.created_at),
  }));
}

export async function openHelpCount(): Promise<number> {
  if (!databaseConfigured()) return 0;
  const rows = (await sql()`
    SELECT count(*)::int AS n FROM help_messages WHERE handled = false
  `) as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

export async function setHandled(id: string, handled: boolean): Promise<void> {
  if (!databaseConfigured()) return;
  await sql()`UPDATE help_messages SET handled = ${handled} WHERE id = ${id}`;
}

/**
 * Forward to Melissa, if a provider is configured.
 *
 * Uses Resend's REST API through plain fetch rather than their SDK — one less
 * dependency for one HTTP call. Failure is swallowed on purpose: the message is
 * already saved, and a mail outage must not turn a visitor's "I can't sign in"
 * into an error page. The failure is logged for the server, not the sender.
 */
export async function forwardToOwner(msg: {
  subject: string;
  body: string;
  replyTo?: string | null;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  const from = process.env.HELP_FROM_EMAIL;
  if (!key || !to || !from) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Luna Vale — ${msg.subject}`,
        reply_to: msg.replyTo || undefined,
        text: `${msg.body}\n\n—\nFrom: ${msg.replyTo || "no address given"}\nSee all: https://lunavale38.com/admin`,
      }),
    });
  } catch (err) {
    console.error("help: forward failed", err);
  }
}
