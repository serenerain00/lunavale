import { Fragment } from "react";
import Link from "next/link";
import { authConfigured } from "@/lib/billing/provider";
import { SignOut } from "@/components/ui/SignOut";
import {
  Guest,
  Member,
  SignedIn,
  SignedOut,
  ViewerEmail,
} from "@/components/access/Viewer";
import { MobileNav, type NavItem } from "@/components/ui/MobileNav";

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
 * STATIC AS OF 2026-08-31, and that is the whole reason it looks like this.
 * It used to be async: it took a `member` prop and called Clerk itself for the
 * signed-in address. Both of those made every page that rendered it dynamic —
 * `no-store`, uncacheable, a serverless function per request — and since this
 * header is on every page, that was every page. The August bill was $420 on a
 * site with two members, most of it crawlers rendering pages nobody read.
 *
 * So the per-viewer parts became <Member>, <Guest>, <SignedIn> and <SignedOut>
 * from components/access/Viewer.tsx, which resolve on the client after the
 * cached HTML has already been served. `authConfigured()` stays inline because
 * it reads an environment variable that is fixed at build time and does not
 * vary per request, so it costs no dynamism.
 */
export function SiteHeader() {
  // Order and membership set by Melissa, 2026-08-10.
  const items: NavItem[] = [
    // First, and deliberately so. Most arrivals come off a thirty-second clip
    // with no idea who these people are, and the rest of this bar assumes they
    // already know — "Browse" and "Cast" are only useful once you care.
    { href: "/about", label: "What this is" },
    // ADDED 2026-09-01 with the reader Q&A. Sits second, beside "What this is",
    // because the two do the same job for a stranger — that page explains the
    // situation, this one introduces the person it happens to. Labelled
    // "Interview" rather than "Twenty Questions": the bar already carries six
    // items at md and a two-word label crowds it, and "Interview" is what
    // somebody scans for.
    { href: "/twenty-questions", label: "Interview" },
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
    // ADDED 2026-08-13 with the notebook itself. Not part of the 08-10 reorder
    // above — a destination with no link in the bar is a destination nobody
    // finds, which is the exact failure the mobile sign-in link had this
    // morning. Sits after Clips because it is behind-the-scenes material and
    // the four above it are the story.
    { href: "/between-takes", label: "Between Takes" },
    // Overheard is archived (lib/content/overheard.ts). The link goes with it —
    // a nav item pointing at a 404 is worse than a missing nav item.
    // HELP IS MEMBERS-ONLY IN THE NAV now, her call.
    //
    // Worth knowing what it trades: /help exists because "someone who cannot
    // sign in is exactly the person most likely to need help", and that person
    // no longer has a link to it. The PAGE is still there and still open to
    // everyone — this hides the signpost, not the door — so anybody who has
    // the URL, or reaches it from a footer link or an email, still gets
    // through. If support requests from non-members dry up entirely, this is
    // why.
    //
    // `memberOnly` rather than a filtered list: the list is built on the
    // server now, where membership is deliberately unknown, so the hiding
    // happens on the client in both renderings of the nav.
    { href: "/help", label: "Help", memberOnly: true },
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
          <MobileNav items={items} showSignIn={authConfigured()} />

          {/* -my-2/py-2 grows the tap target to 44px without moving the
              wordmark a pixel. It measured exactly 24px tall, which is the
              floor WCAG 2.5.8 allows and well under the 44 Apple asks for —
              and it is the control every visitor reaches for to get home. */}
          <Link
            href="/"
            className="-my-2 whitespace-nowrap py-2 font-display text-base font-medium tracking-wide text-ivory sm:text-lg"
          >
            Luna Vale
          </Link>

          {/* The inline nav, from lg up. Below that, the menu carries it.
              IT USED TO SWITCH ON AT md AND DID NOT FIT THERE. Measured at
              exactly 768: the header row was 783px of content in a 768px box
              with SIX links, before "Interview" was added — already 15px over
              and quietly squashing the sign-in control on the right. Adding a
              seventh made it worse rather than causing it.
              Moving the switch to lg means the bar only goes inline once there
              is genuinely room, and tablets get the menu, which holds however
              many links there turn out to be. That is the same argument that
              built MobileNav in the first place. */}
          <nav aria-label="Site" className="hidden items-baseline gap-5 lg:flex">
            {items.map((item) => {
              const link = (
                <Link
                  href={item.href}
                  className="whitespace-nowrap text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber"
                >
                  {item.label}
                </Link>
              );
              // Fragment rather than a wrapper element: <nav> is a flex row and
              // an extra span around one link would change how it lays out.
              return item.memberOnly ? (
                <Member key={item.href}>{link}</Member>
              ) : (
                <Fragment key={item.href}>{link}</Fragment>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {authConfigured() && (
            <>
              <SignedIn>
                <span className="hidden items-baseline gap-3 lg:inline-flex">
                  {/* max-w + truncate lives inside ViewerEmail: a long address
                      must not push the account button off a narrow window. */}
                  <ViewerEmail />
                  <SignOut />
                </span>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="hidden text-sm text-stone transition-colors duration-(--duration-quick) hover:text-amber lg:inline"
                >
                  Sign in
                </Link>
              </SignedOut>
            </>
          )}

          {/* Both variants ship in the cached HTML and the client shows one.
              They are two links and four words; nothing behind either of them
              is reachable without the server agreeing. */}
          <Member>
            <Link
              href="/account"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-hairline px-3.5 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber sm:px-4"
            >
              Account
            </Link>
          </Member>
          <Guest>
            <Link
              href="/membership"
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full bg-amber px-3.5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft sm:px-4"
            >
              {/* The full label needs room a phone doesn't have.
                  "Become a member" named the transaction; this names what
                  they get, which is the whole point of the 2026-08-10
                  strategy rewrite. Kept short because it is a bar button —
                  the long-form version of the argument is on /membership. */}
              <span className="sm:hidden">Read on</span>
              <span className="hidden sm:inline">Keep reading her</span>
            </Link>
          </Guest>
        </div>
      </div>
    </header>
  );
}
