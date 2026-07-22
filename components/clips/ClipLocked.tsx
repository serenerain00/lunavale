import Image from "next/image";
import Link from "next/link";
import type { Clip } from "@/lib/content/clips";

/**
 * The locked panel for a members-only clip — the portrait counterpart to
 * components/membership/LockedNotice.tsx.
 *
 * The poster is blurred to near-nothing rather than shown dimmed. For an
 * explicit clip the still frame is the sensitive thing, so a non-member should
 * not be able to make it out — the blur is the point, not decoration. It keeps
 * the shape and the warmth of a real frame being withheld without exposing
 * what the frame is.
 *
 * Presentation only; the refusal already happened server-side in the stream
 * route and the page's canWatch check.
 */
export function ClipLocked({ clip }: { clip: Clip }) {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black ring-1 ring-hairline">
        <Image
          src={clip.poster}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 384px"
          className="scale-110 object-cover brightness-[0.25] blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-void/30" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3.5 py-1.5 text-sm text-amber-soft backdrop-blur-sm">
            <LockGlyph />
            Members only
          </span>
          <p className="text-balance leading-relaxed text-ivory">
            {clip.explicit
              ? "This one is explicit, and it's part of the Vault."
              : "This clip is part of the Vault."}
          </p>
          <Link
            href="/membership"
            className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
          >
            See what membership opens
          </Link>
        </div>
      </div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
