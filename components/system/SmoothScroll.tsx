"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollSignal } from "@/lib/scroll-signal";

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisInstance = lenis;

    lenis.on(
      "scroll",
      (e: { velocity: number; progress: number; direction: number }) => {
        scrollSignal.velocity = e.velocity;
        scrollSignal.progress = e.progress;
        scrollSignal.direction = e.direction;
        ScrollTrigger.update();
      }
    );

    // The ticker is registered per instance and removed in cleanup, rather than
    // behind a module-level `tickerAttached` latch. Under StrictMode the effect
    // mounts, tears down, then mounts again: a latch would let the first
    // instance's ticker keep running against a destroyed instance while the
    // live one never gets a ticker at all, leaving the page unscrollable.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 500);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
