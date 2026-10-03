"use client";

import { useCanvasScene } from "@/lib/use-canvas";

const SPOKES = 12;
const R = 0.34;

/**
 * `long-running` — Long-Running Work. A 72-hour clock: the minute hand turns
 * continuously while the hour hand crawls, so elapsed time is legible without
 * reading it. Only 9 of 12 checkpoint spokes have been passed — the run is
 * still live, and the twelfth is drawn hollow to mark where it will resume.
 */
export function Clockwork() {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) * R;

    // Dial
    ctx.strokeStyle = "rgba(18,19,23,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Ticks
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const major = i % 5 === 0;
      const r0 = rad - (major ? 9 : 4);
      ctx.strokeStyle = major ? "rgba(18,19,23,0.4)" : "rgba(18,19,23,0.16)";
      ctx.lineWidth = major ? 1 : 0.6;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * (rad - 1), cy + Math.sin(a) * (rad - 1));
      ctx.stroke();
    }

    // Checkpoints: 9 passed, 3 upcoming.
    for (let i = 0; i < SPOKES; i++) {
      const a = (i / SPOKES) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rad * 0.72;
      const y = cy + Math.sin(a) * rad * 0.72;
      const passed = i < 9;
      ctx.fillStyle = passed ? "#121317" : "rgba(242,238,231,1)";
      ctx.beginPath();
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = passed ? "rgba(18,19,23,0.5)" : "rgba(216,30,49,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Elapsed arc (09:24 of 12)
    const elapsed = (9 + 24 / 60) / 12;
    ctx.strokeStyle = "#ff4a1c";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 0.88, -Math.PI / 2, -Math.PI / 2 + elapsed * Math.PI * 2);
    ctx.stroke();

    // Hands — minute sweeps, hour crawls
    const minA = -Math.PI / 2 + (t * 0.16) * Math.PI * 2;
    const hourA = -Math.PI / 2 + (t * 0.16 / 12) * Math.PI * 2;
    ctx.strokeStyle = "#121317";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hourA) * rad * 0.45, cy + Math.sin(hourA) * rad * 0.45);
    ctx.stroke();
    ctx.strokeStyle = "#ff4a1c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(minA) * rad * 0.8, cy + Math.sin(minA) * rad * 0.8);
    ctx.stroke();

    ctx.fillStyle = "#121317";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Readout
    ctx.fillStyle = "rgba(108,112,118,0.95)";
    ctx.font = "500 8px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RUN CONTINUES · CHECKPOINT 10 PENDING", cx, cy + rad * 0.52);
  });

  return (
    <div
      ref={wrapRef}
      className="aspect-[5/4] w-full sm:aspect-[16/11]"
      role="img"
      aria-label="A clock dial with an elapsed arc and twelve checkpoint spokes; the run is live at checkpoint ten of twelve."
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
