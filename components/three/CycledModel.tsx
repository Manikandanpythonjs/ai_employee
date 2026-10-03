"use client";

import { useEffect, useState } from "react";
import { EntityModel } from "@/components/three/EntityModel";

/**
 * A viewer that rotates through an asset's animation clips on a timer, with the
 * active clip named underneath.
 *
 * `EntityModel` plays exactly one clip by name, which is what an asset with
 * several clips needs — the sci-fi robot's Free_Fall, Look_Wave and Sitting all
 * drive the same bones in conflicting directions. This sits above it and hands
 * out one clip at a time so a multi-clip model still shows its full range.
 *
 * The clip name is rendered here rather than lifted to the caller, so the
 * owning section can stay a server component — a callback prop would have to
 * cross that boundary.
 */
export function CycledModel({
  src,
  clips,
  interval = 4200,
  radius = 0.82,
  spin = 0.22,
}: {
  src: string;
  /** Clip names in the order they should play. */
  clips: string[];
  /** How long each clip is held, in milliseconds. */
  interval?: number;
  radius?: number;
  spin?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (clips.length < 2) return;
    const id = window.setInterval(
      () => setIndex((n) => (n + 1) % clips.length),
      interval
    );
    return () => window.clearInterval(id);
  }, [clips.length, interval]);

  const clip = clips[index] ?? "";

  return (
    <>
      <EntityModel src={src} radius={radius} spin={spin} clip={clip} />
      <span
        aria-hidden
        className="u-mono pointer-events-none absolute bottom-3 left-3 text-ash"
      >
        {`CLIP · ${clip}`}
      </span>
    </>
  );
}