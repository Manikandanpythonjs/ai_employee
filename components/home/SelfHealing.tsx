"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HEAL_CHAIN } from "@/lib/site";
import { clamp, invLerp, px } from "@/lib/scroll-signal";
import { useReducedMotion } from "@/lib/use-webgl";

const SHARDS = 24;

/**
 * Self-healing — a pinned scene where an execution graph visibly breaks, holds,
 * then reconstructs itself: diagnose → replan → repair → retry → verify →
 * continue. Every fragment displacement is authored (each shard travels along
 * its own radial axis), so this reads as engineering, not as noise.
 *
 * All state is derived from a single scrubbed progress value, which keeps the
 * scene correct when the user scrolls back up.
 */
export function SelfHealing() {
  const rootRef = useRef<HTMLElement>(null);
  const shardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scatterRef = useRef(0);
  // Reduced motion shows the repaired end-state directly, so both pieces of
  // state are derived from the preference instead of set in an effect.
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [scrolledStep, setScrolledStep] = useState(-1);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const onUpdate = (self: ScrollTrigger) => {
      const p = self.progress;

      // Authored phases:
      // 0.00–0.24  nominal execution
      // 0.24–0.36  break (scatter out), hold on the error
      // 0.36–0.44  detect
      // 0.44–0.86  repair, chain advances, shards return
      // 0.86–1.00  nominal again
      let s: number;
      if (p < 0.24) s = 0;
      else if (p < 0.36) s = invLerp(0.24, 0.33, p);
      else if (p < 0.46) s = 1;
      else s = 1 - invLerp(0.5, 0.86, p);

      scatterRef.current = s;
      setProgress(s);

      if (p < 0.36) setScrolledStep(-1);
      else if (p < 0.86)
        setScrolledStep(
          Math.min(
            HEAL_CHAIN.length - 1,
            Math.floor(invLerp(0.44, 0.86, p) * HEAL_CHAIN.length)
          )
        );
      else setScrolledStep(HEAL_CHAIN.length - 1);
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate,
    });

    onUpdate(st);

    return () => st.kill();
  }, [reduced]);

  // Under reduced motion the graph is shown intact and fully repaired.
  const scatter = reduced ? 0 : progress;
  const step = reduced ? HEAL_CHAIN.length - 1 : scrolledStep;

  // Shards are driven imperatively — 24 style writes per frame is fine, but
  // going through React state for each would not be. The loop is skipped
  // entirely under reduced motion, where the shards stay at rest.
  useEffect(() => {
    if (reduced) return;

    let raf = 0;
    let visible = false;
    const root = rootRef.current;
    // 24 shards, two style writes each, every frame. Worth running while the
    // 300vh section is anywhere near the viewport, and worth nothing outside it.
    const io = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      { rootMargin: "200px" }
    );
    if (root) io.observe(root);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const s = scatterRef.current;
      for (let i = 0; i < SHARDS; i++) {
        const el = shardRefs.current[i];
        if (!el) continue;
        // Slight per-shard lag so the break travels outward like a wave.
        const lag = (i % 6) * 0.035;
        const local = clamp((s - lag) / (1 - lag || 1));
        el.style.transform = `rotate(var(--a)) translate3d(calc(var(--sx) * ${local}px), calc(var(--sy) * ${local}px), 0)`;
        el.style.opacity = String(1 - local * 0.35);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const broken = scatter > 0.55;
  const healing = step >= 0 && !broken;

  return (
    <section
      ref={rootRef}
      id="recovery"
      aria-label="Self-healing"
      className="relative h-[300vh] w-full bg-ink text-paper"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div aria-hidden className="u-grid-lines absolute inset-0 opacity-[0.08]" />

        <div className="u-shell relative grid items-center gap-12 py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          {/* The breaking structure */}
          <div className="relative flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[min(62vh,30rem)]">
              <svg aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full">
                {[92, 74, 56, 38].map((r) => (
                  <circle
                    key={r}
                    cx="100"
                    cy="100"
                    r={r}
                    fill="none"
                    stroke="rgba(242,238,231,0.13)"
                    strokeWidth="0.4"
                  />
                ))}
              </svg>

              {/* Shards: each travels outward along its own radius. */}
              {Array.from({ length: SHARDS }, (_, i) => {
                const angle = (i / SHARDS) * Math.PI * 2;
                const inner = 36;
                const outer = 94;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      shardRefs.current[i] = el;
                    }}
                    className="absolute"
                    style={
                      {
                        left: `${px(100 + Math.cos(angle) * inner)}%`,
                        top: `${px(100 + Math.sin(angle) * inner)}%`,
                        width: `${px(outer - inner)}%`,
                        height: "2px",
                        "--a": `${px((angle * 180) / Math.PI)}deg`,
                        "--sx": `${px(Math.cos(angle) * 150)}`,
                        "--sy": `${px(Math.sin(angle) * 150)}`,
                        backgroundColor:
                          broken
                            ? "#d81e31"
                            : i % 5 === 0
                              ? "#ff4a1c"
                              : "rgba(242,238,231,0.5)",
                      } as React.CSSProperties
                    }
                  />
                );
              })}

              {/* Core */}
              <div
                className={`absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-300 ${
                  broken
                    ? "border-blood bg-blood/25"
                    : healing
                      ? "border-acid bg-acid/20"
                      : "border-signal bg-signal/15"
                }`}
              >
                <span className="absolute inset-0 animate-ping rounded-full border border-current opacity-25" />
              </div>
            </div>

            {/* Status chip */}
            <div className="mt-8">
              <span
                className={`u-mono inline-flex items-center gap-2 border px-3 py-1.5 transition-colors duration-300 ${
                  broken
                    ? "u-blink border-blood text-blood"
                    : healing
                      ? "border-acid/60 text-acid"
                      : "border-paper/25 text-paper/50"
                }`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {broken
                  ? "ERROR · BROWSER_TOOL_TIMEOUT"
                  : healing
                    ? "REPAIRING"
                    : "NOMINAL"}
              </span>
            </div>
          </div>

          {/* The repair chain */}
          <div>
            <p className="u-mono mb-6 text-paper/50">
              <span className="text-signal">▸</span> Chapter 07 / Recovery
            </p>
            <h2 className="u-display text-[clamp(2.4rem,6.4vw,5.4rem)]">
              Failure
              <br />
              isn&rsquo;t the
              <br />
              <span className="u-serif text-signal">end.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/60">
              A tool times out. Most systems stop and report. An AI employee
              treats failure as information: it diagnoses the cause, rewrites the
              plan, retries the step, and re-verifies before carrying on.
            </p>

            <ol className="mt-10">
              {HEAL_CHAIN.map((h, i) => {
                const on = step >= i;
                return (
                  <li
                    key={h.id}
                    className="flex items-center gap-4 border-l py-2.5 pl-4 transition-colors duration-500"
                    style={{
                      borderColor: on
                        ? "#c8f432"
                        : "rgba(242,238,231,0.14)",
                    }}
                  >
                    <span
                      className={`u-mono w-5 text-[9px] transition-colors duration-500 ${
                        on ? "text-acid" : "text-paper/25"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`u-mono transition-colors duration-500 ${
                        on ? "text-paper" : "text-paper/30"
                      }`}
                    >
                      {h.label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <p className="u-mono mt-8 h-5 text-acid">
              {broken
                ? "Halting dependent steps"
                : healing
                  ? "Reconstructing pipeline"
                  : "Workflow continued · 0 steps lost"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}