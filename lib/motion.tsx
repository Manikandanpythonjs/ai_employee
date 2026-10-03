"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollSignal } from "@/lib/scroll-signal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger };

const MASK: React.CSSProperties = {
  display: "inline-block",
  overflow: "hidden",
  verticalAlign: "top",
  paddingBottom: "0.06em",
  marginBottom: "-0.06em",
};

const INNER: React.CSSProperties = { display: "inline-block" };

/**
 * Wraps each word or character in an overflow-hidden mask so it can be revealed
 * from below.
 *
 * This used to walk the DOM and swap text nodes for spans after mount, which
 * breaks reconciliation: React keeps a reference to the original text node and
 * later throws `removeChild: The node to be removed is not a child of this
 * node` when it tries to detach it. Producing the same markup during render
 * keeps React's virtual DOM and the real DOM in agreement.
 */
export function SplitText({
  children,
  type = "words",
}: {
  children: ReactNode;
  type?: "words" | "chars";
}) {
  const split = (node: ReactNode, key: string): ReactNode => {
    if (typeof node === "string" || typeof node === "number") {
      const text = String(node).replace(/\s+/g, " ");
      if (!text.trim()) return null;
      const pieces =
        type === "chars" ? Array.from(text) : text.split(" ").filter(Boolean);
      return pieces.map((piece, i) => (
        <span key={`${key}-${i}`}>
          <span style={MASK}>
            <span data-split style={INNER}>
              {piece}
            </span>
          </span>
          {type === "words" && i < pieces.length - 1 ? " " : null}
        </span>
      ));
    }
    if (Array.isArray(node)) {
      return node.map((n, i) => (
        <span key={`${key}-${i}`}>{split(n, `${key}-${i}`)}</span>
      ));
    }
    if (isValidElement(node)) {
      const el = node as ReactElement<{ children?: ReactNode }>;
      const children_ = split(el.props.children, `${key}e`);
      return cloneElement(el, undefined, children_);
    }
    return null;
  };

  return <>{split(children, "s")}</>;
}

/**
 * Word/char mask-reveal on scroll. The mask markup comes from `<SplitText>`;
 * this only animates the pieces it produced.
 */
export function useSplitReveal<T extends HTMLElement = HTMLElement>(
  opts: {
    type?: "words" | "chars";
    start?: string;
    delay?: number;
    stagger?: number;
    y?: number;
  } = {}
) {
  const { type = "words", start = "top 84%", delay = 0, stagger, y = 115 } = opts;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    const inners = Array.from(el.querySelectorAll<HTMLElement>("[data-split]"));
    if (!inners.length) return;

    // `immediateRender: false` matters: a fromTo with a scrollTrigger paints its
    // "from" state straight away, so the heading would sit at opacity 0 until
    // the trigger fires. If the trigger never fires — element already past the
    // start when the page mounts, or a refresh landing it out of range — the
    // headline stays blank. Letting ScrollTrigger decide when to paint means an
    // un-fired trigger simply leaves the visible default in place.
    const tween = gsap.fromTo(
      inners,
      { yPercent: y, autoAlpha: 0 },
      {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.15,
        delay,
        ease: "expo.out",
        stagger: stagger ?? (type === "chars" ? 0.016 : 0.05),
        immediateRender: false,
        scrollTrigger: { trigger: el, start, once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [type, start, delay, stagger, y]);

  return ref;
}

/** Staggered entrance for direct children (or a selector inside). */
export function useReveal<T extends HTMLElement = HTMLElement>(
  opts: {
    start?: string;
    stagger?: number;
    y?: number;
    delay?: number;
    selector?: string;
  } = {}
) {
  const { start = "top 82%", stagger = 0.075, y = 34, delay = 0, selector } = opts;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const items = selector
      ? Array.from(el.querySelectorAll(selector))
      : Array.from(el.children);
    if (!items.length) return;
    // See useSplitReveal: immediateRender:false keeps the visible default until
    // the trigger actually fires, so a trigger that never fires cannot leave
    // this content permanently blank.
    const tween = gsap.fromTo(
      items,
      { y, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.1,
        delay,
        ease: "expo.out",
        stagger,
        immediateRender: false,
        scrollTrigger: { trigger: el, start, once: true },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [start, stagger, y, delay, selector]);

  return ref;
}

/** Text that skews / stretches with scroll velocity, then settles. */
export function useVelocityType<T extends HTMLElement = HTMLElement>(
  strength = 1
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    const skew = gsap.quickTo(el, "skewX", { duration: 0.6, ease: "power3" });
    const scale = gsap.quickTo(el, "scaleX", { duration: 0.6, ease: "power3" });

    const tick = () => {
      const v = Math.min(1, Math.abs(scrollSignal.velocity) / 26) * strength;
      skew(-v * 5);
      scale(1 + v * 0.05);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [strength]);

  return ref;
}

/** Publishes scroll velocity for consumers that want to listen. */
export function useVelocityBroadcaster() {
  useEffect(() => {
    const tick = () => {
      window.dispatchEvent(
        new CustomEvent("ae:velocity", { detail: { velocity: scrollSignal.velocity } })
      );
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
}
