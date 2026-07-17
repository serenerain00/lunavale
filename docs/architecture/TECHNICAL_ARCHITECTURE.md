# Technical Architecture

## Goal

Build a scalable, content-driven, immersive application that preserves SEO, performance, accessibility, and secure monetization.

## Recommended Stack

- Next.js
- TypeScript
- Vercel
- GSAP
- `@gsap/react`
- Managed authentication
- Managed PostgreSQL-compatible database
- Stripe
- Hosted adaptive video provider
- Structured content files or headless CMS
- Object storage and image CDN
- Privacy-conscious analytics

## Suggested Project Structure

```text
/
├── app/
│   ├── (world)/
│   ├── (watch)/
│   ├── (marketing)/
│   ├── (account)/
│   ├── api/
│   └── layout.tsx
├── components/
│   ├── world/
│   ├── environments/
│   ├── motion/
│   ├── media/
│   ├── browse/
│   ├── membership/
│   └── ui/
├── hooks/
├── lib/
│   ├── motion/
│   ├── content/
│   ├── access/
│   ├── auth/
│   ├── billing/
│   ├── database/
│   ├── video/
│   └── analytics/
├── stories/
├── content/
├── docs/
└── public/
```

## Rendering Strategy

Use server components and static/server rendering for content discovery.

Use client components only where interaction or GSAP requires them.

Do not place the entire environment experience inside one enormous client component.

## Environment Loading

An environment page should load:

1. Essential background
2. Primary controls
3. Visible hotspots
4. Nearby area data
5. Heavy foreground layers
6. Optional ambient audio
7. Preview media
8. Deferred video

## URLs

Recommended:

```text
/world
/world/[environment-slug]
/world/[environment-slug]/[area-slug]
/stories
/stories/[story-slug]
/watch
/scene/[scene-slug]
/characters/[character-slug]
/vault
/account
```

Every environment and area must be deep-linkable.

## State

Separate:

- URL state
- Environment navigation state
- Animation state
- Story progress
- Membership entitlement
- Discovery progress
- Audio preference

Do not place all state in a single global store.

## Database

Minimum transactional tables:

- users
- profiles
- memberships
- entitlements
- purchases
- watch_progress
- discoveries
- environment_visits
- saved_items
- webhook_events
- admin_audit_events

Story and environment definitions may begin in files or a CMS.

## Premium Access

Use centralized server-side checks.

Never rely on hidden UI alone.

## Analytics

Track:

- World entered
- Environment viewed
- Area viewed
- Object focused
- Discovery opened
- Scene started
- Scene completed
- Locked discovery viewed
- Membership viewed
- Checkout started
- Checkout completed
- Return visit
- Story progression

## Performance Guardrails

- No multiple autoplaying videos
- Keep first environment payload controlled
- Use responsive images
- Use layered stills before defaulting to video backgrounds
- Reduce motion complexity on mobile
- Avoid unnecessary WebGL
- Preload only likely next destinations
- Measure Core Web Vitals
