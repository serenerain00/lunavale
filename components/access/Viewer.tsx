"use client";

/**
 * The viewer layer — how a statically cached page still knows who is reading it.
 *
 * THE PROBLEM THIS SOLVES. Reading a cookie during render makes a page dynamic:
 * `no-store`, never cached by the CDN, a serverless function on every request.
 * The home page did that for one boolean (`member`), which decided about a
 * dozen labels, two link targets and whether the join section rendered. In
 * August 2026 that boolean cost roughly $118 in invocations, CPU and origin
 * transfer, because the page was being fetched ~25 times a second by crawlers
 * that were never going to buy anything.
 *
 * So the HTML went static and the boolean moved to the client. Both variants
 * of each swap ship in the cached HTML — they are labels and hrefs, a few
 * hundred bytes — and this component picks which one is visible.
 *
 * WHAT THIS IS NOT. It is not a security boundary and must never be used as
 * one. Everything here is reachable and editable by anyone with devtools. It
 * decides what a button *says*, never what a viewer *receives*. Media and
 * members-only pages are gated server-side and are unchanged: /api/stream
 * chooses the file, /api/still and /api/take choose the image, and gated pages
 * call canWatch() during their own render. The rule is simple and worth
 * keeping: NOTHING PREMIUM MAY BE PASSED AS CHILDREN TO <Member>. Put the real
 * thing behind a server check and put the *invitation* to it here.
 *
 * THE UNKNOWN STATE IS "GUEST". Until /api/me answers, `viewer` is null and
 * <Guest> renders while <Member> does not. Two reasons, and both matter:
 * it matches the static HTML exactly, so hydration is clean; and it fails
 * closed, so a failed request downgrades the UI rather than promising access
 * that isn't there.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ViewerPayload } from "@/app/api/me/route";

/**
 * A hint, cached in localStorage, purely to spare a returning member the
 * flash of the signed-out header on every navigation.
 *
 * It is a hint and nothing else: the fetch below overwrites it a moment later,
 * and it is never consulted for anything that matters. Worst case someone sets
 * it by hand and briefly sees "Account" instead of "Keep reading her".
 */
const HINT_KEY = "lv_viewer_hint";

/**
 * Forget the hint, and drop the member styling with it.
 *
 * CALLED ON SIGN-OUT, and it is not a nicety. The hint is seeded into state
 * before /api/me is asked, so a stale one is what a signed-out person sees
 * first: their own address, "Sign out", and an "Account" button. Clerk clears
 * its cookies on the way out and has no idea this key exists.
 *
 * Safe to call anywhere — a browser that throws on localStorage (Safari in
 * private mode) is a browser that had no hint to clear.
 */
export function clearViewerHint(): void {
  try {
    window.localStorage.removeItem(HINT_KEY);
  } catch {
    // Storage unavailable, so there is nothing stored to forget.
  }
  document.documentElement.removeAttribute("data-member");
}

const ViewerContext = createContext<ViewerPayload | null>(null);

/**
 * Ask the question again.
 *
 * Separate context from the payload so that a component which only wants to
 * TRIGGER a re-read does not re-render every time the answer changes. The
 * default is a no-op, so calling this outside the provider is harmless.
 */
const ViewerRefreshContext = createContext<() => void>(() => {});

/**
 * The escape hatch for anything that changes who the viewer is.
 *
 * The provider asks /api/me once per document (see the note on its effect).
 * Anything that makes that answer stale WITHOUT a page load has to say so, and
 * this is how. Today there is one caller — ClerkViewerSync, which watches
 * Clerk's client-side session and re-asks when the signed-in identity changes.
 */
export function useViewerRefresh(): () => void {
  return useContext(ViewerRefreshContext);
}

/**
 * The membership question, or null while it is still being asked.
 *
 * Callers that need to distinguish "not a member" from "not known yet" — a
 * loading state, say — can check for null. Most callers should not bother and
 * should use <Member> / <Guest>, which treat unknown as guest.
 */
export function useViewer(): ViewerPayload | null {
  return useContext(ViewerContext);
}

/** True once we actually know, so UI can avoid animating on the swap. */
export function useViewerResolved(): boolean {
  return useContext(ViewerContext) !== null;
}

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<ViewerPayload | null>(null);

  // Set while a fetch is in the air, so the mount effect and a refresh
  // triggered on the same tick cannot both ask.
  const inFlight = useRef(false);
  const mounted = useRef(true);

  /**
   * Ask /api/me and publish the answer.
   *
   * Stable identity (no deps) so ClerkViewerSync can hold it in an effect
   * without re-running that effect on every payload change.
   */
  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      // `same-origin` credentials so the session cookie rides along; without
      // it this would report every member as signed out.
      const res = await fetch("/api/me", { credentials: "same-origin" });
      if (!res.ok || !mounted.current) return;
      const data = (await res.json()) as ViewerPayload;
      if (!mounted.current) return;

      setViewer(data);
      try {
        window.localStorage.setItem(HINT_KEY, JSON.stringify(data));
      } catch {
        // Storage unavailable; the swap still happened, it just won't be
        // instant next time.
      }
    } catch {
      // Offline, or the route is down. Staying on the guest view is the
      // correct failure: it under-promises rather than over-promising.
    } finally {
      inFlight.current = false;
    }
  }, []);

  /*
    ASKED ONCE PER DOCUMENT, which is the point and also the sharp edge.

    This provider sits in the root layout, so a client-side navigation does not
    remount it and this effect does not run again. That is deliberate — the
    architecture exists to stop paying for a per-request answer, and refetching
    on every route change would put the cost back in a different pocket.

    The consequence is that anything which CHANGES who the viewer is has to say
    so, because nothing here will notice on its own. Both of them now do:

      SIGNING OUT — components/ui/SignOut.tsx clears the hint and leaves via a
      full document load rather than a router push.

      SIGNING IN — ClerkViewerSync watches Clerk's client-side session and
      calls useViewerRefresh() when the identity changes. Clerk's <SignIn>
      finishes with a router navigation, so without it a person who has just
      signed in keeps the header they had while signed out: "Sign in" on the
      right and the join button beside it, for the whole rest of the visit.

    Anything else that changes the answer in place — an in-page upgrade, say —
    needs the same treatment or it will look like it did not work.
  */
  useEffect(() => {
    mounted.current = true;

    /*
      Two renders on purpose, and in this order:

        1. the hint, so a returning member's header is right immediately
        2. the server's answer, which overwrites it

      The alternative — seeding state from localStorage in a lazy useState
      initializer — would make the first client render disagree with the
      server-rendered HTML, which is a hydration mismatch. Reading it here,
      after hydration, is what keeps the cached HTML and the first paint
      identical for everybody.
    */
    async function seedThenResolve() {
      try {
        // Safari in private mode throws on localStorage rather than returning
        // null, so this cannot be an `if (cached)` on a bare read.
        const cached = window.localStorage.getItem(HINT_KEY);
        if (cached) setViewer(JSON.parse(cached) as ViewerPayload);
      } catch {
        // No hint available. The fetch below is the real answer anyway.
      }

      await refresh();
    }

    void seedThenResolve();

    return () => {
      mounted.current = false;
    };
  }, [refresh]);

  /*
    A `data-member` attribute on <html> so styling can respond without a client
    component wrapped around every element that cares. CatalogCard uses it to
    stop dimming a premium poster for someone who has paid — one CSS rule
    covering every card on the page, instead of turning each card into a client
    component to change a brightness value.

    Same rule as everything else here: this is presentation. It is trivially
    settable from the console and grants nothing.
  */
  useEffect(() => {
    const root = document.documentElement;
    if (viewer?.member) root.setAttribute("data-member", "");
    else root.removeAttribute("data-member");
  }, [viewer?.member]);

  return (
    <ViewerRefreshContext.Provider value={refresh}>
      <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
    </ViewerRefreshContext.Provider>
  );
}

/**
 * Renders only for a member.
 *
 * Read the module note before putting anything in here: this is for the
 * member-facing *wording* of a thing, not for the thing itself.
 */
export function Member({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  return viewer?.member ? <>{children}</> : null;
}

/** Renders for everyone who is not (yet known to be) a member. */
export function Guest({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  return viewer?.member ? null : <>{children}</>;
}

/**
 * Renders only once we know, and only for a signed-in viewer.
 *
 * Separate from <Member> because signed-in and paying are different questions:
 * the header shows an email and a sign-out control for anyone with an account,
 * membership or not.
 */
export function SignedIn({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  return viewer?.signedIn ? <>{children}</> : null;
}

/** Renders for a viewer who is not (yet known to be) signed in. */
export function SignedOut({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  return viewer?.signedIn ? null : <>{children}</>;
}

/**
 * Renders unless this viewer has already answered the survey.
 *
 * KNOWN REGRESSION, and a deliberate trade. This used to be resolved on the
 * server so that "the band is simply absent from the HTML for them instead of
 * appearing and then vanishing once JavaScript catches up" — which was the
 * right call when the page was already paying for a dynamic render. It is not
 * worth an uncacheable home page. Someone who has answered may now see the
 * band for one frame on their first visit after this change; the localStorage
 * hint in ViewerProvider means every visit after that resolves before paint.
 *
 * If the flash turns out to matter more than the money, the fix is not to make
 * the page dynamic again — it is to write the answered flag into localStorage
 * at the moment of answering, which costs nothing and needs no request.
 */
export function UnlessAnswered({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  return viewer?.surveyAnswered ? null : <>{children}</>;
}

/**
 * The signed-in address.
 *
 * Exists because a person with more than one account otherwise has no way to
 * tell which one they are in — see lib/access/session.ts for the day that cost.
 * Renders nothing until the address is known, and nothing at all when Clerk
 * returns a session with no readable email.
 */
export function ViewerEmail({ className }: { className?: string }) {
  const viewer = useViewer();
  if (!viewer?.email) return null;
  return (
    <span
      className={
        className ?? "max-w-[16ch] truncate text-xs text-stone-dim"
      }
      title={viewer.email}
    >
      {viewer.email}
    </span>
  );
}
