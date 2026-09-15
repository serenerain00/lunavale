"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useViewer, useViewerRefresh } from "@/components/access/Viewer";

/**
 * Keeps the viewer layer honest when the session changes without a page load.
 *
 * THE BUG THIS EXISTS FOR (2026-09-04). Sign in on /sign-in, and the header
 * goes on saying "Sign in" with the join button beside it — for the rest of
 * the visit, on every page, until a manual reload. Click that "Sign in" again
 * and Clerk bounces you straight back, because as far as the browser is
 * concerned you are already in, which makes it look like signing in silently
 * failed.
 *
 * Nothing was actually broken about the session. ViewerProvider asks /api/me
 * once, in a mount effect, from the root layout; Clerk's <SignIn> finishes
 * with a Next router navigation, which does not remount the layout; so the
 * context keeps serving the answer it fetched while the person was still a
 * stranger. Signing out had the identical failure from the other direction and
 * was fixed by leaving via a full document load — a trick that is not
 * available here, because the navigation belongs to Clerk.
 *
 * So instead this watches the one thing that does know: Clerk's own
 * client-side session. When the signed-in identity changes, it re-asks.
 *
 * WHY IT COSTS NOTHING IN THE NORMAL CASE. The whole viewer layer exists
 * because a per-request answer was costing real money (see Viewer.tsx), so
 * this deliberately does not refetch on a schedule, on navigation, or on every
 * Clerk state change. It fires when the identity it last saw stops matching
 * the identity Clerk reports — which on an ordinary visit is never.
 *
 * ONE ATTEMPT PER IDENTITY, and that guard is load-bearing rather than
 * defensive. If the server ever disagreed with Clerk persistently — a session
 * the browser holds and the server will not accept — an "ask again until they
 * agree" loop would hammer the route forever. It asks once and then leaves it
 * alone, and the header is wrong in the safe direction while it does.
 *
 * Rendered only where Clerk is configured (app/layout.tsx). useAuth() throws
 * outside a ClerkProvider, and an unkeyed deploy has to keep serving.
 */
export function ClerkViewerSync() {
  const { isLoaded, userId } = useAuth();
  const viewer = useViewer();
  const refresh = useViewerRefresh();

  // The identity this component has already reconciled. `undefined` means it
  // has not run yet — distinct from `null`, which means "reconciled, and
  // nobody is signed in".
  const syncedFor = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // Wait for both sides to have an opinion. Clerk reports signed-out while
    // it is still loading, and the viewer is null until /api/me answers;
    // acting on either would mean reconciling against a value that is about to
    // change.
    if (!isLoaded || !viewer) return;

    const identity = userId ?? null;

    if (syncedFor.current === undefined) {
      // First pass. The two usually agree — the document was loaded with
      // whatever cookies it had — and agreement must not cost a request.
      syncedFor.current = identity;
      if (Boolean(userId) !== viewer.signedIn) void refresh();
      return;
    }

    if (syncedFor.current !== identity) {
      syncedFor.current = identity;
      void refresh();
    }
  }, [isLoaded, userId, viewer, refresh]);

  return null;
}
