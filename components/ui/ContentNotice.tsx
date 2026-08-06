import {
  getContentNotes,
  hasSevereNote,
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
 * TWO WEIGHTS. Most notes get the quiet box. A note marked `severe` — the
 * strangulation and the sexual coercion in the farmhouse scene — raises the
 * whole panel to the amber treatment an explicit cut already uses, and leads
 * with "Before you play this".
 *
 * That is not the alarm styling the content-notes rules rule out, and the
 * distinction is worth being precise about. There is still nothing to click
 * past, nothing is hidden behind a confirmation, no second dialog follows, and
 * the wording still describes rather than warns. The only thing that changes
 * is that it cannot be skimmed past at the same weight as "contains a panic
 * attack" — which, for somebody who has been strangled by a partner, is the
 * difference between a courtesy and a nasty surprise.
 *
 * Renders nothing when there are no notes, so call sites don't need to guard.
 */
export function ContentNotice({ notes, className = "" }: ContentNoticeProps) {
  const resolved = getContentNotes(notes);
  if (resolved.length === 0) return null;
  const severe = hasSevereNote(notes);

  return (
    <aside
      aria-label="Content notice"
      className={`rounded-lg border px-4 py-3 ${
        severe
          ? "border-amber/40 bg-amber/[0.06]"
          : "border-hairline bg-charcoal/50"
      } ${className}`}
    >
      <p
        className={`text-xs uppercase tracking-[0.15em] ${
          severe ? "text-amber-soft" : "text-stone-dim"
        }`}
      >
        {severe ? "Before you play this" : "Contains"}
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
