import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NotebookPage } from "@/components/between-takes/NotebookPage";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import {
  getNote,
  notebookPages,
  pageIsOpen,
} from "@/lib/content/between-takes";
import { getPerson } from "@/lib/content/taxonomy";
import { cardDescription, pageMetadata } from "@/lib/seo/metadata";

/**
 * One page of the set notebook, at its own URL.
 *
 * DEEP-LINKABLE BY DESIGN, not incidentally. The obvious way to build "an
 * interactive notebook" is one client component holding an index and swapping
 * pages in place, which gives you a beautiful object with a single URL — no
 * page can be linked, shared, bookmarked or indexed, and the back button
 * leaves the book entirely. CLAUDE.md rules that out and it is right to: this
 * is the material the membership sells, so every page needs to be a thing you
 * can send someone.
 *
 * So the book is routed. Each page is server-rendered, the turn is a real
 * navigation, and entitlement is resolved per page on the server rather than
 * hidden in the client.
 */

export async function generateStaticParams() {
  return notebookPages().map((note) => ({ id: note.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const note = getNote(id);
  if (!note || note.replyTo) return { title: "Between Takes" };

  const writer = getPerson(note.author);
  const who = writer?.id === "luna" ? "Luna" : (writer?.label ?? note.author);

  return pageMetadata({
    title: `${note.heading} · Between Takes`,
    // The first line only, and only when the page is open to everyone.
    // Putting a members-only paragraph in a meta description would publish the
    // thing the membership sells to every search engine on earth — and, worse,
    // into the preview card of anyone who shares the link.
    description: pageIsOpen(note)
      ? cardDescription(note.body[0] ?? "")
      : `A page from the cast notebook, written by ${who} on ${note.dateline}.`,
    path: `/between-takes/${note.id}`,
    // Deliberately the site default rather than the scene's poster. A note is
    // not the scene it was written beside, and a card showing the scene would
    // promise a video to somebody who clicks through to a page of handwriting.
  });
}

export default async function NotebookPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = getNote(id);

  // A reply is not a page. It renders under the page it was written on, so a
  // link to one belongs there — redirecting keeps old links working rather
  // than 404ing somebody who bookmarked marginalia.
  if (note?.replyTo) {
    const { redirect } = await import("next/navigation");
    redirect(`/between-takes/${note.replyTo}#page-${note.id}`);
  }
  if (!note) notFound();

  const { active: member } = await getMembership();

  const pages = notebookPages();
  const index = pages.findIndex((p) => p.id === note.id);
  const previous = index > 0 ? pages[index - 1] : undefined;
  const next = index < pages.length - 1 ? pages[index + 1] : undefined;

  return (
    <>
      <SiteHeader member={member} />

      <main className="flex-1 px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <div className="mx-auto w-full max-w-2xl">
          <Link
            href="/between-takes"
            className="text-xs uppercase tracking-[0.18em] text-stone transition-colors duration-(--duration-quick) hover:text-amber"
          >
            ← The notebook
          </Link>
          <p className="mt-2 text-xs text-stone-dim">
            Page {index + 1} of {pages.length}
          </p>
        </div>

        <div className="mt-8">
          <NotebookPage note={note} unlocked={member} />
        </div>

        {/* --------------------------------------------------------- leafing */}
        <nav
          aria-label="Notebook pages"
          className="mx-auto mt-12 flex w-full max-w-2xl items-stretch justify-between gap-4"
        >
          {previous ? (
            <Leaf note={previous} direction="back" />
          ) : (
            <span aria-hidden className="flex-1" />
          )}
          {next ? (
            <Leaf note={next} direction="forward" />
          ) : (
            <span aria-hidden className="flex-1" />
          )}
        </nav>
      </main>
    </>
  );
}

/**
 * The turn to the next or previous page.
 *
 * Named rather than an arrow alone: "what is on the other side" is the question
 * a physical book answers by being physical, and a bare chevron answers it with
 * nothing. Showing the heading also means the two ends of the book are
 * navigable by anyone reading the page with a screen reader.
 */
function Leaf({
  note,
  direction,
}: {
  note: ReturnType<typeof notebookPages>[number];
  direction: "back" | "forward";
}) {
  const writer = getPerson(note.author);
  const back = direction === "back";

  return (
    <Link
      href={`/between-takes/${note.id}`}
      rel={back ? "prev" : "next"}
      className={`group flex flex-1 flex-col gap-1 rounded-xl border border-hairline p-4 transition-colors duration-(--duration-quick) hover:border-amber ${
        back ? "items-start text-left" : "items-end text-right"
      }`}
    >
      <span className="text-xs uppercase tracking-[0.16em] text-stone-dim">
        {back ? "← Back a page" : "On a page →"}
      </span>
      <span className="text-sm text-ivory group-hover:text-amber">
        {note.heading}
      </span>
      <span className="text-xs text-stone-dim">
        {writer?.id === "luna" ? "Luna" : writer?.label} · {note.dateline}
      </span>
    </Link>
  );
}
