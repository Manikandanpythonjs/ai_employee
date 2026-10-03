"use client";

import { useState } from "react";
import { SectionHead } from "@/components/ui/SectionHead";
import { FlowDiagram, PullQuote } from "@/components/pages/ArticleBody";
import { getArticle } from "@/lib/articles";
import { ARTICLES } from "@/lib/site";
import type { Block } from "@/lib/articles";

/** Articles that actually have a body written. */
const WITH_BODY = ARTICLES.map((a) => getArticle(a.slug)).filter(
  (a): a is NonNullable<typeof a> => Boolean(a)
);

function renderBlock(block: Block, key: number, pull: string, pullAt: number) {
  return (
    <div key={key}>
      {block.t === "h" && (
        <h4 className="u-display mb-5 mt-12 text-[clamp(1.3rem,2.8vw,2rem)]">
          {block.v}
        </h4>
      )}
      {block.t === "p" && (
        <p className="mb-6 text-[1.02rem] leading-[1.75] text-graphite md:text-[1.1rem]">
          {block.v}
        </p>
      )}
      {block.t === "list" && (
        <ul className="mb-8 space-y-3 border-l-2 border-signal pl-6">
          {block.v.map((li) => (
            <li key={li} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[0.7em] size-1 shrink-0 rounded-full bg-ink/40"
              />
              <span className="text-graphite">{li}</span>
            </li>
          ))}
        </ul>
      )}
      {block.t === "flow" && <FlowDiagram steps={block.v} />}
      {block.t === "quote" && block.v !== pull && <PullQuote>{block.v}</PullQuote>}
      {key === pullAt && block.t !== "quote" && <PullQuote>{pull}</PullQuote>}
    </div>
  );
}

/**
 * Writing. Formerly the /blog index plus nine separate article routes, now one
 * chapter of the single page.
 *
 * Only the open article renders its body. Nine full essays mounted at once would
 * mean nine mastheads, every pull quote and flow diagram running its own rAF
 * loop, and a page heavy enough to jank on scroll — so the accordion keeps one
 * body in the DOM at a time and the reader opts into what they want to read.
 */
export function WritingSection() {
  const [open, setOpen] = useState<string | null>(WITH_BODY[0]?.slug ?? null);

  return (
    <>
      <SectionHead
        id="writing"
        kicker="Writing"
        title={["Notes on", "digital work"]}
        accent="digital work"
        accentAfter={1}
        body="Essays on what changes when software stops answering and starts owing you results — written for people who have to decide whether to trust it."
        meta={[
          { label: "Essays", value: String(WITH_BODY.length) },
          { label: "Format", value: "Long-form" },
          { label: "Cadence", value: "Weekly" },
          { label: "Reading", value: "Expand" },
        ]}
      />

      <section className="u-shell pb-10">
        <h3 className="u-display text-[clamp(1.8rem,4.4vw,3.2rem)]">
          All writing, in one place.
        </h3>
      </section>

      <div className="u-shell pb-24 md:pb-32">
        {WITH_BODY.map((article, i) => {
          const isOpen = open === article.slug;
          const pullAt = Math.floor(article.body.length / 2);

          return (
            <article
              key={article.slug}
              id={`essay-${article.slug}`}
              className="scroll-mt-24 border-t border-ink/12"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : article.slug)}
                  aria-expanded={isOpen}
                  aria-controls={`essay-body-${article.slug}`}
                  data-cursor="VIEW"
                  className="group flex w-full items-start gap-5 py-7 text-left md:gap-8"
                >
                  <span className="u-mono mt-2 shrink-0 text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="u-mono mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-ash">
                      <span>{article.topic}</span>
                      <span aria-hidden className="h-px w-6 bg-ink/20" />
                      <span>{article.read} read</span>
                    </span>
                    <span className="u-display block text-[clamp(1.5rem,4vw,2.8rem)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                      {article.title}
                    </span>
                    <span
                      className={`mt-3 block max-w-2xl text-sm leading-relaxed text-graphite transition-opacity duration-300 ${
                        isOpen ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {article.dek}
                    </span>
                  </span>

                  <span
                    aria-hidden
                    className={`u-mono mt-2 shrink-0 text-2xl leading-none text-signal transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
              </h3>

              {isOpen && (
                <div
                  id={`essay-body-${article.slug}`}
                  className="pb-16 md:pb-20"
                >
                  <div className="border-l-2 border-ink/10 pl-6 md:pl-10">
                    <p className="mb-10 max-w-2xl text-lg leading-relaxed text-graphite md:text-xl">
                      {article.lede}
                    </p>
                    <div className="max-w-2xl">
                      {article.body.map((block, k) =>
                        renderBlock(block, k, article.pull, pullAt)
                      )}
                    </div>
                  </div>

                  <div className="u-mono mt-10 flex flex-wrap items-center gap-4 border-t border-ink/12 pt-6 text-ash">
                    <span>Essay {String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden className="h-px w-8 bg-ink/20" />
                    <button
                      type="button"
                      onClick={() => setOpen(null)}
                      className="transition-colors hover:text-ink"
                    >
                      Collapse
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {WITH_BODY.length < ARTICLES.length && (
        <p className="u-shell pb-20 text-ash">
          {ARTICLES.length - WITH_BODY.length} further{" "}
          {ARTICLES.length - WITH_BODY.length === 1 ? "essay is" : "essays are"}{" "}
          listed in the index but not yet written.
        </p>
      )}
    </>
  );
}