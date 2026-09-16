"use client";

import type { ReactNode } from "react";
import { useViewer } from "@/components/access/Viewer";

/**
 * "Does this viewer already hold this exact tier?" — resolved on the client so
 * that /membership can be a static file.
 *
 * WHY THIS EXISTS (2026-09-09). The membership page called getMembership()
 * once, for one thing: to label a card "Your current tier" instead of showing
 * the buy flow. Reading entitlement during render makes a page dynamic —
 * `no-store`, never cached by the CDN, a serverless invocation for every
 * visitor and every crawler — and it was doing that to the one page on the
 * site whose whole job is to convert. Same cost that ran August's bill to
 * $420, on the page that pays for the bill.
 *
 * So the question moved here, next to <Member> and <Guest> in
 * components/access/Viewer.tsx, and everything on this page is now decided
 * from the cached HTML plus one small answer from /api/me.
 *
 * WHY NOT JUST USE <Member>. Because "is a member" and "holds THIS tier" are
 * different questions, and this file has to answer the second one exactly. Only
 * one paid tier is on sale today, so they happen to coincide — but `patron`
 * exists in the data as a withdrawn tier, and a legacy holder of it is
 * `member: true` while holding something that is not `vault`. Comparing the
 * tier id directly is the same amount of code and cannot drift.
 *
 * UNKNOWN COUNTS AS NOT HELD, deliberately and for two reasons: it matches the
 * static HTML exactly, so hydration is clean; and it fails towards showing
 * somebody the way to buy rather than telling them they already own something.
 * The worst case is a member seeing a join button for a moment before the
 * answer lands; the reverse would be a stranger being told they are already in.
 *
 * NOTHING IS GATED HERE. This decides what a card SAYS. Every real check is
 * server-side and unchanged — /membership/start validates the tier before it
 * creates a Stripe session, and entitlement is resolved in
 * lib/access/entitlement.ts.
 */

export function IfHeld({
  tier,
  children,
}: {
  tier: string;
  children: ReactNode;
}) {
  return useViewer()?.tier === tier ? <>{children}</> : null;
}

/** The other half. Renders while the answer is unknown — see the note above. */
export function IfNotHeld({
  tier,
  children,
}: {
  tier: string;
  children: ReactNode;
}) {
  return useViewer()?.tier === tier ? null : <>{children}</>;
}
