"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Marquee } from "@/components/ui/Marquee";
import { Magnetic } from "@/components/ui/Magnetic";
import { AnchorLink } from "@/components/ui/AnchorLink";

/**
 * Final CTA — the site's visual system collapses inward into a single node,
 * then the invitation. Everything that has been scattered across the page
 * converges here: rings close, particles converge, the type locks.
 */
export function FinalCTA() {
  const rootRef = useRef<HTMLElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle convergence
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      w = root.clientWidth;
      h = root.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 220;
    const P = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.25 + Math.random() * 0.75,
      s: 0.4 + Math.random() * 1.4,
    }));

    let visible = false;
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
      },
      { rootMargin: "200px" }
    );
    io.observe(root);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      // The field is 220 fills a frame, forever. It is the last section on the
      // page, so for the entire read above it this was pure cost.
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.hypot(cx, cy);
      for (const p of P) {
        const rr = maxR * p.r;
        const x = cx + Math.cos(p.a) * rr;
        const y = cy + Math.sin(p.a) * rr;
        const depth = rr / maxR;
        ctx.fillStyle = `rgba(242,238,231,${0.05 + depth * 0.14})`;
        ctx.fillRect(x, y, p.s * depth, p.s * depth);
      }
    };
    draw();

    // Pull everything toward the centre node as the section is entered.
    // Inside a context so the scrub timeline's ScrollTrigger dies on unmount.
    const tl = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "center center",
          scrub: 0.6,
        },
      }).fromTo(
        nodeRef.current,
        { scale: 0.05, opacity: 0 },
        { scale: 1, opacity: 1, ease: "expo.out", duration: 1 },
        0
      );
    }, root);

    return () => {
      tl.revert();
      io.disconnect();
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Type lock
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-cta-line]",
        { yPercent: 110, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.4,
          ease: "expo.out",
          stagger: 0.09,
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top 55%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="outcome"
      aria-label="Build your AI workforce"
      className="relative isolate overflow-hidden bg-ink py-32 text-paper md:py-44"
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />

      {/* The single node everything collapses into */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 -translate-y-1/2"
      >
        <div ref={nodeRef} className="relative">
          {[3, 2, 1].map((k) => (
            <span
              key={k}
              className="absolute left-1/2 top-1/2 aspect-square w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/15"
              style={{
                width: `${24 * k}px`,
                height: `${24 * k}px`,
              }}
            />
          ))}
          <span className="block size-3 rounded-full bg-signal" />
        </div>
      </div>

      <div className="u-shell relative">
        <p className="u-mono mb-10 text-paper/50">
          <span className="text-signal">▸</span> Chapter 12 / Final
        </p>

        <h2 className="u-display text-[clamp(2.6rem,9.5vw,9rem)]">
          <span className="block overflow-hidden">
            <span data-cta-line className="block">
              Don&rsquo;t just
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-cta-line className="block">
              automate tasks.
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-cta-line className="block">
              Build a <span className="u-serif text-signal">workforce.</span>
            </span>
          </span>
        </h2>

        <p className="mt-10 max-w-md text-base leading-relaxed text-paper/60">
          AI employees that think in workflows, work across tools, and
          collaborate with humans.
        </p>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <Magnetic strength={0.28}>
            <AnchorLink
              href="#orchestration-ladder"
              data-cursor="MAGNETIC"
              className="group relative flex items-center gap-4 overflow-hidden border border-paper bg-paper px-8 py-4 text-ink transition-colors hover:bg-transparent hover:text-paper"
            >
              <span className="u-mono">Explore the workforce</span>
              <span
                aria-hidden
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              >
                →
              </span>
            </AnchorLink>
          </Magnetic>
          <Magnetic strength={0.28}>
            <AnchorLink
              href="#contact"
              data-cursor="MAGNETIC"
              className="group flex items-center gap-4 border border-paper/30 px-8 py-4 transition-colors hover:border-paper"
            >
              <span className="u-mono">Talk to us</span>
              <span
                aria-hidden
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              >
                ↗
              </span>
            </AnchorLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/** The closing marquee band, sitting just before the CTA. */
export function OutcomeMarquee() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-ink/12 bg-paper-2 py-10"
    >
      <Marquee
        items={[
          "Autonomous Work",
          "Agentic Systems",
          "Multi-Agent",
          "Orchestration",
          "Delegation",
          "Verification",
          "Self-Healing",
          "Human Control",
        ]}
        size="clamp(1.6rem,3.6vw,3.2rem)"
        speed={54}
        sep="*"
      />
      <div className="mt-6 -translate-y-6">
        <Marquee
          items={[
            "Reason",
            "Delegate",
            "Execute",
            "Verify",
            "Recover",
            "Deliver",
          ]}
          size="clamp(1.6rem,3.6vw,3.2rem)"
          speed={38}
          reverse
          separator="/"
        />
      </div>
    </section>
  );
}