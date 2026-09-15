/**
 * Clerk middleware, but only when Clerk exists.
 *
 * middleware.ts runs on every request, and clerkMiddleware() throws without
 * publishable/secret keys. Since the site is live and billing is being wired
 * up in stages, an unconfigured deploy has to keep serving rather than
 * 500 on every route — so this is a pass-through until the keys are set.
 *
 * No routes are protected here. Access is decided per request by
 * lib/access/entitlement.ts, which is server-side and covers the stream route
 * as well as pages; adding a second gate in middleware would be a second place
 * to get it wrong. Sign-in is an invitation, not a wall.
 */
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkReady = Boolean(
  process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

/*
  THE BOOT LOG THAT LIVED HERE IS GONE (2026-09-09), and it answered its
  question first: `clerkReady=true secret=true publishable=true` on every cold
  start. The middleware bundle DOES see the Clerk keys, clerkMiddleware() does
  run, and the "signed-in visitors reported signed out" symptom was never about
  this file — see the note in app/api/me/route.ts for where it actually was.

  Worth knowing if it ever comes up again: this is a real risk in principle,
  because `clerkReady` is evaluated when this module loads, in a bundle
  compiled separately from the server routes, with its own view of the
  environment. It was simply not what was happening here.
*/

export default clerkReady ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files, but always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)",
    "/(api|trpc)(.*)",
  ],
};
