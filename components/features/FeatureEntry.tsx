"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/lib/motion";

/**
 * Entry animation for a feature block. Kept as a client leaf so the page
 * itself stays a server component.
 */
export function FeatureEntry({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>({ start: "top 86%", stagger: 0.09, y: 40 });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
