import { SectionHead } from "@/components/ui/SectionHead";
import { OrchestrationPin } from "@/components/features/OrchestrationPin";
import { OrchestrationLadder } from "@/components/pages/OrchestrationLadder";
import { Plate } from "@/components/features/Plate";
import { DrawFlow } from "@/components/features/DrawFlow";
import { ParallelLanes } from "@/components/features/ParallelLanes";
import { RepairLoop } from "@/components/features/RepairLoop";
import { Clockwork } from "@/components/features/Clockwork";
import { ORCHESTRATION_STAGES } from "@/lib/site";
import AgentConnectorBuilder from "@/components/generated/AgentConnectorBuilder";
import AgentOrchestration from "@/components/generated/AgentOrchestration";
import AiOrchestrationHero from "@/components/generated/AiOrchestrationHero";

/**
 * Three deeper mechanics shown as plates beneath the eight-stage ladder. These
 * are the concrete answers to "how does the work actually move", which the
 * ladder only asserts.
 */
const MECHANICS = [
  {
    caption: "Dependency release",
    read: "A",
    body: "Independent branches are released at the same instant. Sequencing is computed from the task graph, not guessed.",
    Visual: DrawFlow,
  },
  {
    caption: "Parallel execution",
    read: "B",
    body: "Five lanes run at once, each gated behind the slowest upstream stage, then reconverge on a single merge point.",
    Visual: ParallelLanes,
  },
  {
    caption: "Repair loop",
    read: "C",
    body: "Failure enters a closed circuit rather than a dead end — detect, diagnose, replan, repair, retry.",
    Visual: RepairLoop,
  },
  {
    caption: "Long-running work",
    read: "D",
    body: "Workflows survive across days on checkpointed state. The run continues while you are not watching.",
    Visual: Clockwork,
  },
] as const;

const ACCENTS = ["ink", "cobalt", "blood", "signal"] as const;

/**
 * Orchestration. Formerly the /orchestration route, now a chapter of the single
 * page.
 *
 * `OrchestrationPin` already owns the `orchestration` id, so this section's
 * heading anchors to `orchestration-ladder` — the deep end of the chapter,
 * which is what a nav click should land on rather than the pinned stage above.
 */
export function OrchestrationDetail() {
  return (
    <>
      <OrchestrationPin />

      <SectionHead
        id="orchestration-ladder"
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

      <div className="u-shell pb-24 md:pb-32">
        <header className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> The eight stages
          </p>
          <h3 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
            Each layer is <span className="u-serif text-signal">added</span>,
            never swapped.
          </h3>
        </header>
        <OrchestrationLadder />
      </div>

      <section className="border-y border-ink/12 bg-paper-2 py-24 md:py-32">
        <div className="u-shell">
          <header className="mb-14 max-w-3xl">
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> Mechanics
            </p>
            <h3 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
              How the work actually moves.
            </h3>
          </header>

          <div className="grid gap-x-8 gap-y-16 lg:grid-cols-2">
            {MECHANICS.map((m, i) => (
              <Plate
                key={m.read}
                caption={m.caption}
                read={m.read}
                accent={ACCENTS[i] ?? "ink"}
                bodyClassName="p-6 md:p-8"
              >
                <div className="mb-8 flex aspect-[16/10] items-center justify-center border border-ink/10 bg-paper">
                  <m.Visual />
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
        <header className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> The workbench
          </p>
          <h3 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
            Then wire it <span className="u-serif text-signal">yourself.</span>
          </h3>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-graphite">
            Everything above is a description of a graph. This is the graph. Drag
            a node, drop a port onto another, and the run updates underneath.
          </p>
        </header>

        <Plate
          caption="Connector builder — drag to rewire"
          read="LIVE"
          accent="signal"
          bodyClassName="p-4 md:p-6"
        >
          <AgentConnectorBuilder />
        </Plate>
      </section>

      <section className="border-y border-ink/12 bg-paper-2 py-24 md:py-32">
        <div className="u-shell">
          <header className="mb-14 max-w-3xl">
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> Dispatch and topology
            </p>
            <h3 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
              One mind, <span className="u-serif text-signal">many hands.</span>
            </h3>
          </header>

          <div className="grid gap-8 xl:grid-cols-2">
            <Plate
              caption="Dispatch — live task allocation"
              read="A"
              accent="cobalt"
              bodyClassName="p-6 md:p-8"
            >
              <div className="mb-7 overflow-hidden border border-ink/10 bg-ivory">
                <AiOrchestrationHero />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-graphite">
                A task arrives at the core. Three to five specialists are drawn
                from the pool, briefed, and then asked to report back. The
                selection is not scripted — each cycle picks a different subset.
              </p>
            </Plate>

            <Plate
              caption="Topology — switchable schematic"
              read="B"
              accent="ink"
              bodyClassName="p-6 md:p-8"
            >
              <div className="mb-7 overflow-hidden border border-ink/10">
                <AgentOrchestration />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-graphite">
                The same run, drawn as static topology: planner above, workers
                beneath, verifier and repair closing the loop. Use the toggle in
                the corner to read it either way round.
              </p>
            </Plate>
          </div>
        </div>
      </section>

      <section className="u-shell py-24 md:py-32">
        <h3 className="u-display mb-12 text-[clamp(1.8rem,4.4vw,3.4rem)]">
          The eight stages, in order.
        </h3>
        <ol className="border-t border-ink/12">
          {ORCHESTRATION_STAGES.map((s) => (
            <li
              key={s.stage}
              data-cursor="VIEW"
              className="group grid gap-3 border-b border-ink/12 py-6 transition-colors hover:bg-ivory md:grid-cols-[4rem_1fr_1.4fr] md:items-baseline md:gap-8"
            >
              <span className="u-mono text-signal">{s.stage}</span>
              <h4 className="u-display text-xl md:text-2xl">{s.title}</h4>
              <span className="text-sm leading-relaxed text-graphite">
                {s.body}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}