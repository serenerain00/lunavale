"use client";

import { useEffect } from "react";
import { PAID_COOKIE, PAID_COOKIE_MAX_AGE } from "@/lib/billing/paid-cookie";

/**
 * Remembers, on this browser, that it has already paid. Read by
 * /membership/start so Join sends a paid-but-no-account visitor back to their
 * payment rather than to a second checkout. Renders nothing.
 */
export function RememberPayment({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    const secure = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${PAID_COOKIE}=${encodeURIComponent(sessionId)}; path=/; max-age=${PAID_COOKIE_MAX_AGE}; samesite=lax${secure}`;
  }, [sessionId]);
  return null;
}
