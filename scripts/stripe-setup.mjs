/**
 * stripe-setup.mjs — create (or reuse) the Vault product and BOTH its prices.
 *
 * Idempotent: the price carries a stable lookup_key, so re-running finds the
 * existing one instead of creating duplicates. Safe to run again after a
 * dashboard change or in a fresh sandbox.
 *
 * Test (default): reads STRIPE_SECRET_KEY (sk_test_).
 *   node --env-file=.env.local scripts/stripe-setup.mjs
 *
 * Live: pass --live; reads STRIPE_SECRET_KEY_LIVE (sk_live_), and also creates
 * the production webhook endpoint and prints its signing secret.
 *   node --env-file=.env.local scripts/stripe-setup.mjs --live
 *
 * Prints both price ids (STRIPE_PRICE_VAULT, STRIPE_PRICE_VAULT_YEARLY) and,
 * in --live, the webhook secret.
 *
 * THE YEARLY PRICE WAS MISSING UNTIL 2026-08-27, which meant the membership
 * card advertised "$80 yearly, 2 months free" in print and had no way to sell
 * it — every button on the page went to the monthly price. Both are created
 * here now so the two can never drift apart again.
 */

import Stripe from "stripe";

const LIVE = process.argv.includes("--live");
const key = LIVE
  ? process.env.STRIPE_SECRET_KEY_LIVE
  : process.env.STRIPE_SECRET_KEY;
const wantPrefix = LIVE ? "sk_live_" : "sk_test_";

if (!key) {
  console.error(
    `${LIVE ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY"} not set. ` +
      "Run with --env-file=.env.local",
  );
  process.exit(1);
}
// The guard cuts both ways: never touch live by accident in the default run,
// and never point --live at a test key and think you've gone live.
if (!key.startsWith(wantPrefix)) {
  console.error(
    `Refusing to run: expected a ${wantPrefix} key, got ${key.slice(0, 8)}….`,
  );
  process.exit(1);
}

const WEBHOOK_URL = "https://lunavale38.com/api/stripe/webhook";
const WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

// Match the app's pinned wire version (lib/billing/stripe.ts).
const stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });

const CURRENCY = "usd";
// Both prices, from lib/content/membership.ts. The yearly figure is ten months
// for twelve — the two free months the card promises — and if either number
// changes there, it has to change here.
const PLANS = [
  { lookupKey: "vault_monthly", cents: 800, interval: "month", env: "STRIPE_PRICE_VAULT" },
  { lookupKey: "vault_yearly", cents: 8000, interval: "year", env: "STRIPE_PRICE_VAULT_YEARLY" },
];
// Stripe's Managed Payments (on by default) requires a product tax code, and
// this is the exact category: streamed audio-visual works on subscription with
// conditional (membership) rights. It also makes Stripe Tax charge the right
// sales tax if/when it's enabled.
const TAX_CODE = "txcd_10402200";

// --- The product, once, shared by both prices -------------------------------
async function vaultProduct() {
  const products = await stripe.products.search({
    query: 'name:"Vault" AND active:"true"',
    limit: 1,
  });
  const product =
    products.data[0] ??
    (await stripe.products.create({
      name: "Vault",
      description:
        "Luna Vale membership — the full scene library, the locked rooms, and Luna's journals.",
      tax_code: TAX_CODE,
    }));
  // Ensure the tax code is set even on a product that predates this script.
  if (product.tax_code !== TAX_CODE) {
    await stripe.products.update(product.id, { tax_code: TAX_CODE });
  }
  return product;
}

// --- Prices: the stable objects. If one exists by lookup_key, reuse it. -----
let product;
const prices = [];

for (const plan of PLANS) {
  const existing = await stripe.prices.list({
    lookup_keys: [plan.lookupKey],
    active: true,
    limit: 1,
  });

  let price = existing.data[0];
  if (price) {
    console.log(`Reusing price ${price.id} (lookup_key=${plan.lookupKey})`);
  } else {
    product ??= await vaultProduct();
    console.log(`Product: ${product.id} (${product.name})`);
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.cents,
      currency: CURRENCY,
      recurring: { interval: plan.interval },
      lookup_key: plan.lookupKey,
    });
    console.log(`Created price ${price.id} (${plan.lookupKey})`);
  }
  prices.push({ plan, price });
}

// --- Webhook endpoint (live only) -------------------------------------------
// In test mode the CLI's `stripe listen` provides the secret; production needs
// a real registered endpoint. Reuse one if it already points at our URL,
// otherwise create it. The signing secret is only returned on creation, so a
// reused endpoint can't reprint it — roll it in the dashboard if you need it.
let webhookSecret;
if (LIVE) {
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = endpoints.data.find((e) => e.url === WEBHOOK_URL);
  if (existing) {
    console.log(`Webhook endpoint already exists: ${existing.id} (secret not re-shown)`);
  } else {
    const created = await stripe.webhookEndpoints.create({
      url: WEBHOOK_URL,
      enabled_events: WEBHOOK_EVENTS,
    });
    webhookSecret = created.secret;
    console.log(`Created webhook endpoint ${created.id}`);
  }
}

console.log("");
console.log("────────────────────────────────────────────");
for (const { plan, price } of prices) {
  const dollars = (price.unit_amount ?? 0) / 100;
  console.log(`  ${LIVE ? "LIVE" : "TEST"}  ·  Vault  ·  $${dollars}/${price.recurring?.interval}  ·  ${price.currency}`);
  console.log(`  ${plan.env}=${price.id}`);
}
if (webhookSecret) console.log(`  STRIPE_WEBHOOK_SECRET=${webhookSecret}`);
console.log("────────────────────────────────────────────");
