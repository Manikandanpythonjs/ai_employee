"use client";

import { useEffect, useRef } from "react";
import { FOOTER_LINKS } from "@/lib/site";
import { AnchorLink } from "@/components/ui/AnchorLink";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const canvas = root.querySelector<HTMLCanvasElement>("[data-footer-net]");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const pts = Array.from({ length: 44 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: Math.random() * Math.PI * 2,
    }));

    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(root);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      const P = pts.map((p) => ({
        x: p.x * w,
        y: p.y * h,
      }));
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const dx = P[i].x - P[j].x;
          const dy = P[i].y - P[j].y;
          const d = Math.hypot(dx, dy);
          if (d < w * 0.13) {
            ctx.strokeStyle = `rgba(242,238,231,${(1 - d / (w * 0.13)) * 0.14})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(P[i].x, P[i].y);
            ctx.lineTo(P[j].x, P[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of P) {
        ctx.fillStyle = "rgba(242,238,231,0.3)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <footer
      ref={rootRef}
      className="relative isolate overflow-hidden bg-ink text-paper"
    >
      <canvas
        data-footer-net
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="relative u-shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="u-display text-[clamp(3rem,9vw,7rem)] leading-[0.8]">
              AI
              <br />
              Employee
            </div>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-paper/55">
              An AI employee is not a chatbot. It is an intelligent digital
              worker — reasoning, delegating, using tools, verifying results,
              recovering from failure and staying accountable to a human.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h2 className="u-mono mb-5 text-ash">{col.title}</h2>
                <ul className="space-y-2.5">
                  {col.items.map((i) => (
                    <li key={i.label}>
                      <AnchorLink
                        href={i.href}
                        data-cursor="MAGNETIC"
                        className="group inline-flex items-center gap-1.5 text-sm text-paper/75 transition-colors hover:text-paper"
                      >
                        {i.label}
                        <span
                          aria-hidden
                          className="translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        >
                          →
                        </span>
                      </AnchorLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="u-mono text-paper/45">
            © {year} AI Employee — A UI/UX showcase
          </span>
          <div className="flex flex-wrap items-center gap-5">
            {["X / Twitter", "LinkedIn", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                data-cursor="MAGNETIC"
                className="u-mono text-paper/60 transition-colors hover:text-paper"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
