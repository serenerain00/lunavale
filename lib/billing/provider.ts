/**
 * Billing and auth configuration — the one place that knows what is wired up.
 *
 * Everything about payments is env-driven rather than build-time, for one
 * blunt reason: the site is live. Until every piece is configured the app must
 * behave exactly as it did before, so that flipping billing on is a matter of
 * adding environment variables rather than shipping a different app and hoping.
 *
 * The pieces have to arrive together. A Stripe key with no database would take
 * payments it could not record; a database with no auth would have nobody to
 * attach a subscription to. `billingLive()` is therefore an AND, and the app
 * stays in preview mode until all three are present.
 */

import type { TierId } from "@/lib/content/membership";

/** Clerk — who the person is. */
export function authConfigured(): boolean {
  return Boolean(
    process.env.CLERK_SECRET_KEY &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
}

/** Stripe — taking the money. */
export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
  );
}

/** Neon — remembering the result. */
export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * True only when real memberships can be sold, recorded and honoured.
 * While false, /membership/start grants a clearly-labelled preview instead and
 * every membership surface says so.
 */
export function billingLive(): boolean {
  return authConfigured() && stripeConfigured() && databaseConfigured();
}

/**
 * The Stripe price for a tier, from the environment.
 *
 * Kept out of lib/content/membership.ts on purpose: that file is content, and
 * price ids differ between Stripe's test and live modes. Putting them in
 * content would mean either committing live billing identifiers or having the
 * same tier mean different things per environment.
 *
 *   STRIPE_PRICE_VAULT=price_...
 *   STRIPE_PRICE_PATRON=price_...
 */
export function priceIdFor(tier: TierId): string | undefined {
  return process.env[`STRIPE_PRICE_${tier.toUpperCase()}`];
}

/** Reverse lookup, for turning a webhook's price back into a tier. */
export function tierForPriceId(priceId: string): TierId | undefined {
  for (const tier of ["vault", "patron"] as const) {
    if (priceIdFor(tier) === priceId) return tier;
  }
  return undefined;
}

/**
 * Absolute base URL, for Stripe redirect targets.
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL; NEXT_PUBLIC_SITE_URL overrides it
 * so preview deployments and local runs can point somewhere sensible.
 */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}
