"use client";

import { Magnetic } from "@/components/ui/Magnetic";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { useSplitReveal, SplitText } from "@/lib/motion";
import { AGENTS } from "@/lib/site";

/**
 * Closing band. The nine agent colours are laid out as a single stacked
 * spectrum — the roster compressed into one image — before the invitation.
 */
export function AgentsCta() {
  const headRef = useSplitReveal<HTMLHeadingElement>({ start: "top 88%" });

  return (
    <section
      aria-label="Assemble your workforce"
      className="relative isolate overflow-hidden bg-ink py-28 text-paper md:py-36"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-[0.07]" />

      {/* Roster spectrum */}
      <div aria-hidden className="relative flex h-1 w-full">
        {AGENTS.map((a, i) => (
          <span
            key={a.id}
            className="h-full flex-1"
            style={{
              backgroundColor: a.color,
              opacity: 0.85,
              transitionDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </div>

      <div className="u-shell relative pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <p className="u-mono mb-8 text-paper/50">
              <span className="text-signal">▸</span> Staff the function
            </p>
            <h2 ref={headRef} className="u-display text-[clamp(2.5rem,7.6vw,7rem)]">
              <SplitText>
                <span className="block">Hire the</span>
                <span className="block">
                  <span className="u-serif text-signal">whole</span> team.
                </span>
              </SplitText>
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-paper/60">
              Specialists are already defined, trained on their own failure
              modes, and wired to the tools your team uses. What you configure
              is which of them report to which objective.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Magnetic strength={0.28}>
                <AnchorLink
                  href="#contact"
                  data-cursor="MAGNETIC"
                  className="group relative flex items-center gap-4 overflow-hidden border border-paper bg-paper px-8 py-4 text-ink transition-colors hover:bg-transparent hover:text-paper"
                >
                  <span className="u-mono">Build your workforce</span>
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
                  href="#features"
                  data-cursor="OPEN"
                  className="group flex items-center gap-4 border border-paper/30 px-8 py-4 transition-colors hover:border-paper"
                >
                  <span className="u-mono">See the systems</span>
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

          {/* Roster list */}
          <ul className="grid grid-cols-2 gap-px self-center border border-paper/12 bg-paper/12 md:grid-cols-3">
            {AGENTS.map((a, i) => (
              <li
                key={a.id}
                className="bg-ink px-4 py-5 transition-colors duration-500 hover:bg-ink-2"
              >
                <span className="u-mono text-paper/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="mt-3 block h-px w-6"
                  style={{ backgroundColor: a.color }}
                />
                <span className="u-display mt-3 block text-[0.95rem] leading-tight">
                  {a.name}
                </span>
                <span className="u-mono mt-1.5 block text-paper/40">{a.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
