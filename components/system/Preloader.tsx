"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getLenis } from "./SmoothScroll";

const NODES = 46;
const SEED_STEPS = 180;

/** Deterministic PRNG so the network is identical on every load. */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Preloader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  // StrictMode mounts, tears down, then mounts again. A "have I ever started"
  // guard would leave the second mount with every rAF cancelled and the bail
  // timer cleared, so the curtain would hang at 00 forever. The effect is
  // instead fully self-contained: whatever a mount starts, its cleanup undoes,
  // and the next mount starts again from scratch.
  useEffect(() => {
    let cancelled = false;

    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scroll is held only while the curtain is up, and released in exactly one
    // place so no path can strand the reader behind it.
    let locked = false;
    const lockScroll = () => {
      if (locked) return;
      locked = true;
      document.documentElement.style.overflow = "hidden";
      getLenis()?.stop();
    };
    const releaseScroll = () => {
      if (!locked) return;
      locked = false;
      document.documentElement.style.overflow = "";
      getLenis()?.start();
    };

    // A motion-sensitive reader gets a shorter, non-animated load — the curtain
    // must never become a reason the page cannot be scrolled.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const HOLD_MS = reduced ? 900 : 2200;
    // Raised from 7s: the hero model alone is ~16MB, so on a slow connection a
    // 7s ceiling would cut the wait short and produce the very flash of empty
    // canvas this curtain exists to prevent. It is still a hard guarantee that
    // the reader is never trapped.
    const BAIL_MS = reduced ? 1600 : 20000;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Network graph: two orbiting shells of nodes with edges between
    // near-neighbours, plus a slow attractor that pulls everything to centre.
    const rand = mulberry32(20260902);
    const nodes = Array.from({ length: NODES }, (_, i) => {
      const shell = i < NODES * 0.32 ? 1 : 2;
      const a = rand() * Math.PI * 2;
      const r = shell === 1 ? 0.18 + rand() * 0.1 : 0.3 + rand() * 0.22;
      return {
        // target
        tx: Math.cos(a) * r * w,
        ty: Math.sin(a) * r * h * 0.9,
        // scattered start
        sx: (rand() - 0.5) * w * 1.4,
        sy: (rand() - 0.5) * h * 1.4,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: shell === 1 ? 2.4 : 1.5,
      };
    });
    nodes.forEach((n) => {
      n.x = n.sx;
      n.y = n.sy;
    });

    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].tx - nodes[j].tx, nodes[i].ty - nodes[j].ty);
        if (d < Math.min(w, h) * 0.17) edges.push([i, j]);
      }
    }

    let progress = 0;
    let raf = 0;
    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);

      // Physics: spring to target + swirl, so the assembly feels alive.
      for (const n of nodes) {
        const stiffness = 0.045 + progress * 0.02;
        n.vx += (n.tx - n.x) * stiffness;
        n.vy += (n.ty - n.y) * stiffness;
        // gentle tangential push
        n.vx += -n.y * 0.00016;
        n.vy += n.x * 0.00016;
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Edges
      ctx.lineWidth = 0.6;
      for (const [i, j] of edges) {
        const a = nodes[i];
        const b = nodes[j];
        const alpha = Math.min(1, progress * 1.4) * 0.32;
        ctx.strokeStyle = `rgba(18,19,23,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        const arrived =
          Math.hypot(n.tx - n.x, n.ty - n.y) < Math.min(w, h) * 0.02;
        ctx.fillStyle = arrived
          ? `rgba(255,74,28,${0.55 + Math.sin(frame * 0.14 + n.size) * 0.25})`
          : `rgba(18,19,23,${0.14 + progress * 0.5})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const setCount = (p: number) => {
      const v = Math.round(p * 100);
      const text = String(v).padStart(2, "0");
      if (countRef.current && countRef.current.textContent !== text) {
        countRef.current.textContent = text;
      }
    };

    let rafCycle = 0;
    const start = performance.now();
    const cycle = () => {
      // Ease toward 92% on our own clock, then let real load events finish it.
      const t = performance.now() - start;
      const target = Math.min(0.92, 1 - Math.exp(-t / 900));
      progress += (target - progress) * 0.06;
      if (t > SEED_STEPS * 4) progress = Math.min(0.92, progress + 0.0009);
      setCount(progress);
      if (progress < 0.995) rafCycle = requestAnimationFrame(cycle);
    };

    // Wait for the real page load (fonts + hero media) with a hard ceiling.
    let loaded = document.readyState === "complete";
    const finish = () => {
      loaded = true;
    };
    if (!loaded) window.addEventListener("load", finish, { once: true });

    /* The real gate: the hero model.
     *
     * `window.load` only waits for what the document references at parse time,
     * and it fires long before a 3D model finishes streaming — the GLBs are tens
     * of megabytes. So the curtain used to lift while the hero canvas was still
     * empty, which is exactly the flash of nothing this is meant to prevent.
     *
     * drei's `useGLTF` puts a fetch in the cache, but the preloader sits above
     * it in the tree and cannot read that cache. Requesting the same file here
     * is free: the HTTP cache and the browser's media cache both dedupe it, and
     * two handles on one URL do not mean two downloads. Readiness is then
     * whichever comes first — real load, the model, or the ceiling. */
    const MODEL = "/media/models/brain_hologram.glb";
    let modelReady = false;
    let req: XMLHttpRequest | null = null;

    const probeModel = () => {
      if (modelReady) return;
      req = new XMLHttpRequest();
      req.open("GET", MODEL, true);
      // Enough to prove the pipeline works; the rest streams in the background
      // and the hero has its own loader for that.
      req.onprogress = () => {
        // The heavy part is arriving.
        progress = Math.max(progress, 0.9);
      };
      req.onload = () => {
        const status = req?.status ?? 0;
        if (status >= 200 && status < 400) {
          modelReady = true;
          progress = 1;
        }
      };
      req.onerror = () => {
        modelReady = true; // Let the page through; the hero shows its own error.
      };
      req.send();
    };
    probeModel();

    // Reduced motion: no simulation, no ticker — just a timed reveal.
    if (reduced) {
      progress = 1;
      setCount(1);
      lockScroll();
      const bail = window.setTimeout(() => {
        if (cancelled) return;
        releaseScroll();
        setDone(true);
      }, HOLD_MS);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("load", finish);
        req?.abort();
        window.clearTimeout(bail);
        releaseScroll();
      };
    }

    const ticker = () => {
      /* The creep toward 100 is gated on readiness, not merely capped by it.
       * Capping alone is not enough: the byte counter nudges `progress` up as
       * soon as the first packet lands, and an ungated creep would then race
       * from there to 100 and lift the curtain while the model was still
       * downloading — the exact flash this exists to prevent. */
      if (loaded || modelReady) {
        progress += (1 - progress) * 0.05;
        setCount(progress);
        if (progress > 0.995) complete();
      } else {
        // Held just short of done so the bar never reads 100 while still waiting.
        if (progress < 0.92) progress += (0.92 - progress) * 0.05;
        setCount(progress);
      }
    };

    let completed = false;
    const complete = () => {
      if (completed || cancelled) return;
      completed = true;
      setCount(1);
      releaseScroll();

      // The lift is one-way and deliberately not registered for cleanup: once
      // the curtain is on its way out, killing it half-way would leave the
      // reader staring at a stuck overlay.
      //
      // `setDone` fires only in the final onComplete. Setting it here instead
      // would make this component render `null` immediately, so React would
      // detach the curtain while the timeline was still animating it — the
      // whole exit sequence would be invisible.
      gsap
        .timeline()
        .to(barRef.current, { scaleX: 1, duration: 0.2, ease: "power2.out" })
        .to(
          statusRef.current,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "expo.out" },
          "-=0.1"
        )
        .to({}, { duration: isCoarse ? 0.25 : 0.75 })
        .to(root, {
          yPercent: -100,
          duration: 1.05,
          ease: "expo.inOut",
          onComplete: () => {
            document.documentElement.classList.add("is-ready");
            setDone(true);
          },
        });
    };

    draw();
    cycle();
    lockScroll();

    const tickerFn = () => ticker();
    gsap.ticker.add(tickerFn);

    // Safety: never trap the reader behind the preloader.
    const bail = window.setTimeout(complete, BAIL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("load", finish);
      // Abandon the probe: StrictMode tears this mount down and the next one
      // starts its own, and an abandoned 16MB request would keep the connection
      // busy for no reader.
      req?.abort();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(rafCycle);
      gsap.ticker.remove(tickerFn);
      window.clearTimeout(bail);
      releaseScroll();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[190] flex flex-col justify-between bg-paper px-5 py-5"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />

      <div className="relative flex items-start justify-between">
        <span className="u-mono text-ash">AI EMPLOYEE / BOOT</span>
        <span className="u-mono text-ash">
          <span ref={countRef}>00</span>
        </span>
      </div>

      <div className="relative">
        <div
          ref={statusRef}
          className="u-display translate-y-4 text-[13vw] leading-[0.8] opacity-0"
        >
          System
          <br />
          Ready
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-6">
        <span className="u-mono text-ash">ESTABLISHING NEURAL LINK</span>
        <div className="h-px w-full max-w-md bg-ink/15">
          <div
            ref={barRef}
            className="h-px w-full origin-left scale-x-0 bg-signal"
          />
        </div>
      </div>
    </div>
  );
}
