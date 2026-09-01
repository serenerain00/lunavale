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
  useContext,
  useEffect,
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

const ViewerContext = createContext<ViewerPayload | null>(null);

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

  useEffect(() => {
    let cancelled = false;

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
    async function resolve() {
      try {
        // Safari in private mode throws on localStorage rather than returning
        // null, so this cannot be an `if (cached)` on a bare read.
        const cached = window.localStorage.getItem(HINT_KEY);
        if (cached && !cancelled) setViewer(JSON.parse(cached) as ViewerPayload);
      } catch {
        // No hint available. The fetch below is the real answer anyway.
      }

      try {
        // `same-origin` credentials so the session cookie rides along; without
        // it this would report every member as signed out.
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as ViewerPayload;
        if (cancelled) return;

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
      }
    }

    void resolve();

    return () => {
      cancelled = true;
    };
  }, []);

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
    <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
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
