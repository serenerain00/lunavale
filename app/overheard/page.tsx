import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/overheard/PostForm";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getMembership } from "@/lib/access/entitlement";
import { authConfigured } from "@/lib/billing/provider";
import { notFound } from "next/navigation";
import {
  CAST_TINTS,
  OVERHEARD_ARCHIVED,
  landedMessages,
  resolveMention,
} from "@/lib/content/overheard";
import { recentPosts, type OverheardPost } from "@/lib/db/overheard";

export const metadata: Metadata = {
  title: "Overheard",
  description:
    "A running thread with Luna, Tyson, Josh and Rick — and everyone else in the LunaVerse. Part of the membership.",
  alternates: { canonical: "/overheard" },
};

/** Nothing here is cached: the thread grows daily and posts land live. */
export const dynamic = "force-dynamic";

/** One line of the room, whichever side it came from. */
interface Line {
  key: string;
  at: Date;
  author: string;
  tint?: string;
  body: string[];
  /** Posted by Melissa — earns the Director badge. */
  owner?: boolean;
  /** The line this answers, if any. */
  replyTo?: string | null;
}

interface PageProps {
  searchParams: Promise<{ reply?: string }>;
}

export default async function OverheardPage({ searchParams }: PageProps) {
  // Archived — see OVERHEARD_ARCHIVED. notFound() rather than a "gone" page:
  // there is nothing to read here while it is off, and a page explaining that
  // the wall is closed is still a page about an empty wall.
  if (OVERHEARD_ARCHIVED) notFound();

  const [{ active: member }, signedIn, isOwnerViewer] = await Promise.all([
    getMembership(),
    isSignedIn(),
    viewerIsOwner(),
  ]);
  // No post-count query any more: nobody has a quota to be measured against
  // since the room went members-only, so that was a database round trip on
  // every page load to compute a number nothing rendered.
  const [posts, params] = await Promise.all([recentPosts(), searchParams]);

  // The cast's messages and everyone else's, merged into one transcript in the
  // order they landed. Two sources, one thread — which is the point: a
  // visitor's reply sits directly under whatever it is replying to.
  const lines: Line[] = [
    ...landedMessages(new Date()).map((m) => ({
      key: `cast:${m.id}`,
      at: m.landedAt,
      author: m.author.name,
      tint: m.author.tint,
      body: m.body,
    })),
    ...posts.map((p: OverheardPost) => ({
      key: `post:${p.id}`,
      at: p.createdAt,
      author: p.authorName,
      body: p.body.split("\n\n"),
      replyTo: p.replyTo,
      owner: p.isOwner && !p.castAs,
      tint: p.castAs ? CAST_TINTS[p.castAs] : undefined,
    })),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());

  // One pass so a reply can render a stub of what it answers without the
  // transcript doing a lookup per line.
  const byKey = new Map(lines.map((l) => [l.key, l]));
  const target = params.reply ? byKey.get(params.reply) : undefined;
  const replyingTo = target
    ? {
        key: target.key,
        author: target.author,
        snippet: snippet(target.body),
      }
    : null;

  return (
    <>
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-6 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            Overheard
          </p>
          <h1 className="mt-4 font-display text-3xl font-light leading-[1.15] text-ivory sm:text-5xl">
            A thread with the four of them.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-stone">
            Luna, Tyson, Josh and Rick talk here most days. So does everyone
            else in the LunaVerse — say what you made of it, say what you think
            happens next, or put something straight to one of them.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-dim">
            {member ? (
              <>Your name shows on what you write.</>
            ) : (
              <>
                The room is part of{" "}
                <Link
                  href="/membership"
                  className="text-amber underline decoration-hairline underline-offset-4 hover:decoration-amber"
                >
                  the LunaVerse
                </Link>{" "}
                — the $8/month membership. Reading it and writing in it are the
                same door.
              </>
            )}
          </p>
        </header>

        {/* The room is members-only, reading included. Neither the transcript
            nor the box is rendered for anybody else — and nothing here is the
            boundary: the refusal that counts is in actions.ts, on the server,
            per CLAUDE.md. */}
        {member ? (
          <>
            {/* The transcript, oldest first, so the newest sits nearest the box. */}
            <section aria-label="Messages" className="mt-6">
              {lines.map((line, i) => (
                <div key={line.key}>
                  {startsNewDay(lines, i) && <DayDivider at={line.at} />}
                  <Message
                    line={line}
                    answering={
                      line.replyTo ? byKey.get(line.replyTo) : undefined
                    }
                  />
                </div>
              ))}
            </section>

            {/* At the bottom, where a chat's box belongs — you read down to
                the newest thing and then answer it. */}
            <div className="mt-8">
              <PostForm
                signedIn={signedIn}
                replyingTo={replyingTo}
                canPostAsCast={isOwnerViewer}
              />
            </div>
          </>
        ) : (
          <RoomLocked
            messageCount={lines.length}
            postCount={posts.length}
            lastAt={lines.at(-1)?.at}
          />
        )}
      </main>
    </>
  );
}

/**
 * The closed door.
 *
 * It states the size of the room and when somebody last said something, and
 * shows not one line of it. That split is deliberate on two counts. A visitor
 * should be able to tell whether there is anything in there worth paying for —
 * "quiet since March" and "someone posted an hour ago" are different products,
 * and only one of them is worth £8 — so the numbers are real and are not
 * rounded up.
 *
 * But no message is quoted, not even a teaser. Everything in the transcript
 * was written by somebody with an account, into what is now a members' room,
 * and lifting a line of it onto a public page to sell subscriptions would be
 * using people's words as advertising they never agreed to. The cast's lines
 * are Melissa's to publish and could honestly be shown; mixing them into a
 * shop window with real posts is how that line gets blurred, so the wall is
 * simply closed.
 *
 * Per docs/monetization/MONETIZATION.md: one statement, one link, no nag.
 */
function RoomLocked({
  messageCount,
  postCount,
  lastAt,
}: {
  messageCount: number;
  postCount: number;
  lastAt?: Date;
}) {
  return (
    <section
      aria-label="Members only"
      className="mt-6 rounded-xl border border-hairline bg-charcoal/40 px-5 py-8 text-center sm:px-8 sm:py-10"
    >
      <span className="inline-flex items-center gap-2 rounded-full bg-void/70 px-3.5 py-1.5 text-sm text-amber-soft">
        Members only
      </span>

      <p className="mx-auto mt-4 max-w-md text-balance leading-relaxed text-ivory">
        The room is open to the LunaVerse.{" "}
        {messageCount > 0 && (
          <>
            There {messageCount === 1 ? "is" : "are"} {messageCount}{" "}
            {messageCount === 1 ? "message" : "messages"} in it
            {postCount > 0 && (
              <>
                , {postCount} of them from people who have watched it
              </>
            )}
            {lastAt && <>, and the last one landed {relative(lastAt)}</>}.
          </>
        )}
      </p>

      <Link
        href="/membership"
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
      >
        See what membership opens
      </Link>
    </section>
  );
}

/** "an hour ago", "yesterday" — vague on purpose, it is only a liveness signal. */
function relative(at: Date): string {
  const mins = Math.max(0, Math.round((Date.now() - at.getTime()) / 60000));
  if (mins < 60) return "in the last hour";
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
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
function Message({
  line,
  answering,
}: {
  line: Line;
  answering?: Line;
}) {
  return (
    <div className="group -mx-3 flex gap-3 rounded px-3 py-2 transition-colors duration-(--duration-quick) hover:bg-ivory/[0.025]">
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
          {line.owner && (
            <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[0.625rem] uppercase tracking-[0.1em] text-amber-soft">
              Director
            </span>
          )}
        </p>
        {/* What it answers, quoted above it — the way a message app shows it,
            so you never have to scroll up to find out what "no it isn't" meant. */}
        {answering && (
          <p className="mt-1 border-l-2 border-hairline pl-2.5 text-xs leading-relaxed text-stone-dim">
            <span className="text-stone">{answering.author}</span>{" "}
            <span className="italic">{snippet(answering.body)}</span>
          </p>
        )}
        {line.body.map((para, i) => (
          <p
            key={i}
            className="mt-1 whitespace-pre-line text-[0.9375rem] leading-relaxed text-stone"
          >
            {withMentions(para)}
          </p>
        ))}
        {/* Appears on hover and on keyboard focus — never a permanent row of
            controls under every line. */}
        <Link
          href={`/overheard?reply=${encodeURIComponent(line.key)}#say`}
          scroll={false}
          className="mt-1 inline-block text-[0.6875rem] text-stone-dim opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
        >
          Reply
        </Link>
      </div>
    </div>
  );
}

/**
 * Renders @Name in amber. Only the five real names light up — an unknown @word
 * stays plain text rather than implying somebody was tagged who wasn't.
 */
function withMentions(text: string) {
  return text.split(/(@\w+)/g).map((part, i) => {
    // Case-insensitive: "@melissa" has plainly tagged Melissa, and a mention
    // that fails on a capital letter is worse than no mention at all.
    const canonical = part.startsWith("@") ? resolveMention(part.slice(1)) : null;
    if (canonical) {
      return (
        <span key={i} className="font-medium text-amber-soft">
          @{canonical}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/** First line of a message, trimmed — enough to recognize it by. */
function snippet(body: string[], max = 90): string {
  const first = (body[0] ?? "").trim();
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

async function viewerIsOwner(): Promise<boolean> {
  const owner = process.env.OWNER_USER_ID;
  if (!owner || !authConfigured()) return false;
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  return userId === owner;
}

async function isSignedIn(): Promise<boolean> {
  if (!authConfigured()) return false;
  const { auth } = await import("@clerk/nextjs/server");
  return Boolean((await auth()).userId);
}

/* `currentUserPostCount` lived here, counting a viewer's posts against the
 * three-post allowance. Removed 2026-08-03 with the allowance itself — see
 * FREE_POST_ALLOWANCE in lib/content/overheard.ts for why the constant stays
 * even though nothing gates on it. lib/db/overheard.ts still exports
 * `postCountForUser`; app/admin uses it to report on the accounts that were
 * subject to the old rule. */
