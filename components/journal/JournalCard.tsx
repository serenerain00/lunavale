import Link from "next/link";
import { opening, type JournalEntry } from "@/lib/content/journal";

interface JournalCardProps {
  entry: JournalEntry;
  unlocked: boolean;
}

/**
 * An entry as it sits on the index: the top of the page, face up.
 *
 * Deliberately shows the real opening line even when the entry is locked. A
 * journal you can see the handwriting of but not read is a far better argument
 * for membership than a grey rectangle, and it is honest about what is being
 * withheld — the rest of the page, not the fact that a page exists.
 */
export function JournalCard({ entry, unlocked }: JournalCardProps) {
  const locked = entry.access === "premium" && !unlocked;
  // A positive "read this now" signal on the open entries, shown to visitors so
  // the free pages read as an invitation instead of getting lost among locks.
  const freeToRead = entry.access === "free" && !unlocked;

  return (
    <Link
      href={`/journal/${entry.id}`}
      data-reveal-item
      className="group relative block overflow-hidden rounded-sm bg-paper shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-transform duration-(--duration-standard) ease-(--ease-standard) hover:-translate-y-1 focus-visible:-translate-y-1"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 21px, rgba(47,58,74,0.11) 21px 22px)",
          backgroundPosition: "0 3.25rem",
        }}
      />

      <div className="relative p-5">
        <p className="font-hand text-xl leading-tight text-ink-soft">
          {entry.dateline}
        </p>
        {entry.where && (
          <p className="font-hand text-base leading-tight text-ink-soft/80">
            {entry.where}
          </p>
        )}

        <p
          className={`font-hand mt-3 text-xl leading-[1.375rem] text-ink ${
            locked ? "line-clamp-2" : "line-clamp-3"
          }`}
        >
          {opening(entry)}
        </p>

        {locked && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <LockGlyph />
            The rest is in the Vault
          </p>
        )}
        {freeToRead && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-margin-rule/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#9a4b45]">
            Free to read
          </p>
        )}
      </div>

      {/* The page runs out of the bottom of the card rather than ending in a
          clean edge — it reads as a sheet continuing past the crop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-paper-shade to-transparent"
      />
    </Link>
  );
}

function LockGlyph() {
  return (
    <svg
      width="11"
      height="11"
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
        strokeWidth="2.5"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
