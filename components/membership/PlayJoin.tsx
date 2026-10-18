"use client";

import { useEffect, useState } from "react";
import { useViewer } from "@/components/access/Viewer";
import { formatPrice, getTier } from "@/lib/content/membership";
import { clarityEvent } from "@/components/analytics/clarity";

/**
 * "Watch everything · $8/month  [Join]" — under the player, once somebody
 * presses play. Melissa, 2026-10-13: "i wanna make it easier for people to
 * become a member… a CTA when they press play, the cta shows up below the
 * video frame". Her wording ("2", the short one).
 *
 * BELOW THE FRAME, NEVER OVER IT, and it never interrupts: it appears on the
 * first play and simply stays. Pressing Join goes straight to Stripe — the
 * same POST the membership page's button makes, monthly, so it is one tap
 * from the scene to the card form and creates exactly one checkout.
 *
 * NON-MEMBERS ONLY, AND ONLY ONCE WE KNOW. While /api/me is still answering
 * the viewer is null, and showing it then would flash "Join" at a member.
 *
 * `from=play` rides along into Stripe metadata (entry=play) so a payment that
 * started here can be told apart from one that started on /membership.
 * Shipped 2026-10-13, inside the Oct 11–25 baseline, by Melissa's decision —
 * compare before/after from that date.
 */
export function PlayJoin() {
  const viewer = useViewer();
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setSending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const tier = getTier("vault");
  if (!viewer || viewer.member || !tier) return null;

  return (
    <form
      method="post"
      action="/membership/start"
      onSubmit={(e) => {
        if (sending) e.preventDefault();
        else {
          setSending(true);
          clarityEvent("checkout_start");
        }
      }}
      className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-hairline bg-charcoal/40 px-4 py-3 sm:px-5"
    >
      <input type="hidden" name="tier" value={tier.id} />
      <input type="hidden" name="interval" value="month" />
      <input type="hidden" name="from" value="play" />
      <p className="text-sm text-ivory">
        Watch everything <span className="text-stone">·</span>{" "}
        <span className="tabular-nums">{formatPrice(tier.priceMonthlyCents)}</span>
        <span className="text-stone">/month</span>
        <span className="block text-xs text-stone-dim">USD, plus local tax where it applies</span>
      </p>
      <button
        type="submit"
        disabled={sending}
        aria-busy={sending}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:cursor-wait disabled:opacity-70"
      >
        {sending ? "Opening…" : "Join"}
      </button>
    </form>
  );
}
