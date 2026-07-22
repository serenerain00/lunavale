import Link from "next/link";
import { authConfigured } from "@/lib/billing/provider";

interface SiteHeaderProps {
  member: boolean;
}

/**
 * Async so it can ask Clerk whether anyone is signed in without every page
 * having to thread that through. `member` stays a prop because the pages have
 * already resolved it and a second lookup would be waste.
 */
export async function SiteHeader({ member }: SiteHeaderProps) {
  const signedIn = await isSignedIn();
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-void/80 backdrop-blur-md">
      {/*
        min-h rather than a fixed h: surfaces below stick at --header-h, so if
        this bar ever grew past that height it would sit under them. Nothing
        inside is allowed to wrap, which is what keeps the two agreeing down
        to a 320px screen.
      */}
      <div className="mx-auto flex min-h-(--header-h) w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <div className="flex items-baseline gap-4 sm:gap-6">
          <Link
            href="/"
            className="whitespace-nowrap font-display text-base font-medium tracking-wide text-ivory sm:text-lg"
          >
            Luna Vault
          </Link>
          <Link
            href="/browse"
            className="text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
          >
            Browse
          </Link>
          <Link
            href="/clips"
            className="text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
          >
            Clips
          </Link>
          <Link
            href="/journal"
            className="hidden text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber sm:inline"
          >
            Journal
          </Link>
          {/* Members already bought this; showing them the pitch is the kind
              of nagging the monetization rules rule out. They get Account. */}
          {!member && (
            <Link
              href="/membership"
              className="hidden text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber sm:inline"
            >
              Membership
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {authConfigured() && !signedIn && (
            <Link
              href="/sign-in"
              className="hidden text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber sm:inline"
            >
              Sign in
            </Link>
          )}
          <Link
          href={member ? "/account" : "/membership"}
          className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3.5 text-sm transition-colors duration-(--duration-quick) sm:px-4 ${
            member
              ? "border border-hairline text-stone hover:border-amber hover:text-amber"
              : "bg-amber font-medium text-void hover:bg-amber-soft"
          }`}
        >
          {member ? (
            "Account"
          ) : (
            <>
              {/* The full label needs room a phone doesn't have. */}
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">Become a member</span>
            </>
          )}
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Whether Clerk has a session. Returns false when Clerk isn't configured, so
 * an unkeyed deploy renders the signed-out header rather than throwing.
 */
async function isSignedIn(): Promise<boolean> {
  if (!authConfigured()) return false;
  const { auth } = await import("@clerk/nextjs/server");
  return Boolean((await auth()).userId);
}
