import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/overheard/PostForm";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import { people } from "@/lib/content/taxonomy";
import { FREE_POST_ALLOWANCE, landedMessages } from "@/lib/content/overheard";
import {
  postCountForUser,
  recentPosts,
  type OverheardPost,
} from "@/lib/db/overheard";

export const metadata: Metadata = {
  title: "Overheard",
  description:
    "A running thread with Luna, Tyson, Josh and Rick — and anyone else who's watched it. Read free; post three times before the LunaVerse.",
  alternates: { canonical: "/overheard" },
};

/** Nothing here is cached: the thread grows daily and posts land live. */
export const dynamic = "force-dynamic";

const ADDRESSEE_LABELS: [string, string][] = [
  ["", "To the room"],
  ["melissa", "To Melissa"],
  ...people.map(
    (p) =>
      [p.id, `To ${p.label === "Herself" ? "Luna" : p.label}`] as [
        string,
        string,
      ],
  ),
];

/** Bare name for the "Luna to Tyson" line — the "To " prefix belongs to the
 *  form's dropdown, not to a transcript. */
function labelFor(value: string | null): string | null {
  if (!value) return null;
  const label = ADDRESSEE_LABELS.find(([v]) => v === value)?.[1];
  return label ? label.replace(/^To /, "") : null;
}

/** One line of the room, whichever side it came from. */
interface Line {
  key: string;
  at: Date;
  author: string;
  tint?: string;
  to: string | null;
  body: string[];
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

  // The cast's messages and everyone else's, merged into one transcript in the
  // order they landed. Two sources, one thread — which is the point: a
  // visitor's reply sits directly under whatever it is replying to.
  const lines: Line[] = [
    ...landedMessages(new Date()).map((m) => ({
      key: `cast:${m.id}`,
      at: m.landedAt,
      author: m.author.name,
      tint: m.author.tint,
      to: labelFor(m.addressedTo),
      body: m.body,
    })),
    ...posts.map((p: OverheardPost) => ({
      key: `post:${p.id}`,
      at: p.createdAt,
      author: p.authorName,
      to: labelFor(p.addressedTo),
      body: p.body.split("\n\n"),
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  return (
    <>
      <SiteHeader member={member} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-6 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Overheard
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            A thread with the four of them.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            Luna, Tyson, Josh and Rick talk here most days. So does anyone else
            who&rsquo;s watched it — say what you made of it, say what you think
            happens next, or put something straight to one of them.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-dim">
            Anyone can read it. Posting takes a free account and comes with{" "}
            {FREE_POST_ALLOWANCE}{" "}posts. After that you keep reading for free,
            and staying in the conversation is part of{" "}
            <Link
              href="/membership"
              className="text-amber underline decoration-hairline underline-offset-4 hover:decoration-amber"
            >
              the LunaVerse
            </Link>{" "}
            — the $8/month membership. Your name shows on what you write.
          </p>
        </header>

        {/* The transcript, oldest first, so the newest sits nearest the box. */}
        <section aria-label="Messages" className="mt-6">
          {lines.map((line, i) => (
            <div key={line.key}>
              {startsNewDay(lines, i) && <DayDivider at={line.at} />}
              <Message line={line} />
            </div>
          ))}
        </section>

        {/* At the bottom, where a chat's box belongs — you read down to the
            newest thing and then answer it. */}
        <div className="mt-8">
          <PostForm
            signedIn={signedIn}
            member={member}
            used={used}
            allowance={FREE_POST_ALLOWANCE}
            addressees={ADDRESSEE_LABELS}
          />
        </div>
      </main>
    </>
  );
}

/** True when this line is the first of its calendar day. */
function startsNewDay(lines: Line[], i: number): boolean {
  if (i === 0) return true;
  const prev = lines[i - 1].at;
  const now = lines[i].at;
  return (
    prev.getFullYear() !== now.getFullYear() ||
    prev.getMonth() !== now.getMonth() ||
    prev.getDate() !== now.getDate()
  );
}

/**
 * The date, once per day across the thread, rather than stamped on every line.
 * It is how a chat shows when something landed without repeating itself forty
 * times, and it keeps the time gutter narrow.
 */
function DayDivider({ at }: { at: Date }) {
  return (
    <div className="flex items-center gap-4 py-5">
      <span className="h-px flex-1 bg-hairline" />
      <span className="text-[0.6875rem] uppercase tracking-[0.14em] text-stone-dim">
        {dayLabel(at)}
      </span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}

function dayLabel(d: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/**
 * Chat layout rather than a card: a time gutter, the author, and the body
 * indented underneath. The cards this replaced had borders and rounded corners,
 * so every message looked like a link into something, and nothing here is.
 */
function Message({ line }: { line: Line }) {
  return (
    <div className="-mx-3 flex gap-3 rounded px-3 py-2 transition-colors duration-(--duration-quick) hover:bg-ivory/[0.025]">
      <time
        dateTime={line.at.toISOString()}
        className="w-12 shrink-0 pt-[0.2rem] text-right text-[0.6875rem] tabular-nums leading-5 text-stone-dim"
      >
        {line.at.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })}
      </time>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 leading-5">
          <span
            className="text-sm font-semibold"
            style={line.tint ? { color: line.tint } : undefined}
          >
            {line.author}
          </span>
          {line.to && (
            <span className="text-[0.6875rem] text-stone-dim">to {line.to}</span>
          )}
        </p>
        {line.body.map((para, i) => (
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

async function isSignedIn(): Promise<boolean> {
  if (!authConfigured()) return false;
  const { auth } = await import("@clerk/nextjs/server");
  return Boolean((await auth()).userId);
}

/** Posts this viewer has used. Zero when signed out — the form handles that. */
async function currentUserPostCount(): Promise<number> {
  if (!authConfigured()) return 0;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId ? postCountForUser(userId) : 0;
}
