"use client";

import { useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Realistic AI Agent Book — stacked leaves, readable on both faces   */
/* ------------------------------------------------------------------ */

const CHAPTERS = [
  {
    title: "AI Agent Orchestration",
    chapter: "Chapter 01",
    color: "#4f46e5",
    accent: "#818cf8",
    body: [
      "An AI orchestration system coordinates many specialized agents to solve problems no single agent could handle alone. The orchestrator is the conductor: it reads intent, breaks it into tasks, and decides who does what.",
      "Each agent works inside its own domain — research, coding, data, or communication — while the orchestrator manages dependencies, retries failures, and merges partial results into one coherent answer.",
      "The pattern mirrors how human teams delegate. Goals are decomposed, assigned to specialists, and assembled at the end. The difference is speed and the absence of handoff loss.",
    ],
    summary: "The orchestrator routes work across specialist agents and synthesizes their outputs into a single result.",
  },
  {
    title: "Research Agent",
    chapter: "Chapter 02",
    color: "#0284c7",
    accent: "#38bdf8",
    body: [
      "The Research Agent monitors and synthesizes information from papers, news feeds, databases, and live APIs. It does not merely retrieve documents — it reads them.",
      "It weighs source credibility, surfaces conflicting claims, extracts quantitative evidence, and returns a ranked briefing where every statement carries a confidence score.",
      "When the orchestrator asks for background on a topic, it receives a structured summary with citations rather than a pile of links.",
    ],
    summary: "Reads across sources, ranks credibility, and returns cited briefings with confidence scores.",
  },
  {
    title: "Coding Agent",
    chapter: "Chapter 03",
    color: "#059669",
    accent: "#34d399",
    body: [
      "The Coding Agent writes, tests, and refines software across languages and frameworks. It reads the surrounding codebase first, so what it produces fits the existing architecture instead of fighting it.",
      "Beyond generation it runs static analysis, writes unit tests, flags security problems, and proposes performance fixes — closer to a careful senior reviewer than an autocomplete.",
      "It works inside the constraints the orchestrator sets: file scope, style rules, dependency budgets, and required test coverage.",
    ],
    summary: "Implements and reviews code within defined scope, style, and coverage constraints.",
  },
  {
    title: "Browser Agent",
    chapter: "Chapter 04",
    color: "#d97706",
    accent: "#fbbf24",
    body: [
      "The Browser Agent drives real web interfaces the way a person would: clicking controls, filling forms, waiting for dynamic content, and completing sign-in flows.",
      "It identifies elements by semantic role rather than brittle selectors, so it keeps working when markup changes.",
      "Typical work includes automated testing, price and inventory monitoring, and multi-step workflows spread across several SaaS tools.",
    ],
    summary: "Operates real web interfaces reliably, adapting to layout changes as they happen.",
  },
  {
    title: "Data Agent",
    chapter: "Chapter 05",
    color: "#db2777",
    accent: "#f472b6",
    body: [
      "The Data Agent turns raw information into structured, queryable datasets. It builds pipelines, writes SQL and NoSQL queries, and produces charts that surface the pattern that matters.",
      "It handles schema drift, type coercion, deduplication, and incremental refreshes without manual repair.",
      "When the orchestrator needs evidence for a decision, it gets context — trends, anomalies, and significance — not just a number.",
    ],
    summary: "Builds pipelines and returns evidence with context, not just raw figures.",
  },
  {
    title: "Planning Agent",
    chapter: "Chapter 06",
    color: "#7c3aed",
    accent: "#a78bfa",
    body: [
      "The Planning Agent decomposes ambiguous goals into ordered task sequences, complete with dependency graphs and resource estimates.",
      "It finds the critical path, marks blocking dependencies, and rebalances when constraints shift or new information arrives.",
      "Every task it emits has a definition of done, an assigned role, and acceptance criteria — the orchestrator only has to execute the plan.",
    ],
    summary: "Turns vague goals into ordered, dependency-aware task plans with clear acceptance criteria.",
  },
];

export default function AiAgentBook({ className = "" }: { className?: string }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

  const total = CHAPTERS.length;
  const busy = flippingIndex !== null;

  const goNext = useCallback(() => {
    if (busy || currentPage >= total) return;
    setFlippingIndex(currentPage);
    setCurrentPage((p) => p + 1);
    window.setTimeout(() => setFlippingIndex(null), 850);
  }, [busy, currentPage, total]);

  const goPrev = useCallback(() => {
    if (busy || currentPage <= 0) return;
    setFlippingIndex(currentPage - 1);
    setCurrentPage((p) => p - 1);
    window.setTimeout(() => setFlippingIndex(null), 850);
  }, [busy, currentPage]);

  const jumpTo = useCallback(
    (target: number) => {
      if (busy || target === currentPage) return;
      const leaf = target > currentPage ? currentPage : target;
      setFlippingIndex(leaf);
      setCurrentPage(target);
      window.setTimeout(() => setFlippingIndex(null), 850);
    },
    [busy, currentPage],
  );

  const leftChapter = currentPage > 0 ? CHAPTERS[currentPage - 1] : null;
  const rightChapter = currentPage < total ? CHAPTERS[currentPage] : null;
  const activeColor = (rightChapter ?? leftChapter ?? CHAPTERS[0]).color;

  return (
    <div className={`ai-book relative w-full ${className}`}>
      <style>{`
        .ai-book {
          container-type: inline-size;
          --leaf-dur: 0.85s;
        }

        .book-stage {
          position: relative;
          width: 100%;
          max-width: 700px;
          aspect-ratio: 700 / 495;
          margin: 0 auto;
          perspective: 2600px;
          perspective-origin: 50% 45%;
        }

        .book {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
        }

        /* ---- paper base under the leaves ---- */
        .spread {
          position: absolute;
          inset: 0;
          display: flex;
          border-radius: 4px 12px 12px 4px;
          overflow: hidden;
          background: #f7f5f0;
          box-shadow:
            0 26px 60px -12px rgba(15,23,42,0.28),
            0 8px 20px -8px rgba(15,23,42,0.16);
        }

        .spread-half {
          width: 50%;
          position: relative;
          background:
            radial-gradient(120% 100% at 0% 50%, rgba(15,23,42,0.05), transparent 60%),
            #fdfcfa;
        }
        .spread-half.right {
          background:
            radial-gradient(120% 100% at 100% 50%, rgba(15,23,42,0.05), transparent 60%),
            #fdfcfa;
        }

        /* stacked page edges */
        .edges {
          position: absolute;
          top: 8px;
          bottom: 8px;
          width: 16px;
          pointer-events: none;
          z-index: 1;
        }
        .edges.left { left: 0; }
        .edges.right { right: 0; }
        .edge-line {
          position: absolute;
          height: 1px;
          background: rgba(15,23,42,0.16);
        }

        /* ---- cover (only visible while closed) ---- */
        .cover {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 50%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 8cqw;
          background: linear-gradient(150deg, #1e293b 0%, #0b1220 100%);
          border-radius: 4px 0 0 4px;
          transition: opacity 0.5s ease;
        }
        .cover.hidden { opacity: 0; pointer-events: none; }

        .cover::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 14px;
          background: linear-gradient(to right, rgba(0,0,0,0.5), rgba(255,255,255,0.06), transparent);
        }
        .cover::after {
          content: "";
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255,255,255,0.12);
        }

        .cover-mark {
          width: 2.2cqw;
          height: 2.2cqw;
          border-radius: 50%;
          margin-bottom: 3cqw;
        }
        .cover-title {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 4.4cqw;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: 0.01em;
          color: #f8fafc;
        }
        .cover-rule {
          width: 7cqw;
          height: 2px;
          margin: 3cqw 0;
          border-radius: 1px;
        }
        .cover-sub {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 1.35cqw;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(248,250,252,0.45);
        }

        /* ---- leaves ---- */
        .leaf {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          transform-origin: left center;
          transform-style: preserve-3d;
          transition: transform var(--leaf-dur) cubic-bezier(0.36, 0.06, 0.24, 1);
          will-change: transform;
        }
        .leaf.flipped {
          transform: rotateY(-180deg);
        }
        .leaf.flipping {
          z-index: 900 !important;
        }

        .face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
          background: #fdfcfa;
        }

        .face.front {
          border-radius: 0 10px 10px 0;
          box-shadow:
            inset 14px 0 22px -14px rgba(15,23,42,0.22),
            1px 0 0 rgba(15,23,42,0.06);
        }
        .face.back {
          transform: rotateY(180deg);
          border-radius: 10px 0 0 10px;
          box-shadow:
            inset -14px 0 22px -14px rgba(15,23,42,0.22),
            -1px 0 0 rgba(15,23,42,0.06);
        }

        /* ---- page content ---- */
        .page {
          position: relative;
          height: 100%;
          padding: 5.4cqw 4.6cqw 4.2cqw;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .page.back-page {
          padding-left: 5.6cqw;
          padding-right: 4.4cqw;
        }

        .run-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 1.05cqw;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #94a3b8;
          padding-bottom: 2.4cqw;
          margin-bottom: 3cqw;
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }

        .page-title {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 2.85cqw;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: #0f172a;
          margin-bottom: 1.6cqw;
        }

        .page-rule {
          width: 5cqw;
          height: 2px;
          border-radius: 1px;
          margin-bottom: 3cqw;
        }

        .page-body {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .para {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 1.62cqw;
          line-height: 1.68;
          color: #334155;
          margin: 0 0 1.8cqw;
          text-align: justify;
          hyphens: auto;
        }
        .para:last-child { margin-bottom: 0; }

        .pull {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 2cqw;
          line-height: 1.55;
          font-style: italic;
          color: #475569;
          margin: 0 0 3.4cqw;
          padding-left: 3cqw;
          border-left: 2px solid rgba(15,23,42,0.12);
        }

        .note-label {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 1.05cqw;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 1.8cqw;
        }

        .page-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2.6cqw;
          padding-top: 2cqw;
          border-top: 1px solid rgba(15,23,42,0.08);
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 1.05cqw;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #cbd5e1;
        }

        /* end panel */
        .end-panel {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.6cqw;
          z-index: 2;
          background: #fdfcfa;
        }
        .end-title {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 2.4cqw;
          font-weight: 700;
          color: #0f172a;
        }
        .end-sub {
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 1.1cqw;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        /* spine crease */
        .spine {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 40px;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 800;
          background: linear-gradient(
            to right,
            transparent,
            rgba(15,23,42,0.07) 42%,
            rgba(15,23,42,0.13) 50%,
            rgba(15,23,42,0.07) 58%,
            transparent
          );
        }

        /* click zones */
        .zone {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 22%;
          z-index: 950;
          cursor: pointer;
          border: 0;
          background: transparent;
          padding: 0;
        }
        .zone.left { left: 0; }
        .zone.right { right: 0; }
        .zone:disabled { cursor: default; }
        .zone:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: -4px;
          border-radius: 6px;
        }

        /* controls */
        .controls {
          max-width: 700px;
          margin: 22px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .nav-btn {
          all: unset;
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 17px;
          line-height: 1;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .nav-btn:hover:not(:disabled) {
          color: #0f172a;
          border-color: #cbd5e1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15,23,42,0.08);
        }
        .nav-btn:disabled { opacity: 0.32; cursor: not-allowed; }

        .dots { display: flex; align-items: center; gap: 6px; }
        .dot {
          all: unset;
          cursor: pointer;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #e2e8f0;
          transition: width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.35s ease;
        }
        .dot.active { width: 24px; }
        .dot:hover:not(.active) { background: #94a3b8; }

        .meta {
          max-width: 700px;
          margin: 14px auto 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--font-geist-sans), Inter, system-ui, sans-serif;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        @media (prefers-reduced-motion: reduce) {
          .leaf { transition-duration: 0.01s; }
        }
      `}</style>

      <div className="book-stage">
        <div className="book">
          {/* paper base */}
          <div className="spread">
            <div className="spread-half left" />
            <div className="spread-half right" />
          </div>

          {/* page edge stacks */}
          <div className="edges left">
            {Array.from({ length: Math.min(currentPage, 10) }, (_, i) => (
              <div
                key={i}
                className="edge-line"
                style={{ top: `${i * 4}px`, left: `${i * 0.7}px`, width: `${16 - i * 0.7}px`, opacity: 1 - i * 0.07 }}
              />
            ))}
          </div>
          <div className="edges right">
            {Array.from({ length: Math.min(total - currentPage, 10) }, (_, i) => (
              <div
                key={i}
                className="edge-line"
                style={{ top: `${i * 4}px`, right: `${i * 0.7}px`, width: `${16 - i * 0.7}px`, opacity: 1 - i * 0.07 }}
              />
            ))}
          </div>

          {/* front cover — only while closed */}
          <div className={`cover ${currentPage > 0 ? "hidden" : ""}`}>
            <div className="cover-mark" style={{ background: activeColor }} />
            <div className="cover-title">AI<br />Agents</div>
            <div className="cover-rule" style={{ background: activeColor }} />
            <div className="cover-sub">Field Manual</div>
          </div>

          {/* end panel */}
          {currentPage >= total && (
            <div className="end-panel">
              <div className="end-title">End of Manual</div>
              <div className="end-sub">Six agents, one orchestrator</div>
            </div>
          )}

          {/* leaves */}
          {CHAPTERS.map((ch, i) => {
            const isFlipped = i < currentPage;
            const zIndex = isFlipped ? 100 + i : 400 - i;
            return (
              <div
                key={ch.chapter}
                className={`leaf ${isFlipped ? "flipped" : ""} ${flippingIndex === i ? "flipping" : ""}`}
                style={{ zIndex }}
              >
                {/* front = chapter content */}
                <div className="face front">
                  <div className="page">
                    <div className="run-head">
                      <span>{ch.chapter}</span>
                      <span>AI Field Manual</span>
                    </div>
                    <div className="page-title">{ch.title}</div>
                    <div className="page-rule" style={{ background: ch.accent }} />
                    <div className="page-body">
                      {ch.body.map((p, pi) => (
                        <p key={pi} className="para">{p}</p>
                      ))}
                    </div>
                    <div className="page-foot">
                      <span>Agent Reference</span>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                </div>

                {/* back = chapter summary */}
                <div className="face back">
                  <div className="page back-page">
                    <div className="run-head">
                      <span>Summary</span>
                      <span>{ch.chapter}</span>
                    </div>
                    <p className="pull">{ch.summary}</p>
                    <div className="note-label">Key capability</div>
                    <p className="para">
                      {ch.title} operates independently under the orchestrator&apos;s direction and returns a
                      structured result that other agents can consume without further interpretation.
                    </p>
                    <div className="page-body" />
                    <div className="page-foot">
                      <span>{ch.title}</span>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* spine crease */}
          <div className="spine" />

          {/* click zones */}
          <button
            type="button"
            className="zone left"
            aria-label="Previous page"
            onClick={goPrev}
            disabled={currentPage === 0 || busy}
          />
          <button
            type="button"
            className="zone right"
            aria-label="Next page"
            onClick={goNext}
            disabled={currentPage >= total || busy}
          />
        </div>
      </div>

      {/* controls */}
      <div className="controls">
        <button className="nav-btn" onClick={goPrev} disabled={currentPage === 0 || busy} aria-label="Previous chapter">
          ‹
        </button>
        <div className="dots">
          {CHAPTERS.map((ch, i) => (
            <button
              key={ch.chapter}
              type="button"
              aria-label={`Go to ${ch.chapter}`}
              className={`dot ${i === currentPage ? "active" : ""}`}
              style={i === currentPage ? { background: ch.color } : undefined}
              onClick={() => jumpTo(i)}
            />
          ))}
        </div>
        <button className="nav-btn" onClick={goNext} disabled={currentPage >= total || busy} aria-label="Next chapter">
          ›
        </button>
      </div>

      <div className="meta">
        <span>{leftChapter ? leftChapter.title : "Front cover"}</span>
        <span>{Math.min(currentPage + 1, total)} / {total}</span>
        <span>{rightChapter ? rightChapter.title : "Back cover"}</span>
      </div>
    </div>
  );
}
