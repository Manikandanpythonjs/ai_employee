"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { prefersReduced } from "@/lib/motion";

/**
 * Spring-physics magnetic pull toward the pointer. `strength` is the fraction
 * of the cursor offset the element travels (0.35 ≈ tasteful, 1 = glued).
 */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "x", {
      duration: 0.55,
      ease: "elastic.out(1, 0.4)",
    });
    const yTo = gsap.quickTo(el, "y", {
      duration: 0.55,
      ease: "elastic.out(1, 0.4)",
    });

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/** Perspective tilt with a cursor-tracked glare and internal depth. */
export function Tilt({
  children,
  className = "",
  max = 7,
  depth = 26,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  /** px of counter-translation applied to [data-depth] children */
  depth?: number;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;
    if (!shell || !inner || prefersReduced()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const layers = Array.from(
      inner.querySelectorAll<HTMLElement>("[data-depth]")
    );

    const rx = gsap.quickTo(inner, "rotationX", {
      duration: 0.7,
      ease: "power3",
    });
    const ry = gsap.quickTo(inner, "rotationY", {
      duration: 0.7,
      ease: "power3",
    });

    const move = (e: PointerEvent) => {
      const r = shell.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * max * 2);
      ry(px * max * 2);
      if (glareRef.current) {
        glareRef.current.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
        glareRef.current.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
        glareRef.current.style.opacity = "1";
      }
      for (const l of layers) {
        const k = Number(l.dataset.depth || 1);
        gsap.to(l, {
          x: -px * depth * k,
          y: -py * depth * k * 0.6,
          duration: 0.8,
          ease: "power3",
          overwrite: "auto",
        });
      }
    };

    const leave = () => {
      rx(0);
      ry(0);
      if (glareRef.current) glareRef.current.style.opacity = "0";
      for (const l of layers) {
        gsap.to(l, { x: 0, y: 0, duration: 0.9, ease: "power3" });
      }
    };

    shell.addEventListener("pointermove", move);
    shell.addEventListener("pointerleave", leave);
    return () => {
      shell.removeEventListener("pointermove", move);
      shell.removeEventListener("pointerleave", leave);
    };
  }, [max, depth]);

  return (
    <div ref={shellRef} className={`relative [perspective:1000px] ${className}`}>
      <div
        ref={innerRef}
        className="relative h-full w-full [transform-style:preserve-3d] will-change-transform"
      >
        {children}
      </div>
      <div
        ref={glareRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          backgroundImage:
            "radial-gradient(280px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.6), transparent 60%)",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
