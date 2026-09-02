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
    TEMPORARY DIAGNOSTIC, added 2026-09-02 and to be removed once the header
    bug is closed.

    The report: signed in on the apex, Clerk's own /sign-in bounces her back
    because the BROWSER has a session — and this route still says signedIn
    false, so the header offers "Sign in" to somebody who is already in.

    Everything cheap has already been ruled out from the outside: the route is
    healthy and returns valid JSON, the viewer bundle ships and loads, the
    firewall lets a browser-shaped request through, the production Clerk key is
    the live instance, and CLERK_SECRET_KEY is a Config (not Sensitive)
    variable so the middleware has it at build time.

    What is left is a question only a real request can answer: does the session
    cookie reach this function at all, and does clerkMiddleware resolve it?
    Those are different failures with different fixes — a cookie that never
    arrives is a client/scope problem, a cookie that arrives and resolves to no
    user is a middleware or handshake problem.

    Cookie NAMES and lengths only. No token values, no email, and the user id
    is cut to eight characters — enough to tell two accounts apart in a log,
    not enough to be an identifier worth having.
  */
  console.log(
    "api/me diag " +
      JSON.stringify({
        clerkCookies: jar
          .getAll()
          .filter((c) => c.name.startsWith("__session") || c.name.startsWith("__client"))
          .map((c) => `${c.name}:${c.value.length}`),
        signedIn: session.signedIn,
        member: membership.active,
        tier: membership.tier,
        authConfigured: authConfigured(),
      }),
  );

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
