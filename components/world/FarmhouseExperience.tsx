/**
 * FarmhouseExperience — client shell around the 3D scene.
 *
 * Responsibilities:
 *  - Load the WebGL scene client-only (ssr:false) so the server never touches three.
 *  - Entry gate + HUD (pointer lock needs a user gesture; WASD/E hints).
 *  - Open/close the content panel for the targeted object.
 *  - Accessibility fallback: reduced-motion, touch, or no-pointer-lock users get a
 *    conventional keyboard-navigable list that opens the SAME panels. No one is
 *    locked out of content by the 3D layer (docs: preserve navigation + a11y).
 */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ObjectPanel } from "@/components/world/ObjectPanel";
import type { Environment, WorldObject } from "@/lib/content/world";

// three/R3F must not run on the server.
const FarmhouseScene = dynamic(
  () => import("@/components/world/FarmhouseScene").then((m) => m.FarmhouseScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-stone">
        Loading the farmhouse…
      </div>
    ),
  },
);

interface Props {
  environment: Environment;
  member: boolean;
}

export function FarmhouseExperience({ environment, member }: Props) {
  const [mode, setMode] = useState<"deciding" | "3d" | "simple">("deciding");
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [hovered, setHovered] = useState<WorldObject | null>(null);
  const [active, setActive] = useState<WorldObject | null>(null);

  // Decide default mode from device/preferences on the client.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const noLock = !("requestPointerLock" in document.documentElement);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client capability/preference detection on mount; runs once, not a cascading render
    setMode(reduce || coarse || noLock ? "simple" : "3d");
  }, []);

  if (mode === "deciding") {
    return (
      <div className="flex h-full items-center justify-center text-stone">
        Preparing the farmhouse…
      </div>
    );
  }

  if (mode === "simple") {
    return (
      <SimpleView
        environment={environment}
        member={member}
        onOpen={setActive}
        onTry3D={() => {
          setMode("3d");
          setStarted(false);
        }}
        active={active}
        onClose={() => setActive(null)}
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-void">
      <FarmhouseScene
        objects={environment.objects}
        member={member}
        onHoverChange={setHovered}
        onActivate={(obj) => setActive(obj)}
        onLockChange={setLocked}
      />

      {/* Crosshair + hint while actively looking around */}
      {started && locked && !active && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ivory/70"
          />
          {hovered && (
            <div className="pointer-events-none absolute left-1/2 top-[calc(50%+28px)] -translate-x-1/2 rounded-full bg-void/80 px-3 py-1.5 text-sm text-ivory backdrop-blur-sm">
              {hovered.hint}
              <span className="ml-2 rounded bg-charcoal px-1.5 py-0.5 text-xs text-amber">
                E
              </span>
            </div>
          )}
        </>
      )}

      {/* Entry gate */}
      {!started && !active && (
        <Overlay>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            {environment.belongsTo}
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-ivory">
            {environment.name}
          </h1>
          <p className="mt-3 max-w-md text-balance text-stone">
            {environment.tagline}
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-6 rounded-full bg-amber px-7 py-3 text-sm font-medium text-void transition-colors hover:bg-amber-soft"
          >
            Enter the farmhouse
          </button>
          <button
            onClick={() => setMode("simple")}
            className="mt-3 text-sm text-stone underline-offset-4 hover:text-ivory hover:underline"
          >
            Use the simple view instead
          </button>
        </Overlay>
      )}

      {/* Resume prompt after entering / closing a panel */}
      {started && !locked && !active && (
        <Overlay dim>
          <p className="text-ivory">Click to look around</p>
          <p className="mt-2 text-sm text-stone">
            <Key>W</Key> <Key>A</Key> <Key>S</Key> <Key>D</Key> to move ·{" "}
            <Key>E</Key> or click to interact
          </p>
          <button
            onClick={() => setMode("simple")}
            className="mt-4 text-sm text-stone underline-offset-4 hover:text-ivory hover:underline"
          >
            Use the simple view instead
          </button>
        </Overlay>
      )}

      {active && (
        <ObjectPanel
          object={active}
          member={member}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
}

function Overlay({
  children,
  dim = false,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center ${
        dim ? "bg-void/40" : "bg-void/70"
      } backdrop-blur-sm`}
    >
      {children}
    </div>
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded bg-charcoal px-1.5 py-0.5 text-xs text-amber">
      {children}
    </kbd>
  );
}

/** Conventional, fully keyboard-accessible alternative to the 3D scene. */
function SimpleView({
  environment,
  member,
  active,
  onOpen,
  onClose,
  onTry3D,
}: {
  environment: Environment;
  member: boolean;
  active: WorldObject | null;
  onOpen: (o: WorldObject) => void;
  onClose: () => void;
  onTry3D: () => void;
}) {
  return (
    <div className="relative mx-auto h-full w-full max-w-4xl overflow-y-auto px-5 py-10 sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            {environment.belongsTo}
          </p>
          <h1 className="mt-2 font-display text-3xl font-light text-ivory">
            {environment.name}
          </h1>
          <p className="mt-2 max-w-xl text-stone">{environment.tagline}</p>
        </div>
        <button
          onClick={onTry3D}
          className="shrink-0 rounded-full border border-hairline px-4 py-1.5 text-sm text-stone transition-colors hover:border-amber hover:text-amber"
        >
          Explore in 3D
        </button>
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl text-ivory">
        In this room
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {environment.objects.map((obj) => {
          const locked = obj.access === "premium" && !member;
          return (
            <li key={obj.id}>
              <button
                onClick={() => onOpen(obj)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-hairline bg-charcoal p-4 text-left transition-colors hover:border-amber/50"
              >
                <span>
                  <span className="block font-display text-lg text-ivory">
                    {obj.label}
                  </span>
                  <span className="mt-0.5 block text-xs uppercase tracking-wide text-stone-dim">
                    {obj.kind}
                  </span>
                </span>
                <span className="text-sm text-amber-soft">
                  {locked ? "Members" : "Open"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-10">
        <Link href="/" className="text-sm text-stone hover:text-ivory">
          ← All scenes
        </Link>
      </div>

      {active && (
        <ObjectPanel object={active} member={member} onClose={onClose} />
      )}
    </div>
  );
}
