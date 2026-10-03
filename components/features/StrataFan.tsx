"use client";

import { useRef, useState } from "react";

const LAYERS = [
  { n: "04", label: "Run history", weight: 0 },
  { n: "03", label: "Outcome log", weight: 1 },
  { n: "02", label: "Preferences", weight: 2 },
  { n: "01", label: "Core context", weight: 3 },
];

/**
 * `stack` — Memory. Four context strata rendered as offset sheets. Hovering (or
 * focusing) a sheet fans the whole pile apart, exposing the label on each —
 * the stack is compacted memory, the fan is recall.
 */
export function StrataFan() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={wrapRef}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
      className="relative aspect-[5/4] w-full sm:aspect-[16/11]"
      role="group"
    >
      {/* Backing rule */}
      <span aria-hidden className="absolute left-6 top-1/2 h-px w-[70%] bg-ink/10" />

      <ul className="absolute inset-0">
        {LAYERS.map((l, i) => {
          const lift = (3 - i) * (open ? 26 : 9);
          const x = open ? i * 7 : 0;
          const rotate = open ? (i - 1.5) * 1.1 : 0;
          return (
            <li
              key={l.n}
              className="absolute inset-x-0 transition-[transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                top: `${lift + 12}%`,
                transform: `translateX(${x}%) rotate(${rotate}deg)`,
                zIndex: LAYERS.length - i,
              }}
            >
              <div
                tabIndex={0}
                data-cursor="EXPLORE"
                aria-label={`Memory stratum ${l.n}: ${l.label}`}
                className="group mx-auto flex w-[72%] items-center justify-between gap-4 border border-ink/15 bg-ivory px-5 py-4 outline-none transition-colors duration-500 hover:border-ink/45 focus-visible:border-ink"
                style={{ boxShadow: "0 18px 40px -34px rgba(18,19,23,0.8)" }}
              >
                <span className="u-display text-3xl transition-colors duration-500 group-hover:text-signal">
                  {l.n}
                </span>
                <span className="u-mono text-right text-ash transition-colors duration-500 group-hover:text-ink">
                  {l.label}
                </span>
                {/* Sheet thickness */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-ink/10" />
              </div>
            </li>
          );
        })}
      </ul>

      {/* Compaction meter */}
      <span className="u-mono absolute bottom-4 left-1/2 -translate-x-1/2 text-ash">
        {open ? "RECALLING" : "COMPACTED"}
      </span>
    </div>
  );
}
