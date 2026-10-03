"use client";

import type { CSSProperties } from "react";

/**
 * Editorial marquee. The track is duplicated so a -50% translate loops
 * seamlessly; hovering pauses it via the `.u-marquee` CSS rule.
 */
export function Marquee({
  items,
  speed = 42,
  reverse = false,
  separator = "—",
  className = "",
  size = "clamp(2.5rem,7vw,6rem)",
  sep = "",
}: {
  items: string[];
  speed?: number;
  reverse?: boolean;
  separator?: string;
  className?: string;
  size?: string;
  sep?: string;
}) {
  const track = [...items, ...items];
  return (
    <div
      className={`u-marquee relative flex overflow-hidden ${className}`}
      style={
        {
          "--marquee-duration": `${speed}s`,
          maskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        } as CSSProperties
      }
    >
      <div
        className="u-marquee-track flex shrink-0 items-center whitespace-nowrap will-change-transform"
        style={{ animationDirection: reverse ? "reverse" : "normal" }}
      >
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center">
            <span className="u-display" style={{ fontSize: size, lineHeight: 1 }}>
              {item}
            </span>
            <span
              aria-hidden
              className={`u-display px-[0.4em] ${sep ? "text-signal" : "text-ash"}`}
              style={{ fontSize: size }}
            >
              {sep || separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
