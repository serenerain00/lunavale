import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BenefitTable } from "@/components/membership/BenefitTable";
import { Questions } from "@/components/membership/Questions";
import { TierCard } from "@/components/membership/TierCard";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { catalog } from "@/lib/content/catalog";
import { TIERS } from "@/lib/content/membership";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "Membership opens the locked rooms of Luna's world — the full scene library, the mature cuts, the journals, and how it all gets made. Cancel any time.",
  alternates: { canonical: "/membership" },
};

export default async function MembershipPage() {
  const { tier, active } = await getMembership();

  // Real frames from the real catalog rather than invented marketing art: the
  // promise on this page and the thing being sold are the same material.
  const proof = catalog.slice(0, 4);

  return (
    <>
      <SiteHeader member={active} />

      <main className="flex-1 pb-24">
        {/* ---------------------------------------------------------- pitch */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Membership
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.12] text-ivory sm:text-5xl">
            You&rsquo;ve seen the rooms you&rsquo;re allowed into.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone">
            Membership opens the rest of the house — the full scene library, the
            cuts that never go public, Luna&rsquo;s journals, and the locked
            doors you&rsquo;ve already walked past. It also pays for the next
            scenes to get made.
          </p>

          {/* Proof, before the price. Four real frames from the catalog. */}
          <Reveal className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {proof.map((item) => (
              <div
                key={item.id}
                data-reveal-item
                className="relative aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-hairline"
              >
                <Image
                  src={item.poster}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
              </div>
            ))}
          </Reveal>
        </section>

        {/* ---------------------------------------------------------- tiers */}
        <section
          aria-labelledby="tiers-heading"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pt-16 sm:px-8 sm:pt-24"
          id="tiers"
        >
          <h2 id="tiers-heading" className="sr-only">
            Membership tiers
          </h2>

          {/* The column count follows how many tiers are actually on sale, so
              withdrawing one (lib/content/membership.ts) doesn't leave a hole
              in the row. Classes are spelled out rather than interpolated —
              Tailwind only sees literal strings. */}
          <Reveal
            className={`mx-auto grid grid-cols-1 gap-5 ${
              TIERS.length >= 3
                ? "md:grid-cols-3"
                : "max-w-4xl md:grid-cols-2"
            }`}
          >
            {TIERS.map((t) => (
              <TierCard key={t.id} tier={t} held={tier} />
            ))}
          </Reveal>

          <p className="mt-6 text-sm leading-relaxed text-stone-dim">
            Prices are in US dollars. No trial that quietly converts, no
            introductory rate that jumps later, and no charge you have to email
            someone to stop.
          </p>
        </section>

        {/* --------------------------------------------------------- trust */}
        <section
          aria-labelledby="trust-heading"
          className="mx-auto w-full max-w-6xl px-5 pt-20 sm:px-8 sm:pt-28"
        >
          <h2
            id="trust-heading"
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            What we won&rsquo;t do
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone">
            A membership is a standing agreement, so it&rsquo;s worth saying
            out loud what this one will never turn into.
          </p>

          <Reveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map((promise) => (
              <div
                key={promise.title}
                data-reveal-item
                className="rounded-xl border border-hairline bg-charcoal/40 p-5"
              >
                <h3 className="font-display text-lg text-ivory">
                  {promise.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">
                  {promise.body}
                </p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* ---------------------------------------------------- comparison */}
        <section
          aria-labelledby="compare-heading"
          className="mx-auto w-full max-w-4xl px-5 pt-20 sm:px-8 sm:pt-28"
        >
          <h2
            id="compare-heading"
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            Everything, side by side
          </h2>
          <div className="mt-6">
            <BenefitTable />
          </div>
        </section>

        {/* ---------------------------------------------------------- FAQ */}
        <section
          aria-labelledby="questions-heading"
          className="mx-auto w-full max-w-4xl px-5 pt-20 sm:px-8 sm:pt-28"
        >
          <h2
            id="questions-heading"
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            Before you decide
          </h2>
          <div className="mt-6">
            <Questions />
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="#tiers"
              className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
            >
              Back to the tiers
            </Link>
            <Link
              href="/browse"
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
            >
              Keep looking around first
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

/**
 * The negative promises. PLACEHOLDER wording, but each one maps to a rule in
 * docs/monetization/MONETIZATION.md — if a line here stops being true, the
 * rule it came from has been broken somewhere in the product.
 */
const PROMISES = [
  {
    title: "Cancel in one click",
    body: "From your account page. No email, no chat window, no three-step flow asking why you're leaving.",
  },
  {
    title: "Free stays free",
    body: "Public scenes and open locations are never moved behind the paywall later. Membership only ever adds.",
  },
  {
    title: "No manufactured urgency",
    body: "No countdowns, no seat counts, no price that expires tonight. The offer on this page is the offer next month.",
  },
  {
    title: "No nagging",
    body: "A locked door says it's locked, once. You won't be interrupted mid-scene or chased around the site.",
  },
];
