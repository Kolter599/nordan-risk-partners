import type { Metadata } from "next";
import { CvrLookup } from "../_components/CvrLookup";

export const metadata: Metadata = {
  title: "Start din gratis forsikringsanalyse",
  description:
    "Indtast dit CVR og få en gratis, uvildig analyse af din virksomheds forsikringer. Vi gennemgår dækninger og forhandler på dine vegne.",
};

type SearchParams = Promise<{ cvr?: string | string[] }>;

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.cvr) ? sp.cvr[0] : sp.cvr;
  const initialCvr = (raw ?? "").replace(/\D/g, "").slice(0, 8);
  const hasInitial = initialCvr.length === 8;

  return (
    <section className="relative min-h-[calc(100vh-80px)] bg-[color:var(--color-nordan-dark)] text-white py-14 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--color-nordan-dark)] via-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)]" />

      <div className="relative w-full mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
        {/* HERO HEADER */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-white/90">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
              <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z" />
              <path d="M19 14l.85 2.65L22 17l-2.15.35L19 20l-.85-2.65L16 17l2.15-.35L19 14z" />
            </svg>
            AI-drevet analyse
          </div>
          <h1 className="font-[family-name:var(--font-inter)] font-bold text-[clamp(1.9rem,5vw,3.5rem)] leading-[1.05] tracking-[-0.03em] mb-5 sm:mb-7">
            {hasInitial ? "Vi gør analysen klar til jer." : "Få en uvildig gennemgang af jeres forsikringer."}
          </h1>
          <p className="text-base sm:text-lg text-white/85 leading-[1.55] mb-6 sm:mb-8 max-w-2xl">
            {hasInitial
              ? "Vi har modtaget jeres CVR. Bekræft virksomheden, og udfyld de tre felter nedenfor i jeres eget tempo — alt sendes samlet."
              : "Indtast jeres CVR — vi gør resten. Ingen binding, intet spam, og direkte adgang til erfarne forsikringsmæglere."}
          </p>
          <ul className="grid sm:grid-cols-2 gap-2.5 max-w-2xl text-[0.92rem] font-medium text-white mb-10 sm:mb-12">
            {[
              "Vi sammenligner markedet for jer",
              "Ingen binding, ingen salgsretorik",
              "Forsikringsmægler ringer inden for én hverdag",
              "Skræddersyet til jeres branche",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-nordan-accent-soft)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CVR CARD — full-width so the 3 parallel action panels fit */}
        <div className="w-full">
          <CvrLookup
            headline="Indtast CVR — start jeres analyse"
            initialCvr={hasInitial ? initialCvr : undefined}
          />
        </div>
      </div>
    </section>
  );
}
