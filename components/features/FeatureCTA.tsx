"use client";

import { Magnetic, Tilt } from "@/components/ui/Magnetic";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { useReveal, useSplitReveal, SplitText } from "@/lib/motion";

/**
 * Closing invitation. Deliberately built from the same material as the rest of
 * the site — hairlines, mono, one serif accent — but presented as a specimen
 * card under tilt so it reads as a physical plate rather than a web banner.
 */
export function FeatureCTA() {
  const headRef = useSplitReveal<HTMLHeadingElement>({ start: "top 86%" });
  const listRef = useReveal<HTMLUListElement>({ start: "top 84%", stagger: 0.05 });

  return (
    <section
      aria-label="Build your AI workforce"
      className="relative isolate overflow-hidden bg-ink py-28 text-paper md:py-36"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-[0.07]" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(48% 55% at 20% 25%, rgba(255,74,28,0.12), transparent 66%), radial-gradient(46% 50% at 82% 78%, rgba(36,71,232,0.12), transparent 66%)",
        }}
      />

      <div className="u-shell relative grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p className="u-mono mb-8 text-paper/50">
            <span className="text-signal">▸</span> Assemble the whole set
          </p>

          <h2 ref={headRef} className="u-display text-[clamp(2.6rem,8vw,7.4rem)]">
            <SplitText>
              <span className="block">Ten systems.</span>
              <span className="block">
                One <span className="u-serif text-signal">employee.</span>
              </span>
            </SplitText>
          </h2>

          <p className="mt-8 max-w-md text-base leading-relaxed text-paper/60">
            Each capability above is independently useful and jointly
            necessary. Deploy the one you need this quarter, or the full
            operating system — the orchestration layer is the same either way.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.28}>
              <AnchorLink
                href="#contact"
                data-cursor="MAGNETIC"
                className="group relative flex items-center gap-4 overflow-hidden border border-paper bg-paper px-8 py-4 text-ink transition-colors hover:bg-transparent hover:text-paper"
              >
                <span className="u-mono">Build yours</span>
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
                href="#agents"
                data-cursor="OPEN"
                className="group flex items-center gap-4 border border-paper/30 px-8 py-4 transition-colors hover:border-paper"
              >
                <span className="u-mono">Meet the agents</span>
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

        {/* Specimen plate */}
        <Tilt max={6} depth={18}>
          <ul
            ref={listRef}
            className="relative border border-paper/15 bg-paper/[0.03] backdrop-blur-[1px]"
          >
            <li className="u-mono flex items-center justify-between gap-4 border-b border-paper/12 px-5 py-3 text-paper/45">
              <span>Integration</span>
              <span className="text-paper">Single API surface</span>
            </li>
            <li className="u-mono flex items-center justify-between gap-4 border-b border-paper/12 px-5 py-3 text-paper/45">
              <span>Onboarding</span>
              <span className="text-paper">State a goal</span>
            </li>
            <li className="u-mono flex items-center justify-between gap-4 border-b border-paper/12 px-5 py-3 text-paper/45">
              <span>Supervision</span>
              <span className="text-paper">Optional</span>
            </li>
            <li className="u-mono flex items-center justify-between gap-4 border-b border-paper/12 px-5 py-3 text-paper/45">
              <span>Evidence</span>
              <span className="text-acid">Attached to every run</span>
            </li>
            <li className="u-mono flex items-center justify-between gap-4 border-b border-paper/12 px-5 py-3 text-paper/45">
              <span>Failure mode</span>
              <span className="text-blood">Diagnosed, not fatal</span>
            </li>
            <li data-depth="1" className="u-mono flex items-center justify-between gap-4 px-5 py-3 text-paper/45">
              <span>Effort model</span>
              <span className="text-paper">Outcome, not seats</span>
            </li>
          </ul>
        </Tilt>
      </div>
    </section>
  );
}
