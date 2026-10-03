import { SectionHead } from "@/components/ui/SectionHead";
import { FeatureEntry } from "@/components/features/FeatureEntry";
import { FeatureVisual } from "@/components/features/FeatureVisual";
import { Plate } from "@/components/features/Plate";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import AiBrainWorkspace from "@/components/generated/AiBrainWorkspace";
import NeuralNetwork from "@/components/generated/NeuralNetwork";
import { FEATURES } from "@/lib/site";

/**
 * Two working instruments rather than drawn diagrams: the cortex reads and
 * routes in real time, the layered net shows where a signal is still moving.
 * They sit above the capability plates because they are the same system seen
 * from inside, before it is broken into ten named capabilities.
 */
const INSTRUMENTS = [
  {
    caption: "Cortex workspace — live",
    read: "I",
    body: "Memory on the left, tools on the right, reasoning in the middle. A packet is in flight right now: you can watch it leave a stored fact, cross the core and land on an answer.",
    Visual: AiBrainWorkspace,
  },
  {
    caption: "Layered signal propagation",
    read: "II",
    body: "Signals enter at the bottom and climb. Nothing moves in one straight line — each layer re-reads the layer beneath it, which is why depth matters more than width.",
    Visual: NeuralNetwork,
  },
] as const;

/**
 * Capabilities. Formerly the /features route, now a chapter of the single page.
 *
 * Each capability gets its own plate; `variant` keeps repeats from repeating —
 * graph, stack and gate each appear twice, so the second instance of each gets
 * a different mechanism to draw.
 */
const ROWS = FEATURES.map((f, i) => ({
  ...f,
  variant: FEATURES.findIndex((g) => g.visual === f.visual) === i ? 0 : 1,
  read: String(i + 1).padStart(2, "0"),
  accent: (["ink", "cobalt", "signal", "acid", "blood"] as const)[i % 5],
}));

export function FeaturesSection() {
  return (
    <>
      <SectionHead
        id="features"
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

      <div className="u-shell pb-20 md:pb-28">
        <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
          {INSTRUMENTS.map((m) => (
            <Plate
              key={m.read}
              caption={m.caption}
              read={m.read}
              accent={m.read === "I" ? "cobalt" : "signal"}
              bodyClassName="p-6 md:p-8"
            >
              <div className="mb-7 overflow-hidden border border-ink/10 bg-ivory">
                <m.Visual />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-graphite">
                {m.body}
              </p>
            </Plate>
          ))}
        </div>
      </div>

      <div className="u-shell grid gap-x-8 gap-y-20 pb-24 md:pb-32 lg:grid-cols-2">
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
                <h3 className="u-display text-[clamp(1.6rem,3.2vw,2.6rem)]">
                  {f.title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite">
                  {f.body}
                </p>
              </div>
            </Plate>
          </FeatureEntry>
        ))}
      </div>

      <FeatureCTA />
    </>
  );
}