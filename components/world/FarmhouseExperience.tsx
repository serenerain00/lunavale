/**
 * FarmhouseExperience — client shell around the 3D scene.
 *
 * Cinematic waypoint navigation (not FPS): drag to look around (cursor stays
 * free, so the user can always exit), and scroll / prev-next / clicking a hotspot
 * moves between predefined focus points. Selecting a point glides + zooms the
 * camera onto that asset; "Open" reveals its content.
 *
 * Accessibility fallback: reduced-motion / touch users get a conventional
 * keyboard-navigable list of every room and object opening the SAME panels.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ObjectPanel } from "@/components/world/ObjectPanel";
import type { Environment, Room, WorldObject } from "@/lib/content/world";

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
  initialRoomId?: string;
}

function openLabel(obj: WorldObject) {
  if (obj.kind === "clip") return "Watch";
  if (obj.kind === "journal") return "Read";
  return "Open";
}

export function FarmhouseExperience({
  environment,
  member,
  initialRoomId,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const firstRoomId = environment.rooms[0]?.id;
  const validInitial = environment.rooms.some((r) => r.id === initialRoomId)
    ? (initialRoomId as string)
    : firstRoomId;

  const [roomId, setRoomId] = useState(validInitial);
  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("night");
  const [mode, setMode] = useState<"deciding" | "3d" | "simple">("deciding");
  const [entered, setEntered] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0); // 0 = overview
  const [hovered, setHovered] = useState<WorldObject | null>(null);
  const [active, setActive] = useState<WorldObject | null>(null);
  const wheelAt = useRef(0);

  const room = useMemo(
    () => environment.rooms.find((r) => r.id === roomId) ?? environment.rooms[0],
    [environment.rooms, roomId],
  );

  // Travel stops: overview, then each area, then each interactive object.
  const areas = useMemo(() => room.areas ?? [], [room.areas]);
  const objectStart = 1 + areas.length;
  const currentArea =
    focusIndex >= 1 && focusIndex < objectStart ? areas[focusIndex - 1] : null;
  const currentObject =
    focusIndex >= objectStart ? room.objects[focusIndex - objectStart] : null;
  const currentVantage = currentArea
    ? { camera: currentArea.camera, target: currentArea.target }
    : null;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client capability/preference detection on mount
    setMode(reduce || coarse ? "simple" : "3d");
  }, []);

  function goToRoom(id: string) {
    setRoomId(id);
    setFocusIndex(0);
    setActive(null);
    setHovered(null);
    router.replace(`${pathname}?room=${id}`, { scroll: false });
  }

  // Scroll / arrows travel between the "hot areas" (overview + areas). Objects
  // are reached by clicking their item, not by scrolling past them.
  const travelMax = objectStart - 1;
  function step(delta: number) {
    setFocusIndex((i) => {
      const base = Math.min(i, travelMax);
      return Math.min(Math.max(base + delta, 0), travelMax);
    });
  }

  function onWheel(e: React.WheelEvent) {
    const now = performance.now();
    if (now - wheelAt.current < 450) return; // one waypoint per gesture
    wheelAt.current = now;
    step(e.deltaY > 0 ? 1 : -1);
  }

  if (mode === "deciding") {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-stone">
        Preparing the farmhouse…
      </div>
    );
  }

  if (mode === "simple") {
    return (
      <SimpleView
        environment={environment}
        member={member}
        active={active}
        onOpen={setActive}
        onClose={() => setActive(null)}
        onTry3D={() => {
          setMode("3d");
          setEntered(false);
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-void" onWheel={onWheel}>
      <FarmhouseScene
        room={room}
        member={member}
        focus={currentObject}
        vantage={currentVantage}
        timeOfDay={timeOfDay}
        onHoverChange={setHovered}
        onSelectObject={(obj) => {
          const idx = room.objects.findIndex((o) => o.id === obj.id);
          if (idx >= 0) setFocusIndex(objectStart + idx);
        }}
      />

      {/* Top bar — rooms + exit, always usable (cursor is never trapped) */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          {environment.rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => goToRoom(r.id)}
              aria-current={r.id === room.id}
              className={`rounded-full px-4 py-1.5 text-sm backdrop-blur-sm transition-colors ${
                r.id === room.id
                  ? "bg-amber text-void"
                  : "bg-void/70 text-stone hover:text-ivory"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setTimeOfDay((t) => (t === "day" ? "night" : "day"))
            }
            className="rounded-full bg-void/70 px-3 py-1.5 text-sm text-stone backdrop-blur-sm hover:text-ivory"
          >
            {timeOfDay === "day" ? "☀ Day" : "☾ Night"}
          </button>
          <button
            onClick={() => setMode("simple")}
            className="rounded-full bg-void/70 px-3 py-1.5 text-sm text-stone backdrop-blur-sm hover:text-ivory"
          >
            Simple view
          </button>
          <Link
            href="/"
            className="rounded-full bg-void/70 px-4 py-1.5 text-sm text-stone backdrop-blur-sm hover:text-ivory"
          >
            Exit
          </Link>
        </div>
      </div>

      {/* Entry gate */}
      {!entered && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-void/70 px-6 text-center backdrop-blur-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-amber">
            {environment.belongsTo}
          </p>
          <h1 className="mt-3 font-display text-4xl font-light text-ivory">
            {room.name}
          </h1>
          <p className="mt-3 max-w-md text-balance text-stone">
            {room.description}
          </p>
          <button
            onClick={() => setEntered(true)}
            className="mt-6 rounded-full bg-amber px-7 py-3 text-sm font-medium text-void transition-colors hover:bg-amber-soft"
          >
            Step inside
          </button>
        </div>
      )}

      {/* Bottom navigation dock */}
      {entered && !active && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 p-5">
          {/* Area travel chips */}
          {areas.length > 0 && (
            <div className="flex gap-2">
              {areas.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setFocusIndex(1 + i)}
                  aria-current={focusIndex === 1 + i}
                  className={`rounded-full px-4 py-1.5 text-sm backdrop-blur-sm transition-colors ${
                    focusIndex === 1 + i
                      ? "bg-amber text-void"
                      : "bg-void/70 text-stone hover:text-ivory"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <NavDock
            title={
              currentObject?.label ??
              currentArea?.label ??
              (hovered
                ? hovered.label
                : "Drag to look · scroll to travel · click an item")
            }
            subtitle={currentObject?.hint ?? null}
            canOpen={!!currentObject}
            locked={
              !!currentObject &&
              currentObject.access === "premium" &&
              !member
            }
            openText={currentObject ? openLabel(currentObject) : ""}
            index={Math.min(focusIndex, travelMax)}
            count={objectStart}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            onOpen={() => currentObject && setActive(currentObject)}
          />
        </div>
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

function NavDock({
  title,
  subtitle,
  canOpen,
  locked,
  openText,
  index,
  count,
  onPrev,
  onNext,
  onOpen,
}: {
  title: string;
  subtitle: string | null;
  canOpen: boolean;
  locked: boolean;
  openText: string;
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-full border border-hairline bg-void/80 px-4 py-2.5 backdrop-blur-md">
      <button
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous point"
        className="text-lg text-stone transition-colors hover:text-ivory disabled:opacity-30"
      >
        ‹
      </button>

      <div className="min-w-52 text-center">
        <p
          className={
            subtitle
              ? "font-display text-base text-ivory"
              : "text-sm text-stone"
          }
        >
          {title}
        </p>
        {subtitle && <p className="text-xs text-stone">{subtitle}</p>}
      </div>

      {canOpen && (
        <button
          onClick={onOpen}
          className="rounded-full bg-amber px-4 py-1.5 text-sm font-medium text-void transition-colors hover:bg-amber-soft"
        >
          {locked ? "Members" : openText}
        </button>
      )}

      <button
        onClick={onNext}
        disabled={index === count - 1}
        aria-label="Next point"
        className="text-lg text-stone transition-colors hover:text-ivory disabled:opacity-30"
      >
        ›
      </button>
    </div>
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
    <div className="absolute inset-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
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

        {environment.rooms.map((room) => (
          <RoomSection
            key={room.id}
            room={room}
            member={member}
            onOpen={onOpen}
          />
        ))}

        <div className="mt-10">
          <Link href="/" className="text-sm text-stone hover:text-ivory">
            ← All scenes
          </Link>
        </div>
      </div>

      {active && (
        <ObjectPanel object={active} member={member} onClose={onClose} />
      )}
    </div>
  );
}

function RoomSection({
  room,
  member,
  onOpen,
}: {
  room: Room;
  member: boolean;
  onOpen: (o: WorldObject) => void;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl text-ivory">{room.name}</h2>
      <p className="mt-1 max-w-xl text-sm text-stone">{room.description}</p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {room.objects.map((obj) => {
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
    </section>
  );
}
