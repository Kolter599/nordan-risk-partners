import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { CvrCapture } from "./CvrCapture";
import { ProductJsonLd } from "./ProductJsonLd";
import { Reveal } from "./Reveal";
import {
  getRelated,
  type FeatureBlock,
  type Faq,
  type InsuranceProduct,
  type Stat,
} from "@/lib/insurance-products";

type Props = { product: InsuranceProduct };

export function InsurancePageTemplate({ product }: Props) {
  const related = getRelated(product.related);

  return (
    <>
      <ProductJsonLd product={product} />
      {/* HERO */}
      <section className="relative overflow-hidden text-white min-h-[72vh] sm:min-h-[64vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={product.heroImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center"
            sizes="100vw"
            quality={95}
          />
          <div className="absolute inset-0 bg-[color:var(--color-nordan-dark)] opacity-92" />
        </div>

        <div className="relative w-full mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-20 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-20 items-start">
            <div className="lg:col-span-7 min-w-0">
              <Breadcrumbs
                tone="dark"
                items={[
                  { label: "Forside", href: "/" },
                  { label: "Erhvervsforsikring", href: "/erhvervsforsikringer" },
                  { label: product.navLabel },
                ]}
              />
              <div className="text-[0.74rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)] mb-6">
                {product.eyebrow}
              </div>
              <h1
                lang="da"
                className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.6rem,6.5vw,3.25rem)] leading-[1.1] tracking-[-0.015em] hyphens-auto break-words"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {product.title}
              </h1>
              <p className="mt-6 sm:mt-8 max-w-xl text-base sm:text-lg md:text-xl text-white/90 leading-[1.55]">
                {product.intro}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <Link
                  href="/analyse"
                  className="inline-flex items-center justify-center h-12 px-6 sm:px-7 rounded-[6px] bg-[color:var(--color-nordan-accent)] text-white text-[0.88rem] font-semibold tracking-wide hover:bg-[#8f715f] transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                >
                  Få gratis analyse
                </Link>
                <a
                  href="tel:+4553520006"
                  className="inline-flex items-center justify-center h-12 px-6 sm:px-7 rounded-[6px] border border-white/50 text-white text-[0.88rem] font-semibold tracking-wide hover:bg-white/10 transition-colors"
                >
                  Ring +45 53 52 00 06
                </a>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 lg:col-span-5 lg:pt-4">
              <CvrCapture headline={product.cvrLabel} />
            </div>
          </div>
        </div>
      </section>

      {/* INTRO BAND — extra paragraphs */}
      {product.introParagraphs && product.introParagraphs.length > 0 ? (
        <section className="py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[780px] px-5 sm:px-6 md:px-10 prose-body">
            {product.introParagraphs.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* STATS STRIP */}
      {product.stats && product.stats.length > 0 ? (
        <StatsStrip stats={product.stats} />
      ) : null}

      {/* FEATURE BLOCKS — alternating image + text */}
      {product.features?.map((f, i) => (
        <FeatureSection key={i} feature={f} index={i} />
      ))}

      {/* PULL QUOTE */}
      {product.quote ? (
        <section className="py-20 md:py-24 bg-[color:var(--color-nordan-soft)]">
          <div className="mx-auto max-w-[900px] px-6 md:px-10 text-center">
            <svg
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="var(--color-nordan-accent)"
              className="mx-auto mb-6 opacity-60"
              aria-hidden
            >
              <path d="M9.5 6C6.5 6 4 8.5 4 11.5v6.5h6v-6H6.5a3 3 0 0 1 3-3V6zm10 0c-3 0-5.5 2.5-5.5 5.5v6.5h6v-6h-3.5a3 3 0 0 1 3-3V6z" />
            </svg>
            <blockquote className="font-[family-name:var(--font-playfair)] italic text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.35] text-[color:var(--color-nordan-ink)]">
              „{product.quote.text}”
            </blockquote>
            {product.quote.who ? (
              <figcaption className="mt-6 text-[0.85rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
                {product.quote.who}
                {product.quote.role ? ` · ${product.quote.role}` : null}
              </figcaption>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {product.faq && product.faq.length > 0 ? (
        <FaqSection items={product.faq} />
      ) : null}

      {/* RELATED */}
      {related.length > 0 ? (
        <section className="py-16 md:py-20 bg-[color:var(--color-nordan-soft)] border-y border-[color:var(--color-nordan-line)]">
          <div className="mx-auto max-w-[1200px] px-6 md:px-10">
            <div className="eyebrow mb-3">Relaterede forsikringer</div>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.5rem,2.2vw,1.9rem)] mb-10">
              Andre dækninger vi ofte ser i samme program
            </h2>
            <div className="grid md:grid-cols-3 gap-4 md:gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/erhvervsforsikringer/${r.slug}`}
                  className="group block p-6 bg-white border border-[color:var(--color-nordan-line)] rounded-[6px] hover:border-[color:var(--color-nordan-accent)] transition-colors"
                >
                  <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
                    {r.letter}
                  </div>
                  <div className="font-semibold text-[1.05rem] mb-1">{r.navLabel}</div>
                  <div className="text-[0.88rem] text-[color:var(--color-nordan-ink-soft)] line-clamp-2">
                    {r.intro.substring(0, 100)}…
                  </div>
                  <span className="inline-flex items-center gap-1 mt-4 text-[0.78rem] uppercase tracking-[0.12em] font-semibold text-[color:var(--color-nordan-accent)] group-hover:text-[color:var(--color-nordan-dark)]">
                    Læs mere <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* BOTTOM CVR — second exposure */}
      <section id="analyse-bottom" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-6">
            <div className="eyebrow mb-4">Næste skridt</div>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.9rem,3.2vw,2.5rem)] leading-[1.15] mb-6">
              Lad os gennemgå jeres {product.navLabel.toLowerCase()} — helt uforpligtende
            </h2>
            <p className="text-[1.05rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.75] mb-6">
              Indtast jeres CVR og vi går straks i gang med analysen. Ingen binding, intet spam — bare reel rådgivning fra første møde.
            </p>
            <ul className="check-list">
              <li>Uafhængig og uvildig rådgivning</li>
              <li>Direkte adgang til erfarne rådgivere</li>
              <li>Svar inden for én hverdag</li>
            </ul>
          </div>
          <div className="md:col-span-6">
            <CvrCapture headline={product.cvrLabel} />
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- FeatureSection ---------------- */
function FeatureSection({ feature, index }: { feature: FeatureBlock; index: number }) {
  const imageRight = feature.imageSide !== "left";
  const bg = index % 2 === 0 ? "bg-white" : "bg-[color:var(--color-nordan-soft)]";

  return (
    <section className={`py-12 sm:py-16 md:py-24 ${bg}`}>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-8 md:gap-16 items-center">
        <div className={`md:col-span-6 ${imageRight ? "md:order-1" : "md:order-2"}`}>
          {feature.eyebrow ? <div className="eyebrow mb-4">{feature.eyebrow}</div> : null}
          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.75rem,2.8vw,2.25rem)] leading-[1.2] mb-5">
            {feature.title}
          </h2>
          <p className="text-[1.02rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.75] mb-6">
            {feature.body}
          </p>
          {feature.bullets && feature.bullets.length > 0 ? (
            <ul className="space-y-4">
              {feature.bullets.map((b) => (
                <li key={b.label} className="flex gap-4">
                  <span className="mt-1 shrink-0 w-6 h-6 rounded-full bg-[color:var(--color-nordan-accent)]/15 grid place-items-center" aria-hidden>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--color-nordan-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-semibold text-[color:var(--color-nordan-ink)] mb-0.5">{b.label}</div>
                    {b.body ? <div className="text-[0.95rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.6]">{b.body}</div> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className={`md:col-span-6 ${imageRight ? "md:order-2" : "md:order-1"} relative aspect-[4/3] overflow-hidden rounded-[8px]`}>
          <Image
            src={feature.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={95}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- StatsStrip ---------------- */
function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className="bg-[color:var(--color-nordan-dark)] text-white">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-10 md:py-12 grid md:grid-cols-3 gap-0">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center justify-center text-center px-4 py-6 md:py-3 ${
              i < stats.length - 1 ? "border-b md:border-b-0 md:border-r border-white/10" : ""
            }`}
          >
            <div className="font-[family-name:var(--font-inter)] font-bold text-[clamp(1.9rem,3vw,2.4rem)] leading-[1] tracking-[-0.02em] text-[color:var(--color-nordan-accent-soft)] mb-3">
              {s.value}
            </div>
            <p className="text-white/85 text-[0.92rem] font-medium leading-[1.4] max-w-[26ch]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FaqSection({ items }: { items: Faq[] }) {
  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6 md:px-10">
        <div className="eyebrow mb-3">Ofte stillede spørgsmål</div>
        <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.75rem,2.8vw,2.25rem)] leading-[1.2] mb-10">
          Svar på det der oftest kommer op
        </h2>
        <ul className="divide-y divide-[color:var(--color-nordan-line)] border-y border-[color:var(--color-nordan-line)]">
          {items.map((f) => (
            <li key={f.q}>
              <details className="group py-5 cursor-pointer">
                <summary className="flex items-start justify-between gap-6 list-none cursor-pointer">
                  <span className="font-[family-name:var(--font-playfair)] text-[1.02rem] sm:text-[1.15rem] md:text-[1.25rem] leading-snug">
                    {f.q}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 mt-1 w-7 h-7 rounded-full bg-[color:var(--color-nordan-soft)] grid place-items-center text-[color:var(--color-nordan-ink)] text-lg leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-[color:var(--color-nordan-ink-soft)] leading-[1.75]">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
