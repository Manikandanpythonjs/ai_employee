"use client";

import { ParallaxPlates as Parallax } from "@/components/ui/Parallax";

/**
 * Multi-layer parallax plates.
 *
 * Each image gets a full-width band of its own and only one is on screen at a
 * time, so neither has to share attention with the other. Depth comes from two
 * layers — a colour wash behind, the image in front — plus a slight overscale
 * that gives the travel somewhere to go without exposing an edge.
 *
 * An earlier version stacked three extra copies of the same file at `scale-3.2`
 * as "cropped detail passes". They read as repeated images rather than as
 * detail, because they were literal duplicates of the parent layer at a
 * different offset — parallax needs layers that differ, not copies of one image.
 */

const PLATES = [
  {
    src: "/media/images/connector.png",
    alt: "An AI agent wired to Gmail, Slack, Teams, ChatGPT, Zoom, HubSpot, Notion, Drive, Calendar and more — each connection drawn as a live cable.",
    kicker: "Bidirectional channel",
    depth: 34,
    body: "State is read live in both directions. The employee sees the system change without being asked, and writes back only where the scope allows it.",
  },
  {
    src: "/media/images/connector_tool.png",
    alt: "A schematic of the same agent: search, communication, APIs, storage, databases and streaming arranged around a central core labelled AI Agents.",
    kicker: "Scoped tool call",
    depth: 52,
    body: "Every invocation carries its own permission, its own retry policy and its own audit line — so an action can always be explained after the fact.",
  },
];

export function ParallaxPlates() {
  return (
    <div className="mt-16 md:mt-24">
      <header className="mb-12 max-w-3xl">
        <p className="u-mono mb-6 text-ash">
          <span className="text-signal">▸</span> Chapter 10 / Subject
        </p>
        <h3 className="u-display text-[clamp(1.8rem,5vw,4rem)]">
          Perception is
          <br />
          <span className="u-serif text-signal">structure,</span> not pixels.
        </h3>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-graphite">
          A page is not a picture of a workflow. It is buttons with state, fields
          with types, and endpoints that either accept the request or reject it.
          Take each apart in turn.
        </p>
      </header>

      {/* One band per image, full width, stacked. Deliberately not a two-up
          grid: side by side, both plates sit in the same viewport and read as a
          pair of thumbnails rather than as two pieces of work. */}
      <div className="space-y-6">
        {PLATES.map((p) => (
          <Parallax
            key={p.src}
            depth={p.depth}
            className="relative border border-ink/12 bg-ivory"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-paper sm:aspect-[21/9]">
              <Parallax.Layer depth={p.depth * 0.35} className="absolute inset-0">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(60% 55% at 50% 45%, rgba(36,71,232,0.12), transparent 70%)",
                  }}
                />
              </Parallax.Layer>

              <Parallax.Layer depth={p.depth} className="absolute inset-0">
                {/* Overscaled so the layer has room to travel without ever
                    exposing an edge — the only reason to scale it at all. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  className="absolute inset-0 size-full scale-[1.08] object-cover"
                />
              </Parallax.Layer>

              <span
                aria-hidden
                className="u-mono pointer-events-none absolute left-4 top-4 text-ash"
              >
                {p.kicker.toUpperCase()}
              </span>
            </div>

            <figcaption className="border-t border-ink/10 p-6">
              <span className="u-mono text-signal">{p.kicker}</span>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite">
                {p.body}
              </p>
            </figcaption>
          </Parallax>
        ))}
      </div>
    </div>
  );
}