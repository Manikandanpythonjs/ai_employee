"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TIMELINE } from "@/lib/site";

/**
 * The through-line from human work to an AI workforce. Each era is drawn as a
 * plate on a spine, and the spine fills as you read — the argument is that
 * these are not separate products but one capability accumulating.
 */
export function EraTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
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
              start: "top 62%",
              end: "bottom 78%",
              scrub: 0.4,
            },
          }
        );
      }

      gsap.utils.toArray<HTMLElement>("[data-era]", root).forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll("[data-era-in]"),
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "expo.out",
            stagger: 0.07,
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative u-shell py-20 md:py-28">
      {/* Spine */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[4.75rem] top-24 hidden h-[calc(100%-6rem)] w-px bg-ink/12 md:block"
      >
        <div data-spine className="h-full w-full origin-top scale-y-0 bg-signal" />
      </div>

      <ol className="space-y-12">
        {TIMELINE.map((era) => {
          const last = era.title === "AI Workforce";
          return (
            <li
              key={era.era}
              data-era
              data-cursor={last ? "OPEN" : undefined}
              className="relative md:pl-[7.5rem]"
            >
              {/* Node on the spine */}
              <span
                aria-hidden
                data-era-in
                className={`absolute left-[4.75rem] top-2 hidden -translate-x-1/2 md:block ${
                  last ? "" : ""
                }`}
              >
                <span
                  className={`block rotate-45 ${
                    last ? "size-3 bg-signal" : "size-2 border border-ink bg-paper"
                  }`}
                />
              </span>

              <div className="md:flex md:items-baseline md:gap-8">
                <span
                  data-era-in
                  className="u-mono mb-3 block w-10 shrink-0 text-ash md:mb-0"
                >
                  {era.era}
                </span>
                <div className="flex-1">
                  <h3
                    data-era-in
                    className={`u-display text-[clamp(1.6rem,4.4vw,3.2rem)] ${
                      last ? "text-signal" : ""
                    }`}
                  >
                    {era.title}
                  </h3>
                  <p
                    data-era-in
                    className="mt-3 max-w-xl text-sm leading-relaxed text-graphite md:text-base"
                  >
                    {era.body}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}