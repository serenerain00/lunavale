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
  TEMPORARY, 2026-09-03. `clerkReady` is evaluated when this module loads, in
  the MIDDLEWARE bundle — which is compiled separately from the server routes
  and does not necessarily see the same environment. If it is false here while
  /api/me reports authConfigured() true, then clerkMiddleware() never runs,
  auth() has no request state to read, and every signed-in visitor is reported
  signed out. That is the last hypothesis standing and this line is how to
  confirm it. Logged once per cold start, not per request.
*/
console.log(
  `middleware boot: clerkReady=${clerkReady} secret=${Boolean(process.env.CLERK_SECRET_KEY)} publishable=${Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)}`,
);

export default clerkReady ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files, but always run for API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)",
    "/(api|trpc)(.*)",
  ],
};
