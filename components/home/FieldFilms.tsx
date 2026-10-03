"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp } from "@/lib/scroll-signal";
import { useReducedMotion } from "@/lib/use-webgl";
import { useScrubVideo } from "@/lib/use-scrub-video";

/**
 * Scroll-scrubbed film chapters.
 *
 * Both remaining clips are seeked to match scroll progress rather than played,
 * so the footage only advances when the reader does — the discipline the rest
 * of the site holds to. `video_3` gets the full-screen treatment with a mask
 * reveal; `video_2` sits beside it as a contained plate.
 *
 * One detail decides whether any of this is visible at all: `readyState` is
 * read as well as listened for. Listening only for `loadedmetadata` loses the
 * race whenever the browser has already buffered the header before React
 * attaches the handler — the event never fires again, `ready` stays false, and
 * the element is pinned at `opacity-0` as a black rectangle. Reading
 * `readyState >= HAVE_METADATA` covers both orderings.
 */

type Film = {
  src: string;
  poster: string;
  meta: string;
  line: string;
};

const FILMS: Film[] = [
  {
    src: "/media/video/video_3.mp4",
    poster: "/media/images/ai_agent.png",
    meta: "EXECUTION",
    line: "FROM INTENT TO VERIFIED RESULT",
  },
  {
    src: "/media/video/video_2.mp4",
    poster: "/media/images/bot_orchestraion.png",
    meta: "ORCHESTRATION",
    line: "NINE SPECIALISTS, ONE OBJECTIVE",
  },
];

/**
 * Seeks one clip to the shared progress value, eased, and keeps it paused.
 *
 * The easing, the settle detection and the backwards-seek budget all live in
 * `useScrubVideo`, shared with the full-screen film. Two independent copies of
 * this loop is how the two sections ended up with different feel despite being
 * built from the same description.
 */
function useScrub(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  progressRef: React.RefObject<number>,
  reduced: boolean
) {
  return useScrubVideo(videoRef, progressRef, !reduced);
}

function Plate({
  film,
  progressRef,
}: {
  film: Film;
  progressRef: React.RefObject<number>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const ready = useScrub(videoRef, progressRef, reduced);

  return (
    <figure className="relative">
      <div className="relative aspect-video overflow-hidden border border-ink/15 bg-ink">
        <video
          ref={videoRef}
          src={film.src}
          poster={film.poster}
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          aria-hidden
          className={`size-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(0deg, rgba(18,19,23,0.88) 0%, rgba(18,19,23,0.2) 48%, transparent 74%)",
          }}
        />
        <figcaption className="absolute inset-x-0 bottom-0 p-5">
          <span className="u-mono block text-signal">{film.meta}</span>
          <span className="u-mono mt-2 block text-paper/60">{film.line}</span>
        </figcaption>
      </div>
    </figure>
  );
}

export function FieldFilms() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLVideoElement>(null);
  const plateWrapRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const plateProgressRef = useRef(0);
  const reduced = useReducedMotion();

  const heroReady = useScrub(heroRef, progressRef, reduced);
  // The plate owns its own video and readiness; the wrapper's visibility here is
  // driven straight from scroll progress instead.

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          // The masked film owns the first half of the pass, the plate the
          // second, so each clip is scrubbed across the stretch it is on screen.
          progressRef.current = clamp(p / 0.5);
          plateProgressRef.current = clamp((p - 0.5) / 0.5);

          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${p})`;
          }

          // The mask opens from a centred slit to the full frame over the first
          // third of the film's own stretch, then holds. It is an entrance, not
          // a mask that keeps re-closing.
          const m = clamp(progressRef.current / 0.34);
          if (maskRef.current) {
            const inset = (1 - m) * 50;
            maskRef.current.style.clipPath = `inset(${inset}% 0 ${inset}% 0 round 2px)`;
          }

          // The plate rises as the hero hands off to it.
          if (plateWrapRef.current) {
            plateWrapRef.current.style.opacity = String(clamp((p - 0.42) / 0.14));
            plateWrapRef.current.style.transform = `translateY(${(
              (1 - clamp((p - 0.42) / 0.14)) *40
            ).toFixed(1)}px)`;
          }
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      id="films"
      aria-label="The system running"
      className="relative h-[280vh] w-full bg-ink"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* The masked film */}
        <div
          ref={maskRef}
          className="absolute inset-0"
          style={{ clipPath: "inset(50% 0 50% 0 round 2px)" }}
        >
          <video
            ref={heroRef}
            src={FILMS[0].src}
            poster={FILMS[0].poster}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-hidden
            className={`size-full object-cover transition-opacity duration-700 ${
              heroReady ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Legibility scrim — a value ramp, so type stays readable over any frame
            the scrub lands on. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(18,19,23,0.9) 0%, rgba(18,19,23,0.5) 46%, rgba(18,19,23,0.12) 78%, rgba(18,19,23,0.4) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(242,238,231,0.5) 0 1px, transparent 1px 3px)",
          }}
        />

        <div className="u-shell pointer-events-none relative z-10 flex h-full flex-col justify-between py-24 md:py-28">
          <div className="flex items-start justify-between gap-6">
            <span className="u-mono text-paper/60">
              <span className="text-signal">▸</span> Chapter 09 / Film
            </span>
            <span className="u-mono text-paper/50">SCRUBBED · NOT PLAYED</span>
          </div>

          <div className="max-w-2xl">
            <h2 className="u-display text-[clamp(2.4rem,7vw,6.4rem)]">
              Watch it
              <br />
              <span className="u-serif text-signal">actually run.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/60">
              Both films are tied to your scroll — not to a timer. They advance
              only when you move, and hold still when you stop.
            </p>
          </div>

          <div>
            <div className="h-px w-full bg-paper/15">
              <div
                ref={barRef}
                className="h-px w-full origin-left scale-x-0 bg-signal"
              />
            </div>
            <p className="u-mono mt-4 text-paper/45">
              EXECUTION · INTENT TO VERIFIED RESULT
            </p>
          </div>
        </div>

        {/* The second film, held back until the masked one has handed off. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-10 md:px-10 md:pb-14">
          <div
            ref={plateWrapRef}
            className="mx-auto w-full max-w-3xl opacity-0"
            style={{ transform: "translateY(40px)" }}
          >
            <Plate film={FILMS[1]} progressRef={plateProgressRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
