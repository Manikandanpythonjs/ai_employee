"use client";

import { useEffect, useRef } from "react";
import { CHAPTERS } from "@/lib/site";
import { useActiveSection } from "@/lib/use-active-section";

const SECTION_IDS = CHAPTERS.map((c) => c.id);

/**
 * Vertical rail pinned to the viewport edge. The line fills with scroll, the
 * chapter number and label cross-fade, and an orbital dot tracks progress.
 * Hidden on small screens where the viewport is too narrow to carry it.
 */
export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const activeId = useActiveSection(SECTION_IDS);
  const index = Math.max(
    0,
    CHAPTERS.findIndex((c) => c.id === activeId)
  );
  const active = CHAPTERS[index];

  // The fill and the dot track scroll distance, which changes every frame, so
  // they are written straight to the nodes from a rAF loop. Routing them through
  // React state would re-render all sixteen chapter labels 60 times a second
  // for the length of the page. The label cross-fade below does use state, but
  // it only re-renders when the active chapter actually changes.
  //
  // `documentElement.scrollHeight` is deliberately *not* read inside the loop.
  // That property forces the browser to recompute layout, and doing it while the
  // loop is also writing transforms means every frame ends with a full reflow
  // of the page — the single most expensive thing a scroll handler can trigger,
  // and the classic cause of "the whole site feels laggy". Page height only
  // changes on resize or when a section resizes, so it is measured there.
  useEffect(() => {
    let frame = 0;
    let max = 0;
    let lastP = -1;

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
      // Invalidate the memo below so the next frame repaints immediately
      // rather than waiting for a scroll event that may never come.
      lastP = -1;
    };

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      // Below a thousandth of the page the bar cannot visibly move, and the
      // write would still cost a style invalidation.
      if (Math.abs(p - lastP) < 0.001) return;
      lastP = p;
      fillRef.current?.style.setProperty("transform", `scaleY(${p})`);
      dotRef.current?.style.setProperty("transform", `translateY(${p * 100}%)`);
    };

    measure();
    window.addEventListener("resize", measure);
    // Sticky sections and lazy media settle after mount, so the first height
    // measured here can be stale. Re-measuring once the page has settled keeps
    // the rail honest without reintroducing a per-frame layout read.
    const settle = window.setTimeout(measure, 800);

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-5 top-0 z-[110] hidden h-screen w-44 flex-col items-end justify-center lg:flex"
    >
      <div className="relative mr-5 flex h-[42vh] w-px items-start bg-ink/12">
        <div
          ref={fillRef}
          className="absolute inset-x-0 top-0 h-full origin-top bg-ink"
        />
        <div ref={dotRef} className="absolute -left-[3px] top-0 size-[7px]">
          <div className="size-full rotate-45 bg-signal" />
        </div>
      </div>

      {/* The rail column is only 56px wide, but the chapter label is a long
          line of text that used to be centred inside it — so "Perception / 01"
          overflowed the column and got cut off by the viewport edge. The rail
          now owns a wider column and the label is right-aligned to it, so the
          whole phrase stays readable while the line keeps its own inset. */}
      <div className="relative mt-6 flex h-24 w-full items-start justify-end">
        <div className="relative h-full w-full">
          <div className="u-mono absolute right-0 top-0 text-ink">
            {active.n}
          </div>
          <div className="absolute inset-x-0 top-6 h-16 overflow-hidden">
            {CHAPTERS.map((c, i) => (
              <div
                key={c.n}
                className="u-mono absolute inset-x-0 flex items-center justify-end gap-1.5 whitespace-nowrap text-ash transition-all duration-500"
                style={{
                  transform: `translateY(${(i - index) * 22}px)`,
                  opacity: i === index ? 1 : 0,
                }}
              >
                <span>{c.label}</span>
                <span>/</span>
                <span className="text-ink">{c.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}