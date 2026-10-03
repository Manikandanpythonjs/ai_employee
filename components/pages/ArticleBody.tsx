"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Reading progress rail, pinned to the top of the viewport while reading. */
export function ReadingProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) {
        pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[130] h-px bg-ink/10"
    >
      <div
        ref={fillRef}
        className="h-px w-full origin-left scale-x-0 bg-signal"
      />
      <span ref={pctRef} className="u-sr" />
    </div>
  );
}

/** Pulls a block out of the measure so it reads as an interruption. */
export function PullQuote({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const r = el.getBoundingClientRect();
      // Reveal the rule as the quote crosses the middle of the viewport.
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.78 - r.top) / (window.innerHeight * 0.4)));
      const bar = el.querySelector<HTMLElement>("[data-rule]");
      if (bar) bar.style.transform = `scaleY(${p})`;
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <figure ref={ref} className="relative my-16 border-l-2 border-signal py-2 pl-7 md:my-24 md:pl-10">
      <span
        data-rule
        aria-hidden
        className="absolute -left-0.5 inset-y-0 w-px origin-top bg-signal"
        style={{ transform: "scaleY(0)" }}
      />
      <blockquote className="u-serif text-[clamp(1.4rem,3.4vw,2.4rem)] leading-tight text-ink">
        {children}
      </blockquote>
    </figure>
  );
}

/** A horizontal process diagram that draws itself as it scrolls into view. */
export function FlowDiagram({ steps }: { steps: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const r = el.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.85 - r.top) / (window.innerHeight * 0.5))
      );
      el.querySelectorAll<HTMLElement>("[data-grow]").forEach((n, i) => {
        const local = Math.min(1, Math.max(0, p * steps.length - i));
        n.style.transform = `scaleX(${local})`;
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [steps.length]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={steps.join(" then ")}
      className="my-14 border-y border-ink/12 py-8 md:my-20"
    >
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-4">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className="u-mono flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-signal" />
              {s}
            </span>
            {i < steps.length - 1 && (
              <span className="relative block h-px w-8 bg-ink/12">
                <span
                  data-grow
                  className="absolute inset-0 origin-left scale-x-0 bg-ink/45"
                />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Article-level entrance choreography applied to the body children. */
export function ArticleReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blocks = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const vh = window.innerHeight;
      blocks.forEach((b) => {
        const r = b.getBoundingClientRect();
        // Fade up as each block enters the lower two-thirds of the viewport.
        const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.35)));
        b.style.opacity = String(0.15 + p * 0.85);
        b.style.transform = `translateY(${(1 - p) * 18}px)`;
      });
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="[&>p]:leading-[1.75] [&>p]:text-[1.05rem] [&>p]:text-graphite md:[&>p]:text-[1.15rem]">
      {children}
    </div>
  );
}