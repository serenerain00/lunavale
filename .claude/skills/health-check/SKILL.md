---
name: health-check
description: The daily look at the live site — bugs, pages customers should not see, checkout and access problems, content rot. Run at the start of a working session, or whenever something feels off. Melissa's standing rule.
---

# The daily health check

Melissa's rule: **every day we start working, check the site.** Bugs, pages
customers should not see but maybe do, checkout issues, general health.

## Run it

```bash
npm run health                    # everything, including money
npm run health -- --offline       # repo only, no network
```

Locally this reads the **test** Stripe configuration, and the report says so.
That is a real limit, not a bug — the live price ids are a production Secret and
do not pull. The script compensates by reading the live *catalogue* separately
when `STRIPE_SECRET_KEY_LIVE` is present.

Exit code is 1 if anything FAILED. Warnings never fail the run.

## What it covers, and what it does not

It checks four things: **gates** (owner-only surfaces, noindex, robots),
**leakage** (private media that would actually deploy, sitemap contents),
**content** (referential integrity between the content modules, pull quotes not
pointing into a paywall, the free-entry count), and **money** (people who paid
and cannot get in, cards failing, webhooks gone quiet, prices that resolve).

It does **not** load pages, click anything, or look at the rendered site. So it
cannot see a broken layout, a 500 on a real request, or a slow page. If
something is reported as off, or the day's work touched the front end, open the
thing and look.

## How to report it

Do not paste the whole run. Read it, then tell her in a few lines:

- **Anything that FAILED** — what it is, what a customer would experience, and
  the fix. Lead with this.
- **Warnings worth acting on** — and say plainly which ones are just noise.
- **One line of state** — members, free/paid counts, last webhook.

If everything passes, say so in one sentence and get on with the day's work. A
clean check is not a reason to write five paragraphs.

## When it finds nothing for weeks

Delete checks that have never caught anything and add ones for whatever went
wrong most recently. Every check in the script exists because that class of
thing actually broke here — an "Admin →" link shown to every paying member
because a gate tested that an env var was *set* rather than who was signed in;
four hand-rolled copies of the same owner check; an upload that worked on a
laptop and 413'd in production. Keep it that way, or it becomes decoration.
