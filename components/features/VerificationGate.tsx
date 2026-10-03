"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-webgl";

const CHECKS = [
  { id: "sources", label: "Every claim traced to a source" },
  { id: "schema", label: "Output matches the requested schema" },
  { id: "invariants", label: "No invariant violated" },
  { id: "replay", label: "Result replays identically" },
];

/**
 * `gate` — Verification. Four assertions must clear before the aperture below
 * opens. Hover, focus or tap the gate to arm it: each assertion flips to acid
 * lime in sequence, then the bar retracts and the run is released. Untouched,
 * it stays shut — which is the point.
 */
export function VerificationGate() {
  // Under reduced motion the gate resolves the moment it is armed. Both the
  // shut state and the resolved state are derived from `armed`, so nothing
  // has to be reset from inside the effect.
  const reduced = useReducedMotion();
  const [armed, setArmed] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!armed || reduced) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 220);
    return () => window.clearInterval(id);
  }, [armed, reduced]);

  const passed = !armed
    ? 0
    : reduced
      ? CHECKS.length
      : Math.min(tick, CHECKS.length);
  const open = passed >= CHECKS.length;

  const arm = () => {
    setTick(0);
    setArmed(true);
  };
  const disarm = () => setArmed(false);

  return (
    <div
      className="relative aspect-[5/4] w-full sm:aspect-[16/11]"
      onPointerEnter={arm}
      onPointerLeave={disarm}
      role="group"
      aria-label="Verification gate: four assertions are checked before the run is released"
    >
      {/* Aperture */}
      <div className="absolute inset-x-[12%] top-[16%] bottom-[16%]">
        <div className="absolute inset-0 border border-ink/15" />
        {/* Retractable bar */}
        <div
          className="absolute inset-x-0 top-0 flex h-3 items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: open ? "translateY(-115%)" : "translateY(0)",
            backgroundColor: "#c8f432",
          }}
        >
          <span className="u-mono text-[8px] text-ink">PASSED</span>
        </div>

        <div className="flex h-full flex-col justify-center gap-0 px-5">
          {CHECKS.map((c, i) => {
            const on = passed > i;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 border-b border-ink/8 py-2.5 last:border-b-0"
              >
                <span
                  className={`grid size-[15px] shrink-0 place-items-center border transition-colors duration-200 ${
                    on ? "border-acid bg-acid" : "border-ink/25"
                  }`}
                  style={{ background: on ? "#c8f432" : undefined }}
                >
                  {on && (
                    <svg viewBox="0 0 12 12" className="size-[9px]" aria-hidden>
                      <path
                        d="M2 6.4 L4.6 9 L10 3"
                        fill="none"
                        stroke="#121317"
                        strokeWidth="1.8"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={`u-mono transition-colors duration-300 ${
                    on ? "text-ink" : "text-ash"
                  }`}
                >
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Release line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-ink/15">
          <div
            className="h-px bg-ink transition-[width] duration-500 ease-out"
            style={{ width: `${(passed / CHECKS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Arm affordance */}
      <button
        type="button"
        data-cursor="EXPLORE"
        onClick={() => (armed ? disarm() : arm())}
        aria-pressed={armed}
        className="u-mono absolute bottom-4 right-4 border border-ink/25 px-3 py-1.5 text-ash transition-colors duration-300 hover:border-ink hover:text-ink"
      >
        {armed ? "DISARM" : "ARM CHECK"}
      </button>
    </div>
  );
}
