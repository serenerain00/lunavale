# Turning billing on

Everything is built and deployed already, but **switched off**. The app checks
for environment variables at request time and stays in preview mode until all
three pieces are present, so the live site keeps working while you do this and
flips over the moment the last variable lands. Nothing needs redeploying by
hand — setting a variable in Vercel triggers one.

The three pieces have to arrive together (`lib/billing/provider.ts`):

| Piece | Why it's needed | Env |
|---|---|---|
| Clerk | A subscription has to belong to somebody | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Neon Postgres | Remembering what they bought | `DATABASE_URL` |
| Stripe | Taking the money | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_VAULT` |

A Stripe key with no database would take payments it couldn't record; a
database with no auth would have nothing to attach a subscription to. That's
why it's an AND.

---

## 1. Video (do this first)

Nothing plays on the live site until this is done — the proxies are 456MB and
gitignored, so the deploy contains none of them.

```bash
vercel blob store add luna-vault-media   # creates the store, sets BLOB_READ_WRITE_TOKEN
vercel env pull .env.local
node --env-file=.env.local scripts/upload-media.mjs
```

Uploads are **private**. The stream route mints a one-hour signed URL per
request, after the entitlement check, so a link copied out of devtools stops
working. Re-run the script after re-encoding anything; it skips files already
uploaded at the same size.

## 2. Clerk

```bash
vercel integration add clerk    # auto-provisions both keys
npm install                     # @clerk/nextjs is already in package.json
```

Sign-in and sign-up pages already exist at `/sign-in` and `/sign-up`.
Middleware is a pass-through until the keys exist, and protects nothing by
design — access is decided per request in `lib/access/entitlement.ts`, which
also covers the stream route. One gate, one place.

## 3. Neon

```bash
vercel integration add neon     # sets DATABASE_URL
vercel env pull .env.local
psql "$(grep DATABASE_URL .env.local | cut -d= -f2- | tr -d '\"')" -f lib/db/schema.sql
```

Two tables. `memberships` is a local projection of what Stripe knows, written
only by the webhook, so an entitlement check is one indexed lookup rather than
a call to Stripe on every page render. `billing_events` makes the webhook
idempotent.

## 4. Stripe

1. Create a **Product** ("Vault") with a **recurring monthly Price**. The price
   shown on `/membership` comes from `lib/content/membership.ts` — make the
   Stripe price match it, or change the content file. They are not linked, and
   a mismatch between the advertised price and the charged price is the one
   bug here that is also a trust problem.
2. Copy the price id (`price_...`).
3. Add a webhook endpoint pointing at `https://lunavale38.com/api/stripe/webhook`,
   subscribed to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret (`whsec_...`).

```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRICE_VAULT production
```

Test the webhook locally before trusting it:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

### Turning on the Patron tier later

It already exists in `lib/content/membership.ts` with `available: false`. Add a
Stripe price, set `STRIPE_PRICE_PATRON`, flip the flag. Nothing else changes.

---

## How access actually works once it's live

1. Visitor presses **Open the Vault** on `/membership`.
2. Not signed in → Clerk. Signed in → Stripe Checkout, with the Clerk user id
   in `client_reference_id` *and* in subscription metadata. The second one is
   what lets a renewal arriving months later still find the person.
3. They pay on **Stripe's** page. Card details never touch this app.
4. Stripe calls the webhook. The signature is verified, the event id is
   claimed for idempotency, the subscription is re-read from Stripe (deliveries
   arrive out of order), and the row is written.
5. `readTier()` asks Clerk who this is and the database what they hold.

**Access is never granted by the redirect back from Checkout.** Anyone can
visit `/account?started=1`. It's granted by the webhook, or not at all.

`past_due` still grants access — a failed renewal is usually an expired card,
not somebody leaving, and Stripe is still retrying. Cancelled members keep
access until `current_period_end`, which is the promise the membership page
makes in writing.

---

## Before you take real money

- **Prices in `lib/content/membership.ts` are placeholders.** So are the tier
  names and every benefit line. Each of those lines is a promise the product
  has to keep.
- **The mature content is public with no age gate.** Every scene is
  `access: "free"` and the posters appear on the home page.
- Decide whether the abuse material needs a content note beyond
  `violence` / `control` — the vocabulary is in `lib/content/content-notes.ts`
  and currently nothing uses `violence`.
