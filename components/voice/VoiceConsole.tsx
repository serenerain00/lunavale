"use client";

/**
 * The talking part of /admin/voice.
 *
 * Start asks for the microphone, then fetches a short-lived token from
 * /api/voice/session (owner-gated) and opens a WebRTC session with the private
 * ElevenLabs agent. ElevenLabs does the listening, turn-taking, interruption
 * and speaking; Claude (chosen on the agent) does the thinking; numbers come
 * from our own webhook tools.
 *
 * `show_report` is the one client tool: when Melissa asks to see something,
 * the agent calls it and this page fetches the detail from /api/voice/report
 * — as her, through the owner gate — and lays it out below. Tables go on
 * screen; only summaries are spoken.
 */

import { useCallback, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";

type Line = { who: "you" | "assistant"; text: string };
type Report = { name: "snapshot" | "content"; range: string; data: unknown };

export function VoiceConsole() {
  return (
    <ConversationProvider>
      <Console />
    </ConversationProvider>
  );
}

function Console() {
  const [lines, setLines] = useState<Line[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const conversation = useConversation({
    onMessage: ({ message, source }) =>
      setLines((l) => [...l, { who: source === "user" ? "you" : "assistant", text: message } as Line].slice(-40)),
    onError: (e: unknown) => setError(typeof e === "string" ? e : "Something went wrong with the call."),
    clientTools: {
      show_report: async (params: { name?: string; range?: string }) => {
        const name = params?.name === "content" ? "content" : "snapshot";
        const range = ["today", "week", "month"].includes(params?.range ?? "") ? params.range! : "week";
        const r = await fetch(`/api/voice/report?name=${name}&range=${range}`, { cache: "no-store" });
        if (!r.ok) return "I couldn't load that report.";
        setReport({ name, range, data: await r.json() });
        return "It's on the screen now.";
      },
    },
  });

  const live = conversation.status === "connected";

  const start = useCallback(async () => {
    setError(null);
    setStarting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = await fetch("/api/voice/session", { cache: "no-store" });
      const body = (await r.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!r.ok || !body.token) throw new Error(body.error ?? "Couldn't start a session.");
      conversation.startSession({ conversationToken: body.token, connectionType: "webrtc" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start — is the microphone allowed?");
    } finally {
      setStarting(false);
    }
  }, [conversation]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {live ? (
          <>
            {/* MUTE, Melissa 2026-10-11: the TV was being heard as her. The
                agent also filters background voices, but a closed mic is
                the only thing that can't be fooled. Muted, nothing reaches
                ElevenLabs; tap to talk, tap again when done. */}
            <button
              type="button"
              onClick={() => conversation.setMuted(!conversation.isMuted)}
              aria-pressed={!conversation.isMuted}
              className={`inline-flex min-h-11 items-center rounded-full px-7 text-sm font-medium transition-colors ${
                conversation.isMuted
                  ? "bg-amber text-void hover:bg-amber-soft"
                  : "border border-amber/60 bg-amber/15 text-amber-soft hover:bg-amber/25"
              }`}
            >
              {conversation.isMuted ? "Tap to talk" : "Mute mic"}
            </button>
            <button
              type="button"
              onClick={() => conversation.endSession()}
              className="inline-flex min-h-11 items-center rounded-full border border-hairline px-6 text-sm text-ivory transition-colors hover:border-wine"
            >
              End
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={starting || conversation.status === "connecting"}
            className="inline-flex min-h-11 items-center rounded-full bg-amber px-7 text-sm font-medium text-void transition-colors hover:bg-amber-soft disabled:opacity-60"
          >
            {starting || conversation.status === "connecting" ? "Connecting…" : "Start talking"}
          </button>
        )}
        <p role="status" aria-live="polite" className="text-sm text-stone">
          {live
            ? conversation.isSpeaking
              ? "Speaking…"
              : conversation.isMuted
                ? "Mic off — the room can't be heard"
                : "Listening…"
            : "Not connected"}
        </p>
      </div>
      {error && <p className="mt-3 text-sm text-wine">{error}</p>}

      {lines.length > 0 && (
        <ol className="mt-8 space-y-3 border-t border-hairline pt-6 text-sm leading-relaxed">
          {lines.map((l, i) => (
            <li key={i} className={l.who === "you" ? "text-stone" : "text-ivory"}>
              <span className="mr-2 text-xs uppercase tracking-[0.15em] text-stone-dim">{l.who}</span>
              {l.text}
            </li>
          ))}
        </ol>
      )}

      {report && <ReportPanel report={report} onClose={() => setReport(null)} />}
    </div>
  );
}

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function ReportPanel({ report, onClose }: { report: Report; onClose: () => void }) {
  return (
    <section className="mt-10 rounded-xl border border-hairline bg-charcoal/40 p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl text-ivory">
          {report.name === "snapshot" ? `The business, ${report.range === "today" ? "today" : `last ${report.range}`}` : "What's out"}
        </h2>
        <button type="button" onClick={onClose} className="-my-3 inline-flex min-h-11 items-center text-xs text-stone-dim hover:text-amber">
          Close
        </button>
      </div>
      {report.name === "snapshot" ? <SnapshotTable s={report.data as SnapshotView} /> : <ContentTable c={report.data as ContentView} />}
    </section>
  );
}

type SnapshotView = {
  since: string;
  members: { renewing: number; cancelling: number; pastDue: number };
  mrrCents: number;
  collectedCents: number;
  newMembers: number | null;
  checkout: { began: number; paid: number; instagramPaid: number; unattributed: number; topCampaigns: { campaign: string; paid: number; began: number }[] } | null;
  visitors: { total: number; instagram: number; days: number } | null;
};

function SnapshotTable({ s }: { s: SnapshotView }) {
  const rows: [string, string][] = [
    ["Collected", dollars(s.collectedCents)],
    ["Renewing members", `${s.members.renewing} (${dollars(s.mrrCents)}/mo)`],
    ["Cancelled, still have access", String(s.members.cancelling)],
    ["Cards failing", String(s.members.pastDue)],
    ["New members", s.newMembers === null ? "—" : String(s.newMembers)],
    ["Began checkout → paid", s.checkout ? `${s.checkout.began} → ${s.checkout.paid}` : "—"],
    ["Paid from Instagram", s.checkout ? String(s.checkout.instagramPaid) : "—"],
    ["Visits (Instagram)", s.visitors ? `${s.visitors.total} (${s.visitors.instagram}) over ${s.visitors.days} days` : "Not stored yet"],
  ];
  return (
    <>
      <p className="mb-3 text-xs text-stone-dim">Since {s.since} (UTC).</p>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-hairline/60 py-1.5">
            <dt className="text-stone">{k}</dt>
            <dd className="text-ivory">{v}</dd>
          </div>
        ))}
      </dl>
      {s.checkout && s.checkout.topCampaigns.length > 0 && (
        <>
          <h3 className="mt-6 text-xs uppercase tracking-[0.15em] text-stone-dim">Campaigns</h3>
          <ul className="mt-2 text-sm">
            {s.checkout.topCampaigns.map((c) => (
              <li key={c.campaign} className="flex justify-between border-b border-hairline/60 py-1.5">
                <span className="text-stone">{c.campaign}</span>
                <span className="text-ivory">{c.began} → {c.paid}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

type ContentView = {
  recent: { date: string; kind: string; title: string; access: string }[];
  counts: { clipsFree: number; clipsMembers: number; posts: number; episodes: number };
};

function ContentTable({ c }: { c: ContentView }) {
  return (
    <>
      <p className="mb-3 text-sm text-stone">
        {c.counts.episodes} episodes · {c.counts.clipsFree} free clips · {c.counts.clipsMembers} members&rsquo; clips · {c.counts.posts} posts
      </p>
      <ul className="text-sm">
        {c.recent.map((r) => (
          <li key={`${r.date}-${r.title}`} className="flex justify-between gap-4 border-b border-hairline/60 py-1.5">
            <span className="text-ivory">{r.title}</span>
            <span className="shrink-0 text-stone-dim">{r.date} · {r.kind} · {r.access === "free" ? "Free" : "Members"}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
