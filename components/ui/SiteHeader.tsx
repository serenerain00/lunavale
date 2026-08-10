import Link from "next/link";
import { authConfigured } from "@/lib/billing/provider";
import { SignOut } from "@/components/ui/SignOut";
import { MobileNav, type NavItem } from "@/components/ui/MobileNav";

interface SiteHeaderProps {
  member: boolean;
}

/**
 * The bar at the top of every page.
 *
 * ONE list of links, rendered two ways: inline from md up, and inside a menu
 * below that. It used to be one list with a different min-width on each item,
 * which meant every new surface got hidden behind a bigger breakpoint until, on
 * a 390px phone, Clips, Overheard, Help, Membership and sign-in were all
 * unreachable — on the device most visitors arrive from. Adding a link here now
 * costs nothing on mobile, which is the point.
 *
 * Async so it can ask Clerk whether anyone is signed in without every page
 * having to thread that through. `member` stays a prop because the pages have
 * already resolved it and a second lookup would be waste.
 */
export async function SiteHeader({ member }: SiteHeaderProps) {
  const signedIn = await isSignedIn();

  // Order and membership set by Melissa, 2026-08-10.
  const items: NavItem[] = [
    // First, and deliberately so. Most arrivals come off a thirty-second clip
    // with no idea who these people are, and the rest of this bar assumes they
    // already know — "Browse" and "Cast" are only useful once you care.
    { href: "/about", label: "What this is" },
    // Then her writing, ahead of the video. Free journal pages are the
    // strongest thing a stranger can be handed, which is why the home page
    // leads with them too.
    { href: "/journal", label: "Journal" },
    { href: "/browse", label: "Browse" },
    { href: "/characters", label: "Cast" },
    // NOT NAMED in the reorder and kept rather than assumed away — she asked
    // for World and Membership to go and said nothing about these two, and
    // dropping a whole section on inference is not a thing to do quietly.
    { href: "/clips", label: "Clips" },
    { href: "/overheard", label: "Overheard" },
    // HELP IS MEMBERS-ONLY IN THE NAV now, her call.
    //
    // Worth knowing what it trades: /help exists because "someone who cannot
    // sign in is exactly the person most likely to need help", and that person
    // no longer has a link to it. The PAGE is still there and still open to
    // everyone — this hides the signpost, not the door — so anybody who has
    // the URL, or reaches it from a footer link or an email, still gets
    // through. If support requests from non-members dry up entirely, this is
    // why.
    ...(member ? [{ href: "/help", label: "Help" }] : []),
    // MEMBERSHIP IS GONE from the nav: the "Become a member" button on the
    // right of this same bar already goes to /membership, so the old entry was
    // the same destination twice, four links apart.
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-void/80 backdrop-blur-md">
      {/*
        min-h rather than a fixed h: surfaces below stick at --header-h, so if
        this bar ever grew past that height it would sit under them.
      */}
      <div className="mx-auto flex min-h-(--header-h) w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <div className="flex items-center gap-3 sm:gap-6">
          <MobileNav
            items={items}
            signedIn={signedIn}
            showSignIn={authConfigured()}
          />

          <Link
            href="/"
            className="whitespace-nowrap font-display text-base font-medium tracking-wide text-ivory sm:text-lg"
          >
            Luna Vault
          </Link>

          {/* The inline nav, from md up. Below that, the menu carries it. */}
          <nav aria-label="Site" className="hidden items-baseline gap-5 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {authConfigured() &&
            (signedIn ? (
              <span className="hidden md:inline">
                <SignOut />
              </span>
            ) : (
              <Link
                href="/sign-in"
                className="hidden text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber md:inline"
              >
                Sign in
              </Link>
            ))}
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
                {/* The full label needs room a phone doesn't have.
                    "Become a member" named the transaction; this names what
                    they get, which is the whole point of the 2026-08-10
                    strategy rewrite. Kept short because it is a bar button —
                    the long-form version of the argument is on /membership. */}
                <span className="sm:hidden">Read on</span>
                <span className="hidden sm:inline">Keep reading her</span>
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
