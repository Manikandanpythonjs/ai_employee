"use client";

import { useEffect, useRef, type RefObject } from "react";

export type SceneDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
) => void;

/**
 * Shared 2D-canvas loop for the generated scenes on this site. Handles
 * DPR-aware sizing, pauses the loop when the scene scrolls out of view, and
 * renders a single static frame when the visitor prefers reduced motion or is
 * on a coarse pointer — the scene stays legible, it just stops moving.
 */
export function useCanvasScene<T extends HTMLElement = HTMLDivElement>(
  draw: SceneDraw
): {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  wrapRef: RefObject<T | null>;
} {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<T | null>(null);
  // Latest callback without re-running the effect. Assigned in an effect so the
  // ref is never written during render.
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(pointer: coarse)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let last = 0;
    let dirty = true;

    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let visible = true;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) dirty = true;
      },
      { rootMargin: "180px" }
    );
    io.observe(wrap);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (!still) {
        t += Math.min(0.05, (now - last) / 1000);
        dirty = true;
      }
      last = now;
      if (!dirty) return;
      dirty = false;
      ctx.clearRect(0, 0, w, h);
      if (w && h) drawRef.current(ctx, w, h, still ? 0.35 : t);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return { canvasRef, wrapRef };
}
