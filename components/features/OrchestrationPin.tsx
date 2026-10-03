"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RoutingWeave } from "@/components/features/RoutingWeave";
import { ACCENT } from "@/components/features/Plate";
import { useReducedMotion } from "@/lib/use-webgl";
import { smoothstep } from "@/lib/scroll-signal";

const LAYERS = [
  {
    id: "intake",
    n: "01",
    title: "One goal enters",
    line: "A single statement of intent. No orchestration diagram has been written yet — the topology is inferred, not configured.",
    accent: "ink" as const,
  },
  {
    id: "resolve",
    n: "02",
    title: "Order is resolved",
    line: "Dependencies are computed from the task graph. Branches that do not depend on each other are released simultaneously.",
    accent: "cobalt" as const,
  },
  {
    id: "sync",
    n: "03",
    title: "Parallel branches stay in sync",
    line: "Shared state is broadcast as each branch lands, so a late result never overwrites work that already succeeded.",
    accent: "signal" as const,
  },
  {
    id: "merge",
    n: "04",
    title: "The result merges",
    line: "Conflicts surface here and only here — as an explicit decision, with both branch states intact for comparison.",
    accent: "acid" as const,
  },
];

/**
 * Pinned orchestration — the only feature given a full-viewport stage. Scroll
 * advances the coordination stage while the force graph holds the right of the
 * frame and drifts against the scroll, so the reader is looking at the network
 * being coordinated rather than at a list describing it.
 */
export function OrchestrationPin() {
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  // Reduced motion rests on the final stage rather than scrubbing to it.
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(0);
  const active = reduced ? LAYERS.length - 1 : scrolled;

  useEffect(() => {
    const root = rootRef.current;
    const copy = copyRef.current;
    const art = artRef.current;
    if (!root || !copy || !art || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-stage]", copy);

      // CSS sticky does the pinning, exactly as every other pinned section on
      // the site does it. This trigger used to *also* carry `pin: true`, which
      // gave one 420vh block two competing pin mechanisms: ScrollTrigger's fixed
      // positioning and the `sticky top-0` child inside it. They disagree about
      // where the section's box ends, and once the pin released, the leftover
      // spacer scrolled a full screen of empty paper past the last stage — the
      // blank white frame after this section. ScrollTrigger is left to drive
      // progress only.
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const raw = self.progress * LAYERS.length;
          const i = Math.min(LAYERS.length - 1, Math.floor(raw));
          setScrolled(i);
          items.forEach((el, k) => {
            /* Stages are stacked at the same `top-0`, so anything still carrying
               opacity prints directly on top of whatever replaces it. The window
               has to hand off cleanly rather than merely fade.

               The old curve was `enter * (1 - exit * 0.55)`, whose exit bottomed
               out at 0.45 — the outgoing headline never cleared, so mid-transition
               held it at 0.45 under the incoming stage at 0.54 and the two
               overprinted into an unreadable smear. Measured across the whole
               scroll, that configuration kept two stages on screen at once for
               the entire pass.

               Instead the exit now completes *before* the next enter begins:
               enter runs -0.4 → 0.05 and exit 0.65 → 1, so the outgoing copy has
               finished leaving before the incoming one starts arriving. That
               keeps the total opacity at 0.93 or above through every hand-off —
               no blank frame, and never two headlines in the same place.

               Only the earlier stages fade out. The last one has nothing to hand
               off to, so it would otherwise fade to nothing at the end of the
               section. */
            const local = raw - k;
            let a = smoothstep(-0.4, 0.05, local);
            if (k < LAYERS.length - 1) {
              a *= 1 - smoothstep(0.65, 1, local);
            }
            gsap.set(el, { autoAlpha: a, y: (1 - smoothstep(-0.4, 0.5, local)) * 44 });
          });
        },
      });

      // `bottom bottom` matches the trigger above, so the art drift and the
      // progress meter finish at exactly the same scroll position the stage
      // copy does. They previously used a separate `+=312%` window, which with
      // CSS sticky ran past the end of the section.
      gsap.to(art, {
        yPercent: -9,
        scale: 1.06,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      gsap.to("[data-pin-meter]", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const stage = LAYERS[active];

  return (
    <section
      ref={rootRef}
      id="orchestration"
      aria-label="Agent orchestration, pinned"
      className="relative h-[420vh] w-full bg-paper"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div aria-hidden className="u-grid-lines absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 60% at 78% 45%, rgba(36,71,232,0.09), transparent 68%)",
          }}
        />

        <div className="u-shell relative grid w-full items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          {/* Copy rail */}
          <div ref={copyRef} className="relative">
            <p className="u-mono mb-8 text-ash">
              <span className="text-signal">▸</span> Pinned / Feature 02
            </p>

            <h2 className="u-display text-[clamp(2.4rem,6.6vw,5.8rem)]">
              Coordination
              <br />
              is the <span className="u-serif text-signal">product.</span>
            </h2>

            <div className="relative mt-12 h-[15rem]">
              {LAYERS.map((l, i) => (
                <div
                  key={l.id}
                  data-stage
                  className="absolute inset-x-0 top-0"
                  aria-hidden={i !== active}
                >
                  <p
                    className="u-mono inline-flex items-center gap-2"
                    style={{ color: ACCENT[l.accent] }}
                  >
                    <span>{l.n}</span>
                    <span aria-hidden className="h-px w-6 bg-current opacity-40" />
                    <span className="text-ash">{l.id.toUpperCase()}</span>
                  </p>
                  <h3 className="u-display mt-4 text-[clamp(1.6rem,3.4vw,2.8rem)]">
                    {l.title}
                  </h3>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-graphite">
                    {l.line}
                  </p>
                </div>
              ))}
            </div>

            {/* Stage index */}
            <ol className="mt-8 flex items-center gap-2">
              {LAYERS.map((l, i) => (
                <li
                  key={l.id}
                  aria-current={i === active ? "step" : undefined}
                  className="u-mono flex-1"
                >
                  <span
                    className="block h-px w-full origin-left transition-transform duration-700 ease-out"
                    style={{
                      backgroundColor: i <= active ? ACCENT[stage.accent] : "rgba(18,19,23,0.15)",
                      transform: `scaleX(${i <= active ? 1 : 0.35})`,
                    }}
                  />
                </li>
              ))}
            </ol>
          </div>

          {/* Held graph */}
          <div className="relative">
            <div
              ref={artRef}
              data-cursor="EXPLORE"
              className="relative aspect-[5/4] w-full border border-ink/12 bg-ivory sm:aspect-[16/11]"
            >
              <RoutingWeave />
              <span aria-hidden className="u-mono pointer-events-none absolute bottom-3 left-4 text-ash">
                COORDINATION TOPOLOGY · LIVE
              </span>
              <span
                aria-hidden
                className="absolute right-3 top-3 size-3 border border-ink/30"
              />
            </div>
          </div>
        </div>

        {/* Progress meter */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-ink/10"
        >
          <div data-pin-meter className="h-px origin-left scale-x-0 bg-signal" />
        </div>
      </div>
    </section>
  );
}
