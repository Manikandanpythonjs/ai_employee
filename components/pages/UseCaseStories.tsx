"use client";

import { useEffect, useRef, useState } from "react";
import { useCanvasScene } from "@/lib/use-canvas";
import { useReducedMotion } from "@/lib/use-webgl";
import { USE_CASES } from "@/lib/site";

/**
 * Each use case is a small interactive story: the steps advance on a loop while
 * the reader is on that panel, and the drawn scene shows what the agent is
 * doing at that step — not a generic illustration.
 */
export function UseCaseStories() {
  const [open, setOpen] = useState(0);

  return (
    <div className="u-shell pb-24 md:pb-32">
      {USE_CASES.map((uc, i) => (
        <UseCaseRow
          key={uc.id}
          index={i}
          open={open === i}
          onToggle={() => setOpen(open === i ? -1 : i)}
        />
      ))}
    </div>
  );
}

function UseCaseRow({
  index,
  open,
  onToggle,
}: {
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const uc = USE_CASES[index];
  const bodyRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);

  // Steps only advance while the panel is open — no wasted timers. A free
  // running counter avoids resetting state on open, so re-opening resumes the
  // sequence instead of restarting it. Under reduced motion the story is shown
  // resolved rather than advanced.
  useEffect(() => {
    if (!open || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 900);
    return () => window.clearInterval(id);
  }, [open, reduced]);

  const shown = reduced ? uc.steps.length - 1 : tick % uc.steps.length;

  // Collapse/expand the body height.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.style.maxHeight = open ? `${body.scrollHeight}px` : "0px";
  }, [open]);

  return (
    <article className="border-b border-ink/12">
      <button
        type="button"
        data-cursor="MAGNETIC"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex w-full items-center gap-5 py-6 text-left md:gap-8 md:py-8"
      >
        <span className="u-mono w-8 shrink-0 text-ash">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className={`u-display flex-1 text-[clamp(1.5rem,4vw,3rem)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 ${
            open ? "text-ink" : "text-ink/70"
          }`}
        >
          {uc.role}
        </span>
        <span
          aria-hidden
          className="u-mono shrink-0 text-ash transition-transform duration-500"
          style={{ transform: `rotate(${open ? 45 : 0}deg)` }}
        >
          +
        </span>
      </button>

      <div
        ref={bodyRef}
        className="overflow-hidden transition-[max-height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ maxHeight: 0 }}
      >
        <div className="grid gap-10 pb-12 md:grid-cols-[1.1fr_0.9fr] md:gap-14 lg:pl-16">
          {/* Story */}
          <div>
            <h3 className="u-display text-[clamp(1.4rem,3vw,2.4rem)]">
              {uc.headline}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite md:text-base">
              {uc.body}
            </p>
            <p className="u-mono mt-6 text-ash">
              Owned by {uc.agent}
            </p>

            {/* Steps */}
            <ol className="mt-8 flex flex-wrap gap-2">
              {uc.steps.map((s, i) => {
                const on = i <= shown;
                return (
                  <li
                    key={s}
                    className={`u-mono border px-3 py-1.5 transition-colors duration-500 ${
                      on
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/20 text-ash"
                    }`}
                  >
                    <span className="mr-2 opacity-50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Scene */}
          <div className="border border-ink/12 bg-ivory">
            <UseCaseScene index={index} step={shown} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** A schematic per use case that reflects the current step. */
function UseCaseScene({ index, step }: { index: number; step: number }) {
  const uc = USE_CASES[index];
  // Mirror of `step` so the draw closure sees the current step.
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const { canvasRef, wrapRef } = useCanvasScene((ctx, w, h, t) => {
    const S = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const s = stepRef.current;
    const n = uc.steps.length;
    const total = uc.steps.length;

    // The employee core
    const pulse = 1 + Math.sin(t * 2.6) * 0.05;
    ctx.fillStyle = "rgba(255,74,28,0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.2 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(18,19,23,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, S * 0.13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#121317";
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // A ring of steps; the current one is lit and emits.
    const R = S * 0.36;
    uc.steps.forEach((_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R * 0.84;

      const done = i < s;
      const now = i === s;
      const later = i > s;

      // Connector from the core
      ctx.strokeStyle = done
        ? "rgba(18,19,23,0.4)"
        : now
          ? "rgba(255,74,28,0.6)"
          : "rgba(18,19,23,0.08)";
      ctx.lineWidth = now ? 1.4 : 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Node
      ctx.beginPath();
      ctx.arc(x, y, now ? 9 : 6, 0, Math.PI * 2);
      ctx.fillStyle = done
        ? "#121317"
        : now
          ? "#ff4a1c"
          : "rgba(250,248,244,1)";
      ctx.fill();
      ctx.strokeStyle = later ? "rgba(18,19,23,0.18)" : "transparent";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Label
      ctx.fillStyle = now ? "#121317" : "rgba(18,19,23,0.45)";
      ctx.font = "600 8px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(uc.steps[i].toUpperCase(), x, y + (y > cy ? 20 : -14));

      // The active step emits a packet back to the core
      if (now) {
        const u = (t * 0.55) % 1;
        ctx.fillStyle = `rgba(255,74,28,${1 - u * 0.7})`;
        ctx.beginPath();
        ctx.arc(cx + (x - cx) * u, cy + (y - cy) * u, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Progress rule
    ctx.fillStyle = "rgba(18,19,23,0.08)";
    ctx.fillRect(16, h - 20, w - 32, 1);
    ctx.fillStyle = "#ff4a1c";
    ctx.fillRect(16, h - 20, (w - 32) * ((s + 1) / total), 1);
    ctx.fillStyle = "rgba(18,19,23,0.45)";
    ctx.font = "600 8px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillText(
      `${String(s + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")} — ${uc.steps[s].toUpperCase()}`,
      16,
      h - 30
    );
  });

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label={`${uc.role} workflow, step ${step + 1} of ${uc.steps.length}`}
      className="relative aspect-[16/11] w-full"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}