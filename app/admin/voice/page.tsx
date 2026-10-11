import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { authConfigured } from "@/lib/billing/provider";
import { isOwner } from "@/lib/access/owner";
import { voiceConfigured, voiceUsage } from "@/lib/marketing/voice";
import { VoiceConsole } from "@/components/voice/VoiceConsole";

export const metadata: Metadata = {
  title: "Voice",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Talk to the business. Owner-only, gated server-side exactly like /admin.
 *
 * Prototype, read-only: the assistant can look things up and recommend; it
 * cannot publish, edit the site, or touch customers (app/api/voice/tools has no
 * such tool). Plan and guardrails: docs/voice-assistant-plan.md.
 *
 * The usage line is the cost control made visible: ElevenLabs' own figures for
 * the plan's credit allowance — the hard ceiling — and the minutes this agent
 * has used in the current billing period.
 */
export default async function VoicePage() {
  if (!authConfigured() || !(await isOwner())) notFound();

  const configured = voiceConfigured();
  const usage = configured ? await voiceUsage() : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-24 sm:px-8">
        <header className="pb-8 pt-12 sm:pt-16">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            <Link href="/admin" className="hover:text-amber-soft">Admin</Link> · Voice
          </p>
          <h1 className="mt-3 font-display text-3xl font-light text-ivory sm:text-4xl">
            Ask how it&rsquo;s going.
          </h1>
          <p className="mt-3 max-w-xl leading-relaxed text-stone">
            Revenue, members, checkouts, what&rsquo;s been released. It can look and
            recommend; it can&rsquo;t publish or change anything.
          </p>
          {usage && (
            <p className="mt-4 text-xs text-stone-dim">
              {usage.minutesThisPeriod} min across {usage.conversations}{" "}
              {usage.conversations === 1 ? "conversation" : "conversations"} this period ·{" "}
              {(usage.creditsLimit - usage.creditsUsed).toLocaleString("en-US")} of{" "}
              {usage.creditsLimit.toLocaleString("en-US")} ElevenLabs credits left
              {usage.resetsOn ? `, resets ${usage.resetsOn}` : ""}. Calls stop at five
              minutes.
            </p>
          )}
        </header>

        {configured ? (
          <VoiceConsole />
        ) : (
          <p className="rounded-xl border border-hairline p-6 text-sm text-stone">
            Voice isn&rsquo;t configured on this deployment (ELEVENLABS_API_KEY,
            ELEVENLABS_AGENT_ID, VOICE_TOOL_SECRET).
          </p>
        )}
      </main>
    </>
  );
}
