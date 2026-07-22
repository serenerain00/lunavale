import type { Metadata } from "next";
import Link from "next/link";
import { cancelMembership } from "@/app/actions/session";
import { PreviewNotice } from "@/components/membership/PreviewNotice";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import {
  benefitsFor,
  formatPrice,
  getTier,
  TIERS,
} from "@/lib/content/membership";

export const metadata: Metadata = {
  title: "Your membership",
  description: "Your membership status, what it opens, and how to end it.",
  // Personal state — never index it.
  robots: { index: false, follow: false },
};

interface AccountPageProps {
  searchParams: Promise<{ started?: string; ended?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [{ tier, active, preview }, params] = await Promise.all([
    getMembership(),
    searchParams,
  ]);
  const current = getTier(tier)!;
  const unlocked = benefitsFor(tier);

  return (
    <>
      <SiteHeader member={active} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Your membership
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-ivory sm:text-4xl">
            {active ? current.name : "You're exploring as a visitor"}
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-stone">
            {active
              ? current.tagline
              : "Everything public is open to you. Nothing is expiring."}
          </p>
        </header>

        {/* Transitions are announced rather than left to be inferred from a
            changed page — and the cancellation confirmation is unambiguous
            about there being nothing left to pay. */}
        {params.started === "1" && active && (
          <Banner tone="good">
            Your {current.name} membership is active. Everything below is open
            to you now.
          </Banner>
        )}
        {params.ended === "1" && !active && (
          <Banner tone="plain">
            Your membership has ended and you won&rsquo;t be charged again.
            You&rsquo;re back to visitor access — everything public is still
            yours.
          </Banner>
        )}

        {preview && <PreviewNotice className="mb-8" />}

        {active ? (
          <>
            <section
              aria-labelledby="status-heading"
              className="rounded-xl border border-hairline bg-charcoal/40 p-6"
            >
              <h2 id="status-heading" className="sr-only">
                Billing
              </h2>
              <dl className="grid gap-5 sm:grid-cols-3">
                <Field label="Tier" value={current.name} />
                <Field
                  label="Price"
                  value={`${formatPrice(current.priceMonthlyCents)} / month`}
                />
                <Field label="Terms" value={current.commitment} />
              </dl>
            </section>

            <section aria-labelledby="open-heading" className="pt-12">
              <h2
                id="open-heading"
                className="font-display text-2xl font-medium text-ivory"
              >
                What&rsquo;s open to you
              </h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {unlocked.map((benefit) => (
                  <li key={benefit.id} className="flex gap-2.5 text-sm">
                    <span aria-hidden className="mt-px text-amber">
                      ✓
                    </span>
                    <span className="text-ivory">
                      {benefit.label}
                      <span className="block text-xs leading-relaxed text-stone">
                        {benefit.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/browse"
                  className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
                >
                  Go to the catalog
                </Link>
                {TIERS.filter((t) => t.id !== "free" && t.id !== tier).map(
                  (t) => (
                    <Link
                      key={t.id}
                      href="/membership#tiers"
                      className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                    >
                      Switch to {t.name}
                    </Link>
                  ),
                )}
              </div>
            </section>

            {/* Cancellation sits in the open, not buried under a settings
                sub-page. One click, no retention argument — the ethical rule
                and, as it happens, the thing that makes people comfortable
                joining in the first place. */}
            <section
              aria-labelledby="end-heading"
              className="mt-14 rounded-xl border border-hairline p-6"
            >
              <h2
                id="end-heading"
                className="font-display text-lg font-medium text-ivory"
              >
                Ending your membership
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone">
                One click, effective immediately, with no further charges. Your
                progress through the world is kept, so everything is where you
                left it if you come back.
              </p>
              <form action={cancelMembership} className="mt-5">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-stone transition-colors duration-(--duration-quick) hover:border-wine hover:text-ivory"
                >
                  End membership
                </button>
              </form>
            </section>
          </>
        ) : (
          <section className="rounded-xl border border-hairline bg-charcoal/40 p-8">
            <h2 className="font-display text-xl text-ivory">
              Nothing to manage yet
            </h2>
            <p className="mt-2 max-w-lg leading-relaxed text-stone">
              You don&rsquo;t have a membership, so there&rsquo;s no billing,
              no renewal date, and nothing to cancel.
            </p>
            <Link
              href="/membership"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
            >
              See what membership opens
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.15em] text-stone-dim">
        {label}
      </dt>
      <dd className="mt-1.5 text-ivory">{value}</dd>
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "good" | "plain";
  children: React.ReactNode;
}) {
  return (
    <p
      // Polite: it describes a change the visitor just caused, so it should be
      // read out, but never interrupt what they are already hearing.
      role="status"
      className={`mb-6 rounded-lg border px-4 py-3 text-sm leading-relaxed ${
        tone === "good"
          ? "border-amber/40 bg-amber/10 text-amber-soft"
          : "border-hairline bg-charcoal/60 text-stone"
      }`}
    >
      {children}
    </p>
  );
}
