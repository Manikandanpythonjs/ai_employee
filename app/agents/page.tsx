import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AgentIndex } from "@/components/agents/AgentIndex";
import { NetworkSection } from "@/components/agents/NetworkSection";
import { AgentsCta } from "@/components/agents/AgentsCta";

export const metadata: Metadata = {
  title: "Agents",
  description:
    "Nine specialised agents — planner, research, browser, coding, data, communication, verification, memory and repair — each with its own capability, workflow and tool connections.",
};

export default function AgentsPage() {
  return (
    <main>
      <PageHero
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

      <AgentsCta />
    </main>
  );
}