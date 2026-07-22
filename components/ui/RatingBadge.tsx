/**
 * The maturity label on a piece of content.
 *
 * One component so "Mature" and "Explicit" can never disagree across the
 * places they appear. Explicit outranks and replaces mature — showing both
 * would be noise, and "Explicit" already implies everything "Mature" says.
 * Nothing renders for content that is neither.
 */
interface RatingBadgeProps {
  mature?: boolean;
  explicit?: boolean;
  /** Inline text (metadata rows) or a pill (over a poster). */
  variant?: "text" | "pill";
  className?: string;
}

export function RatingBadge({
  mature,
  explicit,
  variant = "text",
  className = "",
}: RatingBadgeProps) {
  if (!mature && !explicit) return null;
  const label = explicit ? "Explicit · 18+" : "Mature";

  if (variant === "pill") {
    return (
      <span
        className={`rounded-full bg-void/70 px-2 py-0.5 text-[0.65rem] font-medium backdrop-blur-sm ${
          explicit ? "text-amber-soft" : "text-stone"
        } ${className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <span className={explicit ? `text-amber-soft ${className}` : className}>
      {label}
    </span>
  );
}
