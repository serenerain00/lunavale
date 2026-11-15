import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { TIERS } from "@/lib/content/membership";

export const metadata: Metadata = {
  title: "Terms & refunds",
  description:
    "Who runs Luna Vale, how membership and billing work, and the refund policy.",
  alternates: { canonical: "/terms" },
};

/**
 * Terms, refunds and company details.
 *
 * WHY IT EXISTS (2026-11-15). A viewer asked "Why are there no general terms
 * and conditions or company details and information regarding a refund
 * policy." There weren't. Stripe expects them shown too.
 *
 * MELISSA'S CALLS, the same day:
 *   - Company details are "Luna Vale" and hello@lunavale38.com. Her name does
 *     not appear here, or in the footer.
 *   - No refunds for partial periods; cancel anytime and keep access to the
 *     end of what was paid. Double charges are refunded automatically, which
 *     is already true (DUPLICATE_GUARD in the Stripe webhook).
 *
 * Plain-English terms written for this site, not reviewed by a lawyer. Every
 * sentence must stay TRUE of the product: if billing, cancellation or the
 * duplicate refund changes, change this page in the same commit.
 *
 * The price is read from lib/content/membership.ts, so it cannot drift.
 */

const UPDATED = "November 15, 2026";
const EMAIL = "hello@lunavale38.com";

export default function TermsPage() {
  const paid = TIERS.filter((t) => t.available && t.priceMonthlyCents > 0);
  const price = paid[0]
    ? `$${(paid[0].priceMonthlyCents / 100).toFixed(2)} a month`
    : "the price shown at checkout";

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            The fine print
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            Terms &amp; refunds
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            Short and in plain English. If anything here is unclear, write to{" "}
            <Mail />{" "}and you&rsquo;ll get a straight answer.
          </p>
          <p className="mt-3 text-xs text-stone-dim">Last updated {UPDATED}</p>
        </header>

        <div className="space-y-10">
          <Section id="who" title="Who we are">
            <p>
              Luna Vale is an independent studio that makes{" "}
              <em>Between Us</em>, the series on this site, at
              lunavale38.com. You can reach us at <Mail />, or through the{" "}
              <A href="/help">help page</A>.
            </p>
          </Section>

          <Section id="membership" title="Membership and billing">
            <p>
              Much of Luna Vale is free to watch and read without paying.
              Membership opens everything else for {price}, plus any sales
              tax or VAT that applies where you live. The total is shown
              before you pay.
            </p>
            <p>
              Membership renews automatically each month on the day you
              joined, charged to the card you paid with, until you cancel.
              Payments are handled by Stripe. We never see or store your full
              card number.
            </p>
            <p>
              If the price ever changes, we&rsquo;ll email you before it
              applies to you, and you can cancel before it does.
            </p>
          </Section>

          <Section id="cancel" title="Canceling">
            <p>
              Cancel anytime from <A href="/account">your account page</A>,
              in one click. Nobody will try to talk you out of it. You keep
              full access until the end of the period you&rsquo;ve already paid
              for, and you won&rsquo;t be charged again.
            </p>
            <p>
              If you&rsquo;d like your saved card removed after canceling,
              write to <Mail />{" "}and we&rsquo;ll remove it.
            </p>
          </Section>

          <Section id="refunds" title="Refunds">
            <p>
              Payments are not refunded, including for a partly used month.
              Canceling stops the next charge, and you keep access to the end
              of the month you paid for.
            </p>
            <p>
              The exception is a mistake. If you&rsquo;re charged twice for the
              same membership, the second payment is refunded automatically. If
              you think you were charged in error any other way, write to{" "}
              <Mail />{" "}and we&rsquo;ll look into it.
            </p>
          </Section>

          <Section id="content" title="Using the site">
            <p>
              Your membership is for you. Please don&rsquo;t share your
              account, or download, copy, or repost videos, stills, or journal
              pages. Everything here is original work, and it&rsquo;s how the
              series gets made. If you&rsquo;d like to use something, ask
              first. The answer is often yes.
            </p>
            <p>
              <em>Between Us</em>{" "}is fiction. Some of it is for adults only
              and is marked as such before it plays. By watching it, you
              confirm you&rsquo;re 18 or older.
            </p>
          </Section>

          <Section id="changes" title="Changes to these terms">
            <p>
              If these terms change in a way that matters, we&rsquo;ll update
              the date at the top and tell members by email.
            </p>
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2 id={id} className="font-display text-2xl font-light text-ivory">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-stone">
        {children}
      </div>
    </section>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-amber underline decoration-hairline underline-offset-4"
    >
      {children}
    </Link>
  );
}

function Mail() {
  return (
    <a
      href={`mailto:${EMAIL}`}
      className="text-amber underline decoration-hairline underline-offset-4"
    >
      {EMAIL}
    </a>
  );
}
