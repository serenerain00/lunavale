"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { formatPrice } from "@/lib/content/membership";

/**
 * Monthly or yearly, and the button that buys the one you picked.
 *
 * WHY IT EXISTS. Until 2026-08-27 the card printed "$80 yearly, 2 months free"
 * under the monthly price and had no way to sell it — there was one Stripe
 * price configured and every button on the page went to it. So the site
 * advertised a plan it could not take money for, and anybody who chose the
 * year got charged for a month.
 *
 * The toggle changes the price shown AND the href, which is the whole job.
 *
 * IT IS A CLIENT COMPONENT FOR ONE PIECE OF STATE and nothing else. Everything
 * around it — the tier, the benefits, the copy — stays server-rendered. The
 * two links it produces are real links to a real GET route, so this works the
 * same whether or not the JavaScript arrives; without it you get the monthly
 * button, which is the safe default rather than a broken page.
 *
 * `prefetch={false}` IS LOAD-BEARING, inherited from TierCard: Next prefetches
 * a Link on hover, the href is a route handler that creates a Stripe Checkout
 * Session, and a hover would otherwise mint sessions nobody asked for and
 * inflate the one number that measures this page.
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
              className={`min-h-9 rounded-full px-4 text-xs transition-colors duration-(--duration-quick) ${
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

      {children}

      <div className="mt-7">
        <Link
          href={`/membership/start?tier=${tierId}&interval=${interval}`}
          prefetch={false}
          className="block rounded-full bg-amber px-5 py-3 text-center text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
        >
          {cta}
        </Link>
      </div>
    </>
  );
}
