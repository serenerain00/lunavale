"use client";

import { useActionState } from "react";
import { sendHelp, type HelpResult } from "@/app/help/actions";
import { MAX_BODY } from "@/lib/content/help";

/**
 * The form. Sends to Melissa without ever putting her address on the page —
 * no mailto, nothing in the source, nothing for a scraper to find.
 */
export function HelpForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState<HelpResult | null, FormData>(
    async (_prev, formData) => sendHelp(formData),
    null,
  );

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ivory">That&rsquo;s sent.</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
          It goes straight to Melissa. She reads everything, and she answers
          most things — but she&rsquo;s one person making a film, so give her a
          few days before you assume it vanished.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-xl border border-hairline bg-charcoal/60 p-5 sm:p-6"
    >
      {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label htmlFor="subject" className="block text-sm text-stone">
        What&rsquo;s it about?
      </label>
      <input
        id="subject"
        name="subject"
        type="text"
        maxLength={120}
        placeholder="Optional — a few words"
        className="mt-2 w-full rounded-lg border border-hairline bg-void px-4 py-2.5 text-base text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
      />

      <label htmlFor="body" className="mt-5 block text-sm text-stone">
        Tell her
      </label>
      <textarea
        id="body"
        name="body"
        rows={6}
        required
        maxLength={MAX_BODY}
        placeholder="A problem, a question, something that isn't working, or something you just want to say."
        className="mt-2 w-full resize-y rounded-lg border border-hairline bg-void px-4 py-3 text-base leading-relaxed text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
      />

      <label htmlFor="replyTo" className="mt-5 block text-sm text-stone">
        Your email
      </label>
      <input
        id="replyTo"
        name="replyTo"
        type="email"
        defaultValue={defaultEmail}
        placeholder="Optional — only so she can answer you"
        className="mt-2 w-full rounded-lg border border-hairline bg-void px-4 py-2.5 text-base text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
      />
      <p className="mt-2 text-xs text-stone-dim">
        Leave it blank if you&rsquo;d rather. She just won&rsquo;t be able to
        reply.
      </p>

      {state?.error && (
        <p className="mt-4 text-sm text-amber-soft">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
