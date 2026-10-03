"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Magnetic } from "@/components/ui/Magnetic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

type Fields = { name: string; email: string; company: string; message: string };

const EMPTY: Fields = { name: "", email: "", company: "", message: "" };

/**
 * Contact. Fields are magnetic and the label lifts out of the field on focus.
 * On submit the message becomes a packet that travels a visible route to the
 * employee node, then resolves to TRANSMITTED — entirely in the browser, no
 * network request anywhere.
 */
export function ContactForm() {
  const [v, setV] = useState<Fields>(EMPTY);
  const [focus, setFocus] = useState<keyof Fields | null>(null);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const packetRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);

  const set = (k: keyof Fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setV((s) => ({ ...s, [k]: e.target.value }));

  const valid =
    v.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) &&
    v.message.trim().length > 4;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || phase !== "idle") return;
    setPhase("sending");

    const packet = packetRef.current;
    const route = routeRef.current;
    if (!packet || !route) {
      setPhase("sent");
      return;
    }

    const len = route.getTotalLength();
    gsap.set(packet, { autoAlpha: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        setPhase("sent");
        gsap.set(packet, { autoAlpha: 0 });
      },
    });

    tl.to(packet, {
      motionPath: { path: route, align: route, alignOrigin: [0.5, 0.5] },
      duration: 1.7,
      ease: "power2.inOut",
    })
      .to(packet, { scale: 0.2, duration: 0.35, ease: "power2.in" }, "-=0.2")
      .to("[data-node]", { scale: 1.25, duration: 0.18, yoyo: true, repeat: 1 }, "-=0.3");

    void len;
  };

  useEffect(() => {
    if (phase !== "sent") return;
    gsap.fromTo(
      "[data-sent]",
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }
    );
  }, [phase]);

  if (phase === "sent") {
    return (
      <div className="relative flex min-h-[24rem] flex-col justify-center border border-ink/12 bg-ivory px-8 py-14">
        <div data-sent>
          <span className="u-mono inline-flex items-center gap-2 text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Delivered
          </span>
          <p className="u-display mt-6 text-[clamp(2.4rem,7vw,5rem)]">
            Transmitted.
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-graphite">
            Thanks {v.name.split(" ")[0]}. In a working system this message
            would already be decomposing into a plan — probably before you
            finished reading this sentence.
          </p>
          <div className="mt-10 flex flex-wrap gap-2">
            {[
              ["Intent", "1 request"],
              ["Plan", "3 steps"],
              ["Owner", "You"],
            ].map(([k, val]) => (
              <span
                key={k}
                className="u-mono border border-ink/20 px-3 py-1.5 text-graphite"
              >
                <span className="text-signal">{k}</span> · {val}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setV(EMPTY);
              setPhase("idle");
            }}
            className="u-mono mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 transition-colors hover:border-signal"
          >
            Send another <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative" noValidate>
      {/* Route the packet travels */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="route-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4a1c" />
            <stop offset="100%" stopColor="#2447e8" />
          </linearGradient>
        </defs>
        <path
          ref={routeRef}
          d="M40 88 C 160 96, 300 40, 420 34"
          fill="none"
          stroke="url(#route-grad)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      </svg>

      {/* The packet + destination node */}
      <div
        ref={packetRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[8%] z-10 size-2.5 -translate-x-1/2 rounded-full bg-signal opacity-0"
      />
      <div
        data-node
        aria-hidden
        className="pointer-events-none absolute right-6 top-[6%] grid size-10 place-items-center"
      >
        <span className="absolute inset-0 rotate-45 border border-ink/25" />
        <span className="size-1.5 rounded-full bg-signal" />
      </div>

      <div className="relative space-y-10">
        {(
          [
            { k: "name" as const, label: "Name", type: "text", ph: "Who are we building for?" },
            { k: "email" as const, label: "Email", type: "email", ph: "Where should we reply?" },
            { k: "company" as const, label: "Company", type: "text", ph: "Optional" },
          ] as const
        ).map((f) => (
          <Field
            key={f.k}
            label={f.label}
            type={f.type}
            placeholder={f.ph}
            value={v[f.k]}
            onChange={set(f.k)}
            onFocus={() => setFocus(f.k)}
            onBlur={() => setFocus((cur) => (cur === f.k ? null : cur))}
            active={focus === f.k}
          />
        ))}

        <Field
          label="Message"
          placeholder="What should the first employee own?"
          value={v.message}
          onChange={set("message")}
          onFocus={() => setFocus("message")}
          onBlur={() => setFocus((cur) => (cur === "message" ? null : cur))}
          active={focus === "message"}
          textarea
        />

        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-ink/12 pt-8">
          <span className="u-mono max-w-xs text-ash">
            {phase === "sending"
              ? "Transmitting…"
              : "Nothing is sent. This is a UI demonstration."}
          </span>
          <Magnetic strength={0.25}>
            <button
              type="submit"
              data-cursor="MAGNETIC"
              disabled={!valid || phase !== "idle"}
              className="group flex items-center gap-4 border border-ink bg-ink px-8 py-4 text-paper transition-colors hover:bg-transparent hover:text-ink disabled:cursor-not-allowed disabled:border-ink/20 disabled:bg-transparent disabled:text-ash"
            >
              <span className="u-mono">Send</span>
              <span
                aria-hidden
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  active,
  textarea = false,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  active: boolean;
  textarea?: boolean;
}) {
  const id = `f-${label.toLowerCase()}`;
  const shared =
    "peer w-full bg-transparent pt-6 text-lg text-ink outline-none placeholder:text-ash/60";

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`u-mono pointer-events-none absolute left-0 origin-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          active || value
            ? "top-0 text-ash"
            : "top-6 text-ink/70"
        }`}
      >
        {label}
      </label>

      {textarea ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={shared}
        />
      )}

      {/* The rule doubles as the focus indicator. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          active ? "scale-x-100 bg-signal" : "scale-x-100 bg-ink/15"
        }`}
      />
    </div>
  );
}