"use client";

import { useActionState, useId } from "react";
import { joinList, type FollowResult } from "@/app/follow/actions";

/**
 * One field, and the only thing on this site that asks for anything without
 * asking for money.
 *
 * WHERE IT GOES: at the two moments somebody has just finished something and
 * feels warmly about it — the end of the survey, and the end of a scene. Never
 * on arrival, never as a pop-up, never on a timer. An address given because
 * somebody wanted to hear from her is worth more than fifty collected by
 * standing in front of the thing they came for, and CLAUDE.md's rule against
 * constant interruption applies to this as much as to the membership.
 *
 * THE COPY SAYS WHAT THEY WILL GET AND HOW OFTEN, in plain words, at the point
 * of asking. That is not politeness — it is the whole basis on which the list
 * is allowed to exist, and a list built on a vague promise gets marked as spam
 * by the third send.
 *
 * NO ACCOUNT, NO PASSWORD, NO CONFIRMATION LOOP. See lib/db/followers.ts.
 */
export function FollowForm({
  source,
  label,
  note,
  done,
  compact = false,
}: {
  /** "survey", or "scene:<slug>". Validated server-side. */
  source: string;
  /** The ask, above the field. */
  label: string;
  /** The promise: what arrives, how often, and how to stop. */
  note: string;
  /** What to say once they are on it. */
  done: string;
  /** Tighter spacing, for the survey drawer. */
  compact?: boolean;
}) {
  const id = useId();
  const [state, action, pending] = useActionState<FollowResult | null, FormData>(
    async (_prev, formData) => joinList(formData),
    null,
  );

  if (state?.ok) {
    return (
      <p
        // Announced politely so a screen-reader user is told it worked, rather
        // than being left wondering whether the button did anything.
        aria-live="polite"
        className={`text-sm leading-relaxed text-amber ${compact ? "" : "mt-2"}`}
      >
        {done}
      </p>
    );
  }

  return (
    <form action={action} className={compact ? "" : "mt-2"}>
      {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
      <div aria-hidden className="hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <input type="hidden" name="source" value={source} />

      <label htmlFor={`${id}-email`} className="block text-sm text-stone">
        {label}
      </label>

      {/* Stacks on a phone and sits on one line from `sm` up. The button is a
          full-height sibling rather than an icon inside the field: an input
          with something floating in it is a smaller tap target and a worse
          thing to explain to a screen reader. */}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className="min-h-11 w-full rounded-lg border border-hairline bg-void px-4 py-2.5 text-base text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:opacity-60"
        >
          {pending ? "One moment" : "Keep me posted"}
        </button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-stone-dim">{note}</p>

      {state?.error && (
        <p aria-live="polite" className="mt-2 text-sm text-[#c98a3e]">
          {state.error}
        </p>
      )}
    </form>
  );
}
