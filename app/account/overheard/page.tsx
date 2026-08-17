import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OVERHEARD_ARCHIVED } from "@/lib/content/overheard";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import { allPostsForModeration } from "@/lib/db/overheard";
import { toggleHidden } from "./actions";

export const metadata: Metadata = {
  title: "Moderate Overheard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Moderation for Overheard.
 *
 * Deliberately plain and deliberately fast to use: the job is "read the new
 * ones, hide the bad one", and anything more elaborate would be a page Melissa
 * has to learn instead of a page she can act on.
 *
 * Hiding never deletes. The row stays, and it still counts against its author's
 * allowance — otherwise "post something that gets hidden, repeat" is an
 * unlimited allowance.
 */
export default async function ModeratePage() {
  if (OVERHEARD_ARCHIVED) notFound();

  if (!authConfigured() || !(await isOwner())) notFound();

  const [{ active: member }, posts] = await Promise.all([
    getMembership(),
    allPostsForModeration(),
  ]);

  const visible = posts.filter((p) => !p.hidden).length;

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Moderation
          </p>
          <h1 className="mt-4 font-display text-3xl font-light text-ivory sm:text-4xl">
            Overheard
          </h1>
          <p className="mt-3 text-sm text-stone">
            {posts.length} {posts.length === 1 ? "post" : "posts"} ever,{" "}
            {visible} showing.{" "}
            <Link
              href="/overheard"
              className="text-amber underline decoration-hairline underline-offset-4"
            >
              See the room
            </Link>
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="rounded-lg border border-hairline bg-charcoal/40 p-10 text-center text-stone">
            Nobody has posted yet. The cast thread runs whatever happens.
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {posts.map((post) => (
              <li
                key={post.id}
                className={`flex flex-wrap items-start gap-x-4 gap-y-2 py-4 ${
                  post.hidden ? "opacity-45" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-semibold text-ivory">
                      {post.authorName}
                    </span>
                    <span className="text-xs text-stone-dim">
                      {post.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    {post.replyTo && (
                      <span className="text-xs text-stone-dim">· a reply</span>
                    )}
                    {post.hidden && (
                      <span className="rounded-full bg-wine/30 px-2 py-0.5 text-[0.6875rem] uppercase tracking-wide text-ivory">
                        hidden
                      </span>
                    )}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[0.9375rem] leading-relaxed text-stone">
                    {post.body}
                  </p>
                </div>

                <form action={toggleHidden}>
                  <input type="hidden" name="id" value={post.id} />
                  <input
                    type="hidden"
                    name="hidden"
                    value={post.hidden ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full border border-hairline px-3.5 py-1.5 text-xs text-stone transition-colors hover:border-amber hover:text-amber"
                  >
                    {post.hidden ? "Show" : "Hide"}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

/**
 * Only Melissa. Gated on an explicit env var rather than "is a member", because
 * every paying member is a member and none of them should see this.
 */
async function isOwner(): Promise<boolean> {
  const owner = process.env.OWNER_USER_ID;
  if (!owner) return false;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return Boolean(userId && userId === owner);
}
