"use client";

import { useEffect, useRef, useState } from "react";

type Neuron = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  label: string;
};

const WB = 720;
const HB = 600;
const CX = 360;
const CY = 300;

const CORTEX: Neuron[] = [
  { id: "ctx-1", cx: 270, cy: 220, r: 14, color: "#6366f1", label: "Intent" },
  { id: "ctx-2", cx: 360, cy: 180, r: 16, color: "#4f46e5", label: "Parse" },
  { id: "ctx-3", cx: 450, cy: 220, r: 14, color: "#6366f1", label: "Route" },
  { id: "ctx-4", cx: 250, cy: 320, r: 13, color: "#818cf8", label: "Plan" },
  { id: "ctx-5", cx: 360, cy: 290, r: 18, color: "#4338ca", label: "Think" },
  { id: "ctx-6", cx: 470, cy: 320, r: 13, color: "#818cf8", label: "Verify" },
];

const MEMORY: Neuron[] = [
  { id: "mem-1", cx: 120, cy: 120, r: 11, color: "#059669", label: "Context" },
  { id: "mem-2", cx: 80, cy: 240, r: 10, color: "#10b981", label: "History" },
  { id: "mem-3", cx: 100, cy: 400, r: 12, color: "#059669", label: "Knowledge" },
  { id: "mem-4", cx: 160, cy: 500, r: 10, color: "#10b981", label: "Prefs" },
];

const TOOLS: Neuron[] = [
  { id: "tool-1", cx: 600, cy: 120, r: 11, color: "#d97706", label: "Search" },
  { id: "tool-2", cx: 640, cy: 240, r: 12, color: "#b45309", label: "Compute" },
  { id: "tool-3", cx: 620, cy: 380, r: 10, color: "#d97706", label: "Browse" },
  { id: "tool-4", cx: 560, cy: 490, r: 11, color: "#b45309", label: "Write" },
];

const OUTPUT: Neuron[] = [
  { id: "out-1", cx: 360, cy: 520, r: 12, color: "#0284c7", label: "Response" },
];

const ALL = [...CORTEX, ...MEMORY, ...TOOLS, ...OUTPUT];

const CONNECTIONS: [string, string][] = [
  ["mem-1", "ctx-1"], ["mem-1", "ctx-2"],
  ["mem-2", "ctx-1"], ["mem-2", "ctx-4"],
  ["mem-3", "ctx-4"], ["mem-3", "ctx-5"],
  ["mem-4", "ctx-5"], ["mem-4", "ctx-6"],
  ["ctx-1", "ctx-2"], ["ctx-2", "ctx-3"],
  ["ctx-1", "ctx-4"], ["ctx-2", "ctx-5"],
  ["ctx-3", "ctx-6"], ["ctx-4", "ctx-5"],
  ["ctx-5", "ctx-6"],
  ["ctx-2", "tool-1"], ["ctx-2", "tool-2"],
  ["ctx-5", "tool-2"], ["ctx-5", "tool-3"],
  ["ctx-6", "tool-3"], ["ctx-6", "tool-4"],
  ["tool-1", "ctx-5"], ["tool-2", "ctx-5"],
  ["tool-3", "ctx-6"],
  ["ctx-4", "out-1"], ["ctx-5", "out-1"], ["ctx-6", "out-1"],
];

const THOUGHTS = [
  "Analyzing user intent...",
  "Searching knowledge base...",
  "Evaluating 3 approaches",
  "Selecting optimal strategy",
  "Gathering context...",
  "Drafting response...",
  "Verifying accuracy...",
  "Polishing output...",
];

function find(id: string) {
  return ALL.find((n) => n.id === id)!;
}

function arc(ax: number, ay: number, bx: number, by: number, bow = 0.18) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const qx = (ax + bx) / 2 + (-dy / len) * len * bow;
  const qy = (ay + by) / 2 + (dx / len) * len * bow;
  return `M ${ax} ${ay} Q ${qx} ${qy} ${bx} ${by}`;
}

export default function AiBrainWorkspace({ className = "" }: { className?: string }) {
  const [activeThought, setActiveThought] = useState(0);
  const [firing, setFiring] = useState<Set<string>>(new Set());
  const [signalIdx, setSignalIdx] = useState(0);
  const [pulseT, setPulseT] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  // The 100ms tick below re-renders a large SVG. It only advances while the
  // plate is actually visible; off screen the interval keeps its slot but does
  // no work, so scrolling past this section costs nothing.
  const liveRef = useRef(true);

  const connPath: [string, string][] = [
    ["mem-1", "ctx-2"], ["ctx-2", "ctx-5"], ["ctx-5", "tool-2"],
    ["tool-2", "ctx-5"], ["ctx-5", "ctx-6"], ["ctx-6", "out-1"],
  ];

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
    let t = 0;
    timer.current = setInterval(() => {
      if (!liveRef.current) return;
      t += 1;
      const idx = Math.floor(t / 17) % connPath.length;
      const localT = (t % 17) / 17;
      setSignalIdx(idx);
      setPulseT(localT);

      const wave = t % 18;
      const f = new Set<string>();
      const seq = wave < 6
        ? ["mem-1", "mem-2", "ctx-1", "ctx-2", "ctx-5"]
        : wave < 12
          ? ["ctx-5", "ctx-6", "tool-2", "tool-3", "ctx-5"]
          : ["ctx-6", "out-1", "ctx-5", "ctx-6", "out-1"];
      f.add(seq[wave % 5]);
      setFiring(f);

      if (t % 20 === 0) setActiveThought((p) => (p + 1) % THOUGHTS.length);
    }, 100);
    return () => { if (timer.current) clearInterval(timer.current); };
    // `connPath` is a module constant, so its length is fixed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [fromId, toId] = connPath[signalIdx];
  const from = find(fromId);
  const to = find(toId);
  const pathStr = arc(from.cx, from.cy, to.cx, to.cy);
  const px = from.cx + (to.cx - from.cx) * pulseT;
  const py = from.cy + (to.cy - from.cy) * pulseT;

  return (
    <div ref={hostRef} className={`ai-brain relative w-full overflow-hidden ${className}`}>
      <style>{`
        .ai-brain { container-type: inline-size; }
        .ai-brain-svg { width: 100%; height: auto; display: block; }
        .layer-label { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 9px; letter-spacing: 0.22em; fill: #94a3b8; }
        .node-label { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 7px; letter-spacing: 0.06em; fill: #475569; }
        .thought-text { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 10px; letter-spacing: 0.04em; fill: #0369a1; }
        .title-text { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 10px; letter-spacing: 0.3em; fill: #64748b; }
        .brain-grid circle { stroke: #e2e8f0; stroke-width: 0.8; }
        @keyframes fire-pulse-ring { 0% { r: 0; opacity: 0.6; } 100% { r: 28; opacity: 0; } }
        .fire-pulse { animation: fire-pulse-ring 1.2s ease-out infinite; }
        @keyframes thought-fade { 0% { opacity: 0; transform: translateY(4px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateY(-3px); } }
        .thought-bubble { animation: thought-fade 3s ease-in-out; }
        @keyframes core-breathe { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.04); opacity: 0.7; } }
        .core-breathe { transform-box: view-box; transform-origin: 50% 50%; animation: core-breathe 6s ease-in-out infinite; }
        @keyframes ring-spin { to { transform: rotate(360deg); } }
        .brain-ring { transform-box: view-box; transform-origin: 50% 50%; animation: ring-spin 40s linear infinite; }
        .brain-ring-rev { transform-box: view-box; transform-origin: 50% 50%; animation: ring-spin 60s linear infinite reverse; }
        @keyframes orbit1 { from { transform: rotate(0deg) translateX(130px) rotate(0deg); } to { transform: rotate(360deg) translateX(130px) rotate(-360deg); } }
        @keyframes orbit2 { from { transform: rotate(120deg) translateX(140px) rotate(-120deg); } to { transform: rotate(480deg) translateX(140px) rotate(-480deg); } }
        @keyframes orbit3 { from { transform: rotate(240deg) translateX(125px) rotate(-240deg); } to { transform: rotate(600deg) translateX(125px) rotate(-600deg); } }
        .orbit-dot-1 { animation: orbit1 14s linear infinite; }
        .orbit-dot-2 { animation: orbit2 18s linear infinite; }
        .orbit-dot-3 { animation: orbit3 22s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .core-breathe, .brain-ring, .brain-ring-rev, .fire-pulse, .orbit-dot-1, .orbit-dot-2, .orbit-dot-3 { animation: none !important; } }
      `}</style>

      <svg className="ai-brain-svg" viewBox={`0 0 ${WB} ${HB}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="AI Brain neural workspace">
        <defs>
          <filter id="bb" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="tb" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* background — clean light */}
        <rect width={WB} height={HB} fill="#ffffff" />
        <g className="brain-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={CX} cy={CY} r={50 + i * 45} fill="none" />
          ))}
        </g>
        <rect x="0.5" y="0.5" width={WB - 1} height={HB - 1} rx="16" fill="none" stroke="#e2e8f0" strokeWidth="1" />

        {/* layer labels */}
        <text x="70" y="55" className="layer-label">MEMORY</text>
        <text x="545" y="55" className="layer-label">TOOLS</text>
        <text x="310" y="55" className="layer-label">CORTEX</text>
        <text x="315" y="585" className="layer-label">OUTPUT</text>

        {/* base connections */}
        <g>
          {CONNECTIONS.map(([a, b], i) => {
            const na = find(a); const nb = find(b);
            return <path key={i} d={arc(na.cx, na.cy, nb.cx, nb.cy)} fill="none" stroke="#cbd5e1" strokeWidth="0.7" strokeLinecap="round" />;
          })}
        </g>

        {/* active signal */}
        <g>
          <path d={pathStr} fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" filter="url(#tb)" opacity="0.85" />
          <circle cx={px} cy={py} r="4" fill="#0284c7" opacity="0.2" />
          <circle cx={px} cy={py} r="2" fill="#0284c7" />
        </g>

        {/* cortex core */}
        <g>
          <circle className="core-breathe" cx={CX} cy={CY} r="95" fill="none" stroke="#c7d2fe" strokeWidth="1" />
          <g className="brain-ring" opacity="0.5">
            <ellipse cx={CX} cy={CY} rx="108" ry="108" fill="none" stroke="#a5b4fc" strokeWidth="0.8" strokeDasharray="2 10" />
            <circle cx={CX + 108} cy={CY} r="2" fill="#6366f1" />
          </g>
          <g className="brain-ring-rev" opacity="0.35">
            <ellipse cx={CX} cy={CY} rx="132" ry="132" fill="none" stroke="#c7d2fe" strokeWidth="0.8" strokeDasharray="18 30 3 30" />
          </g>
          <g transform={`translate(${CX} ${CY})`}>
            <circle className="orbit-dot-1" cx="0" cy="0" r="2.5" fill="#6366f1" />
            <circle className="orbit-dot-2" cx="0" cy="0" r="2" fill="#818cf8" />
            <circle className="orbit-dot-3" cx="0" cy="0" r="2.8" fill="#a5b4fc" />
          </g>
        </g>

        {/* nodes */}
        <g>
          {ALL.map((n) => {
            const on = firing.has(n.id);
            return (
              <g key={n.id}>
                <circle cx={n.cx} cy={n.cy} r={n.r + 6} fill={n.color} opacity={on ? 0.15 : 0.04} filter="url(#bb)" />
                {on && <circle className="fire-pulse" cx={n.cx} cy={n.cy} r="0" fill="none" stroke={n.color} strokeWidth="1.4" />}
                <circle cx={n.cx} cy={n.cy} r={n.r} fill="#ffffff" stroke={n.color} strokeWidth="2" opacity={on ? 1 : 0.9} />
                <circle cx={n.cx} cy={n.cy} r={n.r * 0.35} fill={n.color} opacity={on ? 0.7 : 0.3} />
                <text x={n.cx} y={n.cy + n.r + 12} textAnchor="middle" className="node-label">{n.label}</text>
              </g>
            );
          })}
        </g>

        {/* thought stream */}
        <g>
          <rect x="225" y="445" width="270" height="28" rx="7" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="0.7" />
          <text x="360" y="463" textAnchor="middle" className="thought-text">
            <tspan className="thought-bubble" key={activeThought}>{THOUGHTS[activeThought]}</tspan>
          </text>
        </g>

        {/* status */}
        <g transform={`translate(${CX} ${CY - 155})`}>
          <text textAnchor="middle" y="0" className="title-text">AI BRAIN — ACTIVE</text>
          <circle cx="-55" cy="18" r="3" fill="#10b981"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" /></circle>
          <text x="-48" y="21" className="node-label" textAnchor="start">Processing</text>
          <circle cx="35" cy="18" r="3" fill="#f59e0b"><animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" /></circle>
          <text x="42" y="21" className="node-label" textAnchor="start">Tools online</text>
        </g>

        {/* HUD panels */}
        <g>
          <g transform="translate(18 555)">
            <rect width="115" height="34" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <text x="9" y="13" className="layer-label">TOKENS</text>
            <text x="9" y="26" className="thought-text" fill="#4f46e5">2,847 / 4,096</text>
          </g>
          <g transform="translate(18 595)">
            <rect width="115" height="34" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <text x="9" y="13" className="layer-label">LATENCY</text>
            <text x="9" y="26" className="thought-text" fill="#059669">340ms</text>
          </g>
          <g transform="translate(587 555)">
            <rect width="115" height="34" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <text x="9" y="13" className="layer-label">AGENTS</text>
            <text x="9" y="26" className="thought-text" fill="#d97706">6 / 6 ready</text>
          </g>
          <g transform="translate(587 595)">
            <rect width="115" height="34" rx="7" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.7" />
            <text x="9" y="13" className="layer-label">MODEL</text>
            <text x="9" y="26" className="thought-text" fill="#0284c7">v3.1-turbo</text>
          </g>
        </g>
      </svg>
    </div>
  );
}
