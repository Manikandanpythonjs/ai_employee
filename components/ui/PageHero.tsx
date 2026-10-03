"use client";

import { useReveal, useSplitReveal, SplitText } from "@/lib/motion";

/**
 * Editorial page opener shared by the inner routes: mono kicker, oversized
 * condensed headline with an optional serif accent, supporting paragraph and a
 * hairline metadata row.
 */
export function PageHero({
  kicker,
  title,
  accent,
  accentAfter,
  body,
  meta,
}: {
  kicker: string;
  title: string[];
  accent?: string;
  accentAfter?: number;
  body: string;
  meta: { label: string; value: string }[];
}) {
  const titleRef = useSplitReveal<HTMLHeadingElement>({ start: "top 88%" });
  const metaRef = useReveal<HTMLDListElement>({ start: "top 92%", stagger: 0.06 });

  return (
    <header className="u-shell relative pb-16 pt-32 md:pb-24 md:pt-44">
      <div aria-hidden className="u-grid-lines pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
        <div>
          <p className="u-mono mb-8 text-ash">
            <span className="text-signal">▸</span> {kicker}
          </p>

          <h1
            ref={titleRef}
            className="u-display text-[clamp(2.7rem,8.6vw,8.4rem)]"
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
          </h1>
        </div>

        <div className="flex flex-col justify-end gap-8 lg:pb-4">
          <p className="max-w-md text-base leading-relaxed text-graphite">
            {body}
          </p>

          <dl
            ref={metaRef}
            className="grid grid-cols-2 gap-px border border-ink/12 bg-ink/12 sm:grid-cols-4"
          >
            {meta.map((m) => (
              <div key={m.label} className="bg-paper px-4 py-4">
                <dt className="u-mono text-ash">{m.label}</dt>
                <dd className="u-display mt-2 text-2xl">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </header>
  );
}
