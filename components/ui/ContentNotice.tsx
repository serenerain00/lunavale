import {
  getContentNotes,
  type ContentNoteId,
} from "@/lib/content/content-notes";

interface ContentNoticeProps {
  notes?: readonly ContentNoteId[];
  className?: string;
}

/**
 * States what's in a piece, above it, before it plays.
 *
 * Styled as information rather than alarm — a hairline box in stone, not a red
 * banner with an icon. It is not an interstitial and there is nothing to
 * dismiss: an adult reads one line and decides. Anything louder would be at
 * odds with the restraint everywhere else, and would also train people to
 * click past it, which defeats the point of having it.
 *
 * Renders nothing when there are no notes, so call sites don't need to guard.
 */
export function ContentNotice({ notes, className = "" }: ContentNoticeProps) {
  const resolved = getContentNotes(notes);
  if (resolved.length === 0) return null;

  return (
    <aside
      aria-label="Content notice"
      className={`rounded-lg border border-hairline bg-charcoal/50 px-4 py-3 ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.15em] text-stone-dim">
        Contains
      </p>
      <ul className="mt-1.5 space-y-1">
        {resolved.map((note) => (
          <li key={note.id} className="text-sm leading-relaxed text-stone">
            <span className="text-ivory">{note.detail}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
