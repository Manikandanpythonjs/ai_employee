import { SectionHead } from "@/components/ui/SectionHead";
import { AgentIndex } from "@/components/agents/AgentIndex";
import { NetworkSection } from "@/components/agents/NetworkSection";
import { AgentsCta } from "@/components/agents/AgentsCta";
import { Plate } from "@/components/features/Plate";
import AiAgentBook from "@/components/generated/AiAgentBook";
import { EntityModel } from "@/components/three/EntityModel";
import { CycledModel } from "@/components/three/CycledModel";

/**
 * The roster. Formerly the /agents route, now a chapter of the single page.
 */
export function AgentsSection() {
  return (
    <>
      <SectionHead
        id="agents"
        kicker="The workforce"
        title={["Many", "specialists"]}
        accent="one mind"
        accentAfter={1}
        body="No generalist does this well. Each agent owns one job, knows its tools, and is accountable for what it returns. Select any row to open its dossier."
        meta={[
          { label: "Agents", value: "9" },
          { label: "Discipline", value: "Single" },
          { label: "Handoff", value: "Verified" },
          { label: "Memory", value: "Shared" },
        ]}
      />

      <NetworkSection />

      <div className="u-shell pb-24 md:pb-32">
        <AgentIndex />
      </div>

      {/* The field manual, and the two machines that staff it. The book walks
          the six specialisations in order; beside it, the two robots are the
          physical reading of the same roster — one idle, one mid-gesture. */}
      <section className="border-y border-ink/12 bg-paper-2 py-24 md:py-32">
        <div className="u-shell">
          <header className="mb-14 max-w-3xl">
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> The manual
            </p>
            <h3 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
              Read the <span className="u-serif text-signal">roster</span> in
              order.
            </h3>
          </header>

          <Plate
            caption="AI Agent field manual — six chapters"
            read="VI"
            accent="ink"
            className="mx-auto max-w-4xl"
            bodyClassName="p-6 md:p-10"
          >
            <AiAgentBook />
          </Plate>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <figure className="border border-ink/12 bg-ivory">
              <div className="relative h-[24rem] sm:h-[28rem]">
                <CycledModel
                  src="/media/models/friendly_sci-fi_robot_with_animations.glb"
                  clips={["Look_Wave", "Sitting", "Free_Fall"]}
                  radius={0.82}
                  spin={0.22}
                  interval={4200}
                />
              </div>
              <figcaption className="u-mono border-t border-ink/10 px-4 py-3">
                Front-line unit — three clips
              </figcaption>
            </figure>

            <figure className="border border-ink/12 bg-ivory">
              <div className="relative h-[24rem] sm:h-[28rem]">
                <EntityModel
                  src="/media/models/robot.glb"
                  radius={0.82}
                  spin={0.22}
                  clip="Take 001"
                />
                <span
                  aria-hidden
                  className="u-mono pointer-events-none absolute bottom-3 left-3 text-ash"
                >
                  CLIP · Take 001
                </span>
              </div>
              <figcaption className="u-mono border-t border-ink/10 px-4 py-3">
                Scout unit — one take
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <AgentsCta />
    </>
  );
}