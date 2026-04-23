import Image from "next/image";
import Link from "next/link";
import { CvrLookup } from "./CvrLookup";
import { Reveal } from "./Reveal";
import { getRelated, type InsuranceProduct } from "@/lib/insurance-products";

type Props = {
  product: InsuranceProduct;
};

export function InsurancePageTemplate({ product }: Props) {
  const related = getRelated(product.related);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden text-white min-h-[64vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src={product.heroImage}
            alt=""
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[color:var(--color-nordan-dark)] opacity-85" />
        </div>

        <div className="relative w-full mx-auto max-w-[1200px] px-6 md:px-10 pt-28 md:pt-36 pb-20 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-7 min-w-0">
              <div className="text-[0.74rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)] mb-6">
                {product.eyebrow}
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.08] tracking-[-0.015em]">
                {product.title}
              </h1>
              <p className="mt-8 max-w-xl text-lg md:text-xl text-white/90 leading-[1.55]">
                {product.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#analyse"
                  className="inline-flex items-center h-12 px-7 rounded-[6px] bg-[color:var(--color-nordan-accent)] text-white text-[0.88rem] font-semibold tracking-wide hover:bg-[#8f715f] transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                >
                  Få gratis analyse
                </Link>
                <a
                  href="tel:+4553520006"
                  className="inline-flex items-center h-12 px-7 rounded-[6px] border border-white/50 text-white text-[0.88rem] font-semibold tracking-wide hover:bg-white/10 transition-colors"
                >
                  Ring +45 53 52 00 06
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-4">
              <CvrLookup headline={product.cvrLabel} />
            </div>
          </div>
        </div>
      </section>

      {/* BODY SECTIONS */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[900px] px-6 md:px-10">
          {product.sections.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <div className="mb-14 last:mb-0">
                <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.6rem,2.4vw,2rem)] leading-[1.2] mb-4">
                  {s.title}
                </h2>
                {s.body.split("\n\n").map((para, j) => (
                  <p key={j} className="text-[1.05rem] leading-[1.8] text-[color:var(--color-nordan-ink-soft)] mb-3">
                    {para}
                  </p>
                ))}
                {s.bullets ? (
                  <ul className="check-list mt-4">
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

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

      {/* BOTTOM CVR — same analyser, second exposure */}
      <section id="analyse-bottom" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-6">
            <div className="eyebrow mb-4">Næste skridt</div>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(2rem,3.4vw,2.75rem)] leading-[1.15] mb-6">
              Start jeres gratis analyse nu
            </h2>
            <p className="text-[1.05rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.75] mb-6">
              Indtast CVR og vi går straks i gang med at gennemgå jeres forsikringer. Ingen binding, intet spam — bare reel rådgivning fra dag ét.
            </p>
            <ul className="check-list">
              <li>Uafhængig og uvildig rådgivning</li>
              <li>Direkte adgang til erfarne rådgivere</li>
              <li>Svar inden for én hverdag</li>
            </ul>
          </div>
          <div className="md:col-span-6">
            <CvrLookup headline={product.cvrLabel} />
          </div>
        </div>
      </section>
    </>
  );
}
