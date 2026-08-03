"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitPost, type PostResult } from "@/app/overheard/actions";
import { MAX_POST_LENGTH, MENTIONABLE } from "@/lib/content/overheard";

interface PostFormProps {
  /** Signed in at all — see the note on the sign-in branch below. */
  signedIn: boolean;
  /** The line being answered, when the URL asks for one. */
  replyingTo?: { key: string; author: string; snippet: string } | null;
  /** Melissa only: lets her answer in a character's voice. */
  canPostAsCast?: boolean;
}

/**
 * The box.
 *
 * It used to have three states — not signed in, turns left, out of turns —
 * because the room was free to read and an account came with three posts. The
 * room went members-only on 2026-08-03, so the page no longer renders this for
 * anyone who could run out, and the counting is gone rather than left in as an
 * unreachable branch.
 */
export function PostForm({
  signedIn,
  replyingTo = null,
  canPostAsCast = false,
}: PostFormProps) {
  // --- @ picker ------------------------------------------------------------
  // Driven off the caret rather than off the whole value, so tagging works
  // mid-sentence and not only at the end.
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const matches =
    query === null
      ? []
      : MENTIONABLE.filter((m) =>
          m.name.toLowerCase().startsWith(query.toLowerCase()),
        );
  const open = matches.length > 0;

  /** The @token the caret is sitting in, or null. */
  function readToken(el: HTMLTextAreaElement) {
    const upto = el.value.slice(0, el.selectionStart ?? 0);
    const m = /@(\w*)$/.exec(upto);
    setQuery(m ? m[1] : null);
    setActive(0);
  }

  /** Replace the token under the caret with a canonical @Name and a space. */
  function choose(name: string) {
    const el = boxRef.current;
    if (!el) return;
    const caret = el.selectionStart ?? 0;
    const before = el.value.slice(0, caret).replace(/@(\w*)$/, `@${name} `);
    const next = before + el.value.slice(caret);
    setText(next);
    setQuery(null);
    // Put the caret after the inserted name, not at the end of the message.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(before.length, before.length);
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Checked before the picker: ⌘/Ctrl+Enter always means send, whether or
    // not the tag list happens to be open.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      setQuery(null);
      formRef.current?.requestSubmit();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      // Enter picks the name instead of submitting — the picker is open, so
      // that is unambiguously what Enter means here.
      e.preventDefault();
      choose(matches[active].name);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery(null);
    }
  }

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState<PostResult | null, FormData>(
    async (_prev, formData) => {
      const result = await submitPost(formData);
      if (result.ok) {
        setText("");
        // Clear the reply target as well. It lives in the URL, so leaving it
        // there would quietly attach the NEXT post to the same message —
        // the sort of thing you only notice after you have done it twice.
        if (replyingTo) router.replace("/overheard#say", { scroll: false });
      }
      return result;
    },
    null,
  );

  // A member who is not signed in. In production that combination cannot
  // happen — membership is resolved from the signed-in user — so this is the
  // dev preview cookie, and increasingly the only way to reach this branch.
  // The old copy here ("anyone can read Overheard… it comes with three
  // posts") sold a free tier the room no longer has.
  //
  // The "that's your three" branch that used to follow is gone with it: the
  // page does not render this form for a non-member at all, so the allowance
  // can no longer be spent by anybody.
  if (!signedIn) {
    return (
      <div className="rounded-xl border border-hairline bg-charcoal/60 p-6 sm:p-8">
        <h2 className="font-display text-2xl text-ivory">Say something</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone">
          Sign in and the box is yours — your name shows on what you write.
        </p>
        <Link
          href="/sign-in"
          className="mt-5 inline-flex min-h-10 items-center rounded-full bg-amber px-5 text-sm font-medium text-void transition-colors duration-(--duration-quick) hover:bg-amber-soft"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
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
        <label htmlFor="body" className="font-display text-xl text-ivory">
          Say something
        </label>
        {/* Owner only, and only while replying to something — which is when
            answering in a character's voice is actually what you want. It sat
            in the header the rest of the time competing with "Say something"
            for no reason. Posting as a character without replying is still
            possible: hit Reply on anything, or ask for a toggle. */}
        {canPostAsCast && replyingTo && (
          <span className="flex items-center gap-2 text-xs text-stone-dim">
            <label htmlFor="castAs">as</label>
            <select
              id="castAs"
              name="castAs"
              defaultValue="Melissa"
              className="rounded-full border border-hairline bg-void px-3 py-1.5 text-xs text-stone focus:border-amber focus:outline-none"
            >
              <option value="Melissa">Melissa</option>
              {MENTIONABLE.filter((m) => m.name !== "Melissa").map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </span>
        )}
      </div>

      <div className="relative mt-4">
        <textarea
          ref={boxRef}
          id="body"
          name="body"
          rows={4}
          maxLength={MAX_POST_LENGTH}
          required
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            readToken(e.target);
          }}
          onKeyUp={(e) => readToken(e.currentTarget)}
          onClick={(e) => readToken(e.currentTarget)}
          onBlur={() => setTimeout(() => setQuery(null), 120)}
          onKeyDown={onKeyDown}
          placeholder="What did you make of it? Type @ to tag someone."
          role="combobox"
          aria-expanded={open}
          aria-controls="mention-list"
          aria-autocomplete="list"
          className="w-full resize-y rounded-lg border border-hairline bg-void px-4 py-3 text-base leading-relaxed text-ivory placeholder:text-stone-dim focus:border-amber focus:outline-none"
        />

        {/* Anchored under the box rather than at the caret: simpler, and with
            five names it never has far to travel. */}
        {open && (
          <ul
            id="mention-list"
            role="listbox"
            aria-label="Tag someone"
            className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-hairline bg-charcoal shadow-[0_16px_40px_-16px_rgba(0,0,0,0.9)]"
          >
            {matches.map((m, i) => (
              <li key={m.name} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  // onMouseDown, not onClick: blur fires first and would close
                  // the list before a click ever landed.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(m.name);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-baseline gap-2 px-4 py-2 text-left text-sm transition-colors ${
                    i === active
                      ? "bg-amber/15 text-ivory"
                      : "text-stone hover:bg-ivory/[0.03]"
                  }`}
                >
                  <span className="font-medium text-amber-soft">@{m.name}</span>
                  <span className="text-xs text-stone-dim">{m.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {state?.error && (
        <p className="mt-3 text-sm text-amber-soft">{state.error}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-stone-dim">Post as often as you like.</p>
        {/* Both labels rather than sniffing the platform: no JS, nothing to
            mismatch on hydration, and unambiguous on either machine. */}
        <span className="ml-auto mr-3 text-[0.6875rem] text-stone-dim">
          ⌘ / Ctrl + Enter
        </span>
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
