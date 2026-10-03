import type { ReactNode } from "react";

/** Small caps section label with index and hairline — the spine of the layout. */
export function ChapterLabel({
  n,
  children,
  className = "",
}: {
  n: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`u-mono flex items-center gap-3 text-ash ${className}`}>
      <span className="text-signal">{n}</span>
      <span aria-hidden className="h-px w-8 bg-ink/25" />
      <span>{children}</span>
    </div>
  );
}

/** Full-bleed section frame: consistent rhythm, hairline grid, generous air. */
export function Section({
  id,
  children,
  className = "",
  grid = true,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  grid?: boolean;
}) {
  return (
    <section id={id} className={`relative isolate ${className}`}>
      {grid && (
        <div
          aria-hidden
          className="u-grid-lines pointer-events-none absolute inset-0 opacity-60"
        />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

/** Display heading with a mono kicker and an editorial serif accent. */
export function DisplayHeading({
  kicker,
  lines,
  accent,
  accentAfter,
  className = "",
  size = "clamp(2.6rem,7.4vw,7.5rem)",
}: {
  kicker?: string;
  lines: string[];
  accent?: string;
  accentAfter?: number;
  className?: string;
  size?: string;
}) {
  return (
    <div className={className}>
      {kicker && (
        <p className="u-mono mb-6 text-ash">
          <span className="text-signal">▸</span> {kicker}
        </p>
      )}
      <h2 className="u-display" style={{ fontSize: size }}>
        {lines.map((l, i) => (
          <span key={l} className="block">
            {l}
            {accent && accentAfter === i && (
              <span className="u-serif ml-[0.12em] text-signal">{accent}</span>
            )}
          </span>
        ))}
      </h2>
    </div>
  );
}
