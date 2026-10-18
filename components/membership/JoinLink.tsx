"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackAll } from "@/components/analytics/experiments";
import { clarityEvent } from "@/components/analytics/clarity";

/**
 * A link to /membership that reports the tap — to Clarity ("join_click") and
 * to any live A/B test that counts it. 2026-10-18; until then a Join tap was
 * invisible except as Clarity's own guess.
 */
export function JoinLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="/membership"
      className={className}
      onClick={() => {
        clarityEvent("join_click");
        trackAll("join_click");
      }}
    >
      {children}
    </Link>
  );
}
