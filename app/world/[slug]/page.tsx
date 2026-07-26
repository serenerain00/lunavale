import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { environments, getEnvironment } from "@/lib/content/world";
import { isMember } from "@/lib/access/entitlement";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { WorldExperience } from "@/components/world/WorldExperience";

/** One page for every environment — the 3D engine renders whichever data it's handed. */
export function generateStaticParams() {
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

export default async function EnvironmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ room?: string }>;
}) {
  const [{ slug }, { room }, member] = await Promise.all([
    params,
    searchParams,
    isMember(),
  ]);

  const environment = getEnvironment(slug);
  if (!environment) notFound();

  return (
    <>
      <SiteHeader member={member} />
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
