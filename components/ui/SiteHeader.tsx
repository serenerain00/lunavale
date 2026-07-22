import Link from "next/link";

interface SiteHeaderProps {
  member: boolean;
}

export function SiteHeader({ member }: SiteHeaderProps) {
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
    </header>
  );
}
