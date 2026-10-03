"use client";

import { useCallback, type AnchorHTMLAttributes, type ReactNode } from "react";
import { getLenis } from "@/components/system/SmoothScroll";

/**
 * In-page navigation. The site is one long document, so every nav target is a
 * `#id` on the home page rather than a route.
 *
 * Two things a bare `href="#id"` gets wrong here:
 *
 * 1. Lenis owns the scroll position, so the browser's native jump fights the
 *    smooth-scroll loop and lands somewhere nearby instead of at the target.
 *    Handing the destination to `lenis.scrollTo` keeps one source of truth.
 * 2. The fixed header would otherwise cover the target's first line, so every
 *    jump is offset by the nav height.
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  // Nav is 4.5rem tall once floating; leave a little breathing room below it.
  const offset = 72;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.4 });
    return;
  }

  // Reduced motion disables Lenis entirely, so fall back to the native jump.
  window.scrollTo({
    top,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function AnchorLink({
  href,
  children,
  onNavigate,
  ...rest
}: { href: string; children: ReactNode; onNavigate?: () => void } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      rest.onClick?.(e);
      // Let modified clicks and middle-clicks behave like real links.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
        return;
      }
      const id = href.startsWith("#") ? href.slice(1) : href;
      if (!document.getElementById(id)) return;

      e.preventDefault();
      onNavigate?.();
      scrollToId(id);

      // Keep the URL honest without a history entry per click, so the back
      // button still leaves the page rather than stepping through sections.
      window.history.replaceState(null, "", `#${id}`);
    },
    [href, onNavigate, rest]
  );

  return (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}