import { QUESTIONS } from "@/lib/content/membership";

/**
 * The questions people actually ask before entering a card number.
 *
 * Native <details>: keyboard-operable, findable by the browser's in-page
 * search even while collapsed, and it needs no JavaScript — so it works on the
 * first paint, which is exactly when someone is deciding whether to trust this.
 */
export function Questions() {
  return (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {QUESTIONS.map((item) => (
        <li key={item.q}>
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base text-ivory transition-colors duration-(--duration-quick) hover:text-amber [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden
                className="shrink-0 text-xl leading-none text-stone transition-transform duration-(--duration-quick) group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="max-w-2xl pb-5 text-sm leading-relaxed text-stone">
              {item.a}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
