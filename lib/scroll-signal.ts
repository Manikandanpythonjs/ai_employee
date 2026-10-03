/**
 * Live, allocation-free signals written by the smooth-scroll layer and read
 * from rAF loops (canvas particles, shaders, cursor). Keeping it a plain
 * mutable object avoids re-rendering the React tree 60 times a second.
 */
export const scrollSignal = {
  /** Lenis velocity, roughly -20..20 */
  velocity: 0,
  /** Document scroll progress, 0..1 */
  progress: 0,
  /** 1 = down, -1 = up */
  direction: 1,
};

export const pointer = {
  /** Viewport-normalised pointer, -1..1 on both axes */
  x: 0,
  y: 0,
  /** Raw client coords */
  clientX: 0,
  clientY: 0,
};

/** Ease helpers used across scroll + shader math. */
export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const invLerp = (a: number, b: number, v: number) =>
  a === b ? 0 : clamp((v - a) / (b - a));

export const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = invLerp(edge0, edge1, v);
  return t * t * (3 - 2 * t);
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Trim a computed coordinate to a fixed number of decimals before it reaches
 * the DOM. `Math.cos`/`Math.sin` are not correctly rounded and their exact
 * IEEE-754 results differ between V8 on the server and V8 in the browser, so
 * an authored value like `cos(4PI/3) * 36` can serialise as
 * `81.99999999999999%` on one side and `82%` on the other. Rounding to 4dp is
 * far finer than a pixel at any viewport size, but it removes the last bit of
 * disagreement, so SSR and hydration agree on the attribute string.
 */
export const px = (n: number) => {
  const r = Math.round(n * 1e4) / 1e4;
  // Avoid "-0", which serialises differently from "0".
  return Object.is(r, -0) ? 0 : r;
};
