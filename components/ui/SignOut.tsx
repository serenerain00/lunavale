"use client";

import { useClerk } from "@clerk/nextjs";

/**
 * Sign out. There was no way off this site once you had an account, which is a
 * problem beyond politeness: people sign up on borrowed laptops, and a stuck
 * session on a site with explicit content is worse than on most.
 *
 * Client component because signing out is a Clerk call, not a route.
 */
export function SignOut({ className }: { className?: string }) {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className={
        className ??
        "text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
      }
    >
      Sign out
    </button>
  );
}
