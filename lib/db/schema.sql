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

-- ---------------------------------------------------------------------------
-- Overheard — the public wall.
--
-- Reading is open to everyone. Posting needs a (free) Clerk account, which is
-- what makes the three-post allowance countable: an anonymous cookie counter
-- is bypassed by a private window, and this way the allowance is attached to a
-- person instead of a browser. It also means every poster has an email, which
-- is the only audience nobody can take away.
CREATE TABLE IF NOT EXISTS overheard_posts (
  id          BIGSERIAL PRIMARY KEY,

  -- Clerk user id. Not a foreign key: Clerk owns the person.
  user_id     TEXT        NOT NULL,
  -- Denormalised on purpose. A display name is shown next to every post, and
  -- fetching N names from Clerk to render one page would be N round trips.
  -- Snapshotting it means a rename doesn't rewrite history, which for a wall
  -- of dated remarks is the correct behaviour.
  author_name TEXT        NOT NULL,

  body        TEXT        NOT NULL,

  -- Optional: which character or the filmmaker it is addressed to. NULL is a
  -- remark to the room, which is the default and the common case.
  addressed_to TEXT,

  -- What this is answering, as the transcript's own line key: "post:123" for a
  -- real post, "cast:d4-2" for one of the scripted cast messages. Text rather
  -- than a foreign key precisely because half the thread is not in this table —
  -- the cast script lives in lib/content/overheard.ts, so a FK could only ever
  -- express half the replies.
  reply_to    TEXT,

  -- When Melissa answers in a character's voice, the character's name. The row
  -- still records HER user_id — the account is always the real one, and only
  -- the byline changes. That is what keeps the allowance and moderation honest
  -- while letting the cast reply to people, which is the whole promise of the
  -- room.
  cast_as     TEXT,

  -- Set when the poster is OWNER_USER_ID. Stored rather than inferred from the
  -- name, because a visitor can call themselves Melissa and a badge that can be
  -- spoofed is worse than no badge.
  is_owner    BOOLEAN     NOT NULL DEFAULT false,

  -- Melissa can hide anything without destroying it. Hidden posts still count
  -- against their author's allowance, so deleting-and-reposting isn't a way to
  -- get free turns.
  hidden      BOOLEAN     NOT NULL DEFAULT false,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The wall reads newest-first, excluding hidden.
CREATE INDEX IF NOT EXISTS overheard_posts_visible_idx
  ON overheard_posts (created_at DESC) WHERE hidden = false;

-- Counting a person's posts to enforce the allowance.
CREATE INDEX IF NOT EXISTS overheard_posts_user_idx
  ON overheard_posts (user_id);

-- ---------------------------------------------------------------------------
-- Help — messages to Melissa from anyone, without exposing her address.
--
-- Deliberately NOT a mailto: link. A mailto puts her real address in the page
-- source, where every scraper on the internet reads it, and it dumps the
-- visitor into a mail client they may not have. This lands the message on the
-- server, shows it on /admin, and forwards it on if a mail provider is
-- configured — the sender never learns where it went.
--
-- No account required. Someone who cannot sign in is exactly the person most
-- likely to need help, so gating this behind auth would lock out the case it
-- exists for.
CREATE TABLE IF NOT EXISTS help_messages (
  id         BIGSERIAL PRIMARY KEY,

  -- Optional: how to reply. Blank is allowed — some people just want to say a
  -- thing, and demanding an address to say it costs more than it collects.
  reply_to   TEXT,
  -- Clerk user id when they happened to be signed in. Not required.
  user_id    TEXT,

  subject    TEXT        NOT NULL,
  body       TEXT        NOT NULL,

  -- Melissa marks it done rather than deleting it, same as Overheard.
  handled    BOOLEAN     NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS help_messages_open_idx
  ON help_messages (created_at DESC) WHERE handled = false;
