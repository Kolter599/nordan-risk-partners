import type { Metadata } from "next";
import Image from "next/image";
import { CvrCtaSection } from "../_components/CvrCtaSection";
import { Reveal } from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Hvorfor forsikringsmægler?",
  description:
    "En forsikringsmægler er din uafhængige rådgiver der varetager hele processen omkring dit forsikringsprogram — fra analyse til skader.",
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

const FAQ = [
  {
    q: "Hvad er en forsikringsmægler?",
    a: "En forsikringsmægler er din uafhængige rådgiver, der på dine vegne gennemgår, forhandler og administrerer dit forsikringsprogram. Mægleren arbejder for dig — ikke for selskaberne.",
  },
  {
    q: "Hvad er forskellen på en mægler og en forsikringsagent?",
    a: "En agent repræsenterer et specifikt selskab og sælger deres produkter. En mægler er lovgivningsmæssigt uafhængig og må ikke have bindinger til et selskab. Vi sammenligner markedet og anbefaler det der passer bedst til dig.",
  },
  {
    q: "Hvad koster det at bruge en forsikringsmægler?",
    a: "I langt de fleste tilfælde aflønnes mægleren via provision eller honorar der er transparent og aftales med dig på forhånd. Vores udgangspunkt er altid ærlighed om honorarstrukturen.",
  },
  {
    q: "Hjælper I også ved skader?",
    a: "Ja. Vi håndterer skadesanmeldelse, dialog med selskabet og opfølgning. Vores opgave er at sikre at du får det du har krav på — hurtigere og uden at du skal forhandle alene.",
  },
  {
    q: "Kan jeg skifte fra min nuværende forsikringsløsning?",
    a: "Ja. Vi starter typisk med en uforpligtende gennemgang af dine nuværende policer og anbefaler først et skifte hvis der er reel værdi i det — enten på dækning, pris eller service.",
  },
  {
    q: "Hvor længe tager det at få en ny løsning på plads?",
    a: "Fra første møde til implementeret løsning tager det typisk 3-8 uger afhængigt af kompleksiteten i dit forsikringsprogram. Vi guider dig gennem hele processen.",
  },
];

export default function HvorforPage() {
  return (
    <>
      {/* HERO — text + vertical portrait that sticks while scrolling (mirrors /om-os) */}
      <section className="pt-24 sm:pt-28 md:pt-36 pb-16 sm:pb-20 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-7">
            <div className="eyebrow mb-5">Forsikringsmægler</div>
            <h1 className="display-xl mb-8">
              Hvad er en forsikringsmægler?
            </h1>
            <div className="space-y-6 text-[1.02rem] sm:text-[1.05rem] leading-[1.8] text-[color:var(--color-nordan-ink)]">
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
          <div className="md:col-span-5 md:sticky md:top-28">
            <figure className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
              <Image
                src="/images/nordan-12.jpg"
                alt="Nordan Risk Partners — forsikringsmægler i samtale"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </figure>
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
          <h2 className="display-lg mb-12">Svar på det der oftest kommer op</h2>
          <ul className="divide-y divide-[color:var(--color-nordan-line)] border-y border-[color:var(--color-nordan-line)]">
            {FAQ.map((f) => (
              <li key={f.q}>
                <details className="group py-5 cursor-pointer">
                  <summary className="flex items-start justify-between gap-6 list-none cursor-pointer">
                    <span className="display-sm">{f.q}</span>
                    <span aria-hidden className="shrink-0 mt-1 w-6 h-6 rounded-full bg-[color:var(--color-nordan-soft)] grid place-items-center text-[color:var(--color-nordan-ink)] text-sm transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{f.a}</p>
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
