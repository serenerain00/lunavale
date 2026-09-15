"use server";

/**
 * Taking an address off the list.
 *
 * WHY THIS IS A POST AND NOT A LINK. The unsubscribe URL in an email is
 * fetched by things that are not the recipient: corporate link scanners,
 * spam filters, Outlook's Safe Links, and every preview crawler. If the GET
 * did the unsubscribing, a proportion of people would be silently removed by
 * software on their own behalf and would never know why the mail stopped. So
 * the link opens a page with a button, and the button is what removes them.
 *
 * The one exception is the RFC 8058 one-click header, handled in
 * app/api/unsubscribe/route.ts. That POST comes from the mail client because
 * the person pressed "Unsubscribe" in it, which is a real decision by a real
 * person — the thing this file is protecting.
 */

import { optOut, databaseConfigured } from "@/lib/db/email-list";
import { tokenValid } from "@/lib/email/unsubscribe";

export interface UnsubscribeResult {
  ok: boolean;
  error?: string;
}

export async function unsubscribe(
  formData: FormData,
): Promise<UnsubscribeResult> {
  const email = String(formData.get("e") ?? "");
  const token = String(formData.get("t") ?? "");

  // Same answer for a bad signature as for a missing one, and no hint about
  // which. There is nothing to gain by helping somebody probe this.
  if (!email || !tokenValid(email, token)) {
    return { ok: false, error: "That link isn't valid. " };
  }
  if (!databaseConfigured()) {
    return { ok: false, error: "That isn't reaching us right now." };
  }

  try {
    await optOut(email);
    return { ok: true };
  } catch (err) {
    console.error("unsubscribe failed", err);
    return { ok: false, error: "That didn't go through." };
  }
}
