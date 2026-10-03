import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { FeatureEntry } from "@/components/features/FeatureEntry";
import { FeatureVisual } from "@/components/features/FeatureVisual";
import { Plate } from "@/components/features/Plate";
import { OrchestrationPin } from "@/components/features/OrchestrationPin";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { FEATURES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "AI employees, agent orchestration, delegation, tool use, memory, verification, self-healing, human-in-the-loop, parallel execution and long-running work.",
};

/** Each capability gets its own plate; `variant` keeps repeats from repeating. */
const ROWS = FEATURES.map((f, i) => ({
  ...f,
  // graph/stack/gate each appear twice — the second gets a different mechanism.
  variant: FEATURES.findIndex((g) => g.visual === f.visual) === i ? 0 : 1,
  read: String(i + 1).padStart(2, "0"),
  accent: (
    ["ink", "cobalt", "signal", "acid", "blood"] as const
  )[i % 5],
}));

export default function FeaturesPage() {
  return (
    <main>
      <PageHero
        kicker="Capabilities"
        title={["Ten", "capabilities"]}
        accent="one system"
        accentAfter={1}
        body="An AI employee is not one capability. It is the coordination of all of them — which is why each one has to work before the whole thing works."
        meta={[
          { label: "Core", value: "Employees" },
          { label: "Architecture", value: "Multi-agent" },
          { label: "Reliability", value: "Verified" },
          { label: "Control", value: "Human" },
        ]}
      />

      {/* The one feature that earns a full-viewport stage. */}
      <OrchestrationPin />

      <div className="u-shell grid gap-x-8 gap-y-20 py-24 md:py-32 lg:grid-cols-2">
        {ROWS.map((f) => (
          <FeatureEntry key={f.id} className="h-full">
            <Plate
              caption={f.title}
              read={f.read}
              accent={f.accent}
              className="flex h-full flex-col"
              bodyClassName="flex flex-1 flex-col justify-between gap-10 p-6 md:p-8"
            >
              <div className="flex aspect-[16/11] items-center justify-center border border-ink/10 bg-paper">
                <FeatureVisual visual={f.visual} variant={f.variant} />
              </div>
              <div>
                <h2 className="u-display text-[clamp(1.6rem,3.2vw,2.6rem)]">
                  {f.title}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite">
                  {f.body}
                </p>
              </div>
            </Plate>
          </FeatureEntry>
        ))}
      </div>

      <FeatureCTA />
    </main>
  );
}