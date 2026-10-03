import { SectionHead } from "@/components/ui/SectionHead";
import { ContactForm } from "@/components/pages/ContactForm";
import { Magnetic } from "@/components/ui/Magnetic";

/**
 * Contact. Formerly the /contact route, now the closing chapter of the single
 * page — every "Build yours" link in the nav and CTAs lands here.
 */
export function ContactSection() {
  return (
    <>
      <SectionHead
        id="contact"
        kicker="Contact"
        title={["Let\u2019s build", "the workforce"]}
        accent="the workforce"
        accentAfter={1}
        body="Tell us what should the first employee own. The best conversations start with a specific, unglamorous task someone currently does badly."
        meta={[
          { label: "Response", value: "1 day" },
          { label: "Call", value: "30 min" },
          { label: "Trial", value: "Scoped" },
          { label: "Commitment", value: "None" },
        ]}
      />

      <section className="u-shell grid gap-14 pb-28 pt-4 md:pb-36 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        {/* What happens next */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <h3 className="u-display text-[clamp(1.6rem,3.4vw,2.6rem)]">
            What happens next
          </h3>
          <ol className="mt-8 border-t border-ink/12">
            {[
              ["Read", "A person reads your message. Not a queue, not a sequence."],
              [
                "Scoping call",
                "30 minutes on the specific task, not the platform.",
              ],
              [
                "Scoped trial",
                "One workflow, one owner, a definition of done.",
              ],
            ].map(([t, b], i) => (
              <li key={t} className="border-b border-ink/12 py-5">
                <div className="flex items-baseline gap-4">
                  <span className="u-mono text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="u-display text-lg">{t}</span>
                </div>
                <p className="mt-2 pl-8 text-sm leading-relaxed text-graphite">
                  {b}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 border border-ink/12 bg-ivory p-6">
            <p className="u-mono mb-4 text-ash">Direct</p>
            <Magnetic strength={0.2}>
              <a
                href="mailto:hello@aiemployee.ai"
                data-cursor="MAGNETIC"
                className="u-mono inline-flex items-center gap-2 border-b border-ink pb-1 transition-colors hover:border-signal"
              >
                hello@aiemployee.ai
              </a>
            </Magnetic>
            <p className="mt-5 text-xs leading-relaxed text-ash">
              This page is a demonstration. Nothing you type is transmitted,
              stored, or sent to any server.
            </p>
          </div>
        </aside>

        {/* Form */}
        <div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}