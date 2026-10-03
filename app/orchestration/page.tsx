import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { OrchestrationPin } from "@/components/features/OrchestrationPin";
import { OrchestrationLadder } from "@/components/pages/OrchestrationLadder";
import { Plate } from "@/components/features/Plate";
import { DrawFlow } from "@/components/features/DrawFlow";
import { ParallelLanes } from "@/components/features/ParallelLanes";
import { RepairLoop } from "@/components/features/RepairLoop";
import { Clockwork } from "@/components/features/Clockwork";
import { ORCHESTRATION_STAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Orchestration",
  description:
    "How a single agent becomes a workforce: eight stages from one agent with tools to a complete AI workforce with verification, repair loops and human approval.",
};

/** Three deeper mechanics shown as plates beneath the eight-stage ladder. */
const MECHANICS = [
  {
    caption: "Dependency release",
    read: "A",
    body: "Independent branches are released at the same instant. Sequencing is computed from the task graph, not guessed.",
  },
  {
    caption: "Parallel execution",
    read: "B",
    body: "Five lanes run at once, each gated behind the slowest upstream stage, then reconverge on a single merge point.",
  },
  {
    caption: "Repair loop",
    read: "C",
    body: "Failure enters a closed circuit rather than a dead end — detect, diagnose, replan, repair, retry.",
  },
  {
    caption: "Long-running work",
    read: "D",
    body: "Workflows survive across days on checkpointed state. The run continues while you are not watching.",
  },
] as const;

export default function OrchestrationPage() {
  return (
    <main>
      <PageHero
        kicker="Coordination"
        title={["From one", "to a workforce"]}
        accent="to a workforce"
        accentAfter={1}
        body="Complexity is not the goal. Coordination is. Scroll through the eight stages that turn a single prompt into a functioning digital workforce."
        meta={[
          { label: "Stages", value: "8" },
          { label: "Topology", value: "Hierarchical" },
          { label: "Failure", value: "Repaired" },
          { label: "Escalation", value: "Human" },
        ]}
      />

      <OrchestrationPin />

      <div className="u-shell py-24 md:py-32">
        <header className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> The eight stages
          </p>
          <h2 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
            Each layer is <span className="u-serif text-signal">added</span>,
            never swapped.
          </h2>
        </header>
        <OrchestrationLadder />
      </div>

      <section className="border-t border-ink/12 bg-paper-2 py-24 md:py-32">
        <div className="u-shell">
          <header className="mb-14 max-w-3xl">
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> Mechanics
            </p>
            <h2 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
              How the work actually moves.
            </h2>
          </header>

          <div className="grid gap-x-8 gap-y-16 lg:grid-cols-2">
            {MECHANICS.map((m, i) => (
              <Plate
                key={m.read}
                caption={m.caption}
                read={m.read}
                accent={
                  (["ink", "cobalt", "blood", "signal"] as const)[i] ?? "ink"
                }
                bodyClassName="p-6 md:p-8"
              >
                <div className="mb-8 flex aspect-[16/10] items-center justify-center border border-ink/10 bg-paper">
                  {i === 0 && <DrawFlow />}
                  {i === 1 && <ParallelLanes />}
                  {i === 2 && <RepairLoop />}
                  {i === 3 && <Clockwork />}
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-graphite">
                  {m.body}
                </p>
              </Plate>
            ))}
          </div>
        </div>
      </section>

      <section className="u-shell py-24 md:py-32">
        <h2 className="u-display mb-12 text-[clamp(1.8rem,4.4vw,3.4rem)]">
          The eight stages, in order.
        </h2>
        <ol className="border-t border-ink/12">
          {ORCHESTRATION_STAGES.map((s) => (
            <li
              key={s.stage}
              data-cursor="VIEW"
              className="group grid gap-3 border-b border-ink/12 py-6 transition-colors hover:bg-ivory md:grid-cols-[4rem_1fr_1.4fr] md:items-baseline md:gap-8"
            >
              <span className="u-mono text-signal">{s.stage}</span>
              <h3 className="u-display text-xl md:text-2xl">{s.title}</h3>
              <span className="text-sm leading-relaxed text-graphite">
                {s.body}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}