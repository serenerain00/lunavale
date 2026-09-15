/**
 * The unsubscribe link, and the proof that it belongs to the person clicking.
 *
 * THE PROBLEM WITH THE OBVIOUS VERSION. `/unsubscribe?email=you@example.com`
 * works, and it also lets anybody unsubscribe anybody by typing an address
 * into a URL bar. That is not a theoretical attack on a list this size — it is
 * a thing one annoyed person can do to every address they can guess, silently,
 * and the only way we would find out is that mail stopped arriving.
 *
 * SO THE LINK CARRIES A SIGNATURE. HMAC-SHA256 of the lower-cased address
 * under MAIL_SECRET, truncated to 128 bits and base64url'd. Stateless — no
 * token table, no expiry to get wrong, and the same address always produces
 * the same link, so a person who forwards an old email still lands somewhere
 * that works.
 *
 * NO MAIL_SECRET, NO MAIL. tokenFor() throws rather than falling back to an
 * unsigned link, and the announcement script checks for it before it starts.
 * The failure mode of a missing secret must be "nothing was sent", never "it
 * was sent with a link that does not work" — an unsubscribe link that 400s is
 * worse than no email at all, because the person now wants off and cannot get
 * off.
 *
 * ROTATING THE SECRET INVALIDATES EVERY LINK IN EVERY EMAIL ALREADY SENT.
 * Don't, unless it leaks. The suppression list itself is in the database and
 * survives rotation; it is only the links in old mail that break.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.MAIL_SECRET;
  if (!s) throw new Error("MAIL_SECRET is not set");
  return s;
}

/** Whether links can be signed at all. */
export function unsubscribeConfigured(): boolean {
  return Boolean(process.env.MAIL_SECRET);
}

export function tokenFor(email: string): string {
  return createHmac("sha256", secret())
    .update(email.trim().toLowerCase())
    .digest("base64url")
    .slice(0, 22);
}

/**
 * Constant-time check. The comparison is on short base64 strings where a
 * length mismatch is already public, so the only thing worth protecting is the
 * byte-by-byte comparison itself.
 */
export function tokenValid(email: string, token: string): boolean {
  if (!unsubscribeConfigured()) return false;
  let expected: string;
  try {
    expected = tokenFor(email);
  } catch {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * The full link to put in an email.
 *
 * `base` is passed in rather than read from the environment because the two
 * callers differ: the site knows its own URL from a request, and the
 * announcement script is told one on the command line. A link built against
 * the wrong host is an unsubscribe that silently does nothing.
 */
export function unsubscribeUrl(base: string, email: string): string {
  const addr = email.trim().toLowerCase();
  const u = new URL("/unsubscribe", base);
  u.searchParams.set("e", addr);
  u.searchParams.set("t", tokenFor(addr));
  return u.toString();
}
