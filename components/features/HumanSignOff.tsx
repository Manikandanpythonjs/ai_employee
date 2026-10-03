"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-webgl";

const STEPS = [
  { id: "run", label: "Run autonomously" },
  { id: "hold", label: "Hold at checkpoint" },
  { id: "ask", label: "Ask a human" },
];

const ASK = [
  "412 outbound emails · primary domain",
  "Refund €18,400 to account 8841",
  "Merge PR #2291 into release",
];

type Decision = "approve" | "edit" | "hold" | null;

/**
 * `hitzl` visual — Human-in-the-Loop. A live run log ticks by on its own, then
 * halts at an action the agent will not take alone. Choosing an outcome
 * releases the pipeline and stamps the decision; with no human, the log simply
 * stops at the same place. Nothing is decided implicitly.
 */
export function HumanSignOff() {
  // Under reduced motion the log is presented already escalated, so the initial
  // state is derived from the preference rather than set in an effect.
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(reduced ? STEPS.length - 1 : 0);
  const [decision, setDecision] = useState<Decision>(null);
  const [escalated, setEscalated] = useState(reduced);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (reduced) return;
    timer.current = window.setInterval(() => {
      setStage((s) => {
        if (s < STEPS.length - 1) {
          if (s === STEPS.length - 2) setEscalated(true);
          return s + 1;
        }
        return s;
      });
    }, 1100);
    return () => window.clearInterval(timer.current);
  }, [reduced]);

  const released = decision !== null;

  return (
    <div className="relative aspect-[5/4] w-full sm:aspect-[16/11]">
      {/* Run log */}
      <ol className="absolute inset-x-0 top-0">
        {STEPS.map((s, i) => {
          const on = i <= stage;
          const isAsk = i === STEPS.length - 1;
          return (
            <li
              key={s.id}
              className={`u-mono flex items-center gap-3 border-l py-2 pl-3 transition-colors duration-500 ${
                on ? (isAsk ? "text-signal" : "text-graphite") : "text-ash/50"
              }`}
              style={{ borderColor: on ? (isAsk ? "#ff4a1c" : "#121317") : "rgba(18,19,23,0.14)" }}
            >
              <span
                className={`size-1.5 shrink-0 transition-colors duration-500 ${
                  on ? (isAsk ? "bg-signal" : "bg-ink") : "bg-ink/20"
                }`}
              />
              {s.label}
            </li>
          );
        })}
      </ol>

      {/* Escalation console */}
      <div
        className="absolute inset-x-0 bottom-0 border border-ink/15 bg-paper/70 backdrop-blur-[1px] transition-opacity duration-700"
        style={{ opacity: escalated || released ? 1 : 0.35 }}
      >
        <div className="u-mono flex items-center justify-between gap-3 border-b border-ink/10 px-3 py-1.5">
          <span className={escalated ? "text-signal" : "text-ash"}>
            {released ? "DECISION RECORDED" : escalated ? "REQUIRES HUMAN" : "STANDBY"}
          </span>
          <span className="text-ash">
            {released ? "RELEASED" : escalated ? "T+00:00" : "—"}
          </span>
        </div>

        <div className="px-3 py-2.5">
          <p className="u-mono truncate text-ash">{ASK[stage % ASK.length]}</p>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {(
              [
                { id: "approve", label: "Approve", tone: "bg-acid text-ink" },
                { id: "edit", label: "Edit", tone: "bg-cobalt text-paper" },
                { id: "hold", label: "Hold", tone: "bg-blood text-paper" },
              ] as const
            ).map((o) => (
              <button
                key={o.id}
                type="button"
                data-cursor="MAGNETIC"
                disabled={!escalated || released}
                onClick={() => setDecision(o.id)}
                aria-pressed={decision === o.id}
                className={`u-mono py-2 transition-[background-color,color,opacity] duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${decision === o.id ? o.tone : "bg-ivory text-graphite hover:bg-paper-2"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
