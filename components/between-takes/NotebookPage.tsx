import Link from "next/link";
import {
  getNoteKind,
  repliesTo,
  type SetNote,
} from "@/lib/content/between-takes";
import { getPerson } from "@/lib/content/taxonomy";
import { getVideo } from "@/lib/content/videos";
import { getClip } from "@/lib/content/clips";
import { getGallery } from "@/lib/content/gallery";
import type { PersonId } from "@/lib/content/taxonomy";

interface NotebookPageProps {
  note: SetNote;
  /** Whether the viewer may read the members-only writing. */
  unlocked: boolean;
}

/**
 * One spread of the set notebook: a page, and whatever got written under it.
 *
 * WHY THIS IS NOT NoteCard. components/characters/NoteCard.tsx renders the same
 * data as an index card, filed on one person's page, and that is correct there
 * — you are reading Tyson, so his notes are Tyson's. This is the opposite
 * frame: one battered book on a table at the edge of set, which everybody
 * writes in and everybody reads — and which is still being filled in, because
 * the film is being shot right now. The whole
 * point is that the hands are different and that they answer each other, so
 * the page has to be able to hold more than one person at once. A card cannot.
 *
 * THREE HANDS. Each writer gets an ink color and a slight rotation, held in
 * HANDS below. It is the only thing distinguishing them once the writing
 * starts, so it is data rather than a per-note style — one place to change, and
 * no page can accidentally give Josh Tyson's pen.
 *
 * ACCESSIBILITY. The script face is used for signatures and marginalia only,
 * never for body text at length. That is the same line the journal draws
 * (components/journal/JournalPaper.tsx) and for the same reason: a page of
 * handwriting is genuinely hard work for a lot of people, and an entry nobody
 * can read is not atmosphere, it is a locked door. Ink color is never the only
 * signal either — every hand is also named in text.
 */

/**
 * Pen per writer. `ink` is the body, `nib` the signature.
 *
 * Partial on purpose: the cast taxonomy has eight people and only the ones who
 * actually wrote in the book need a pen. Anyone else falls back rather than
 * forcing an invented hand for a character who never picked it up.
 */
const HANDS: Partial<
  Record<PersonId, { ink: string; nib: string; tilt: string; pen: string }>
> = {
  luna: {
    ink: "#2b3a67",
    nib: "#2b3a67",
    tilt: "-0.35deg",
    pen: "blue-black ballpoint",
  },
  tyson: {
    ink: "#1f1f1d",
    nib: "#1f1f1d",
    tilt: "0.5deg",
    pen: "whatever was on the table",
  },
  josh: {
    ink: "#3f2d1c",
    nib: "#3f2d1c",
    tilt: "-0.15deg",
    pen: "brown fineliner",
  },
  rick: {
    ink: "#4a3b52",
    nib: "#4a3b52",
    tilt: "0.25deg",
    pen: "pencil",
  },
};

/** Fallback so an unmapped writer renders rather than throwing. */
const DEFAULT_HAND = {
  ink: "#1f1f1d",
  nib: "#1f1f1d",
  tilt: "0deg",
  pen: "whatever was on the table",
};

export function NotebookPage({ note, unlocked }: NotebookPageProps) {
  const replies = repliesTo(note.id);
  const locked = note.access === "premium" && !unlocked;
  const hand = HANDS[note.author] ?? DEFAULT_HAND;
  const writer = getPerson(note.author);
  const kind = getNoteKind(note.kind);
  const addressee = note.to ? getPerson(note.to) : undefined;
  const about = subject(note);

  return (
    <article
      id={`page-${note.id}`}
      className="relative mx-auto w-full max-w-2xl"
      style={{ rotate: hand.tilt }}
    >
      {/*
        The paper. Two backgrounds stacked: the ruled lines, and the stock
        itself. `background-attachment: local` is deliberate — the rules belong
        to the sheet, so if the page ever scrolls inside a container they scroll
        with the writing instead of sliding under it.
      */}
      <div
        className="relative rounded-sm px-6 py-8 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] sm:px-10 sm:py-10"
        style={{
          backgroundColor: "#efe9db",
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 27px, rgba(43,58,103,0.13) 27px 28px)",
          backgroundAttachment: "local",
        }}
      >
        {/* The margin rule down the left, the way a school notebook is ruled. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-4 w-px sm:left-7"
          style={{ backgroundColor: "rgba(154,75,69,0.35)" }}
        />
        {/* Punch holes, so it reads as a page torn out of something. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-1 hidden flex-col justify-center gap-24 sm:flex"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.16)" }}
            />
          ))}
        </div>

        <header className="pl-2 sm:pl-6">
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[0.6875rem] uppercase tracking-[0.14em]">
            <span style={{ color: "#9a4b45" }} className="font-semibold">
              {kind?.label}
            </span>
            <span aria-hidden style={{ color: "rgba(31,31,29,0.3)" }}>
              ·
            </span>
            <span style={{ color: "rgba(31,31,29,0.6)" }}>{note.dateline}</span>
          </p>

          {/* Addressed pages say so at the top, the way a note left for
              somebody does. */}
          {addressee && (
            <p
              className="mt-3 font-hand text-xl"
              style={{ color: hand.ink }}
            >
              {addressee.label} —
            </p>
          )}

          <h2
            className="mt-2 font-display text-2xl font-medium leading-tight sm:text-3xl"
            style={{ color: hand.ink }}
          >
            {note.heading}
          </h2>
        </header>

        <div className="mt-5 space-y-4 pl-2 sm:pl-6">
          {(locked ? note.body.slice(0, 1) : note.body).map((para, i) => (
            <p
              key={i}
              className="text-[0.9375rem] leading-7 sm:text-base"
              style={{ color: hand.ink }}
            >
              {para}
            </p>
          ))}

          {locked && <LockedTail id={note.id} />}
        </div>

        {/* The signature, in the writer's hand. */}
        <p
          className="mt-6 pl-2 text-right font-hand text-2xl sm:pl-6"
          style={{ color: hand.nib }}
        >
          {writer?.id === "luna" ? "Luna" : (writer?.label ?? note.author)}
        </p>

        {/* What the page is about, if it is about something watchable. */}
        {about && (
          <p className="mt-4 border-t pt-4 pl-2 text-xs sm:pl-6"
             style={{ borderColor: "rgba(31,31,29,0.15)", color: "rgba(31,31,29,0.6)" }}>
            Written beside{" "}
            <Link
              href={about.href}
              className="underline underline-offset-4"
              style={{ color: "#9a4b45" }}
            >
              {about.label}
            </Link>
          </p>
        )}
      </div>

      {/* ------------------------------------------------------ marginalia */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <Reply key={reply.id} note={reply} unlocked={unlocked} />
          ))}
        </div>
      )}
    </article>
  );
}

/**
 * Somebody else's writing, underneath the page.
 *
 * Narrower and indented, because that is physically what happens when you find
 * a book open at somebody else's page and write below it — you get the space
 * they left you and no more.
 */
function Reply({ note, unlocked }: { note: SetNote; unlocked: boolean }) {
  const hand = HANDS[note.author] ?? DEFAULT_HAND;
  const locked = note.access === "premium" && !unlocked;
  const writer = getPerson(note.author);

  return (
    <div
      id={`page-${note.id}`}
      className="ml-4 rounded-sm px-5 py-5 shadow-[0_12px_36px_-20px_rgba(0,0,0,0.9)] sm:ml-16 sm:px-7"
      style={{ backgroundColor: "#e7e0d0", rotate: hand.tilt }}
    >
      <p
        className="text-[0.625rem] uppercase tracking-[0.14em]"
        style={{ color: "rgba(31,31,29,0.55)" }}
      >
        {note.dateline}
      </p>
      <div className="mt-2.5 space-y-3">
        {(locked ? note.body.slice(0, 1) : note.body).map((para, i) => (
          <p
            key={i}
            className="font-hand text-lg leading-snug sm:text-xl"
            style={{ color: hand.ink }}
          >
            {para}
          </p>
        ))}
        {locked && <LockedTail id={note.id} small />}
      </div>
      <p
        className="mt-3 text-right font-hand text-xl"
        style={{ color: hand.nib }}
      >
        — {writer?.id === "luna" ? "Luna" : (writer?.label ?? note.author)}
      </p>
    </div>
  );
}

/**
 * Where a locked page stops.
 *
 * Says what is behind it and offers the door, once. MONETIZATION.md forbids
 * nagging, and the note has already shown its first paragraph — the visitor can
 * see there is a real, specific thing here, which is a better argument than a
 * gray box and more honest about what is withheld.
 */
function LockedTail({ id, small = false }: { id: string; small?: boolean }) {
  return (
    <p
      className={small ? "text-xs" : "text-sm"}
      style={{ color: "rgba(31,31,29,0.55)" }}
    >
      <span aria-hidden>⁂ </span>
      The rest of this one is in the notebook members get.{" "}
      <Link
        href={`/membership?from=between-takes-${id}`}
        className="underline underline-offset-4"
        style={{ color: "#9a4b45" }}
      >
        What that opens
      </Link>
    </p>
  );
}

/** The scene, clip or still set a note was written beside, if any. */
function subject(note: SetNote): { href: string; label: string } | null {
  if (note.sceneSlug) {
    const video = getVideo(note.sceneSlug);
    if (video) return { href: `/watch/${video.slug}`, label: video.title };
  }
  if (note.clipId) {
    const clip = getClip(note.clipId);
    if (clip) return { href: `/clips/${clip.id}`, label: clip.title };
  }
  if (note.gallerySlug) {
    const gallery = getGallery(note.gallerySlug);
    if (gallery) return { href: `/gallery/${gallery.id}`, label: gallery.title };
  }
  return null;
}
