"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { NAV_LINKS } from "@/lib/site";
import { AnchorLink } from "@/components/ui/AnchorLink";

/* Scroll-driven header behaviour.
 *
 * Nothing in here goes through React state on a scroll tick. `mode` and
 * `hidden` were both `useState`, so every wheel event re-rendered the header,
 * and the header contains the full nav — a class swap on it forces style
 * recalc and layout for the whole subtree mid-scroll, which is exactly when
 * the page can least afford it. The class is written straight to the node
 * instead, and the imperative reads are batched into a single rAF so one frame
 * does at most one layout read no matter how many events arrived.
 *
 * Two details make the behaviour feel deliberate. Direction is sampled with a
 * threshold, so trackpad micro-drift never flickers the bar; and the reveal is
 * driven by the *absence* of scroll events rather than a timer started when
 * hiding began, because momentum scrolling keeps firing events after a flick
 * ends and a fixed timeout would pop the bar back mid-flick.
 *
 * Declared at module scope rather than inside the component: these are frozen
 * constants, and the JSX needs the initial `top` class anyway. */

/* Classes are held as token arrays, not strings, because `classList.toggle`
 * takes exactly one token and throws `InvalidCharacterError` on anything with
 * a space in it. `MODE_CLASS.floating` is nine classes; passing it whole to
 * toggle/remove/add either throws or silently no-ops. The JSX joins them back
 * into a className, which is the one place a space-separated string is correct. */

const SCROLL_THRESHOLD = 6;
const REVEAL_AFTER = 140;
const STOP_AFTER_MS = 220;

const HIDDEN_TOKENS = ["-translate-y-full", "opacity-0"] as const;
const SHOWN_TOKENS = ["translate-y-0", "opacity-100"] as const;

const MODE_TOKENS = {
  top: ["bg-transparent"],
  minimal: ["bg-paper/80", "backdrop-blur-[2px]"],
  floating: [
    "mx-auto",
    "max-w-[80rem]",
    "rounded-full",
    "border",
    "border-ink/10",
    "bg-paper/85",
    "px-5",
    "shadow-[0_18px_50px_-30px_rgba(18,19,23,0.4)]",
    "backdrop-blur-xl",
  ],
} as const;

type Mode = keyof typeof MODE_TOKENS;

/** Swap one token set for another on a single element. */
const swapTokens = (
  el: Element,
  add: readonly string[],
  remove: readonly string[]
) => {
  for (const t of remove) el.classList.remove(t);
  for (const t of add) el.classList.add(t);
};

/** The hidden and shown sets are mutually exclusive, so this is a swap. */
const setHidden = (el: Element, off: boolean) => {
  swapTokens(el, off ? HIDDEN_TOKENS : SHOWN_TOKENS, off ? SHOWN_TOKENS : HIDDEN_TOKENS);
};

/**
 * Navigation transforms with scroll: full bar → minimal hairline → floating
 * capsule with backdrop → compressed on mobile with a full-screen sheet.
 *
 * Every item is an in-page anchor, so there is no route change to react to —
 * the active state is derived from the hash and from which chapter the scroll
 * rail is currently reporting.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const barRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Set by the scroll effect so the sheet's open state can reach it without
  // re-subscribing: that effect owns the header's class list and must keep
  // running across sheet open/close.
  const applyOpen = useRef<(v: boolean) => void>(() => { });

  // Close the sheet whenever the hash changes — adjusting during render rather
  // than in an effect avoids a frame where the menu is open over the new target.
  const [lastHash, setLastHash] = useState(hash);
  if (hash !== lastHash) {
    setLastHash(hash);
    if (open) setOpen(false);
  }

  // Let the scroll effect know the sheet state without re-subscribing.
  useEffect(() => {
    applyOpen.current(open);
  }, [open]);

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let mode: Mode = "top";
    let hidden = false;
    let sheetOpen = false;
    let lastY = window.scrollY;
    let lastMoveAt = performance.now();
    let queued = false;

    const paint = () => {
      queued = false;
      const y = window.scrollY;

      const next: Mode =
        y < 40 ? "top" : y < window.innerHeight * 1.2 ? "minimal" : "floating";
      // Only touched when it actually differs, so the common case during a
      // scroll is a no-op rather than a class swap and style recalc.
      if (next !== mode) {
        swapTokens(bar, MODE_TOKENS[next], MODE_TOKENS[mode]);
        bar.dataset.mode = next;
        mode = next;
      }

      const delta = y - lastY;
      if (Math.abs(delta) >= SCROLL_THRESHOLD) {
        lastMoveAt = performance.now();
        // Never hide at the very top: the reader has not started yet, and a bar
        // that vanishes on the first pixel is just a flicker.
        const wantHidden = delta > 0 && y > REVEAL_AFTER;
        if (wantHidden !== hidden) {
          hidden = wantHidden;
          setHidden(bar, hidden && !sheetOpen);
        }
        lastY = y;
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paint);
    };

    // The open sheet covers the viewport, so the header is the only way out of
    // it and must not be hidden while it is open.
    applyOpen.current = (v: boolean) => {
      sheetOpen = v;
      setHidden(bar, hidden && !v);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Polls for "the scrolling stopped" rather than listening for it, because
    // scroll has no end event.
    const poll = window.setInterval(() => {
      if (performance.now() - lastMoveAt > STOP_AFTER_MS && hidden) {
        hidden = false;
        setHidden(bar, false);
      }
    }, 120);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(poll);
    };
  }, []);

  /* The sheet is rendered with an inline `display: none` and is only ever opened
   * from the hamburger, which is `lg:hidden`. Animating it on the initial mount
   * — where `open` is false — tweened a node that was already hidden, and the
   * tween's `onComplete` then reached for a ref that is null on unmount. Both
   * produced the "GSAP target null not found" warning on every page load.
   *
   * The first run is therefore skipped, and the node is captured in a local so
   * a close that lands after unmount cannot dereference a dead ref. */
  const sheetPrimed = useRef(false);

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    if (!open && !sheetPrimed.current) {
      sheetPrimed.current = true;
      return;
    }
    sheetPrimed.current = true;

    if (open) {
      gsap.set(menu, { display: "flex" });
      gsap.fromTo(
        menu,
        { yPercent: -100 },
        { yPercent: 0, duration: 0.7, ease: "expo.inOut" }
      );
      gsap.fromTo(
        menu.querySelectorAll("[data-menu-item]"),
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.05,
          delay: 0.15,
          ease: "expo.out",
        }
      );
    } else {
      gsap.to(menu, {
        yPercent: -100,
        duration: 0.55,
        ease: "expo.inOut",
        onComplete: () => gsap.set(menu, { display: "none" }),
      });
    }
  }, [open]);

  return (
    <>
      {/* The scroll effect owns this element's `data-mode` and hidden classes and
          writes them straight to the node, so nothing here re-renders during a
          scroll. The values below are only the first paint, replaced on the first
          scroll frame. The floating capsule's inner width is expressed as a
          `group-data` variant so it follows the attribute rather than a
          re-render. */}
      <header
        ref={barRef}
        data-mode="top"
        className={`group fixed inset-x-0 top-0 z-[120] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${MODE_TOKENS.top.join(" ")} ${SHOWN_TOKENS.join(" ")}`}
      >
        <nav
          aria-label="Primary"
          className="flex h-16 items-center justify-between gap-6 px-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[mode=floating]:mx-auto group-data-[mode=floating]:w-full md:h-[4.5rem]"
        >
          <AnchorLink
            href="#intro"
            data-cursor="MAGNETIC"
            className="group flex items-center gap-2.5"
            aria-label="AI Employee — back to top"
          >
            <span className="relative grid size-5 place-items-center">
              <span className="absolute inset-0 rotate-45 border border-ink transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[135deg]" />
              <span className="size-1 rounded-full bg-signal" />
            </span>
            <span className="u-display text-[0.95rem] tracking-[0.18em]">
              AI Employee
            </span>
          </AnchorLink>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => {
              const id = l.href.slice(1);
              const active = hash === `#${id}`;
              return (
                <li key={l.href}>
                  <AnchorLink
                    href={l.href}
                    data-cursor="MAGNETIC"
                    aria-current={active ? "true" : undefined}
                    className="group relative block px-3 py-2"
                  >
                    <span
                      className={`u-mono relative z-10 text-[10px] transition-colors duration-300 ${active ? "text-ink" : "text-ash group-hover:text-ink"
                        }`}
                    >
                      {l.label}
                    </span>
                    <span
                      className={`absolute inset-x-3 bottom-1 h-px origin-left bg-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                    />
                  </AnchorLink>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <AnchorLink
              href="#contact"
              data-cursor="MAGNETIC"
              className="hidden items-center gap-2 border border-ink px-4 py-2 lg:flex"
            >
              <span className="u-mono text-[10px]">Build Yours</span>
              <span aria-hidden className="text-[10px]">
                ↗
              </span>
            </AnchorLink>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="u-mono flex size-10 items-center justify-center gap-1 border border-ink/20 lg:hidden"
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span
                className={`block h-px w-4 bg-ink transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`}
              />
              <span
                className={`block h-px w-4 bg-ink transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        style={{ display: "none" }}
        className="fixed inset-0 z-[110] flex-col bg-ink text-paper lg:hidden"
      >
        <div className="u-grid-lines absolute inset-0 opacity-[0.07]" />
        <nav
          aria-label="Mobile"
          className="relative flex h-full flex-col justify-center gap-1 px-6 pt-24 pb-16"
        >
          {NAV_LINKS.map((l, i) => (
            <AnchorLink
              key={l.href}
              href={l.href}
              data-menu-item
              data-cursor="OPEN"
              onNavigate={() => setOpen(false)}
              className="u-display border-b border-paper/10 py-2 text-[clamp(2rem,10vw,3.6rem)] leading-[1.05]"
            >
              <span className="u-mono mr-3 align-middle text-ash">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </AnchorLink>
          ))}
        </nav>
      </div>
    </>
  );
}
