# GSAP System

## Purpose

GSAP is the primary motion engine for Luna Vault.

It should support cinematic transitions, environment exploration, camera-like movement, scroll-based storytelling, object discovery, and restrained interface feedback.

GSAP must be implemented as a system, not as scattered animation snippets.

## Packages

Recommended:

```text
gsap
@gsap/react
```

Possible plugins:

- ScrollTrigger
- Flip
- Observer
- Draggable
- MotionPathPlugin

Use only plugins justified by the experience.

## Architecture

Suggested structure:

```text
lib/motion/
├── gsap-client.ts
├── tokens.ts
├── presets.ts
├── transitions.ts
├── scroll.ts
├── reduced-motion.ts
└── environment-camera.ts

hooks/
├── useCinematicReveal.ts
├── useEnvironmentTransition.ts
├── useObjectFocus.ts
└── useReducedMotion.ts
```

## Initialization

Create one client-only registration module.

Do not repeatedly register plugins inside components.

## Cleanup

All component animation must be scoped and cleaned up.

Preferred patterns:

- `useGSAP()`
- `gsap.context()`
- Timeline kill on unmount
- ScrollTrigger cleanup

## Motion Tokens

```ts
export const motionDuration = {
  instant: 0.15,
  quick: 0.3,
  standard: 0.6,
  cinematic: 1.2,
  travel: 1.8,
}

export const motionEase = {
  standard: "power2.out",
  cinematic: "power3.inOut",
  reveal: "power2.out",
  focus: "expo.out",
}
```

Exact values may evolve, but all motion should use shared tokens.

## Core Motion Presets

- Cinematic fade
- Fade through black
- Slow push
- Pull back
- Horizontal pan
- Depth reveal
- Foreground parallax
- Rack-focus simulation
- Object focus
- Environment entrance
- Environment exit
- Memory reveal
- Locked-object response
- Map travel
- Card-to-detail transition

## ScrollTrigger Rules

Use ScrollTrigger when scroll represents:

- Moving through a location
- Passing through time
- Revealing a sequence
- Traveling between environment areas
- Progressing through a visual essay

Do not use ScrollTrigger for every section.

## Route Transition Rules

A route transition may include:

1. Freeze or soften the current scene
2. Focus on the selected object or destination
3. Fade, pan, or travel
4. Navigate
5. Reveal the destination
6. Restore controls

Keep transitions interruptible and short enough to preserve usability.

## Reduced Motion

When reduced motion is enabled:

- Replace long travel with crossfades
- Disable large parallax movement
- Avoid pinned scroll sequences
- Preserve all content and navigation
- Remove artificial camera sway
- Maintain clear focus changes

## Mobile

On mobile:

- Reduce layer count
- Reduce image scale distance
- Use shorter travel
- Avoid excessive pinned sections
- Test Safari viewport behavior
- Do not rely on hover
- Keep hotspots large enough to tap

## Performance

- Animate transforms and opacity
- Avoid layout thrashing
- Preload only the next likely destination
- Use lower-resolution depth layers on mobile
- Pause offscreen timelines
- Avoid multiple active video backgrounds
- Profile long pages
- Use will-change sparingly
