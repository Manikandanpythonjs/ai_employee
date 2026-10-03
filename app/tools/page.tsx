import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ToolConstellation } from "@/components/pages/ToolConstellation";
import { Marquee } from "@/components/ui/Marquee";
import { TOOLS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "The AI employee ecosystem — communication, productivity, development, data, research, files, business, browser and automation integrations.",
};

export default function ToolsPage() {
  return (
    <main>
      <PageHero
        kicker="Ecosystem"
        title={["What it", "can reach"]}
        accent="can reach"
        accentAfter={1}
        body="An employee is only as useful as what it can reach. Hover any tool to watch the connection form — every one is scoped, logged and reversible."
        meta={[
          { label: "Integrations", value: String(TOOLS.length) },
          { label: "Categories", value: "9" },
          { label: "Auth", value: "Scoped" },
          { label: "Reversible", value: "Always" },
        ]}
      />

      <ToolConstellation />

      <Marquee
        items={[
          "Gmail",
          "Slack",
          "GitHub",
          "Notion",
          "Postgres",
          "Chrome",
          "Drive",
          "Zapier",
          "Snowflake",
          "Calendar",
        ]}
        size="clamp(1.4rem,3.2vw,2.8rem)"
        speed={50}
        sep="·"
        className="border-y border-ink/12 bg-paper-2 py-8"
      />

      <section className="u-shell py-24 md:py-32">
        <header className="mb-14 max-w-3xl">
          <p className="u-mono mb-6 text-ash">
            <span className="text-signal">▸</span> The chain
          </p>
          <h2 className="u-display text-[clamp(2.2rem,6vw,5rem)]">
            Employee <span className="u-serif text-signal">to</span> network,
            <br />
            network to action, action to result.
          </h2>
        </header>

        <ol className="border-t border-ink/12">
          {[
            ["AI Employee", "Decides what needs doing and who should do it."],
            ["Tool network", "Resolves each action to a real, scoped capability."],
            ["Data flows", "Reads live state instead of working from a stale copy."],
            ["Actions", "Executes in the system of record, not in a chat window."],
            ["Results", "Comes back verified, with evidence attached."],
          ].map(([t, b], i) => (
            <li
              key={t}
              className="group grid gap-2 border-b border-ink/12 py-6 transition-colors hover:bg-ivory md:grid-cols-[3rem_14rem_1fr] md:items-baseline md:gap-8"
            >
              <span className="u-mono text-signal">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="u-display text-xl md:text-2xl">{t}</span>
              <span className="text-sm leading-relaxed text-graphite">{b}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}