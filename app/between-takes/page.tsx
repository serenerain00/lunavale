import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import {
  notebookPages,
  pageIsOpen,
  repliesTo,
  shootingDaysSoFar,
} from "@/lib/content/between-takes";
import { getPerson } from "@/lib/content/taxonomy";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Between Takes",
  description:
    "The notebook on the table at the edge of set. Luna, Tyson and Josh write in it between setups — and write back to each other. Still being filled in.",
  path: "/between-takes",
});

/**
 * The notebook, opened.
 *
 * This page exists because the notes did not have a book. Twenty-four of them
 * were already written (lib/content/between-takes.ts) and every one was filed
 * on the character page of whoever wrote it, which is a sensible way to file
 * things and a poor way to read them: the notebook's whole conceit is that
 * three people shared one object, and split three ways it stops being an object
 * at all. Nobody ever saw Josh answer Luna, because his answer was on his page.
 *
 * So the contents run in SHOOTING-DAY ORDER, not by author — whoever happened
 * to pick it up that day.
 *
 * NOTHING HERE MAY READ AS FINISHED. Filming is happening now (Melissa,
 * 2026-08-13). This page used to say the notebook "stayed on the table for
 * twenty-four days", which quietly announced a wrap that has not happened and
 * turned a live production into a closed archive. The day count is therefore
 * derived from the pages that exist rather than stated, so it stays true as she
 * shoots — and the copy says the book is open, not that it was.
 */
export default async function BetweenTakesPage() {
  const { active: member } = await getMembership();

  const pages = notebookPages();
  const open = pages.filter(pageIsOpen).length;
  const days = shootingDaysSoFar();
  const first = pages[0];

  return (
    <>
      <SiteHeader />

      <main className="flex-1 px-5 pb-24 sm:px-8">
        {/* ---------------------------------------------------------- cover */}
        <section className="mx-auto w-full max-w-3xl pt-12 sm:pt-20">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Between Takes
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.12] text-ivory sm:text-5xl">
            There is a notebook on the table at the edge of set.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone">
            Nobody was assigned it. It sits where people put their coffee down,
            and Luna, Tyson and Josh have all been writing in it — about the
            take they kept, about what a scene turned out to be, and, once they
            worked out the others were reading it, to each other.
          </p>
          <p className="mt-4 max-w-2xl leading-relaxed text-stone-dim">
            It runs in the order it was written, and it is still being written:
            they are filming now, so pages keep arriving. {days} shooting days
            in, {open} of the {pages.length} are open to everyone
            {member ? " — you have the rest." : "; the rest come with membership."}
          </p>

          {first && (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/between-takes/${first.id}`}
                className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
              >
                Open at page one
              </Link>
              {!member && (
                <Link
                  href="/membership"
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
                >
                  What membership opens
                </Link>
              )}
            </div>
          )}
        </section>

        {/* -------------------------------------------------------- contents */}
        <section
          aria-labelledby="contents-heading"
          className="mx-auto mt-16 w-full max-w-3xl sm:mt-24"
        >
          <h2
            id="contents-heading"
            className="font-display text-2xl font-medium text-ivory"
          >
            Every page
          </h2>

          <ol className="mt-6 divide-y divide-hairline border-t border-hairline">
            {pages.map((note, i) => {
              const writer = getPerson(note.author);
              const replies = repliesTo(note.id);
              const locked = !pageIsOpen(note) && !member;

              return (
                <li key={note.id}>
                  <Link
                    href={`/between-takes/${note.id}`}
                    className="group flex items-baseline gap-4 py-4 transition-colors duration-(--duration-quick)"
                  >
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-stone-dim">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base text-ivory group-hover:text-amber">
                        {note.heading}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-dim">
                        {writer?.id === "luna" ? "Luna" : writer?.label} ·{" "}
                        {note.dateline}
                        {/* Replies are the reason to open a page, so the
                            contents says when there are some. */}
                        {replies.length > 0 && (
                          <>
                            {" · "}
                            <span className="text-stone">
                              {replies.length === 1
                                ? "1 note written under it"
                                : `${replies.length} notes written under it`}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                    {locked && (
                      <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-amber-soft">
                        Members
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </>
  );
}
