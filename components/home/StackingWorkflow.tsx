"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STACK_CARDS } from "@/lib/site";

/**
 * "Every task becomes a workflow" — sticky cards that stack and compress as
 * they are overtaken. Each card desaturates and shrinks slightly behind the
 * next, so the pile reads as depth rather than a slideshow.
 */
export function StackingWorkflow() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.94,
          yPercent: -3,
          filter: "saturate(0.55) brightness(0.97)",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "bottom center",
            end: "bottom top",
            scrub: 0.4,
          },
        });
      });

      // The heading holds back until the stack has mostly assembled.
      gsap.fromTo(
        "[data-stack-head]",
        { autoAlpha: 0, y: 40 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.2,
          ease: "expo.out",
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="execution"
      aria-label="Every task becomes a workflow"
      className="relative bg-paper py-24 md:py-32"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />

      <div className="u-shell relative">
        <header data-stack-head className="mb-16 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Chapter 05 / Execution
          </p>
          <h2 className="u-display text-[clamp(2.4rem,7vw,6.8rem)]">
            Every task
            <br />
            becomes a <span className="u-serif text-signal">workflow</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-graphite">
            You state the goal once. The system assembles the steps, assigns
            them, runs them, checks them, and hands back work that is already
            verified.
          </p>
        </header>

        <div className="relative">
          {STACK_CARDS.map((card, i) => (
            <div
              key={card.n}
              data-card
              className="sticky top-[9vh] mb-[6vh] will-change-transform"
              style={{ top: `${9 + i * 1.1}vh`, zIndex: i + 1 }}
            >
              <article
                data-cursor="VIEW"
                className="group relative overflow-hidden border border-ink/12 bg-ivory px-6 py-8 shadow-[0_-1px_0_rgba(18,19,23,0.04)] transition-colors duration-500 hover:border-ink/30 md:px-10 md:py-10"
              >
                {/* Ghost numeral bleeding off the right edge */}
                <span
                  aria-hidden
                  className="u-display pointer-events-none absolute -right-4 -top-8 text-[10rem] leading-none text-ink/[0.04] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:text-[15rem]"
                >
                  {card.n}
                </span>

                <div className="relative flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <span className="u-mono text-signal">{card.n}</span>
                    <h3 className="u-display mt-3 text-[clamp(1.9rem,4.4vw,3.6rem)]">
                      {card.title}
                    </h3>
                  </div>
                  <p className="u-mono max-w-[16rem] text-ash">{card.meta}</p>
                </div>

                {/* Progress hairline — the card's own "load" */}
                <div className="relative mt-8 h-px w-full bg-ink/10">
                  <div
                    className="h-px bg-signal transition-[width] duration-700 ease-out"
                    style={{ width: `${((i + 1) / STACK_CARDS.length) * 100}%` }}
                  />
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}