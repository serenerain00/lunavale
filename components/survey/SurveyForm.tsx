"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitSurvey, type SurveyResult } from "@/app/survey/actions";
import {
  MAX_COMMENT,
  questions,
  type SurveyOption,
  type SurveyQuestion,
} from "@/lib/content/survey";

/**
 * The survey, rendered from lib/content/survey.ts.
 *
 * Nothing about the questions is written here — the module is the source and
 * this walks it, so Melissa can reword a question, add an option or reorder
 * the whole thing without anybody touching a component.
 *
 * NATIVE RADIOS AND CHECKBOXES under the styling, not divs with click
 * handlers: keyboard support, screen readers, form semantics and the browser's
 * own required-field behaviour all come free and all of them are things a
 * bespoke control gets wrong.
 */
export function SurveyForm({
  scenes,
  questionIds,
  compact = false,
  footer,
}: {
  scenes: SurveyOption[];
  /**
   * Which questions to show, by id. Omitted means all of them.
   *
   * The drawer on the home page passes the three REQUIRED ones, which is what
   * makes it a real submission rather than a teaser: those three are exactly
   * the fields submitSurvey insists on, so a drawer answer is a complete row
   * and lands in the same table as a long-form one. There is no second code
   * path and no partial-response state to reason about.
   */
  questionIds?: string[];
  /** Tighter spacing and a shorter thank-you, for the drawer. */
  compact?: boolean;
  /** Rendered under the button — the drawer puts its "all six" link here. */
  footer?: React.ReactNode;
}) {
  const shown = questionIds
    ? questions.filter((q) => questionIds.includes(q.id))
    : questions;

  const [state, action, pending] = useActionState<SurveyResult | null, FormData>(
    async (_prev, formData) => submitSurvey(formData),
    null,
  );

  if (state?.ok) {
    return (
      <div
        className={
          compact
            ? ""
            : "rounded-xl border border-amber/25 bg-amber/[0.04] p-6 sm:p-8"
        }
      >
        <h2 className="font-display text-2xl font-light text-ivory">
          That&rsquo;s in. Thank you.
        </h2>
        <p className="mt-3 max-w-lg leading-relaxed text-stone">
          It goes straight to Melissa, and it genuinely moves things — at this
          size, a few dozen people saying the same thing is the difference
          between a scene getting made and not.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/browse"
            className="inline-flex min-h-11 items-center rounded-full bg-amber px-6 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
          >
            Back to the scenes
          </Link>
          <Link
            href="/overheard"
            className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors duration-(--duration-quick) hover:border-amber hover:text-amber"
          >
            Say it to their faces on Overheard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className={compact ? "mt-6 space-y-7" : "mt-10 space-y-10"}
    >
      {/* Honeypot. Hidden from people and from screen readers; bots fill it. */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {shown.map((q) => (
        <Question key={q.id} q={q} scenes={scenes} compact={compact} />
      ))}

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-amber-soft"
        >
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send it"}
        </button>
        <p className="text-xs text-stone-dim">
          No email, no account, nothing shared.
        </p>
      </div>

      {footer}
    </form>
  );
}

function Question({
  q,
  scenes,
  compact,
}: {
  q: SurveyQuestion;
  scenes: SurveyOption[];
  compact?: boolean;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend
        className={`font-display font-light text-ivory ${
          compact ? "text-lg" : "text-xl sm:text-2xl"
        }`}
      >
        {q.prompt}
        {!q.required && (
          <span className="ml-2 align-middle text-xs uppercase tracking-[0.14em] text-stone-dim">
            Optional
          </span>
        )}
      </legend>
      {q.help && (
        <p className="mt-1.5 text-sm leading-relaxed text-stone">{q.help}</p>
      )}

      <div className="mt-4">
        {q.kind === "single" && (
          <Choices q={q} type="radio" compact={compact} />
        )}
        {q.kind === "multi" && (
          <Choices q={q} type="checkbox" compact={compact} />
        )}
        {q.kind === "scene" && <SceneSelect q={q} scenes={scenes} />}
        {q.kind === "text" && <TextAnswer q={q} />}
      </div>
    </fieldset>
  );
}

function Choices({
  q,
  type,
  compact,
}: {
  q: SurveyQuestion;
  type: "radio" | "checkbox";
  compact?: boolean;
}) {
  const name = q.id;
  return (
    <div className={`grid gap-2.5 ${compact ? "" : "sm:grid-cols-2"}`}>
      {(q.options ?? []).map((o) => (
        <label
          key={o.id}
          // The whole row is the target, not just the dot — a 44px hit area is
          // the difference between answerable and infuriating on a phone.
          className="group flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-hairline bg-charcoal/40 px-4 py-3 transition-colors duration-(--duration-quick) hover:border-amber/50 has-checked:border-amber has-checked:bg-amber/[0.06]"
        >
          <input
            type={type}
            name={type === "checkbox" ? "wants" : name}
            value={o.id}
            required={type === "radio" && q.required}
            className="mt-0.5 h-4 w-4 shrink-0 accent-amber"
          />
          <span>
            <span className="block text-sm text-ivory">{o.label}</span>
            {o.detail && (
              <span className="mt-0.5 block text-xs leading-relaxed text-stone">
                {o.detail}
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * A native <select> rather than thirty radio buttons.
 *
 * The catalog is long and grows every week; as a radio list it would be most
 * of the page and would make a six-question survey look like a form. A select
 * is also what a phone renders as its own scrollable picker, which is the best
 * control on the device most of these answers will come from.
 */
function SceneSelect({
  q,
  scenes,
}: {
  q: SurveyQuestion;
  scenes: SurveyOption[];
}) {
  return (
    <select
      id={q.id}
      name={q.id}
      defaultValue=""
      className="min-h-11 w-full max-w-md rounded-lg border border-hairline bg-void px-4 py-2.5 text-base text-ivory focus:border-amber focus:outline-none"
    >
      <option value="">Nothing yet, or I&rsquo;d rather not say</option>
      {scenes.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

function TextAnswer({ q }: { q: SurveyQuestion }) {
  return (
    <textarea
      id={q.id}
      name={q.id}
      rows={5}
      maxLength={q.maxLength ?? MAX_COMMENT}
      placeholder="What's working, what isn't, what you want to happen next…"
      className="w-full rounded-lg border border-hairline bg-void px-4 py-3 text-base leading-relaxed text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
    />
  );
}
