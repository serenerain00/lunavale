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

/** Bare name for the row's "Luna to Tyson" line — the "To " prefix belongs to
 *  the form's dropdown, not to the transcript. */
function labelFor(value: string | null): string | null {
  if (!value) return null;
  const label = ADDRESSEE_LABELS.find(([v]) => v === value)?.[1];
  return label ? label.replace(/^To /, "") : null;
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
            Josh, or Rick.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-dim">
            Anyone can read it. Posting takes a free account and comes with{" "}
            {FREE_POST_ALLOWANCE}{" "}posts. After that you keep reading for
            free, and carrying on the conversation is part of{" "}
            <Link
              href="/membership"
              className="text-amber underline decoration-hairline underline-offset-4 hover:decoration-amber"
            >
              the LunaVerse
            </Link>{" "}
            — the $8/month membership. Your name shows on what you write.
          </p>
        </header>

        <PostForm
          signedIn={signedIn}
          member={member}
          used={used}
          allowance={FREE_POST_ALLOWANCE}
          addressees={ADDRESSEE_LABELS}
        />

        <section aria-label="Messages" className="mt-12 divide-y divide-hairline/40">
          {/* Melissa's openers, pinned. Visually distinct from a visitor post,
              because a host talking first is only fine if it is obvious that is
              what is happening. */}
          {OPENING_POSTS.map((post) => (
            <Pinned key={post.id} post={post} />
          ))}

          {posts.length === 0 ? (
            <NoRepliesYet />
          ) : (
            <Reveal>
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

/**
 * One line of the room.
 *
 * Chat layout rather than cards: a time gutter, the author, and the body
 * indented underneath. The cards this replaced had borders and rounded corners,
 * which made every message look like a link into something — and nothing here
 * is clickable.
 */
function Message({
  at,
  author,
  tint,
  to,
  body,
  pinned = false,
}: {
  at: string;
  author: string;
  tint?: string;
  to?: string | null;
  body: string[];
  pinned?: boolean;
}) {
  return (
    <div className="-mx-3 flex gap-3 rounded px-3 py-2 transition-colors duration-(--duration-quick) hover:bg-ivory/[0.025]">
      <span className="w-11 shrink-0 pt-[0.2rem] text-right text-[0.6875rem] tabular-nums leading-5 text-stone-dim">
        {at}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 leading-5">
          <span
            className="text-sm font-semibold"
            style={tint ? { color: tint } : undefined}
          >
            {author}
          </span>
          {to && (
            <span className="text-[0.6875rem] text-stone-dim">to {to}</span>
          )}
          {pinned && (
            <span className="text-[0.6875rem] uppercase tracking-[0.1em] text-stone-dim">
              pinned
            </span>
          )}
        </p>
        {body.map((para, i) => (
          <p
            key={i}
            className="mt-1 whitespace-pre-line text-[0.9375rem] leading-relaxed text-stone"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}

/** A pinned line from Melissa or one of the cast. */
function Pinned({ post }: { post: OpeningPost }) {
  const author = post.author ?? MELISSA;
  return (
    <Message
      at={post.at}
      author={author.name}
      tint={author.tint}
      to={labelFor(post.addressedTo)}
      body={post.body}
      pinned
    />
  );
}

/** A real post, from a real account. */
function Post({ post }: { post: OverheardPost }) {
  return (
    <Message
      at={clockFor(post.createdAt)}
      author={post.authorName}
      to={labelFor(post.addressedTo)}
      body={post.body.split("\n\n")}
    />
  );
}

/** Time for today, date for anything older — what a chat gutter wants. */
function clockFor(d: Date): string {
  const today = new Date();
  const sameDay =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  return sameDay
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
