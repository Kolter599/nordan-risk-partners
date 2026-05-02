import type { Metadata } from "next";
import { CvrLookup } from "../_components/CvrLookup";

export const metadata: Metadata = {
  title: "Start din gratis forsikringsanalyse",
  description:
    "Indtast dit CVR og få en gratis, uvildig analyse af din virksomheds forsikringer. Vi gennemgår dækninger og forhandler på dine vegne.",
};

type SearchParams = Promise<{ cvr?: string | string[] }>;

const STEPS_FRESH = [
  { n: 1, label: "Indtast CVR", state: "active" },
  { n: 2, label: "Bekræft virksomhed", state: "next" },
  { n: 3, label: "Klargør analyse", state: "next" },
] as const;

const STEPS_PREFILLED = [
  { n: 1, label: "Indtast CVR", state: "done" },
  { n: 2, label: "Bekræft virksomhed", state: "active" },
  { n: 3, label: "Klargør analyse", state: "next" },
] as const;

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.cvr) ? sp.cvr[0] : sp.cvr;
  const initialCvr = (raw ?? "").replace(/\D/g, "").slice(0, 8);
  const hasInitial = initialCvr.length === 8;
  const steps = hasInitial ? STEPS_PREFILLED : STEPS_FRESH;

  return (
    <main className="bg-[color:var(--color-nordan-soft)] min-h-[calc(100vh-80px)]">
      {/* HERO BAND — generous top padding under the solid nav */}
      <section className="pt-32 sm:pt-36 md:pt-44 pb-10 sm:pb-12 md:pb-16">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
          {/* AI pill — sized to feel intentional, not floating */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-white border border-[color:var(--color-nordan-line)] text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-dark)] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="var(--color-nordan-accent)" aria-hidden>
              <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z" />
              <path d="M19 14l.85 2.65L22 17l-2.15.35L19 20l-.85-2.65L16 17l2.15-.35L19 14z" />
            </svg>
            AI-drevet analyse
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.015em] mb-5 max-w-3xl text-[color:var(--color-nordan-ink)]">
            {hasInitial
              ? "Tak — vi har modtaget jeres CVR."
              : "Start jeres gratis forsikringsanalyse."}
          </h1>
          <p className="text-[1.02rem] sm:text-[1.1rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.7] max-w-2xl mb-10">
            {hasInitial
              ? "Bekræft virksomheden og udfyld de tre felter nedenfor i jeres eget tempo. AI-modellen forbereder analysen mens I udfylder — så jeres forsikringsmægler kan ringe inden for én hverdag."
              : "Indtast jeres CVR — vi henter automatisk virksomhedsdata, læser policer og sammenligner markedet. Jeres forsikringsmægler ringer inden for én hverdag."}
          </p>

          {/* STEP INDICATOR */}
          <ol className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[0.82rem] font-medium">
            {steps.map((s, i) => (
              <li key={s.n} className="flex items-center gap-3">
                <span
                  className={`shrink-0 w-7 h-7 rounded-full grid place-items-center text-[0.78rem] font-semibold transition-colors ${
                    s.state === "done"
                      ? "bg-[color:var(--color-nordan-dark)] text-white"
                      : s.state === "active"
                      ? "bg-[color:var(--color-nordan-accent)] text-white ring-4 ring-[color:var(--color-nordan-accent)]/15"
                      : "bg-white border border-[color:var(--color-nordan-line)] text-[color:var(--color-nordan-muted)]"
                  }`}
                  aria-hidden
                >
                  {s.state === "done" ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    s.n
                  )}
                </span>
                <span
                  className={
                    s.state === "next"
                      ? "text-[color:var(--color-nordan-muted)]"
                      : "text-[color:var(--color-nordan-ink)]"
                  }
                >
                  {s.label}
                </span>
                {i < steps.length - 1 ? (
                  <span aria-hidden className="hidden sm:inline-block w-8 h-px bg-[color:var(--color-nordan-line)] ml-1" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CARD AREA — the actual interaction */}
      <section className="pb-20 sm:pb-24 md:pb-32">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
          <CvrLookup
            headline="Indtast CVR — start jeres analyse"
            initialCvr={hasInitial ? initialCvr : undefined}
          />
        </div>
      </section>

      {/* TRUST FOOTER STRIP */}
      <section className="bg-white border-t border-[color:var(--color-nordan-line)] py-10 md:py-14">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10 grid sm:grid-cols-3 gap-6 md:gap-10 text-center sm:text-left">
          <TrustItem
            title="Ingen binding"
            body="Analysen er gratis og uforpligtende. I bestemmer hvad der skal ske bagefter."
          />
          <TrustItem
            title="Direkte adgang til mæglerne"
            body="I taler med Mads eller Leo personligt — ikke en callcenter-medarbejder."
          />
          <TrustItem
            title="Godkendt og uvildig"
            body="Godkendt af Finanstilsynet og medlem af FMF. Vi arbejder kun for jer — aldrig for selskaberne."
          />
        </div>
      </section>
    </main>
  );
}

function TrustItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[color:var(--color-nordan-soft)] mb-3 mx-auto sm:mx-0">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-nordan-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="font-semibold text-[color:var(--color-nordan-ink)] mb-1.5 text-[0.98rem]">{title}</h3>
      <p className="text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.6]">{body}</p>
    </div>
  );
}
