"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrainHologram } from "@/components/three/BrainHologram";
import { Magnetic } from "@/components/ui/Magnetic";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { ChapterLabel } from "@/components/ui/Layout";

/**
 * Hero — a pinned, scroll-driven opening statement. The entity occupies the
 * right of the frame; the headline sits on the left. Scrolling turns the
 * hologram and speeds its rotation, so the "employee" visibly wakes up without
 * the subject ever growing past its stage.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const entityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      progressRef.current = 0.35;
      return;
    }

    const ctx = gsap.context(() => {
      // Entrance choreography: meta → headline → sub → entity.
      const tl = gsap.timeline({ delay: 0.15 });
      tl.fromTo(
        metaRef.current?.children ?? [],
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: "expo.out" }
      )
        .fromTo(
          titleRef.current,
          { autoAlpha: 0, y: 70, filter: "blur(14px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "expo.out",
          },
          "-=0.5"
        )
        .fromTo(
          subRef.current,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" },
          "-=0.9"
        )
        .fromTo(
          entityRef.current,
          { autoAlpha: 0, scale: 0.82 },
          { autoAlpha: 1, scale: 1, duration: 1.8, ease: "expo.out" },
          "-=1.3"
        );

      // Scroll drives the entity's transformation.
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });

      // The headline recedes as we enter the entity — depth, not just motion.
      //
      // Transform only, deliberately. A scrubbed tween that also animates
      // opacity and filter fights the entrance timeline above for the same two
      // properties on the same node, and on the way back up it can strand the
      // H1 at the tween's end state — blurred and 15% opaque, which is exactly
      // the "headline is not visible" report. Transforms always reverse cleanly
      // and can never make the copy unreadable.
      gsap.to(titleRef.current, {
        yPercent: -30,
        scale: 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "55% bottom",
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="intro"
      ref={rootRef}
      aria-label="AI Employee"
      className="relative h-[190vh] w-full"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Layer 4 — far background: hairline grid */}
        <div aria-hidden className="u-grid-lines absolute inset-0 opacity-50" />
        {/* Layer 3 — background wash that warms toward the signal accent */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(60% 50% at 72% 45%, rgba(255,74,28,0.10), transparent 62%), radial-gradient(50% 45% at 20% 70%, rgba(36,71,232,0.07), transparent 65%)",
          }}
        />

        <div className="u-shell relative grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Copy layer */}
          <div className="relative order-2 min-w-0 lg:order-1">
            <div
              ref={metaRef}
              className="u-mono mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-ash"
            >
              <ChapterLabel n="01">Perception</ChapterLabel>
              <span className="hidden h-3 w-px bg-ink/20 sm:block" />
              <span className="u-blink">Live system</span>
            </div>

            <h1
              ref={titleRef}
              className="u-display text-[clamp(2.4rem,5.6vw,5.6rem)]"
            >
              <span className="block">Your next</span>
              <span className="block">
                employee
                <span className="u-serif ml-[0.1em] text-signal">doesn&rsquo;t</span>
              </span>
              <span className="block">need a desk.</span>
            </h1>

            <div
              ref={subRef}
              className="mt-10 grid gap-8 border-t border-ink/12 pt-8 sm:grid-cols-[1.4fr_1fr]"
            >
              <p className="max-w-md text-base leading-relaxed text-graphite">
                AI employees that reason, delegate, execute and recover across
                your digital workforce. One goal in. Verified work out.
              </p>
              <div className="flex flex-col gap-3">
                <Magnetic strength={0.3}>
                  <AnchorLink
                    href="#one-employee"
                    data-cursor="MAGNETIC"
                    className="group relative flex w-full items-center justify-between gap-6 overflow-hidden border border-ink bg-ink px-5 py-3.5 text-paper transition-colors hover:bg-transparent hover:text-ink"
                  >
                    <span className="u-mono">Explore the workforce</span>
                    <span
                      aria-hidden
                      className="translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </AnchorLink>
                </Magnetic>
                <Magnetic strength={0.3}>
                  <AnchorLink
                    href="#orchestration-ladder"
                    data-cursor="OPEN"
                    className="group flex w-full items-center justify-between gap-6 border border-ink/25 px-5 py-3.5"
                  >
                    <span className="u-mono">See orchestration</span>
                    <span
                      aria-hidden
                      className="translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    >
                      ↗
                    </span>
                  </AnchorLink>
                </Magnetic>
              </div>
            </div>
          </div>

          {/* Entity layer — the AI employee itself. It gets a real square-ish stage so
              the subject has room to breathe instead of being cropped by the
              viewport edge. */}
          <div className="relative order-1 h-[38vh] min-h-[260px] w-full min-w-0 lg:order-2 lg:h-[70vh]">
            <div
              ref={entityRef}
              className="absolute inset-0 flex items-center justify-center"
              data-cursor="EXPLORE"
              data-cursor-label="EXPLORE"
            >
              <BrainHologram progressRef={progressRef} />
            </div>

            {/* Annotations pinned to the entity, like a technical plate */}
            <div
              aria-hidden
              className="u-mono pointer-events-none absolute inset-0 hidden text-ash md:block"
            >
              <span className="absolute left-0 top-[18%] flex items-center gap-2">
                <span className="size-1 rounded-full bg-signal" />
                Neural structure
              </span>
              <span className="absolute right-0 top-[58%] flex items-center gap-2">
                <span className="size-1 rounded-full bg-cobalt" />
                Cortex activity
              </span>
              <span className="absolute bottom-[8%] left-[8%] flex items-center gap-2">
                <span className="size-1 rounded-full bg-ink" />
                Particle shell
              </span>
            </div>
          </div>
        </div>

        {/* Scroll cue — sits in the gutter beside the copy so it never lands on top
            of the calls to action. */}
        <div className="u-mono pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-ash lg:flex">
          <span>Scroll</span>
          <span className="relative block h-10 w-px overflow-hidden bg-ink/15">
            <span className="absolute inset-x-0 top-0 h-4 bg-signal [animation:u-drop_2.2s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
