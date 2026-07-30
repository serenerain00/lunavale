"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitPost, type PostResult } from "@/app/overheard/actions";
import { MAX_POST_LENGTH } from "@/lib/content/overheard";

interface PostFormProps {
  /** Signed in at all. Without this there is nothing to count against. */
  signedIn: boolean;
  member: boolean;
  /** Posts already used, for the "one left" line. Ignored for members. */
  used: number;
  allowance: number;
  /** The line being answered, when the URL asks for one. */
  replyingTo?: { key: string; author: string; snippet: string } | null;
}

/**
 * The box. Three states, and the difference between them is the whole feature:
 * not signed in, has turns left, out of turns.
 *
 * The remaining count is stated plainly rather than counted down dramatically —
 * MONETIZATION.md rules out fake urgency, and "one left" is information a
 * person is entitled to before they spend it, not a lever.
 */
export function PostForm({
  signedIn,
  member,
  used,
  allowance,
  replyingTo = null,
}: PostFormProps) {
  const [state, action, pending] = useActionState<PostResult | null, FormData>(
    async (_prev, formData) => submitPost(formData),
    null,
  );

  const left = Math.max(0, allowance - used);
  const spent = !member && left === 0;

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-hairline bg-charcoal/60 p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ivory">Say something</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
          Anyone can read Overheard. To post you need an account — it&rsquo;s
          free, and it comes with three posts.
        </p>
        <Link
          href="/sign-up"
          className="mt-5 inline-flex min-h-10 items-center rounded-full bg-amber px-5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
        >
          Create a free account
        </Link>
      </div>
    );
  }

  if (spent) {
    return (
      <div className="rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ivory">
          That&rsquo;s your three
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
          Members talk as much as they like. Everything you&rsquo;ve already
          said stays up either way — and you can keep reading for as long as
          you want.
        </p>
        <Link
          href="/membership"
          className="mt-5 inline-flex min-h-10 items-center rounded-full bg-amber px-5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
        >
          Join the LunaVerse
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      id="say"
      className="rounded-xl border border-hairline bg-charcoal/60 p-5 sm:p-6"
    >
      {/* Carried in the URL rather than client state, so a "reply to this" link
          is an ordinary link — shareable, and it survives a refresh. */}
      <input type="hidden" name="replyTo" value={replyingTo?.key ?? ""} />
      {replyingTo && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border-l-2 border-amber/50 bg-void/40 py-2 pl-3 pr-2">
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-stone-dim">
            Replying to{" "}
            <span className="text-stone">{replyingTo.author}</span>
            <span className="block truncate italic">
              {replyingTo.snippet}
            </span>
          </p>
          <Link
            href="/overheard#say"
            className="shrink-0 text-xs text-stone-dim underline decoration-hairline underline-offset-2 hover:text-amber"
          >
            Cancel
          </Link>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor="body"
          className="font-display text-xl text-ivory"
        >
          Say something
        </label>
      </div>

      <textarea
        id="body"
        name="body"
        rows={4}
        maxLength={MAX_POST_LENGTH}
        required
        placeholder="What did you make of it? Use @Luna, @Tyson, @Josh, @Rick or @Melissa to tag someone."
        className="mt-4 w-full resize-y rounded-lg border border-hairline bg-void px-4 py-3 text-base leading-relaxed text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
      />

      {state?.error && (
        <p className="mt-3 text-sm text-amber-soft">{state.error}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-dim">
          {member
            ? "Member — post as often as you like."
            : left === 1
              ? "One post left, then you'll need a membership."
              : `${left} posts left, then you'll need a membership.`}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center rounded-full bg-amber px-5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
