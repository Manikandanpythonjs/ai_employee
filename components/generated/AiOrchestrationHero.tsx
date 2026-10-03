"use client";

import { useEffect, useRef, useState } from "react";

type Agent = {
  id: string;
  label: string;
  /** angle in degrees around the orchestrator, 0 = right, -90 = top */
  angle: number;
};

const AGENTS: Agent[] = [
  { id: "research", label: "Research Agent", angle: -90 },
  { id: "coding", label: "Coding Agent", angle: -38.57 },
  { id: "browser", label: "Browser Agent", angle: 12.86 },
  { id: "data", label: "Data Agent", angle: 64.29 },
  { id: "comms", label: "Communication Agent", angle: 115.71 },
  { id: "planning", label: "Planning Agent", angle: 167.14 },
  { id: "review", label: "Review Agent", angle: 218.57 },
];

const VB_W = 700;
const VB_H = 600;
const CX = 350;
const CY = 300;
const ORBIT = 178;
const NODE_R = 22;
const PAD = 12;

/** mono glyph advance is ~0.6em, plus letter-spacing — good enough to clamp labels */
function estWidth(text: string, fontSize: number, letterSpacing: number) {
  return text.length * (fontSize * 0.62 + letterSpacing);
}

function polar(cx: number, cy: number, radius: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * radius, y: cy + Math.sin(rad) * radius, rad };
}

function arcPath(ax: number, ay: number, bx: number, by: number, bow = 0.14) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const qx = (ax + bx) / 2 + (-dy / len) * len * bow;
  const qy = (ay + by) / 2 + (dx / len) * len * bow;
  return `M ${ax} ${ay} Q ${qx} ${qy} ${bx} ${by}`;
}

const LABEL_FS = 9.5;
const LABEL_LS = 1.33;
const SUB_FS = 7.5;
const SUB_LS = 0.75;

function AgentGlyph({ id }: { id: string }) {
  switch (id) {
    case "research":
      return (
        <>
          <circle cx="0" cy="-6" r="4.2" />
          <path d="M -7 7 L 0 -1 L 7 7" />
        </>
      );
    case "coding":
      return (
        <>
          <path d="M -6 -5 L -11 0 L -6 5" />
          <path d="M 6 -5 L 11 0 L 6 5" />
          <path d="M 2 -6 L -2 6" />
        </>
      );
    case "browser":
      return (
        <>
          <rect x="-9" y="-8" width="18" height="16" rx="2.5" />
          <path d="M -9 -3 H 9" />
          <circle cx="-5.6" cy="-5.6" r="0.9" />
        </>
      );
    case "data":
      return (
        <>
          <ellipse cx="0" cy="-5" rx="7" ry="3" />
          <path d="M -7 -5 V 5 A 7 3 0 0 0 7 5 V -5" />
          <path d="M -7 0 A 7 3 0 0 0 7 0" />
        </>
      );
    case "comms":
      return (
        <path d="M -8 -6 h16 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-9 l-5 4 v-4 h-2 a2 2 0 0 1 -2 -2 v-8 a2 2 0 0 1 2 -2 z" />
      );
    case "planning":
      return (
        <>
          <rect x="-8" y="-8" width="16" height="16" rx="2" />
          <path d="M -8 -3.5 H 8 M -3.5 -8 V 8" />
        </>
      );
    default:
      return <path d="M -7 0 l4.5 4.5 L 7 -5.5" />;
  }
}

export default function AiOrchestrationHero({
  className = "",
}: {
  className?: string;
}) {
  const [activeIds, setActiveIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "dispatch" | "collect">("idle");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef(true);

  // Off screen this plate held an 8.2s dispatch cycle that kept queueing React
  // updates for an SVG nobody could see. Gated on visibility like the other
  // generated plates.
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([e]) => {
        liveRef.current = e.isIntersecting;
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const pick = () => {
      if (!liveRef.current) return;
      const count = 3 + Math.floor(Math.random() * 3);
      const shuffled = [...AGENTS].sort(() => Math.random() - 0.5);
      setActiveIds(shuffled.slice(0, count).map((a) => a.id));
      setPhase("dispatch");
      timeouts.push(setTimeout(() => setPhase("collect"), 2200));
      timeouts.push(
        setTimeout(() => {
          setPhase("idle");
          setActiveIds([]);
        }, 5200),
      );
    };
    timer.current = setInterval(pick, 8200);
    const initial = setTimeout(pick, 900);
    return () => {
      if (timer.current) clearInterval(timer.current);
      clearTimeout(initial);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={hostRef} className={`orch-wrap relative w-full overflow-hidden ${className}`}>
      <style>{`
        .orch-wrap { container-type: inline-size; }

        .orch-grid path { stroke: rgba(148,163,184,0.09); stroke-width: 1; }
        .orch-agent-glass { fill: url(#glassFill); stroke: rgba(226,232,240,0.16); stroke-width: 1; }
        .orch-label {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: ${LABEL_FS}px; letter-spacing: 0.14em; fill: #cbd5e1;
        }
        .orch-sub {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: ${SUB_FS}px; letter-spacing: 0.1em; fill: #64748b;
        }
        .orch-center-label {
          font-family: var(--font-geist-mono), ui-monospace, monospace;
          font-size: 10px; letter-spacing: 0.16em; fill: #e2e8f0;
        }

        @keyframes orch-breathe {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.035); }
        }
        .orch-core-glow { animation: orch-breathe 5.5s ease-in-out infinite; }

        @keyframes orch-ring-spin { to { transform: rotate(360deg); } }
        .orch-spin, .orch-core-glow {
          transform-box: view-box; transform-origin: 50% 50%;
        }
        .orch-ring     { animation: orch-ring-spin 26s linear infinite; }
        .orch-ring-rev { animation: orch-ring-spin 38s linear infinite reverse; }

        @keyframes orch-dash-flow { to { stroke-dashoffset: -400; } }
        @keyframes orch-propagate { from { stroke-dashoffset: 0; opacity: 0.95; } to { stroke-dashoffset: -330; opacity: 0; } }
        @keyframes orch-pulse-ring { 0% { r: 26; opacity: 0.7; } 100% { r: 48; opacity: 0; } }
        @keyframes orch-scan { 0% { transform: translateX(0); } 100% { transform: translateX(${VB_W}px); } }

        .orch-flow { stroke-dasharray: 5 10; opacity: 0; animation: orch-dash-flow 4.5s linear infinite; }
        .orch-flow.is-on { opacity: 0.95; }
        .orch-pulse { animation: orch-pulse-ring 2.2s ease-out infinite; }
        .orch-prop  { animation: orch-propagate 1.5s ease-out forwards; }
        .orch-scanline { animation: orch-scan 9s linear infinite; }

        /* keep names legible, drop the secondary status line on narrow cards */
        @container (max-width: 430px) {
          .orch-sub { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .orch-core-glow, .orch-ring, .orch-ring-rev,
          .orch-flow, .orch-pulse, .orch-prop, .orch-scanline { animation: none; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full"
        role="img"
        aria-label="AI Orchestrator coordinating a team of AI employee agents"
      >
        <defs>
          <radialGradient id="coreWash" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#0f1b2d" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#050a12" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="glassFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0b1220" stopOpacity="0.55" />
          </linearGradient>

          <linearGradient id="flowStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>

          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="tinyGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="frameClip">
            <rect x="0" y="0" width={VB_W} height={VB_H} rx="20" />
          </clipPath>

          <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.4" cy="1.4" r="1.1" fill="rgba(148,163,184,0.13)" />
          </pattern>
        </defs>

        {/* background */}
        <g clipPath="url(#frameClip)">
          <rect x="0" y="0" width={VB_W} height={VB_H} fill="#05080e" />
          <rect x="0" y="0" width={VB_W} height={VB_H} fill="url(#dots)" />

          <g className="orch-grid">
            <path
              d={Array.from({ length: Math.floor(VB_H / 46) }, (_, i) => `M 0 ${(i + 1) * 46} H ${VB_W}`).join(" ")}
            />
            <path
              d={Array.from({ length: Math.floor(VB_W / 46) }, (_, i) => `M ${(i + 1) * 46} 0 V ${VB_H}`).join(" ")}
            />
          </g>

          <ellipse cx={CX} cy={CY} rx="250" ry="215" fill="url(#coreWash)" />

          <rect
            className="orch-scanline"
            x="-46"
            y="0"
            width="46"
            height={VB_H}
            fill="url(#scanGrad)"
            opacity="0.16"
          />
        </g>

        <rect
          x="0.5"
          y="0.5"
          width={VB_W - 1}
          height={VB_H - 1}
          rx="20"
          fill="none"
          stroke="rgba(148,163,184,0.14)"
          strokeWidth="1"
        />

        {/* connections */}
        <g>
          {AGENTS.map((a) => {
            const p = polar(CX, CY, ORBIT, a.angle);
            const d = arcPath(CX, CY, p.x, p.y);
            const on = activeIds.includes(a.id);
            return (
              <g key={a.id}>
                <path d={d} fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="1" strokeLinecap="round" />
                <path
                  d={d}
                  fill="none"
                  stroke="url(#flowStroke)"
                  strokeWidth={on ? 1.6 : 1}
                  strokeLinecap="round"
                  className={`orch-flow ${on ? "is-on" : ""}`}
                  filter={on ? "url(#tinyGlow)" : undefined}
                />
                {on && phase === "dispatch" && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#softGlow)"
                    className="orch-prop"
                    style={{ strokeDasharray: "14 900" }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* orchestrator */}
        <g>
          <g className="orch-ring orch-spin" opacity="0.55">
            <ellipse cx={CX} cy={CY} rx="92" ry="92" fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="0.9" strokeDasharray="2 12" />
            <circle cx={CX + 92} cy={CY} r="2.2" fill="#38bdf8" filter="url(#tinyGlow)" />
          </g>
          <g className="orch-ring-rev orch-spin" opacity="0.5">
            <ellipse cx={CX} cy={CY} rx="118" ry="118" fill="none" stroke="rgba(129,140,248,0.24)" strokeWidth="0.9" strokeDasharray="26 40 4 40" />
            <circle cx={CX - 118} cy={CY} r="1.8" fill="#818cf8" filter="url(#tinyGlow)" />
          </g>

          <circle className="orch-core-glow" cx={CX} cy={CY} r="58" fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth="1.2" filter="url(#softGlow)" />

          <circle cx={CX} cy={CY} r="38" fill="url(#glassFill)" stroke="rgba(125,211,252,0.4)" strokeWidth="1.2" />
          <circle cx={CX} cy={CY} r="27" fill="none" stroke="rgba(148,197,255,0.22)" strokeWidth="1" />

          <g stroke="#7dd3fc" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.9">
            <path d={`M ${CX - 11} ${CY - 3} A 11 11 0 0 1 ${CX + 11} ${CY - 3}`} />
            <path d={`M ${CX - 11} ${CY + 5} A 11 11 0 0 0 ${CX + 11} ${CY + 5}`} opacity="0.6" />
            <circle cx={CX} cy={CY + 1} r="1.8" fill="#e0f2fe" stroke="none" />
          </g>

          <text x={CX} y={CY + 66} textAnchor="middle" className="orch-center-label">
            ORCHESTRATOR
          </text>
        </g>

        {/* agents */}
        <g>
          {AGENTS.map((a, i) => {
            const p = polar(CX, CY, ORBIT, a.angle);
            const on = activeIds.includes(a.id);

            const rad = p.rad;
            const cosA = Math.cos(rad);
            const sinA = Math.sin(rad);
            const horizontal = Math.abs(cosA) >= 0.55;

            const labelX = horizontal ? p.x + cosA * 40 : p.x;
            const labelY = horizontal ? p.y + 5 : p.y + sinA * 46;

            let anchor: "start" | "middle" | "end" = "middle";
            if (horizontal) anchor = cosA > 0 ? "start" : "end";

            const name = a.label.toUpperCase();
            const wName = estWidth(name, LABEL_FS, LABEL_LS);
            const wSub = estWidth("IDLE · READY", SUB_FS, SUB_LS);

            let tx = labelX;
            if (anchor === "start") tx = Math.min(tx, VB_W - PAD - Math.max(wName, wSub));
            else if (anchor === "end") tx = Math.max(tx, PAD + Math.max(wName, wSub));
            else tx = Math.min(Math.max(tx, PAD + wName / 2), VB_W - PAD - wName / 2);

            const nameY = labelY - 6;
            const subY = labelY + 8;

            return (
              <g key={a.id}>
                {on && (
                  <circle
                    className="orch-pulse"
                    cx={p.x}
                    cy={p.y}
                    r="26"
                    fill="none"
                    stroke="#7dd3fc"
                    strokeWidth="1.4"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                )}

                <circle className="orch-agent-glass" cx={p.x} cy={p.y} r={NODE_R} />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={NODE_R}
                  fill="none"
                  stroke={on ? "#7dd3fc" : "rgba(148,163,184,0.28)"}
                  strokeWidth="1.2"
                  opacity={on ? 0.95 : 1}
                />

                <g
                  transform={`translate(${p.x} ${p.y})`}
                  fill="none"
                  stroke={on ? "#e0f2fe" : "#94a3b8"}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <AgentGlyph id={a.id} />
                </g>

                <text x={tx} y={nameY} textAnchor={anchor} className="orch-label">
                  {name}
                </text>
                <text x={tx} y={subY} textAnchor={anchor} className="orch-sub">
                  {on ? (phase === "dispatch" ? "WORKING" : "REPORTING") : "IDLE · READY"}
                </text>

                <circle
                  cx={p.x + 16}
                  cy={p.y - 16}
                  r="2.6"
                  fill={on ? "#34d399" : "rgba(100,116,139,0.6)"}
                  filter={on ? "url(#tinyGlow)" : undefined}
                >
                  {on && (
                    <animate attributeName="opacity" values="1;0.25;1" dur="1.6s" repeatCount="indefinite" />
                  )}
                </circle>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
