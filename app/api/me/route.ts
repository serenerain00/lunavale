/**
 * Who is looking — the one dynamic thing a cached page still needs.
 *
 * WHY THIS EXISTS. Pages used to call getMembership() during render, which
 * reads cookies (and, once billing is live, Clerk + Neon). Any page that does
 * that is dynamic: Next marks it `no-store`, the Vercel CDN never caches it,
 * and every single request — every crawler, every scanner, every bot — renders
 * the whole page in a serverless function. On a 417KB home page at 25 requests
 * a second that came to $118 of function invocations, CPU and origin transfer
 * in August 2026, on a site with two members.
 *
 * So the pages went static and the per-viewer question moved here. The HTML is
 * now identical for everybody and served from the CDN; the client asks this
 * route once, after hydration, and swaps in the member view.
 *
 * THIS IS NOT AN AUTHORIZATION BOUNDARY, and nothing here is trusted to be
 * one. It answers a question the UI uses for labels and lock badges. The real
 * gates are unchanged and still server-side: /api/stream decides which file a
 * viewer receives, /api/still and /api/take do the same for images, and every
 * members-only page checks canWatch() during its own render. A person who
 * hand-edits this response into saying `member: true` gets nicer buttons and
 * not one additional byte of video (CLAUDE.md: "Treat premium access as
 * server-side authorization").
 *
 * The response is deliberately tiny — a few dozen bytes rather than a rendered
 * page — so the request a real visitor still makes is the cheapest possible
 * shape of it, and a bot that does not run JavaScript never makes it at all.
 */
import { cookies } from "next/headers";
import { getMembership } from "@/lib/access/entitlement";
import { getSession } from "@/lib/access/session";
import { authConfigured } from "@/lib/billing/provider";
import { ANSWERED_COOKIE } from "@/lib/content/survey";
import { hasAnswered } from "@/lib/db/survey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface ViewerPayload {
  /** True for any paid (or previewing) tier. Drives labels and lock badges. */
  member: boolean;
  /** The tier id, for UI that distinguishes them. "free" when none. */
  tier: string;
  /** Access granted without a payment behind it — the UI is required to say so. */
  preview: boolean;
  signedIn: boolean;
  email: string | null;
  /** Whether a sign-in affordance should render at all. */
  authAvailable: boolean;
  /**
   * Whether this viewer has already answered the survey.
   *
   * Rides along here rather than in a request of its own: it is the same
   * question ("who is this") asked about a different cookie, and the home page
   * needs both answers at the same moment. One round trip, not two.
   */
  surveyAnswered: boolean;
}

export async function GET() {
  const jar = await cookies();
  const [membership, session, surveyAnswered] = await Promise.all([
    getMembership(),
    getSession(),
    hasAnswered(jar.get(ANSWERED_COOKIE)?.value ?? ""),
  ]);

  /*
    THE DIAGNOSTIC THAT LIVED HERE IS GONE (2026-09-09), and what it found is
    worth keeping even though the code is not.

    THE REPORT, 2026-09-02: signed in on the apex, Clerk's own /sign-in bounces
    her back because the browser has a session, and the header still offers
    "Sign in". Three rounds of logging were added here to find out whether this
    route was refusing a good session — cookie names, then the auth() result
    and the reason it rejected a token, then the __client_uat VALUES after
    round two proved no __session cookie was arriving at all.

    THE ANSWER, from a live visitor on 2026-09-09: `__client_uat=0`. That is
    Clerk's own flag for "nobody is signed in in this browser", and there was
    no __session cookie because there was no session to have one. This route
    was correct every single time it said signedIn:false.

    The bug was in the header, not here: ViewerProvider asks this route once,
    in a mount effect in the root layout, and Clerk's <SignIn> finishes with a
    router navigation that does not remount it — so the context went on serving
    the answer it had fetched while the person was still a stranger. Fixed
    2026-09-04 by components/access/ClerkViewerSync.tsx.

    IF THE SYMPTOM EVER COMES BACK, do not re-add this block before checking
    that one thing: whether a signed-in browser sends a __session cookie at
    all. That single fact separates a client problem from a server one, and it
    took three deploys to ask it cleanly.

    WHY IT IS NOT LEFT IN "just in case": this route runs for every viewer on
    every page load, Observability is billed per event, and that meter is the
    one that produced a $420 August. A log that answers a closed question is
    not free.
  */

  const payload: ViewerPayload = {
    member: membership.active,
    tier: membership.tier,
    preview: membership.preview,
    signedIn: session.signedIn,
    email: session.email,
    authAvailable: authConfigured(),
    surveyAnswered,
  };

  return Response.json(payload, {
    headers: {
      // Per-viewer and never shared. `private` keeps it out of the CDN, which
      // is the whole point — caching this at the edge is exactly the bug that
      // would hand one member's state to everybody.
      "Cache-Control": "private, no-store",
    },
  });
}
