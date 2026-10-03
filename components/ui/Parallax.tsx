"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Scroll-linked depth for a stack of layers.
 *
 * Layers move by their own `depth` while the group passes through the viewport,
 * so a plate built from a wash, a photograph and two cropped details reads as a
 * window rather than a collage. Positions are written straight to the nodes
 * from one shared rAF loop rather than through React state — this runs for every
 * layer on screen, and a state update per frame per layer would re-render the
 * whole section continuously.
 */

type Layers = {
  add: (node: HTMLElement, depth: number) => void;
  remove: (node: HTMLElement) => void;
};

const LayersCtx = createContext<Layers | null>(null);

export function ParallaxPlates({
  children,
  depth = 30,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Baseline travel in px across the full pass. Layers scale from this. */
  depth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const list = useRef<{ node: HTMLElement; depth: number }[]>([]);
  const pass = useRef(0);

  // Stable for the life of the group: the context value feeds every Layer's
  // effect, so recreating it each render would tear down and re-register every
  // layer on every render.
  const layers = useMemo<Layers>(
    () => ({
      add: (node, d) => {
        list.current.push({ node, depth: d });
      },
      remove: (node) => {
        list.current = list.current.filter((l) => l.node !== node);
      },
    }),
    []
  );

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const read = () => {
      const r = group.getBoundingClientRect();
      // -1 below the fold, 0 centred, +1 above it.
      const vh = window.innerHeight;
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      pass.current = Math.max(-1, Math.min(1, p));
    };

    /* Two loops were running here and only one was needed.
     *
     * `read` was already bound to the scroll event, so the extra rAF loop
     * recomputed the same value sixty times a second and then wrote a transform
     * string to every layer — including layers whose value had not changed since
     * the last frame. On a page that mounts several parallax groups that is a
     * steady stream of style invalidations landing in the same frames the
     * browser is trying to composite a scroll.
     *
     * `pass` only changes while scrolling, so reading on scroll and writing on
     * scroll is sufficient and self-throttling: a parked reader costs nothing. */
    const draw = () => {
      for (const l of list.current) {
        const y = -pass.current * l.depth;
        // Layer travels are small and the easing is smooth, so a tenth of a
        // pixel is the point below which the write cannot be seen.
        const next = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        if (l.node.style.transform === next) continue;
        l.node.style.transform = next;
      }
    };

    let visible = true;
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([e]) => {
              visible = e.isIntersecting;
              if (visible) {
                read();
                draw();
              }
            },
            { rootMargin: "200px" }
          );
    if (io) io.observe(group);

    read();
    draw();

    const onScroll = () => {
      if (!visible) return;
      read();
      draw();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <LayersCtx.Provider value={layers}>
      <div ref={groupRef} className={className} style={style} data-depth={depth}>
        {children}
      </div>
    </LayersCtx.Provider>
  );
}

/**
 * One parallax layer. `depth` is relative to the group's own depth: 1 is the
 * group's baseline pace, above 1 travels further, and a negative value moves
 * the opposite way.
 */
function Layer({
  children,
  depth = 1,
  className = "",
  style,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ctx = useContext(LayersCtx);
  const ref = useRef<HTMLDivElement>(null);

  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
    },
    []
  );

  useEffect(() => {
    const node = ref.current;
    const group = node?.parentElement;
    if (!ctx || !node || !group) return;
    // The group's own depth is the baseline; a layer of depth 1 travels it in
    // full, so the layer only has to supply its multiplier.
    const base = Number(group.dataset.depth) || 30;
    ctx.add(node, depth * base);
    return () => ctx.remove(node);
  }, [ctx, depth]);

  return (
    <div ref={attach} className={className} style={{ willChange: "transform", ...style }}>
      {children}
    </div>
  );
}

ParallaxPlates.Layer = Layer;
