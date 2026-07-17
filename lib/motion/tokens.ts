/**
 * Motion tokens — shared duration/easing vocabulary for all GSAP animation.
 * Mirrors the CSS tokens in app/globals.css and docs/interaction/GSAP_SYSTEM.md.
 * Every animation should draw from here rather than hard-coding values.
 */

export const duration = {
  instant: 0.15,
  quick: 0.3,
  standard: 0.6,
  cinematic: 1.2,
  travel: 1.8,
} as const;

export const ease = {
  standard: "power2.out",
  cinematic: "power3.inOut",
  reveal: "power2.out",
  focus: "expo.out",
} as const;

/** Distance (px) tokens for reveal/parallax translation. */
export const distance = {
  near: 16,
  standard: 32,
  far: 64,
} as const;

export const stagger = {
  tight: 0.06,
  standard: 0.1,
  loose: 0.16,
} as const;
