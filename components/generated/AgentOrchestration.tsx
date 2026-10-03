"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

const AGENTS = [
  { name: "Research", color: "#2F5BFF", icon: "search", statusKey: 0 },
  { name: "Coding", color: "#7A4DFF", icon: "code", statusKey: 1 },
  { name: "Browser", color: "#0891B2", icon: "globe", statusKey: 2 },
  { name: "Data", color: "#E27D14", icon: "bar", statusKey: 3 },
  { name: "Communication", color: "#DB3F6E", icon: "chat", statusKey: 4 },
  { name: "Planning", color: "#16A37A", icon: "plan", statusKey: 5 },
] as const;

function AgentIcon({ type }: { type: string }) {
  switch (type) {
    case "search":
      return (
        <g fill="none" stroke="var(--agent-color)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle r="6" />
          <path d="M2.5 2.5L8 8" />
        </g>
      );
    case "code":
      return (
        <g fill="none" stroke="var(--agent-color)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-4-5L-9 0L-4 5M4-5L9 0L4 5M2-6L-2 6" />
        </g>
      );
    case "globe":
      return (
        <g fill="none" stroke="var(--agent-color)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle r="9" />
          <ellipse rx="4" ry="9" />
          <path d="M-9 0H9" />
        </g>
      );
    case "bar":
      return (
        <g fill="none" stroke="var(--agent-color)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-6 6V-2M0 6V-8M6 6V2" />
        </g>
      );
    case "chat":
      return (
        <g fill="none" stroke="var(--agent-color)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-9-7H9V5H-1L-6 9V5H-9Z" />
        </g>
      );
    case "plan":
      return (
        <g fill="none" stroke="var(--agent-color)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="-6" cy="-6" r="2.5" />
          <circle cx="6" cy="0" r="2.5" />
          <circle cx="-6" cy="6" r="2.5" />
          <path d="M-4-5L4-1M-4 5L4 1" />
        </g>
      );
    default:
      return null;
  }
}

export default function AgentOrchestration({
  className = "",
}: {
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  /* Read after mount, not during the first render: localStorage does not exist
     on the server, and reading it in the initial state would make the server
     markup and the client markup disagree. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const stored = localStorage.getItem("orch-theme") as Theme | null;
      setTheme(stored === "dark" ? "dark" : "light");
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const applyTheme = useCallback((t: Theme, save: boolean) => {
    setTheme(t);
    if (save) localStorage.setItem("orch-theme", t);
  }, []);

  const isDark = theme === "dark";
  const TRACK_W = 350;
  const CONTAINER_W = 1040;
  const AGENT_X = 520;
  const AGENT_W = 440;
  const FIRST_Y = 72;
  const ROW_H = 100;
  const ORCH_X = 170;
  const ORCH_Y = 360;

  return (
    <div
      className={`ao-wrap relative w-full ${className}`}
      data-theme={theme}
      style={{ fontFamily: "Manrope, 'Segoe UI', system-ui, sans-serif" }}
    >
      <style>{`
        /* Scoped to this component. The original declared these on \`:root\`,
           which is global: \`--line\` would have overwritten the site's own
           \`--line\` token (globals.css) and every hairline rule in the
           document would have changed colour. Prefixing with \`ao-\` keeps the
           cascade inside this subtree. */
        .ao-wrap {
          --bg: #EEF1F8; --dot: #C3CAE0; --card: #FFFFFF; --line: #D3D9EA;
          --ink: #11162B; --mut: #6A7392; --trk: #E4E8F4; --acc: #2F5BFF;
          --sh: #1B2550; --shop: 0.12;
          background: var(--bg); transition: background 0.35s;
        }
        .ao-wrap[data-theme="dark"] {
          --bg: #0A0E1B; --dot: #27304F; --card: #141A2E; --line: #2A3454;
          --ink: #EBEEFF; --mut: #8D97BD; --trk: #222B47; --acc: #7D96FF;
          --sh: #000000; --shop: 0.45;
        }
        .ao-svg { width: 100%; max-width: 1100px; height: auto; display: block; }

        .card { fill: var(--card); stroke: var(--line); }
        .sh { fill: var(--card); filter: url(#ao-sh); }
        .nm { font-size: 14.5px; font-weight: 700; fill: var(--ink); }
        .tx { font-size: 12px; font-weight: 500; fill: var(--mut); }
        .ct { font-size: 11px; font-weight: 600; fill: var(--mut); text-anchor: middle; }
        .chq { fill: var(--trk); }
        .trk { fill: var(--trk); }
        .dt { fill: var(--trk); stroke: var(--line); }
        .tile { fill: var(--agent-color); fill-opacity: 0.13; }
        .ic { fill: none; stroke: var(--agent-color); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
        .flow { fill: none; stroke: var(--line); stroke-width: 1.4; }

        .prog {
          fill: none; stroke-width: 1.8; stroke-dasharray: 1; stroke-dashoffset: 1;
          opacity: 0; animation-duration: 16s; animation-iteration-count: infinite;
          animation-timing-function: linear; animation-fill-mode: both;
        }
        .glow, .lit, .cq, .bar, .hl { animation-duration: 16s; animation-iteration-count: infinite; animation-timing-function: linear; }
        .glow { fill: none; stroke: var(--agent-color); stroke-width: 1.6; opacity: 0; }
        .lit, .cq { opacity: 0; }
        .cq:first-child { opacity: 1; }
        .bar { transform-origin: left; transform-box: fill-box; transform: scaleX(0); }

        .pd { animation: ao-pd 1.4s ease-in-out infinite; }
        .core, .breath, .rg, .bu { transform-box: fill-box; transform-origin: center; }
        .breath { animation: ao-br 7s ease-in-out infinite alternate; }
        .core { animation: ao-cb 7s ease-in-out infinite alternate; }
        .rg { animation: ao-rot 36s linear infinite; }
        .rg2 { animation: ao-rot 60s linear infinite reverse; }
        .bu { opacity: 0; animation: ao-bu 16s linear infinite; }
        .hn { font-size: 12px; font-weight: 700; fill: var(--ink); text-anchor: middle; }
        .st { font-size: 11.5px; font-weight: 500; fill: var(--mut); }

        @keyframes ao-pd { 50% { opacity: 0.25; } }
        @keyframes ao-rot { to { transform: rotate(360deg); } }
        @keyframes ao-br { from { transform: scale(0.92); opacity: 0.6; } to { transform: scale(1.08); opacity: 1; } }
        @keyframes ao-cb { to { transform: scale(1.025); } }
        @keyframes ao-bu {
          0% { transform: scale(1); opacity: 0; }
          6.25% { transform: scale(1); opacity: 0.55; }
          16.25% { transform: scale(1.8); opacity: 0; }
          16.31% { transform: scale(1); opacity: 0; }
          60.94% { transform: scale(1); opacity: 0.55; }
          70.94% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }

        /* ---- agent 0 (Research, blue) ---- */
        @keyframes ao-q0 { 0% { opacity: 1; } 13.06% { opacity: 1; } 14.69% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-r0 { 0% { opacity: 0; } 13.12% { opacity: 0; } 14.69% { opacity: 1; } 31.87% { opacity: 1; } 33.44% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-d0 { 0% { opacity: 0; } 31.87% { opacity: 0; } 33.75% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-p0 { 0% { transform: scaleX(0); opacity: 1; } 13.12% { transform: scaleX(0); opacity: 1; } 31.87% { transform: scaleX(1); opacity: 1; } 95% { transform: scaleX(1); opacity: 1; } 98.75% { transform: scaleX(1); opacity: 0; } 100% { transform: scaleX(0); opacity: 0; } }
        @keyframes ao-s0 { 0% { opacity: 0; } 37.5% { opacity: 0; } 39.38% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-w0 { 0% { stroke-dashoffset: 1; opacity: 1; } 7.5% { stroke-dashoffset: 1; opacity: 1; } 13.12% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* ---- agent 1 (Coding, purple) ---- */
        @keyframes ao-q1 { 0% { opacity: 1; } 14.63% { opacity: 1; } 16.25% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-r1 { 0% { opacity: 0; } 14.69% { opacity: 0; } 16.25% { opacity: 1; } 55.31% { opacity: 1; } 56.88% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-d1 { 0% { opacity: 0; } 55.31% { opacity: 0; } 57.19% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-p1 { 0% { transform: scaleX(0); opacity: 1; } 14.69% { transform: scaleX(0); opacity: 1; } 55.31% { transform: scaleX(1); opacity: 1; } 95% { transform: scaleX(1); opacity: 1; } 98.75% { transform: scaleX(1); opacity: 0; } 100% { transform: scaleX(0); opacity: 0; } }
        @keyframes ao-s1 { 0% { opacity: 0; } 60.94% { opacity: 0; } 62.81% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-w1 { 0% { stroke-dashoffset: 1; opacity: 1; } 9.06% { stroke-dashoffset: 1; opacity: 1; } 14.69% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* ---- agent 2 (Browser, cyan) ---- */
        @keyframes ao-q2 { 0% { opacity: 1; } 16.19% { opacity: 1; } 17.81% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-r2 { 0% { opacity: 0; } 16.25% { opacity: 0; } 17.81% { opacity: 1; } 41.25% { opacity: 1; } 42.81% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-d2 { 0% { opacity: 0; } 41.25% { opacity: 0; } 43.12% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-p2 { 0% { transform: scaleX(0); opacity: 1; } 16.25% { transform: scaleX(0); opacity: 1; } 41.25% { transform: scaleX(1); opacity: 1; } 95% { transform: scaleX(1); opacity: 1; } 98.75% { transform: scaleX(1); opacity: 0; } 100% { transform: scaleX(0); opacity: 0; } }
        @keyframes ao-s2 { 0% { opacity: 0; } 46.88% { opacity: 0; } 48.75% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-w2 { 0% { stroke-dashoffset: 1; opacity: 1; } 10.62% { stroke-dashoffset: 1; opacity: 1; } 16.25% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* ---- agent 3 (Data, orange) ---- */
        @keyframes ao-q3 { 0% { opacity: 1; } 17.75% { opacity: 1; } 19.38% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-r3 { 0% { opacity: 0; } 17.81% { opacity: 0; } 19.38% { opacity: 1; } 50.31% { opacity: 1; } 51.88% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-d3 { 0% { opacity: 0; } 50.31% { opacity: 0; } 52.19% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-p3 { 0% { transform: scaleX(0); opacity: 1; } 17.81% { transform: scaleX(0); opacity: 1; } 50.31% { transform: scaleX(1); opacity: 1; } 95% { transform: scaleX(1); opacity: 1; } 98.75% { transform: scaleX(1); opacity: 0; } 100% { transform: scaleX(0); opacity: 0; } }
        @keyframes ao-s3 { 0% { opacity: 0; } 55.94% { opacity: 0; } 57.81% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-w3 { 0% { stroke-dashoffset: 1; opacity: 1; } 12.19% { stroke-dashoffset: 1; opacity: 1; } 17.81% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* ---- agent 4 (Communication, pink) ---- */
        @keyframes ao-q4 { 0% { opacity: 1; } 19.31% { opacity: 1; } 20.94% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-r4 { 0% { opacity: 0; } 19.38% { opacity: 0; } 20.94% { opacity: 1; } 35.62% { opacity: 1; } 37.19% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-d4 { 0% { opacity: 0; } 35.62% { opacity: 0; } 37.5% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-p4 { 0% { transform: scaleX(0); opacity: 1; } 19.38% { transform: scaleX(0); opacity: 1; } 35.62% { transform: scaleX(1); opacity: 1; } 95% { transform: scaleX(1); opacity: 1; } 98.75% { transform: scaleX(1); opacity: 0; } 100% { transform: scaleX(0); opacity: 0; } }
        @keyframes ao-s4 { 0% { opacity: 0; } 41.25% { opacity: 0; } 43.12% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-w4 { 0% { stroke-dashoffset: 1; opacity: 1; } 13.75% { stroke-dashoffset: 1; opacity: 1; } 19.38% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* ---- agent 5 (Planning, green) ---- */
        @keyframes ao-q5 { 0% { opacity: 1; } 20.88% { opacity: 1; } 22.5% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-r5 { 0% { opacity: 0; } 20.94% { opacity: 0; } 22.5% { opacity: 1; } 49.69% { opacity: 1; } 51.25% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-d5 { 0% { opacity: 0; } 49.69% { opacity: 0; } 51.56% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-p5 { 0% { transform: scaleX(0); opacity: 1; } 20.94% { transform: scaleX(0); opacity: 1; } 49.69% { transform: scaleX(1); opacity: 1; } 95% { transform: scaleX(1); opacity: 1; } 98.75% { transform: scaleX(1); opacity: 0; } 100% { transform: scaleX(0); opacity: 0; } }
        @keyframes ao-s5 { 0% { opacity: 0; } 55.31% { opacity: 0; } 57.19% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }
        @keyframes ao-w5 { 0% { stroke-dashoffset: 1; opacity: 1; } 15.31% { stroke-dashoffset: 1; opacity: 1; } 20.94% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* task input/output pipes */
        @keyframes ao-tw { 0% { stroke-dashoffset: 1; opacity: 1; } 6.25% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }
        @keyframes ao-fw { 0% { stroke-dashoffset: 1; opacity: 1; } 62.19% { stroke-dashoffset: 1; opacity: 1; } 67.81% { stroke-dashoffset: 0; opacity: 1; } 95% { stroke-dashoffset: 0; opacity: 1; } 98.75% { stroke-dashoffset: 0; opacity: 0; } 100% { stroke-dashoffset: 1; opacity: 0; } }

        /* task card glow */
        @keyframes ao-tg { 0% { opacity: 1; } 6.25% { opacity: 1; } 10% { opacity: 0; } 100% { opacity: 0; } }

        /* final result card states */
        @keyframes ao-gat { 0% { opacity: 1; } 68.44% { opacity: 1; } 70.31% { opacity: 0; } 96.25% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ao-rdy { 0% { opacity: 0; } 68.44% { opacity: 0; } 70.31% { opacity: 1; } 95% { opacity: 1; } 98.75% { opacity: 0; } 100% { opacity: 0; } }

        .ao-toggle {
          position: absolute; top: 14px; right: 14px; z-index: 2;
          display: flex; gap: 2px; padding: 3px; border-radius: 999px;
          background: var(--card); border: 1px solid var(--line);
          box-shadow: 0 4px 14px rgba(27,37,80,0.10);
        }
        .ao-toggle button {
          all: unset; cursor: pointer; width: 32px; height: 28px;
          border-radius: 999px; display: grid; place-items: center;
          color: var(--mut); transition: background 0.25s, color 0.25s;
        }
        .ao-toggle button[aria-pressed="true"] {
          background: var(--acc); color: #fff;
        }
        .ao-toggle svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

        @media (prefers-reduced-motion: reduce) {
          .ao-wrap * { animation: none !important; }
        }
      `}</style>

      {/* Theme toggle */}
      <div className="ao-toggle" role="group" aria-label="Theme">
        <button
          aria-pressed={!isDark}
          aria-label="Light mode"
          onClick={() => applyTheme("light", true)}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>
        <button
          aria-pressed={isDark}
          aria-label="Dark mode"
          onClick={() => applyTheme("dark", true)}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
          </svg>
        </button>
      </div>

      <svg
        className="ao-svg"
        viewBox={`0 0 ${CONTAINER_W} 720`}
        role="img"
        aria-label="Orchestrator dispatching a task to six AI agents and merging their results"
      >
        <defs>
          <pattern id="ao-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--dot)" opacity={0.7} />
          </pattern>
          <radialGradient id="ao-hg">
            <stop offset="0" stopColor="var(--acc)" stopOpacity={0.32} />
            <stop offset="1" stopColor="var(--acc)" stopOpacity={0} />
          </radialGradient>
          <filter id="ao-sh" x="-10%" y="-20%" width="120%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="var(--sh)" floodOpacity="var(--shop)" />
          </filter>
          {/* orchestrator → agents (outgoing) */}
          {AGENTS.map((_, i) => (
            <path
              key={`ao-out-${i}`}
              id={`ao-out${i}`}
              d={`M232,360C380,360 380,${FIRST_Y + i * ROW_H} ${AGENT_X},${FIRST_Y + i * ROW_H}`}
            />
          ))}
          {/* agents → orchestrator (incoming) */}
          {AGENTS.map((_, i) => (
            <path
              key={`ao-bk-${i}`}
              id={`ao-bk${i}`}
              d={`M${AGENT_X},${FIRST_Y + i * ROW_H}C380,${FIRST_Y + i * ROW_H} 380,360 232,360`}
            />
          ))}
          {/* input pipe: top → orchestrator */}
          <path id="ao-tin" d="M170,104V298" />
          {/* output pipe: orchestrator → bottom */}
          <path id="ao-tout" d="M170,422V604" />
        </defs>

        {/* background */}
        <rect width={CONTAINER_W} height={720} fill="url(#ao-grid)" />

        {/* connection lines (base) */}
        <g>
          {AGENTS.map((_, i) => (
            <path
              key={`flow-out-${i}`}
              className="flow"
              d={`M232,360C380,360 380,${FIRST_Y + i * ROW_H} ${AGENT_X},${FIRST_Y + i * ROW_H}`}
            />
          ))}
          <path className="flow" d="M170,104V298" />
          <path className="flow" d="M170,422V604" />
        </g>

        {/* animated progress strokes */}
        <g>
          {AGENTS.map((a, i) => (
            <path
              key={`prog-out-${i}`}
              className="prog"
              pathLength={1}
              d={`M232,360C380,360 380,${FIRST_Y + i * ROW_H} ${AGENT_X},${FIRST_Y + i * ROW_H}`}
              style={{ stroke: a.color, animationName: `ao-w${i}` } as React.CSSProperties}
            />
          ))}
          <path
            className="prog"
            pathLength={1}
            d="M170,104V298"
            style={{ stroke: "#2F5BFF", animationName: "ao-tw" } as React.CSSProperties}
          />
          <path
            className="prog"
            pathLength={1}
            d="M170,422V604"
            style={{ stroke: "#16A37A", animationName: "ao-fw" } as React.CSSProperties}
          />
        </g>

        {/* animated particles (motion paths) */}
        <g>
          {/* input pipe particle pair */}
          <g opacity={0}>
            <circle r="10.1" fill="#2F5BFF" opacity={0.2} />
            <circle r="3.6" fill="#2F5BFF" />
            <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;0;0.0625;1">
              <mpath href="#ao-tin" />
            </animateMotion>
            <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0;0.006;0.0565;0.0625;1" />
          </g>
          <g opacity={0}>
            <circle r="6.2" fill="#2F5BFF" opacity={0.2} />
            <circle r="2.2" fill="#2F5BFF" />
            <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;0.0187;0.0813;1">
              <mpath href="#ao-tin" />
            </animateMotion>
            <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.0187;0.0248;0.0752;0.0813;1" />
          </g>

          {/* output pipe particle pair */}
          <g opacity={0}>
            <circle r="10.1" fill="#16A37A" opacity={0.2} />
            <circle r="3.6" fill="#16A37A" />
            <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;0.6219;0.6844;1">
              <mpath href="#ao-tout" />
            </animateMotion>
            <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.6219;0.6279;0.6784;0.6844;1" />
          </g>
          <g opacity={0}>
            <circle r="6.2" fill="#16A37A" opacity={0.2} />
            <circle r="2.2" fill="#16A37A" />
            <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes="0;0.6406;0.7031;1">
              <mpath href="#ao-tout" />
            </animateMotion>
            <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes="0;0.6406;0.6466;0.6971;0.7031;1" />
          </g>

          {/* per-agent dispatch + return particle pairs */}
          {AGENTS.map((a, i) => {
            const outStart = 0.075 + i * 0.0156;
            const outEnd = outStart + 0.05625;
            const bkStart = 0.3187 + i * 0.05156 * 0.5;
            const bkEnd = bkStart + 0.05625;
            return (
              <g key={`particles-${i}`}>
                {/* large outgoing */}
                <g opacity={0}>
                  <circle r="9.5" fill={a.color} opacity={0.2} />
                  <circle r="3.4" fill={a.color} />
                  <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes={`0;${outStart};${outEnd};1`}>
                    <mpath href={`#ao-out${i}`} />
                  </animateMotion>
                  <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${outStart};${outStart + 0.006};${outEnd - 0.006};${outEnd};1`} />
                </g>
                {/* large return */}
                <g opacity={0}>
                  <circle r="9.5" fill="#16A37A" opacity={0.2} />
                  <circle r="3.4" fill="#16A37A" />
                  <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes={`0;${bkStart};${bkEnd};1`}>
                    <mpath href={`#ao-bk${i}`} />
                  </animateMotion>
                  <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${bkStart};${bkStart + 0.006};${bkEnd - 0.006};${bkEnd};1`} />
                </g>
                {/* small outgoing */}
                <g opacity={0}>
                  <circle r="6.2" fill={a.color} opacity={0.2} />
                  <circle r="2.2" fill={a.color} />
                  <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes={`0;${outStart + 0.01875};${outEnd + 0.01875};1`}>
                    <mpath href={`#ao-out${i}`} />
                  </animateMotion>
                  <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${outStart + 0.01875};${outStart + 0.02475};${outEnd + 0.01275};${outEnd + 0.01875};1`} />
                </g>
                {/* small return */}
                <g opacity={0}>
                  <circle r="6.2" fill="#16A37A" opacity={0.2} />
                  <circle r="2.2" fill="#16A37A" />
                  <animateMotion dur="16s" repeatCount="indefinite" calcMode="linear" keyPoints="0;0;1;1" keyTimes={`0;${bkStart + 0.01875};${bkEnd + 0.01875};1`}>
                    <mpath href={`#ao-bk${i}`} />
                  </animateMotion>
                  <animate attributeName="opacity" dur="16s" repeatCount="indefinite" values="0;0;1;1;0;0" keyTimes={`0;${bkStart + 0.01875};${bkStart + 0.02475};${bkEnd + 0.01275};${bkEnd + 0.01875};1`} />
                </g>
              </g>
            );
          })}
        </g>

        {/* orchestrator core */}
        <g>
          <circle className="breath" cx={ORCH_X} cy={ORCH_Y} r="150" fill="url(#ao-hg)" />
        </g>
        <g transform={`translate(${ORCH_X} ${ORCH_Y})`}>
          <g className="rg">
            <circle r="74" fill="none" stroke="var(--acc)" strokeOpacity={0.5} strokeDasharray="2 7" />
          </g>
          <g className="rg2">
            <path d="M0-74A74 74 0 0 1 64-37" fill="none" stroke="var(--acc)" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M0 74A74 74 0 0 1-64 37" fill="none" stroke="var(--acc)" strokeWidth="1.6" strokeLinecap="round" opacity={0.6} />
          </g>
          <circle className="bu" r="62" fill="none" stroke="var(--acc)" strokeWidth="1.4" />
          <g className="core">
            <circle r="62" className="sh" />
            <circle r="62" className="card" />
            <g
              fill="none"
              stroke="var(--acc)"
              strokeWidth="1.7"
              strokeLinecap="round"
              transform="translate(0 -10)"
            >
              <circle r="4" fill="var(--acc)" />
              <circle cx="-15" cy="-9" r="2.6" />
              <circle cx="15" cy="-9" r="2.6" />
              <circle cx="0" cy="17" r="2.6" />
              <path d="M-3.5-2L-12.5-8M3.5-2L12.5-8M0 4.5V14" />
            </g>
            <text y="32" className="hn">Orchestrator</text>
          </g>
        </g>

        {/* task input card */}
        <g>
          <rect className="sh" x="70" y="32" width="200" height="72" rx="16" />
          <rect className="card" x="70" y="32" width="200" height="72" rx="16" />
          <rect className="glow" style={{ "--agent-color": "#2F5BFF", animationName: "ao-tg" } as React.CSSProperties} x="70" y="32" width="200" height="72" rx="16" />
          <rect x="86" y="50" width="32" height="32" rx="10" fill="#2F5BFF" fillOpacity="0.13" />
          <path d="M96 66H108M104 61L109 66L104 71" fill="none" stroke="#2F5BFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="130" y="62" className="nm">New task</text>
          <text x="130" y="80" className="st" style={{ fontSize: "11px" }}>Prepare Q3 client briefing</text>
        </g>

        {/* final result card */}
        <g>
          <rect className="sh" x="70" y="604" width="200" height="84" rx="16" />
          <rect className="card" x="70" y="604" width="200" height="84" rx="16" />
          <rect className="glow" style={{ "--agent-color": "#16A37A", animationName: "ao-rdy" } as React.CSSProperties} x="70" y="604" width="200" height="84" rx="16" />
          <rect x="86" y="620" width="22" height="22" rx="7" fill="#16A37A" fillOpacity="0.14" />
          <path d="M92 631L96 635L103 627" fill="none" stroke="#16A37A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="118" y="636" className="nm">Final result</text>
          <text x="118" y="654" className="st" style={{ fontSize: "11px", animation: "ao-gat 16s linear infinite" } as React.CSSProperties}>Gathering results</text>
          <text x="118" y="654" className="st" style={{ fontSize: "11px", opacity: 0, animation: "ao-rdy 16s linear infinite" } as React.CSSProperties}>Briefing ready</text>
          {/* result bars showing each agent contributed */}
          {AGENTS.map((a, i) => (
            <g key={`res-${i}`}>
              <rect x={118 + i * 23} y="664" width="20" height="5" rx="2.5" className="trk" />
              <rect x={118 + i * 23} y="664" width="20" height="5" rx="2.5" fill={a.color} className="lit" style={{ animationName: `ao-s${i}` } as React.CSSProperties} />
            </g>
          ))}
        </g>

        {/* agent cards */}
        {AGENTS.map((a, i) => {
          const y = FIRST_Y + i * ROW_H;
          const cardRight = AGENT_X + AGENT_W;
          const pillX = cardRight - 72;
          const progressX = 594;
          return (
            <g
              key={a.name}
              style={{ "--agent-color": a.color } as React.CSSProperties}
            >
              <rect className="sh" x={AGENT_X} y={y} width={AGENT_W} height={76} rx="16" />
              <rect className="card" x={AGENT_X} y={y} width={AGENT_W} height={76} rx="16" />
              <rect className="glow" x={AGENT_X} y={y} width={AGENT_W} height={76} rx="16" style={{ animationName: `ao-r${i}` } as React.CSSProperties} />

              {/* icon tile */}
              <rect className="tile" x={AGENT_X + 18} y={y + 18} width={40} height={40} rx={12} />
              <g transform={`translate(${AGENT_X + 38} ${y + 38})`}>
                <AgentIcon type={a.icon} />
              </g>

              {/* name + score */}
              <text x={AGENT_X + 74} y={y + 32} className="nm">{a.name}</text>
              <text x={AGENT_X + 74} y={y + 50} className="tx">0.3</text>

              {/* status pills */}
              <g transform={`translate(${pillX} ${y + 27})`}>
                <g className="cq" style={{ animationName: `ao-q${i}` } as React.CSSProperties}>
                  <rect width="72" height="22" rx="11" className="chq" />
                  <text x="36" y="15" className="ct">Queued</text>
                </g>
                <g className="cq" style={{ animationName: `ao-r${i}` } as React.CSSProperties}>
                  <rect width="72" height="22" rx="11" fill={a.color} fillOpacity="0.14" />
                  <circle className="pd" cx="14" cy="11" r="3" fill={a.color} />
                  <text x="40" y="15" className="ct" fill={a.color}>Running</text>
                </g>
                <g className="cq" style={{ animationName: `ao-d${i}` } as React.CSSProperties}>
                  <rect width="72" height="22" rx="11" fill="#16A37A" fillOpacity="0.14" />
                  <text x="36" y="15" className="ct" fill="#16A37A">Done</text>
                </g>
              </g>

              {/* progress bar */}
              <rect x={progressX} y={y + 62} width={TRACK_W} height="4" rx="2" className="trk" />
              <rect className="bar" x={progressX} y={y + 62} width={TRACK_W} height="4" rx="2" fill={a.color} style={{ animationName: `ao-p${i}` } as React.CSSProperties} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
