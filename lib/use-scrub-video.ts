"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Drives a video from a scroll-progress value instead of from a clock.
 *
 * The element is never played. Every frame it shows is the frame that
 * corresponds to the current scroll position, so stopping the scroll stops the
 * film — which is the whole point of a scrubbed sequence. A paused element
 * still paints the frame at its current time, so seeking alone is enough.
 *
 * Three things were making this feel slow rather than smooth, and all three are
 * handled here:
 *
 * **Easing rate.** Scroll arrives at whatever rate the wheel produces, which on
 * a trackpad is far coarser than the display. Writing `currentTime` straight
 * from it means several seeks inside one frame, then nothing for several frames
 * — a judder. Writing a low-pass of the target turns discrete wheel ticks into
 * continuous motion. The rate below is a deliberate middle: fast enough that
 * the film reads as *attached* to the scroll rather than trailing it, slow
 * enough to absorb trackpad coarseness. The old value of 7 meant the film was
 * still a third of the way behind after 150ms and only settled around 430ms,
 * which is what read as sluggish.
 *
 * **Redundant seeks.** Once the film has arrived, easing keeps recomputing the
 * same value and re-assigning `currentTime` sixty times a second. Each write is
 * a seek request the media pipeline has to answer, even when the time has not
 * changed. Settling is detected and the element is left completely alone until
 * the target actually moves.
 *
 * **Backwards seeks.** Rewinding is the expensive direction: the decoder must
 * discard its forward state and rebuild from the previous keyframe. The frame
 * budget is halved while travelling backwards so the pipeline is not asked for
 * more work per second than it can comfortably return.
 */

/** E-folds per second of error remaining after one second. */
const SMOOTHING = 16;

/**
 * Seconds of difference below which the film is considered arrived. At 24fps a
 * frame is 0.042s, so anything under half a frame cannot produce a visible
 * change and is not worth a seek.
 */
const SETTLED = 1 / 48;

/** Frame budget, halved when travelling backwards. */
const FWD_BUDGET = 1 / 30;
const BACK_BUDGET = FWD_BUDGET * 0.5;

export function useScrubVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  progressRef: RefObject<number>,
  enabled: boolean
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    /* Readiness, read as well as listened for.
     *
     * `preload="auto"` means the browser may already have buffered the header
     * before React hydrates and attaches these handlers. `loadedmetadata` then
     * fires exactly once, before anything is listening, and never fires again —
     * so `ready` stayed false and the element stayed pinned at `opacity-0` as a
     * black rectangle. Reading `readyState` covers both orderings.
     *
     * HAVE_CURRENT_DATA (2) rather than HAVE_METADATA (1): a seek needs only
     * metadata, but a black rectangle until the first frame decodes is not an
     * entrance. */
    if (video.readyState >= 2) setReady(true);

    const onReady = () => setReady(true);
    // A blocked or unsupported clip must still reveal its poster rather than
    // leaving an empty frame.
    const onErr = () => setReady(true);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onErr);

    if (!enabled) {
      return () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onErr);
      };
    }

    let raf = 0;
    let t = 0;
    let started = false;
    let settled = false;
    let onScreen = false;
    let last = performance.now();

    const seek = (time: number) => {
      try {
        video.currentTime = time;
      } catch {
        // Seeking throws while the media pipeline is still opening.
      }
    };

    const glide = () => {
      raf = requestAnimationFrame(glide);

      if (!onScreen) {
        last = performance.now();
        return;
      }

      const now = performance.now();
      // Clamped: a backgrounded tab returns with one enormous delta, which would
      // otherwise throw the easing far past the target in a single step.
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      const d = video.duration;
      if (!d || !Number.isFinite(d)) return;

      const goal = (progressRef.current ?? 0) * d;

      // First frame after entering: jump straight to the target. Easing in from
      // wherever the film was last left reads as a visible snap backwards.
      if (!started) {
        started = true;
        t = goal;
        seek(t);
        return;
      }

      const diff = goal - t;

      // Arrived. Leave the element alone until the scroll genuinely moves
      // again — an idle scrub must cost nothing.
      if (Math.abs(diff) < SETTLED) {
        t = goal;
        if (settled) return;
        settled = true;
        seek(goal);
        return;
      }

      if (settled) {
        settled = false;
        // Coming off idle, the eased value is stale by however long the film sat
        // still. Sync it so the first eased frame starts from the right place.
        t = goal;
        seek(t);
        return;
      }

      // Exponential approach, framerate-independent: the glide takes the same
      // wall-clock time at 60Hz and at 144Hz.
      t += diff * (1 - Math.exp(-SMOOTHING * delta));

      // Never seek past the target, or it would visibly overshoot and rebound.
      if ((diff > 0 && t > goal) || (diff < 0 && t < goal)) t = goal;

      // At most one seek per frame, and a tighter budget when rewinding.
      const budget = diff < 0 ? BACK_BUDGET : FWD_BUDGET;
      if (Math.abs(video.currentTime - t) >= budget) seek(t);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        if (!onScreen) {
          video.pause();
          // Re-entering jumps straight to the target rather than gliding up from
          // wherever the film was left.
          started = false;
          settled = false;
          last = performance.now();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(video);

    raf = requestAnimationFrame(glide);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      video.pause();
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onErr);
    };
  }, [videoRef, progressRef, enabled]);

  return ready;
}
