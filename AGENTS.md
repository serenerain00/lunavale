# Codex Project Instructions — Luna Vault

## Project Identity

**Product name:** Luna Vault  
**Creator:** Melissa Casole  
**Product type:** Explorable cinematic story world, premium streaming platform, creator portfolio, and monetized audience experience  
**Primary deployment:** Vercel  
**Primary workflow:** Cursor + Codex  
**Recommended framework:** Next.js with TypeScript  
**Motion system:** GSAP

Luna Vault is not a conventional portfolio and should not be built as a standard Netflix clone.

It is an explorable cinematic universe where visitors move through meaningful environments such as the lakehouse, farmhouse, track, park, coffee shop, downtown, garage, barn, dock, and future locations. Each environment contains stories, scenes, objects, memories, character connections, premium discoveries, and behind-the-scenes material.

The interface should feel like moving through Luna's world rather than navigating a normal website.

## Primary Product Goal

Build a premium destination where visitors can:

1. Enter the Luna universe through cinematic environments
2. Discover stories by exploring places, objects, and memories
3. Watch scenes, chapters, episodes, and trailers
4. Understand the relationships between Luna, Tyson, Josh, and future characters
5. Unlock premium locations, scenes, and artifacts
6. Follow the production process
7. Support the project financially
8. Discover Melissa's work as a creator, director, UX designer, and creative technologist

## Experience Model

The core mental model is:

```text
World
  → Environment
    → Area
      → Interactive Object
        → Story, scene, memory, artifact, or premium discovery
```

Examples:

```text
Lakehouse
  → Deck
    → Journal
      → Luna journal entries

Lakehouse
  → Firepit
    → Memory
      → Luna and Tyson fireside scene

Track
  → Garage
    → Helmet shelf
      → Tyson character story

Farmhouse
  → Kitchen
    → Coffee mug
      → Josh and Luna memories
```

Users may also browse through conventional Watch, Character, Story, and Account views. The explorable world is the signature experience, but it must never make essential content difficult to find.

## Core Experience Principles

### World Before Pages

Locations are not decorative page backgrounds. They are the primary content containers and navigation system.

### Cinematic Camera Language

Transitions should feel like camera movement:

- Push in
- Pull back
- Pan
- Dolly
- Orbit
- Track
- Rack focus
- Fade through black
- Environmental reveal

Avoid generic website motion whenever a cinematic equivalent is appropriate.

### Exploration With Clarity

The world can feel mysterious, but navigation must remain understandable. Always provide:

- A clear way home
- A map or location selector
- A conventional content index
- Back navigation
- Accessible labels
- Reduced-motion alternatives
- Deep-linkable URLs

### Story Before Technology

Do not lead with AI. Present Luna as original cinematic storytelling. AI production methods belong primarily in behind-the-scenes content.

### Premium Without Manipulation

Membership should unlock deeper parts of the world naturally:

- Locked rooms
- Restricted objects
- Extended memories
- Alternate cuts
- Private journals
- Creator commentary
- Unreleased visual material

Do not use fake scarcity, shame, or constant interruption.

### Performance Restraint

The platform's tone must match the story:

- Mature
- Intimate
- Emotionally layered
- Sensual
- Understated
- Realistic
- Never cartoonish or melodramatic

## Required Documentation

Before making structural decisions, read:

- `README.md`
- `docs/vision/PRODUCT_VISION.md`
- `docs/vision/EXPERIENCE_PRINCIPLES.md`
- `docs/world/WORLD_MAP.md`
- `docs/world/ENVIRONMENT_SYSTEM.md`
- `docs/interaction/GSAP_SYSTEM.md`
- `docs/interaction/MOTION_LANGUAGE.md`
- `docs/interaction/TRANSITIONS.md`
- `docs/content/CONTENT_MODEL.md`
- `docs/content/STORIES_FOLDER.md`
- `docs/architecture/TECHNICAL_ARCHITECTURE.md`
- `docs/monetization/MONETIZATION.md`
- `docs/roadmap/ROADMAP.md`

## Engineering Rules

- Use TypeScript.
- Use Next.js App Router unless a documented reason requires otherwise.
- Keep all content data separate from presentation.
- Treat environments, areas, objects, stories, scenes, and unlocks as structured data.
- Use GSAP through reusable motion utilities and components.
- Register GSAP plugins only in client-safe modules.
- Always clean up GSAP contexts and timelines.
- Avoid one-off animation logic embedded throughout page components.
- Do not make the whole application client-rendered simply because GSAP is used.
- Keep public pages indexable and deep-linkable.
- Treat premium access as server-side authorization.
- Lazy-load heavy environment media.
- Optimize imagery and video.
- Respect `prefers-reduced-motion`.
- Preserve usable navigation when animation is disabled.
- Avoid autoplay with sound.
- Never expose secret keys or permanent premium media URLs.
- Build loading, empty, error, locked, and fallback states.
- Use semantic HTML and keyboard-accessible interactions.
- Do not add WebGL or Three.js unless the experience genuinely requires it and performance has been evaluated.
- Prefer layered 2D and 2.5D cinematic scenes before introducing full 3D complexity.

## Content Rules

- The `/stories` folder is a source of story truth, not a UI component directory.
- Never silently alter story canon.
- Use the newest approved reference as canonical.
- Locations can contain multiple stories and evolve over time.
- The same environment may have multiple visual and emotional states.
- Characters, objects, and locations should connect across stories through stable IDs.
- Every interactive discovery must have a meaningful content outcome.
- Avoid empty gamification that adds points without emotional or narrative value.

## GSAP Rules

- Use `gsap.context()` or equivalent scoped cleanup.
- Use `useGSAP()` from `@gsap/react` where appropriate.
- Keep timelines in named hooks or motion modules.
- Use ScrollTrigger only when scroll meaningfully maps to camera or narrative movement.
- Do not hijack scroll without a clear accessibility fallback.
- Use route transitions carefully; never block navigation indefinitely.
- Define motion tokens for duration, easing, distance, blur, and stagger.
- Pause or simplify animations on low-power or reduced-motion contexts.
- Never animate layout properties when transforms and opacity can achieve the same result.
- Avoid excessive simultaneous motion.
- Ensure animation does not delay content comprehension.

## Definition of Done

A feature is complete only when it:

- Works on mobile and desktop
- Functions with reduced motion
- Has a stable URL
- Uses structured content
- Uses shared design and motion systems
- Includes loading, empty, error, and access states
- Meets basic accessibility expectations
- Preserves story continuity
- Does not leak premium media or secrets
- Feels like part of Luna's world rather than a disconnected web page
