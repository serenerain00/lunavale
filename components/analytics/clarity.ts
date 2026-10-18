/**
 * Named events and tags for Microsoft Clarity (tag in app/layout.tsx).
 *
 * WHY (2026-10-18, the Facebook conversion audit). Until now the site sent
 * Clarity nothing of its own, so the "play", "signup" and "submit form" counts
 * on the dashboard were Clarity guessing from clicks — "signup" was any tap on
 * a Join button, and payment was invisible, since it happens on stripe.com.
 * These are the moments that matter, said by the site itself, so Clarity's
 * funnels and recording filters mean something:
 *
 *   video_play       a video actually started
 *   preview_end      a non-member reached the end of a free preview
 *   join_click       a Join link or button was tapped
 *   checkout_start   a form that opens Stripe Checkout was submitted
 *   purchase         /welcome confirmed a paid Checkout Session
 *
 * NOTHING PERSONAL GOES IN. Event names and short labels only — never an
 * email, a name or a Stripe id.
 *
 * Safe anywhere on the client: before the tag loads, the layout snippet has
 * already defined a queueing window.clarity, and if it is blocked entirely
 * this does nothing.
 */
"use client";

type ClarityFn = (...args: unknown[]) => void;

function clarity(): ClarityFn | null {
  if (typeof window === "undefined") return null;
  const c = (window as unknown as { clarity?: ClarityFn }).clarity;
  return typeof c === "function" ? c : null;
}

export function clarityEvent(name: string): void {
  try {
    clarity()?.("event", name);
  } catch {}
}

export function clarityTag(key: string, value: string): void {
  try {
    clarity()?.("set", key, value);
  } catch {}
}
