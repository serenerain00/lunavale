/**
 * Reports one A/B event for every live experiment this browser is in, once,
 * when mounted. Renders nothing. Used on /membership for "membership_view".
 */
"use client";

import { useEffect } from "react";
import { trackAll } from "@/components/analytics/experiments";

export function ExperimentEvent({ event }: { event: string }) {
  useEffect(() => {
    trackAll(event);
  }, [event]);
  return null;
}
