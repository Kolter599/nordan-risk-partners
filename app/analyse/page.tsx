import type { Metadata } from "next";
import { CvrLookup } from "../_components/CvrLookup";

export const metadata: Metadata = {
  title: "Start din gratis forsikringsanalyse",
  description:
    "Indtast dit CVR og få en gratis, uvildig analyse af din virksomheds forsikringer. Vi gennemgår dækninger og forhandler på dine vegne.",
};

export default function AnalysePage() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-[color:var(--color-nordan-dark)] text-white flex items-center py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-nordan-dark)] via-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)]" />
      <div className="relative w-full mx-auto max-w-[1100px] px-6 md:px-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <div className="text-[0.74rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)] mb-6">
            Gratis analyse
          </div>
          <h1 className="font-[family-name:var(--font-inter)] font-bold text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1.05] tracking-[-0.03em] mb-8">
            Få en uvildig gennemgang af jeres forsikringer.
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-[1.55] mb-8 max-w-xl">
            Indtast jeres CVR — vi gør resten. Ingen binding, intet spam, og direkte adgang til erfarne rådgivere.
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 max-w-xl text-[0.95rem] font-medium text-white">
            {[
              "Vi sammenligner markedet for jer",
              "Ingen binding, ingen salgsretorik",
              "Rådgiver ringer inden for én hverdag",
              "Skræddersyet til jeres branche",
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

        <div>
          <CvrLookup headline="Indtast CVR — start jeres analyse" />
        </div>
      </div>
    </section>
  );
}
