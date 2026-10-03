"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { pointer } from "@/lib/scroll-signal";

export type CursorState =
    | "NORMAL"
    | "HOVER"
    | "MAGNETIC"
    | "VIEW"
    | "DRAG"
    | "EXPLORE"
    | "PLAY"
    | "OPEN";

type CursorMeta = { label: string; hint?: string };

const LABELS: Partial<Record<CursorState, CursorMeta>> = {
    HOVER: { label: "" },
    VIEW: { label: "VIEW" },
    EXPLORE: { label: "EXPLORE" },
    PLAY: { label: "PLAY" },
    OPEN: { label: "OPEN" },
    DRAG: { label: "DRAG" },
    MAGNETIC: { label: "" },
};

/**
 * Context-aware custom cursor: a precision dot, a lagging magnetic ring,
 * a fading trail and an inline state label. Elements opt in through
 * `data-cursor="STATE"`; anything else falls back to NORMAL.
 */
export function Cursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const trailRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // Touch devices keep native behaviour.
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        const label = labelRef.current;
        const trail = trailRef.current;
        if (!dot || !ring || !label || !trail) return;
        const ctx = trail.getContext("2d");
        if (!ctx) return;

        let dpr = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            trail.width = window.innerWidth * dpr;
            trail.height = window.innerHeight * dpr;
            trail.style.width = `${window.innerWidth}px`;
            trail.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        // `label` is the active per-element override. It lives here rather than
        // in the module-level LABELS map so a route change can never permanently
        // rewrite shared state for the next mount. `moved` is read by the trail
        // to tell a fresh gesture from an idle frame.
        const state: { current: CursorState; label: string; moved: boolean } = {
            current: "NORMAL",
            label: "",
            moved: false,
        };

        // Hidden until first move so the cursor never flashes at 0,0.
        gsap.set([dot, ring, trail], { autoAlpha: 0 });
        gsap.set(dot, { xPercent: -50, yPercent: -50 });
        gsap.set(ring, { xPercent: -50, yPercent: -50, scale: 1 });

        const qx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
        const qy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
        const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3" });
        const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3" });

        const setState = (next: CursorState, customLabel?: string) => {
            if (next === state.current && (customLabel ?? state.label) === state.label)
                return;
            state.current = next;
            state.label = customLabel ?? "";
            const meta = LABELS[next];
            const text = customLabel || meta?.label || "";
            const big = next !== "NORMAL" && next !== "HOVER";

            gsap.to(ring, {
                scale: next === "NORMAL" ? 1 : big ? 2.5 : 1.75,
                borderColor:
                    next === "DRAG"
                        ? "rgba(216,30,49,0.9)"
                        : next === "PLAY"
                            ? "rgba(255,74,28,0.9)"
                            : "rgba(18,19,23,0.55)",
                backgroundColor:
                    next === "DRAG" || next === "PLAY" || next === "OPEN"
                        ? next === "DRAG"
                            ? "rgba(216,30,49,0.08)"
                            : "rgba(18,19,23,0.05)"
                        : "rgba(0,0,0,0)",
                duration: 0.4,
                ease: "expo.out",
            });

            gsap.to(dot, {
                scale: next === "NORMAL" ? 1 : 0.4,
                backgroundColor: next === "NORMAL" ? "#121317" : "#ff4a1c",
                duration: 0.3,
            });

            gsap.to(label, {
                autoAlpha: text ? 1 : 0,
                y: text ? 0 : 6,
                duration: 0.32,
                ease: "expo.out",
            });
            label.textContent = text;
        };

        const onMove = (e: PointerEvent) => {
            gsap.set([dot, ring, trail], { autoAlpha: 1 });
            state.moved = true;
            pointer.clientX = e.clientX;
            pointer.clientY = e.clientY;
            pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
            qx(e.clientX);
            qy(e.clientY);
            rx(e.clientX);
            ry(e.clientY);
        };

        const onOver = (e: PointerEvent) => {
            const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(
                "[data-cursor]"
            );
            if (el) {
                const s = (el.dataset.cursor || "HOVER").toUpperCase() as CursorState;
                setState(s, el.dataset.cursorLabel);
                return;
            }
            const interactive = (e.target as HTMLElement | null)?.closest<
                HTMLElement
            >("a,button,[role='button'],input,textarea,select,[tabindex]");
            setState(interactive ? "MAGNETIC" : "NORMAL", "");
        };

        const onDown = () => {
            gsap.to(ring, { scale: state.current === "NORMAL" ? 0.8 : 2, duration: 0.25 });
        };
        const onUp = () => {
            gsap.to(ring, {
                scale: state.current === "NORMAL" ? 1 : state.current === "HOVER" ? 1.75 : 2.5,
                duration: 0.3,
            });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerover", onOver, { passive: true });
        window.addEventListener("pointerdown", onDown);
        window.addEventListener("pointerup", onUp);
        // Named so cleanup can actually detach it. An inline arrow here leaked
        // one listener per mount, each retaining detached DOM nodes and firing
        // gsap.set against them on every window blur.
        const onBlur = () => gsap.set([dot, ring, trail], { autoAlpha: 0 });
        window.addEventListener("blur", onBlur);

        /* Trail: a short comet tail that decays.
         *
         * Two costs were removed here. It ran on every frame of the entire
         * session, whether or not the pointer had moved since the last one, so
         * an idle page still cleared and repainted a full-viewport canvas 60
         * times a second. And the clear used `window.innerWidth/Height` while
         * the canvas is sized to the same thing times the DPR, so the clear
         * region was correct in CSS pixels only — the offscreen buffer was
         * being cleared to the wrong fraction of its own area.
         *
         * Now it redraws only while the trail is actually alive: on movement,
         * and for a short tail afterwards. Once it has faded, the ticker stops
         * and the page costs nothing. */
        let life = 0;
        let lastDraw = 0;

        const tick = (time: number) => {
            const moved = state.moved;
            // Consumed, not just read: the flag belongs to the pointer, and
            // leaving it latched would keep the trail alive forever.
            state.moved = false;
            if (moved) life = 1;
            else if (life <= 0) return;
            // Throttle to ~30fps: the tail is a soft blur, so 60 buys nothing.
            if (time - lastDraw < 33) return;
            lastDraw = time;

            life -= 0.06;

            ctx.clearRect(0, 0, trail.width, trail.height);
            const tx = gsap.getProperty(ring, "x") as number;
            const ty = gsap.getProperty(ring, "y") as number;
            ctx.globalCompositeOperation = "source-over";
            const grad = ctx.createRadialGradient(tx, ty, 0, tx, ty, 26);
            grad.addColorStop(0, `rgba(18,19,23,${0.16 * life})`);
            grad.addColorStop(1, "rgba(18,19,23,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(tx, ty, 26, 0, Math.PI * 2);
            ctx.fill();
        };
        gsap.ticker.add(tick);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerover", onOver);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("blur", onBlur);
            gsap.ticker.remove(tick);
        };
    }, []);

    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[150] hidden lg:block">
            <canvas ref={trailRef} className="absolute inset-0" />
            <div
                ref={ringRef}
                className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border border-ink/50"
            >
                <span
                    ref={labelRef}
                    className="u-mono translate-y-2 text-[9px] tracking-[0.2em] text-ink opacity-0"
                />
            </div>
            <div
                ref={dotRef}
                className="absolute left-0 top-0 size-1.5 rounded-full bg-ink"
            />
        </div>
    );
}
