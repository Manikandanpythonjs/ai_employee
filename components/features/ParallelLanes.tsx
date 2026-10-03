"use client";

import { useCanvasScene } from "@/lib/use-canvas";

const LANES = [
  { id: "extract", label: "EXTRACT", start: 0.0, len: 0.34 },
  { id: "enrich", label: "ENRICH", start: 0.08, len: 0.4 },
  { id: "draft", label: "DRAFT", start: 0.2, len: 0.46 },
  { id: "cite", label: "CITE", start: 0.34, len: 0.36 },
  { id: "score", label: "SCORE", start: 0.46, len: 0.3 },
];

/**
 * `parallel` — Parallel Execution. Five independent lanes run left to right at
 * different offsets and durations, so the work visibly overlaps instead of
 * queueing. Each lane holds at a gate until every earlier dependency clears,
 * then all five converge on the single reconvergence point at the right edge.
 */
export function ParallelLanes() {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const padX = w * 0.11;
    const padY = h * 0.16;
    const spanX = w - padX * 2;
    const spanY = h - padY * 2;
    const rowH = spanY / (LANES.length - 1);
    const cy = h / 2;

    const maxStart = Math.max(...LANES.map((l) => l.start + l.len));

    LANES.forEach((lane, i) => {
      const y = padY + i * rowH;

      // Track
      ctx.strokeStyle = "rgba(18,19,23,0.1)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(w - padX, y);
      ctx.stroke();

      // Dependency gate position (start of the longest earlier lane)
      const gate = i === 0 ? 0 : Math.max(...LANES.slice(0, i).map((l) => l.start + l.len)) / maxStart;

      // Completed span
      const u = Math.min(1, Math.max(0, ((t * 0.16) % 1.35) - lane.start) / lane.len);
      const from = padX + gate * spanX;
      const to = from + (u - gate) * spanX;

      if (to > from) {
        ctx.strokeStyle = "#2447e8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(from, y);
        ctx.lineTo(to, y);
        ctx.stroke();
      }

      // Dependency gate pips
      ctx.strokeStyle = "rgba(18,19,23,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(from, y - 5);
      ctx.lineTo(from, y + 5);
      ctx.stroke();

      // Node at the head of the lane
      const hx = from + (u - gate) * spanX;
      if (u > gate) {
        ctx.fillStyle = "#ff4a1c";
        ctx.beginPath();
        ctx.arc(hx, y, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "rgba(18,19,23,0.3)";
        ctx.beginPath();
        ctx.arc(hx, y, 2.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = "rgba(108,112,118,0.95)";
      ctx.font = "500 8px ui-monospace, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(lane.label, padX - 8, y);
    });

    // Reconvergence
    ctx.strokeStyle = "rgba(18,19,23,0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < LANES.length; i++) {
      const y = padY + i * rowH;
      ctx.moveTo(w - padX + 6, y);
      ctx.lineTo(w - padX + 22, cy);
    }
    ctx.stroke();

    const merged = (t * 0.16) % 1.35 > 0.8;
    ctx.fillStyle = merged ? "#c8f432" : "rgba(18,19,23,0.25)";
    ctx.beginPath();
    ctx.arc(w - padX + 22, cy, 4.6, 0, Math.PI * 2);
    ctx.fill();

    // Inbound
    ctx.strokeStyle = "#121317";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(padX - 22, cy);
    ctx.lineTo(padX - 6, cy);
    ctx.stroke();
    ctx.fillStyle = "#121317";
    ctx.beginPath();
    ctx.arc(padX - 22, cy, 3.4, 0, Math.PI * 2);
    ctx.fill();
  });

  return (
    <div
      ref={wrapRef}
      className="aspect-[5/4] w-full sm:aspect-[16/11]"
      role="img"
      aria-label="Five independent task lanes overlapping in time, each gated on earlier lanes, all reconverging into one result."
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
