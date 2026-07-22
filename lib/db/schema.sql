-- Luna Vault — membership storage (Neon Postgres).
--
-- Apply with:
--   psql "$DATABASE_URL" -f lib/db/schema.sql
--
-- Deliberately one small table. Stripe is the source of truth for billing;
-- this is a local projection of it, written only by the webhook, so that an
-- entitlement check is one indexed lookup instead of a call to Stripe on every
-- page render.
--
-- Identity comes from Clerk. `user_id` is the Clerk user id, which is why
-- there is no users table here — Clerk owns the person, we own what they can
-- open.

CREATE TABLE IF NOT EXISTS memberships (
  -- Clerk user id, e.g. "user_2abc...". One membership per person.
  user_id            TEXT PRIMARY KEY,

  -- Tier id from lib/content/membership.ts ("vault", "patron"). Kept as text
  -- rather than an enum so adding a tier is a content change, not a migration.
  tier               TEXT        NOT NULL,

  -- Stripe's view, for reconciliation and for opening the billing portal.
  stripe_customer_id     TEXT NOT NULL,
  stripe_subscription_id TEXT,

  -- Stripe subscription status verbatim: active, trialing, past_due,
  -- canceled, incomplete, unpaid. Access is granted on active/trialing only —
  -- see lib/db/memberships.ts.
  status             TEXT        NOT NULL,

  -- End of the paid period. Access survives to here even after cancellation,
  -- which is the promise made on the membership page: "you keep access until
  -- the end of the period you already paid for".
  current_period_end TIMESTAMPTZ,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The webhook arrives knowing the Stripe customer, not the Clerk user.
CREATE INDEX IF NOT EXISTS memberships_stripe_customer_idx
  ON memberships (stripe_customer_id);

-- Stripe redelivers webhooks, and delivery order is not guaranteed. Recording
-- handled event ids makes the handler idempotent: a replayed event is a no-op
-- rather than a second write.
CREATE TABLE IF NOT EXISTS billing_events (
  event_id    TEXT PRIMARY KEY,
  type        TEXT        NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
