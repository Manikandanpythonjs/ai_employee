"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Reports whether a host element is anywhere near the viewport.
 *
 * This single page mounts six WebGL canvases at once — hero hologram,
 * orchestration graph, compute rig, human, and two robots. R3F's default
 * `frameloop="always"` runs one rAF-driven render per canvas every frame, so
 * an off-screen robot several sections away still submits draw calls, compiles
 * no work but consumes the same main thread the scroll handler is running on.
 * Six contexts drawing 60 times a second is the difference between a scroll
 * that glides and one that stutters.
 *
 * `rootMargin` is deliberately generous in both directions. The hero and
 * orchestration canvases begin their motion before they are fully on screen,
 * and a model that pops from frozen to spinning at the exact edge reads as a
 * stutter rather than as an optimisation.
 */
export function useInView(
  ref: RefObject<HTMLElement | null>,
  rootMargin = "300px"
): boolean {
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No IO (very old browsers) or a detached node: keep the default rather
    // than freezing a canvas that is genuinely on screen.
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
