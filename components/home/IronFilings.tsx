"use client";

import { useEffect, useRef, useState } from "react";
import { useIsCoarsePointer, useReducedMotion } from "@/lib/use-webgl";
import { clamp } from "@/lib/scroll-signal";

const COUNT = 2600;

/**
 * Iron filings. Thousands of particles start scattered and inert, then align
 * along invisible magnetic fields as the employee activates, resolving into a
 * node network. Scroll rewrites the field, so the shape is never static.
 *
 * Fields are analytic (a ring, a dipole, a lattice), sampled per particle —
 * cheap enough to run at 60fps in 2D and it still reads as a magnetic field.
 */
export function IronFilings() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const coarse = useIsCoarsePointer();
  const [field, setField] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    if (reduced) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let visible = false;
    // Document-space top of the figure, kept current by the scroll listener.
    let top = 0;

    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Cached here because the draw loop needs it every frame, and
      // `getBoundingClientRect()` inside that loop forces a synchronous layout
      // of the whole document sixty times a second. The rect only moves when the
      // page scrolls, so it is refreshed on scroll instead — same value, no
      // reflow.
      top = wrap.getBoundingClientRect().top + window.scrollY;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const N = coarse ? Math.floor(COUNT / 3) : COUNT;

    // Each filing has a random home (inert) and a target on the field lattice.
    const P = Array.from({ length: N }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      // Target: concentric rings of nodes, like an orchestration graph.
      const ring = Math.floor(Math.random() * 4);
      const rr = 0.14 + ring * 0.11;
      const perRing = 6 + ring * 6;
      const nth = Math.floor(Math.random() * perRing);
      const nodeAngle = (nth / perRing) * Math.PI * 2 + ring * 0.4;
      return {
        hx: Math.random(), // home x
        hy: Math.random(), // home y
        tx: 0.5 + Math.cos(nodeAngle) * rr + Math.cos(a) * 0.012,
        ty: 0.5 + Math.sin(nodeAngle) * rr * 0.86 + Math.sin(a) * 0.012,
        x: Math.random(),
        y: Math.random(),
        vx: 0,
        vy: 0,
        seed: i,
      };
    });

    const io = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      { rootMargin: "200px" }
    );
    io.observe(wrap);

    let t = 0;
    const mouse = { x: 0.5, y: 0.5, on: false };

    /* Pointer position, normalised against the figure's box.
     *
     * `getBoundingClientRect()` is read here — outside the draw loop — and the
     * result is cached. Pointer events fire far less often than frames, and a
     * rect read is a synchronous layout of the whole document, so doing this
     * once per event rather than once per frame keeps a mousemove from competing
     * with the render loop for the same main thread. */
    let box = wrap.getBoundingClientRect();
    const remeasure = () => {
      box = wrap.getBoundingClientRect();
    };
    window.addEventListener("scroll", remeasure, { passive: true });

    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX - box.left) / box.width;
      mouse.y = (e.clientY - box.top) / box.height;
      mouse.on = true;
    };

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      t += 0.01;

      // Field strength from scroll through the section. Everything here must
      // live in one coordinate frame: `r.top` is viewport-relative, so the
      // figure's own offset has to be measured against the viewport too. The
      // old version added `window.scrollY` to a viewport-relative line, mixing
      // a document coordinate with a viewport one; at any real scroll depth the
      // ratio went negative and clamped to 0, so the readout was stuck at 000%
      // and the filings stayed inert however far you scrolled.
      //
      // Measured centre-to-centre and scaled by viewport height so it reads
      // 0 as the figure arrives at the bottom edge and reaches 1 once its
      // centre is halfway up the viewport. A pure fraction-of-height range
      // never got past ~0.6 for a figure this tall, so the lattice never fully
      // resolved and never reached the orange, fully-magnetised state.
      //
      // `top` is the document-space position cached at resize; converting back
      // to viewport space here means no layout read happens per frame.
      const centreOffset = top + h * 0.5 - window.scrollY - window.innerHeight * 0.5;
      const strength = clamp(0.5 - centreOffset / window.innerHeight);
      setField((prev) => (Math.abs(prev - strength) > 0.02 ? strength : prev));

      ctx.clearRect(0, 0, w, h);

      // Cursor is a moving local attractor — the "magnet" you can feel.
      const mx = mouse.on ? mouse.x : 0.5;
      const my = mouse.on ? mouse.y : 0.42;

      for (let i = 0; i < N; i++) {
        const f = P[i];

        // Everything below stays in normalised 0..1 space. The previous version
        // multiplied the spring error by the canvas size before damping it,
        // which made the effective stiffness ~20 — well past this integrator's
        // stability limit of ~4.2. The filings diverged to 1e150 within a few
        // frames, so every fillRect landed far off-canvas and the panel looked
        // empty even though the loop was running.
        const gx = f.hx + (f.tx - f.hx) * strength;
        const gy = f.hy + (f.ty - f.hy) * strength;
        let ax = gx;
        let ay = gy;

        // Cursor is a local attractor — the "magnet" you can feel. Normalised
        // too, so it works the same at any canvas size.
        if (mouse.on) {
          const cdx = mx - f.x;
          const cdy = my - f.y;
          const cd = Math.hypot(cdx, cdy) || 1;
          const infl = Math.max(0, 1 - cd / 0.28) * strength;
          ax += (cdx / cd) * infl * 0.1;
          ay += (cdy / cd) * infl * 0.1;
        }

        // Tangential swirl, fading as the field takes hold, so the inert
        // scatter still breathes instead of sitting dead still.
        const ang = Math.sin(t * 0.7 + f.seed * 0.13) * (1 - strength) * 0.004;
        ax += -(f.y - 0.5) * ang;
        ay += (f.x - 0.5) * ang;

        // Damped spring toward the blended target, stiffness kept inside the
        // stable range.
        f.vx += (ax - f.x) * 0.02;
        f.vy += (ay - f.y) * 0.02;
        f.vx *= 0.9;
        f.vy *= 0.9;
        f.x += f.vx;
        f.y += f.vy;

        const on = strength > 0.35;
        ctx.fillStyle = on
          ? strength > 0.75
            ? "rgba(255,74,28,0.85)"
            : "rgba(18,19,23,0.6)"
          : "rgba(18,19,23,0.22)";
        ctx.fillRect(f.x * w, f.y * h, on ? 1.6 : 1.1, on ? 1.6 : 1.1);
      }

      // Field rings, faint, to imply the magnet's shape.
      ctx.strokeStyle = `rgba(255,74,28,${0.04 + strength * 0.1})`;
      ctx.lineWidth = 1;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(
          w * 0.5,
          h * 0.5,
          Math.min(w, h) * (0.14 + k * 0.11),
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    };

    wrap.addEventListener("pointermove", onMove);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", remeasure);
      wrap.removeEventListener("pointermove", onMove);
    };
  }, [coarse, reduced]);

  return (
    <section
      id="field"
      aria-label="Magnetic field"
      className="relative bg-paper py-24 md:py-32"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />

      <div className="u-shell relative">
        <div className="mb-12 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Chapter 09 / Field
          </p>
          <h2 className="u-display text-[clamp(2.4rem,7vw,6.4rem)]">
            It starts to
            <br />
            <span className="u-serif text-signal">organise.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-graphite">
            Nothing here is animated on a timer. The lattice is the
            orchestration graph — a planner, its specialists, and the tools they
            reach for. Scroll to raise the field and watch the workforce find
            its shape.
          </p>
        </div>

        <figure>
          <div
            ref={wrapRef}
            data-cursor="EXPLORE"
            role="img"
            aria-label="Iron filings aligning to the AI employee's magnetic field as you scroll, resolving from scattered particles into a node network."
            className="relative aspect-[16/10] w-full overflow-hidden border border-ink/12 bg-ivory"
          >
            <canvas ref={canvasRef} className="absolute inset-0 size-full" />

            {/* Readout */}
            <div className="u-mono pointer-events-none absolute left-5 top-5 flex flex-col gap-2">
              <span className="text-ash">Field strength</span>
              <span className="flex items-center gap-2">
                <span className="h-px w-24 bg-ink/20">
                  <span
                    className="block h-px bg-signal transition-[width] duration-150"
                    style={{ width: `${field * 100}%` }}
                  />
                </span>
                {(field * 100).toFixed(0).padStart(3, "0")}%
              </span>
            </div>

            <div className="u-mono pointer-events-none absolute bottom-5 left-5 text-ash">
              {coarse ? "Move to attract" : "Scroll to magnetise"}
            </div>
          </div>
          <figcaption className="u-mono mt-4 text-ash">
            Iron filings aligning to the employee&rsquo;s field
          </figcaption>
        </figure>
      </div>
    </section>
  );
}