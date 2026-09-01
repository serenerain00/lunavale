/**
 * Who is signed in, if anyone.
 *
 * Lifted out of components/ui/SiteHeader.tsx on 2026-08-31 when the header
 * stopped being able to ask this question during render. The header is now
 * static so it can be served from the CDN (see components/access/Viewer.tsx);
 * the answer arrives from /api/me instead, and that route needs the same
 * lookup the header used to do inline. One copy, two callers.
 *
 * The EMAIL is the part that earns its keep. Until 2026-08-13 the header knew
 * only yes-or-no, and showed "Sign out" and nothing else — so a person with
 * more than one account had no way to tell which one they were in. That is not
 * a hypothetical: it cost Melissa a day of believing mobile sign-in was broken,
 * when what was actually happening was that "Continue with Google" on her phone
 * signed her into a second account of her own that held no membership. Every
 * door was correctly locked against an account that had bought nothing, and the
 * UI had no way to say so.
 *
 * Returns signed-out when Clerk isn't configured, so an unkeyed deploy renders
 * the signed-out header rather than throwing.
 */
import { authConfigured } from "@/lib/billing/provider";

export interface Session {
  signedIn: boolean;
  email: string | null;
}

export async function getSession(): Promise<Session> {
  if (!authConfigured()) return { signedIn: false, email: null };

  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return { signedIn: false, email: null };

  // A failure here must not take the header — and therefore every page — down
  // over a decoration. Signed-in with no address still renders correctly.
  try {
    const user = await currentUser();
    return {
      signedIn: true,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
    };
  } catch {
    return { signedIn: true, email: null };
  }
}
