import { SOCIAL } from "@/lib/content/social";

/**
 * Instagram and Facebook, as two quiet icons in the header bar, left of
 * Sign in / Join (Melissa, 2026-10-18). Muted until hovered, so they never
 * compete with Join. Plain anchors in a new tab: these leave the site.
 */
export function SocialLinks() {
  const all: { href: string; label: string; icon: React.ReactNode }[] = [
    { href: SOCIAL.instagram, label: "Between Us on Instagram", icon: <InstagramGlyph /> },
    { href: SOCIAL.facebook, label: "Between Us on Facebook", icon: <FacebookGlyph /> },
  ];
  const links = all.filter((l) => l.href);
  if (!links.length) return null;
  return (
    <div className="flex items-center">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          title={l.label}
          className="grid size-9 place-items-center rounded-full text-stone-dim transition-colors duration-(--duration-quick) hover:text-amber"
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}

function InstagramGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5H16.7V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.9v3h2.6V21h3z" />
    </svg>
  );
}
