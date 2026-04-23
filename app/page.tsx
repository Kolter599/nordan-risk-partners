import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CvrLookup } from "./_components/CvrLookup";
import { InsurerMarquee } from "./_components/InsurerMarquee";
import { OrganizationJsonLd } from "./_components/JsonLd";
import { Reveal } from "./_components/Reveal";
import { RotatingWord } from "./_components/RotatingWord";
import { TestimonialMarquee } from "./_components/TestimonialMarquee";

export const metadata: Metadata = {
  title: "Digital forsikringsmægler til din virksomhed",
  description:
    "En smartere tilgang til erhvervsforsikring. Indtast dit CVR og få en gratis analyse af dine forsikringer. Vi sammenligner markedet, optimerer dækning og reducerer præmien.",
};

const METRICS = [
  { value: "70.000+", label: "ejendomme vi har erfaring med" },
  { value: "40+ år", label: "erfaring i branchen" },
  { value: "2–3 år", label: "siden de fleste sidst fik tjekket" },
];

const STEPS = [
  {
    n: "01",
    title: "Vi analyserer",
    body: "Indtast dit CVR, og vi henter automatisk virksomhedsdata og eksisterende policer. En rådgiver gennemgår alt og identificerer huller, overlap og overpriser.",
  },
  {
    n: "02",
    title: "Vi anbefaler",
    body: "Du modtager en personlig anbefaling: hvor du kan spare, hvor dækningen bør styrkes — og hvad det vil koste at få det optimale program på plads.",
  },
  {
    n: "03",
    title: "Vi overvåger",
    body: "Din rådgiver følger programmet løbende. Ændringer i drift, marked eller lovgivning? Vi kontakter dig før det bliver til et problem.",
  },
];

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />

      {/* HERO — Holstrup-style, slim */}
      <section className="relative overflow-hidden text-white min-h-[82vh] flex items-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-founders-wide.jpg"
            alt="Mads Horvitz Larsen og Leo Julsgaard — stiftere af Nordan Risk Partners"
            fill
            priority
            fetchPriority="high"
            className="object-cover object-center lg:object-[30%_center]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[color:var(--color-nordan-dark)] opacity-85" />
        </div>

        <div className="relative w-full mx-auto max-w-[1400px] px-6 md:px-10 pt-28 md:pt-36 pb-20 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <div className="lg:col-span-8 xl:col-span-8 min-w-0">
              <div className="text-[0.74rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)] mb-8">
                Uvildig rådgivning
              </div>
              <h1 className="saas-display">
                <span className="block whitespace-nowrap">Vi hjælper med jeres</span>
                <span className="block whitespace-nowrap"><RotatingWord /></span>
                <span className="block whitespace-nowrap">til jeres virksomhed.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg md:text-xl text-white/90 font-normal leading-[1.55]">
                Få en gratis analyse af jeres forsikringer. Vi sammenligner markedet, forhandler på jeres vegne og holder programmet opdateret.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/analyse"
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
              <ul className="mt-10 grid sm:grid-cols-2 gap-3 max-w-2xl text-[0.95rem] font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {[
                  "Gratis uforpligtende analyse",
                  "Uafhængig rådgivning — ingen bindinger",
                  "Direkte adgang til erfarne rådgivere",
                  "Over 40 års brancheerfaring",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-nordan-accent-soft)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-4 xl:col-span-4 lg:pt-[190px] xl:pt-[215px]">
              <CvrLookup />
            </div>
          </div>
        </div>
      </section>

      {/* METRICS BAR — centered, equally weighted, clean alignment */}
      <section className="bg-[color:var(--color-nordan-dark-deep)] text-white border-t border-white/10">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 py-10 md:py-12 grid md:grid-cols-3">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} delay={i * 60}>
              <div
                className={`h-full flex flex-col items-center justify-center text-center px-4 py-5 md:py-3 ${
                  i < 2 ? "border-b md:border-b-0 md:border-r border-white/10" : ""
                }`}
              >
                <div className="font-[family-name:var(--font-inter)] font-bold text-[clamp(2rem,3.2vw,2.6rem)] leading-[1] tracking-[-0.02em] text-[color:var(--color-nordan-accent-soft)] mb-3">
                  {m.value}
                </div>
                <p className="text-white/85 text-[0.95rem] font-medium leading-[1.4] max-w-[22ch]">
                  {m.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* INSURER MARQUEE — scrolling logos below the metrics */}
      <InsurerMarquee />

      {/* 3-STEP — minimal, borderless */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="max-w-3xl mb-12 md:mb-16">
            <div className="eyebrow mb-4">Sådan fungerer det</div>
            <h2 className="display-lg">Tre trin til et bedre forsikringsprogram</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-12">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 60}>
                <article className="relative">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-[color:var(--color-nordan-accent)] font-[family-name:var(--font-inter)] font-bold text-[0.82rem] tracking-[0.18em]">
                      {s.n}
                    </span>
                    <span className="h-px flex-1 bg-[color:var(--color-nordan-line)]" />
                  </div>
                  <h3 className="display-md mb-3">{s.title}</h3>
                  <p className="text-[color:var(--color-nordan-ink-soft)] leading-[1.65] text-[0.98rem]">{s.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SUMMARY — replaces fake dashboard */}
      <section className="py-16 md:py-24 bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid lg:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-4">Fra CVR til analyse</div>
            <h2 className="display-lg mb-5">Fire trin og vi går i gang</h2>
            <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-8">
              Du bruger under fem minutter. Resten tager vi — gennemgang, forhandling og anbefalinger leveres direkte til din indbakke.
            </p>
            <ul className="check-list">
              <li>Indtast CVR — vi henter jeres virksomhedsdata</li>
              <li>Underskriv fuldmagt digitalt eller på PDF</li>
              <li>Upload eksisterende policer (kan springes over)</li>
              <li>Din rådgiver ringer inden for én hverdag</li>
            </ul>
            <div className="mt-10">
              <Link href="/analyse" className="btn-primary">Kom i gang</Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ProcessPreview />
          </div>
          {/* vertical founders portrait appears in the dashboard mockup's neighbor section intentionally blank here */}
        </div>
      </section>

      {/* TESTIMONIAL MARQUEE */}
      <TestimonialMarquee
        eyebrow="Hvad kunderne oplever"
        title="Virkelige resultater, rene kundeoplevelser"
        variant="dark"
      />

      {/* BOTTOM DUAL CTA */}
      <section id="lead" className="py-20 md:py-28 bg-white">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 text-center">
          <div className="eyebrow mb-4">Næste skridt</div>
          <h2 className="display-lg mb-6 max-w-3xl mx-auto">Få din virksomhed tjekket — eller book et møde</h2>
          <p className="text-[color:var(--color-nordan-ink-soft)] max-w-2xl mx-auto leading-relaxed mb-10">
            Vælg det format der passer dig. Gratis analyse via CVR tager dig to minutter. Hellere en snak? Vi booker ind til dig inden for én hverdag.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/analyse" className="btn-primary">Start gratis analyse</Link>
            <Link href="/kontakt-os" className="btn-outline">Book et møde</Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.15em] text-[color:var(--color-nordan-muted)]">
            Godkendt af Finanstilsynet · Medlem af FMF
          </p>
        </div>
      </section>
    </>
  );
}

function ProcessPreview() {
  const STEPS = [
    { n: "01", label: "CVR", title: "Virksomhed hentet", status: "done" },
    { n: "02", label: "Fuldmagt", title: "Digital underskrift", status: "done" },
    { n: "03", label: "Policer", title: "Upload eller spring over", status: "active" },
    { n: "04", label: "Kontakt", title: "Din rådgiver ringer", status: "pending" },
  ] as const;

  return (
    <div className="bg-white border border-[color:var(--color-nordan-line)] rounded-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="px-6 md:px-7 py-5 border-b border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)] flex items-center justify-between">
        <div>
          <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-muted)]">Din analyse</div>
          <div className="font-[family-name:var(--font-inter)] font-bold text-[1.1rem] mt-0.5">Invisu ApS · CVR 41515180</div>
        </div>
        <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full bg-[color:var(--color-nordan-accent)]/15 text-[color:var(--color-nordan-accent)] text-[0.72rem] uppercase tracking-[0.18em] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent)] animate-pulse" />
          I gang
        </div>
      </div>

      <ul className="divide-y divide-[color:var(--color-nordan-line)]">
        {STEPS.map((s) => (
          <li key={s.n} className="px-6 md:px-7 py-4 flex items-center gap-4">
            <span
              className={`shrink-0 w-9 h-9 rounded-full grid place-items-center text-[0.78rem] font-semibold ${
                s.status === "done"
                  ? "bg-[color:var(--color-nordan-dark)] text-white"
                  : s.status === "active"
                  ? "bg-[color:var(--color-nordan-accent)] text-white ring-4 ring-[color:var(--color-nordan-accent)]/15"
                  : "bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-muted)]"
              }`}
              aria-hidden
            >
              {s.status === "done" ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                s.n
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
                {s.label}
              </div>
              <div
                className={`text-[0.98rem] font-semibold ${
                  s.status === "pending" ? "text-[color:var(--color-nordan-muted)]" : "text-[color:var(--color-nordan-ink)]"
                }`}
              >
                {s.title}
              </div>
            </div>
            {s.status === "active" ? (
              <span className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-accent)]">Nu</span>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="px-6 md:px-7 py-4 border-t border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)]/50 flex items-center justify-between">
        <div className="text-[0.82rem] text-[color:var(--color-nordan-muted)]">
          Estimeret svar <span className="font-semibold text-[color:var(--color-nordan-ink)]">inden for 24 timer</span>
        </div>
        <div className="text-[0.72rem] uppercase tracking-[0.15em] font-semibold text-[color:var(--color-nordan-accent)]">
          2/4 færdig
        </div>
      </div>
    </div>
  );
}
