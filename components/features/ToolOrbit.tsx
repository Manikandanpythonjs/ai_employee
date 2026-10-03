"use client";

import { useCanvasScene } from "@/lib/use-canvas";
import { TOOLS } from "@/lib/site";

const GLYPH = (name: string) => TOOLS.find((tool) => tool.name === name)?.glyph ?? "?";

const RING_TOOLS = [
  ["Chrome", "Gmail", "Postgres", "GitHub", "Slack", "Notion", "Linear", "Vercel"],
  ["Playwright", "Calendar", "BigQuery", "Terminal", "Figma", "Drive", "HubSpot", "Zapier"],
];

/**
 * `orbit` — Tool Use. Three concentric tool systems turn at different rates
 * around a locked employee core. Where a dot crosses the top of its ring it
 * locks onto the core and fires a signal-orange packet inward, so capability
 * visibly arrives from the outside in.
 */
export function ToolOrbit() {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.5;

    const rates = [0.11, -0.17, 0.26];

    // Core
    ctx.fillStyle = "rgba(18,19,23,0.04)";
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(18,19,23,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#121317";
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    RING_TOOLS.forEach((names, ring) => {
      const rad = R * (0.36 + ring * 0.27);
      const spin = t * rates[ring];
      const start = -Math.PI / 2;

      ctx.strokeStyle = "rgba(18,19,23,0.12)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();

      names.forEach((name, i) => {
        const a = start + spin + (i / names.length) * Math.PI * 2;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        // Alignment to the 12 o'clock axis: -1 = perfectly in phase.
        const align = -Math.cos(a);

        if (align > 0.55) {
          // Locked — fire a packet to the core.
          const u = ((t * 1.1 + i * 0.21) % 1);
          const px = x + (cx - x) * u;
          const py = y + (cy - y) * u;
          ctx.strokeStyle = `rgba(255,74,28,${0.5 * (1 - u)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.fillStyle = "#ff4a1c";
          ctx.beginPath();
          ctx.arc(px, py, 1.9, 0, Math.PI * 2);
          ctx.fill();
        }

        const hot = align > 0.55;
        ctx.fillStyle = hot ? "#ff4a1c" : "#121317";
        ctx.beginPath();
        ctx.arc(x, y, hot ? 3.4 : 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hot ? "#121317" : "#6c7076";
        ctx.font = "500 8px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(GLYPH(name), x, y);
      });
    });
  });

  return (
    <div
      ref={wrapRef}
      className="aspect-[5/4] w-full sm:aspect-[16/11]"
      role="img"
      aria-label="Systems turning on three orbital rings around a locked employee core, each connection firing a packet inward when aligned."
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
