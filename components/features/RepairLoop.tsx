"use client";

import { useCanvasScene } from "@/lib/use-canvas";

const STAGES = ["DETECT", "DIAGNOSE", "REPLAN", "REPAIR", "RETRY"];

/**
 * `loop` — Self-Healing. A blood-red ring of failure travels a closed circuit
 * around the plate; wherever it passes a stage node the node flips to acid lime
 * and the loop re-closes behind it. One full revolution = one complete repair
 * cycle, so the diagram is literally cyclic rather than a linear retry chain.
 */
export function RepairLoop() {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.32;
    const a0 = -Math.PI / 2;

    // Closed circuit
    ctx.strokeStyle = "rgba(18,19,23,0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes
    ctx.strokeStyle = "rgba(18,19,23,0.08)";
    STAGES.forEach((_, i) => {
      const a = a0 + (i / STAGES.length) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    });

    // Repair head travels the loop
    const head = (t * 0.26) % 1;
    const headA = a0 + head * Math.PI * 2;

    // Trail behind the head
    const steps = 26;
    for (let i = 0; i < steps; i++) {
      const u = (head - i / steps + 1) % 1;
      const a = a0 + u * Math.PI * 2;
      const fade = (1 - i / steps) ** 2;
      ctx.strokeStyle = `rgba(216,30,49,${0.5 * fade})`;
      ctx.lineWidth = 2.4 * fade + 0.4;
      ctx.beginPath();
      ctx.arc(cx, cy, R, a, a + 0.09);
      ctx.stroke();
    }

    // Stage nodes: lit once the head has passed them this revolution.
    STAGES.forEach((_, i) => {
      const u = (i + 0.5) / STAGES.length;
      const a = a0 + u * Math.PI * 2;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R;
      const lit = head >= u;
      ctx.fillStyle = lit ? "#c8f432" : "#121317";
      ctx.beginPath();
      ctx.arc(x, y, lit ? 3.6 : 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = lit ? "rgba(18,19,23,0.75)" : "rgba(155,158,163,0.9)";
      ctx.font = "500 8px ui-monospace, monospace";
      ctx.textAlign = Math.cos(a) > 0.25 ? "left" : Math.cos(a) < -0.25 ? "right" : "center";
      ctx.textBaseline = Math.sin(a) > 0.5 ? "top" : "bottom";
      const off = 8;
      ctx.fillText(STAGES[i], x + (ctx.textAlign === "left" ? off : ctx.textAlign === "right" ? -off : 0), y + (ctx.textAlign === "center" ? off : 0));
    });

    // Head
    const hx = cx + Math.cos(headA) * R;
    const hy = cy + Math.sin(headA) * R;
    ctx.fillStyle = "#d81e31";
    ctx.beginPath();
    ctx.arc(hx, hy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Core — the workflow, still nominal
    ctx.fillStyle = "rgba(18,19,23,0.06)";
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(18,19,23,0.8)";
    ctx.font = "500 8px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`CYCLE ${Math.floor(t * 0.26) + 1}`, cx, cy);
  });

  return (
    <div
      ref={wrapRef}
      className="aspect-[5/4] w-full sm:aspect-[16/11]"
      role="img"
      aria-label="A failure marker travelling a closed repair circuit through detect, diagnose, replan, repair and retry, re-closing the loop each revolution."
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
