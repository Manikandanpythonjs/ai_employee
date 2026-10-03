import { SectionHead } from "@/components/ui/SectionHead";
import { EraTimeline } from "@/components/pages/EraTimeline";
import { Marquee } from "@/components/ui/Marquee";
import { AnchorLink } from "@/components/ui/AnchorLink";

const PRINCIPLES = [
  {
    n: "01",
    title: "Outcomes, not output",
    body: "A response is not a result. Every employee is measured against whether the work got finished, and against what it cost to finish it.",
  },
  {
    n: "02",
    title: "The failure path is designed first",
    body: "We design what happens when a tool times out before we design what happens when it succeeds, because that branch is the one that runs in production.",
  },
  {
    n: "03",
    title: "Verification is not optional",
    body: "Anything leaving the system is checked against the goal by something that is incentivised to disagree. A verifier that never blocks anything is decoration.",
  },
  {
    n: "04",
    title: "Humans decide where it matters",
    body: "Autonomy where it is safe, explicit approval where consequences are real. The boundary is written down before anything ships, not negotiated per incident.",
  },
  {
    n: "05",
    title: "Legible by default",
    body: "If a person cannot reconstruct why a decision was made, the system is not finished. Every action is scoped, logged, and reversible where reversal is possible.",
  },
  {
    n: "06",
    title: "Memory that can be corrected",
    body: "A store that only accumulates cannot be fixed, only built around. We keep what stays true, summarise what repeats, and forget the rest.",
  },
];

/**
 * Philosophy, through-line and principles. Formerly the /about route, now a
 * chapter of the single page. The colophon keeps its own `colophon` id because
 * the footer legal links point straight at it.
 */
export function AboutSection() {
  return (
    <>
      <SectionHead
        id="about"
        kicker="Philosophy"
        title={["We are building", "digital employees"]}
        accent="digital employees"
        accentAfter={1}
        body="Not chatbots with better manners. Workers with a mandate, a method, and someone to answer to. Everything below follows from taking that sentence literally."
        meta={[
          { label: "Founded", value: "2026" },
          { label: "Focus", value: "AI employees" },
          { label: "Model", value: "Multi-agent" },
          { label: "Status", value: "Showcase" },
        ]}
      />

      {/* Manifesto */}
      <section className="u-shell border-t border-ink/12 py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> The premise
            </p>
            <h3 className="u-display text-[clamp(2rem,5vw,4rem)]">
              Software has always followed the path a human drew.
            </h3>
          </div>
          <div className="space-y-6 text-base leading-[1.75] text-graphite md:text-lg">
            <p>
              Every previous leap in automation extended what software could do
              without changing who was responsible. Automation was faster at the
              parts we had already specified. Assistants were better at the parts
              we still had to complete by hand.
            </p>
            <p>
              The interesting change is not that a machine can produce better
              language. It is that a machine can now hold an objective, decide
              what to do with it, and carry the consequences of that decision
              across systems and across time.
            </p>
            <p>
              That is a different kind of thing from a chat window. It has a job
              description. It can be wrong in ways that need repairing. And
              someone has to be accountable for it — which means a person has to
              decide, in advance, how much they are willing to delegate.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-y border-ink/12 bg-paper-2">
        <div className="u-shell grid items-center gap-10 pt-20 md:pt-28 lg:grid-cols-[1.2fr_0.8fr]">
          <header>
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> The through-line
            </p>
            <h3 className="u-display max-w-4xl text-[clamp(2.2rem,6vw,5rem)]">
              Seven steps, each one{" "}
              <span className="u-serif text-signal">adding</span>
              <br />
              to the last.
            </h3>
          </header>

          {/* The claim the timeline is arguing towards, stated plainly. */}
          <figure className="relative border border-ink/12 bg-ivory">
            <div className="relative aspect-[4/3] overflow-hidden bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/media/images/ai_won't_replace.jpg"
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <figcaption className="u-mono border-t border-ink/10 px-5 py-4 text-ash">
              Every step added responsibility. None removed it.
            </figcaption>
          </figure>
        </div>
        <EraTimeline />
      </section>

      <Marquee
        items={[
          "We are building digital employees",
          "Not chatbots",
          "An AI workforce",
        ]}
        size="clamp(1.6rem,4vw,3.4rem)"
        speed={48}
        sep="*"
        className="border-b border-ink/12 bg-ink py-9 text-paper"
      />

      {/* Principles */}
      <section className="u-shell py-20 md:py-28">
        <header className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> Principles
          </p>
          <h3 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
            Six rules we do not trade away.
          </h3>
        </header>

        <div className="border-t border-ink/12">
          {PRINCIPLES.map((p) => (
            <article
              key={p.n}
              data-cursor="VIEW"
              className="group grid gap-3 border-b border-ink/12 py-8 transition-colors hover:bg-ivory md:grid-cols-[3.5rem_1fr_1.3fr] md:items-baseline md:gap-8"
            >
              <span className="u-mono text-signal">{p.n}</span>
              <h4 className="u-display text-[clamp(1.2rem,2.6vw,1.9rem)]">
                {p.title}
              </h4>
              <p className="text-sm leading-relaxed text-graphite md:text-base">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Colophon */}
      <section
        id="colophon"
        className="scroll-mt-24 border-t border-ink/12 bg-paper-2 py-20 md:py-24"
      >
        <div className="u-shell grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="u-mono mb-4 text-ash">Colophon</h3>
            <p className="text-sm leading-relaxed text-graphite">
              This site is a UI/UX showcase. Every system described here is
              conceptual — there is no backend, no data, and nothing you type is
              transmitted anywhere.
            </p>
          </div>
          <div>
            <h3 className="u-mono mb-4 text-ash">Privacy</h3>
            <p className="text-sm leading-relaxed text-graphite">
              No accounts, no tracking, no cookies beyond what is needed to
              render the page. Form submissions on this page are demonstrated in
              the browser and never sent.
            </p>
          </div>
          <div>
            <h3 className="u-mono mb-4 text-ash">Terms</h3>
            <p className="text-sm leading-relaxed text-graphite">
              All names, metrics and integrations shown are illustrative.
              Product descriptions are conceptual and do not describe a
              commercially available system.
            </p>
          </div>
        </div>

        <div className="u-shell mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-ink/12 pt-8">
          <span className="u-mono text-ash">
            An AI employee is not a chatbot.
          </span>
          <AnchorLink
            href="#contact"
            data-cursor="MAGNETIC"
            className="group flex items-center gap-3 border-b border-ink pb-1 transition-colors hover:border-signal"
          >
            <span className="u-mono">Build yours</span>
            <span
              aria-hidden
              className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
            >
              →
            </span>
          </AnchorLink>
        </div>
      </section>
    </>
  );
}