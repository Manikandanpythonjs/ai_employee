"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/use-webgl";

const PHRASES = ["AI EMPLOYEE", "AI WORKFORCE", "DELEGATE EVERYTHING"];

/** Deterministic pseudo-random so the scatter is identical on every reload. */
function noise(i: number, seed: number) {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Scattered glyphs fly in from across the viewport and assemble into
 * "AI EMPLOYEE", then reorganise twice. Each phrase is its own timeline,
 * entered and left at fixed progress points, so the whole thing is fully
 * reversible when the user scrolls back up.
 *
 * The glyphs are real React children rather than imperatively appended nodes:
 * DOM that React does not own gets torn out during reconciliation, which is
 * what produced `removeChild: The node to be removed is not a child of this
 * node` on every re-render.
 */
export function ScatteredType() {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    let ctx: gsap.Context | null = null;
    const observers: ScrollTrigger[] = [];

    // Function-based values: evaluated per target, so every glyph gets its own
    // deterministic offset from the viewport.
    const scatterFrom = (index: number) => ({
      x: (i: number) =>
        (noise(i, index * 7 + 1) - 0.5) * window.innerWidth * 1.15,
      y: (i: number) =>
        (noise(i, index * 13 + 5) - 0.5) * window.innerHeight * 0.95,
      rotate: (i: number) => (noise(i, index * 7 + 1) - 0.5) * 200,
      scale: (i: number) => 0.35 + noise(i, index * 13 + 5) * 1.6,
      opacity: 0.15,
    });

    // Three phases, each occupying a third of the pinned scroll.
    const bounds = [
      [0, 0.3],
      [0.33, 0.63],
      [0.66, 1],
    ] as const;

    ctx = gsap.context(() => {
      PHRASES.forEach((word, i) => {
        const host = root.querySelector<HTMLElement>(`[data-scatter="${i}"]`);
        if (!host) return;
        const glyphs = Array.from(host.children) as HTMLElement[];
        if (!glyphs.length) return;

        const [start, end] = bounds[i];

        // First phrase overshoots into place; later ones reassemble more
        // crisply, since the reader has already understood the mechanic.
        const tween = gsap.fromTo(glyphs, scatterFrom(i), {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          ease: i === 0 ? "elastic.out(1, 0.62)" : "power3.out",
          stagger: { each: i === 0 ? 0.004 : 0.006, from: "random" },
          scrollTrigger: {
            id: `phrase-${i}`,
            trigger: root,
            start: `top+=${start * (window.innerHeight * 2.8)} top`,
            end: `top+=${end * (window.innerHeight * 2.8)} top`,
            scrub: 0.7,
            onToggle: (self) => {
              host.style.visibility = self.isActive ? "visible" : "hidden";
            },
          },
        });

        observers.push(tween.scrollTrigger!);
      });
    }, root);

    return () => {
      observers.forEach((o) => o?.kill());
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      aria-label="From one employee to a workforce"
      className="relative h-[300vh] w-full bg-paper"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div aria-hidden className="u-grid-lines absolute inset-0 opacity-30" />

        <div className="u-shell relative text-center">
          <p className="u-mono mb-10 text-ash">
            <span className="text-signal">▸</span> One mind. Many hands.
          </p>

          {/* Screen-reader copy of the message, since the glyphs are decorative. */}
          <p className="u-sr">
            From AI Employee, to AI Workforce, to delegate everything.
          </p>

          <div
            className="text-[clamp(2.1rem,10vw,10rem)]"
            aria-hidden="true"
          >
            {/* Reduced motion: the resolved line, set rather than animated. */}
            {reduced ? (
              <div className="u-display leading-[0.95]">
                {PHRASES[PHRASES.length - 1]}
              </div>
            ) : (
              PHRASES.map((word, i) => (
                <div
                  key={word}
                  data-scatter={i}
                  className="u-display leading-[0.95]"
                  style={{ visibility: "hidden" }}
                >
                  {Array.from(word).map((ch, k) => (
                    <span
                      key={`${word}-${k}`}
                      className="inline-block whitespace-pre"
                      style={{ willChange: "transform" }}
                    >
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}