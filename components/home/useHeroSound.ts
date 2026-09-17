"use client";

/**
 * Whether the hero loop is playing with sound, and remembering the answer.
 *
 * IT STARTS MUTED ON A FIRST VISIT, AND THAT IS NOT A PREFERENCE. Chrome,
 * Safari and Firefox all refuse autoplay with sound for a visitor with no
 * prior engagement on the domain, and iOS refuses it outright without a
 * gesture. A hero that asks for sound on the first play does not get sound —
 * it gets a still frame, because the refused play() never starts anything. So
 * sound is something the visitor turns on.
 *
 * THE CHOICE IS REMEMBERED, AND THE MEMORY IS AN INTENTION RATHER THAN A
 * PROMISE. On a later visit it asks for sound immediately. Chrome often allows
 * it by then — its Media Engagement Index counts exactly this kind of repeat
 * engagement — and Safari usually does not. When it is refused, AmbientVideo
 * reports back through `refused`, `blocked` latches, and the button returns to
 * showing muted. The icon never claims sound that is not playing.
 *
 * WHY useSyncExternalStore RATHER THAN AN EFFECT. The preference lives in
 * localStorage, which cannot be read during render — this page is statically
 * cached and shared, so a value read during render is a hydration mismatch.
 * Reading it in an effect and calling setState works but cascades an extra
 * render on every mount, which is what react-hooks/set-state-in-effect is
 * warning about. This is the shape React provides for exactly this: a server
 * snapshot of "muted", a client snapshot of what was stored, and no effect.
 *
 * localStorage is wrapped because Safari in private mode THROWS on access
 * rather than returning null, and a hero that crashes over a preference is a
 * worse outcome than one that forgets it.
 */

import { useCallback, useState, useSyncExternalStore } from "react";

const KEY = "luna:hero-sound";

/** Subscribers, so a toggle re-renders every reader of the preference. */
const listeners = new Set<() => void>();

function subscribe(fn: () => void) {
  listeners.add(fn);
  // `storage` fires for OTHER tabs, which is the behaviour we want: turning
  // sound on in one tab should not leave a second tab's icon lying.
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
}

function wantsSound(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

/** Nobody has a stored preference on the server, and muted is the only safe
 *  first play anyway — see the note above. */
function wantsSoundOnServer(): boolean {
  return false;
}

function store(on: boolean) {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* Private mode. The preference is a convenience, not state we need. */
  }
  listeners.forEach((fn) => fn());
}

export function useHeroSound(hasAudio: boolean) {
  const wanted = useSyncExternalStore(
    subscribe,
    wantsSound,
    wantsSoundOnServer,
  );

  // Latches when the browser refuses to unmute. Not stored: it is a fact about
  // this page load, not a choice the visitor made, and it must not overwrite
  // a preference they will get on a browser that allows it.
  const [blocked, setBlocked] = useState(false);

  const refused = useCallback(() => setBlocked(true), []);

  const toggle = useCallback(() => {
    setBlocked(false);
    store(!wantsSound());
  }, []);

  return { muted: !hasAudio || !wanted || blocked, toggle, refused };
}
