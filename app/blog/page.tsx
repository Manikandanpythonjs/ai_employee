import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Marquee } from "@/components/ui/Marquee";
import { ARTICLES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Essays on AI employees, agents, multi-agent systems, orchestration, delegation, tool use, memory, verification, self-healing and human-in-the-loop AI.",
};

export default function BlogPage() {
  const [featured, ...rest] = ARTICLES;
  const topics = Array.from(new Set(ARTICLES.map((a) => a.topic)));

  return (
    <main>
      <PageHero
        kicker="Writing"
        title={["Notes on", "digital work"]}
        accent="digital work"
        accentAfter={1}
        body="Essays on what changes when software stops answering and starts owing you results — written for people who have to decide whether to trust it."
        meta={[
          { label: "Articles", value: String(ARTICLES.length) },
          { label: "Topics", value: String(topics.length) },
          { label: "Format", value: "Long-form" },
          { label: "Cadence", value: "Weekly" },
        ]}
      />

      {/* Featured — asymmetric, editorial, not a card */}
      <section className="u-shell border-t border-ink/12 py-16 md:py-24">
        <Link
          href={`/blog/${featured.slug}`}
          data-cursor="VIEW"
          className="group grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-16"
        >
          <div>
            <span className="u-mono mb-6 inline-flex items-center gap-2 text-signal">
              <span className="size-1.5 rounded-full bg-signal" />
              Featured · {featured.topic}
            </span>
            <h2 className="u-display text-[clamp(2.2rem,7vw,6rem)]">
              What is
              <br />
              an AI employee?
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-graphite">
              {featured.dek}
            </p>
            <span className="u-mono mt-8 inline-flex items-center gap-3 border-b border-ink pb-1 transition-colors group-hover:border-signal">
              Read the essay
              <span
                aria-hidden
                className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>

          <figure className="relative aspect-[4/3] w-full overflow-hidden border border-ink/12 bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/images/ai_employee.png"
              alt=""
              className="absolute inset-0 size-full scale-105 object-cover opacity-80 transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, rgba(255,74,28,0.22), transparent 58%)",
                mixBlendMode: "screen",
              }}
            />
          </figure>
        </Link>
      </section>

      <Marquee
        items={["Delegation", "Verification", "Self-Healing", "Memory", "Orchestration"]}
        size="clamp(1.3rem,3vw,2.6rem)"
        speed={44}
        sep="/"
        className="border-y border-ink/12 bg-paper-2 py-7"
      />

      {/* Index — asymmetric editorial grid, deliberately uneven */}
      <section className="u-shell py-16 md:py-24">
        <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-ink/12 pb-6">
          <h2 className="u-display text-2xl">All writing</h2>
          <span className="u-mono text-ash">{rest.length + 1} articles</span>
        </div>

        <div className="grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-12">
          {rest.map((a, i) => (
            <article
              key={a.slug}
              className={`group lg:col-span-6 ${
                i % 3 === 1 ? "lg:col-start-7" : ""
              }`}
            >
              <Link href={`/blog/${a.slug}`} data-cursor="VIEW" className="block">
                <div className="flex items-center gap-4">
                  <span className="u-mono text-signal">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-ink/15" />
                  <span className="u-mono text-ash">{a.topic}</span>
                </div>
                <h3 className="u-display mt-5 text-[clamp(1.5rem,3.4vw,2.6rem)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  {a.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-graphite">
                  {a.dek}
                </p>
                <span className="u-mono mt-5 block text-ash">{a.read} read</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}