"use server";

/**
 * Sending a help message.
 *
 * No account required: someone who can't sign in is exactly the person most
 * likely to need this, so gating it behind auth would lock out the case it
 * exists for. That means spam is the trade — handled with a honeypot and hard
 * length limits rather than a captcha, which taxes every honest sender to stop
 * a problem that does not exist yet at this traffic.
 */

import { MAX_BODY, MAX_SUBJECT } from "@/lib/content/help";
import {
  addHelpMessage,
  databaseConfigured,
  forwardToOwner,
} from "@/lib/db/help";
import { authConfigured } from "@/lib/billing/provider";

export interface HelpResult {
  ok: boolean;
  error?: string;
}

export async function sendHelp(formData: FormData): Promise<HelpResult> {
  if (!databaseConfigured()) {
    return { ok: false, error: "Messages aren't reaching us right now." };
  }

  // Honeypot: a field no human sees and no human fills. Silently reports
  // success — telling a bot it was caught only teaches it to try again.
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const replyTo = String(formData.get("replyTo") ?? "").trim();

  if (!body) return { ok: false, error: "Tell us what's up first." };
  if (body.length > MAX_BODY) {
    return { ok: false, error: `That's longer than ${MAX_BODY} characters.` };
  }
  if (subject.length > MAX_SUBJECT) {
    return { ok: false, error: "That subject is too long." };
  }
  // Shape only. Bouncing a real address over a strict pattern costs more than
  // accepting the occasional typo, which is visible on the message anyway.
  if (replyTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    return { ok: false, error: "That email address doesn't look right." };
  }

  let userId: string | null = null;
  if (authConfigured()) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      userId = (await auth()).userId;
    } catch {
      userId = null;
    }
  }

  const finalSubject = subject || "No subject";
  await addHelpMessage({ replyTo: replyTo || null, userId, subject: finalSubject, body });
  // Saved first, forwarded second — a mail outage must never lose the message.
  await forwardToOwner({ subject: finalSubject, body, replyTo });

  return { ok: true };
}
