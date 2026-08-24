import type { Metadata } from "next";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookie- og privatlivspolitik for nordanriskpartners.dk",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Cookies"
        title={<>Cookie- og privatlivspolitik</>}
        body="Hvordan vi bruger cookies — kort og ærligt."
        image="/images/nordan-52.jpg"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[780px] px-6 md:px-10 prose-body">
          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[1.75rem] mb-4">Hvad vi bruger cookies til</h2>
          <p>
            Vi bruger udelukkende cookies til <strong>anonym besøgsstatistik</strong>. Det hjælper os med at forstå hvilke sider der er relevante for vores besøgende, så vi kan forbedre indholdet løbende.
          </p>
          <p>
            Vi anvender <strong>ikke</strong> cookies til:
          </p>
          <ul>
            <li>Annoncering eller retargeting</li>
            <li>Deling med sociale medier</li>
            <li>Tredjepartsporing af din adfærd på andre sider</li>
          </ul>

          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[1.75rem] mt-10 mb-4">Dit valg</h2>
          <p>
            Du kan til enhver tid acceptere eller afvise cookies i banneret nederst på siden. Vælger du at afvise, indsamler vi ingen besøgsdata.
          </p>

          <h2
            id="henvendelser"
            className="font-[family-name:var(--font-playfair)] font-medium text-[1.75rem] mt-10 mb-4 scroll-mt-28"
          >
            Når du indtaster CVR og kontaktoplysninger
          </h2>
          <p>
            Indtaster du CVR-nummer, navn, e-mail eller telefonnummer i en af formularerne på sitet,
            betragter vi det som en <strong>anmodning om at blive kontaktet</strong>. Vi vender
            tilbage pr. telefon eller mail om jeres forsikringsforhold — det er hele formålet med
            formularen.
          </p>
          <p>Konkret betyder det:</p>
          <ul>
            <li>
              Vi bruger CVR til at hente offentligt tilgængelige virksomhedsdata fra Det Centrale
              Virksomhedsregister.
            </li>
            <li>
              Vi bruger navn, e-mail og telefonnummer til at kontakte jer om den analyse eller det
              tilbud, I har bedt om — ikke til andet.
            </li>
            <li>
              Vi videresælger eller udlejer <strong>ikke</strong> oplysningerne til tredjepart.
            </li>
            <li>
              Du kan til enhver tid tilbagekalde din accept og få oplysningerne slettet ved at
              skrive til{" "}
              <a href="mailto:info@ndrp.dk" className="underline text-[color:var(--color-nordan-accent)]">
                info@ndrp.dk
              </a>
              .
            </li>
          </ul>
          <p>
            Dette er uafhængigt af dit cookie-valg ovenfor. Afviser du statistik-cookies, kan du
            stadig sende en henvendelse — og vi kontakter dig stadig på den.{" "}
            <a href="/persondatapolitik" className="underline text-[color:var(--color-nordan-accent)]">
              Se den fulde persondatapolitik
            </a>
            .
          </p>

          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[1.75rem] mt-10 mb-4">Kontakt</h2>
          <p>
            Spørgsmål til persondatabehandling kan rettes til{" "}
            <a href="mailto:info@ndrp.dk" className="underline text-[color:var(--color-nordan-accent)]">info@ndrp.dk</a>.
          </p>
        </div>
      </section>
    </>
  );
}
