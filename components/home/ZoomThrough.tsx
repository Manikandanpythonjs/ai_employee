"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { invLerp } from "@/lib/scroll-signal";
import { useReducedMotion } from "@/lib/use-webgl";

const STAGES = [
  { label: "AI Employee", depth: "00" },
  { label: "Agent", depth: "01" },
  { label: "Tool", depth: "02" },
  { label: "Data", depth: "03" },
  { label: "Signal", depth: "04" },
];

/**
 * Zoom-through. A tiny node in the centre of the frame grows until it fills
 * the viewport; the parallax rings behind it part at different rates, so the
 * descent reads as depth rather than a simple scale-up. The scale is mapped to
 * the stage list so the copy stays legible at every altitude.
 */
export function ZoomThrough() {
  const rootRef = useRef<HTMLElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  // Reduced motion lands on the final altitude rather than zooming to it.
  const reduced = useReducedMotion();
  const [scrolledStage, setScrolledStage] = useState(0);
  const stage = reduced ? STAGES.length - 1 : scrolledStage;

  useEffect(() => {
    const root = rootRef.current;
    const core = coreRef.current;
    if (!root || !core || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const p = self.progress;

          // The core starts as an 8px node and grows until it fills the frame,
          // then dissolves. The previous 2^(p*11) reached ~2048x, which turned a
          // single 8px dot into a 16,000px flat disc that covered the entire
          // viewport for most of the scroll — the section read as a blank
          // screen. It now stops just past filling and fades out instead.
          const MAX_SCALE = 130;
          const t = Math.min(1, p / 0.72);
          const scale = Math.pow(2, t * 7.2) * 8;
          const grown = Math.min(scale, MAX_SCALE);
          core.style.transform = `translate(-50%, -50%) scale(${grown})`;
          // Dissolve once the node is close enough to read as "passed through".
          const fade = 1 - Math.max(0, Math.min(1, (p - 0.55) / 0.25));
          core.style.opacity = String(fade);

          const layers = core.parentElement!.querySelectorAll<HTMLElement>(
            "[data-depth-ring]"
          );
          layers.forEach((el) => {
            const k = Number(el.dataset.depthRing);
            // Rings expand slower than the core, so they appear to fall away.
            const s = grown * (1 - k * 0.09);
            el.style.transform = `translate(-50%, -50%) scale(${Math.min(s, 40)})`;
            el.style.opacity = String(
              Math.max(0, Math.min(0.5, 0.4 - p * 0.35 + k * 0.12))
            );
          });

          const s = Math.min(
            STAGES.length - 1,
            Math.floor(invLerp(0.06, 0.92, p) * STAGES.length)
          );
          setScrolledStage(s);
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const current = STAGES[stage];

  return (
    <section
      ref={rootRef}
      aria-label="From employee to signal"
      className="relative h-[260vh] w-full bg-ink text-paper"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Parallax rings */}
        <div className="absolute inset-0 grid place-items-center">
          {[3, 2, 1, 0].map((k) => (
            <div
              key={k}
              data-depth-ring={k}
              className="absolute left-1/2 top-1/2 aspect-square w-[min(70vh,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/20"
              style={{ willChange: "transform" }}
            />
          ))}
        </div>

        {/* The core */}
        <div
          ref={coreRef}
          className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
          style={{ willChange: "transform" }}
        />

        {/* Altitude readout */}
        <div className="u-shell relative z-10 flex h-full flex-col justify-between py-24 md:py-28">
          <div className="flex items-start justify-between">
            <span className="u-mono text-paper/50">
              <span className="text-signal">▸</span> Chapter 11 / Outcome
            </span>
            <span className="u-mono text-paper/50">{current.depth} / 04</span>
          </div>

          <div className="max-w-3xl">
            <h2 className="u-display text-[clamp(2.6rem,9vw,8rem)]">
              {STAGES.map((s, i) => (
                <span
                  key={s.label}
                  className={`block transition-all duration-700 ${i === stage
                      ? "text-paper"
                      : "text-paper/20"
                    }`}
                >
                  {s.label}
                </span>
              ))}
            </h2>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-paper/55">
              One system, examined at every scale. A workforce is not a bigger
              agent — it is the same intelligence observed from further out.
            </p>
          </div>

          {/* Depth scale */}
          <div className="u-mono flex items-center gap-4 text-paper/50">
            <span className="h-px flex-1 bg-paper/20">
              <span
                className="block h-px bg-signal transition-[width] duration-300"
                style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
              />
            </span>
            <span>Descending</span>
          </div>
        </div>
      </div>
    </section>
  );
}