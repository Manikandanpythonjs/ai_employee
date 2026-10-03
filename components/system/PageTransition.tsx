"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * Reveals each route with a short rise so navigation feels like turning to a
 * new spread of the same publication. Kept deliberately restrained — the
 * transitions between chapters do the storytelling, not the route change.
 *
 * The reveal deliberately never starts from `autoAlpha: 0`. Animating the whole
 * document from invisible means a single missed tick — a throttled tab, the
 * preloader still covering the page, a background tab — leaves the entire site
 * blank while the fixed nav and chapter rail, which sit outside this wrapper,
 * keep painting. Fixed chrome visible over an empty page is exactly the failure
 * that was reported. The page now starts visible and only a small offset is
 * animated, so a dropped tick costs a stray pixel offset and nothing else.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tween = gsap.fromTo(
      wrap,
      { y: 14 },
      { y: 0, duration: 0.7, ease: "expo.out", clearProps: "transform" }
    );

    return () => {
      tween.kill();
    };
  }, [pathname]);

  return (
    <div id="main" ref={wrapRef} className="relative">
      {children}
    </div>
  );
}