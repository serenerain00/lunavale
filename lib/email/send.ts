/**
 * The one place this site sends mail from.
 *
 * WHY IT EXISTS. Until now there was exactly one caller — help.ts forwarding a
 * message to Melissa — and the Resend call lived inline inside it. A second
 * caller (the release announcement) makes that a problem rather than a style
 * question, because the two differ in the one way that matters: a help
 * forward goes to Melissa's own inbox and needs no unsubscribe link, and an
 * announcement goes to customers and must never be sent without one. Put both
 * through one door and the door can enforce it.
 *
 * STILL PLAIN FETCH, NOT THE SDK. One HTTP call, one less dependency, and the
 * request body is legible to anyone reading this file.
 *
 * FAILURE IS RETURNED, NOT THROWN. help.ts swallows a failure on purpose: the
 * message is already saved and a mail outage must not become an error page for
 * a visitor. The announcement script needs the opposite — it has to know
 * exactly which addresses got through, so it can record those and only those.
 * Returning a result serves both; throwing would serve neither.
 */

import "server-only";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | null;
  /**
   * The URL that takes this recipient off the list, for the List-Unsubscribe
   * header as well as the body.
   *
   * REQUIRED FOR ANYTHING THAT IS NOT A REPLY TO THE RECIPIENT. See
   * sendBulk(), which will not send without it. It is optional here only so
   * that help.ts can forward Melissa her own mail.
   */
  unsubscribeUrl?: string;
}

export interface SendResult {
  ok: boolean;
  /** Resend's message id, when it accepted the mail. */
  id?: string;
  /** Why not, for the log and for the operator watching a script run. */
  error?: string;
}

/** Whether a provider and a from-address are configured. */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && fromAddress());
}

/**
 * Who it comes from.
 *
 * HELP_FROM_EMAIL is the existing variable and stays the default so that
 * nothing about help forwarding changes. MAIL_FROM overrides it, because the
 * address an announcement should come from ("Luna Vale <hello@lunavale38.com>")
 * is not necessarily the one a help forward comes from.
 */
export function fromAddress(): string | undefined {
  return process.env.MAIL_FROM ?? process.env.HELP_FROM_EMAIL;
}

export async function send(mail: Mail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = fromAddress();
  if (!key || !from) {
    return { ok: false, error: "RESEND_API_KEY or MAIL_FROM is not set" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        reply_to: mail.replyTo || undefined,
        // Both forms. The header is what Gmail and Apple Mail turn into the
        // one-click "Unsubscribe" button beside the sender's name, which is
        // the control people actually reach for; without it they reach for
        // "Report spam" instead, and that costs the domain rather than the
        // list. One-click needs the POST form to be declared too.
        headers: mail.unsubscribeUrl
          ? {
              "List-Unsubscribe": `<${mail.unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            }
          : undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `${res.status} ${body.slice(0, 200)}` };
    }
    const json = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: json.id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Send to somebody who is not Melissa.
 *
 * THE ONLY DIFFERENCE FROM send() IS THAT THIS ONE REFUSES. No unsubscribe
 * URL, no mail. It is a guard rather than a convention because the failure it
 * prevents — a customer with no way off a list — is not the kind that shows up
 * in testing, and the person it happens to cannot fix it.
 */
export async function sendBulk(mail: Mail): Promise<SendResult> {
  if (!mail.unsubscribeUrl) {
    return { ok: false, error: "refused: bulk mail needs an unsubscribe URL" };
  }
  return send(mail);
}
