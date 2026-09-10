/**
 * The owner gate — one person, checked server-side, everywhere.
 *
 * This lived as a private function at the bottom of app/admin/page.tsx until
 * Studio needed the same check on four API routes. A gate copy-pasted into
 * five files is a gate that will eventually be wrong in one of them, so it is
 * one function now and the routes import it.
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

export async function isOwner(): Promise<boolean> {
  if (!authConfigured()) return false;
  const owner = process.env.OWNER_USER_ID;
  if (!owner) return false;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return Boolean(userId && userId === owner);
}

/** For API routes: 404 rather than 403, so the surface does not announce itself. */
export function notOwner(): Response {
  return new Response("Not found", { status: 404 });
}
