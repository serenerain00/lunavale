"use client";

import { useEffect } from "react";

/**
 * Stop the page behind an overlay from scrolling.
 *
 * LOCKS THE ROOT ELEMENT, NOT THE BODY, and that is the whole point of this
 * file. Every overlay on this site used to do:
 *
 *     document.body.style.overflow = "hidden";
 *
 * which is the usual advice and is wrong here, because this site has a
 * `position: sticky` header. Setting `overflow` on `body` turns BODY into the
 * nearest scrollport for everything inside it. A sticky element resolves
 * against its nearest scrollport, so the header stopped resolving against the
 * viewport and started resolving against a box whose own scroll offset is
 * always 0 — i.e. it jumped to the top of the DOCUMENT the instant an overlay
 * opened.
 *
 * On a phone, scrolled halfway down /clips, that looked exactly like what
 * Melissa reported on 2026-09-16: "if i open the mobile menu the menu shows at
 * the top not where i am on the page."
 *
 * On the ROOT element the used value of `overflow` propagates to the viewport
 * instead (CSS Overflow 3, §3.3). The viewport stops scrolling, its scroll
 * position is kept, and no new scrollport is created anywhere in the document —
 * so the sticky header goes on behaving exactly as it did.
 *
 * IT ALSO COMPENSATES FOR THE SCROLLBAR. Removing the scrollbar on a desktop
 * browser widens the viewport by ~15px and every centred layout on the page
 * jumps sideways. Padding the root by the difference holds it still. Phones
 * have overlay scrollbars, so the difference is 0 and this does nothing.
 *
 * NESTING IS COUNTED. Two overlays open at once (a lightbox launched from a
 * menu) must not have the first one to close unlock the page.
 */

let locks = 0;
let restore: { overflow: string; paddingRight: string } | null = null;

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;

    if (locks === 0) {
      restore = {
        overflow: root.style.overflow,
        paddingRight: root.style.paddingRight,
      };
      const gap = window.innerWidth - root.clientWidth;
      root.style.overflow = "hidden";
      if (gap > 0) root.style.paddingRight = `${gap}px`;
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0 && restore) {
        root.style.overflow = restore.overflow;
        root.style.paddingRight = restore.paddingRight;
        restore = null;
      }
    };
  }, [active]);
}
