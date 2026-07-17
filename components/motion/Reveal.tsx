/**
 * Reveal — a cinematic fade-up for its direct children, staggered.
 *
 * Reduced-motion safe: when the user opts out, children are shown immediately
 * with no transform (GSAP's matchMedia handles the branch). Scoped + auto
 * cleaned up via useGSAP.
 */
"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import { duration, ease, distance, stagger } from "@/lib/motion/tokens";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before the sequence begins (s). */
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal-item]");
      if (targets.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(targets, {
          opacity: 0,
          y: distance.standard,
          duration: duration.cinematic,
          ease: ease.reveal,
          stagger: stagger.standard,
          delay,
        });
      });

      // Reduced motion: ensure everything is simply visible, no transform.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(targets, { opacity: 1, y: 0 });
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
