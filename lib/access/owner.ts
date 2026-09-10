/**
 * The owner gate — one person, checked server-side, everywhere.
 *
 * This lived as a private function at the bottom of app/admin/page.tsx until
 * Studio needed the same check on four API routes. A gate copy-pasted into
 * five files is a gate that will eventually be wrong in one of them, so it is
 * one function now and everything imports it.
 *
 * IT ALREADY HAD BEEN WRONG IN ONE OF THEM. There were four near-identical
 * private copies of this — in app/overheard/{actions,page}.ts(x) and
 * app/account/overheard/{actions,page}.ts(x) — plus an inline comparison, plus
 * app/account/page.tsx, which checked only that OWNER_USER_ID was SET and so
 * showed an "Admin →" link to every signed-in member on the site. The link
 * went somewhere that correctly 404s them, so nothing leaked; it just told
 * several paying customers that there was a door. All six now call this.
 *
 * IT IS AN IDENTITY CHECK, NOT AN ENTITLEMENT. lib/access/entitlement.ts
 * answers "may this person watch"; this answers "is this Melissa". Nothing
 * here reads a membership, because owning the site is not a tier.
 *
 * FAILS CLOSED. No OWNER_USER_ID configured means nobody is the owner —
 * including in local development, which is deliberate: a tool that quietly
 * lets anyone in when an env var is missing is worse than one that locks its
 * author out.
 */

import "server-only";
import { authConfigured } from "@/lib/billing/provider";

/**
 * OWNER_USER_ID accepts a COMMA-SEPARATED LIST, and the reason is Clerk rather
 * than vanity. Clerk domain-locks live keys — `pk_live_` refuses to run on
 * localhost — so local development has to sign in against a separate dev
 * instance, and the SAME PERSON has a different user id in each. One id per
 * environment is unworkable when the id is a production Secret that does not
 * pull; a list lets one `.env.local` hold the dev ids while production holds
 * its own single live one.
 *
 * A single id still works exactly as before, which is what production uses.
 */
export function isOwnerId(userId: string | null | undefined): boolean {
  const owner = process.env.OWNER_USER_ID;
  if (!owner || !userId) return false;
  return owner
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(userId);
}

export async function isOwner(): Promise<boolean> {
  if (!authConfigured()) return false;
  if (!process.env.OWNER_USER_ID) return false;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return isOwnerId(userId);
}

/** For API routes: 404 rather than 403, so the surface does not announce itself. */
export function notOwner(): Response {
  return new Response("Not found", { status: 404 });
}
