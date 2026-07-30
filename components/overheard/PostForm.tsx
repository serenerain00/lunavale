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
  /** Who a post can be addressed to: [value, label]. */
  addressees: [string, string][];
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
  addressees,
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
          free, and it comes with three posts to start.
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
      className="rounded-xl border border-hairline bg-charcoal/60 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor="body"
          className="font-display text-xl text-ivory"
        >
          Say something
        </label>
        <div className="flex items-center gap-2 text-xs text-stone-dim">
          <label htmlFor="addressedTo" className="sr-only">
            Who this is for
          </label>
          <select
            id="addressedTo"
            name="addressedTo"
            defaultValue=""
            className="rounded-full border border-hairline bg-void px-3 py-1.5 text-xs text-stone focus:border-amber focus:outline-none"
          >
            {addressees.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        id="body"
        name="body"
        rows={4}
        maxLength={MAX_POST_LENGTH}
        required
        placeholder="What did you make of it?"
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
              ? "One post left before the LunaVerse."
              : `${left} posts left before the LunaVerse.`}
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
