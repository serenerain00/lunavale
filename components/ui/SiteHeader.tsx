import Link from "next/link";
import {
  enterPreviewMembership,
  exitPreviewMembership,
} from "@/app/actions/session";

interface SiteHeaderProps {
  member: boolean;
}

export function SiteHeader({ member }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-wide text-ivory"
        >
          Luna Vault
        </Link>

        {/* Preview-membership toggle — stub for Phase 3 auth. */}
        <form action={member ? exitPreviewMembership : enterPreviewMembership}>
          <button
            type="submit"
            className="rounded-full border border-hairline px-4 py-1.5 text-sm text-stone transition-colors duration-[--duration-quick] hover:border-amber hover:text-amber"
          >
            {member ? "Exit preview" : "Preview membership"}
          </button>
        </form>
      </div>
    </header>
  );
}
