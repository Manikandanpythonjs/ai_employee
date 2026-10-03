"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCanvasScene } from "@/lib/use-canvas";
import { TOOLS } from "@/lib/site";
import { useIsCoarsePointer } from "@/lib/use-webgl";

/**
 * Tools page. The index is a constellation, not a logo wall: each tool is a
 * point on a ring whose radius encodes its category, and selecting one lights
 * the path from the employee through every agent that uses it.
 */
export function ToolConstellation() {
  const [focus, setFocus] = useState<number | null>(null);
  // Mirror of `focus` so the canvas draw closure reads the current selection
  // without the draw callback being re-created on every hover.
  const focusRef = useRef<number | null>(null);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);
  const coarse = useIsCoarsePointer();

  const layout = useMemo(
    () =>
      TOOLS.map((tool, i) => {
        // Deterministic placement: golden-angle spiral, jittered by index.
        const a = i * 2.399963;
        const r = 0.16 + (i / TOOLS.length) * 0.3;
        return {
          x: 0.5 + Math.cos(a) * r,
          y: 0.5 + Math.sin(a) * r * 0.82,
          tool,
        };
      }),
    []
  );

  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const S = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const sel = focusRef.current;

    // Concentric category bands.
    ctx.strokeStyle = "rgba(18,19,23,0.07)";
    ctx.lineWidth = 1;
    for (let k = 1; k <= 3; k++) {
      ctx.beginPath();
      ctx.arc(cx, cy, S * (0.14 + k * 0.09), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Links from the employee to every tool; the focused one is emphasised.
    layout.forEach((p, i) => {
      const x = p.x * w;
      const y = p.y * h;
      const on = sel === i;
      ctx.strokeStyle = on
        ? "rgba(255,74,28,0.55)"
        : `rgba(18,19,23,${0.05 + (1 - i / layout.length) * 0.06})`;
      ctx.lineWidth = on ? 1.2 : 0.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      if (on) {
        // Packets travelling the active path.
        for (let k = 0; k < 3; k++) {
          const u = (t * (0.45 + k * 0.14) + k / 3) % 1;
          ctx.fillStyle = `rgba(255,74,28,${1 - u * 0.65})`;
          ctx.beginPath();
          ctx.arc(cx + (x - cx) * u, cy + (y - cy) * u, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // The employee at the centre.
    ctx.strokeStyle = "rgba(18,19,23,0.2)";
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.075, 0, Math.PI * 2);
    ctx.stroke();
    const pulse = 1 + Math.sin(t * 3) * 0.06;
    ctx.fillStyle = "#ff4a1c";
    ctx.beginPath();
    ctx.arc(cx, cy, 5 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Tool nodes.
    layout.forEach((p, i) => {
      const x = p.x * w;
      const y = p.y * h;
      const on = sel === i;
      ctx.beginPath();
      ctx.arc(x, y, on ? 16 : 12, 0, Math.PI * 2);
      ctx.fillStyle = on ? "#121317" : "rgba(250,248,244,0.92)";
      ctx.fill();
      ctx.strokeStyle = on ? "#ff4a1c" : "rgba(18,19,23,0.18)";
      ctx.lineWidth = on ? 1.4 : 0.8;
      ctx.stroke();
      ctx.fillStyle = on ? "#faf8f4" : "rgba(18,19,23,0.55)";
      ctx.font = "600 9px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.tool.glyph, x, y + 0.5);
    });
  });

  const active = focus !== null ? TOOLS[focus] : null;
  const categories = useMemo(
    () => Array.from(new Set(TOOLS.map((t) => t.cat))),
    []
  );

  return (
    <div className="u-shell grid gap-8 py-20 lg:grid-cols-[1.4fr_0.6fr] lg:py-28">
      {/* Constellation */}
      <div
        ref={wrapRef}
        role="img"
        aria-label={`Constellation of ${TOOLS.length} tool integrations grouped by category`}
        className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-ivory lg:aspect-[16/11]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        <span className="u-mono pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-ash">
          AI Employee
        </span>
      </div>

      {/* Readout + list */}
      <div className="flex flex-col">
        <div className="border border-ink/12 bg-ivory">
          <div className="border-b border-ink/10 px-5 py-3">
            <span className="u-mono text-ash">Active connection</span>
          </div>
          <div className="px-5 py-6">
            {active ? (
              <>
                <span className="u-mono inline-flex items-center gap-2 text-signal">
                  <span className="size-1.5 rounded-full bg-signal" />
                  Connected
                </span>
                <p className="u-display mt-3 text-3xl">{active.name}</p>
                <p className="u-mono mt-1 text-ash">{active.cat}</p>
                <dl className="mt-6 space-y-2 border-t border-ink/10 pt-4">
                  {[
                    ["Direction", "Bidirectional"],
                    ["Auth", "Scoped OAuth"],
                    ["Retries", "Automatic x3"],
                    ["Reversible", "Always"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="u-mono text-ash">{k}</dt>
                      <dd className="u-mono">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-graphite">
                Every connection is scoped, logged and reversible. The employee
                asks before it acts on anything it cannot undo.
              </p>
            )}
          </div>
        </div>

        {/* Keyboard-reachable tool index */}
        <ul
          className="mt-4 max-h-[22rem] flex-1 overflow-y-auto border border-ink/12 bg-ivory"
          data-cursor="OPEN"
        >
          {categories.map((cat) => (
            <li key={cat}>
              <p className="u-mono sticky top-0 border-b border-ink/10 bg-paper-3/70 px-5 py-2 text-ash backdrop-blur">
                {cat}
              </p>
              <ul>
                {TOOLS.map((tool, i) =>
                  tool.cat === cat ? (
                    <li key={tool.name}>
                      <button
                        type="button"
                        onPointerEnter={() => setFocus(i)}
                        onPointerLeave={() => setFocus(null)}
                        onFocus={() => setFocus(i)}
                        onBlur={() => setFocus(null)}
                        onClick={() =>
                          setFocus((f) => (coarse ? (f === i ? null : i) : f))
                        }
                        aria-pressed={focus === i}
                        className={`flex w-full items-center gap-3 border-b border-ink/8 px-5 py-2.5 text-left transition-colors ${
                          focus === i ? "bg-ink text-paper" : "hover:bg-paper-2"
                        }`}
                      >
                        <span className="u-mono w-6 text-[9px] opacity-60">
                          {tool.glyph}
                        </span>
                        <span className="u-mono flex-1">{tool.name}</span>
                      </button>
                    </li>
                  ) : null
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}