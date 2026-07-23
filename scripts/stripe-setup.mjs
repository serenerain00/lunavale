/**
 * stripe-setup.mjs — create (or reuse) the Vault product and its monthly price.
 *
 * Idempotent: the price carries a stable lookup_key, so re-running finds the
 * existing one instead of creating duplicates. Safe to run again after a
 * dashboard change or in a fresh sandbox.
 *
 * Reads STRIPE_SECRET_KEY from the environment:
 *   node --env-file=.env.local scripts/stripe-setup.mjs
 *
 * Prints the price id to set as STRIPE_PRICE_VAULT.
 */

import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY not set. Run with --env-file=.env.local");
  process.exit(1);
}
if (!key.startsWith("sk_test_")) {
  console.error(
    `Refusing to run against a non-test key (${key.slice(0, 8)}…). ` +
      "Set a sk_test_ key first — we verify in test mode before going live.",
  );
  process.exit(1);
}

// Match the app's pinned wire version (lib/billing/stripe.ts).
const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });

const LOOKUP_KEY = "vault_monthly";
const PRICE_CENTS = 800; // $8.00 — lib/content/membership.ts Vault tier
const CURRENCY = "usd";
// Stripe's Managed Payments (on by default) requires a product tax code, and
// this is the exact category: streamed audio-visual works on subscription with
// conditional (membership) rights. It also makes Stripe Tax charge the right
// sales tax if/when it's enabled.
const TAX_CODE = "txcd_10402200";

// --- Price: the stable object. If it exists by lookup_key, reuse it. --------
const existing = await stripe.prices.list({
  lookup_keys: [LOOKUP_KEY],
  active: true,
  expand: ["data.product"],
  limit: 1,
});

let price = existing.data[0];

if (price) {
  console.log(`Reusing existing price ${price.id} (lookup_key=${LOOKUP_KEY})`);
} else {
  // --- Product ------------------------------------------------------------
  // Reuse a Vault product if one is already there, else create it.
  const products = await stripe.products.search({
    query: 'name:"Vault" AND active:"true"',
    limit: 1,
  });
  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: "Vault",
      description:
        "Luna Vault membership — the full scene library, the locked rooms, and Luna's journals.",
      tax_code: TAX_CODE,
    }));
  // Ensure the tax code is set even on a product that predates this script.
  if (product.tax_code !== TAX_CODE) {
    await stripe.products.update(product.id, { tax_code: TAX_CODE });
  }
  console.log(`Product: ${product.id} (${product.name})`);

  price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRICE_CENTS,
    currency: CURRENCY,
    recurring: { interval: "month" },
    lookup_key: LOOKUP_KEY,
  });
  console.log(`Created price ${price.id}`);
}

const dollars = (price.unit_amount ?? 0) / 100;
console.log("");
console.log("────────────────────────────────────────────");
console.log(`  Vault  ·  $${dollars}/${price.recurring?.interval}  ·  ${price.currency}`);
console.log(`  STRIPE_PRICE_VAULT=${price.id}`);
console.log("────────────────────────────────────────────");
