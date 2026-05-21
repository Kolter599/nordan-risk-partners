import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { CvrCtaSection } from "../_components/CvrCtaSection";
import { Reveal } from "../_components/Reveal";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter, SITE_URL } from "@/lib/seo";

const EXT_LINKS = {
  finanstilsynet: "https://www.finanstilsynet.dk/",
  fmf: "https://www.fmf.dk/",
  forsikringsformidlingsloven: "https://www.retsinformation.dk/eli/lta/2023/377",
} as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[color:var(--color-nordan-accent)] underline underline-offset-2 hover:text-[color:var(--color-nordan-dark)]"
    >
      {children}
    </a>
  );
}

const HVORFOR_TITLE = "Hvorfor bruge en forsikringsmægler? — fordele, pris og hvad det reelt gør";
const HVORFOR_DESC =
  "En forsikringsmægler er din uafhængige rådgiver — vi forhandler markedet, gennemskuer dækninger, hjælper når der sker skade. Læs hvornår en mægler giver mening for din virksomhed.";

export const metadata: Metadata = {
  title: HVORFOR_TITLE,
  description: HVORFOR_DESC,
  alternates: { canonical: "/hvorfor-forsikringsmaegler" },
  openGraph: pageOpenGraph({ title: HVORFOR_TITLE, description: HVORFOR_DESC, path: "/hvorfor-forsikringsmaegler" }),
  twitter: pageTwitter({ title: HVORFOR_TITLE, description: HVORFOR_DESC }),
};

const HVORFOR_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Forside", path: "/" },
      { name: "Hvorfor forsikringsmægler?", path: "/hvorfor-forsikringsmaegler" },
    ]),
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/hvorfor-forsikringsmaegler#webpage`,
      url: `${SITE_URL}/hvorfor-forsikringsmaegler`,
      name: HVORFOR_TITLE,
      description: HVORFOR_DESC,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

const REASONS = [
  {
    n: "01",
    title: "Vi er på din side — altid",
    body: "Vi arbejder udelukkende for dig, ikke for forsikringsselskaberne. I forhandlinger og skader er din interesse vores udgangspunkt.",
  },
  {
    n: "02",
    title: "Uafhængig og ærlig",
    body: "Vi har ingen skjulte aftaler med forsikringsselskaber. Vores anbefalinger er altid baseret på hvad der giver dig den rigtige dækning til den rigtige pris.",
  },
  {
    n: "03",
    title: "Vi kender markedet",
    body: "Årtiers brancheerfaring kombineret med aktuel markedsviden giver dig forhandlingsstyrke — også hvis du er en mindre virksomhed.",
  },
  {
    n: "04",
    title: "Du sparer tid og besvær",
    body: "Vi er dit ene kontaktpunkt gennem hele processen: fra tilbud og forhandling til fornyelser og skader. Uden telefonsluser.",
  },
];

type FaqItem = { q: string; a: ReactNode; aText: string };

const FAQ: FaqItem[] = [
  {
    q: "Hvad er en forsikringsmægler?",
    a: (
      <>
        En forsikringsmægler er en uafhængig rådgiver, der hjælper virksomheder med at finde de
        rette forsikringsløsninger. I modsætning til et forsikringsselskab, som kun sælger egne
        produkter, arbejder en mægler på kundens side og indhenter tilbud fra flere selskaber.
        <br />
        <br />
        👉 Ifølge{" "}
        <ExtLink href={EXT_LINKS.finanstilsynet}>Finanstilsynet</ExtLink> er en forsikringsmægler
        registreret og underlagt lovkrav om at være uvildig og handle i kundens interesse.
      </>
    ),
    aText:
      "En forsikringsmægler er en uafhængig rådgiver, der hjælper virksomheder med at finde de rette forsikringsløsninger. I modsætning til et forsikringsselskab, som kun sælger egne produkter, arbejder en mægler på kundens side og indhenter tilbud fra flere selskaber. Ifølge Finanstilsynet er en forsikringsmægler registreret og underlagt lovkrav om at være uvildig og handle i kundens interesse.",
  },
  {
    q: "Hvorfor vælge en forsikringsmægler frem for at købe direkte hos selskabet?",
    a: (
      <>
        Når du køber forsikringer direkte hos et selskab, får du kun adgang til det pågældende
        selskabs produkter og priser. En forsikringsmægler sammenligner markedet på dine vegne,
        sikrer at dækningerne passer til din virksomhed og forhandler prisen.
        <br />
        <br />
        👉 Som{" "}
        <ExtLink href={EXT_LINKS.fmf}>Forsikringsmæglerforeningen</ExtLink> beskriver, er en af de
        største fordele ved at bruge mæglere netop muligheden for at afdække markedet bredt.
      </>
    ),
    aText:
      "Når du køber forsikringer direkte hos et selskab, får du kun adgang til det pågældende selskabs produkter og priser. En forsikringsmægler sammenligner markedet på dine vegne, sikrer at dækningerne passer til din virksomhed og forhandler prisen. Som Forsikringsmæglerforeningen beskriver, er en af de største fordele ved at bruge mæglere netop muligheden for at afdække markedet bredt.",
  },
  {
    q: "Hvad er forskellen på en forsikringsmægler og en assurandør?",
    a: "En assurandør er ansat af et forsikringsselskab og sælger kun selskabets egne produkter. En forsikringsmægler er uafhængig og repræsenterer kunden. Mægleren kan indhente tilbud fra flere selskaber og finde den løsning, der passer bedst til virksomhedens behov.",
    aText:
      "En assurandør er ansat af et forsikringsselskab og sælger kun selskabets egne produkter. En forsikringsmægler er uafhængig og repræsenterer kunden. Mægleren kan indhente tilbud fra flere selskaber og finde den løsning, der passer bedst til virksomhedens behov.",
  },
  {
    q: "Er en forsikringsmægler uvildig?",
    a: (
      <>
        Ja. En registreret forsikringsmægler i Danmark er lovmæssigt forpligtet til at være
        uafhængig og arbejde i kundens interesse. Vi får ikke provision fra selskaberne, men
        arbejder ud fra honorar eller aftalt betaling med dig som kunde.
        <br />
        <br />
        👉 Dette krav fremgår af{" "}
        <ExtLink href={EXT_LINKS.forsikringsformidlingsloven}>
          Lov om forsikringsformidling (forsikringsformidlingsloven)
        </ExtLink>
        .
      </>
    ),
    aText:
      "Ja. En registreret forsikringsmægler i Danmark er lovmæssigt forpligtet til at være uafhængig og arbejde i kundens interesse. Vi får ikke provision fra selskaberne, men arbejder ud fra honorar eller aftalt betaling med dig som kunde. Dette krav fremgår af Lov om forsikringsformidling (forsikringsformidlingsloven).",
  },
  {
    q: "Hvad koster det at bruge en forsikringsmægler?",
    a: "Honoraret afhænger af kompleksiteten af forsikringsløsningen og niveauet af ønsket rådgivning. Ofte tjener vores indsats sig selv hjem gennem besparelser og bedre vilkår. Vi tilbyder fuld gennemsigtighed omkring vores honorarmodel – og der er aldrig skjulte gebyrer.",
    aText:
      "Honoraret afhænger af kompleksiteten af forsikringsløsningen og niveauet af ønsket rådgivning. Ofte tjener vores indsats sig selv hjem gennem besparelser og bedre vilkår. Vi tilbyder fuld gennemsigtighed omkring vores honorarmodel – og der er aldrig skjulte gebyrer.",
  },
  {
    q: "Hvilke typer virksomheder hjælper vi?",
    a: "Vi rådgiver både små og mellemstore virksomheder samt større organisationer – på tværs af brancher. Uanset om du driver håndværk, produktion, rådgivning eller handel, tilpasser vi løsningen til din virkelighed.",
    aText:
      "Vi rådgiver både små og mellemstore virksomheder samt større organisationer – på tværs af brancher. Uanset om du driver håndværk, produktion, rådgivning eller handel, tilpasser vi løsningen til din virkelighed.",
  },
  {
    q: "Skal jeg skifte alle mine forsikringer for at bruge jer?",
    a: "Det korte svar er nej. Vi foretager først en gennemgang og vurdering af dine eksisterende policer. Kun hvis vi vurderer, at der er klare fordele ved ændringer, anbefaler vi justeringer eller skift. Det vigtigste er, at du er korrekt og konkurrencedygtigt dækket.",
    aText:
      "Det korte svar er nej. Vi foretager først en gennemgang og vurdering af dine eksisterende policer. Kun hvis vi vurderer, at der er klare fordele ved ændringer, anbefaler vi justeringer eller skift. Det vigtigste er, at du er korrekt og konkurrencedygtigt dækket.",
  },
  {
    q: "Kan I hjælpe med skader?",
    a: "Ja. Vi bistår med skadeshåndtering, rådgivning og dialog med forsikringsselskabet, så du ikke står alene i processen. Vi sikrer, at sagen bliver behandlet korrekt og effektivt – og følger op, hvis der opstår udfordringer.",
    aText:
      "Ja. Vi bistår med skadeshåndtering, rådgivning og dialog med forsikringsselskabet, så du ikke står alene i processen. Vi sikrer, at sagen bliver behandlet korrekt og effektivt – og følger op, hvis der opstår udfordringer.",
  },
  {
    q: "Hvordan foregår opstarten med jer?",
    a: "Vi starter med en uforpligtende dialog, hvor vi lærer din virksomhed at kende. Herefter gennemgår vi dine eksisterende forsikringer, identificerer risici og fremlægger konkrete forbedringsforslag. Der er ingen binding før du ønsker, at vi går videre.",
    aText:
      "Vi starter med en uforpligtende dialog, hvor vi lærer din virksomhed at kende. Herefter gennemgår vi dine eksisterende forsikringer, identificerer risici og fremlægger konkrete forbedringsforslag. Der er ingen binding før du ønsker, at vi går videre.",
  },
  {
    q: "Arbejder I med flere forsikringsselskaber?",
    a: "Ja – vi samarbejder med alle selskaber som udbyder produkter på markedet, men er ikke bundet til nogen af dem. Det giver os mulighed for at forhandle objektivt og skabe den bedst mulige løsning for din virksomhed.",
    aText:
      "Ja – vi samarbejder med alle selskaber som udbyder produkter på markedet, men er ikke bundet til nogen af dem. Det giver os mulighed for at forhandle objektivt og skabe den bedst mulige løsning for din virksomhed.",
  },
  {
    q: "Hvad adskiller Nordan Risk Partners fra andre mæglere?",
    a: "Vi prioriterer nærhed, tilgængelighed og ærlig rådgivning. Hos os får du direkte adgang til erfarne rådgivere – ikke telefonsluser og skiftende kontaktpersoner. Vi tror på langsigtede relationer og skræddersyede løsninger, der giver mening i praksis.",
    aText:
      "Vi prioriterer nærhed, tilgængelighed og ærlig rådgivning. Hos os får du direkte adgang til erfarne rådgivere – ikke telefonsluser og skiftende kontaktpersoner. Vi tror på langsigtede relationer og skræddersyede løsninger, der giver mening i praksis.",
  },
  {
    q: "Hvordan vælger jeg den rigtige forsikringsmægler?",
    a: "Når du vælger en mægler, bør du se på branchekendskab, tilgængelighed og ikke mindst uafhængighed. Det er vigtigt, at mægleren ikke er bundet til bestemte selskaber, men alene arbejder for dine interesser. Hos Nordan Risk Partners vægter vi åbenhed, ærlighed og langsigtede relationer.",
    aText:
      "Når du vælger en mægler, bør du se på branchekendskab, tilgængelighed og ikke mindst uafhængighed. Det er vigtigt, at mægleren ikke er bundet til bestemte selskaber, men alene arbejder for dine interesser. Hos Nordan Risk Partners vægter vi åbenhed, ærlighed og langsigtede relationer.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.aText },
  })),
};

export default function HvorforPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HVORFOR_JSONLD) }}
      />
      {/* HERO — text + vertical portrait that sticks while scrolling (mirrors /om-os) */}
      <section className="pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-20 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-7">
            <div className="eyebrow mb-5">Forsikringsmægler</div>
            <h1 className="display-page mb-8 pr-4">
              Hvad er en forsikringsmægler?
            </h1>
            <div className="prose-body">
              <p>
                En forsikringsmægler er din uafhængige rådgiver, der varetager hele processen omkring dit forsikringsprogram – fra gennemgang og forhandling, til løbende drift og skadeshåndtering. Vi arbejder for dig – ikke forsikringsselskaberne.
              </p>
              <p>
                Hos os får du en samarbejdspartner, der forstår både dine behov og forsikringsmarkedets kompleksitet. Vi fungerer som bindeled mellem dig og forsikringsselskaberne – men vi er <em>alene på din side af bordet</em>. Vores mål er klart: Du skal have den rigtige dækning, til den rigtige pris, uden at drukne i detaljer og bøvl.
              </p>
              <p>
                Vi ved, at forsikring kan virke uoverskueligt. Derfor gør vi det enkelt, gennemsigtigt og effektivt. Vi lytter, rådgiver og forhandler — og vi slipper dig ikke, når først løsningen er på plads.
              </p>
              <p>
                Ved skader er vi din sparringspartner og bindeled til selskabet — så du ikke står alene når det betyder mest.
              </p>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <figure className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <Image
                  src="/images/nordan-12.jpg"
                  alt="Nordan Risk Partners — forsikringsmægler i samtale"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  quality={95}
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* 4 REASONS */}
      <section className="py-20 md:py-28 bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-3xl mb-14">
            <div className="eyebrow mb-4">Fire grunde</div>
            <h2 className="display-lg">Hvorfor vælge en uafhængig mægler</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {REASONS.map((r, i) => (
              <Reveal key={r.n} delay={i * 70}>
                <article className="h-full bg-white border border-[color:var(--color-nordan-line)] rounded-sm p-8 md:p-10">
                  <div className="text-[color:var(--color-nordan-accent)] font-semibold tracking-[0.2em] mb-5">{r.n}</div>
                  <h3 className="display-md mb-4">{r.title}</h3>
                  <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{r.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <div className="eyebrow mb-4">Ofte stillede spørgsmål</div>
          <h2 className="display-lg mb-5">Det vi bliver spurgt om</h2>
          <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed max-w-2xl mb-12">
            Forsikring kan være kompleks. Derfor har vi samlet svar på de mest almindelige spørgsmål
            – så du hurtigt kan få overblik. Vi hjælper naturligvis gerne, hvis du har behov for
            uddybning.
          </p>
          <ul className="divide-y divide-[color:var(--color-nordan-line)] border-y border-[color:var(--color-nordan-line)]">
            {FAQ.map((f) => (
              <li key={f.q}>
                <details className="group py-5 cursor-pointer">
                  <summary className="flex items-start justify-between gap-6 list-none cursor-pointer">
                    <span className="display-sm">{f.q}</span>
                    <span aria-hidden className="shrink-0 mt-1 w-6 h-6 rounded-full bg-[color:var(--color-nordan-soft)] grid place-items-center text-[color:var(--color-nordan-ink)] text-sm transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="mt-4 text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{f.a}</div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CvrCtaSection />
    </>
  );
}
