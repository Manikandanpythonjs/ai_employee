import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { EraTimeline } from "@/components/pages/EraTimeline";
import { Marquee } from "@/components/ui/Marquee";

export const metadata: Metadata = {
  title: "About",
  description:
    "We are building digital employees — not chatbots. The philosophy, the through-line from human work to an AI workforce, and the principles that govern autonomy.",
};

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

export default function AboutPage() {
  return (
    <main>
      <PageHero
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
            <h2 className="u-display text-[clamp(2rem,5vw,4rem)]">
              Software has always followed the path a human drew.
            </h2>
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
        <header className="u-shell pt-20 md:pt-28">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> The through-line
          </p>
          <h2 className="u-display max-w-4xl text-[clamp(2.2rem,6vw,5rem)]">
            Seven steps, each one <span className="u-serif text-signal">adding</span>
            <br />
            to the last.
          </h2>
        </header>
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
          <h2 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
            Six rules we do not trade away.
          </h2>
        </header>

        <div className="border-t border-ink/12">
          {PRINCIPLES.map((p) => (
            <article
              key={p.n}
              data-cursor="VIEW"
              className="group grid gap-3 border-b border-ink/12 py-8 transition-colors hover:bg-ivory md:grid-cols-[3.5rem_1fr_1.3fr] md:items-baseline md:gap-8"
            >
              <span className="u-mono text-signal">{p.n}</span>
              <h3 className="u-display text-[clamp(1.2rem,2.6vw,1.9rem)]">
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed text-graphite md:text-base">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Colophon */}
      <section className="border-t border-ink/12 bg-paper-2 py-20 md:py-24">
        <div className="u-shell grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="u-mono mb-4 text-ash">Colophon</h2>
            <p className="text-sm leading-relaxed text-graphite">
              This site is a UI/UX showcase. Every system described here is
              conceptual — there is no backend, no data, and nothing you type is
              transmitted anywhere.
            </p>
          </div>
          <div>
            <h2 className="u-mono mb-4 text-ash">Privacy</h2>
            <p className="text-sm leading-relaxed text-graphite">
              No accounts, no tracking, no cookies beyond what is needed to
              render the page. Form submissions on the contact page are
              demonstrated in the browser and never sent.
            </p>
          </div>
          <div>
            <h2 className="u-mono mb-4 text-ash">Terms</h2>
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
          <Link
            href="/contact"
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
          </Link>
        </div>
      </section>
    </main>
  );
}