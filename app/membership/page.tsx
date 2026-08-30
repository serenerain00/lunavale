import type { Metadata } from "next";
import { yearlyAvailable } from "@/lib/billing/provider";
import Link from "next/link";
import { BenefitTable } from "@/components/membership/BenefitTable";
import { Questions } from "@/components/membership/Questions";
import { TierCard } from "@/components/membership/TierCard";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { journal } from "@/lib/content/journal";
import { TIERS } from "@/lib/content/membership";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Membership",
  description:
    "Membership opens the locked rooms of Luna's world — the full scene library, the mature cuts, the journals, and how it all gets made. Cancel any time.",
  path: "/membership",
});

export default async function MembershipPage() {
  const { tier, active } = await getMembership();

  // Counted, never typed. The pitch below is built out of these, so it cannot
  // still be claiming thirty-nine entries the week after the fortieth goes up.
  const lockedEntries = journal.filter((e) => e.access === "premium").length;
  const openEntries = journal.length - lockedEntries;

  return (
    <>
      <SiteHeader member={active} />

      <main className="flex-1 pb-24">
        {/* ---------------------------------------------------------- pitch */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-12 sm:px-8 sm:pt-20">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Membership
          </p>
          {/* WHY THIS COPY CHANGED (2026-08-10). The old headline — "You've
              seen the rooms you're allowed into" — is good writing that only
              works on somebody who has ALREADY walked past a locked door. Most
              people land here cold, from a link, having seen nothing, and to
              them it is a sentence about a building.

              What follows it was a FEATURE LIST: library, cuts, journals,
              locked doors. Nobody subscribes to one show for its feature list.
              They subscribe because they are in the middle of something and
              cannot leave it there.

              So the page now leads with the ONE unresolved thing — she is in
              it right now, and she wrote it all down — and prices the ask
              against a number, not a bundle. */}
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-light leading-[1.12] text-ivory sm:text-5xl">
            She wrote all of it down. You&rsquo;ve read {openEntries} pages.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone">
            The other {lockedEntries} are the ones she never meant anybody to
            see — what she actually thinks about Josh, what she has worked out
            about Tyson, and the nights she only ever told this book about. They
            come with the scenes they were written after.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-stone-dim">
            This is happening now. It is being filmed while you read this, it
            is not finished, and nobody — including her — knows yet how it
            lands.
          </p>

        </section>

        {/* ---------------------------------------------------------- tiers */}
        {/*
          THE PRICE IS THE FIRST THING NOW (Melissa, 2026-08-13). This slot used
          to hold four poster frames from the catalog — "proof, before the
          price". The reasoning was sound and the result was not: somebody who
          has just pressed a button saying "Read on" has already decided they
          are interested, and answering that with four more pictures makes them
          scroll past a screenful of what they have just been looking at to
          reach the one thing they came for. They have SEEN the images; that is
          why they clicked. What they cannot see anywhere else is what it costs
          and what it opens.

          The frames are not missed: the catalog itself is one tap away, the
          comparison table further down does the detailed version of the same
          job, and the headline above still carries the emotional argument.
        */}
        <section
          aria-labelledby="tiers-heading"
          className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 pt-10 sm:px-8 sm:pt-12"
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
            {/*
              ON A PHONE THE PAID TIER GOES FIRST. The tiers are listed free →
              paid, which is the right reading order when they sit side by side
              and you can take in the whole row at once. Stacked in one column
              it stops being a comparison and becomes a sequence, and the first
              thing somebody who just pressed "Read on" meets is the free tier
              they already have. `order-first` flips that below md only; the
              desktop row keeps its original left-to-right order.
            */}
            {TIERS.map((t) => (
              <div
                key={t.id}
                className={`h-full ${t.featured ? "order-first md:order-none" : ""}`}
              >
                <TierCard
                  tier={t}
                  held={tier}
                  yearlyOffered={yearlyAvailable(t.id)}
                />
              </div>
            ))}
          </Reveal>

          <p className="mt-6 text-sm leading-relaxed text-stone-dim">
            Prices are in US dollars. No trial that quietly converts, no
            introductory rate that jumps later, and no charge you have to email
            someone to stop.
          </p>
        </section>

        {/* --------------------------------------------------------- trust */}
        {/* --------------------------------------------------- where it goes */}
        {/* Placed directly after the price, because that is the moment the
            question occurs to somebody. Stated as a mechanism rather than an
            appeal: no "help us", no thermometer, no talk of the project being
            in danger. MONETIZATION.md rules out manufactured urgency, and a
            story about a woman being pressured is a poor place to start
            pressuring the audience. */}
        <section
          aria-labelledby="funds-heading"
          className="mx-auto w-full max-w-6xl px-5 pt-20 sm:px-8 sm:pt-28"
        >
          <h2
            id="funds-heading"
            className="font-display text-2xl font-medium text-ivory sm:text-3xl"
          >
            Where the money goes
          </h2>
          <div className="mt-3 max-w-2xl space-y-3 leading-relaxed text-stone">
            <p>
              There is no studio behind this. It is made independently, on a
              small budget, by a very small number of people — so a membership
              is not a subscription to a back catalog that already exists.
            </p>
            <p>
              It is what pays for the next one to get made: the shoot, the cut,
              the score, the stills, the hours. Scene by scene, that is the
              whole mechanism, and there isn&rsquo;t another one.
            </p>
            <p className="text-ivory">
              If you have watched this far and want more of it, that is how
              more of it happens.
            </p>
          </div>
        </section>

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
