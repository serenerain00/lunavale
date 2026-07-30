import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/overheard/PostForm";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import { people } from "@/lib/content/taxonomy";
import { FREE_POST_ALLOWANCE } from "@/lib/content/overheard";
import {
  postCountForUser,
  recentPosts,
  type OverheardPost,
} from "@/lib/db/overheard";

export const metadata: Metadata = {
  title: "Overheard",
  description:
    "The room next to the story. Anyone can read it; anyone can say three things; members stay in the conversation.",
  alternates: { canonical: "/overheard" },
};

/** Nothing here is cached — a wall that shows yesterday's posts is broken. */
export const dynamic = "force-dynamic";

const ADDRESSEE_LABELS: [string, string][] = [
  ["", "To the room"],
  ["melissa", "To Melissa"],
  ...people.map((p) => [p.id, `To ${p.label === "Herself" ? "Luna" : p.label}`] as [string, string]),
];

function labelFor(value: string | null): string | null {
  if (!value) return null;
  return ADDRESSEE_LABELS.find(([v]) => v === value)?.[1] ?? null;
}

export default async function OverheardPage() {
  const [{ active: member }, signedIn] = await Promise.all([
    getMembership(),
    isSignedIn(),
  ]);

  const [posts, used] = await Promise.all([
    recentPosts(),
    currentUserPostCount(),
  ]);

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Overheard
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            The room next to the story.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            The bar in this story is loud enough that you can say the real thing
            and nobody can prove you said it. This is that, for everyone else —
            what you made of it, what you think happens next, and anything you
            want to put to Melissa or to the three of them.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-dim">
            Reading is open to everybody, always. Posting takes a free account,
            and comes with {FREE_POST_ALLOWANCE} posts.
          </p>
        </header>

        <PostForm
          signedIn={signedIn}
          member={member}
          used={used}
          allowance={FREE_POST_ALLOWANCE}
          addressees={ADDRESSEE_LABELS}
        />

        <section aria-label="Posts" className="mt-12">
          {posts.length === 0 ? (
            <Empty />
          ) : (
            <Reveal className="space-y-5">
              {posts.map((post) => (
                <Post key={post.id} post={post} />
              ))}
            </Reveal>
          )}
        </section>
      </main>
    </>
  );
}

function Post({ post }: { post: OverheardPost }) {
  const to = labelFor(post.addressedTo);
  return (
    <article
      data-reveal-item
      className="rounded-xl border border-hairline bg-charcoal/50 p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-lg text-ivory">{post.authorName}</p>
        {to && (
          <span className="rounded-full bg-amber/10 px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-[0.1em] text-amber-soft">
            {to}
          </span>
        )}
        <time
          dateTime={post.createdAt.toISOString()}
          className="ml-auto text-xs text-stone-dim"
        >
          {post.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      {/* whitespace-pre-line so paragraph breaks survive without allowing markup. */}
      <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-stone">
        {post.body}
      </p>
    </article>
  );
}

/**
 * The empty state, which is the state this page is in on day one. It says so
 * plainly instead of pretending — "be the first" is a real invitation, and a
 * visitor who is told the room is new reads it very differently from one who
 * concludes everybody left.
 */
function Empty() {
  return (
    <div className="rounded-xl border border-hairline bg-charcoal/40 p-10 text-center">
      <p className="font-display text-xl text-ivory">
        Nobody has said anything yet.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone">
        This room is new. Whoever posts first gets the whole wall to themselves
        for a while, which is not the worst offer.
      </p>
      <Link
        href="/journal"
        className="mt-5 inline-block text-sm text-amber underline decoration-hairline underline-offset-4"
      >
        Read her journal first →
      </Link>
    </div>
  );
}

async function isSignedIn(): Promise<boolean> {
  if (!authConfigured()) return false;
  const { auth } = await import("@clerk/nextjs/server");
  return Boolean((await auth()).userId);
}

/** Posts this viewer has used. Zero when signed out — the form handles that case. */
async function currentUserPostCount(): Promise<number> {
  if (!authConfigured()) return 0;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId ? postCountForUser(userId) : 0;
}
