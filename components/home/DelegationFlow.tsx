"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DELEGATION_CHAIN } from "@/lib/site";
import { useReducedMotion } from "@/lib/use-webgl";

const CHAIN = DELEGATION_CHAIN;

/**
 * Delegation — one sentence of intent, decomposed into a chain of specialists.
 * Each stage is joined by an SVG path that draws itself as the request reaches
 * it, and carries a travelling packet once the handoff is complete.
 */
export function DelegationFlow() {
  const rootRef = useRef<HTMLElement>(null);
  // Reduced motion shows the chain fully resolved rather than advancing it on
  // scroll, so the initial state is derived from the preference.
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(0);
  const active = reduced ? CHAIN.length - 1 : scrolled;
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const packetRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      pathRefs.current.forEach((path, i) => {
        if (!path) return;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: `top ${76 - i * 3.5}%`,
            end: `top ${70 - i * 3.5}%`,
            scrub: 0.3,
          },
        });
      });

      // Packets idle along completed connectors once drawn.
      packetRefs.current.forEach((c, i) => {
        if (!c) return;
        const path = pathRefs.current[i];
        if (!path) return;
        const len = path.getTotalLength();
        gsap.to(c, {
          opacity: 1,
          duration: 0.3,
          delay: 0.6 + i * 0.12,
        });
        gsap.to(
          { u: 0 },
          {
            u: 1,
            duration: 1.4,
            repeat: -1,
            ease: "none",
            delay: 0.6 + i * 0.12,
            onUpdate() {
              const t = this.targets()[0] as { u: number };
              const p = path.getPointAtLength(t.u * len);
              c.setAttribute("cx", String(p.x));
              c.setAttribute("cy", String(p.y));
            },
          }
        );
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top 76%",
        end: "bottom 58%",
        onUpdate: (self) => {
          const i = Math.min(
            CHAIN.length - 1,
            Math.floor(self.progress * CHAIN.length)
          );
          setScrolled(i);
        },
      });

      // Rows lift slightly as they activate.
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        gsap.to(row, {
          x: 14 - i * 1.5,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: `top ${74 - i * 3.5}%`,
            end: "bottom 60%",
            scrub: 0.4,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const done = active === CHAIN.length - 1;

  return (
    <section
      ref={rootRef}
      id="delegation"
      aria-label="Delegation"
      className="relative overflow-hidden bg-paper py-24 md:py-32"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />

      <div className="u-shell relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Chapter 06 / Delegation
          </p>
          <h2 className="u-display text-[clamp(2.4rem,6.4vw,5.6rem)]">
            One sentence
            <br />
            in. Seven
            <br />
            specialists
            <br />
            <span className="u-serif text-signal">out.</span>
          </h2>

          <figure className="mt-10 border-l-2 border-signal pl-5">
            <blockquote className="u-serif text-xl leading-snug md:text-2xl">
              &ldquo;Research the competitive landscape.&rdquo;
            </blockquote>
            <figcaption className="u-mono mt-3 text-ash">
              Inbound request &middot; 9 words &middot; 1 owner
            </figcaption>
          </figure>

          <p className="mt-8 max-w-sm text-sm leading-relaxed text-graphite">
            The employee does not answer this. It decomposes it, decides who is
            qualified, briefs each specialist, and merges what comes back into a
            single verified result.
          </p>
        </div>

        {/* The chain — one SVG spanning all connectors, laid over the rows. */}
        <div className="relative">
          <svg
            aria-hidden
            className="pointer-events-none absolute left-[7px] top-0 z-0 h-full w-px overflow-visible"
          >
            {CHAIN.slice(0, -1).map((_, i) => (
              <path
                key={i}
                ref={(el) => {
                  pathRefs.current[i] = el;
                }}
                d={`M 0.5 ${i * ROW + 7.5} C 0.5 ${i * ROW + 7.5 + 20}, 0.5 ${(i + 1) * ROW + 7.5 - 20}, 0.5 ${(i + 1) * ROW + 7.5}`}
                fill="none"
                stroke="#121317"
                strokeWidth="1"
                strokeOpacity="0.35"
              />
            ))}
            {CHAIN.slice(0, -1).map((_, i) => (
              <circle
                key={`p-${i}`}
                ref={(el) => {
                  packetRefs.current[i] = el;
                }}
                r="2"
                fill="#ff4a1c"
                opacity="0"
              />
            ))}
          </svg>

          <ol className="relative z-10">
            {CHAIN.map((step, i) => {
              const on = i <= active;
              const isResult = step.id === "result";
              const isTask = step.id === "task";
              return (
                <li
                  key={step.id}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  style={{ height: ROW }}
                  className="relative flex items-center gap-5"
                >
                  <span
                    className={`relative z-10 grid size-[15px] shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
                      on
                        ? isResult
                          ? "border-acid bg-acid"
                          : isTask
                            ? "border-signal bg-signal"
                            : "border-ink bg-ink"
                        : "border-ink/25 bg-paper"
                    }`}
                  >
                    {isResult && <span className="size-1 rounded-full bg-ink" />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`u-mono transition-colors duration-500 ${
                        on ? "text-ink" : "text-ash"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-1 truncate text-sm transition-colors duration-500 ${
                        on ? "text-graphite" : "text-ash/50"
                      }`}
                    >
                      {step.sub}
                    </p>
                  </div>

                  <span
                    className={`u-mono shrink-0 text-[9px] text-ash transition-opacity duration-500 ${
                      on ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {String(i).padStart(2, "0")}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Result panel — expands when the chain completes. */}
          <div
            className={`relative z-10 mt-6 overflow-hidden border border-ink/15 bg-ivory transition-all duration-700 ${
              done ? "max-h-44 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-ink/12 px-5 py-3">
              <span className="u-mono text-ink">Final result</span>
              <span className="u-mono inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-acid" />
                Verified
              </span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-ink/10 px-5 py-4">
              {[
                ["6", "pages"],
                ["40", "sources"],
                ["0", "unsourced"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="u-display text-2xl">{n}</p>
                  <p className="u-mono mt-1 text-ash">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Row height in px — must match the fixed `height` on each <li>. */
const ROW = 76;