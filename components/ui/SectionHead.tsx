"use client";

import { useSplitReveal, SplitText } from "@/lib/motion";

/**
 * Chapter opener for the sections that were originally separate routes. Keeps
 * the editorial shape of the old per-page hero — mono kicker, oversized
 * condensed headline with a serif accent, supporting paragraph, hairline
 * metadata row — so moving everything onto one page did not flatten the
 * rhythm into a single undifferentiated column.
 */
export function SectionHead({
  id,
  kicker,
  title,
  accent,
  accentAfter = 1,
  body,
  meta,
}: {
  id: string;
  kicker: string;
  title: string[];
  accent?: string;
  accentAfter?: number;
  body: string;
  meta?: { label: string; value: string }[];
}) {
  const titleRef = useSplitReveal<HTMLHeadingElement>({ start: "top 88%" });

  return (
    <header id={id} className="u-shell relative scroll-mt-24 pb-14 pt-28 md:pb-20 md:pt-36">
      <div aria-hidden className="u-grid-lines pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
        <div>
          <p className="u-mono mb-8 text-ash">
            <span className="text-signal">▸</span> {kicker}
          </p>

          <h2
            ref={titleRef}
            className="u-display text-[clamp(2.4rem,7.6vw,7rem)]"
          >
            <SplitText>
              {title.map((line, i) => (
                <span key={line} className="block">
                  {line}
                  {accent && accentAfter === i && (
                    <span className="u-serif ml-[0.12em] text-signal">{accent}</span>
                  )}
                </span>
              ))}
            </SplitText>
          </h2>
        </div>

        <div className="flex flex-col justify-end gap-8 lg:pb-4">
          <p className="max-w-md text-base leading-relaxed text-graphite">{body}</p>

          {meta && (
            /* Two columns, not four. This grid lives in the narrow right-hand
               column of the 1.25fr/0.75fr split above, so it is roughly 500px
               wide at the largest shell — four columns left ~95px of text each,
               and values like "MULTI-AGENT" wrapped to two lines and broke the
               row's alignment. A viewport breakpoint cannot express this: the
               column stays narrow at every screen size. */
            <dl className="grid grid-cols-2 gap-px border border-ink/12 bg-ink/12">
              {meta.map((m) => (
                <div key={m.label} className="bg-paper px-4 py-4">
                  <dt className="u-mono text-ash">{m.label}</dt>
                  <dd className="u-display mt-2 text-xl">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </header>
  );
}