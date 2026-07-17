/**
 * Single client-only GSAP entry point.
 *
 * All motion code imports gsap/useGSAP from here so plugins are registered
 * exactly once (GSAP_SYSTEM.md: "Do not repeatedly register plugins inside
 * components"). Add plugins here as the experience justifies them.
 */
"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// useGSAP is itself a registered plugin; registering is idempotent.
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
