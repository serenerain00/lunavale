import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";

/**
 * The 404, and until 2026-09-09 there wasn't one.
 *
 * WHAT WAS ACTUALLY HAPPENING. With no not-found boundary at the root, a bad
 * URL under a dynamic segment — /clips/<slug>, /journal/<id>, /posts/<id>,
 * /gallery/<id> — did not fall back to a styled page. It fell back to Next's
 * raw error document: `<html id="__next_error__">`, no layout, no header, no
 * navigation, no way back to the site. A visitor following a link to a scene
 * that has been renamed, or a shared URL with a character missing off the end,
 * arrived at what looks like a broken server.
 *
 * That is a real path, not a hypothetical: every slug on this site is
 * shareable, several have been renamed (luna-josh-break, ty-luna-lake-fight),
 * and one scene was pulled to be recut. Links outlive the pages they point at.
 *
 * ONE FILE FIXES ALL OF THEM. A root not-found is the boundary every segment
 * without its own falls back to, so this covers every dynamic route at once
 * and every future one for free.
 *
 * IT LEADS SOMEWHERE, which is the only thing a 404 is really for. Four ways
 * on, chosen so that whatever the person came for, one of them is close: the
 * journal (the strongest thing a stranger can be handed), the scenes, the
 * clips, and home. CLAUDE.md asks for a clear way home and a conventional
 * content index on every dead end; this is that, on the deadest one.
 *
 * IN THE WORLD'S VOICE BUT NOT AT THE COST OF BEING USEFUL. It says what
 * happened in one plain line before it says anything atmospheric.
 */

export const metadata: Metadata = {
  title: "Not found",
  // A 404 in an index is worse than no page at all, and this one is reachable
  // at unlimited URLs.
  robots: { index: false, follow: false },
};

const WAYS_ON = [
  { href: "/journal", label: "Her journal", note: "The pages she kept" },
  { href: "/clips", label: "The clips", note: "The whole story, in order" },
  { href: "/posts", label: "Clips", note: "The short ones" },
  { href: "/", label: "Start again", note: "Back to the beginning" },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.2em] text-amber">
          Nothing here
        </p>

        <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-4xl">
          There is no room at this address.
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone">
          Either the link has a character missing off the end of it, or
          something that used to live here has been moved. Both happen. Neither
          is your fault.
        </p>

        <nav aria-label="Ways on" className="mt-10 grid gap-3 sm:grid-cols-2">
          {WAYS_ON.map((way) => (
            <Link
              key={way.href}
              href={way.href}
              className="group rounded-xl border border-hairline bg-charcoal/40 px-5 py-4 transition-colors duration-(--duration-quick) hover:border-amber/40"
            >
              <span className="block text-base text-ivory transition-colors duration-(--duration-quick) group-hover:text-amber">
                {way.label}
              </span>
              <span className="mt-1 block text-sm text-stone">{way.note}</span>
            </Link>
          ))}
        </nav>
      </main>
    </>
  );
}
