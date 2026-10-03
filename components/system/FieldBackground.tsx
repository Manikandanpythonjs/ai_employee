"use client";

import { useEffect, useRef } from "react";

/**
 * Renders a fixed full-viewport canvas behind the page that draws a quiet,
 * multi-layer field of drifting points + connective lines. Parallax depth is
 * produced by moving each layer at a different rate from pointer & scroll.
 */
export function FieldBackground({ density = 0.00006 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = window.innerWidth;
    let h = window.innerHeight;
    let raf = 0;
    let t = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type P = { x: number; y: number; z: number; r: number; seed: number };
    const build = () => {
      const count = Math.min(150, Math.floor(w * h * density));
      return Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.35 + Math.random() * 1,
        r: 0.4 + Math.random() * 1.2,
        seed: Math.random() * 100,
      }));
    };
    let pts: P[] = build();
    window.addEventListener("resize", () => (pts = build()));

    const mouse = { x: -999, y: -999 };

    const draw = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        // drift
        p.x += Math.sin(t + p.seed) * 0.12 * p.z;
        p.y += Math.cos(t * 0.8 + p.seed * 1.3) * 0.12 * p.z;
        // wrap
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      const linkDist = 108;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const a = (1 - Math.sqrt(d2) / linkDist) * 0.09;
            ctx.strokeStyle = `rgba(18,19,23,${a})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        const near =
          Math.hypot(p.x - mouse.x, p.y - mouse.y) < 140 ? 1 : 0.25;
        ctx.fillStyle = `rgba(18,19,23,${0.1 * p.z * near})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
