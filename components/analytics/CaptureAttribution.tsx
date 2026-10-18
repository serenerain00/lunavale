/**
 * Records where this visit came from, once, on arrival. Renders nothing,
 * sends nothing — it only writes the two first-party cookies described in
 * lib/analytics/attribution.ts, which checkout later reads.
 *
 * Client-side on purpose: the pages are static and served from the CDN, and
 * doing this in middleware would put a function invocation in front of every
 * request, bots included — the exact cost that the August 2026 bill was.
 */
"use client";

import { useEffect } from "react";
import {
  FIRST_TOUCH_COOKIE,
  FIRST_TOUCH_DAYS,
  LAST_TOUCH_COOKIE,
  LAST_TOUCH_DAYS,
  encodeTouch,
  touchFrom,
} from "@/lib/analytics/attribution";

function setCookie(name: string, value: string, days: number) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}`;
}

export function CaptureAttribution() {
  useEffect(() => {
    try {
      const touch = touchFrom(
        location.href,
        document.referrer,
        navigator.userAgent,
        new Date().toISOString().slice(0, 10),
      );
      if (!touch) return;
      const value = encodeTouch(touch);
      if (!document.cookie.includes(`${FIRST_TOUCH_COOKIE}=`)) {
        setCookie(FIRST_TOUCH_COOKIE, value, FIRST_TOUCH_DAYS);
      }
      // "Direct" (no referrer) fills an empty slot but never replaces a real
      // source: somebody who came from Facebook and later types the address
      // still came from Facebook.
      if (touch.s === "direct" && document.cookie.includes(`${LAST_TOUCH_COOKIE}=`)) return;
      setCookie(LAST_TOUCH_COOKIE, value, LAST_TOUCH_DAYS);
    } catch {
      // Cookies blocked: the visit is simply unattributed.
    }
  }, []);
  return null;
}
