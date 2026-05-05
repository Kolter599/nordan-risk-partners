import type { Metadata } from "next";
import { HoleInOneFlow } from "./HoleInOneFlow";

export const metadata: Metadata = {
  title: "Bestil din Hole-in-one forsikring",
  description:
    "Udfyld få oplysninger om turneringen og præmien. Vi vender tilbage med et tilbud på din Hole-in-one forsikring inden for én hverdag.",
  alternates: { canonical: "/tilbud/hole-in-one" },
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ cvr?: string | string[] }>;

export default async function HoleInOneTilbudPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cvrRaw = Array.isArray(params.cvr) ? params.cvr[0] : params.cvr;
  const initialCvr = (cvrRaw ?? "").replace(/\D/g, "").slice(0, 8);
  const hasInitial = initialCvr.length === 8;

  return (
    <main className="bg-[color:var(--color-nordan-soft)] min-h-[calc(100vh-80px)]">
      {/* HERO BAND — mirrors /analyse */}
      <section className="pt-24 sm:pt-32 md:pt-40 pb-8 md:pb-14 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(900px 400px at 15% 0%, rgba(165,136,120,0.10), transparent 60%), radial-gradient(900px 500px at 85% 100%, rgba(37,63,50,0.08), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
          <div className="text-[0.74rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent)] mb-5">
            Hole-in-one forsikring
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.08] tracking-[-0.018em] mb-5 max-w-3xl text-[color:var(--color-nordan-ink)] text-balance">
            {hasInitial
              ? "Tak — udfyld turneringen og vi sender et tilbud."
              : "Hole-in-one forsikring — bestil tilbud."}
          </h1>
          <p className="text-[1.02rem] sm:text-[1.1rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.65] max-w-2xl">
            {hasInitial
              ? "Vi har hentet jeres virksomhedsoplysninger. Mangler bare turneringen og præmien — så vender vi tilbage med et tilbud inden for én hverdag."
              : "Indtast turneringens detaljer og præmien. Vi vender tilbage med et skarpt tilbud inden for én hverdag — uden binding."}
          </p>
        </div>
      </section>

      {/* CARD AREA */}
      <section className="pb-16 sm:pb-24 md:pb-28">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
          <HoleInOneFlow initialCvr={hasInitial ? initialCvr : ""} />
        </div>
      </section>

      {/* TRUST STRIP — mirrors /analyse */}
      <section className="bg-white border-t border-[color:var(--color-nordan-line)] py-10 md:py-14">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10 grid sm:grid-cols-3 gap-6 md:gap-10 text-center sm:text-left">
          <TrustItem
            title="Tilbud inden for én hverdag"
            body="Vi behandler henvendelsen med det samme. Tilbud i indbakken — ikke i en chatbot."
          />
          <TrustItem
            title="Ingen binding"
            body="Tilbuddet er gratis og uforpligtende. Du bestemmer om I tegner forsikringen."
          />
          <TrustItem
            title="Direkte rådgivning"
            body="I taler med Mads eller Leo personligt hvis I har spørgsmål om dækningen."
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
