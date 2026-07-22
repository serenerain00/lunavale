/**
 * ObjectPanel — the content overlay shown when an interactive object is opened.
 * Layout adapts to the object kind (clip / journal / memory / artifact).
 * Access is enforced here too, but the real gate is server-side (stream route).
 */
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getVideo, formatDuration } from "@/lib/content/videos";
import { VideoPlayer } from "@/components/media/VideoPlayer";
import type { WorldObject } from "@/lib/content/world";

interface ObjectPanelProps {
  object: WorldObject;
  member: boolean;
  onClose: () => void;
}

export function ObjectPanel({ object, member, onClose }: ObjectPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const allowed = object.access === "free" || member;
  const video = object.videoSlug ? getVideo(object.videoSlug) : undefined;

  // Close on Escape; focus the close button on open (keyboard + a11y).
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={object.label}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-hairline bg-obsidian shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-amber">
              {object.kind}
            </p>
            <h2 className="mt-1 font-display text-2xl font-medium text-ivory">
              {object.label}
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="rounded-full border border-hairline px-3 py-1 text-sm text-stone transition-colors hover:border-amber hover:text-amber"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          {!allowed ? (
            <LockedBody object={object} />
          ) : video ? (
            <div className="overflow-hidden rounded-lg bg-black">
              <div className="aspect-video">
                <VideoPlayer
                  slug={video.slug}
                  poster={video.poster}
                  title={video.title}
                />
              </div>
              <p className="p-3 text-xs text-stone">
                {formatDuration(video.durationSeconds)}
              </p>
            </div>
          ) : (
            <p className="leading-relaxed text-stone">{object.placeholder}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LockedBody({ object }: { object: WorldObject }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3 py-1 text-sm text-amber-soft">
        Members only
      </span>
      <p className="leading-relaxed text-stone">
        {object.placeholder}
      </p>
      <p className="text-sm text-stone-dim">
        This discovery is part of the Vault, along with the rest of the locked
        rooms in this location.
      </p>
      {/* Out to the pitch rather than granting access inline: a locked object
          is a conversion moment, not a checkout. */}
      <Link
        href="/membership"
        className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
      >
        See what membership opens
      </Link>
    </div>
  );
}
