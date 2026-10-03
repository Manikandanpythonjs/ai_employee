"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ORCHESTRATION_STAGES } from "@/lib/site";

/**
 * The orchestration ladder. Each stage is a pinned chapter; the diagram grows
 * cumulatively, so by stage eight the viewer has watched every layer of the
 * system arrive rather than being shown a finished architecture diagram.
 */
export function OrchestrationLadder() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const stages = gsap.utils.toArray<HTMLElement>("[data-stage]", root);

      stages.forEach((stage) => {
        const reveal = stage.querySelectorAll("[data-reveal]");

        gsap.fromTo(
          reveal,
          { y: 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "expo.out",
            stagger: 0.07,
            immediateRender: false,
            scrollTrigger: { trigger: stage, start: "top 72%", once: true },
          }
        );

        // Each stage's diagram gains its newest layer as it enters.
        const layer = stage.querySelector("[data-layer]");
        if (layer) {
          gsap.fromTo(
            layer,
            { scale: 0.7, autoAlpha: 0, transformOrigin: "50% 50%" },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 1.3,
              ease: "expo.out",
              scrollTrigger: { trigger: stage, start: "top 68%", once: true },
            }
          );
        }
      });

      // The connecting spine draws itself down the whole ladder.
      const spine = root.querySelector("[data-spine]");
      if (spine) {
        gsap.fromTo(
          spine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "50% 0",
            scrollTrigger: {
              trigger: root,
              start: "top 60%",
              end: "bottom bottom",
              scrub: 0.5,
            },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative py-20 md:py-28">
      {/* The spine that links all eight stages */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-24 hidden h-[calc(100%-8rem)] w-px bg-ink/10 md:block"
      >
        <div data-spine className="h-full w-full origin-top scale-y-0 bg-ink" />
      </div>

      <div className="u-shell relative space-y-24 md:space-y-32">
        {ORCHESTRATION_STAGES.map((s, i) => (
          <section
            key={s.stage}
            data-stage
            className="relative grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16"
          >
            {/* Copy */}
            <div className="md:pl-16">
              <div data-reveal className="u-mono flex items-center gap-4 text-ash">
                <span className="grid size-6 place-items-center rounded-full border border-ink text-[9px] text-ink">
                  {s.stage}
                </span>
                <span className="h-px w-10 bg-ink/25" />
              </div>
              <h2
                data-reveal
                className="u-display mt-6 text-[clamp(1.9rem,4.6vw,3.6rem)]"
              >
                {s.title}
              </h2>
              <p
                data-reveal
                className="mt-4 max-w-sm text-base leading-relaxed text-graphite"
              >
                {s.body}
              </p>
              <p data-reveal className="u-mono mt-5 text-ash">
                Complexity added: {i === 0 ? "none" : `${i} layer${i > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Diagram */}
            <div
              data-reveal
              className="flex aspect-[16/11] items-center justify-center border border-ink/12 bg-ivory"
            >
              <StageDiagram index={i} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * A cumulative diagram: stage N shows N layers. Reading downward, complexity is
 * added rather than replaced — which is exactly the argument the page makes.
 */
function StageDiagram({ index }: { index: number }) {
  const L = index + 1;

  return (
    <svg viewBox="0 0 240 165" className="size-full p-6" aria-hidden>
      <defs>
        <pattern id="ladder-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="#121317" strokeOpacity="0.07" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="240" height="165" fill="url(#ladder-grid)" />

      {/* Layer 1 — the goal */}
      {L >= 1 && (
        <g data-layer>
          <circle cx="120" cy="24" r="6" fill="#121317" />
          <text x="132" y="27" fontSize="7" fill="#121317" fontFamily="ui-monospace, monospace">
            GOAL
          </text>
        </g>
      )}

      {/* Layer 2 — the single agent */}
      {L >= 2 && (
        <g data-layer>
          <line x1="120" y1="30" x2="120" y2="58" stroke="#121317" strokeOpacity="0.4" />
          <rect x="98" y="58" width="44" height="20" fill="#121317" />
          <text x="120" y="71" fontSize="7" fill="#faf8f4" textAnchor="middle" fontFamily="ui-monospace, monospace">
            AGENT
          </text>
        </g>
      )}

      {/* Layer 3 — tools */}
      {L >= 3 && (
        <g data-layer stroke="#121317" strokeOpacity="0.45" fill="none">
          <path d="M120 78 L120 92 M120 92 L84 92 M120 92 L156 92" />
          {[
            [84, 100],
            [156, 100],
          ].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 20} y={y - 9} width="40" height="18" />
              <text x={x} y={y + 3} fontSize="6.5" fill="#121317" textAnchor="middle" stroke="none" fontFamily="ui-monospace, monospace">
                TOOL {i + 1}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Layer 4 — planner + workers */}
      {L >= 4 && (
        <g data-layer>
          <rect x="100" y="122" width="40" height="18" fill="#ff4a1c" />
          <text x="120" y="134" fontSize="6.5" fill="#faf8f4" textAnchor="middle" fontFamily="ui-monospace, monospace">
            PLAN
          </text>
          <g stroke="#ff4a1c" strokeOpacity="0.5" fill="none">
            <path d="M100 131 L74 131 M140 131 L166 131" />
          </g>
          {[74, 166].map((x, i) => (
            <circle key={i} cx={x} cy="131" r="7" fill="none" stroke="#ff4a1c" />
          ))}
        </g>
      )}

      {/* Layer 5 — verifier */}
      {L >= 5 && (
        <g data-layer>
          <path
            d="M120 140 L120 152"
            stroke="#121317"
            strokeOpacity="0.4"
            fill="none"
          />
          <path
            d="M112 152 L120 144 L128 152 L120 160 Z"
            fill="none"
            stroke="#c8f432"
            strokeWidth="1.4"
          />
        </g>
      )}

      {/* Layer 6 — repair loop */}
      {L >= 6 && (
        <g data-layer fill="none">
          <path
            d="M120 148 C 100 148, 96 128, 110 126"
            stroke="#d81e31"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle cx="110" cy="126" r="2.5" fill="#d81e31" />
        </g>
      )}

      {/* Layer 7 — human gate */}
      {L >= 7 && (
        <g data-layer>
          <path d="M120 150 L120 158" stroke="#121317" strokeOpacity="0.5" fill="none" />
          <circle cx="120" cy="161" r="0" fill="none" />
          <g stroke="#121317" strokeWidth="1" fill="none">
            <circle cx="120" cy="161" r="0" />
            <path d="M120 153 l7 4 v8 l-7 4 -7 -4 v-8 z" stroke="#121317" strokeOpacity="0.5" />
          </g>
        </g>
      )}

      {/* Layer 8 — the workforce, resolved */}
      {L >= 8 && (
        <g data-layer>
          {[
            [24, 30],
            [216, 30],
            [16, 82],
            [224, 82],
            [24, 134],
            [216, 134],
            [120, 82],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i === 6 ? 5 : 3}
              fill={i === 6 ? "#121317" : "#ff4a1c"}
              opacity={i === 6 ? 1 : 0.55}
            />
          ))}
          <g stroke="#121317" strokeOpacity="0.2" fill="none" strokeWidth="0.5">
            <path d="M120 82 L24 30 M120 82 L216 30 M120 82 L16 82 M120 82 L224 82 M120 82 L24 134 M120 82 L216 134" />
          </g>
        </g>
      )}

      {/* Stage index */}
      <text
        x="6"
        y="159"
        fontSize="6.5"
        fill="#121317"
        fillOpacity="0.4"
        fontFamily="ui-monospace, monospace"
      >
        STAGE {String(index + 1).padStart(2, "0")} · {L} LAYER{L > 1 ? "S" : ""}
      </text>
    </svg>
  );
}