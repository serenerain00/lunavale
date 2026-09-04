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
  // Round two of the same diagnostic. A valid, freshly-minted session JWT for
  // a real active Clerk session still comes back signedIn:false from this
  // route, so the problem is not the browser and not the cookie — the server
  // refuses a good session. These three fields separate the remaining causes:
  // whether clerkMiddleware() ran at all (it is what auth() depends on and it
  // is compiled into a different bundle, with its own view of the
  // environment), what auth() actually returned, and whether it threw.
  let authProbe: Record<string, unknown> = { ran: false };
  if (authConfigured()) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const a = await auth();
      authProbe = {
        ran: true,
        userId: a.userId ? `${a.userId.slice(0, 10)}…` : null,
        sessionId: a.sessionId ? `${a.sessionId.slice(0, 10)}…` : null,
        // Clerk hangs the reason it rejected a token off the auth object in
        // v6+. This is the field that says "token-expired", "token-invalid",
        // or that middleware never ran.
        reason:
          (a as unknown as { reason?: string }).reason ??
          (a as unknown as { authStatus?: string }).authStatus ??
          null,
      };
    } catch (err) {
      authProbe = { ran: true, threw: String(err).slice(0, 200) };
    }
  }

  /*
    ROUND THREE, 2026-09-04, and it exists because round two's output could not
    settle the question it was built to settle. A real signed-in browser sent:

      clerkCookies: ["__client_uat:1", "__client_uat_L-ekVNyD:1"]

    which says two things and hides the one that matters. It says there is NO
    __session cookie — so auth() is not refusing a token, it is being handed
    none, and every "the server rejects a good session" theory is dead. And it
    says the __client_uat values are one character long, which is either "0"
    (Clerk's flag for nobody is signed in, and then the server is simply right)
    or a truncated something else. Logging lengths instead of values was the
    right instinct for a token and the wrong one for a flag.

    So: the uat VALUES, which are a Unix timestamp or 0 and are readable in
    devtools by anyone anyway, and the full list of cookie NAMES, which is how
    a session cookie under a name nobody expected would show up. Still no token
    values, still no email, still the user id cut to ten characters.

    REMOVE THIS, and the block below it, once the sign-in header is settled.
    It runs on every viewer request and Observability is billed per event.
  */
  console.log(
    "api/me diag " +
      JSON.stringify({
        clerkCookies: jar
          .getAll()
          .filter((c) => c.name.startsWith("__session") || c.name.startsWith("__client"))
          .map((c) =>
            c.name.startsWith("__client_uat")
              ? `${c.name}=${c.value}`
              : `${c.name}:${c.value.length}`,
          ),
        // Names only. A session arriving under an unexpected name is exactly
        // the kind of thing the filter above would hide.
        allCookies: jar.getAll().map((c) => c.name),
        signedIn: session.signedIn,
        member: membership.active,
        tier: membership.tier,
        authConfigured: authConfigured(),
        // Whether the middleware bundle can see the secret. If this is false
        // while authConfigured() above is true, clerkMiddleware() never ran
        // and auth() has nothing to read — which would explain every symptom.
        secretVisibleHere: Boolean(process.env.CLERK_SECRET_KEY),
        auth: authProbe,
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
