import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { UseCaseStories } from "@/components/pages/UseCaseStories";
import { USE_CASES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "Research, sales, engineering, operations, marketing and executive use cases — each one a complete workflow with an accountable owner and verified output.",
};

export default function UseCasesPage() {
  return (
    <main>
      <PageHero
        kicker="In practice"
        title={["Six rooms", "the work lives in"]}
        accent="the work lives in"
        accentAfter={1}
        body="A capability that has never run a real workflow is a demo. Open each one and watch the steps advance — that sequence is the whole job."
        meta={[
          { label: "Functions", value: "6" },
          { label: "Output", value: "Verified" },
          { label: "Owner", value: "Named agent" },
          { label: "Handoff", value: "Human" },
        ]}
      />

      <section className="u-shell pb-10">
        <h2 className="u-display text-[clamp(1.8rem,4.4vw,3.2rem)]">
          Six rooms, one shape.
        </h2>
      </section>

      <UseCaseStories />

      <section className="u-shell border-t border-ink/12 py-20 md:py-24">
        <p className="u-mono text-ash">
          Every use case ends the same way —{" "}
          {USE_CASES.map((u) => u.agent).filter(
            (v, i, a) => a.indexOf(v) === i
          ).length}{" "}
          distinct agents, one accountable outcome.
        </p>
      </section>
    </main>
  );
}