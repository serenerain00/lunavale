/**
 * The notice that says, plainly, that no money changed hands.
 *
 * Until a payment provider is wired (lib/billing/provider.ts), "membership" is
 * granted by a cookie so the member experience can be built and reviewed. A
 * page that showed unlocked content without saying this would be implying a
 * charge that never happened — the exact thing the ethical rules in
 * docs/monetization/MONETIZATION.md rule out. So it is stated once, clearly,
 * wherever membership state is displayed.
 *
 * Delete this component the day checkout is real.
 */
export function PreviewNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-lg border border-hairline bg-charcoal/60 px-4 py-3 text-sm leading-relaxed text-stone ${className}`}
    >
      <span className="font-medium text-amber-soft">Preview mode.</span>{" "}
      Payments aren&rsquo;t connected yet, so nothing was charged and no card
      was taken. This unlocks the member experience so it can be built and
      reviewed.
    </p>
  );
}
