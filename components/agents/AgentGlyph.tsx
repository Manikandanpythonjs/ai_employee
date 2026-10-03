"use client";

import { useCanvasScene } from "@/lib/use-canvas";
import { AGENTS } from "@/lib/site";

/**
 * Nine agents, nine generative identities — drawn by one shared canvas rather
 * than nine of them. The index selects the algorithm; everything else (paper,
 * weight, hairlines, the agent's own `color`) stays constant, so the set reads
 * as one design system with nine distinct marks rather than nine illustrations.
 */
export function AgentGlyph({
  index,
  color,
  seed = 0,
}: {
  index: number;
  color: string;
  seed?: number;
}) {
  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const cx = w / 2;
    const cy = h / 2;
    const S = Math.min(w, h);
    const ink = "rgba(18,19,23,";

    ctx.save();
    ctx.translate(cx, cy);

    // 00 — Planner: an ordered lattice resolving into columns.
    if (index === 0) {
      const cols = 5;
      const rows = 5;
      const pitch = S * 0.13;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = (c - (cols - 1) / 2) * pitch;
          const py = (r - (rows - 1) / 2) * pitch;
          const settle = Math.min(1, Math.max(0, (t * 0.5 + seed - (r * cols + c) * 0.06) % 1.6));
          const ox = (c - (cols - 1) / 2) * pitch * (1 - settle) * 2.2;
          ctx.fillStyle = `${ink}${0.12 + settle * 0.5})`;
          ctx.fillRect(px - ox * 0.5, py, pitch * 0.36, pitch * 0.36);
        }
      }
      ctx.strokeStyle = `${ink}0.14)`;
      ctx.lineWidth = 0.8;
      for (let c = 0; c < cols; c++) {
        const px = (c - (cols - 1) / 2) * pitch;
        ctx.beginPath();
        ctx.moveTo(px, -pitch * 2.6);
        ctx.lineTo(px, pitch * 2.6);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.fillRect(-pitch * 0.18, -pitch * 2.6, pitch * 0.36, pitch * 5.2);
    }

    // 01 — Research: overlapping lenses, each a document field being read.
    else if (index === 1) {
      for (let k = 0; k < 3; k++) {
        const off = (k - 1) * S * 0.13;
        const wob = Math.sin(t * 0.7 + k * 1.2) * S * 0.02;
        ctx.strokeStyle = k === 1 ? color : `${ink}0.28)`;
        ctx.lineWidth = k === 1 ? 1.5 : 0.9;
        ctx.beginPath();
        ctx.ellipse(off + wob, 0, S * 0.17, S * 0.24, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let l = 0; l < 4; l++) {
          const y = -S * 0.12 + l * S * 0.075;
          ctx.beginPath();
          ctx.moveTo(off + wob - S * 0.11, y);
          ctx.lineTo(off + wob + S * 0.11, y);
          ctx.strokeStyle = `${ink}${0.16 + k * 0.04})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // 02 — Browser: a cursor traversing a viewport grid, dragging a trail.
    else if (index === 2) {
      const wv = S * 0.34;
      const hh = S * 0.26;
      ctx.strokeStyle = `${ink}0.3)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-wv, -hh, wv * 2, hh * 2);
      ctx.fillStyle = `${ink}0.05)`;
      ctx.fillRect(-wv, -hh, wv * 2, S * 0.035);
      ctx.strokeStyle = `${ink}0.16)`;
      for (let i = 1; i < 4; i++) {
        const x = -wv + (i / 4) * wv * 2;
        ctx.beginPath();
        ctx.moveTo(x, -hh);
        ctx.lineTo(x, hh);
        ctx.stroke();
      }
      for (let i = 1; i < 3; i++) {
        const y = -hh + (i / 3) * hh * 2;
        ctx.beginPath();
        ctx.moveTo(-wv, y);
        ctx.lineTo(wv, y);
        ctx.stroke();
      }
      const path = (u: number) => {
        const a = u * Math.PI * 2;
        return [
          Math.cos(a * 1.3) * wv * 0.78,
          Math.sin(a * 2.1) * hh * 0.74,
        ] as const;
      };
      for (let i = 0; i < 22; i++) {
        const [x, y] = path(i / 22);
        ctx.fillStyle = color;
        ctx.globalAlpha = (i / 22) * 0.85;
        ctx.fillRect(x - 1, y - 1, 2.4, 2.4);
      }
      ctx.globalAlpha = 1;
      const [hx, hy] = path((t * 0.3) % 1);
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx + 9, hy + 3);
      ctx.lineTo(hx + 3.5, hy + 3);
      ctx.lineTo(hx + 2.4, hy + 9);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    // 03 — Coding: a diff. Two halves, tokens moving between them.
    else if (index === 3) {
      const hh = S * 0.3;
      ctx.strokeStyle = `${ink}0.28)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(0, hh);
      ctx.stroke();
      const rail = (side: number) => {
        for (let i = 0; i < 11; i++) {
          const y = -hh + (i / 11) * hh * 2 + S * 0.012;
          const w = S * (0.09 + ((i * 7 + seed) % 5) * 0.022);
          ctx.fillStyle = `${ink}0.13)`;
          ctx.fillRect(side * S * 0.05, y, w, S * 0.014);
        }
      };
      rail(-1);
      ctx.fillStyle = `${ink}0.16)`;
      for (let i = 0; i < 4; i++) {
        const y = -hh + (i / 11) * hh * 2 + S * 0.012;
        ctx.fillRect(S * 0.05, y, S * (0.06 + ((i * 5) % 4) * 0.02), S * 0.014);
      }
      // Tokens crossing the divide
      const cross = (t * 0.28) % 1;
      for (let i = 0; i < 3; i++) {
        const u = (cross + i / 3) % 1;
        const y = -hh + ((i * 3.1 + seed) % 11) / 11 * hh * 2;
        ctx.fillStyle = color;
        ctx.fillRect(S * 0.05 * (1 - u * 2), y, S * 0.03, S * 0.014);
      }
      ctx.strokeStyle = `${color}`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -hh * 1.15);
      ctx.lineTo(0, hh * 1.15);
      ctx.stroke();
    }

    // 04 — Data: a sampled distribution with a fitted model over it.
    else if (index === 4) {
      const wv = S * 0.36;
      const hh = S * 0.22;
      ctx.strokeStyle = `${ink}0.16)`;
      ctx.lineWidth = 0.8;
      for (let i = 0; i <= 4; i++) {
        const x = -wv + (i / 4) * wv * 2;
        ctx.beginPath();
        ctx.moveTo(x, -hh);
        ctx.lineTo(x, hh);
        ctx.stroke();
      }
      // Bars
      for (let i = 0; i < 21; i++) {
        const x = -wv + (i / 20) * wv * 2;
        const g = Math.exp(-Math.pow((i - 9) / 4.2, 2)) + Math.exp(-Math.pow((i - 17) / 2, 2)) * 0.4;
        const bh = g * hh * 1.6;
        ctx.fillStyle = `${ink}0.14)`;
        ctx.fillRect(x - wv / 46, hh - bh, wv / 23, bh);
      }
      // Model curve
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const x = -wv + u * wv * 2;
        const g =
          Math.exp(-Math.pow((u * 20 - 9) / 4.2, 2)) +
          Math.exp(-Math.pow((u * 20 - 17) / 2, 2)) * 0.4;
        const y = hh - g * hh * 1.62 + Math.sin(t * 1.3 + u * 7) * 0.8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 05 — Communication: an outbound wavefront with recipients lit in turn.
    else if (index === 5) {
      const n = 3;
      for (let ring = 0; ring < n; ring++) {
        const rr = S * (0.11 + ring * 0.11);
        ctx.strokeStyle = ring === 0 ? `${color}` : `${ink}${0.3 - ring * 0.08})`;
        ctx.lineWidth = ring === 0 ? 1.6 : 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      const spoke = 7;
      for (let i = 0; i < spoke; i++) {
        const a = (i / spoke) * Math.PI * 2 + t * 0.12;
        const u = (t * 0.4 + i / spoke) % 1;
        const rr = S * (0.11 + u * 0.22);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        ctx.strokeStyle = `${color}`;
        ctx.globalAlpha = 1 - u;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = `${ink}0.7)`;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 4.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 06 — Verification: an adversarial sweep. The scan crosses and finds.
    else if (index === 6) {
      const r = S * 0.28;
      ctx.strokeStyle = `${ink}0.2)`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      // Scan bar
      const sa = -Math.PI / 2 + ((t * 0.42) % 1) * Math.PI * 2;
      ctx.strokeStyle = `${color}`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, sa, sa + 0.7);
      ctx.stroke();
      // Faults found on the circumference
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        const found = Math.abs(((sa + Math.PI * 2) % (Math.PI * 2)) - (a + Math.PI / 2)) < 0.5;
        ctx.strokeStyle = found ? color : `${ink}0.4)`;
        ctx.lineWidth = found ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(x - 3, y - 3);
        ctx.lineTo(x + 3, y + 3);
        ctx.moveTo(x + 3, y - 3);
        ctx.lineTo(x - 3, y + 3);
        ctx.stroke();
      }
      ctx.fillStyle = `${ink}0.1)`;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `${ink}0.45)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 07 — Memory: strata that accumulate and are selectively pruned.
    else if (index === 7) {
      const layers = 6;
      for (let i = 0; i < layers; i++) {
        const amp = S * (0.04 + i * 0.028);
        const base = -S * 0.24 + i * S * 0.096;
        ctx.strokeStyle = i === layers - 1 ? color : `${ink}${0.14 + i * 0.07})`;
        ctx.lineWidth = i === layers - 1 ? 1.5 : 0.9;
        ctx.beginPath();
        for (let x = 0; x <= 60; x++) {
          const u = x / 60;
          const px = -S * 0.34 + u * S * 0.68;
          const py =
            base -
            Math.sin(u * Math.PI * 3 + t * 0.4 + i * 0.6) * amp -
            (Math.sin(u * 44 + seed) > 0.72 && i < layers - 1 ? S * 0.03 : 0);
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      // Recall probe
      const pu = (t * 0.2) % 1;
      const px = -S * 0.34 + pu * S * 0.68;
      ctx.fillStyle = color;
      ctx.fillRect(px - 1, -S * 0.3, 2, S * 0.6);
    }

    // 08 — Repair: a broken circuit closing itself.
    else {
      const r = S * 0.28;
      const gapA = -Math.PI / 2 + Math.sin(t * 0.5) * 0.5;
      const gap = 0.7;
      ctx.strokeStyle = `${ink}0.22)`;
      ctx.lineWidth = 0.9;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Closed bridge over the fault
      const closeU = Math.min(1, Math.max(0, Math.sin(t * 0.9) * 1.4));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(0, 0, r, gapA, gapA + gap * closeU);
      ctx.stroke();
      // Fault marker
      ctx.strokeStyle = "#d81e31";
      ctx.lineWidth = 1.8;
      const fx = Math.cos(gapA + gap / 2) * r;
      const fy = Math.sin(gapA + gap / 2) * r;
      ctx.beginPath();
      ctx.moveTo(fx - 4, fy - 4);
      ctx.lineTo(fx + 4, fy + 4);
      ctx.moveTo(fx + 4, fy - 4);
      ctx.lineTo(fx - 4, fy + 4);
      ctx.stroke();
      // Retry packets on the bridge
      for (let i = 0; i < 3; i++) {
        const u = (t * 0.5 + i / 3) % 1;
        const a = gapA + gap * u * closeU;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `${ink}0.08)`;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={`Generative identity mark for ${AGENTS[index]?.name ?? "this agent"}`}
      className="aspect-square w-full"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
