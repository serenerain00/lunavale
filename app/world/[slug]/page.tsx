import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { environments, getEnvironment } from "@/lib/content/world";
import { isMember } from "@/lib/access/entitlement";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { WorldExperience } from "@/components/world/WorldExperience";
import { WORLD_ENABLED } from "@/lib/content/world";

/** One page for every environment — the 3D engine renders whichever data it's handed. */
export function generateStaticParams() {
  // Nothing to prerender while the world is off the site — otherwise the build
  // renders eighteen pages whose only job is to call notFound().
  if (!WORLD_ENABLED) return [];
  return environments.map((env) => ({ slug: env.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const env = getEnvironment(slug);
  if (!env) return { title: "Environment not found" };
  return { title: env.name, description: env.tagline };
}

// OFF THE SITE while the world is being finished — see WORLD_ENABLED in
// lib/content/world.ts. The page is intact; it just has no audience yet.
export default async function EnvironmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  if (!WORLD_ENABLED) notFound();
  const [{ slug }, { room }, member] = await Promise.all([
    params,
    searchParams,
    isMember(),
  ]);

  const environment = getEnvironment(slug);
  if (!environment) notFound();

  return (
    <>
      <SiteHeader />
      <div className="relative flex-1">
        <WorldExperience
          environment={environment}
          member={member}
          initialRoomId={room}
        />
      </div>
    </>
  );
}
