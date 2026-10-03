"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Interactive AI Agent Connector Builder                            */
/* ------------------------------------------------------------------ */

const VB_W = 960;
const VB_H = 580;

const NODE_W = 158;
const NODE_H = 58;
const PORT_R = 5.5;
const SNAP_DIST = 34;

type AgentKind =
  | "orchestrator"
  | "research"
  | "coding"
  | "browser"
  | "data"
  | "planning"
  | "comms";

type AgentSpec = {
  kind: AgentKind;
  label: string;
  color: string;
};

const AGENT_SPECS: AgentSpec[] = [
  { kind: "orchestrator", label: "Orchestrator", color: "#4f46e5" },
  { kind: "research", label: "Research", color: "#0284c7" },
  { kind: "coding", label: "Coding", color: "#059669" },
  { kind: "browser", label: "Browser", color: "#d97706" },
  { kind: "data", label: "Data", color: "#db2777" },
  { kind: "planning", label: "Planning", color: "#7c3aed" },
  { kind: "comms", label: "Comms", color: "#0891b2" },
];

const SPEC_BY_KIND: Record<AgentKind, AgentSpec> = AGENT_SPECS.reduce(
  (acc, s) => ({ ...acc, [s.kind]: s }),
  {} as Record<AgentKind, AgentSpec>,
);

type Node = {
  id: string;
  kind: AgentKind;
  x: number;
  y: number;
};

type Edge = {
  id: string;
  from: string;
  to: string;
};

let uid = 0;
const nextId = (prefix: string) => `${prefix}-${++uid}`;

const INITIAL_NODES: Node[] = [
  { id: "n-orch", kind: "orchestrator", x: 190, y: 290 },
  { id: "n-research", kind: "research", x: 520, y: 110 },
  { id: "n-coding", kind: "coding", x: 520, y: 230 },
  { id: "n-data", kind: "data", x: 520, y: 350 },
  { id: "n-comms", kind: "comms", x: 520, y: 470 },
  { id: "n-planning", kind: "planning", x: 800, y: 170 },
];

/* starts fully unwired — the user builds the graph */
const INITIAL_EDGES: Edge[] = [];

/* script the orchestrator streams back, one segment at a time */
type ScriptSegment = { kind: AgentKind; text: string };

const RESPONSE_SCRIPT: ScriptSegment[] = [
  { kind: "orchestrator", text: "Received task. Decomposing into four parallel workstreams." },
  { kind: "research", text: "Scanned 12 sources and ranked them by credibility." },
  { kind: "coding", text: "Implemented the handler across two files and ran the test suite." },
  { kind: "data", text: "Aggregated the outputs — three anomalies flagged for review." },
  { kind: "orchestrator", text: "Merging partial results into a single verified answer." },
];

function portIn(n: Node) {
  return { x: n.x - NODE_W / 2, y: n.y };
}
function portOut(n: Node) {
  return { x: n.x + NODE_W / 2, y: n.y };
}

function bezier(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = Math.max(48, Math.abs(b.x - a.x) * 0.5);
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

function midOf(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = Math.max(48, Math.abs(b.x - a.x) * 0.5);
  // sample the cubic at t = 0.5
  const p0 = a;
  const p1 = { x: a.x + dx, y: a.y };
  const p2 = { x: b.x - dx, y: b.y };
  const p3 = b;
  const t = 0.5;
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

function AgentGlyph({ kind, color }: { kind: AgentKind; color: string }) {
  const common = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "orchestrator":
      return (
        <g {...common}>
          <circle cx="0" cy="-3" r="2.4" />
          <circle cx="-8" cy="-7" r="1.8" />
          <circle cx="8" cy="-7" r="1.8" />
          <circle cx="0" cy="8" r="1.8" />
          <path d="M-1.8-4.4L-6.2-6.2M1.8-4.4L6.2-6.2M0 0.6V6.2" />
        </g>
      );
    case "research":
      return (
        <g {...common}>
          <circle cx="-1.5" cy="-1.5" r="5.5" />
          <path d="M2.5 2.5L7.5 7.5" />
        </g>
      );
    case "coding":
      return (
        <g {...common}>
          <path d="M-3-5L-8 0L-3 5M3-5L8 0L3 5" />
        </g>
      );
    case "browser":
      return (
        <g {...common}>
          <circle r="7.5" />
          <ellipse rx="3.2" ry="7.5" />
          <path d="M-7.5 0H7.5" />
        </g>
      );
    case "data":
      return (
        <g {...common}>
          <path d="M-6 5V-1M0 5V-7M6 5V1" />
        </g>
      );
    case "planning":
      return (
        <g {...common}>
          <circle cx="-5" cy="-5" r="2.2" />
          <circle cx="5" cy="0" r="2.2" />
          <circle cx="-5" cy="5" r="2.2" />
          <path d="M-3-4L3-1M-3 4L3 1" />
        </g>
      );
    case "comms":
      return (
        <g {...common}>
          <path d="M-7.5-5.5H7.5V4H-1L-5 7.5V4H-7.5Z" />
        </g>
      );
  }
}

export default function AgentConnectorBuilder({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredPort, setHoveredPort] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const [tempEnd, setTempEnd] = useState<{ x: number; y: number } | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /* ---- streaming response ---- */
  const [lines, setLines] = useState<ScriptSegment[]>([]);
  const [partial, setPartial] = useState("");
  const [segIndex, setSegIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [activeKind, setActiveKind] = useState<AgentKind | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const connectRef = useRef<string | null>(null);
  const nodesRef = useRef(nodes);

  /* The pointer handlers are window listeners registered once, so they would
     close over the node list from the render that created them — a node dragged
     in a later frame would be snapshotted at its old position. Mirroring the
     list into a ref keeps the handlers stable without making them stale. */
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const nodeById = useMemo(() => {
    const m = new Map<string, Node>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const toSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VB_W,
      y: ((clientY - rect.top) / rect.height) * VB_H,
    };
  }, []);

  const flash = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice((n) => (n === msg ? null : n)), 1600);
  }, []);

  /* ---------------- streaming engine ---------------- */

  const runTask = useCallback(() => {
    setLines([]);
    setPartial("");
    setSegIndex(0);
    setCharIndex(0);
    setStreaming(true);
  }, []);

  /* One step of the typewriter per effect pass. Every write is scheduled on a
     timer rather than made inline: the effect itself then subscribes to an
     external clock, which is what effects are for. */
  useEffect(() => {
    if (!streaming) {
      const id = window.setTimeout(() => setActiveKind(null), 0);
      return () => window.clearTimeout(id);
    }

    const seg = RESPONSE_SCRIPT[segIndex];
    if (!seg) {
      const id = window.setTimeout(() => {
        setStreaming(false);
        setActiveKind(null);
      }, 0);
      return () => window.clearTimeout(id);
    }

    if (charIndex >= seg.text.length) {
      // segment finished — commit it and move on
      const id = window.setTimeout(() => {
        setActiveKind(seg.kind);
        setLines((prev) => [...prev, seg]);
        setPartial("");
        setCharIndex(0);
        setSegIndex((i) => i + 1);
      }, 0);
      return () => window.clearTimeout(id);
    }

    const delay = 14 + Math.random() * 26;
    const timer = window.setTimeout(() => {
      setActiveKind(seg.kind);
      setPartial(seg.text.slice(0, charIndex + 1));
      setCharIndex((c) => c + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [streaming, segIndex, charIndex]);

  /* keep the output pane pinned to the newest text */
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, partial]);

  /* ---------------- pointer handling ---------------- */

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const p = toSvg(e.clientX, e.clientY);

      if (dragRef.current) {
        const { id, offsetX, offsetY } = dragRef.current;
        setNodes((prev) =>
          prev.map((n) =>
            n.id === id
              ? {
                  ...n,
                  x: Math.min(VB_W - NODE_W / 2 - 8, Math.max(NODE_W / 2 + 8, p.x - offsetX)),
                  y: Math.min(VB_H - NODE_H / 2 - 8, Math.max(NODE_H / 2 + 8, p.y - offsetY)),
                }
              : n,
          ),
        );
        return;
      }

      if (connectRef.current) {
        setTempEnd(p);
        // highlight a nearby input port
        const target = nodesRef.current.find((n) => {
          if (n.id === connectRef.current) return false;
          const ip = portIn(n);
          return Math.hypot(ip.x - p.x, ip.y - p.y) < SNAP_DIST;
        });
        setHoveredPort(target ? target.id : null);
      }
    };

    const onUp = (e: PointerEvent) => {
      if (connectRef.current) {
        const p = toSvg(e.clientX, e.clientY);
        const from = connectRef.current;
        const target = nodesRef.current.find((n) => {
          if (n.id === from) return false;
          const ip = portIn(n);
          return Math.hypot(ip.x - p.x, ip.y - p.y) < SNAP_DIST;
        });

        if (target) {
          setEdges((prev) => {
            const dup = prev.some((ed) => ed.from === from && ed.to === target.id);
            if (dup) {
              flash("Those agents are already connected");
              return prev;
            }
            return [...prev, { id: nextId("e"), from, to: target.id }];
          });
        }
      }
      dragRef.current = null;
      connectRef.current = null;
      setConnectFrom(null);
      setTempEnd(null);
      setHoveredPort(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [toSvg, flash]);

  const startNodeDrag = useCallback(
    (e: React.PointerEvent, node: Node) => {
      e.stopPropagation();
      const p = toSvg(e.clientX, e.clientY);
      dragRef.current = { id: node.id, offsetX: p.x - node.x, offsetY: p.y - node.y };
      setSelectedEdge(null);
    },
    [toSvg],
  );

  const startConnect = useCallback((e: React.PointerEvent, node: Node) => {
    e.stopPropagation();
    connectRef.current = node.id;
    setConnectFrom(node.id);
    const out = portOut(node);
    setTempEnd(out);
  }, []);

  /* ---------------- mutations ---------------- */

  const addAgent = useCallback(
    (kind: AgentKind) => {
      const spec = SPEC_BY_KIND[kind];
      setNodes((prev) => {
        // spiral outward until we find a spot that is not crowded
        const cx = VB_W / 2;
        const cy = VB_H / 2;
        let best = { x: cx, y: cy };
        for (let ring = 0; ring < 8; ring++) {
          const r = 70 + ring * 62;
          const count = 6 + ring * 2;
          for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2 + ring * 0.5;
            const cand = {
              x: Math.min(VB_W - NODE_W / 2 - 12, Math.max(NODE_W / 2 + 12, cx + Math.cos(a) * r)),
              y: Math.min(VB_H - NODE_H / 2 - 12, Math.max(NODE_H / 2 + 12, cy + Math.sin(a) * r)),
            };
            const clear = prev.every(
              (n) => Math.hypot(n.x - cand.x, n.y - cand.y) > NODE_W * 0.95,
            );
            if (clear) {
              best = cand;
              ring = 99;
              break;
            }
          }
        }
        return [...prev, { id: nextId("n"), kind, x: best.x, y: best.y }];
      });
      flash(`${spec.label} agent added — drag from its right port to connect`);
    },
    [flash],
  );

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
    setHoveredNode(null);
  }, []);

  const removeEdge = useCallback((id: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
    setSelectedEdge(null);
  }, []);

  const resetAll = useCallback(() => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setSelectedEdge(null);
    flash("Layout reset");
  }, [flash]);

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedEdge(null);
    flash("Canvas cleared");
  }, [flash]);

  const autoLayout = useCallback(() => {
    setNodes((prev) => {
      const orch = prev.find((n) => n.kind === "orchestrator");
      const rest = prev.filter((n) => n.kind !== "orchestrator");
      const placed: Node[] = [];
      if (orch) {
        placed.push({ ...orch, x: 170, y: VB_H / 2 });
      }
      const n = rest.length;
      rest.forEach((node, i) => {
        const step = (VB_H - 120) / Math.max(n, 1);
        placed.push({ ...node, x: VB_W - 220, y: 60 + step * (i + 0.5) });
      });
      return placed;
    });
    flash("Auto-arranged");
  }, [flash]);

  /* keyboard: delete selected edge / focused node */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEdge) {
        removeEdge(selectedEdge);
      }
      if (e.key === "Escape") {
        setSelectedEdge(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEdge, removeEdge]);

  const incoming = useMemo(() => {
    const m = new Map<string, number>();
    edges.forEach((e) => m.set(e.to, (m.get(e.to) ?? 0) + 1));
    return m;
  }, [edges]);

  /* nodes that appear in at least one link */
  const linkedIds = useMemo(() => {
    const s = new Set<string>();
    edges.forEach((e) => {
      s.add(e.from);
      s.add(e.to);
    });
    return s;
  }, [edges]);

  /* every node must be part of the graph before the orchestrator runs */
  const allConnected = useMemo(
    () => nodes.length > 1 && edges.length > 0 && nodes.every((n) => linkedIds.has(n.id)),
    [nodes, edges, linkedIds],
  );

  /* changes only when the graph topology changes — not when a card is dragged */
  const graphSignature = useMemo(
    () =>
      `${nodes.map((n) => n.id).sort().join(",")}|${edges
        .map((e) => `${e.from}>${e.to}`)
        .sort()
        .join(",")}`,
    [nodes, edges],
  );

  const lastRunSignature = useRef<string | null>(null);

  /* auto-start the stream the moment the graph becomes fully wired.
     The writes are deferred out of the effect body so breaking a connection
     does not cascade a re-render on the spot. */
  useEffect(() => {
    if (!allConnected) {
      lastRunSignature.current = null;
      const id = window.setTimeout(() => setStreaming(false), 0);
      return () => window.clearTimeout(id);
    }
    if (lastRunSignature.current === graphSignature) return;
    lastRunSignature.current = graphSignature;
    runTask();
  }, [allConnected, graphSignature, runTask]);

  return (
    <div className={`agent-builder w-full ${className}`}>
      <style>{`
        .agent-builder { container-type: inline-size; }

        .ab-canvas {
          width: 100%;
          height: auto;
          display: block;
          touch-action: none;
          user-select: none;
        }

        .ab-node { cursor: grab; }
        .ab-node:active { cursor: grabbing; }

        .ab-port { cursor: crosshair; transition: r 0.15s ease; }
        .ab-port:hover { r: 8; }

        .ab-edge { transition: stroke 0.2s ease, stroke-width 0.2s ease; }

        .ab-flow {
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-dasharray: 3 9;
          opacity: 0.85;
        }
        .ab-flow.paused { animation-play-state: paused; }
        @keyframes ab-dash { to { stroke-dashoffset: -120; } }
        .ab-flow.run { animation: ab-dash 2.6s linear infinite; }

        .ab-label {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 11.5px;
          font-weight: 600;
          fill: #0f172a;
        }
        .ab-sub {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 8.5px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          fill: #94a3b8;
        }
        .ab-hint {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 10px;
          fill: #cbd5e1;
        }

        .ab-del {
          cursor: pointer;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }
        .ab-del.show { opacity: 1; pointer-events: auto; }

        @keyframes ab-halo {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.6; }
        }
        .ab-active-halo { animation: ab-halo 1.3s ease-in-out infinite; }

        @keyframes ab-live {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.82); }
        }
        .ab-live-dot { animation: ab-live 1.1s ease-in-out infinite; }

        /* ---- terminal ---- */
        .ab-term-prompt { color: #34d399; }

        .ab-term-caret {
          display: inline-block;
          width: 6px;
          height: 12px;
          margin-left: 2px;
          vertical-align: -2px;
          background: #34d399;
          animation: ab-blink 1s steps(1) infinite;
        }
        @keyframes ab-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }

        .ab-term-body::-webkit-scrollbar { width: 8px; }
        .ab-term-body::-webkit-scrollbar-track { background: transparent; }
        .ab-term-body::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,0.22);
          border-radius: 4px;
        }
        .ab-term-body::-webkit-scrollbar-thumb:hover {
          background: rgba(148,163,184,0.35);
        }
        .ab-term-body { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.25) transparent; }

        .ab-out-line {
          animation: ab-line-in 0.28s ease-out;
        }
        @keyframes ab-line-in {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ab-flow.run,
          .ab-active-halo,
          .ab-live-dot,
          .ab-term-caret,
          .ab-out-line { animation: none; }
          .ab-term-caret { opacity: 1; }
        }
      `}</style>

      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
          Add agent
        </span>
        {AGENT_SPECS.map((s) => (
          <button
            key={s.kind}
            type="button"
            onClick={() => addAgent(s.kind)}
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:-translate-y-px hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* split workspace — connector left, terminal right */}
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:flex-row">
        <div className="relative min-w-0 flex-1">
        <svg
          ref={svgRef}
          className="ab-canvas"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="application"
          aria-label="AI agent connector canvas"
          onPointerDown={() => setSelectedEdge(null)}
        >
          <defs>
            <pattern id="ab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#e2e8f0" />
            </pattern>
            <filter id="ab-shadow" x="-30%" y="-40%" width="160%" height="190%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.09" />
            </filter>
          </defs>

          <rect width={VB_W} height={VB_H} fill="url(#ab-grid)" />

          {/* empty state */}
          {nodes.length === 0 && (
            <text x={VB_W / 2} y={VB_H / 2} textAnchor="middle" className="ab-hint">
              Canvas is empty — add an agent from the toolbar above
            </text>
          )}

          {/* edges */}
          <g>
            {edges.map((edge) => {
              const a = nodeById.get(edge.from);
              const b = nodeById.get(edge.to);
              if (!a || !b) return null;

              const p0 = portOut(a);
              const p1 = portIn(b);
              const d = bezier(p0, p1);
              const mid = midOf(p0, p1);
              const isSelected = selectedEdge === edge.id;
              const color = SPEC_BY_KIND[a.kind].color;

              return (
                <g key={edge.id}>
                  {/* fat invisible hit area */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={18}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedEdge(edge.id);
                    }}
                  />
                  <path
                    className="ab-edge"
                    d={d}
                    fill="none"
                    stroke={isSelected ? "#0f172a" : "#cbd5e1"}
                    strokeWidth={isSelected ? 2.4 : 1.6}
                  />
                  {/* flow overlay */}
                  <path
                    className={`ab-flow ${running ? "run" : "paused"}`}
                    d={d}
                    stroke={color}
                    opacity={isSelected ? 1 : 0.75}
                  />
                  {/* delete handle when selected */}
                  <g
                    className={`ab-del ${isSelected ? "show" : ""}`}
                    transform={`translate(${mid.x} ${mid.y})`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      removeEdge(edge.id);
                    }}
                  >
                    <circle r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                    <path
                      d="M-3.2-3.2L3.2 3.2M3.2-3.2L-3.2 3.2"
                      stroke="#64748b"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              );
            })}
          </g>

          {/* in-progress connection */}
          {connectFrom && tempEnd && (() => {
            const a = nodeById.get(connectFrom);
            if (!a) return null;
            const p0 = portOut(a);
            return (
              <g pointerEvents="none">
                <path
                  d={bezier(p0, tempEnd)}
                  fill="none"
                  stroke={SPEC_BY_KIND[a.kind].color}
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  opacity="0.7"
                />
                <circle cx={tempEnd.x} cy={tempEnd.y} r="4" fill={SPEC_BY_KIND[a.kind].color} />
              </g>
            );
          })()}

          {/* nodes */}
          <g>
            {nodes.map((node) => {
              const spec = SPEC_BY_KIND[node.kind];
              const isHovered = hoveredNode === node.id;
              const isPortTarget = hoveredPort === node.id;
              const isActive = streaming && activeKind === node.kind;
              const isUnlinked = !linkedIds.has(node.id);
              const fanIn = incoming.get(node.id) ?? 0;

              return (
                <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
                  {/* working halo while this agent streams */}
                  {isActive && (
                    <rect
                      className="ab-active-halo"
                      x={-NODE_W / 2 - 6}
                      y={-NODE_H / 2 - 6}
                      width={NODE_W + 12}
                      height={NODE_H + 12}
                      rx={16}
                      fill="none"
                      stroke={spec.color}
                      strokeWidth="1.6"
                    />
                  )}
                  {/* input port */}
                  <circle
                    className="ab-port"
                    cx={-NODE_W / 2}
                    cy={0}
                    r={isPortTarget ? 9 : PORT_R}
                    fill={isPortTarget ? spec.color : "#ffffff"}
                    stroke={spec.color}
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                  {/* output port */}
                  <circle
                    className="ab-port"
                    cx={NODE_W / 2}
                    cy={0}
                    r={PORT_R}
                    fill="#ffffff"
                    stroke={spec.color}
                    strokeWidth="2"
                    onPointerDown={(e) => startConnect(e, node)}
                  />

                  {/* card + delete handle share one hover region */}
                  <g
                    onPointerEnter={() => setHoveredNode(node.id)}
                    onPointerLeave={() => setHoveredNode((h) => (h === node.id ? null : h))}
                  >
                    <g
                      className="ab-node"
                      filter="url(#ab-shadow)"
                      onPointerDown={(e) => startNodeDrag(e, node)}
                    >
                      <rect
                        x={-NODE_W / 2}
                        y={-NODE_H / 2}
                        width={NODE_W}
                        height={NODE_H}
                        rx={12}
                        fill="#ffffff"
                        stroke={isActive || isHovered ? spec.color : isUnlinked ? "#f59e0b" : "#e2e8f0"}
                        strokeWidth={isActive ? 2 : isHovered ? 1.8 : isUnlinked ? 1.4 : 1.2}
                        strokeDasharray={isUnlinked && !isActive && !isHovered ? "5 4" : undefined}
                      />
                      {/* icon tile */}
                      <rect
                        x={-NODE_W / 2 + 12}
                        y={-14}
                        width={28}
                        height={28}
                        rx={9}
                        fill={spec.color}
                        fillOpacity="0.12"
                      />
                      <g transform={`translate(${-NODE_W / 2 + 26} 0)`}>
                        <AgentGlyph kind={node.kind} color={spec.color} />
                      </g>

                      <text className="ab-label" x={-NODE_W / 2 + 50} y={-2}>
                        {spec.label}
                      </text>
                      <text className="ab-sub" x={-NODE_W / 2 + 50} y={12}>
                        {isUnlinked
                          ? "needs a link"
                          : node.kind === "orchestrator"
                            ? "coordinator"
                            : fanIn > 0
                              ? `${fanIn} input${fanIn > 1 ? "s" : ""}`
                              : "linked"}
                      </text>
                    </g>

                    {/* delete handle */}
                    <g
                      className={`ab-del ${isHovered ? "show" : ""}`}
                      transform={`translate(${NODE_W / 2 - 6} ${-NODE_H / 2 - 2})`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                    >
                      <circle r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                      <path
                        d="M-3.2-3.2L3.2 3.2M3.2-3.2L-3.2 3.2"
                        stroke="#64748b"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* canvas overlay controls */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 backdrop-blur">
            <span className="font-mono text-[10px] tracking-[0.14em] text-slate-500 uppercase">
              {nodes.length} agents
            </span>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur transition hover:border-slate-300 hover:text-slate-900"
            >
              {running ? "Pause" : "Run"}
            </button>
            <button
              type="button"
              onClick={autoLayout}
              className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur transition hover:border-slate-300 hover:text-slate-900"
            >
              Arrange
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 backdrop-blur transition hover:border-slate-300 hover:text-slate-900"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 backdrop-blur transition hover:border-rose-200 hover:text-rose-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* notice */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-opacity duration-300"
          style={{ opacity: notice ? 1 : 0 }}
        >
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500 shadow-sm">
            {notice ?? "\u00A0"}
          </span>
        </div>
        </div>

        {/* terminal */}
        <div className="flex w-full flex-col border-t border-white/10 bg-[#0b1220] lg:w-[352px] lg:border-t-0 lg:border-l">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] text-slate-400">
                agent-run
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${streaming ? "ab-live-dot" : ""}`}
                style={{
                  background: streaming
                    ? "#34d399"
                    : !allConnected
                      ? "#f59e0b"
                      : lines.length
                        ? "#38bdf8"
                        : "#475569",
                }}
                aria-hidden
              />
            </div>
            <span className="font-mono text-[9px] tracking-[0.12em] text-slate-500 uppercase">
              {linkedIds.size}/{nodes.length} linked
            </span>
          </div>

          <div
            ref={outputRef}
            className="ab-term-body min-h-[220px] flex-1 overflow-y-auto px-4 py-3 lg:max-h-[460px]"
            aria-live="polite"
          >
            <div className="font-mono text-[11.5px] leading-relaxed">
              <div className="flex gap-2 text-slate-400">
                <span className="ab-term-prompt shrink-0">$</span>
                <span>orchestrate --task &quot;prepare Q3 briefing&quot;</span>
              </div>

              {!allConnected && (
                <div className="mt-2 flex gap-2 text-amber-400/90">
                  <span className="shrink-0">!</span>
                  <span>
                    {nodes.length < 2
                      ? "add at least two agents to begin"
                      : `waiting for ${nodes.length - linkedIds.size} unlinked agent${
                          nodes.length - linkedIds.size === 1 ? "" : "s"
                        }`}
                  </span>
                </div>
              )}

              {allConnected && lines.length === 0 && !streaming && (
                <div className="mt-2 flex gap-2 text-slate-400">
                  <span className="shrink-0">›</span>
                  <span>graph verified — starting run</span>
                </div>
              )}
            </div>

            {lines.map((line, i) => {
              const spec = SPEC_BY_KIND[line.kind];
              return (
                <div key={i} className="ab-out-line mt-2 flex gap-2 font-mono text-[11.5px] leading-relaxed">
                  <span className="shrink-0" style={{ color: spec.color }}>
                    [{spec.label.toLowerCase()}]
                  </span>
                  <span className="text-slate-300">{line.text}</span>
                </div>
              );
            })}

            {streaming && activeKind && (
              <div className="mt-2 flex gap-2 font-mono text-[11.5px] leading-relaxed">
                <span className="shrink-0" style={{ color: SPEC_BY_KIND[activeKind].color }}>
                  [{SPEC_BY_KIND[activeKind].label.toLowerCase()}]
                </span>
                <span className="text-slate-100">
                  {partial}
                  <span className="ab-term-caret" aria-hidden />
                </span>
              </div>
            )}

            {!streaming && lines.length > 0 && (
              <div className="mt-3 flex gap-2 font-mono text-[11.5px] text-slate-500">
                <span className="ab-term-prompt shrink-0">$</span>
                <span className="ab-term-caret" aria-hidden />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
            <span className="font-mono text-[9px] tracking-[0.12em] text-slate-500 uppercase">
              {streaming
                ? "streaming"
                : !allConnected
                  ? "blocked"
                  : lines.length
                    ? "complete"
                    : "ready"}
            </span>
            <span className="font-mono text-[9px] tracking-[0.12em] text-slate-600 uppercase">
              {edges.length} links
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
        Drag a card to move it · drag from a card&apos;s right port onto another card to connect ·
        once every agent is linked the run streams into the terminal on the right
      </p>
    </div>
  );
}
