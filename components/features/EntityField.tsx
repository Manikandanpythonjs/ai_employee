"use client";

import { useCanvasScene } from "@/lib/use-canvas";

/**
 * `entity` — AI Employees. A dense core is orbited by nine specialists on
 * inclined paths; each node carries a small leash back to the core, so the
 * cluster reads as one body with limbs rather than a loose scatter of dots.
 */
export function EntityField() {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.5;

    const N = 9;
    const nodes = Array.from({ length: N }, (_, i) => {
      const a = (i / N) * Math.PI * 2 + t * 0.16;
      const tilt = Math.sin(t * 0.7 + i * 1.3) * 0.22;
      const rad = R * (0.46 + 0.2 * Math.sin(i * 2.1));
      return {
        x: cx + Math.cos(a) * rad * (1 - Math.abs(tilt) * 0.35),
        y: cy + Math.sin(a) * rad * 0.52 + tilt * rad * 0.4,
        r: 2 + (i % 3),
      };
    });

    // Leashes
    ctx.strokeStyle = "rgba(18,19,23,0.16)";
    ctx.lineWidth = 0.7;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(
        (cx + n.x) / 2 + (n.y - cy) * 0.14,
        (cy + n.y) / 2 - (n.x - cx) * 0.14,
        n.x,
        n.y
      );
      ctx.stroke();
    }

    // Orbit tracks
    ctx.strokeStyle = "rgba(18,19,23,0.1)";
    for (const k of [0.52, 0.68, 0.84]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * k, R * k * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Core — a slow rotating square inside a disc
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.12);
    ctx.strokeStyle = "rgba(18,19,23,0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-7, -7, 14, 14);
    ctx.restore();

    const pulse = 15 + Math.sin(t * 1.6) * 2.5;
    ctx.fillStyle = "rgba(255,74,28,0.1)";
    ctx.beginPath();
    ctx.arc(cx, cy, pulse + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff4a1c";
    ctx.beginPath();
    ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
    ctx.fill();

    // Nodes
    for (const n of nodes) {
      ctx.fillStyle = "#121317";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,74,28,0.55)";
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="One AI Employee at the centre with nine specialist agents orbiting it, each connected back to the core."
      className="aspect-[5/4] w-full sm:aspect-[16/11]"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
