"use client";

/**
 * Studio's shell — three tabs, one draft, and the saved shots list.
 *
 * THE DRAFT LIVES HERE rather than in the builder, so that switching to the
 * library to add the reference the builder just told you was missing does not
 * throw away twenty controls' worth of decisions. Coming back finds the shot
 * exactly as it was, with the new reference now available to attach.
 *
 * `router.refresh()` after every write, so the server component re-reads Neon
 * and the whole tree gets the new list. No client cache to keep in step.
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { ShotRecipe, StudioRef } from "@/lib/studio/types";
import { emptyCamera } from "@/lib/studio/types";
import { RefLibrary, type Person, type PlaceOpt } from "@/components/studio/RefLibrary";
import { ShotBuilder, type SceneOpt } from "@/components/studio/ShotBuilder";
import { ExportDeck } from "@/components/studio/ExportDeck";

type Tab = "shot" | "library" | "export";

function blankShot(): ShotRecipe {
  return {
    // Minted here so saving is an upsert rather than a decision about whether
    // this shot exists yet. See app/api/studio/shots/route.ts.
    id: crypto.randomUUID(),
    title: "",
    sceneSlug: null,
    placeId: null,
    characterIds: [],
    refIds: [],
    camera: { ...emptyCamera },
    lightingId: "practicals",
    timeId: "night",
    aspectId: "16-9",
    action: "",
    extra: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function Studio({
  refs,
  shots,
  people,
  places,
  scenes,
  configured,
  blobConfigured,
}: {
  refs: StudioRef[];
  shots: ShotRecipe[];
  people: Person[];
  places: PlaceOpt[];
  scenes: SceneOpt[];
  configured: boolean;
  blobConfigured: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("shot");
  const [draft, setDraft] = useState<ShotRecipe>(blankShot);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => router.refresh(), [router]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/shots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? `Save failed (${res.status})`);
      }
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeShot(id: string) {
    if (!confirm("Delete this shot?")) return;
    await fetch(`/api/studio/shots?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-8">
      {!configured && (
        <p className="rounded-sm border border-wine/40 bg-wine/10 p-3 text-sm text-stone">
          DATABASE_URL is not set, so nothing here can be saved. Everything else works —
          the controls, the framing preview and both prompts are all computed in the browser.
        </p>
      )}

      <nav className="flex gap-1 border-b border-hairline">
        {(
          [
            ["shot", "Shot"],
            ["library", `Library${refs.length ? ` (${refs.length})` : ""}`],
            ["export", "Export"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                    tab === id
                      ? "border-amber text-ivory"
                      : "border-transparent text-stone hover:text-ivory"
                  }`}>
            {label}
          </button>
        ))}
      </nav>

      {error && <p className="text-sm text-wine">{error}</p>}

      {tab === "shot" && (
        <>
          <ShotBuilder
            draft={draft}
            setDraft={setDraft}
            refs={refs}
            people={people}
            places={places}
            scenes={scenes}
            onSave={save}
            saving={saving}
          />
          {shots.length > 0 && (
            <section className="space-y-2 border-t border-hairline pt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-lg text-ivory">Saved shots</h3>
                <button type="button" onClick={() => setDraft(blankShot())}
                        className="text-[13px] text-amber-soft hover:underline">
                  New shot
                </button>
              </div>
              <ul className="divide-y divide-hairline">
                {shots.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2">
                    <button type="button" onClick={() => setDraft(s)}
                            className="flex-1 text-left text-[14px] text-ivory hover:text-amber-soft">
                      {s.title || "Untitled shot"}
                      <span className="ml-2 text-[12px] text-stone-dim">
                        {s.sceneSlug ?? s.placeId ?? "unfiled"}
                      </span>
                    </button>
                    <button type="button" onClick={() => removeShot(s.id)}
                            className="text-[12px] text-stone-dim hover:text-wine">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {tab === "library" && (
        <RefLibrary
          refs={refs}
          people={people}
          places={places}
          onChanged={refresh}
          blobConfigured={blobConfigured}
        />
      )}

      {tab === "export" && <ExportDeck refs={refs} />}
    </div>
  );
}
