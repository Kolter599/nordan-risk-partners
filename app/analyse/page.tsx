import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CvrCapture } from "../_components/CvrCapture";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter, SITE_URL } from "@/lib/seo";

const ANALYSE_TITLE = "Gratis forsikringsanalyse — indtast CVR og se hvor du kan spare";
const ANALYSE_DESC =
  "Få en gratis, uvildig analyse af din virksomheds forsikringer. Indtast CVR — vi henter data, gennemgår dækninger og forhandler præmien ned. Ingen binding, intet salgsspil.";

export const metadata: Metadata = {
  title: ANALYSE_TITLE,
  description: ANALYSE_DESC,
  alternates: { canonical: "/analyse" },
  openGraph: pageOpenGraph({ title: ANALYSE_TITLE, description: ANALYSE_DESC, path: "/analyse" }),
  twitter: pageTwitter({ title: ANALYSE_TITLE, description: ANALYSE_DESC }),
};

const ANALYSE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Forside", path: "/" },
      { name: "Gratis analyse", path: "/analyse" },
    ]),
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/analyse#webpage`,
      url: `${SITE_URL}/analyse`,
      name: ANALYSE_TITLE,
      description: ANALYSE_DESC,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
  ],
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

  // If someone lands here with ?cvr=XXX (e.g. from an old saved link or a
  // marketing campaign), send them straight to the focused /start flow.
  if (hasInitial) {
    redirect(`/start?cvr=${initialCvr}`);
  }

  return (
    <main className="bg-[color:var(--color-nordan-soft)] min-h-[calc(100vh-80px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ANALYSE_JSONLD) }}
      />
      {/* HERO BAND — restrained but grand */}
      <section className="pt-24 sm:pt-32 md:pt-40 pb-8 md:pb-14 relative overflow-hidden">
        {/* subtle radial glow for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(900px 400px at 15% 0%, rgba(165,136,120,0.10), transparent 60%), radial-gradient(900px 500px at 85% 100%, rgba(37,63,50,0.08), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="text-[0.74rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent)] mb-5">
              Gratis analyse
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.08] tracking-[-0.018em] mb-5 text-[color:var(--color-nordan-ink)] text-balance">
              Smartere forsikringsanalyse — gratis og uvildig.
            </h1>
            <p className="text-[1.02rem] sm:text-[1.1rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.65] max-w-2xl">
              Vi bruger AI til at læse policer og sammenligne markedet hurtigere. Det giver os mere tid til rådgivning — og jer en bedre løsning til en skarpere pris.
            </p>
            <p className="mt-4 text-[0.92rem] text-[color:var(--color-nordan-muted)] leading-relaxed">
              Indtast CVR — analysen åbner i en ny fane så du har al fokus på flowet.
            </p>
          </div>
          <div className="lg:col-span-5 lg:pt-2">
            <CvrCapture />
          </div>
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
