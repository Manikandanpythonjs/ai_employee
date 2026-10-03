"use client";

import { useEffect, useState } from "react";

/**
 * Which section of a single-page document the reader is currently in.
 *
 * The document is now the whole site, so "progress" cannot be derived from
 * arithmetic over the chapter list — the sections have wildly different
 * heights (a 190vh hero against a plain header), so an even split would put
 * "Agents" and "Orchestration" in completely different places than the reader
 * actually sees them. This measures real element offsets instead.
 *
 * The active section is the last one whose top has passed a line a little
 * below the viewport top, which is the section the reader is looking at.
 */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  // Callers pass a literal array, so it is a new reference on every render.
  // Serialising it gives the effect a stable dependency and keeps the listeners
  // from being torn down and rebuilt 60 times a second.
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key ? key.split("|") : [];
    if (!sectionIds.length) return;

    let frame = 0;

    const measure = () => {
      const line = window.innerHeight * 0.35;
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = id;
        else break;
      }

      // Pin the last section once the page is scrolled to the bottom: the
      // final sections are shorter than the viewport, so the loop above can
      // never reach them and the rail would stall one chapter short.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) current = sectionIds[sectionIds.length - 1];

      setActive(current);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}