"use client";

import { useCallback, useSyncExternalStore } from "react";

let cached: boolean | null = null;

function detectWebGL() {
  if (cached !== null) return cached;
  try {
    const c = document.createElement("canvas");
    cached = !!(
      c.getContext("webgl2") ||
      c.getContext("webgl") ||
      c.getContext("experimental-webgl")
    );
  } catch {
    cached = false;
  }
  return cached;
}

/**
 * Feature-detect WebGL. `useSyncExternalStore` keeps this SSR-safe without a
 * render-time branch: the server snapshot is null, so nothing renders until
 * the client has actually checked.
 */
export function useWebGLSupported() {
  const subscribe = useCallback(() => () => {}, []);
  return useSyncExternalStore(subscribe, detectWebGL, () => null);
}

/**
 * Subscribe to a media query. Returns false during SSR and on the very first
 * client paint, then the real value — which is exactly when these flags are
 * needed (inside effects, before any visual commitment).
 */
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** True on touch-first devices, where cursor effects are replaced by taps. */
export function useIsCoarsePointer() {
  return useMediaQuery("(pointer: coarse)");
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}