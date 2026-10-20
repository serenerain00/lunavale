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
type Report = { name: "snapshot" | "content" | "instagram"; range: string; data: unknown };

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
      show_report: async (params: { name?: string; range?: string; post?: string }) => {
        const name = params?.name === "content" || params?.name === "instagram" ? params.name : "snapshot";
        const range = ["today", "week", "month"].includes(params?.range ?? "") ? params.range! : "week";
        const q = new URLSearchParams({ name, range });
        if (name === "instagram" && params?.post) q.set("post", params.post);
        const r = await fetch(`/api/voice/report?${q}`, { cache: "no-store" });
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
          {report.name === "snapshot"
            ? `The business, ${report.range === "today" ? "today" : `last ${report.range}`}`
            : report.name === "instagram"
              ? "Instagram"
              : "What's out"}
        </h2>
        <button type="button" onClick={onClose} className="-my-3 inline-flex min-h-11 items-center text-xs text-stone-dim hover:text-amber">
          Close
        </button>
      </div>
      {report.name === "snapshot" ? (
        <SnapshotTable s={report.data as SnapshotView} />
      ) : report.name === "instagram" ? (
        <InstagramTable g={report.data as InstagramView} />
      ) : (
        <ContentTable c={report.data as ContentView} />
      )}
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
    ["Canceled, still have access", String(s.members.cancelling)],
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

type InstagramView = {
  syncedAt: string | null;
  followers: { now: number; follows7d: number | null; unfollows7d: number | null } | null;
  days: number;
  matched: string | null;
  posts: {
    shortcode: string;
    name: string;
    published: string | null;
    reach: number | null;
    views: number | null;
    likes: number | null;
    shares: number | null;
    saves: number | null;
    site: { began: number; paid: number } | null;
  }[];
};

function num(n: number | null) {
  return n === null ? "—" : n.toLocaleString("en-US");
}

function InstagramTable({ g }: { g: InstagramView }) {
  const f = g.followers;
  return (
    <>
      <p className="mb-3 text-xs text-stone-dim">
        {g.syncedAt ? `As of the last sync, ${new Date(g.syncedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}.` : "No sync yet."}
        {f && ` ${num(f.now)} followers${f.follows7d !== null ? ` · +${num(f.follows7d)} / −${num(f.unfollows7d)} this week` : ""}.`}
        {g.matched ? ` Matching “${g.matched}”.` : ` Posts from the last ${g.days} days.`}
      </p>
      {g.posts.length === 0 ? (
        <p className="text-sm text-stone">Nothing to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-stone-dim">
                <th className="py-1.5 pr-3 font-normal">Post</th>
                <th className="py-1.5 pr-3 text-right font-normal">Reach</th>
                <th className="py-1.5 pr-3 text-right font-normal">Likes</th>
                <th className="py-1.5 pr-3 text-right font-normal">Shares</th>
                <th className="py-1.5 pr-3 text-right font-normal">Saves</th>
                <th className="py-1.5 text-right font-normal">Checkout → paid</th>
              </tr>
            </thead>
            <tbody>
              {g.posts.map((p) => (
                <tr key={p.shortcode} className="border-t border-hairline/60">
                  <td className="py-1.5 pr-3">
                    <a
                      href={`https://www.instagram.com/p/${p.shortcode}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ivory hover:text-amber"
                    >
                      {p.name}
                    </a>
                    {p.published && (
                      <span className="block text-xs text-stone-dim">
                        {new Date(p.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-3 text-right text-ivory">{num(p.reach)}</td>
                  <td className="py-1.5 pr-3 text-right text-ivory">{num(p.likes)}</td>
                  <td className="py-1.5 pr-3 text-right text-ivory">{num(p.shares)}</td>
                  <td className="py-1.5 pr-3 text-right text-ivory">{num(p.saves)}</td>
                  <td className="py-1.5 text-right text-stone">{p.site ? `${p.site.began} → ${p.site.paid}` : "not tracked"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
