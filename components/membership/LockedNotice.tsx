import Image from "next/image";
import Link from "next/link";

interface LockedNoticeProps {
  /** Still or poster from the locked item, shown dimmed behind the notice. */
  cover: string;
  /** What is behind the lock, e.g. "This scene" or "These stills". */
  subject: string;
}

/**
 * The conversion moment: a member-only scene or gallery, seen but not opened.
 *
 * It shows the real frame, dimmed — the point is that the visitor can tell
 * what they are missing rather than being handed a grey box. What it does not
 * do is nag: one line, one link out to the pitch, no countdown, no second
 * modal. Per docs/monetization/MONETIZATION.md, a locked door is allowed to be
 * a locked door; it isn't allowed to be a sales pitch that follows you around.
 *
 * This is presentation only. The actual refusal already happened server-side
 * in lib/access/entitlement.ts — nothing here is the boundary.
 */
export function LockedNotice({ cover, subject }: LockedNoticeProps) {
  return (
    <div className="absolute inset-0">
      <Image
        src={cover}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="object-cover brightness-[0.3]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/20" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3.5 py-1.5 text-sm text-amber-soft backdrop-blur-sm">
          <LockGlyph />
          Members only
        </span>
        <p className="max-w-md text-balance leading-relaxed text-ivory">
          {subject} is part of the Vault, along with the full scene library, the
          locked rooms, and Luna&rsquo;s journals.
        </p>
        <Link
          href="/membership"
          className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
        >
          See what membership opens
        </Link>
      </div>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
