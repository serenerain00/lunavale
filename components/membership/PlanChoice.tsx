"use client";

import { useEffect, useId, useState } from "react";
import { formatPrice } from "@/lib/content/membership";
import { clarityEvent } from "@/components/analytics/clarity";

/**
 * Monthly or yearly, and the button that buys the one you picked.
 *
 * WHY IT EXISTS. Until 2026-08-27 the card printed "$80 yearly, 2 months free"
 * under the monthly price and had no way to sell it — there was one Stripe
 * price configured and every button on the page went to it. So the site
 * advertised a plan it could not take money for, and anybody who chose the
 * year got charged for a month.
 *
 * The toggle changes the price shown AND what the form sends, which is the
 * whole job.
 *
 * IT IS A CLIENT COMPONENT FOR TWO PIECES OF STATE and nothing else. Everything
 * around it — the tier, the benefits, the copy — stays server-rendered.
 *
 * THE BUTTON IS A FORM THAT POSTS, NOT A LINK (2026-10-13). The link to a GET
 * route that created a Stripe session got fetched two or three times per
 * click by things that were not the person — hover prefetch first (hence the
 * old `prefetch={false}`), then prerenders, then link previews and in-app
 * browsers nobody could list. Nothing fetches a POST on its own. It still
 * works without JavaScript — a plain form submit, monthly by default — and
 * with it, the button disables itself so a double tap is one checkout.
 */
export function PlanChoice({
  tierId,
  cta,
  monthlyCents,
  yearlyCents,
  commitment,
  /** No yearly Stripe price configured — render exactly what we can sell. */
  yearlyAvailable,
  /**
   * The blurb and the benefits list, which sit BETWEEN the price and the
   * button on the card.
   *
   * Passed as a slot rather than rendered here, so they stay server
   * components: this file is client-side only because of one boolean, and
   * there is no reason for the eight benefit rows to cross that line with it.
   * It also keeps the price where it has always been — at the top of the card,
   * level with the free tier's — rather than stranded under the list.
   */
  children,
}: {
  tierId: string;
  cta: string;
  monthlyCents: number;
  yearlyCents: number | null;
  commitment: string;
  yearlyAvailable: boolean;
  children?: React.ReactNode;
}) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [sending, setSending] = useState(false);
  // Back from Stripe restores this page from the back/forward cache with the
  // button still saying "Opening checkout…". Give it back.
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => e.persisted && setSending(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  const groupId = useId();
  const showToggle = yearlyAvailable && yearlyCents !== null;
  const yearly = interval === "year" && showToggle;

  // The two free months, worked out rather than typed, so it cannot end up
  // claiming a saving the prices do not actually give.
  const monthsFree =
    yearlyCents !== null
      ? Math.round(12 - yearlyCents / monthlyCents)
      : 0;

  return (
    <>
      {showToggle && (
        <div
          role="group"
          aria-label="Billing period"
          className="mt-5 inline-flex rounded-full border border-hairline p-1"
        >
          {(["month", "year"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setInterval(option)}
              aria-pressed={interval === option}
              className={`min-h-11 rounded-full px-4 text-xs transition-colors sm:min-h-9 duration-(--duration-quick) ${
                interval === option
                  ? "bg-amber text-void"
                  : "text-stone hover:text-ivory"
              }`}
            >
              {option === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      )}

      <p className="mt-5 flex items-baseline gap-1.5" id={groupId}>
        <span className="font-display text-4xl font-light tabular-nums text-ivory">
          {formatPrice(yearly ? yearlyCents! : monthlyCents)}
        </span>
        <span className="text-sm text-stone">
          / {yearly ? "year" : "month"}
        </span>
      </p>

      <p className="mt-1.5 text-xs text-stone-dim">
        {yearly ? (
          <>
            Billed once · {monthsFree > 0 && <>{monthsFree} months free · </>}
            cancel any time
          </>
        ) : (
          <>
            {commitment}
            {monthsFree > 0 && showToggle && (
              <>
                {" · "}
                {formatPrice(yearlyCents!)} yearly saves {monthsFree} months
              </>
            )}
          </>
        )}
      </p>
      <p className="mt-1 text-xs text-stone-dim">US dollars · local tax added at checkout where it applies</p>

      {children}

      <form
        method="post"
        action="/membership/start"
        className="mt-7"
        onSubmit={(e) => {
          if (sending) e.preventDefault();
          else {
            setSending(true);
            clarityEvent("checkout_start");
          }
        }}
      >
        <input type="hidden" name="tier" value={tierId} />
        <input type="hidden" name="interval" value={interval} />
        <button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          className="block w-full rounded-full bg-amber px-5 py-3 text-center text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? "Opening checkout\u2026" : cta}
        </button>
      </form>
      {/* 2026-10-21: somebody who paid in Instagram's browser and came back
          in another one has no cookie here, so Join would charge them again
          (Tina, five minutes apart). Signing in with the paid email claims
          the membership on any page (lib/access/entitlement.ts). */}
      <p className="mt-3 text-center text-xs text-stone-dim">
        Already paid on another phone or browser?{" "}
        <a
          href="/membership/claim"
          className="text-stone underline underline-offset-2 hover:text-ivory"
        >
          Sign in with that email
        </a>{" "}
        \u2014 it&rsquo;s waiting.
      </p>
    </>
  );
}
