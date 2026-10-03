import { SectionHead } from "@/components/ui/SectionHead";
import { UseCaseStories } from "@/components/pages/UseCaseStories";
import { USE_CASES } from "@/lib/site";

/**
 * Use cases. Formerly the /use-cases route, now a chapter of the single page.
 */
export function UseCasesSection() {
  const owners = USE_CASES.map((u) => u.agent).filter(
    (v, i, a) => a.indexOf(v) === i
  ).length;

  return (
    <>
      <SectionHead
        id="use-cases"
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
        <h3 className="u-display text-[clamp(1.8rem,4.4vw,3.2rem)]">
          Six rooms, one shape.
        </h3>
      </section>

      <UseCaseStories />

      <section className="u-shell border-t border-ink/12 py-20 md:py-24">
        <p className="u-mono text-ash">
          Every use case ends the same way — {owners} distinct agents, one
          accountable outcome.
        </p>
      </section>
    </>
  );
}