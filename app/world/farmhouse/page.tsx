import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEnvironment } from "@/lib/content/world";
import { isMember } from "@/lib/access/entitlement";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { FarmhouseExperience } from "@/components/world/FarmhouseExperience";

const SLUG = "farmhouse";

export function generateMetadata(): Metadata {
  const env = getEnvironment(SLUG);
  if (!env) return { title: "Environment not found" };
  return {
    title: env.name,
    description: env.tagline,
  };
}

export default async function FarmhousePage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const environment = getEnvironment(SLUG);
  if (!environment) notFound();

  const [{ room }, member] = await Promise.all([searchParams, isMember()]);

  return (
    <>
      <SiteHeader member={member} />
      <div className="relative flex-1">
        <FarmhouseExperience
          environment={environment}
          member={member}
          initialRoomId={room}
        />
      </div>
    </>
  );
}
