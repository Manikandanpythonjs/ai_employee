"use client";

import {
  ScratchReveal,
  SpotlightReveal,
  XRayReveal,
  MagnifierReveal,
} from "./ImageReveals";
import { ParallaxPlates } from "./ParallaxPlates";

/** "The employee can see" — four different mechanisms, one idea. */
export function VisionSection() {
  return (
    <section
      id="verification"
      aria-label="Perception"
      className="relative bg-paper py-24 md:py-32"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />

      <div className="u-shell relative">
        <div className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Chapter 10 / Perception
          </p>
          <h2 className="u-display text-[clamp(2.4rem,7vw,6.4rem)]">
            The employee
            <br />
            can <span className="u-serif text-signal">see.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-graphite">
            A browser is not a page of text. It is a set of interactive objects,
            each with state, intent and consequence. Move the cursor across any
            frame below.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-14">
          <SpotlightReveal />
          <XRayReveal />
          <MagnifierReveal />
          <ScratchReveal />
        </div>

        <ParallaxPlates />
      </div>
    </section>
  );
}
