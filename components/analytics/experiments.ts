/**
 * Browser half of the A/B registry in lib/analytics/experiments.ts:
 * assignment (a first-party cookie) and once-per-browser event counting.
 *
 * Plain functions, not a hook, because the moments that need them are event
 * handlers (a preview ending, a page view) rather than renders — and nothing
 * here may run during a server render or a static build.
 */
"use client";

import {
  AB_COOKIE,
  AB_COOKIE_DAYS,
  EXPERIMENTS,
  experimentLive,
  parseAssignments,
  serializeAssignments,
} from "@/lib/analytics/experiments";

function readCookie(): Record<string, string> {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${AB_COOKIE}=([^;]*)`));
    return parseAssignments(m?.[1]);
  } catch {
    return {};
  }
}

/**
 * This browser's variant, assigning one at random the first time it is asked
 * while the experiment is live. Null when the experiment is not live, so
 * callers fall back to today's behaviour without a second code path.
 */
export function assignVariant(id: string): string | null {
  const e = EXPERIMENTS[id];
  if (!e || !experimentLive(e)) return null;
  const current = readCookie();
  if (current[id]) return current[id];
  const variant = e.variants[Math.floor(Math.random() * e.variants.length)];
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AB_COOKIE}=${serializeAssignments({ ...current, [id]: variant })}; Max-Age=${AB_COOKIE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Cookies blocked: they see the control and are not counted.
    return null;
  }
  return readCookie()[id] ?? null;
}

/** The variant already assigned, without assigning one. */
export function currentVariant(id: string): string | null {
  const e = EXPERIMENTS[id];
  if (!e || !experimentLive(e)) return null;
  return readCookie()[id] ?? null;
}

/**
 * Count one event for this browser's variant — once per browser, ever, so
 * the server's counts approximate people rather than page loads. Silently
 * nothing when not assigned or not live.
 */
export function trackOnce(id: string, event: string): void {
  const variant = currentVariant(id);
  if (!variant || !EXPERIMENTS[id].events.includes(event)) return;
  const key = `${AB_COOKIE}:${id}:${event}`;
  try {
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch {
    // No storage: count it anyway; an occasional double is the lesser error.
  }
  try {
    navigator.sendBeacon("/api/ab", JSON.stringify({ experiment: id, variant, event }));
  } catch {}
}

/** Fire `event` for every live experiment this browser is in. */
export function trackAll(event: string): void {
  for (const id of Object.keys(readCookie())) trackOnce(id, event);
}
