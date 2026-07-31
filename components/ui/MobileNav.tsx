"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOut } from "@/components/ui/SignOut";

export interface NavItem {
  href: string;
  label: string;
}

interface MobileNavProps {
  items: NavItem[];
  signedIn: boolean;
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
export function MobileNav({ items, signedIn, showSignIn }: MobileNavProps) {
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
    <div className="md:hidden">
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
                {items.map((item) => {
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

            <div className="mt-5 border-t border-hairline pt-5">
              {signedIn ? (
                <SignOut className="text-sm text-stone transition-colors hover:text-amber" />
              ) : showSignIn ? (
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="text-sm text-stone transition-colors hover:text-amber"
                >
                  Sign in
                </Link>
              ) : null}
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
