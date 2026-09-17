import { Fragment } from "react";
import Link from "next/link";
import { authConfigured } from "@/lib/billing/provider";
import { getTier } from "@/lib/content/membership";
import { SignOut } from "@/components/ui/SignOut";
import {
  Guest,
  Member,
  SignedIn,
  SignedOut,
  ViewerEmail,
} from "@/components/access/Viewer";
import { MobileNav, type NavItem } from "@/components/ui/MobileNav";
import { PAGE } from "@/components/ui/layout";

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
  /*
   * REORDERED 2026-09-16, with the rest of the site.
   *
   * The old bar led with two explainers — "What this is" and "Interview" —
   * on the reasoning that most arrivals come off a thirty-second clip with no
   * idea who these people are. That was true, and the answer was still wrong:
   * somebody who has just watched a clip wants another clip, not an essay
   * about the clip. Netflix does not open with an About page.
   *
   * So the bar now leads with the library, in the order somebody moves through
   * it — the story, then the short cuts, then her side of it, then who these
   * people are. The explainers are still one click away, under More, and the
   * hero has a "More info" button pointing at the first of them.
   *
   * "Clips" USED TO POINT AT /posts, which was the vertical Instagram grid,
   * and "Browse" pointed at the filter-by-feeling catalog. Both words meant
   * something other than what a visitor would guess. They now say what they
   * open.
   */
  const items: NavItem[] = [
    // The story, in order. The thing this site is for.
    { href: "/clips", label: "Clips" },
    // The vertical cuts — what Instagram sent most of these people here from.
    { href: "/posts", label: "Posts" },
    // Her writing. The strongest thing a stranger can be handed, and the one
    // part of this that exists nowhere else.
    { href: "/journal", label: "Journal" },
    { href: "/characters", label: "Cast" },
    // Filter by feeling and place. Genuinely useful, and genuinely a second
    // move — you browse a library you already know something about.
    { href: "/browse", label: "Browse" },
    { href: "/between-takes", label: "Between Takes" },
    // BACK 2026-09-17 with the wall itself. The link came out when Overheard
    // was archived — "a nav item pointing at a 404 is worse than a missing nav
    // item" — and the page 404s no longer. Members-only in the bar for the
    // same reason /help is: the page gates itself server-side either way, and
    // a signpost to a room a stranger cannot enter is an invitation to bounce.
    { href: "/overheard", label: "The group chat", memberOnly: true },
    { href: "/about", label: "What this is" },
    // HELP IS MEMBERS-ONLY IN THE NAV, her call. The PAGE is still open to
    // everyone — this hides the signpost, not the door — so anybody with the
    // URL, or reaching it from a footer link or an email, still gets through.
    // If support requests from non-members dry up entirely, this is why.
    //
    // `memberOnly` rather than a filtered list: the list is built on the
    // server, where membership is deliberately unknown, so the hiding happens
    // on the client in both renderings of the nav.
    { href: "/help", label: "Help", memberOnly: true },
    // MEMBERSHIP IS NOT HERE: the "Become a member" button on the right of this
    // same bar already goes to /membership.
    //
    // NEITHER IS /twenty-questions, dropped from the bar 2026-09-16. It is the
    // reader Q&A with Luna and it is good, but it was the second item in a bar
    // where the first five now have to be the library. It is linked from
    // /about and from her character page.
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-void/80 backdrop-blur-md">
      {/*
        min-h rather than a fixed h: surfaces below stick at --header-h, so if
        this bar ever grew past that height it would sit under them.
      */}
      {/*
        FULL WIDTH, 2026-09-17. Melissa: "make the top menu full width so the
        links can breathe."

        It was pinned to max-w-6xl while everything below it moved to the
        shared PAGE gutter on 09-16, so on a wide screen nine links, an email,
        a sign-out and the account button were crammed into the middle 1152px
        of a 1600px page — and the wordmark did not even line up with the shelf
        headings underneath it. Same class of bug as the shelves: a width typed
        out in one place and changed in another.

        It reads from the same constant now, so the bar, the hero, the shelves
        and the join panel all share one left edge and one right edge.
      */}
      <div
        className={`${PAGE} flex min-h-(--header-h) items-center justify-between gap-3`}
      >
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
              {/* THE MOST PROMINENT CTA ON THE SITE — the amber pill in a
                  sticky bar on every page — and until 2026-09-02 it said "Read
                  on" / "Keep reading her".

                  Those came out of the 2026-08-10 strategy rewrite, on the
                  argument that a CTA should name what somebody gets rather
                  than the transaction. The argument is sound and the labels
                  still failed at the one job this button has: a stranger could
                  not tell there was a membership behind them, so the only
                  control on the page that asks for money read like a link
                  further into the journal.

                  The long label is the tier's own, so this and the button that
                  starts checkout cannot drift. The short one is not derived —
                  it is the same word cut down to fit a 390px bar, and it has
                  to stay hand-written for that. */}
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">{getTier("vault")!.cta}</span>
            </Link>
          </Guest>
        </div>
      </div>
    </header>
  );
}
