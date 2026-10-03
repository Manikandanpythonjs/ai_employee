import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArticleReveal,
  FlowDiagram,
  PullQuote,
  ReadingProgress,
} from "@/components/pages/ArticleBody";
import { getAdjacent, getArticle, ARTICLE_ORDER, ARTICLE_CONTENT } from "@/lib/articles";
import { ARTICLES } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLE_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Article" };
  return { title: a.title, description: a.dek };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const { prev, next } = getAdjacent(slug);
  const index = ARTICLE_ORDER.indexOf(slug);
  const related = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  // Interleave the pull quote through the body rather than always at the end.
  const pullAt = Math.floor(article.body.length / 2);

  return (
    <main>
      <ReadingProgress />

      {/* Masthead */}
      <header className="u-shell relative overflow-hidden border-b border-ink/12 pt-32 md:pt-40">
        <div aria-hidden className="u-grid-lines absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="u-mono mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-ash">
            <Link href="/blog" className="transition-colors hover:text-ink">
              Writing
            </Link>
            <span aria-hidden className="h-px w-10 bg-ink/25" />
            <span className="text-signal">{article.topic}</span>
            <span aria-hidden className="h-px w-10 bg-ink/25" />
            <span>{article.read} read</span>
          </div>

          <h1 className="u-display max-w-5xl text-[clamp(2.4rem,8vw,7rem)]">
            {article.title}
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-graphite md:text-xl">
            {article.lede}
          </p>

          <div className="mt-12 flex items-center gap-4 border-t border-ink/12 py-6">
            <span className="grid size-8 place-items-center rounded-full border border-ink">
              <span className="size-1.5 rounded-full bg-signal" />
            </span>
            <span className="u-mono text-ash">
              AI Employee · Essay {String(index + 1).padStart(2, "0")} of{" "}
              {ARTICLE_ORDER.length}
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="u-shell grid gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-20">
        <article className="min-w-0 max-w-2xl">
          <ArticleReveal>
            {article.body.map((block, i) => (
              <div key={i}>
                {block.t === "h" && (
                  <h2 className="u-display mb-6 mt-16 text-[clamp(1.5rem,3.4vw,2.4rem)] md:mt-20">
                    {block.v}
                  </h2>
                )}
                {block.t === "p" && <p className="mb-7">{block.v}</p>}
                {block.t === "list" && (
                  <ul className="mb-9 space-y-3 border-l-2 border-signal pl-6">
                    {block.v.map((li) => (
                      <li key={li} className="flex gap-3">
                        <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-ink/40" />
                        <span className="text-graphite">{li}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {block.t === "flow" && <FlowDiagram steps={block.v} />}
                {block.t === "quote" && block.v !== article.pull && (
                  <PullQuote>{block.v}</PullQuote>
                )}
                {i === pullAt && block.t !== "quote" && (
                  <PullQuote>{article.pull}</PullQuote>
                )}
              </div>
            ))}
          </ArticleReveal>

          {/* Next article */}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              data-cursor="VIEW"
              className="group mt-20 block border-t border-ink/12 pt-10"
            >
              <span className="u-mono text-ash">Next essay</span>
              <span className="u-display mt-3 block text-[clamp(1.6rem,4.4vw,3rem)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                {next.title}
              </span>
              <span className="mt-3 block max-w-md text-sm text-graphite">
                {next.dek}
              </span>
            </Link>
          )}
        </article>

        {/* Margin rail */}
        <aside className="order-first lg:order-last">
          <div className="lg:sticky lg:top-32">
            <p className="u-mono mb-5 text-ash">On this page</p>
            <ul className="space-y-2.5 border-l border-ink/12 pl-4">
              {article.body
                .filter((b): b is { t: "h"; v: string } => b.t === "h")
                .map((h) => (
                  <li key={h.v} className="u-mono text-[10px] leading-relaxed text-graphite">
                    {h.v}
                  </li>
                ))}
            </ul>

            {prev && (
              <Link
                href={`/blog/${prev.slug}`}
                className="u-mono mt-10 block border-t border-ink/12 pt-5 text-ash transition-colors hover:text-ink"
              >
                ← Previous
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* Related */}
      <section className="border-t border-ink/12 bg-paper-2 py-16 md:py-20">
        <div className="u-shell">
          <h2 className="u-display mb-10 text-2xl">Keep reading</h2>
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                data-cursor="VIEW"
                className="group block border-t border-ink/12 pt-5"
              >
                <span className="u-mono text-ash">{r.topic}</span>
                <span className="u-display mt-2 block text-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5">
                  {r.title}
                </span>
                <span className="mt-2 block text-sm text-graphite">{r.dek}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export const dynamicParams = false;
export { ARTICLE_CONTENT };