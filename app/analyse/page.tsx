import type { Metadata } from "next";
import { CvrLookup } from "../_components/CvrLookup";

export const metadata: Metadata = {
  title: "Start din gratis forsikringsanalyse",
  description:
    "Indtast dit CVR og få en gratis, AI-drevet analyse af din virksomheds forsikringer. Vi gennemgår dækninger og forhandler på dine vegne.",
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
    <main className="bg-[color:var(--color-nordan-soft)] min-h-[calc(100vh-80px)]">
      {/* HERO BAND — tightened so the user reaches the card faster */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-8 md:pb-10">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
          <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.85rem,3.6vw,2.7rem)] leading-[1.12] tracking-[-0.015em] mb-4 max-w-3xl text-[color:var(--color-nordan-ink)] text-balance">
            {hasInitial ? (
              <>
                Tak — vi gør jeres{" "}
                <span className="text-[color:var(--color-nordan-accent)] italic">AI-drevne</span>{" "}
                analyse klar.
              </>
            ) : (
              <>
                Få en{" "}
                <span className="text-[color:var(--color-nordan-accent)] italic">AI-drevet</span>,
                gratis forsikringsanalyse.
              </>
            )}
          </h1>
          <p className="text-[1rem] sm:text-[1.05rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.65] max-w-2xl">
            {hasInitial
              ? "Bekræft virksomheden og udfyld de tre felter — alt sendes samlet, og jeres forsikringsmægler ringer inden for én hverdag."
              : "Indtast CVR. Vi henter virksomhedsdata, læser policer og sammenligner markedet. Forsikringsmægler ringer inden for én hverdag."}
          </p>
        </div>
      </section>

      {/* CARD AREA — step indicator now lives inside CvrLookup and animates with progress */}
      <section className="pb-20 sm:pb-24 md:pb-28">
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
