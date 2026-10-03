"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { AGENTS } from "@/lib/site";
import { prefersReduced } from "@/lib/motion";
import { AgentGlyph } from "@/components/agents/AgentGlyph";
import { useIsCoarsePointer, useReducedMotion } from "@/lib/use-webgl";

gsap.registerPlugin(Flip);

type Detail = {
  agent: number;
  phase: string;
  inputs: string;
  handsOff: string;
  handoff: string;
};

/**
 * Agent index — not a grid of cards. Nine rows act as a register; hovering or
 * focusing a row slides its tools into view from the right and lifts the row's
 * colour bar. Selecting a row expands an inline dossier beneath it, animated
 * with a FLIP so the row itself morphs into the panel rather than swapping.
 */
export function AgentIndex() {
  const [open, setOpen] = useState<number | null>(0);
  const [hover, setHover] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const coarse = useIsCoarsePointer();

  // Derived during render rather than synced in an effect — the dossier is a
  // pure function of which row is open.
  const detail: Detail | null = (() => {
    if (open === null) return null;
    const agent = AGENTS[open];
    return {
      agent: open,
      phase: agent.role,
      inputs: `${3 + (open % 4)} live systems`,
      handsOff: `${12 + open * 3} min median`,
      handoff: agent.tools[0],
    };
  })();

  // FLIP the expanded panel from the row that opened it.
  useEffect(() => {
    const panel = panelRef.current;
    const row = open === null ? null : rowRefs.current[open];
    if (!panel || !row || prefersReduced()) return;

    const state = Flip.getState(panel, { props: "borderColor,backgroundColor" });
    const raf = requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.7,
        ease: "expo.out",
        scale: true,
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }),
      });
    });
    // Without this the frame can fire after unmount and animate a dead node.
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const toggle = (i: number) => setOpen((cur) => (cur === i ? null : i));

  return (
    <div className="relative">
      {/* Register */}
      <ul className="relative border-t border-ink/12" role="list">
        {AGENTS.map((agent, i) => {
          const isOpen = open === i;
          const isHot = hover === i || isOpen;
          const tools = agent.tools;

          return (
            <li key={agent.id} className="relative border-b border-ink/12">
              {/* Colour bar — rises on hover */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] origin-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  backgroundColor: agent.color,
                  transform: `scaleY(${isHot ? 1 : 0})`,
                }}
              />

              <button
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                type="button"
                data-cursor="EXPLORE"
                aria-expanded={isOpen}
                aria-controls={`agent-panel-${agent.id}`}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                onFocus={() => setHover(i)}
                onBlur={() => setHover((h) => (h === i ? null : h))}
                onClick={() => toggle(i)}
                className="group flex w-full items-center gap-5 py-5 pl-6 pr-4 text-left transition-colors duration-500 md:gap-8 md:py-6 md:pl-8"
                style={{
                  backgroundColor: isHot ? "rgba(18,19,23,0.03)" : "transparent",
                }}
              >
                <span
                  className="u-mono w-8 shrink-0 text-ash transition-colors duration-500"
                  style={isHot ? { color: agent.color } : undefined}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="u-display block text-[clamp(1.35rem,3.2vw,2.4rem)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
                    {agent.name}
                  </span>
                  <span className="u-mono mt-1.5 block text-ash">{agent.role}</span>
                </span>

                {/* Tools revealed on hover — desktop */}
                {!coarse && (
                  <span className="hidden shrink-0 items-center gap-2 lg:flex">
                    {tools.map((tool, k) => (
                      <span
                        key={tool}
                        className="u-mono border px-2.5 py-1 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{
                          color: agent.color,
                          borderColor: agent.color,
                          opacity: isHot ? 0.9 - k * 0.14 : 0,
                          transform: `translateX(${isHot ? 0 : 14 - k * 5}px)`,
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </span>
                )}

                <span
                  aria-hidden
                  className="u-mono shrink-0 text-ash transition-transform duration-500"
                  style={{ transform: `rotate(${isOpen ? 45 : 0}deg)` }}
                >
                  +
                </span>
              </button>

              {/* Mobile / coarse: tools always legible, stacked */}
              {coarse && (
                <ul className="flex flex-wrap gap-1.5 pb-4 pl-[4.5rem] pr-4 md:pl-[5.5rem]">
                  {tools.map((tool) => (
                    <li
                      key={tool}
                      className="u-mono border px-2.5 py-1"
                      style={{ color: agent.color, borderColor: agent.color }}
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              )}

              {/* Dossier */}
              {isOpen && detail && detail.agent === i && (
                <div
                  ref={panelRef}
                  id={`agent-panel-${agent.id}`}
                  className="relative overflow-hidden border-t border-ink/10 bg-ivory"
                >
                  <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
                    {/* Glyph + capability */}
                    <div>
                      <div className="relative mx-auto w-full max-w-[22rem] border border-ink/12 bg-paper">
                        <AgentGlyph index={i} color={agent.color} seed={i} />
                      </div>
                      <p className="mt-5 text-center text-sm leading-relaxed text-graphite md:text-left">
                        {agent.capability}
                      </p>
                    </div>

                    {/* Workflow animation — a per-agent vertical pipeline */}
                    <div>
                      <p className="u-mono text-ash">Workflow</p>
                      <Workflow index={i} color={agent.color} />

                      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-ink/10 pt-5">
                        {[
                          [detail.phase, "Stage"],
                          [detail.handsOff, "Hands-off"],
                          [detail.handoff, "Primary"],
                        ].map(([v, k]) => (
                          <div key={k}>
                            <dt className="u-mono text-ash">{k}</dt>
                            <dd className="u-display mt-1.5 text-lg">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="u-mono mt-6 text-ash">
        {AGENTS.length} agents · select a row to expand its dossier
      </p>
    </div>
  );
}

/**
 * Per-agent workflow animation: a short sequence of stages that advances on a
 * loop, coloured by the agent's own identity. Structure varies by index so the
 * nine pipelines do not read as one component recoloured nine times.
 */
function Workflow({ index, color }: { index: number; color: string }) {
  const steps = 4;
  // Under reduced motion the pipeline is shown fully resolved rather than
  // advanced on a timer, so the initial value is derived from the preference.
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setPhase((p) => (p + 1) % steps),
      620 + index * 55
    );
    return () => window.clearInterval(id);
  }, [index, reduced]);

  const shown = reduced ? steps - 1 : phase;

  const labels = WORKFLOW_LABELS[index] ?? WORKFLOW_LABELS[0];

  return (
    <ol className="mt-3 space-y-1.5" aria-hidden>
      {labels.map((label, i) => {
        const on = i <= shown;
        const current = i === shown;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className="grid size-[14px] shrink-0 place-items-center border transition-colors duration-500"
              style={{
                borderColor: on ? color : "rgba(18,19,23,0.2)",
                backgroundColor: current ? color : "transparent",
              }}
            >
              {on && !current && (
                <span className="size-1" style={{ background: color }} />
              )}
            </span>
            <span
              className="u-mono transition-colors duration-500"
              style={{ color: on ? "#121317" : "#6c7076" }}
            >
              {label}
            </span>
            {/* Connector */}
            {i < labels.length - 1 && (
              <span
                aria-hidden
                className="ml-1 h-px flex-1 transition-colors duration-500"
                style={{ background: i < shown ? color : "rgba(18,19,23,0.12)" }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

const WORKFLOW_LABELS: string[][] = [
  ["Parse intent", "Resolve deps", "Assign owners", "Publish plan"],
  ["Query sources", "Extract claims", "Cross-check", "Cite"],
  ["Open session", "Navigate", "Fill / extract", "Confirm"],
  ["Reproduce", "Trace", "Patch", "Run tests"],
  ["Query warehouse", "Build model", "Validate", "Publish"],
  ["Segment", "Draft", "Personalise", "Send"],
  ["Assert", "Probe", "Find flaw", "Pass / block"],
  ["Retrieve", "Score relevance", "Compress", "Store / prune"],
  ["Detect", "Diagnose", "Repair", "Re-verify"],
];
