import Link from "next/link";
import { getNoteKind, type SetNote } from "@/lib/content/between-takes";
import { getVideo } from "@/lib/content/videos";
import { getClip } from "@/lib/content/clips";
import { getGallery } from "@/lib/content/gallery";

interface NoteCardProps {
  note: SetNote;
  /** Whether the viewer is entitled to read it. */
  unlocked: boolean;
}

/**
 * One page of the cast notebook.
 *
 * Styled as an index card rather than the journal's lined paper: this is a
 * different hand and a different register, and making them look alike would
 * suggest the notebook is more of Luna's interior voice when it is the
 * opposite. Warm neutral card, typed body, handwritten signature.
 *
 * A locked note shows its heading, its kind and its first line, then stops
 * mid-thought — the same argument JournalCard makes. Seeing that a real,
 * specific note exists is a better case for membership than a grey box, and it
 * is honest about what is withheld: the rest of this note, not its existence.
 */
export function NoteCard({ note, unlocked }: NoteCardProps) {
  const locked = note.access === "premium" && !unlocked;
  const kind = getNoteKind(note.kind);
  const about = subject(note);

  return (
    <article
      id={`note-${note.id}`}
      data-reveal-item
      className="relative flex h-full flex-col rounded-sm bg-[#e8e2d6] p-5 text-ink shadow-[0_10px_30px_-14px_rgba(0,0,0,0.85)]"
    >
      {/* Rule under the header, the way a filing card is printed. */}
      <div className="border-b border-ink/15 pb-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#9a4b45]">
            {kind?.label}
          </span>
          <span aria-hidden className="text-ink/25">
            ·
          </span>
          <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
            {note.dateline}
          </span>
        </div>
        <h3 className="mt-1.5 font-display text-xl font-medium leading-tight text-ink">
          {note.heading}
        </h3>
      </div>

      <div className="flex-1 pt-3">
        {(locked ? note.body.slice(0, 1) : note.body).map((para, i) => (
          <p
            key={i}
            className={`text-[0.9375rem] leading-relaxed text-ink/90 ${
              i > 0 ? "mt-3" : ""
            } ${locked ? "line-clamp-3" : ""}`}
          >
            {para}
          </p>
        ))}

        {locked && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <LockGlyph />
            The rest of this note is in the Vault
          </p>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-ink/15 pt-3">
        <p className="font-hand text-2xl leading-none text-ink-soft">
          {signature(note)}
        </p>
        {about && (
          <Link
            href={about.href}
            className="text-xs text-[#9a4b45] underline decoration-ink/20 underline-offset-4 transition-colors duration-(--duration-quick) hover:decoration-[#9a4b45]"
          >
            {about.label}
          </Link>
        )}
      </footer>
    </article>
  );
}

/** Signed the way you'd sign a note you left for someone. */
function signature(note: SetNote): string {
  return note.author === "luna" ? "— L" : note.author === "tyson" ? "— T" : "— J";
}

/**
 * The thing the note was written beside, if any. Resolved against the real
 * content so a renamed scene surfaces as a missing link here rather than a
 * dead one on the page.
 */
function subject(note: SetNote): { label: string; href: string } | undefined {
  if (note.sceneSlug) {
    const scene = getVideo(note.sceneSlug);
    if (scene) return { label: `On “${scene.title}”`, href: `/watch/${scene.slug}` };
  }
  if (note.clipId) {
    const clip = getClip(note.clipId);
    if (clip) return { label: `On “${clip.title}”`, href: `/clips/${clip.id}` };
  }
  if (note.gallerySlug) {
    const gallery = getGallery(note.gallerySlug);
    if (gallery)
      return { label: `On “${gallery.title}”`, href: `/gallery/${gallery.id}` };
  }
  return undefined;
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
