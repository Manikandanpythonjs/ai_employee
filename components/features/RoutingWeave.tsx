"use client";

import { useCanvasScene } from "@/lib/use-canvas";

type P = { x: number; y: number; vx: number; vy: number; root: boolean; c: string };

const SEEDS: { u: number; v: number; root?: boolean; c: string }[] = [
  { u: 0.5, v: 0.5, root: true, c: "#ff4a1c" },
  { u: 0.16, v: 0.2, c: "#121317" },
  { u: 0.84, v: 0.18, c: "#121317" },
  { u: 0.1, v: 0.72, c: "#121317" },
  { u: 0.9, v: 0.7, c: "#121317" },
  { u: 0.3, v: 0.44, c: "#2447e8" },
  { u: 0.7, v: 0.46, c: "#2447e8" },
  { u: 0.42, v: 0.12, c: "#121317" },
  { u: 0.58, v: 0.86, c: "#121317" },
  { u: 0.24, v: 0.86, c: "#121317" },
  { u: 0.78, v: 0.1, c: "#121317" },
];

/**
 * `graph` — Agent Orchestration. A tiny force simulation: nodes repel each
 * other, are pulled toward the plate's centre, and the root node additionally
 * attracts everything within its radius. Ordering emerges from the constraint
 * set rather than being drawn by hand.
 */
export function RoutingWeave() {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const pts: P[] = SEEDS.map((s) => ({
      x: s.u * w,
      y: s.v * h,
      vx: 0,
      vy: 0,
      root: !!s.root,
      c: s.c,
    }));

    const step = (dt: number) => {
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // Centring pull
        p.vx += (cx - p.x) * 0.00055;
        p.vy += (cy - p.y) * 0.00055;
        for (let j = 0; j < pts.length; j++) {
          if (i === j) continue;
          const q = pts[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy || 1;
          const d = Math.sqrt(d2);
          // Repulsion
          const f = 26000 / d2;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
          // The root pulls harder — that is the "orchestration".
          if (q.root) {
            p.vx -= (dx / d) * 52000 / d2;
            p.vy -= (dy / d) * 52000 / d2;
          }
        }
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    };

    // Pre-relax so the opening frame is already a composition, not a blob.
    for (let i = 0; i < 220; i++) step(1);
    const drift = 0.9 + Math.sin(t * 0.5) * 0.22;
    for (let i = 0; i < 6; i++) step(drift);

    const root = pts[0];

    // Edges: every worker reports to the root, workers also gossip laterally.
    ctx.lineWidth = 0.7;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      ctx.strokeStyle = "rgba(36,71,232,0.22)";
      ctx.beginPath();
      ctx.moveTo(root.x, root.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      if (i % 3 === 0) {
        const q = pts[i + 2] ?? pts[1];
        ctx.strokeStyle = "rgba(18,19,23,0.09)";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }

    // Order-of-operation pulse travelling root → leaf
    const u = (t * 0.32) % 1;
    for (let i = 1; i < pts.length; i++) {
      if ((i % 4) !== Math.floor(u * 4)) continue;
      const p = pts[i];
      ctx.fillStyle = "#2447e8";
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(root.x + (p.x - root.x) * u, root.y + (p.y - root.y) * u, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const p of pts) {
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.root ? 5 : 2.8, 0, Math.PI * 2);
      ctx.fill();
      if (p.root) {
        ctx.strokeStyle = "rgba(255,74,28,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="A force-directed agent graph: a supervisor node holding the objective, with workers branching beneath it and lateral edges between them."
      className="aspect-[5/4] w-full sm:aspect-[16/11]"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
