import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/overheard/PostForm";
import { Reveal } from "@/components/motion/Reveal";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import { people } from "@/lib/content/taxonomy";
import {
  FREE_POST_ALLOWANCE,
  MELISSA,
  OPENING_POSTS,
  type OpeningPost,
} from "@/lib/content/overheard";
import {
  postCountForUser,
  recentPosts,
  type OverheardPost,
} from "@/lib/db/overheard";

export const metadata: Metadata = {
  title: "Overheard",
  description:
    "Talk about Luna Vale with other people who've watched it — and put questions straight to Melissa, Luna, Tyson, Josh or Rick.",
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
            Say what you actually think.
          </h1>
          {/* Plain on purpose. This replaced a bar metaphor that assumed the
              visitor had already watched the bar scene, and whose "nobody can
              prove you said it" was worse than obscure — it was wrong, because
              posts here are public and carry your name. */}
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            A place to talk about the story with other people who&rsquo;ve
            watched it — what you made of it, what you think happens next, and
            anything you want to ask Melissa or put straight to Luna, Tyson,
            Josh or Rick.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-dim">
            Anyone can read it. Posting takes a free account and comes with{" "}
            {FREE_POST_ALLOWANCE}{" "}posts — after that it&rsquo;s part of the
            LunaVerse. Your name shows on what you write.
          </p>
        </header>

        <PostForm
          signedIn={signedIn}
          member={member}
          used={used}
          allowance={FREE_POST_ALLOWANCE}
          addressees={ADDRESSEE_LABELS}
        />

        <section aria-label="Posts" className="mt-12 space-y-5">
          {/* Melissa's openers, pinned. Visually distinct from a visitor post,
              because a host talking first is only fine if it is obvious that is
              what is happening. */}
          {OPENING_POSTS.map((post) => (
            <Pinned key={post.id} post={post} />
          ))}

          {posts.length === 0 ? (
            <NoRepliesYet />
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

/** A pinned post from Melissa or from one of the cast. Amber-edged, badged, and
 *  never counted among the visitor posts — see OPENING_POSTS in
 *  lib/content/overheard.ts. */
function Pinned({ post }: { post: OpeningPost }) {
  const author = post.author ?? MELISSA;
  return (
    <article className="rounded-xl border border-amber/25 bg-amber/[0.04] p-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-display text-lg text-ivory">{author.name}</p>
        <span className="rounded-full bg-amber/15 px-2.5 py-0.5 text-[0.6875rem] uppercase tracking-[0.1em] text-amber-soft">
          {author.role}
        </span>
        <span className="ml-auto text-xs text-stone-dim">Pinned</span>
      </div>
      {post.body.map((para, i) => (
        <p
          key={i}
          className={`text-base leading-relaxed text-stone ${i === 0 ? "mt-3" : "mt-3"}`}
        >
          {para}
        </p>
      ))}
    </article>
  );
}

/**
 * Shown while the openers are up but nobody has replied. Deliberately does NOT
 * claim the room is busy — the posts above are the host's, and pretending three
 * of her own remarks constitute a conversation is the exact dishonesty this
 * page is built to avoid.
 */
function NoRepliesYet() {
  return (
    <div className="rounded-xl border border-hairline bg-charcoal/40 p-10 text-center">
      <p className="font-display text-xl text-ivory">
        Nobody has replied yet.
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-stone">
        This room is new. Whoever goes first gets the whole wall to themselves
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
