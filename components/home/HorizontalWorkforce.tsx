"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORKFORCE_PANELS } from "@/lib/site";
import { px } from "@/lib/scroll-signal";

const ACCENT: Record<string, string> = {
  ink: "#121317",
  cobalt: "#2447e8",
  signal: "#ff4a1c",
  acid: "#c8f432",
  blood: "#d81e31",
};

/**
 * "The AI Workforce" — vertical scroll drives horizontal travel. Each panel
 * carries its own drawn visual so the section never repeats one idea twice.
 * On narrow screens the horizontal model collapses to a vertical stack.
 */
export function HorizontalWorkforce() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const distance = () => track.scrollWidth - window.innerWidth + 80;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.6}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Parallax inside each panel: art moves slower than the panel itself.
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", track);
      panels.forEach((panel) => {
        const art = panel.querySelector("[data-art]");
        if (!art) return;
        gsap.fromTo(
          art,
          { xPercent: -14 },
          {
            xPercent: 14,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          }
        );
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="one-employee"
      aria-label="The AI workforce"
      className="relative bg-paper md:h-screen md:overflow-hidden"
    >
      {/* Desktop: horizontal track. Mobile: vertical stack (same markup). */}
      <div
        ref={trackRef}
        className="flex flex-col gap-px md:h-screen md:w-max md:flex-row md:items-stretch"
      >
        {/* Intro plate */}
        <div className="flex shrink-0 flex-col justify-center border-t border-ink/12 bg-paper px-6 py-16 md:h-screen md:w-[38vw] md:min-w-[26rem] md:border-t-0 md:border-r md:px-10">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Chapter 04
          </p>
          <h2 className="u-display text-[clamp(2.4rem,6vw,5.2rem)]">
            The AI
            <br />
            Workforce
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-graphite">
            Eight capabilities, one continuous process. Scroll to move through
            them — this is the shape of the work, not a feature list.
          </p>
          <div className="mt-10 flex items-center gap-3 text-ash">
            <span className="h-px w-10 bg-ink/25" />
            <span className="u-mono">Scroll →</span>
          </div>
        </div>

        {WORKFORCE_PANELS.map((panel) => {
          const accent = ACCENT[panel.accent] ?? "#121317";
          return (
            <article
              key={panel.n}
              data-panel
              data-cursor="EXPLORE"
              className="group relative flex shrink-0 flex-col justify-between border-t border-ink/12 bg-paper-3/60 px-6 py-12 transition-colors duration-700 hover:bg-paper-3 md:h-screen md:w-[62vw] md:min-w-[34rem] md:border-t-0 md:border-l md:px-12 md:py-16"
            >
              {/* Art layer — parallaxed, sits behind the type */}
              <div
                data-art
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 flex w-[130%] items-center justify-center"
              >
                <PanelArt n={Number(panel.n)} accent={accent} />
              </div>

              <div className="relative flex items-start justify-between gap-6">
                <span className="u-display text-[5rem] leading-none text-ink/10 transition-colors duration-700 group-hover:text-ink/20 md:text-[8rem]">
                  {panel.n}
                </span>
                <span
                  className="u-mono mt-3 inline-flex items-center gap-2"
                  style={{ color: accent }}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: accent }}
                  />
                  {panel.metric}
                </span>
              </div>

              <div className="relative mt-auto max-w-lg">
                <h3 className="u-display text-[clamp(2rem,4.6vw,4rem)]">
                  {panel.title}
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-graphite md:text-base">
                  {panel.line}
                </p>
              </div>
            </article>
          );
        })}

        {/* Outro plate */}
        <div className="flex shrink-0 flex-col justify-center border-t border-ink/12 bg-ink px-6 py-16 text-paper md:h-screen md:w-[38vw] md:min-w-[24rem] md:border-t-0 md:border-l md:px-10">
          <p className="u-mono mb-6 text-paper/50">End of chapter</p>
          <p className="u-display text-[clamp(2rem,4.4vw,3.6rem)]">
            Every task
            <br />
            becomes a
            <br />
            workflow.
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Per-panel generative art. Eight distinct visual ideas, one per capability —
 * each is drawn from the same geometric vocabulary at a different rhythm.
 */
function PanelArt({ n, accent }: { n: number; accent: string }) {
  if (n === 1) {
    // Perceive — concentric scan rings collapsing to a point.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        {[180, 140, 100, 60, 24].map((r, i) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke={accent}
            strokeOpacity={0.14 + i * 0.06}
            strokeWidth="0.8"
          />
        ))}
        <circle cx="200" cy="200" r="6" fill={accent} />
        <path d="M200 20 L200 380" stroke={accent} strokeOpacity="0.16" strokeWidth="0.8" />
        <path d="M20 200 L380 200" stroke={accent} strokeOpacity="0.16" strokeWidth="0.8" />
      </svg>
    );
  }

  if (n === 2) {
    // Plan — a dependency graph drawn as a tree.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        <g stroke={accent} strokeOpacity="0.3" strokeWidth="0.9" fill="none">
          <path d="M200 70 L110 160" />
          <path d="M200 70 L200 160" />
          <path d="M200 70 L290 160" />
          <path d="M110 160 L70 260" />
          <path d="M110 160 L150 260" />
          <path d="M200 160 L200 260" />
          <path d="M290 160 L250 260" />
          <path d="M290 160 L330 260" />
          <path d="M70 260 L200 350" strokeOpacity="0.5" />
          <path d="M150 260 L200 350" strokeOpacity="0.5" />
          <path d="M200 260 L200 350" strokeOpacity="0.5" />
          <path d="M250 260 L200 350" strokeOpacity="0.5" />
          <path d="M330 260 L200 350" strokeOpacity="0.5" />
        </g>
        {[
          [200, 70],
          [110, 160],
          [200, 160],
          [290, 160],
          [70, 260],
          [150, 260],
          [200, 260],
          [250, 260],
          [330, 260],
          [200, 350],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 0 ? 8 : 4} fill={accent} fillOpacity={i === 0 ? 1 : 0.6} />
        ))}
      </svg>
    );
  }

  if (n === 3) {
    // Delegate — one node fanning out to many.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        <g stroke={accent} strokeOpacity="0.28" strokeWidth="0.9">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <path
                key={i}
                d={`M90 200 Q ${px(140 + Math.cos(a) * 40)} ${px(200 + Math.sin(a) * 40)}, ${px(200 + Math.cos(a) * 150)} ${px(200 + Math.sin(a) * 150)}`}
                fill="none"
              />
            );
          })}
        </g>
        <circle cx="90" cy="200" r="10" fill={accent} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={px(200 + Math.cos(a) * 150)}
              cy={px(200 + Math.sin(a) * 150)}
              r="4.5"
              fill={accent}
              fillOpacity="0.55"
            />
          );
        })}
      </svg>
    );
  }

  if (n === 4) {
    // Execute — a dense grid with active cells.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        <defs>
          <pattern id="exec-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0 L0 0 0 24" fill="none" stroke={accent} strokeOpacity="0.14" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#exec-grid)" />
        {[
          [72, 72],
          [168, 96],
          [264, 72],
          [120, 216],
          [216, 240],
          [312, 216],
          [72, 312],
          [264, 336],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="10"
            height="10"
            fill={accent}
            fillOpacity={0.25 + (i % 3) * 0.25}
          />
        ))}
      </svg>
    );
  }

  if (n === 5) {
    // Verify — a checklist being ticked against a bar.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        <g stroke={accent} strokeWidth="1.1" fill="none">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect
                x="90"
                y={90 + i * 46}
                width="18"
                height="18"
                strokeOpacity="0.5"
              />
              <path
                d={`M93 ${99 + i * 46} l5 5 l9 -11`}
                strokeOpacity={0.9}
                strokeWidth="1.6"
              />
              <line
                x1="126"
                y1={99 + i * 46}
                x2={230 + (i % 3) * 40}
                y2={99 + i * 46}
                strokeOpacity="0.3"
              />
            </g>
          ))}
        </g>
        <path
          d="M90 330 L310 330"
          stroke={accent}
          strokeWidth="2.4"
          strokeLinecap="square"
        />
        <path d="M90 330 L250 330" stroke={accent} strokeWidth="2.4" opacity="0.4" />
      </svg>
    );
  }

  if (n === 6) {
    // Repair — a broken loop that closes on itself.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        <path
          d="M200 70 A130 130 0 1 1 108 118"
          fill="none"
          stroke={accent}
          strokeWidth="1.4"
          strokeOpacity="0.5"
          strokeDasharray="7 6"
        />
        <path
          d="M200 70 A130 130 0 0 1 292 118"
          fill="none"
          stroke={accent}
          strokeWidth="1.4"
          strokeOpacity="0.5"
          strokeDasharray="7 6"
        />
        {/* the gap that gets repaired */}
        <path
          d="M108 118 A130 130 0 0 1 140 92"
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M200 52 l14 18 l-28 0 z" fill={accent} />
        <circle cx="200" cy="200" r="14" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.4" />
      </svg>
    );
  }

  if (n === 7) {
    // Learn — layered strata that accumulate.
    return (
      <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <path
              d={`M70 ${130 + i * 32} Q 200 ${110 + i * 32} 330 ${130 + i * 32}`}
              fill="none"
              stroke={accent}
              strokeOpacity={0.15 + i * 0.11}
              strokeWidth="1"
            />
          </g>
        ))}
        <circle cx="200" cy="200" r="4" fill={accent} />
        <path d="M200 200 L200 96" stroke={accent} strokeOpacity="0.3" strokeDasharray="3 4" />
      </svg>
    );
  }

  // Deliver — a package arriving at an aperture.
  return (
    <svg viewBox="0 0 400 400" className="h-[70%] w-[70%]" aria-hidden>
      <g stroke={accent} fill="none" strokeWidth="1">
        <path d="M120 200 L200 130 L280 200 L200 270 Z" strokeOpacity="0.7" />
        <path d="M120 200 L200 130 L200 270 Z" strokeOpacity="0.35" />
        <path d="M200 130 L280 200 L200 270 Z" strokeOpacity="0.5" />
      </g>
      <path d="M60 340 L340 340" stroke={accent} strokeOpacity="0.5" strokeWidth="1.6" />
      <path d="M200 270 L200 340" stroke={accent} strokeOpacity="0.3" strokeDasharray="4 5" />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={140 + i * 30} cy={200} r="1.6" fill={accent} fillOpacity="0.6" />
      ))}
    </svg>
  );
}