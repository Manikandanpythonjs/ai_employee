import type { ReactNode } from "react";

/** Frame every generated feature visual sits inside — hairline, square, technical. */
export const PLATE =
  "relative isolate overflow-hidden border border-ink/12 bg-ivory";

export const ACCENT = {
  ink: "#121317",
  signal: "#ff4a1c",
  acid: "#c8f432",
  cobalt: "#2447e8",
  blood: "#d81e31",
} as const;

export type AccentName = keyof typeof ACCENT;

/** Corner ticks — the drafting-table detail shared by every plate. */
export function PlateTicks() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {[
        "left-3 top-3 border-l border-t",
        "right-3 top-3 border-r border-t",
        "left-3 bottom-3 border-b border-l",
        "right-3 bottom-3 border-b border-r",
      ].map((pos) => (
        <span key={pos} className={`absolute size-3 border-ink/30 ${pos}`} />
      ))}
    </span>
  );
}

export function Plate({
  children,
  caption,
  read,
  accent = "ink",
  className = "",
  bodyClassName = "",
}: {
  children: ReactNode;
  /** Technical plate caption, read as the figure's description. */
  caption: string;
  read?: string;
  accent?: AccentName;
  className?: string;
  bodyClassName?: string;
}) {
  const tint = ACCENT[accent];
  return (
    <figure className={`${PLATE} ${className}`}>
      <div className={`relative ${bodyClassName}`}>{children}</div>
      <figcaption className="u-mono flex items-center justify-between gap-4 border-t border-ink/12 px-4 py-2.5 text-ash">
        <span className="truncate">{caption}</span>
        <span className="flex shrink-0 items-center gap-2">
          {read && <span>{read}</span>}
          <span
            aria-hidden
            className="size-1.5"
            style={{ background: tint }}
          />
        </span>
      </figcaption>
    </figure>
  );
}
