import type { Metadata } from "next";
import { ContactCta } from "../_components/ContactCta";
import { PageHero } from "../_components/PageHero";
import { Reveal } from "../_components/Reveal";

export const metadata: Metadata = {
  title: "Sådan arbejder vi",
  description:
    "Seks strukturerede trin fra indledende dialog til løbende rådgivning. Sådan sikrer vi en gennemtænkt forsikringsløsning til din virksomhed.",
};

const STEPS = [
  {
    n: "01",
    title: "Indledende dialog og forventningsafstemning",
    body: "Samarbejdet starter med en grundig dialog, hvor vi får indsigt i din virksomhed, dine aktiver, jeres branche og eventuelle eksisterende udfordringer. Vi spørger ind til både drift, strategi og ansvar — og forventningsafstemmer, hvad du ønsker at opnå gennem vores samarbejde.",
  },
  {
    n: "02",
    title: "Dataindsamling & analyse",
    body: "Vi indhenter og analyserer jeres nuværende forsikringsprogram med henblik på at skabe overblik over dækninger, vilkår og eventuelle specielle klausuler vi skal være opmærksomme på. På den måde er vi sikre på at få behovsafdækket jeres risiko, så vi kan udforme udbudsmaterialet nøjagtigt til selskaberne når de skal byde ind.",
  },
  {
    n: "03",
    title: "Udbudsanalyse",
    body: "På baggrund af analysen sammensætter vi et professionelt udbudsmateriale og definerer en målrettet strategi for dialogen med forsikringsmarkedet. Vi vælger nøje, hvilke selskaber der skal inviteres til at byde — baseret på dækningsevne, erfaring med lignende virksomheder og evne til at levere stabilitet og service.",
  },
  {
    n: "04",
    title: "Markedsdialog & forhandling",
    body: "Vi sender udbudsmaterialet ud til de respektive forsikringsselskaber og indhenter tilbud. Herefter går vi i forhandling med selskaberne hvis ikke de opfylder vores krav i udbudsmaterialet.",
  },
  {
    n: "05",
    title: "Tilbudssammenligning & anbefaling",
    body: "Når vi har modtaget og gennemgået tilbuddene, præsenterer vi dem i et struktureret og letforståeligt sammenligningsgrundlag. Vi rådgiver aktivt og ærligt omkring fordele, ulemper og anbefalinger — baseret på langt mere end pris alene.",
  },
  {
    n: "06",
    title: "Implementering og rådgivning",
    body: "Vi varetager al kontakt og koordinering i implementeringsfasen og sikrer, at policer oprettes korrekt og i overensstemmelse med det aftalte. Men samarbejdet stopper ikke der. Vi følger din virksomhed løbende, rådgiver ved ændringer i driften og sikrer, at dit forsikringsprogram hele tiden er opdateret.",
  },
];

export default function SaadanArbejderViPage() {
  return (
    <>
      <PageHero
        eyebrow="Vores proces"
        title={<>Sådan arbejder vi — trin for trin</>}
        body="Som uafhængige forsikringsmæglere arbejder vi ud fra en struktureret og veldokumenteret proces. Det sikrer at du som kunde får en gennemtænkt løsning der matcher netop din virksomheds behov."
        image="/images/unsplash-meeting.jpg"
      />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <div className="max-w-3xl mb-12">
            <div className="eyebrow mb-4">Seks trin</div>
            <h2 className="display-lg">Vi gør det enkelt</h2>
            <p className="mt-5 text-[color:var(--color-nordan-ink-soft)] leading-relaxed text-lg">
              Samme rådgiver gennem hele forløbet. Ingen telefonsluser. Direkte adgang — også når virkeligheden ændrer sig.
            </p>
          </div>

          <ol className="relative space-y-12 md:space-y-16">
            <span aria-hidden className="hidden md:block absolute left-[27px] top-3 bottom-3 w-px bg-[color:var(--color-nordan-line)]" />
            {STEPS.map((s, i) => (
              <Reveal key={s.n} as="li" delay={i * 50}>
                <div className="relative grid md:grid-cols-[56px_1fr] gap-6 md:gap-10 items-start">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[color:var(--color-nordan-dark)] text-white text-sm font-semibold tracking-[0.15em]">
                    {s.n}
                  </div>
                  <div className="pt-2">
                    <h3 className="display-md mb-3">{s.title}</h3>
                    <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <p className="mt-16 text-[color:var(--color-nordan-muted)] italic">
            Du har direkte adgang til os — uden om sluser, afdelinger og skiftende kontaktpersoner.
          </p>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
