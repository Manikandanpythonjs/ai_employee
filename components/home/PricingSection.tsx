import { SectionHead } from "@/components/ui/SectionHead";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { Magnetic } from "@/components/ui/Magnetic";
import { PRICING, PRICING_FIGURES, PRICING_NOTES } from "@/lib/site";

/**
 * Pricing. Not a route — a chapter of the single page, sitting between the use
 * cases that describe what it does and the contact form that sells it.
 *
 * The unit is deliberately an employee rather than a seat: the buyer is not
 * licensing an interface, they are commissioning a worker to own a workflow.
 */
export function PricingSection() {
  return (
    <>
      <SectionHead
        id="pricing"
        kicker="Commercials"
        title={["Priced per", "employee"]}
        accent="employee"
        accentAfter={1}
        body="You are not buying seats. You are commissioning workers to own workflows — so the number that matters is how many of them you need, not how many people are looking at them."
        meta={[
          { label: "Unit", value: "Per employee" },
          { label: "Contract", value: "Monthly" },
          { label: "Setup", value: "Included" },
          { label: "Exit", value: "Export all" },
        ]}
      />

      {/* Plans. `best` is marked with weight and a corner flag rather than a
          lifted card, so the row keeps one baseline and the eye is pulled by
          colour instead of by geometry. */}
      <section className="u-shell pb-16">
        <div className="grid gap-px border border-ink/12 bg-ink/12 lg:grid-cols-3">
          {PRICING.map((p) => (
            <article
              key={p.id}
              className={`flex flex-col bg-paper px-6 py-8 md:px-8 md:py-10 ${
                p.best ? "bg-ink text-paper" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3
                  className={`u-display text-2xl md:text-3xl ${p.best ? "text-paper" : ""}`}
                >
                  {p.name}
                </h3>
                {p.best && (
                  <span className="u-mono shrink-0 bg-signal px-2.5 py-1 text-[9px] text-ink">
                    MOST TAKEN
                  </span>
                )}
              </div>

              <p
                className={`mt-4 min-h-[3rem] max-w-xs text-sm leading-relaxed ${
                  p.best ? "text-paper/60" : "text-graphite"
                }`}
              >
                {p.summary}
              </p>

              <div className="mt-8 border-y border-current/15 py-6">
                <span className="u-display block text-[clamp(2.4rem,5vw,3.4rem)] leading-none">
                  {p.price}
                </span>
                <span
                  className={`u-mono mt-3 block text-[10px] uppercase tracking-[0.16em] ${
                    p.best ? "text-paper/45" : "text-ash"
                  }`}
                >
                  {p.unit}
                </span>
              </div>

              <ul className="mt-7 flex-1 space-y-3">
                {p.includes.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className={`mt-[0.55em] size-1 shrink-0 ${p.best ? "bg-acid" : "bg-signal"}`}
                    />
                    <span
                      className={`text-sm leading-relaxed ${
                        p.best ? "text-paper/75" : "text-graphite"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <dl
                className={`mt-7 space-y-2 border-t pt-5 ${
                  p.best ? "border-paper/15" : "border-ink/10"
                }`}
              >
                {p.caps.map((c) => (
                  <div
                    key={c.label}
                    className={`u-mono flex justify-between gap-3 text-[10px] ${
                      p.best ? "text-paper/40" : "text-ash"
                    }`}
                  >
                    <dt>{c.label}</dt>
                    <dd>{c.value}</dd>
                  </div>
                ))}
              </dl>

              <Magnetic strength={0.2} className="mt-9 w-full">
                <AnchorLink
                  href="#contact"
                  data-cursor="MAGNETIC"
                  className={`group flex w-full items-center justify-between gap-4 border px-6 py-4 transition-colors ${
                    p.best
                      ? "border-paper bg-paper text-ink hover:bg-transparent hover:text-paper"
                      : "border-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  <span className="u-mono">{p.cta}</span>
                  <span
                    aria-hidden
                    className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </AnchorLink>
              </Magnetic>
            </article>
          ))}
        </div>

        <p className="u-mono mt-6 text-ash">
          All plans include the verification pass, the repair loop and full run
          history. Prices are illustrative — this page is a demonstration.
        </p>
      </section>

      {/* Comparison. A real table would need a wider viewport than the shell
          allows; as a hairline grid it stays legible at every size. */}
      <section className="border-y border-ink/12 bg-paper-2 py-24 md:py-32">
        <div className="u-shell">
          <header className="mb-12 max-w-3xl">
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> Side by side
            </p>
            <h3 className="u-display text-[clamp(2rem,5.4vw,4.2rem)]">
              Where the plans
              <br />
              <span className="u-serif text-signal">actually differ.</span>
            </h3>
          </header>

          <dl className="border-t border-ink/12">
            <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] gap-px bg-ink/12">
              <div className="bg-paper-2 px-4 py-5" />
              {PRICING.map((p) => (
                <div
                  key={p.id}
                  className={`px-4 py-5 ${p.best ? "bg-ink text-paper" : "bg-paper-2"}`}
                >
                  <span className="u-mono">{p.name}</span>
                </div>
              ))}
            </div>

            {PRICING_FIGURES.map((row) => (
              <div
                key={row[0]}
                className="grid grid-cols-[1.2fr_repeat(3,1fr)] gap-px border-t border-ink/12 bg-ink/12"
              >
                <div className="bg-paper-2 px-4 py-5">
                  <dt className="u-mono text-ash">{row[0]}</dt>
                </div>
                {row.slice(1).map((cell, i) => (
                  <div
                    key={cell}
                    className={`px-4 py-5 text-sm ${
                      PRICING[i].best
                        ? "bg-ink text-paper/75"
                        : "bg-paper-2 text-graphite"
                    }`}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Objections. Answered on the page rather than in the sales call. */}
      <section className="u-shell py-24 md:py-32">
        <header className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Before you ask
          </p>
          <h3 className="u-display text-[clamp(2rem,5.4vw,4.2rem)]">
            The four questions
            <br />
            <span className="u-serif text-signal">everyone asks.</span>
          </h3>
        </header>

        <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
          {PRICING_NOTES.map((n, i) => (
            <div key={n.q} className="border-t border-ink/12 pt-6">
              <div className="flex items-baseline gap-4">
                <span className="u-mono text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h4 className="u-display text-xl">{n.q}</h4>
              </div>
              <p className="mt-4 pl-8 text-sm leading-relaxed text-graphite">
                {n.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}