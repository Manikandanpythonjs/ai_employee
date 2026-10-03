"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { prefersReduced } from "@/lib/motion";

/** Cubic ribbon from the inbound task to the reconverged result. */
const RIBBON =
  "M 20 46 C 90 46, 96 14, 168 14 S 246 46, 312 46 S 390 14, 462 14 S 540 46, 620 46";

const SPINE =
  "M 20 46 C 90 46, 96 14, 168 14 C 240 14, 246 46, 312 46 C 378 46, 384 14, 462 14 C 540 14, 540 46, 620 46";

/**
 * `flow` — Delegation. A single SVG path draws itself as the plate enters the
 * viewport, and three packets then travel the finished route carrying the
 * work down to the three agents it fans out to.
 */
export function DrawFlow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<SVGPathElement>(null);
  const spineRef = useRef<SVGPathElement>(null);
  const packetRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const ribbon = ribbonRef.current;
    const spine = spineRef.current;
    if (!ribbon || !spine) return;

    const packets = packetRefs.current.filter(Boolean) as SVGCircleElement[];

    if (prefersReduced()) {
      gsap.set([ribbon, spine], { strokeDasharray: "none", strokeDashoffset: 0 });
      return;
    }

    const len = ribbon.getTotalLength();
    const spineLen = spine.getTotalLength();

    const ctx = gsap.context(() => {
      gsap.set(ribbon, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(spine, { strokeDasharray: spineLen, strokeDashoffset: spineLen });

      gsap.to([ribbon, spine], {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 88%",
          end: "top 48%",
          scrub: 0.4,
        },
      });

      // Once drawn, packets run the route on loop.
      // The tween target must be a plain object carrying its own `u` property:
      // animating an empty `{}` and reading `targets()[0].progress` yields
      // undefined on the first tick, which made `local` NaN and threw
      // "non-finite float" from getPointAtLength on every frame — flooding the
      // console and stalling the page.
      const driver = { u: 0 };
      gsap.to(driver, {
        u: 1,
        duration: 3.2,
        repeat: -1,
        ease: "none",
        delay: 1,
        onUpdate() {
          const t = (this as unknown as { targets(): { u: number }[] })
            .targets()[0].u;
          packets.forEach((c, i) => {
            const local = (t + i / packets.length) % 1;
            // `len` is measured once and never changes, but guard anyway so a
            // zero-length path can never produce a non-finite coordinate.
            const p = ribbon.getPointAtLength(
              Math.max(0, Math.min(1, local)) * len
            );
            if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return;
            c.setAttribute("cx", String(p.x));
            c.setAttribute("cy", String(p.y));
          });
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="aspect-[16/10] w-full"
      role="img"
      aria-label="One request splitting into three delegated branches that reconverge into a single result."
    >
      <svg viewBox="0 0 640 92" className="absolute inset-0 size-full">
        <path
          ref={spineRef}
          d={SPINE}
          fill="none"
          stroke="#9b9ea3"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <path
          ref={ribbonRef}
          d={RIBBON}
          fill="none"
          stroke="#2447e8"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Task node */}
        <circle cx="20" cy="46" r="5" fill="#ff4a1c" />
        {/* Branch nodes */}
        {[168, 312, 462].map((x) => (
          <circle key={x} cx={x} cy="14" r="3.4" fill="#121317" />
        ))}
        <circle cx="620" cy="46" r="5" fill="#c8f432" />

        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            ref={(el) => {
              packetRefs.current[i] = el;
            }}
            r="2.2"
            fill="#2447e8"
            cx={20}
            cy={46}
          />
        ))}
      </svg>
    </div>
  );
}
