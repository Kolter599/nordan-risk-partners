import type { Metadata } from "next";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Persondatapolitik",
  description:
    "Hvilke personoplysninger Nordan Risk Partners indsamler, hvorfor, hvor længe de opbevares, og hvilke rettigheder du har.",
  alternates: { canonical: "/persondatapolitik" },
};

/** Opdateres manuelt når politikken ændres — vises nederst på siden. */
const LAST_UPDATED = "24. august 2026";

export default function PersondatapolitikPage() {
  return (
    <>
      <PageHero
        eyebrow="Persondata"
        title={<>Persondatapolitik</>}
        body="Hvad vi indsamler, hvorfor — og hvad du kan bede os om."
        image="/images/nordan-52.jpg"
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[780px] px-6 md:px-10 prose-body">
          <Section title="Dataansvarlig">
            <p>
              Nordan Risk Partners ApS er dataansvarlig for de personoplysninger, vi behandler om dig.
            </p>
            <p>
              Nordan Risk Partners ApS
              <br />
              Toftevej 15B, 3450 Allerød
              <br />
              CVR 45953769
              <br />
              <Mail /> · <a href="tel:+4553520006" className={LINK}>+45 53 52 00 06</a>
            </p>
          </Section>

          <Section title="Når du indtaster CVR og kontaktoplysninger">
            <p>
              Indtaster du CVR-nummer, navn, e-mail eller telefonnummer i en formular på sitet,
              giver du os samtidig <strong>lov til at kontakte dig pr. telefon eller mail</strong> om
              jeres forsikringsforhold. Det fremgår ved den knap, du trykker på, og det er den
              accept, vores opfølgning hviler på.
            </p>
            <p>
              Du kan til enhver tid tilbagekalde din accept ved at skrive til <Mail />. Vi stopper
              kontakten og sletter oplysningerne, medmindre vi er retligt forpligtet til at gemme dem
              (se “Hvor længe vi gemmer oplysningerne”).
            </p>
            <p>
              Dette er uafhængigt af dit cookie-valg. Afviser du statistik-cookies, kan du stadig
              sende en henvendelse — og vi kontakter dig stadig på den.
            </p>
          </Section>

          <Section title="Hvilke oplysninger vi behandler">
            <Table
              head={["Oplysning", "Hvornår", "Hvorfor"]}
              rows={[
                [
                  "CVR-nummer",
                  "Når du starter en analyse eller udfylder en formular",
                  "Opslag af offentligt tilgængelige virksomhedsdata i Det Centrale Virksomhedsregister (CVR)",
                ],
                [
                  "Navn, e-mail, telefonnummer",
                  "Når du beder om en analyse, et tilbud eller sender en besked",
                  "At kunne vende tilbage til dig om netop den henvendelse",
                ],
                [
                  "Virksomhedsnavn og oplysninger om jeres nuværende forsikringer",
                  "Når du udfylder analyse- eller tilbudsflowet",
                  "At kunne vurdere jeres forsikringsforhold og give et kvalificeret svar",
                ],
                [
                  "Tidspunkt, IP-adresse og browseroplysninger",
                  "Kun når du underskriver en undersøgelsesfuldmagt elektronisk",
                  "Dokumentation for underskriften, jf. eIDAS art. 25",
                ],
                [
                  "Anonym besøgsstatistik",
                  "Kun hvis du accepterer cookies",
                  "At forstå hvilke sider der er relevante, så vi kan forbedre indholdet",
                ],
              ]}
            />
            <p>
              Vi beder dig <strong>ikke</strong> om CPR-nummer, helbredsoplysninger eller andre
              følsomme personoplysninger via sitet. Send det aldrig i en formular eller almindelig
              e-mail.
            </p>
          </Section>

          <Section title="Retligt grundlag">
            <ul>
              <li>
                <strong>Databeskyttelsesforordningen art. 6, stk. 1, litra a</strong> — dit samtykke.
                Det er grundlaget for, at vi må kontakte dig pr. telefon eller mail, og for
                statistik-cookies. Begge dele kan trækkes tilbage når som helst — kontakten på{" "}
                <Mail />, cookies i banneret.
              </li>
              <li>
                <strong>Art. 6, stk. 1, litra b</strong> — behandlingen er nødvendig for at
                gennemføre foranstaltninger forud for en eventuel aftale. Det dækker selve den
                analyse eller det tilbud, du har sat i gang.
              </li>
              <li>
                <strong>Art. 6, stk. 1, litra f</strong> — vores legitime interesse i at dokumentere
                en afgivet fuldmagt.
              </li>
              <li>
                <strong>Art. 6, stk. 1, litra c</strong> — retlige forpligtelser, herunder bogførings-
                og hvidvasklovgivning, når et kundeforhold er etableret.
              </li>
            </ul>
          </Section>

          <Section title="Hvem vi deler oplysningerne med">
            <p>
              Vi <strong>videresælger eller udlejer aldrig</strong> dine oplysninger. Vi deler dem i
              to situationer:
            </p>
            <p>
              <strong>1. Forsikringsselskaber og assurandører</strong> — men kun når du har bedt os
              indhente tilbud, og kun i det omfang det er nødvendigt for opgaven. Har du underskrevet
              en undersøgelsesfuldmagt, sker det inden for fuldmagtens rammer.
            </p>
            <p>
              <strong>2. Databehandlere</strong> — leverandører der behandler oplysninger på vores
              vegne og efter vores instruks, under databehandleraftale:
            </p>
            <Table
              head={["Leverandør", "Rolle"]}
              rows={[
                ["Vercel Inc.", "Hosting af sitet og opbevaring af underskrevne dokumenter"],
                ["Neon Inc.", "Database med henvendelser og sagsforløb"],
                ["Resend (Plus Five Five, Inc.)", "Udsendelse af kvitteringer og e-mails til dig"],
                ["Google Ireland Ltd.", "Google Analytics — kun hvis du accepterer cookies"],
              ]}
            />
            <p>
              Enkelte af disse leverandører er etableret uden for EU/EØS. Overførsel sker på grundlag
              af EU-Kommissionens standardkontraktbestemmelser eller EU-US Data Privacy Framework.
            </p>
          </Section>

          <Section title="Hvor længe vi gemmer oplysningerne">
            <ul>
              <li>
                <strong>Henvendelser der ikke fører til et kundeforhold:</strong> slettes senest 12
                måneder efter sidste kontakt.
              </li>
              <li>
                <strong>Kundeforhold:</strong> opbevares mens forholdet består og som udgangspunkt i
                5 år derefter, jf. bogføringsloven og forældelsesreglerne.
              </li>
              <li>
                <strong>Underskrevne fuldmagter og tilhørende log:</strong> opbevares i 5 år som
                dokumentation.
              </li>
              <li>
                <strong>Besøgsstatistik:</strong> opbevares i op til 14 måneder i Google Analytics.
              </li>
            </ul>
          </Section>

          <Section title="Dine rettigheder">
            <p>Du har efter databeskyttelsesforordningen ret til at:</p>
            <ul>
              <li>få <strong>indsigt</strong> i hvilke oplysninger vi behandler om dig</li>
              <li>få <strong>rettet</strong> forkerte oplysninger</li>
              <li>få <strong>slettet</strong> oplysninger, når vi ikke længere har grundlag for at gemme dem</li>
              <li>få <strong>begrænset</strong> behandlingen i visse tilfælde</li>
              <li>
                <strong>gøre indsigelse</strong> mod behandling, der sker på grundlag af legitim
                interesse — herunder mod at blive kontaktet
              </li>
              <li>
                <strong>tilbagekalde et samtykke</strong>, uden at det påvirker lovligheden af
                behandlingen inden tilbagekaldelsen
              </li>
              <li>få <strong>udleveret</strong> dine oplysninger i et maskinlæsbart format (dataportabilitet)</li>
            </ul>
            <p>
              Skriv til <Mail />, så vender vi tilbage hurtigst muligt og senest inden for en måned.
            </p>
          </Section>

          <Section title="Klage">
            <p>
              Er du utilfreds med måden, vi behandler dine oplysninger på, hører vi gerne fra dig
              først på <Mail />. Du kan også klage til Datatilsynet, Carl Jacobsens Vej 35, 2500
              Valby —{" "}
              <a href="https://www.datatilsynet.dk" className={LINK} target="_blank" rel="noopener noreferrer">
                datatilsynet.dk
              </a>
              .
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Brugen af cookies er beskrevet særskilt i vores{" "}
              <a href="/cookies" className={LINK}>
                cookie- og privatlivspolitik
              </a>
              .
            </p>
          </Section>

          <p className="text-[0.85rem] text-[color:var(--color-nordan-muted)] mt-12 pt-6 border-t border-[color:var(--color-nordan-line)]">
            Senest opdateret {LAST_UPDATED}.
          </p>
        </div>
      </section>
    </>
  );
}

/* -------------------- byggeklodser -------------------- */

const LINK = "underline text-[color:var(--color-nordan-accent)]";

function Mail() {
  return (
    <a href="mailto:info@ndrp.dk" className={LINK}>
      info@ndrp.dk
    </a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[1.75rem] mt-10 mb-4 first:mt-0">
        {title}
      </h2>
      {children}
    </>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-left text-[0.9rem] border-collapse">
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                className="border-b-2 border-[color:var(--color-nordan-line)] pb-2 pr-4 align-bottom text-[0.72rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={`border-b border-[color:var(--color-nordan-line)] py-3 pr-4 align-top leading-snug ${
                    i === 0 ? "font-medium text-[color:var(--color-nordan-ink)]" : "text-[color:var(--color-nordan-ink-soft)]"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
