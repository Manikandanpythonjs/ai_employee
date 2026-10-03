"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Magnetic } from "@/components/ui/Magnetic";
import { EntityModel } from "@/components/three/EntityModel";

type Decision = "approve" | "modify" | "reject" | null;

/**
 * Human-in-the-loop — the pace deliberately breaks here. Everything runs at
 * speed, then the system stops at a decision and the interface goes quiet:
 * motion slows, colour drains, and the only thing moving is the cursor.
 */
export function HumanInLoop() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [decision, setDecision] = useState<Decision>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // The autonomous lane keeps moving until the decision point.
      ScrollTrigger.create({
        trigger: root,
        start: "top 70%",
        end: "45% 60%",
        onEnter: () => setPaused(false),
        onLeave: () => setPaused(true),
        onEnterBack: () => setPaused(false),
      });

      // Speed lines decelerate as the system brakes.
      gsap.to("[data-stream]", {
        scaleX: 0.06,
        opacity: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 60%",
          end: "45% 60%",
          scrub: 0.5,
        },
      });

      gsap.fromTo(
        stageRef.current,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.3,
          ease: "expo.out",
          immediateRender: false,
          scrollTrigger: { trigger: root, start: "top 55%", once: true },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      id="human"
      aria-label="Human in the loop"
      className="relative overflow-hidden bg-paper py-24 md:py-36"
    >
      <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />

      <div className="u-shell relative">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          {/* Autonomy, running */}
          <div>
            <p className="u-mono mb-6 text-ash">
              <span className="text-signal">▸</span> Chapter 08 / Human
            </p>
            <h2 className="u-display text-[clamp(2.4rem,6.4vw,5.4rem)]">
              Autonomy
              <br />
              where it&rsquo;s
              <br />
              <span className="u-serif text-signal">safe.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-graphite">
              Ninety-eight percent of the work needs no human at all. The
              remaining two percent is where judgement, liability and taste
              actually live — so that is exactly where the system stops and asks.
            </p>

            {/* Live stream */}
            <div className="mt-10 space-y-2">
              {[
                ["Scanned 4,120 records", 1],
                ["Extracted 318 fields", 1],
                ["Drafted outreach", 1],
                ["Sending 412 emails", 0],
              ].map(([label, done]) => (
                <div key={label as string} className="flex items-center gap-3">
                  <span
                    className={`grid size-4 shrink-0 place-items-center border transition-colors duration-500 ${
                      done ? "border-ink bg-ink" : "border-signal bg-signal/10"
                    }`}
                  >
                    {done ? (
                      <span className="size-1 bg-paper" />
                    ) : (
                      <span className="size-1.5 animate-ping bg-signal" />
                    )}
                  </span>
                  <span
                    className={`u-mono transition-colors duration-500 ${
                      done ? "text-graphite" : "text-ink"
                    }`}
                  >
                    {label as string}
                  </span>
                  <span className="u-mono ml-auto text-[9px] text-ash">
                    {done ? "DONE" : "HELD"}
                  </span>
                </div>
              ))}
            </div>

            {/* Braking streams */}
            <div aria-hidden className="mt-10 space-y-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <span
                      key={j}
                      data-stream
                      className="h-2 origin-left flex-1 bg-ink/8"
                      style={{ transitionDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* The decision */}
          <div ref={stageRef} className="relative">
            <div
              className={`relative border bg-ivory transition-all duration-1000 ${
                paused
                  ? "border-ink/25 shadow-[0_30px_80px_-50px_rgba(18,19,23,0.5)]"
                  : "border-ink/10"
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-6 py-4">
                <span className="u-mono inline-flex items-center gap-2 text-ink">
                  <span
                    className={`size-1.5 rounded-full transition-colors duration-700 ${
                      paused ? "bg-signal" : "bg-ash"
                    }`}
                  />
                  Decision required
                </span>
                <span className="u-mono text-ash">
                  {paused ? "Escalated 14:32:07" : "Waiting"}
                </span>
              </div>

              <div className="px-6 py-7">
                <p className="u-mono text-ash">Proposed action</p>
                <p className="mt-3 text-lg leading-snug text-ink">
                  Send 412 personalised emails to procurement contacts at 34
                  target accounts, from your primary domain.
                </p>

                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-ink/10 pt-5">
                  {[
                    ["412", "recipients"],
                    ["34", "accounts"],
                    ["$0", "spend"],
                  ].map(([n, l]) => (
                    <div key={l}>
                      <dt className="u-display text-2xl">{n}</dt>
                      <dd className="u-mono mt-1 text-ash">{l}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 border-l-2 border-signal pl-4">
                  <p className="u-mono text-signal">Why it paused</p>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    Outbound volume from your domain exceeds 3&times; the weekly
                    average, and the recipient list has not been reviewed by a
                    person. Everything before this step ran unattended.
                  </p>
                </div>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-3 gap-px border-t border-ink/10 bg-ink/10">
                {(
                  [
                    { id: "approve", label: "Approve", hint: "Send now" },
                    { id: "modify", label: "Modify", hint: "Adjust & review" },
                    { id: "reject", label: "Reject", hint: "Halt workflow" },
                  ] as const
                ).map((opt) => (
                  <Magnetic key={opt.id} strength={0.18} className="w-full">
                    <button
                      type="button"
                      data-cursor="MAGNETIC"
                      onClick={() => setDecision(opt.id)}
                      aria-pressed={decision === opt.id}
                      className={`flex w-full flex-col items-center gap-1 px-4 py-5 transition-colors duration-300 ${
                        decision === opt.id
                          ? opt.id === "approve"
                            ? "bg-acid"
                            : opt.id === "reject"
                              ? "bg-blood text-paper"
                              : "bg-cobalt text-paper"
                          : "bg-ivory hover:bg-paper-2"
                      }`}
                    >
                      <span className="u-mono">{opt.label}</span>
                      <span className="u-mono text-[9px] opacity-55">
                        {opt.hint}
                      </span>
                    </button>
                  </Magnetic>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div
              className={`overflow-hidden transition-all duration-700 ${
                decision ? "mt-6 max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex items-center justify-between gap-4 border border-ink/15 bg-ink px-5 py-4 text-paper">
                <span className="u-mono">
                  {decision === "approve" && "Approved · sending"}
                  {decision === "modify" && "Modified · queued for review"}
                  {decision === "reject" && "Rejected · workflow halted"}
                </span>
                <span className="u-mono text-acid">Recorded</span>
              </div>
            </div>

            <p className="u-mono mt-6 text-ash">
              Autonomy where possible. Human control where it matters.
            </p>
          </div>
        </div>

        {/* The one place the system stops and waits. The figure is the reason
            the boundary exists at all — it is a scanned human, so the section
            reads as an appeal to a person rather than to a policy.

            This was a small panel wedged under the two-column layout above, and
            at that size the figure was reduced to a pair of legs: the container
            was both short and narrow, so the fit had to shrink the subject to
            clear the vertical frustum. It is now a full-height stage on its own
            terms — `radius` below 1 is what leaves the frame breathing room, and
            it has to stay below 1 or the subject overflows by construction. */}
        <section
          aria-label="The accountable party"
          className="relative mt-16 border border-ink/12 bg-ivory md:mt-24"
        >
          <div className="grid items-stretch gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative h-[30rem] border-b border-ink/10 sm:h-[36rem] lg:h-[44rem] lg:border-b-0 lg:border-r">
              <EntityModel
                src="/media/models/human.glb"
                radius={0.82}
                spin={0.1}
                clip="idle"
              />
              <span
                aria-hidden
                className="u-mono pointer-events-none absolute bottom-4 left-4 text-ash"
              >
                ACCOUNTABLE PARTY · ON RECORD
              </span>
              <span
                aria-hidden
                className="u-mono pointer-events-none absolute bottom-4 right-4 text-ash"
              >
                IDLE · DRAG TO ORBIT
              </span>
            </div>

            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="u-mono mb-5 text-signal">▸ Chapter 08 / Sign-off</p>
              <h3 className="u-display text-[clamp(1.7rem,3.6vw,2.8rem)]">
                A person signs
                <br />
                <span className="u-serif text-signal">for every</span>
                <br />
                irreversible act.
              </h3>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-graphite">
                Delegation is written down before anything runs, not negotiated
                once an incident has already happened. The boundary is a list of
                action classes, and each one has a named human who is accountable
                for it.
              </p>
              <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6">
                {[
                  ["Send", "held for approval"],
                  ["Spend", "held for approval"],
                  ["Delete", "held, always"],
                  ["Read", "autonomous"],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-baseline gap-4">
                    <span className="u-mono w-20 shrink-0 text-signal">{k}</span>
                    <span className="text-sm text-graphite">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}