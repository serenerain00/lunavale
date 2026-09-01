"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@/components/ui/SignOut";
import { useViewer } from "@/components/access/Viewer";

export interface NavItem {
  href: string;
  label: string;
  /** Hidden from anyone who is not a member. Resolved on the client — the
      list is built during a static render, where membership is unknown. */
  memberOnly?: boolean;
}

interface MobileNavProps {
  items: NavItem[];
  showSignIn: boolean;
}

/**
 * The menu for narrow screens.
 *
 * It exists because the inline nav had been solved one link at a time — each
 * new item hidden behind a bigger min-width until, on a 390px phone, half the
 * site was unreachable and there was no way to sign out at all. A menu holds
 * however many links there turn out to be, which the old approach could not.
 */
export function MobileNav({ items, showSignIn }: MobileNavProps) {
  // Who is reading. Null until /api/me answers, which is why every check below
  // is written so that "unknown" behaves exactly like "signed-out stranger" —
  // it matches the cached HTML and it fails closed.
  const viewer = useViewer();
  const signedIn = Boolean(viewer?.signedIn);
  const email = viewer?.email ?? null;
  const visible = items.filter((item) => !item.memberOnly || viewer?.member);

  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes it, and the page behind does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="-ml-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-stone transition-colors duration-(--duration-quick) hover:text-amber"
      >
        {open ? <CloseGlyph /> : <MenuGlyph />}
      </button>

      {open && (
        <>
          {/* Tap anywhere off the panel to dismiss. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-(--header-h) z-30 cursor-default bg-void/70 backdrop-blur-sm"
          />
          <div
            ref={panelRef}
            id="mobile-nav"
            className="fixed inset-x-0 top-(--header-h) z-40 max-h-[calc(100dvh-var(--header-h))] overflow-y-auto border-b border-hairline bg-obsidian px-5 pb-6 pt-2"
          >
            <nav aria-label="Site">
              <ul className="divide-y divide-hairline">
                {visible.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        // Closed here rather than by watching the pathname:
                        // the tap is the event, and reacting to the route
                        // change afterwards is a setState inside an effect.
                        onClick={() => setOpen(false)}
                        className={`block py-3.5 text-base transition-colors duration-(--duration-quick) ${
                          active ? "text-amber" : "text-ivory hover:text-amber"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/*
              Sign-in is the only way a returning member gets back to what they
              have paid for, and on a phone this menu is the ONLY place it
              appears — the header's sign-in link is `hidden lg:inline`, and the
              one prominent button up there says "Read on" and goes to
              /membership. So it gets a real target and the same weight as the
              nav above it. It used to be small muted text at the bottom of the
              panel, which read as a caption rather than the door.
            */}
            <div className="mt-5 border-t border-hairline pt-5">
              {signedIn ? (
                <>
                  {/* Which account. On a phone this is the only place it can
                      be said, and it is the phone where signing in with the
                      wrong one is easiest — the Google button is one tap and
                      picks whichever account the device is already holding. */}
                  {email && (
                    <p className="mb-2 break-all text-xs text-stone-dim">
                      Signed in as{" "}
                      <span className="text-stone">{email}</span>
                    </p>
                  )}
                  <SignOut className="text-sm text-stone transition-colors hover:text-amber" />
                </>
              ) : showSignIn ? (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-full border border-hairline px-4 text-base text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                >
                  Sign in
                </Link>
              ) : null}
              {!signedIn && showSignIn && (
                <p className="mt-2.5 text-xs text-stone-dim">
                  Already a member? This is the way back in.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      {[6, 12, 18].map((y) => (
        <path
          key={y}
          d={`M4 ${y}h16`}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
