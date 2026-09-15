"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { clearViewerHint } from "@/components/access/Viewer";

/**
 * Sign out. There was no way off this site once you had an account, which is a
 * problem beyond politeness: people sign up on borrowed laptops, and a stuck
 * session on a site with explicit content is worse than on most.
 *
 * Client component because signing out is a Clerk call, not a route.
 *
 * WHY THIS IS MORE THAN A CLERK CALL (2026-09-04). It used to be
 * `signOut({ redirectUrl: "/" })` and nothing else, and it left the header
 * showing the signed-out viewer their own email address, a "Sign out" control
 * and an "Account" button — indefinitely, until they reloaded by hand. The
 * session really was gone; every gate on the site was correctly shut against
 * them. Only the UI was lying, which is arguably worse: the one action whose
 * entire purpose is to reassure somebody that they are out gave no evidence
 * that anything had happened.
 *
 * TWO CAUSES, and the fix has to deal with both or the bug half-survives:
 *
 *   1. THE PROVIDER NEVER LOOKS AGAIN. ViewerProvider asks /api/me once, in a
 *      mount effect, from the root layout. `redirectUrl` navigates with the
 *      Next router, the layout does not remount, the effect does not re-run,
 *      and so the context keeps serving the payload it fetched while the
 *      person was still signed in. Hence the full document load below: it is
 *      the only thing that makes the client ask the question again, and it
 *      costs one request on an action nobody performs twice a minute.
 *
 *   2. THE HINT OUTLIVES THE SESSION. The localStorage hint is seeded into
 *      state before /api/me answers, so even after a reload it would paint the
 *      signed-in header first. On a shared machine that is somebody else's
 *      address on the screen. Clearing it before leaving means the next
 *      document starts from "guest", which is also what the cached HTML says.
 *
 * ORDER MATTERS: clear the hint, wait for Clerk to actually finish, then
 * navigate. Navigating first would race the cookie clearing and could land on
 * a page that still resolves as signed in.
 *
 * FAILS TOWARDS SIGNED OUT. If Clerk throws, we still drop the hint and still
 * leave for the home page — the local view of the session should never be more
 * generous than the server's, and a person who has pressed this button must
 * not be left looking at a page that says they are signed in.
 */
export function SignOut({ className }: { className?: string }) {
  const { signOut } = useClerk();
  const [leaving, setLeaving] = useState(false);

  async function handleSignOut() {
    if (leaving) return;
    setLeaving(true);
    clearViewerHint();
    try {
      await signOut();
    } catch {
      // Nothing useful to say to the viewer, and nothing to retry: the hard
      // navigation below re-asks the server who they are, and the server is
      // the only answer that counts.
    }
    // Not router.push: this must be a fresh document so ViewerProvider mounts
    // again and re-reads /api/me. See the note above.
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={leaving}
      className={
        className ??
        "text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
      }
    >
      {leaving ? "Signing out…" : "Sign out"}
    </button>
  );
}
