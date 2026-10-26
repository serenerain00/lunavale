/**
 * test-duplicate-guard.ts — lib/billing/duplicate.ts against Stripe TEST mode.
 *
 * Real test-mode customers, subscriptions, payments and refunds; only the
 * Checkout Session is stood in for, because one cannot be completed through
 * the API. Refuses to run on a live key. Writes nothing to the database
 * (the /admin log is live-mode only) and reads it only for the site lookup.
 *
 *   DUPLICATE_GUARD=1 npx tsx --conditions=react-server --env-file=.env.local scripts/test-duplicate-guard.ts
 */
import Stripe from "stripe";
import { refundIfDuplicate } from "@/lib/billing/duplicate";

const key = process.env.STRIPE_SECRET_KEY ?? "";
if (!key.startsWith("sk_test_")) throw new Error("test key only");
const real = new Stripe(key);
const PRICE = process.env.STRIPE_PRICE_VAULT!;
const run = Date.now().toString(36);
let failures = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

async function member(email: string, opts: { leaving?: boolean } = {}) {
  const c = await real.customers.create({ email, payment_method: "pm_card_visa", invoice_settings: { default_payment_method: "pm_card_visa" } });
  const sub = await real.subscriptions.create({ customer: c.id, items: [{ price: PRICE }], cancel_at_period_end: opts.leaving ?? false });
  return sub;
}

/** A Stripe whose checkout.sessions.retrieve returns a finished session for `sub`. */
function withSession(sub: Stripe.Subscription, email: string, extra: Partial<Stripe.Checkout.Session> = {}) {
  const session = {
    id: `cs_test_${run}${sub.id.slice(-8)}`, mode: "subscription", payment_status: "paid", status: "complete",
    client_reference_id: null, metadata: {}, customer_details: { email, name: "Test Person" }, customer_email: null,
    subscription: sub.id, ...extra,
  } as unknown as Stripe.Checkout.Session;
  const s = Object.create(real) as Stripe;
  (s as { checkout: unknown }).checkout = { sessions: { retrieve: async () => session } };
  return { s, id: session.id };
}

const noUsers = async () => [] as string[];

async function refundsFor(sub: Stripe.Subscription) {
  const inv = await real.invoices.retrieve(sub.latest_invoice as string, { expand: ["payments"] });
  const pi = inv.payments!.data[0].payment.payment_intent as string;
  return (await real.refunds.list({ payment_intent: pi })).data;
}

async function main() {
  console.log("1. member pays again with the same email");
  const email = `dup-${run}@example.com`;
  const a = await member(email);
  const b = await member(email);
  const { s, id } = withSession(b, email);
  const r = await refundIfDuplicate(id, { stripe: s, userIdsForEmail: noUsers });
  check("detected", r?.kept === a.id, JSON.stringify(r));
  check("new one cancelled", (await real.subscriptions.retrieve(b.id)).status === "canceled");
  check("original untouched", (await real.subscriptions.retrieve(a.id)).status === "active");
  const ref = await refundsFor(b);
  check("refunded in full, once", ref.length === 1 && ref[0].amount === r?.amountCents && ref[0].reason === "duplicate", `${ref.length} refund(s)`);
  check("original not refunded", (await refundsFor(a)).length === 0);

  console.log("2. runs again (webhook retry, /welcome reload)");
  const r2 = await refundIfDuplicate(id, { stripe: s, userIdsForEmail: noUsers });
  check("same answer", r2?.kept === a.id);
  check("still one refund", (await refundsFor(b)).length === 1);

  console.log("3. the ORIGINAL payment's own session is never touched");
  const { s: sa, id: ida } = withSession(a, email);
  check("null", (await refundIfDuplicate(ida, { stripe: sa, userIdsForEmail: noUsers })) === null);
  check("original still active", (await real.subscriptions.retrieve(a.id)).status === "active");

  console.log("4. email typed in different case");
  const e4 = `Case-${run}@Example.com`;
  const a4 = await member(e4.toLowerCase());
  const b4 = await member(e4);
  const { s: s4, id: id4 } = withSession(b4, e4);
  check("detected", (await refundIfDuplicate(id4, { stripe: s4, userIdsForEmail: noUsers }))?.kept === a4.id);

  console.log("5. existing member is running out a cancelled membership — coming back is not a duplicate");
  const e5 = `leaving-${run}@example.com`;
  await member(e5, { leaving: true });
  const b5 = await member(e5);
  const { s: s5, id: id5 } = withSession(b5, e5);
  check("null", (await refundIfDuplicate(id5, { stripe: s5, userIdsForEmail: noUsers })) === null);
  check("new one active, no refund", (await real.subscriptions.retrieve(b5.id)).status === "active" && (await refundsFor(b5)).length === 0);

  console.log("6. a brand-new buyer");
  const e6 = `new-${run}@example.com`;
  const b6 = await member(e6);
  const { s: s6, id: id6 } = withSession(b6, e6);
  check("null", (await refundIfDuplicate(id6, { stripe: s6, userIdsForEmail: noUsers })) === null);
  check("active, no refund", (await real.subscriptions.retrieve(b6.id)).status === "active" && (await refundsFor(b6)).length === 0);

  console.log("7. a signed-in checkout is left alone");
  const e7 = `signedin-${run}@example.com`;
  await member(e7);
  const b7 = await member(e7);
  const { s: s7, id: id7 } = withSession(b7, e7, { client_reference_id: "user_x" });
  check("null", (await refundIfDuplicate(id7, { stripe: s7, userIdsForEmail: noUsers })) === null);
  check("active", (await real.subscriptions.retrieve(b7.id)).status === "active");

  console.log("8. switched off");
  const e8 = `off-${run}@example.com`;
  await member(e8);
  const b8 = await member(e8);
  const { s: s8, id: id8 } = withSession(b8, e8);
  const was = process.env.DUPLICATE_GUARD;
  process.env.DUPLICATE_GUARD = "";
  check("null", (await refundIfDuplicate(id8, { stripe: s8, userIdsForEmail: noUsers })) === null);
  process.env.DUPLICATE_GUARD = was;
  check("active", (await real.subscriptions.retrieve(b8.id)).status === "active");

  console.log("9. a Stripe error leaves the payment alone");
  const broken = Object.create(real) as Stripe;
  (broken as { checkout: unknown }).checkout = { sessions: { retrieve: async () => { throw new Error("boom"); } } };
  check("null, no throw", (await refundIfDuplicate(`cs_test_${run}x`, { stripe: broken })) === null);

  console.log(failures ? `\n${failures} FAILED` : "\nall passed");
  process.exit(failures ? 1 : 0);
}
main();
