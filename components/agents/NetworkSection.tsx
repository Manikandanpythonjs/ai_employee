"use client";

import { useEffect, useRef, useState } from "react";
import { AGENTS } from "@/lib/site";
import { useCanvasScene } from "@/lib/use-canvas";

/**
 * Directed delegation edges between agents. The graph is authored, not random:
 * a planner routes outward, specialists report back inward, the verifier
 * reads everyone, and the repair agent closes the cycle on failure.
 */
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 4],
  [0, 3],
  [0, 5],
  [1, 7],
  [1, 4],
  [2, 6],
  [3, 6],
  [3, 8],
  [4, 7],
  [5, 7],
  [6, 8],
  [7, 0],
  [8, 6],
];

const R = 0.36;

function nodePos(i: number, w: number, h: number, t: number) {
  const a = -Math.PI / 2 + (i / AGENTS.length) * Math.PI * 2;
  const bob = Math.sin(t * 0.5 + i * 1.1) * 4;
  const cx = w / 2;
  const cy = h / 2;
  const rad = Math.min(w, h) * R;
  return {
    x: cx + Math.cos(a) * (rad + bob),
    y: cy + Math.sin(a) * (rad + bob) * 0.86,
    a,
  };
}

/**
 * The agent network as a live canvas. Every agent occupies a fixed station on
 * the ring; the currently traced delegation pulses travel their real edges, so
 * the diagram on screen is the same graph the index describes.
 */
export function NetworkSection() {
  const [focus, setFocus] = useState<number | null>(null);
  // Mirror of `focus` so the canvas draw closure reads the current selection
  // without re-subscribing the frame loop on every change.
  const focusRef = useRef<number | null>(null);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const pos = AGENTS.map((_, i) => nodePos(i, w, h, t));
    const sel = focusRef.current;

    const adjacent = new Set<number>();
    if (sel !== null) {
      adjacent.add(sel);
      for (const [a, b] of EDGES) {
        if (a === sel) adjacent.add(b);
        if (b === sel) adjacent.add(a);
      }
    }

    // Edges
    for (const [a, b] of EDGES) {
      const p = pos[a];
      const q = pos[b];
      const live = sel === a || sel === b;
      const dim = sel !== null && !live;
      ctx.strokeStyle = dim
        ? "rgba(18,19,23,0.07)"
        : live
          ? AGENTS[a].color
          : "rgba(18,19,23,0.16)";
      ctx.lineWidth = live ? 1.2 : 0.8;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      // Curve every edge slightly inward so the ring reads as a mesh.
      const cx0 = w / 2;
      const cy0 = h / 2;
      const bow = 0.22;
      ctx.quadraticCurveTo(
        mx + (cx0 - mx) * bow,
        my + (cy0 - my) * bow,
        q.x,
        q.y
      );
      ctx.stroke();
    }

    // Travelling packets — one agent at a time traces its outbound edges.
    const cycle = 4.2;
    const who = Math.floor(t / cycle) % AGENTS.length;
    const local = (t % cycle) / cycle;
    if (sel === null || sel === who) {
      const outbound = EDGES.filter(([a]) => a === who);
      outbound.forEach(([, b], k) => {
        const u = Math.min(1, local * 1.6 - k * 0.14);
        if (u <= 0 || u >= 1) return;
        const p = pos[who];
        const q = pos[b];
        const mx = (p.x + q.x) / 2;
        const my = (p.y + q.y) / 2;
        const cx0 = w / 2;
        const cy0 = h / 2;
        const bow = 0.22;
        const cxp = mx + (cx0 - mx) * bow;
        const cyp = my + (cy0 - my) * bow;
        const iu = 1 - u;
        const px =
          iu * iu * p.x + 2 * iu * u * cxp + u * u * q.x;
        const py =
          iu * iu * p.y + 2 * iu * u * cyp + u * u * q.y;
        ctx.fillStyle = AGENTS[who].color;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Core — the shared objective
    ctx.fillStyle = "rgba(18,19,23,0.04)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(18,19,23,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#ff4a1c";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3.4, 0, Math.PI * 2);
    ctx.fill();

    // Stations
    AGENTS.forEach((agent, i) => {
      const p = pos[i];
      const hot = sel === i;
      const near = adjacent.has(i);
      const dim = sel !== null && !near;
      const r = hot ? 6.5 : near ? 4.4 : 3.4;

      ctx.fillStyle = dim ? "rgba(18,19,23,0.25)" : agent.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (hot) {
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12 + Math.sin(t * 3) * 1.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = dim ? "rgba(108,112,118,0.45)" : "#6c7076";
      ctx.font = "500 9px ui-monospace, monospace";
      ctx.textAlign = p.x > w / 2 ? "left" : "right";
      ctx.textBaseline = "middle";
      const off = r + 7;
      ctx.fillText(agent.name.replace(" Agent", ""), p.x + off, p.y);
    });
  });

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        data-cursor="EXPLORE"
        className="relative aspect-square w-full border border-ink/12 bg-ivory sm:aspect-[16/12]"
        role="img"
        aria-label="Nine agents arranged on a ring around a shared objective, connected by directed delegation edges carrying live packets."
        onPointerLeave={() => setFocus(null)}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {/* Station selector — the keyboard- and touch-reachable equivalent. */}
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {AGENTS.map((agent, i) => (
          <li key={agent.id}>
            <button
              type="button"
              data-cursor="EXPLORE"
              onPointerEnter={() => setFocus(i)}
              onFocus={() => setFocus(i)}
              onClick={() => setFocus((f) => (f === i ? null : i))}
              aria-pressed={focus === i}
              className="u-mono inline-flex items-center gap-2 text-ash transition-colors duration-300 hover:text-ink"
              style={focus === i ? { color: agent.color } : undefined}
            >
              <span
                aria-hidden
                className="size-1.5"
                style={{ background: agent.color }}
              />
              {agent.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
