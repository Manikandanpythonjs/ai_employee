"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChapterLabel } from "@/components/ui/Layout";
import { useScrubVideo } from "@/lib/use-scrub-video";
import { useReducedMotion } from "@/lib/use-webgl";

const TIMELINE = [
  { at: 0, label: "Human gives intent", meta: "INTENT" },
  { at: 0.15, label: "AI understands the task", meta: "PERCEIVE" },
  { at: 0.3, label: "Planner decomposes it", meta: "PLAN" },
  { at: 0.45, label: "Specialists activate", meta: "DELEGATE" },
  { at: 0.6, label: "Agents reach their tools", meta: "EXECUTE" },
  { at: 0.75, label: "The work happens", meta: "ACT" },
  { at: 0.9, label: "Verifier checks results", meta: "VERIFY" },
  { at: 1, label: "Outcome delivered", meta: "DELIVER" },
];

/**
 * Scroll-scrubbed cinematic video. The video is seeked to match scroll
 * progress rather than played, so the film only advances when the reader
 * does. Paused while off-screen, buffered eagerly, and skipped entirely on
 * reduced-motion connections.
 *
 * The seeking itself lives in `useScrubVideo`, shared with the other two films
 * so all three feel identical.
 */
export function ScrubVideo({ src = "/media/video/video_1.mp4" }: { src?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const timeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // Written by the scroll trigger, read by the frame loop. A ref rather than
  // state: this changes on every scroll tick and must not re-render the tree.
  const targetRef = useRef(0);
  const reduced = useReducedMotion();

  const ready = useScrubVideo(videoRef, targetRef, !reduced);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    gsap.registerPlugin(ScrollTrigger);

    // One context owns both ScrollTriggers. Without it the scale tween's
    // trigger survives unmount and keeps writing transforms to a detached node.
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        // The film chases the scroll position from the frame loop rather than
        // being scrubbed directly. `scrub: true` here would apply GSAP's own
        // smoothing on top of it, so the two would compound and the film would
        // trail the reader noticeably further behind on every flick.
        scrub: true,
        onUpdate: (self) => {
          // Only the target is written here. The frame loop does the seeking,
          // so the film eases toward the scroll position instead of jumping to
          // it — a seek per wheel tick is what reads as stutter.
          targetRef.current = self.progress;

          const idx = Math.min(
            TIMELINE.length - 1,
            Math.floor(self.progress * TIMELINE.length)
          );
          setStep(idx);
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${self.progress})`;
          }
          if (timeRef.current) {
            const d = video.duration || 0;
            timeRef.current.textContent = `${(self.progress * d).toFixed(2)}s`;
          }
        },
      });

      // Keep the pinned frame perfectly still while scrubbing.
      if (wrapRef.current) {
        gsap.fromTo(
          wrapRef.current,
          { scale: 1.06 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const current = TIMELINE[step];

  return (
    <section
      id="reasoning"
      ref={rootRef}
      aria-label="How an AI employee works"
      className="relative h-[260vh] w-full bg-ink text-paper"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* The film */}
        <div ref={wrapRef} className="absolute inset-0 will-change-transform">
          {/* Poster sits behind the video rather than on it. A `poster`
              attribute paints inside the element, so it would be hidden by the
              same `opacity-0` that hides the undecoded video — leaving a black
              rectangle for exactly as long as the load takes. As a separate
              layer it covers the wait and the first frame cross-fades over it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/images/ai_employee.png"
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
          <video
            ref={videoRef}
            src={src}
            poster="/media/images/ai_employee.png"
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-hidden
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Legibility scrim — a value ramp, not a purple gradient */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(18,19,23,0.92) 0%, rgba(18,19,23,0.55) 42%, rgba(18,19,23,0.15) 70%, rgba(18,19,23,0.45) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(242,238,231,0.5) 0 1px, transparent 1px 3px)",
            }}
          />
        </div>

        {/* Overlay copy */}
        <div className="u-shell relative z-10 flex h-full flex-col justify-between py-24 md:py-28">
          <div className="flex items-start justify-between gap-6">
            <ChapterLabel n="02" className="text-paper/60">
              <span className="text-paper/60">Reasoning</span>
            </ChapterLabel>
            <span className="u-mono text-paper/50">
              <span ref={timeRef}>0.00s</span> / FILM
            </span>
          </div>

          <div className="max-w-2xl">
            <h2 className="u-display text-[clamp(2.4rem,7vw,6.5rem)]">
              One intent.
              <br />
              <span className="u-serif text-signal">Eight</span> phases.
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/60">
              Scroll drives the film. Nothing advances until you do — the same
              discipline the system itself uses when it refuses to act before it
              understands.
            </p>

            {/* Phase readout */}
            <div className="mt-10 flex items-center gap-4">
              <span className="u-display text-[3.5rem] leading-none text-signal tabular-nums">
                {String(step + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="u-mono text-paper/45">{current.meta}</p>
                <p className="mt-1 text-lg text-paper">{current.label}</p>
              </div>
            </div>
          </div>

          {/* Progress + phase rail */}
          <div>
            <div className="h-px w-full bg-paper/15">
              <div
                ref={barRef}
                className="h-px w-full origin-left scale-x-0 bg-signal"
              />
            </div>
            <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {TIMELINE.map((t, i) => (
                <li key={t.meta}>
                  <button
                    type="button"
                    data-cursor="MAGNETIC"
                    onClick={() => {
                      const root = rootRef.current;
                      const st = ScrollTrigger.getAll().find(
                        (s) => s.trigger === root
                      );
                      const total =
                        document.documentElement.scrollHeight -
                        window.innerHeight;
                      if (!st) return;
                      const y =
                        st.start + (st.end - st.start) * (i / TIMELINE.length);
                      window.scrollTo({ top: y, behavior: "smooth" });
                      void total;
                    }}
                    className={`u-mono transition-colors duration-300 ${
                      i === step ? "text-signal" : "text-paper/40 hover:text-paper/80"
                    }`}
                  >
                    {t.meta}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}