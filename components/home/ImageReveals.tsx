"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "The employee can see" — three ways of showing that the system reads more
 * than the surface. Each uses a different mechanism so the section never
 * repeats itself: a mask (spotlight), a shader-free tint swap (x-ray), and a
 * magnified lens (displacement).
 */

const IMG = "/media/images/ai_employee.png";

/* ------------------------------------------------------------------ *
 *  1. Spotlight reveal — a soft circular mask follows the cursor and
 *     exposes a second, annotated layer underneath.
 * ------------------------------------------------------------------ */
export function SpotlightReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50, on: false });

  return (
    <figure className="group relative">
      <div
        ref={ref}
        data-cursor="EXPLORE"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
            on: true,
          });
        }}
        onPointerLeave={() => setPos((p) => ({ ...p, on: false }))}
        className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-ink"
      >
        {/* Base layer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG}
          alt="An AI employee rendered as a luminous abstract entity"
          className="absolute inset-0 size-full object-cover opacity-70 grayscale"
        />

        {/* Interpreted layer, revealed by the spotlight mask */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: pos.on ? 1 : 0,
            maskImage: `radial-gradient(150px circle at ${pos.x}% ${pos.y}%, #000 0%, #000 62%, transparent 78%)`,
            WebkitMaskImage: `radial-gradient(150px circle at ${pos.x}% ${pos.y}%, #000 0%, #000 62%, transparent 78%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={IMG}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-signal/10 mix-blend-color" />
          {/* Semantic overlay */}
          <svg
            aria-hidden
            className="absolute inset-0 size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {[
              [22, 30, "entities"],
              [64, 24, "relations"],
              [40, 58, "intent"],
              [72, 68, "actions"],
              [18, 72, "state"],
            ].map(([x, y, l], i) => (
              <g key={l}>
                <rect
                  x={Number(x) - 9}
                  y={Number(y) - 4}
                  width="18"
                  height="8"
                  fill="none"
                  stroke="#ff4a1c"
                  strokeWidth="0.4"
                />
                <text
                  x={Number(x)}
                  y={Number(y) + 1.6}
                  fontSize="2.4"
                  fill="#ff4a1c"
                  textAnchor="middle"
                  fontFamily="ui-monospace, monospace"
                >
                  {l}
                </text>
                {i < 4 && (
                  <path
                    d={`M${Number(x) + 9} ${Number(y)} L${
                      Number(x) + 18
                    } ${Number(y)}`}
                    stroke="#ff4a1c"
                    strokeWidth="0.3"
                    strokeDasharray="1 1"
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Lens ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-signal/60 transition-opacity duration-300"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            opacity: pos.on ? 1 : 0,
          }}
        />
      </div>
      <figcaption className="u-mono mt-4 flex justify-between text-ash">
        <span>Surface</span>
        <span className="text-signal">Interpretation</span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 *  2. X-ray reveal — a second diagram layer is blended through the
 *     photograph using luminosity masking, localised to the cursor.
 * ------------------------------------------------------------------ */
export function XRayReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 50, y: 50, on: false });

  return (
    <figure>
      <div
        ref={ref}
        data-cursor="EXPLORE"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setP({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
            on: true,
          });
        }}
        onPointerLeave={() => setP((s) => ({ ...s, on: false }))}
        className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-graphite"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/images/bot_orchestraion.png"
          alt="A workspace as the AI employee perceives it"
          className="absolute inset-0 size-full object-cover grayscale"
        />

        {/* X-ray layer: data structures, tasks, agents, flows */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: p.on ? 1 : 0,
            maskImage: `radial-gradient(190px circle at ${p.x}% ${p.y}%, #000 0%, rgba(0,0,0,0.7) 55%, transparent 82%)`,
            WebkitMaskImage: `radial-gradient(190px circle at ${p.x}% ${p.y}%, #000 0%, rgba(0,0,0,0.7) 55%, transparent 82%)`,
          }}
        >
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
          >
            {/* structural grid */}
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={i * 12.5}
                y1="0"
                x2={i * 12.5}
                y2="100"
                stroke="#c8f432"
                strokeOpacity="0.16"
                strokeWidth="0.3"
              />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <line
                key={`h${i}`}
                x1="0"
                y1={i * 16}
                x2="100"
                y2={i * 16}
                stroke="#c8f432"
                strokeOpacity="0.16"
                strokeWidth="0.3"
              />
            ))}
            {/* flow paths */}
            <g stroke="#c8f432" strokeOpacity="0.5" strokeWidth="0.4" fill="none">
              <path d="M8 74 C 24 60, 30 44, 44 40 S 68 30, 90 22" />
              <path d="M12 30 C 28 34, 40 52, 56 56 S 78 70, 92 78" />
              <path d="M20 88 C 36 76, 50 66, 62 48" />
            </g>
            {/* nodes */}
            {[
              [44, 40],
              [56, 56],
              [90, 22],
              [92, 78],
              [62, 48],
              [24, 60],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="1.6" fill="#c8f432" />
                <circle
                  cx={x}
                  cy={y}
                  r="3.6"
                  fill="none"
                  stroke="#c8f432"
                  strokeOpacity="0.4"
                  strokeWidth="0.3"
                />
              </g>
            ))}
            <text
              x="4"
              y="6"
              fontSize="2.6"
              fill="#c8f432"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.4"
            >
              UNDERSTANDING
            </text>
          </svg>
          <div className="absolute inset-0 bg-acid/10 mix-blend-screen" />
        </div>
      </div>
      <figcaption className="u-mono mt-4 text-ash">
        What the system sees beneath the surface
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 *  3. Magnifier — the region under the cursor is scaled and displaced
 *     via background-position, so the lens feels cut from the image
 *     itself rather than pasted on top.
 * ------------------------------------------------------------------ */
export function MagnifierReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 50, y: 50, on: false });
  const ZOOM = 2.1;
  const R = 130;

  return (
    <figure>
      <div
        ref={ref}
        data-cursor="EXPLORE"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setP({
            x: (e.clientX - r.left) / r.width,
            y: (e.clientY - r.top) / r.height,
            on: true,
          });
        }}
        onPointerLeave={() => setP((s) => ({ ...s, on: false }))}
        className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-ink"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/images/ai_agent.png"
          alt="A specialised AI agent at work"
          className="absolute inset-0 size-full object-cover"
        />

        {/* Magnified copy, clipped to a circle */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full transition-opacity duration-200"
          style={{
            left: p.x * 100 + "%",
            top: p.y * 100 + "%",
            width: R * 2,
            height: R * 2,
            transform: "translate(-50%, -50%)",
            opacity: p.on ? 1 : 0,
            backgroundImage: "url(/media/images/ai_agent.png)",
            backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
            backgroundPosition: `${p.x * 100}% ${p.y * 100}%`,
            backgroundRepeat: "no-repeat",
            boxShadow:
              "inset 0 0 0 1px rgba(255,74,28,0.8), 0 20px 50px -20px rgba(18,19,23,0.5)",
          }}
        />
        {/* Chromatic edge — subtle, one pixel of warmth */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-full transition-opacity duration-200"
          style={{
            left: p.x * 100 + "%",
            top: p.y * 100 + "%",
            width: R * 2 + 2,
            height: R * 2 + 2,
            transform: "translate(-50%, -50%)",
            opacity: p.on ? 0.5 : 0,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "rgba(255,74,28,0.35)",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <figcaption className="u-mono mt-4 text-ash">
        Magnified 2.1&times; &middot; detail preserved from the source
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 *  4. Scratch-off — the surface says "what AI sees"; dragging removes it
 *     to expose the workflow underneath. Canvas, pointer-events based so
 *     it works with touch too.
 * ------------------------------------------------------------------ */
export function ScratchReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  // Imperative bridge so the keyboard path can drive the same canvas ops.
  const ctxRef = useRef<{
    clearAll: () => void;
    scratchLine: (x1: number, y1: number, x2: number, y2: number) => void;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const paint = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#121317";
      ctx.fillRect(0, 0, w, h);
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(wrap);

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 46;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const last = lastPt.current;
      if (last) {
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 23, 0, Math.PI * 2);
        ctx.fill();
      }
      lastPt.current = { x, y };

      // How much is gone?
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4 * 40) if (data[i] < 40) cleared++;
      if (cleared > (data.length / (4 * 40)) * 0.35) setDone(true);
    };

    // Keyboard equivalents — the reveal must never be pointer-only.
    ctxRef.current = {
      clearAll: () => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillRect(0, 0, w, h);
      },
      scratchLine: (x1, y1, x2, y2) => {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 46;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      },
    };

    const local = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      lastPt.current = null;
      canvas.setPointerCapture(e.pointerId);
      const p = local(e);
      scratch(p.x, p.y);
    };
    const move = (e: PointerEvent) => {
      if (!canvas.hasPointerCapture(e.pointerId)) return;
      const p = local(e);
      scratch(p.x, p.y);
    };
    const up = (e: PointerEvent) => {
      lastPt.current = null;
      if (canvas.hasPointerCapture(e.pointerId))
        canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      ro.disconnect();
      ctxRef.current = null;
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <figure>
      <div
        ref={wrapRef}
        className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-ivory"
      >
        {/* The revealed layer — a real workflow diagram */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <rect width="100" height="100" fill="#faf8f4" />
          <g stroke="#121317" strokeOpacity="0.14" strokeWidth="0.3">
            {Array.from({ length: 11 }, (_, i) => (
              <line key={i} x1={i * 10} y1="0" x2={i * 10} y2="100" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1="0" y1={i * 12.5} x2="100" y2={i * 12.5} />
            ))}
          </g>
          <g stroke="#121317" strokeWidth="0.5" fill="none">
            <path d="M12 24 L30 24 L30 40 L48 40 L48 24 L70 24" />
            <path d="M12 62 L34 62 L34 52 L70 52 L70 62 L88 62" />
            <path d="M48 40 L48 76 L70 76" />
          </g>
          {[
            [12, 24],
            [30, 40],
            [48, 24],
            [70, 24],
            [12, 62],
            [34, 52],
            [48, 76],
            [88, 62],
          ].map(([x, y], i) => (
            <g key={i}>
              <rect
                x={x - 3}
                y={y - 3}
                width="6"
                height="6"
                fill="#faf8f4"
                stroke="#121317"
                strokeWidth="0.5"
              />
              <circle
                cx={x}
                cy={y}
                r="1"
                fill={i === 7 ? "#c8f432" : "#ff4a1c"}
              />
            </g>
          ))}
          <text
            x="6"
            y="92"
            fontSize="3"
            fill="#121317"
            fontFamily="ui-monospace, monospace"
            letterSpacing="0.5"
          >
            RESOLVED WORKFLOW · 8 NODES · VERIFIED
          </text>
        </svg>

        {/* The surface */}
        <canvas
          ref={canvasRef}
          data-cursor="DRAG"
          role="button"
          tabIndex={0}
          aria-pressed={done}
          aria-label="Scratch away the surface to reveal the resolved workflow beneath. Drag, or use the arrow keys to clear it; press Enter to clear it entirely."
          onKeyDown={(e) => {
            // Keyboard equivalent: arrows clear part of the surface, Enter
            // clears the rest so the revealed diagram is never unreachable.
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              ctxRef.current?.clearAll();
              setDone(true);
              return;
            }
            const nudge = 48;
            const dx = e.key === "ArrowRight" ? nudge : e.key === "ArrowLeft" ? -nudge : 0;
            const dy = e.key === "ArrowDown" ? nudge : e.key === "ArrowUp" ? -nudge : 0;
            if (!dx && !dy) return;
            e.preventDefault();
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            ctxRef.current?.scratchLine(
              rect.width / 2,
              rect.height / 2,
              rect.width / 2 + dx,
              rect.height / 2 + dy
            );
          }}
          className="absolute inset-0 size-full touch-none"
        />

        {/* Label on the surface, fades once scratched */}
        <div
          className={`pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-500 ${
            done ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="u-mono bg-ink px-4 py-2 text-paper">
            Drag to remove this surface
          </span>
        </div>

        {done && (
          <span className="u-mono absolute bottom-4 right-4 inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-paper">
            <span className="size-1.5 rounded-full bg-acid" />
            Underneath
          </span>
        )}
      </div>
      <figcaption className="u-mono mt-4 flex justify-between text-ash">
        <span>What AI sees</span>
        <span className="text-signal">What the system understands</span>
      </figcaption>
    </figure>
  );
}