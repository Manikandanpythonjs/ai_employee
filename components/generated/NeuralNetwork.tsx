"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Neural Network — premium redesign with depth and flow             */
/* ------------------------------------------------------------------ */

const CANVAS_W = 820;
const CANVAS_H = 500;

type Node = {
  id: string;
  x: number;
  y: number;
  r: number;
  layer: number;
  color: string;
  glowColor: string;
  label: string;
  energy: number;
};

type Connection = {
  id: string;
  from: Node;
  to: Node;
  weight: number;
};

type Pulse = {
  id: number;
  connId: string;
  t: number;
  speed: number;
  color: string;
  size: number;
  trail: { x: number; y: number }[];
};

const LAYER_CONFIG = [
  { count: 4, x: 0.12, colors: ["#818cf8", "#6366f1", "#a5b4fc", "#c7d2fe"], label: "INPUT" },
  { count: 5, x: 0.38, colors: ["#38bdf8", "#0ea5e9", "#7dd3fc", "#bae6fd", "#0284c7"], label: "HIDDEN" },
  { count: 6, x: 0.62, colors: ["#34d399", "#10b981", "#6ee7b7", "#a7f3d0", "#059669", "#047857"], label: "HIDDEN" },
  { count: 3, x: 0.88, colors: ["#fbbf24", "#f59e0b", "#d97706"], label: "OUTPUT" },
];

let pulseIdCounter = 0;

function buildNetwork(): { nodes: Node[]; connections: Connection[] } {
  const nodes: Node[] = [];

  LAYER_CONFIG.forEach((layer, li) => {
    const x = layer.x * CANVAS_W;
    const spacing = CANVAS_H / (layer.count + 1);
    for (let i = 0; i < layer.count; i++) {
      const y = spacing * (i + 1);
      const color = layer.colors[i % layer.colors.length];
      nodes.push({
        id: `n-${li}-${i}`,
        x,
        y,
        r: 7,
        layer: li,
        color,
        glowColor: color,
        label: `${layer.label[0]}${i + 1}`,
        energy: 0,
      });
    }
  });

  const connections: Connection[] = [];
  for (let li = 0; li < LAYER_CONFIG.length - 1; li++) {
    const fromNodes = nodes.filter((n) => n.layer === li);
    const toNodes = nodes.filter((n) => n.layer === li + 1);
    for (const from of fromNodes) {
      for (const to of toNodes) {
        const weight = 0.3 + Math.random() * 0.7;
        connections.push({ id: `c-${from.id}-${to.id}`, from, to, weight });
      }
    }
  }

  return { nodes, connections };
}

function smoothPath(ax: number, ay: number, bx: number, by: number) {
  const mx = (ax + bx) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const qx = mx + (-dy) * 0.1;
  const qy = (ay + by) / 2 + dx * 0.05;
  return `M ${ax} ${ay} Q ${qx} ${qy} ${bx} ${by}`;
}

/**
 * Point on a connection at parameter t, solved from the same control point
 * `smoothPath` emits.
 *
 * The obvious version measures the rendered path with `getTotalLength()` and
 * `getPointAtLength()`, which means reading a ref during render — and it is
 * also only available after layout. The quadratic is cheap enough to solve
 * directly, so the pulse position is a pure function of the connection and t.
 */
function pointOnPath(ax: number, ay: number, bx: number, by: number, t: number) {
  const mx = (ax + bx) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const qx = mx + (-dy) * 0.1;
  const qy = (ay + by) / 2 + dx * 0.05;

  const u = 1 - t;
  return {
    x: u * u * ax + 2 * u * t * qx + t * t * bx,
    y: u * u * ay + 2 * u * t * qy + t * t * by,
  };
}

export default function NeuralNetwork({ className = "" }: { className?: string }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [energyMap, setEnergyMap] = useState<Record<string, number>>({});
  const animRef = useRef<number>(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef(true);

  /* The graph is random, so it cannot be built in a state initialiser: that
     would run on the server during SSR and again on the client, producing two
     different graphs and a hydration mismatch. It is built one tick after
     mount instead — the write is deferred out of the effect body, and the
     first paint is an empty canvas rather than a wrong one. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      const { nodes: n, connections: c } = buildNetwork();
      setNodes(n);
      setConnections(c);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const spawnPulse = useCallback(() => {
    if (connections.length === 0) return;
    const conn = connections[Math.floor(Math.random() * connections.length)];
    pulseIdCounter++;
    setPulses((prev) => [
      ...prev.slice(-35),
      {
        id: pulseIdCounter,
        connId: conn.id,
        t: 0,
        speed: 0.012 + Math.random() * 0.015,
        color: conn.from.color,
        size: 4 + Math.random() * 2,
        trail: [],
      },
    ]);
  }, [connections]);

  /* Both loops below are gated on viewport visibility.
   *
   * This component drives ~60 state updates a second — a pulse spawn, a pulse
   * advance, and an energy-map merge — and every one of them re-renders an SVG
   * holding roughly a hundred connections, each pulse with a five-point trail,
   * and every node with up to three circles plus two SMIL animations. That is
   * by far the most expensive thing on the page when it runs, and it was
   * running unconditionally for the entire session regardless of whether the
   * plate was anywhere near the viewport.
   *
   * Off screen it is now fully idle: no spawning, no advancing, no renders.
   * On screen it is throttled to ~24fps, which is indistinguishable for
   * travelling dots but roughly halves the render cost. */
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
    if (typeof IntersectionObserver === "undefined") return;
    const id = window.setInterval(() => {
      if (liveRef.current) spawnPulse();
    }, 160);
    return () => window.clearInterval(id);
  }, [spawnPulse]);

  useEffect(() => {
    const STEP_MS = 1000 / 24;
    let lastStep = 0;

    const animate = (now: number) => {
      animRef.current = requestAnimationFrame(animate);

      if (!liveRef.current || now - lastStep < STEP_MS) return;
      lastStep = now;

      setPulses((prev) => {
        const updated: Pulse[] = [];
        const newEnergy: Record<string, number> = {};

        for (const p of prev) {
          p.t += p.speed;
          if (p.t >= 1) continue;

          updated.push(p);

          /* track energy on endpoints */
          const conn = connections.find((c) => c.id === p.connId);
          if (conn) {
            if (p.t < 0.5) {
              const key = conn.from.id;
              newEnergy[key] = (newEnergy[key] || 0) + (1 - p.t) * 0.3;
            }
            if (p.t > 0.4) {
              const key = conn.to.id;
              newEnergy[key] = (newEnergy[key] || 0) + p.t * 0.3;
            }
          }
        }

        setEnergyMap((prev) => {
          const merged = { ...prev };
          for (const [k, v] of Object.entries(newEnergy)) {
            merged[k] = Math.min((prev[k] || 0) * 0.92 + v, 1);
          }
          for (const k of Object.keys(merged)) {
            if (!(k in newEnergy)) merged[k] *= 0.9;
            if (merged[k] < 0.01) delete merged[k];
          }
          return merged;
        });

        return updated;
      });
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [connections]);

  const getPulsePos = useCallback(
    (connId: string, t: number): { x: number; y: number } | null => {
      const conn = connections.find((c) => c.id === connId);
      if (!conn) return null;
      return pointOnPath(conn.from.x, conn.from.y, conn.to.x, conn.to.y, t);
    },
    [connections]
  );

  const totalNodes = nodes.length;
  const totalConns = connections.length;
  const activePulses = pulses.length;

  return (
    <div ref={hostRef} className={`neural-net relative w-full overflow-hidden ${className}`}>
      <style>{`
        .neural-net { container-type: inline-size; }
        .nn-svg { width: 100%; height: auto; display: block; }
        .nn-title { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 9px; letter-spacing: 0.35em; fill: #94a3b8; text-anchor: middle; }
        .nn-stat { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 7px; letter-spacing: 0.1em; fill: #cbd5e1; }
        .nn-layer-label { font-family: var(--font-geist-mono), ui-monospace, monospace; font-size: 6.5px; letter-spacing: 0.18em; fill: #94a3b8; text-anchor: middle; }

        @keyframes float-ring { to { transform: rotate(360deg); } }
        .float-ring { transform-box: view-box; transform-origin: 50% 50%; animation: float-ring 60s linear infinite; }

        @keyframes breathe-glow {
          0%, 100% { r: 160; opacity: 0.06; }
          50% { r: 180; opacity: 0.12; }
        }
        .breathe-glow { animation: breathe-glow 5s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .float-ring, .breathe-glow { animation: none !important; }
        }
      `}</style>

      <svg className="nn-svg" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Neural network visualization">
        <defs>
          <filter id="glow-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* background */}
        <rect width={CANVAS_W} height={CANVAS_H} fill="#ffffff" />
        <rect x="0.5" y="0.5" width={CANVAS_W - 1} height={CANVAS_H - 1} rx="16" fill="none" stroke="#e2e8f0" strokeWidth="1" />

        {/* background decorative rings */}
        <circle className="float-ring" cx={CANVAS_W / 2} cy={CANVAS_H / 2} r="200" fill="none" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="4 16" />
        <circle className="float-ring" cx={CANVAS_W / 2} cy={CANVAS_H / 2} r="280" fill="none" stroke="#f8fafc" strokeWidth="0.4" strokeDasharray="2 24" />

        {/* center breathing glow */}
        <circle className="breathe-glow" cx={CANVAS_W / 2} cy={CANVAS_H / 2} r="170" fill="#6366f1" />

        {/* layer labels at top */}
        <g>
          {LAYER_CONFIG.map((layer, li) => {
            const x = layer.x * CANVAS_W;
            return (
              <g key={li}>
                <text x={x} y="32" className="nn-layer-label">{layer.label}</text>
              </g>
            );
          })}
        </g>

        {/* connections with weight-based opacity */}
        <g>
          {connections.map((conn) => {
            const d = smoothPath(conn.from.x, conn.from.y, conn.to.x, conn.to.y);
            return (
              <path
                key={conn.id}
                d={d}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={0.6 + conn.weight * 0.6}
                opacity={0.3 + conn.weight * 0.4}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* travelling pulses with trails */}
        <g>
          {pulses.map((p) => {
            const pos = getPulsePos(p.connId, p.t);
            if (!pos) return null;

            const trail: { x: number; y: number }[] = [];
            for (let step = 0; step < 5; step++) {
              const tp = getPulsePos(p.connId, Math.max(0, p.t - step * 0.04));
              if (tp) trail.push(tp);
            }

            return (
              <g key={p.id}>
                {/* trail */}
                {trail.map((tp, ti) => (
                  <circle
                    key={ti}
                    cx={tp.x}
                    cy={tp.y}
                    r={p.size * (1 - ti * 0.18)}
                    fill={p.color}
                    opacity={(1 - ti * 0.2) * 0.3}
                  />
                ))}
                {/* glow */}
                <circle cx={pos.x} cy={pos.y} r={p.size * 2.5} fill={p.color} opacity="0.12" filter="url(#glow-strong)" />
                {/* core */}
                <circle cx={pos.x} cy={pos.y} r={p.size} fill={p.color} />
                {/* bright center */}
                <circle cx={pos.x} cy={pos.y} r={p.size * 0.4} fill="#ffffff" opacity="0.85" />
              </g>
            );
          })}
        </g>

        {/* nodes */}
        <g>
          {nodes.map((node) => {
            const energy = energyMap[node.id] || 0;
            const isEnergized = energy > 0.2;

            return (
              <g key={node.id}>
                {/* energy glow */}
                {isEnergized && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 8 + energy * 4}
                    fill={node.glowColor}
                    opacity={energy * 0.25}
                    filter="url(#glow-soft)"
                  />
                )}
                {/* node body */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill="#ffffff"
                  stroke={node.color}
                  strokeWidth={isEnergized ? 2.5 : 1.5}
                />
                {/* inner fill based on energy */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r * (0.3 + energy * 0.5)}
                  fill={node.color}
                  opacity={0.2 + energy * 0.6}
                />
                {/* pulse ring when energized */}
                {isEnergized && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 2}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1"
                    opacity={energy * 0.6}
                  >
                    <animate attributeName="r" from={node.r + 2} to={node.r + 10} dur="0.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from={energy * 0.6} to="0" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        {/* top header */}
        <g transform={`translate(${CANVAS_W / 2} 56)`}>
          <text className="nn-title">NEURAL NETWORK</text>
        </g>

        {/* bottom stats bar */}
        <g transform={`translate(${CANVAS_W / 2} ${CANVAS_H - 22})`}>
          <circle cx="-120" cy="0" r="3" fill="#6366f1" opacity="0.7" />
          <text x="-112" y="3" className="nn-stat" textAnchor="start">{totalNodes} NODES</text>
          <circle cx="-30" cy="0" r="3" fill="#0284c7" opacity="0.7" />
          <text x="-22" y="3" className="nn-stat" textAnchor="start">{totalConns} CONNECTIONS</text>
          <circle cx="70" cy="0" r="3" fill="#10b981" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="78" y="3" className="nn-stat" textAnchor="start">{activePulses} ACTIVE PULSES</text>
        </g>
      </svg>
    </div>
  );
}
