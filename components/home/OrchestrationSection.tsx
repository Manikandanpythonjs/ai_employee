"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrchestrationScene } from "./OrchestrationScene";
import { ChapterLabel } from "@/components/ui/Layout";

const CHAPTER_COPY = [
  { k: "01", label: "Single agent", line: "One mind, one goal." },
  { k: "02", label: "Agent + tools", line: "Capability arrives through connected systems." },
  { k: "03", label: "Multiple agents", line: "Many specialists, one shared objective." },
  { k: "04", label: "Planner + workers", line: "Assign, execute, return. Repeat." },
  { k: "05", label: "Verifier", line: "An adversarial pass before anything ships." },
  { k: "06", label: "Repair loop", line: "Failure routes back to diagnosis." },
  { k: "07", label: "Human approval", line: "Escalation where it carries weight." },
  { k: "08", label: "Complete workforce", line: "A system that runs the whole function." },
];

/**
 * Pinned orchestration scene. Scroll drives the camera around the network
 * while the copy advances through the eight stages of building a workforce.
 */
export function OrchestrationSection() {
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [step, setStep] = useState(0);
  const copyRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const i = Math.min(
            CHAPTER_COPY.length - 1,
            Math.floor(self.progress * CHAPTER_COPY.length)
          );
          setStep((prev) => (prev === i ? prev : i));
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${self.progress})`;
          }
        },
      });

      gsap.fromTo(
        copyRef.current,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: "expo.out",
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top 60%", once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const current = CHAPTER_COPY[step];

  return (
    <section
      ref={rootRef}
      aria-label="Orchestration"
      className="relative h-[420vh] w-full bg-paper-2"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />
        <OrchestrationScene progressRef={progressRef} />

        <div className="u-shell pointer-events-none relative z-10 flex h-full flex-col justify-between py-24 md:py-28">
          <div className="flex items-start justify-between">
            <ChapterLabel n="03">
              <span className="text-ink">Delegation</span>
            </ChapterLabel>
            <span className="u-mono hidden text-ash sm:block">
              Stage {String(step + 1).padStart(2, "0")} / 08
            </span>
          </div>

          <div ref={copyRef} className="pointer-events-auto max-w-md">
            <p className="u-mono mb-4 text-signal">{current.k}</p>
            <h2 className="u-display text-[clamp(2.2rem,5.6vw,4.6rem)]">
              {current.label}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-graphite">
              {current.line}
            </p>
          </div>

          {/* Vertical stage ladder */}
          <ol className="pointer-events-auto flex gap-1.5">
            {CHAPTER_COPY.map((c, i) => (
              <li key={c.k} className="flex-1">
                <div
                  className={`h-0.5 w-full transition-colors duration-500 ${
                    i <= step ? "bg-signal" : "bg-ink/12"
                  }`}
                />
                <span
                  className={`u-mono mt-2 block text-[9px] transition-colors duration-500 ${
                    i === step ? "text-ink" : "text-ash"
                  }`}
                >
                  {c.k}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}