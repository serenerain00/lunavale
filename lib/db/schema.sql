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

  -- Whether Stripe will stop at current_period_end instead of renewing.
  --
  -- ADDED 2026-09-03, and the gap it closes is worth stating: `status` stays
  -- "active" for the whole month after somebody turns off auto-renew, because
  -- that is what Stripe reports and this table copies Stripe verbatim. So
  -- there was no way — in the admin, in /account, or in a query — to tell a
  -- member who is staying from one who has already left. Two of the first five
  -- memberships appear to have switched renewal off within hours of paying,
  -- and nothing here could see it.
  --
  -- IT MUST NEVER GATE ACCESS. Somebody who cancels keeps everything until the
  -- period they paid for runs out; that is the promise on the membership page
  -- and it is enforced in tierForUser(), which reads status and
  -- current_period_end and deliberately does not read this. This column is for
  -- knowing, and for wording — nothing else.
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREATE TABLE IF NOT EXISTS above does nothing to a table that already
-- exists, so a column added after the fact needs its own line. Both are
-- idempotent and this file stays re-runnable end to end.
--
-- Additive, NOT NULL with a default, and therefore metadata-only on any
-- Postgres since 11: no table rewrite, no lock worth the name, and every
-- existing row reads FALSE. Nobody's access changes.
ALTER TABLE memberships
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

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
  -- Denormalized on purpose. A display name is shown next to every post, and
  -- fetching N names from Clerk to render one page would be N round trips.
  -- Snapshotting it means a rename doesn't rewrite history, which for a wall
  -- of dated remarks is the correct behavior.
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

-- ---------------------------------------------------------------------------
-- Survey — what people think of it, and what they want it to be.
--
-- Open to everyone, account or not (see lib/content/survey.ts): the audience
-- worth measuring is the one that has watched a fragment on Instagram and has
-- an opinion and no reason to sign up.
--
-- COLUMNS RATHER THAN A JSON BLOB. Every question here is one Melissa wants to
-- count — how many said series, how many said day one — and counting is what
-- SQL is for. A JSONB blob would make adding a question free and every single
-- read afterwards a chore. Adding a question later is a migration, and that is
-- the right trade for six questions that are not going to churn.
--
-- Answers are stored as the OPTION IDS from lib/content/survey.ts, never the
-- labels, so the wording can be rewritten without orphaning what people said.
CREATE TABLE IF NOT EXISTS survey_responses (
  id              BIGSERIAL PRIMARY KEY,

  -- The three required ones.
  enjoyment       TEXT        NOT NULL,
  format          TEXT        NOT NULL,
  would_watch     TEXT        NOT NULL,

  -- Optional. A scene slug from lib/content/videos.ts; null if nothing has
  -- stayed with them yet, which is itself worth knowing.
  favourite_scene TEXT,
  -- Multi-select, so an array. Empty rather than null when they picked none.
  wants           TEXT[]      NOT NULL DEFAULT '{}',
  comment         TEXT,

  -- Clerk user id when they were signed in, so a member's answer can be read
  -- next to their membership. Null for everybody else, which will be most.
  user_id         TEXT,

  -- One answer per browser. NOT security — a private window defeats it, and it
  -- is meant to: this stops an honest person answering twice by accident, not
  -- a determined person voting a hundred times. If that ever starts happening
  -- the fix is a real one, not a longer cookie.
  client_token    TEXT        NOT NULL UNIQUE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS survey_responses_recent_idx
  ON survey_responses (created_at DESC);

-- ---------------------------------------------------------------------------
-- Scene comments — what somebody thought, said at the moment they finished it.
--
-- NOT A PUBLIC COMMENT THREAD, and the form says so in as many words. These go
-- to Melissa and appear on /admin, nowhere else.
--
-- That is a deliberate choice rather than a half-built feature. A public
-- thread under intimate footage on a site run by one person is a moderation
-- job that arrives whether or not anybody has time for it, and the first
-- abusive post is live until she happens to look. Private feedback gets her
-- the thing she asked for — what people think, per scene — with none of that,
-- and going public later is additive: this table already holds the text.
--
-- No account required, same reasoning as help_messages: the people most worth
-- hearing from here are the ones who arrived from Instagram and have no login.
CREATE TABLE IF NOT EXISTS scene_comments (
  id           BIGSERIAL PRIMARY KEY,

  -- Slug from lib/content/videos.ts. Not a foreign key — the catalog lives in
  -- TypeScript, and a comment should survive a scene being renamed or pulled
  -- rather than vanishing with it.
  scene_slug   TEXT        NOT NULL,

  body         TEXT        NOT NULL,

  -- Clerk user id when they happened to be signed in. Usually null.
  user_id      TEXT,
  -- Whether they could watch the whole thing or only the public preview, at
  -- the moment they wrote it. "This ended too soon" from someone who saw sixty
  -- seconds means something different from the same words after 3:25.
  was_member   BOOLEAN     NOT NULL DEFAULT false,

  -- Melissa marks it read rather than deleting it, same as Overheard and help.
  handled      BOOLEAN     NOT NULL DEFAULT false,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scene_comments_recent_idx
  ON scene_comments (created_at DESC);
CREATE INDEX IF NOT EXISTS scene_comments_scene_idx
  ON scene_comments (scene_slug, created_at DESC);

-- ---------------------------------------------------------------------------
-- Followers — the list.
--
-- WHY THIS EXISTS. Until this table, somebody could watch a scene, read a page
-- of the journal, answer the survey saying they were hooked and would watch it
-- on a platform — and then leave, and there was no way to ever reach them
-- again. Everything else on this site is rented: an algorithm decides who sees
-- a clip, and a platform decides whether the account still exists tomorrow. An
-- address is the only audience nobody can take away.
--
-- It is also the honest middle step. Most people who like this are not going
-- to spend eight dollars on the first visit, and the choice was never "member
-- or nothing" — it was "member or gone". This is the third option.
--
-- SINGLE OPT-IN, DELIBERATELY. A confirmation loop is the right call for a
-- list that mails strangers daily; this one mails when something goes up, from
-- a person whose work they just watched, and a confirm step at this size loses
-- a third of the addresses to spam folders to prevent a problem nobody has.
-- Revisit if the list ever gets big enough for deliverability to bite.
--
-- NOTHING IS SENT FROM HERE AUTOMATICALLY. The table is a list, not a mailer.
-- Melissa writes to it when she has something to say, which is the only way it
-- keeps meaning anything.
CREATE TABLE IF NOT EXISTS followers (
  id             BIGSERIAL PRIMARY KEY,

  -- Lower-cased and trimmed before it gets here, so "Me@X.com " and "me@x.com"
  -- are one person. UNIQUE, and inserts are ON CONFLICT DO NOTHING: somebody
  -- who signs up twice is somebody who forgot, not an error to show them.
  email          TEXT        NOT NULL UNIQUE,

  -- Where they were standing when they gave it: "survey", or "scene:<slug>".
  -- The point is to learn which moments earn an address, so that the next one
  -- can be put somewhere that works rather than somewhere that seemed likely.
  source         TEXT        NOT NULL,

  -- Clerk user id when they happened to be signed in. Usually null — the
  -- people worth collecting here are precisely the ones without an account.
  user_id        TEXT,

  -- Set when they ask to come off. The row stays: deleting it means the next
  -- import silently adds them back, and a list that re-subscribes people who
  -- left is the one unforgivable thing you can do with an address.
  unsubscribed_at TIMESTAMPTZ,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS followers_recent_idx
  ON followers (created_at DESC) WHERE unsubscribed_at IS NULL;

-- ---------------------------------------------------------------------------
-- Pending memberships — paid for, not yet attached to an account.
--
-- WHY THIS EXISTS. Until 2026-08-27 you had to make a Clerk account and verify
-- an email BEFORE you could see a price field. Three screens stood between
-- deciding to buy and being able to, and people were leaving in that gap.
-- Checkout now runs first and the account is made afterwards, which means
-- there is a window — usually seconds, occasionally forever — where a payment
-- exists and no user id does. This is where it waits.
--
-- KEYED ON EMAIL, because at the moment the webhook fires that is the only
-- identifier in existence. Stripe collected it on the card form; Clerk has
-- never heard of this person.
--
-- IT GRANTS NOTHING. A row here opens no scene and no journal page. Access is
-- resolved by lib/access/entitlement.ts from a Clerk user id against the
-- `memberships` table, and that is unchanged. This row only becomes access
-- when a signed-in user whose VERIFIED primary email matches claims it — see
-- claimPendingFor(). Payment first is not access first.
--
-- IT IS ALSO THE SAFETY NET. Somebody who pays and closes the tab has this row
-- waiting; whenever they sign up or sign in with that address, that day or a
-- month later, /account claims it. There is no way to pay and end up with
-- nothing, which is the one outcome this design could otherwise produce.
CREATE TABLE IF NOT EXISTS pending_memberships (
  -- Lower-cased. One waiting membership per address; a second payment on the
  -- same email overwrites rather than duplicating.
  email                  TEXT PRIMARY KEY,

  tier                   TEXT        NOT NULL,
  stripe_customer_id     TEXT        NOT NULL,
  stripe_subscription_id TEXT,
  status                 TEXT        NOT NULL,
  current_period_end     TIMESTAMPTZ,

  -- Set when it is turned into a real membership. The row is kept rather than
  -- deleted: it is the record of how somebody arrived, and re-claiming an
  -- already-claimed row has to be a no-op rather than a second grant.
  claimed_at             TIMESTAMPTZ,
  claimed_by             TEXT,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The parked half of the pay-first flow needs the same flag, so that a
-- membership claimed days after purchase does not forget it was already
-- cancelled on the way in.
ALTER TABLE pending_memberships
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;


-- The claim path looks up unclaimed rows by email.
CREATE INDEX IF NOT EXISTS pending_memberships_unclaimed_idx
  ON pending_memberships (email) WHERE claimed_at IS NULL;


-- ---------------------------------------------------------------------------
-- STUDIO — the shot workshop behind /admin/studio.
--
-- The only two tables in here nobody but the owner ever touches. No moderation
-- flag, no user id, no rate limit: the gate is at the route and there is one
-- person on the other side of it.
--
-- WHAT THEY ARE FOR. Studio does not generate images. It builds the exact
-- input to whatever does — the reference set, the film-language camera state,
-- and the two prompts (a still, then the motion for image-to-video) — and it
-- keeps the recipe so the same shot can be made again in a month, or varied on
-- one axis without losing the other nine. Continuity across forty shots is the
-- expensive part, not any single picture.
--
-- THE BYTES ARE NOT IN HERE. Reference images go to PRIVATE Vercel Blob under
-- studio/refs/, or studio-private/ on disk locally; this holds only the record
-- of them. See lib/studio/storage.ts and .vercelignore.
CREATE TABLE IF NOT EXISTS studio_refs (
  -- Minted by the upload route, not the database, because the blob object is
  -- named after it and has to be written before the row exists.
  id           TEXT PRIMARY KEY,

  -- What the reference is FOR, not what it shows: face, body, tattoo,
  -- wardrobe, hair, prop, environment, lighting, pose, frame. Decides where it
  -- lands in a compiled prompt. See lib/studio/types.ts.
  kind         TEXT        NOT NULL,

  -- Character and place ids from lib/content/taxonomy.ts. Nullable because a
  -- lighting plate belongs to nobody and a wardrobe screenshot may not have a
  -- room yet.
  character_id TEXT,
  place_id     TEXT,

  label        TEXT        NOT NULL,

  -- Azimuth id from lib/studio/vocab.ts, for face and body refs. This is the
  -- column that makes the angle control honest: the picker offers the angles
  -- that exist here and says so plainly when the one you want does not.
  angle_id     TEXT,

  -- Free text, and load-bearing for tattoos — placement is the single most
  -- dropped detail across a run of generations.
  notes        TEXT        NOT NULL DEFAULT '',

  width        INTEGER     NOT NULL,
  height       INTEGER     NOT NULL,
  mime         TEXT        NOT NULL,
  bytes        BIGINT      NOT NULL,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The library filters by character and by kind constantly, and by nothing else.
CREATE INDEX IF NOT EXISTS studio_refs_character_idx
  ON studio_refs (character_id, kind);


-- A saved shot. The id is minted client-side so that saving the thing you are
-- already editing is an upsert rather than a decision about whether it exists.
CREATE TABLE IF NOT EXISTS studio_shots (
  id            TEXT PRIMARY KEY,
  title         TEXT        NOT NULL,

  -- Scene slug from lib/content/videos.ts when the shot belongs to one, which
  -- is what lets Studio pre-fill place, cast and feeling from published canon
  -- instead of from memory.
  scene_slug    TEXT,
  place_id      TEXT,

  character_ids TEXT[]      NOT NULL DEFAULT '{}',
  ref_ids       TEXT[]      NOT NULL DEFAULT '{}',

  -- The whole camera state in one object: shot size, height, tilt, azimuth,
  -- lens, movement. JSONB rather than six columns because it is read and
  -- written as a unit and the vocabulary will grow.
  camera        JSONB       NOT NULL,

  lighting_id   TEXT        NOT NULL,
  time_id       TEXT        NOT NULL,
  aspect_id     TEXT        NOT NULL,

  -- What she is doing. The one part no vocabulary can supply.
  action        TEXT        NOT NULL DEFAULT '',
  extra         TEXT        NOT NULL DEFAULT '',

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS studio_shots_recent_idx
  ON studio_shots (updated_at DESC);

-- ---------------------------------------------------------------------------
-- Email opt-outs — one suppression list for every address this site can reach.
--
-- WHY IT IS SEPARATE FROM `followers.unsubscribed_at`. That column serves the
-- followers list, which is keyed on email and is the only list that existed
-- when it was written. Members are not on it: a member is a Clerk user id in
-- `memberships`, and their address lives in Clerk, not here. So the moment
-- anything is sent to members there are two populations and exactly one of
-- them can say no. That is the shape of every list that eventually mails
-- somebody who asked it not to.
--
-- KEYED ON THE ADDRESS, LOWER-CASED, because that is the only identifier the
-- two populations share, and because the promise a person believes they are
-- making is "stop emailing me", not "stop emailing this account". Someone who
-- unsubscribes as a follower and later pays should stay unsubscribed.
--
-- THE ROW IS THE ANSWER. There is no `subscribed` boolean to get backwards:
-- a row here means do not send, no row means send. Nothing deletes from this
-- table automatically — see the note on followers for why a list that
-- re-subscribes people is the one unforgivable thing you can do with an
-- address. Coming back is a deliberate act, by hand, at their request.
CREATE TABLE IF NOT EXISTS email_optouts (
  email       TEXT        PRIMARY KEY,

  -- What they were unsubscribing from when they clicked: "release" today, and
  -- whatever else ever gets sent. Recorded to learn which mail loses people,
  -- NOT to scope the suppression — a row suppresses everything, because the
  -- link said "stop emailing me" and that is what it has to mean.
  source      TEXT        NOT NULL DEFAULT 'release',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Email sends — what went out, so nothing goes out twice.
--
-- The announcement script is run by hand and can be run again: a network
-- failure halfway through a list, a second thought about the subject line, a
-- shell history recall three days later. Without this, the safe response to
-- any of those is "do nothing and hope", because the cost of guessing wrong is
-- mailing paying members the same announcement twice.
--
-- One row per (campaign, address). The campaign id is derived from what is
-- being announced, so re-running the same announcement finds its own rows and
-- skips them, while a genuinely new one does not collide.
CREATE TABLE IF NOT EXISTS email_sends (
  campaign    TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign, email)
);
