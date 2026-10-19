"use client";

import { useEffect } from "react";
import { clarityEvent } from "@/components/analytics/clarity";

/** Fires one Clarity event when it mounts — for server pages (e.g. /welcome). */
export function ClarityEvent({ name }: { name: string }) {
  useEffect(() => clarityEvent(name), [name]);
  return null;
}
