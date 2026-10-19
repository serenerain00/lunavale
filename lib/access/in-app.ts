/**
 * Facebook's and Instagram's in-app browsers.
 *
 * WHY THIS EXISTS (2026-10-18). Most of the Facebook launch arrived inside the
 * Facebook app's own browser, and so does anyone who taps a link in an
 * Instagram bio. Google refuses to sign anybody in from inside an embedded app
 * browser (its "disallowed_useragent" error), so "Continue with Google" there
 * is a dead end — on the page a new member reaches seconds after paying. Two
 * of the seven people who paid that day had not managed to make an account.
 *
 * Detected from the user agent, which both apps set on purpose: FBAN/FBAV for
 * Facebook, "Instagram" for Instagram.
 */
export function inAppBrowser(userAgent: string | null | undefined): "facebook" | "instagram" | null {
  const ua = userAgent ?? "";
  if (/Instagram/.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/.test(ua)) return "facebook";
  return null;
}
