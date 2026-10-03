"use client";

import { useEffect, useRef, useState } from "react";
import { TOOLS } from "@/lib/site";
import { useIsCoarsePointer } from "@/lib/use-webgl";
import { EntityModel } from "@/components/three/EntityModel";

type Node = { x: number; y: number; r: number; vx: number; vy: number; a: number };

/**
 * Tool ecosystem — not a logo grid. Tools drift as particles; hovering one
 * pulls it toward the cursor, grows a live connection to the employee at the
 * centre, sends packets down it, and lights the whole chain up.
 */
export function ToolEcosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const coarse = useIsCoarsePointer();
  const active = hover ?? pinned;
  // Mirror of `active` so the rAF loop reads the current selection without the
  // effect (and its listeners) being torn down on every hover.
  const activeRef = useRef<number | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Deterministic-ish scatter with gentle orbital drift.
    const nodes: Node[] = TOOLS.map((tool, i) => {
      const a = (i / TOOLS.length) * Math.PI * 2 + (i % 3) * 0.3;
      const r = 0.26 + ((i * 37) % 100) / 100 * 0.2;
      return {
        x: 0.5 + Math.cos(a) * r,
        y: 0.5 + Math.sin(a) * r * 0.82,
        r,
        vx: Math.cos(a * 1.7) * 0.06,
        vy: Math.sin(a * 1.3) * 0.06,
        a,
      };
    });

    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      { rootMargin: "150px" }
    );
    io.observe(wrap);

    const mouse = { x: -999, y: -999, active: false };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      const sel = activeRef.current;
      const cx = w / 2;
      const cy = h / 2;

      // Centre node — the AI employee
      ctx.strokeStyle = "rgba(18,19,23,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ff4a1c";
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Physics
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.a += 0.0004 + (i % 5) * 0.00006;

        // Drift around its orbital anchor.
        const ax = 0.5 + Math.cos(n.a + i) * n.r;
        const ay = 0.5 + Math.sin(n.a * 1.1 + i) * n.r * 0.82;
        n.x += (ax - n.x) * 0.006;
        n.y += (ay - n.y) * 0.006;

        // Magnetic pull toward the cursor while selected.
        if (sel === i) {
          n.x += (mouse.x / w - n.x) * 0.07;
          n.y += (mouse.y / h - n.y) * 0.07;
        }
      }

      // Links: always a faint ring, bright for the active chain.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const nx = n.x * w;
        const ny = n.y * h;
        const d = Math.hypot(nx - cx, ny - cy);
        const isActive = sel === i;
        const base = Math.max(0, 1 - d / (w * 0.5));
        ctx.strokeStyle = isActive
          ? "rgba(255,74,28,0.55)"
          : `rgba(18,19,23,${0.05 + base * 0.07})`;
        ctx.lineWidth = isActive ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }

      // Packets travelling down the active connection.
      if (sel !== null) {
        const n = nodes[sel];
        for (let k = 0; k < 3; k++) {
          const u = (t * (0.5 + k * 0.12) + k / 3) % 1;
          const px = cx + (n.x * w - cx) * u;
          const py = cy + (n.y * h - cy) * u;
          ctx.fillStyle = `rgba(255,74,28,${1 - u * 0.7})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const nx = n.x * w;
        const ny = n.y * h;
        const isActive = sel === i;
        ctx.beginPath();
        ctx.arc(nx, ny, isActive ? 17 : 13, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "#121317" : "rgba(242,238,231,0.9)";
        ctx.fill();
        ctx.strokeStyle = isActive ? "#ff4a1c" : "rgba(18,19,23,0.2)";
        ctx.lineWidth = isActive ? 1.4 : 0.8;
        ctx.stroke();

        ctx.fillStyle = isActive ? "#f2eee7" : "rgba(18,19,23,0.6)";
        ctx.font = "600 9px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(TOOLS[i].glyph, nx, ny + 0.5);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
      // Hit test against nodes.
      let found: number | null = null;
      for (let i = 0; i < nodes.length; i++) {
        const nx = nodes[i].x * w;
        const ny = nodes[i].y * h;
        if (Math.hypot(mouse.x - nx, mouse.y - ny) < 26) {
          found = i;
          break;
        }
      }
      setHover(found);
    };
    const onLeave = () => {
      mouse.active = false;
      setHover(null);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const activeTool = active !== null ? TOOLS[active] : null;

  return (
    <section
      id="tools"
      aria-label="Tool ecosystem"
      className="relative scroll-mt-24 bg-paper-2 py-24 md:py-32"
    >
      <div className="u-shell">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> Chapter 09 / Tools
            </p>
            <h2 className="u-display text-[clamp(2.4rem,6.4vw,5.4rem)]">
              It can
              <br />
              actually <span className="u-serif text-signal">act.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-graphite">
            An employee is only as useful as what it can reach. Hover any tool to
            watch the connection form.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div
            ref={wrapRef}
            data-cursor="EXPLORE"
            role="img"
            aria-label={`Tool ecosystem: ${TOOLS.length} integrations orbiting the AI Employee. The adjacent list names each tool and its category.`}
            className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-ivory lg:aspect-[16/11]"
          >
            <canvas ref={canvasRef} className="absolute inset-0" />

            {/* Centre label */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-14 text-center">
              <span className="u-mono text-ash">AI Employee</span>
            </div>

            {/* Touch affordance — list of tools for coarse pointers */}
            {coarse && (
              <ul className="absolute inset-x-0 bottom-0 flex flex-wrap gap-px bg-ink/10 p-px">
                {TOOLS.slice(0, 10).map((tool, i) => (
                  <li key={tool.name} className="flex-1">
                    <button
                      type="button"
                      onClick={() => setPinned(pinned === i ? null : i)}
                      className={`u-mono w-full px-2 py-2 transition-colors ${
                        pinned === i ? "bg-ink text-paper" : "bg-ivory"
                      }`}
                    >
                      {tool.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Metadata panel */}
          <aside className="flex flex-col border border-ink/12 bg-ivory">
            <div className="border-b border-ink/10 px-6 py-4">
              <span className="u-mono text-ash">Active connection</span>
            </div>
            <div className="flex-1 px-6 py-6">
              {activeTool ? (
                <>
                  <span
                    className="u-mono inline-flex items-center gap-2 text-signal"
                  >
                    <span className="size-1.5 rounded-full bg-signal" />
                    Connected
                  </span>
                  <p className="u-display mt-4 text-4xl">{activeTool.name}</p>
                  <p className="u-mono mt-2 text-ash">{activeTool.cat}</p>
                  <dl className="mt-8 space-y-3 border-t border-ink/10 pt-5">
                    {[
                      ["Direction", "Bidirectional"],
                      ["Auth", "Scoped OAuth"],
                      ["Latency", "~240 ms"],
                      ["Retries", "Automatic ×3"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="u-mono text-ash">{k}</dt>
                        <dd className="u-mono">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p className="max-w-[18rem] text-sm leading-relaxed text-graphite">
                  Every connection is scoped, logged and reversible. The employee
                  asks before it acts on anything it cannot undo.
                </p>
              )}
            </div>
            <div className="border-t border-ink/10 px-6 py-4">
              <span className="u-mono text-ash">
                {TOOLS.length} integrations · 9 categories
              </span>
            </div>
          </aside>
        </div>

        {/* The hardware it all runs on. Scaled to the same visual grammar as
            the ecosystem above — a plate, a caption, a monospace label — so
            the substrate reads as part of the same system. */}
        <div className="mt-8 border border-ink/12 bg-ivory">
          <div className="grid items-center gap-0 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative aspect-square lg:aspect-auto lg:h-[26rem]">
              <EntityModel
                src="/media/models/compute.glb"
                radius={0.82}
                spin={0.14}
              />
              <span
                aria-hidden
                className="u-mono pointer-events-none absolute bottom-4 left-4 text-ash"
              >
                SUBSTRATE · ALWAYS ON
              </span>
              <span
                aria-hidden
                className="u-mono pointer-events-none absolute bottom-4 right-4 text-ash"
              >
                DRAG TO ORBIT
              </span>
            </div>

            <div className="border-t border-ink/10 p-8 lg:border-l lg:border-t-0 lg:p-12">
              <p className="u-mono mb-5 text-signal">
                ▸ Where the work actually lands
              </p>
              <h3 className="u-display text-[clamp(1.7rem,3.6vw,2.8rem)]">
                Tools are only
                <br />
                as good as the
                <br />
                <span className="u-serif text-signal">box beneath them.</span>
              </h3>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-graphite">
                Every connection above eventually resolves to silicon. The
                employee decides what to call and in what order; this is what
                answers, and how long it is allowed to take.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-px border border-ink/12 bg-ink/12">
                {[
                  ["35", "compute nodes"],
                  ["2", "redundant zones"],
                  ["99.9%", "measured uptime"],
                ].map(([n, l]) => (
                  <div key={l} className="bg-ivory px-4 py-4">
                    <dt className="u-display text-2xl">{n}</dt>
                    <dd className="u-mono mt-1 text-ash">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}