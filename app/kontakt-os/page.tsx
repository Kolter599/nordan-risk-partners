import type { Metadata } from "next";
import Image from "next/image";
import { CvrCapture } from "../_components/CvrCapture";
import { PageHero } from "../_components/PageHero";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt os",
  description:
    "Kontakt Nordan Risk Partners. Start din gratis analyse via CVR, send en besked, ring +45 53 52 00 06 eller skriv til info@ndrp.dk.",
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt os"
        title={<>Lad os tage en uforpligtende snak</>}
        body="Vælg selv hvordan. Start analysen via CVR — eller skriv til os direkte. Ingen salgsretorik, ingen telefonsluser."
        image="/images/nordan-12.jpg"
      />

      {/* CVR ANALYSE FØRST — den hurtigste vej */}
      <section className="py-20 md:py-28 bg-[color:var(--color-nordan-soft)] border-b border-[color:var(--color-nordan-line)]">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-6">
            <div className="eyebrow mb-4">Hurtigste vej</div>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.9rem,3.2vw,2.5rem)] leading-[1.15] mb-6">
              Start jeres gratis analyse
            </h2>
            <p className="text-[1.05rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.75] mb-6">
              Indtast jeres CVR og vi begynder med det samme. Tre minutter af jeres tid — vi tager resten.
            </p>
            <ul className="check-list">
              <li>Vi henter virksomhedsdata automatisk</li>
              <li>I vælger om vi signerer fuldmagt digitalt eller via PDF</li>
              <li>Upload eksisterende policer (valgfrit)</li>
              <li>Forsikringsmægler ringer inden for én hverdag</li>
            </ul>
          </div>
          <div className="md:col-span-6">
            <CvrCapture headline="Indtast CVR — start jeres analyse" />
          </div>
        </div>
      </section>

      {/* FORMULAR + KONTAKTINFO */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-7">
            <div className="eyebrow mb-4">Foretrækker du en formular?</div>
            <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.9rem,3.2vw,2.5rem)] leading-[1.15] mb-3">
              Skriv et par linjer — vi vender tilbage
            </h2>
            <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-8 max-w-xl">
              Udfyld formularen hvis du hellere vil skrive hvad det drejer sig om end at indtaste CVR. Vi læser alt selv og vender tilbage inden for én hverdag.
            </p>
            <ContactForm />
          </div>

          <aside className="md:col-span-5 space-y-8">
            <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden">
              <Image src="/images/nordan-56.jpg" alt="Nordan Risk Partners kontor" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" quality={95} />
            </div>

            <div className="bg-[color:var(--color-nordan-soft)] p-7 rounded-[8px]">
              <div className="eyebrow mb-4">Kontaktoplysninger</div>
              <ul className="space-y-4 text-[0.98rem]">
                <InfoItem label="Telefon" value="+45 53 52 00 06" href="tel:+4553520006" />
                <InfoItem label="E-mail" value="info@ndrp.dk" href="mailto:info@ndrp.dk" />
                <InfoItem label="Adresse" value="Toftevej 15B, 3450 Allerød" />
                <InfoItem label="CVR" value="45953769" />
              </ul>
            </div>

            <div className="bg-white border border-[color:var(--color-nordan-line)] p-7 rounded-[8px]">
              <div className="eyebrow mb-4">Åbningstider</div>
              <ul className="space-y-1 text-[0.98rem] text-[color:var(--color-nordan-ink-soft)]">
                <li>Mandag – torsdag: 08:30 – 16:00</li>
                <li>Fredag: 08:30 – 15:00</li>
              </ul>
            </div>

            <div className="text-sm text-[color:var(--color-nordan-muted)] leading-relaxed">
              <div className="eyebrow mb-2">Klager</div>
              <p>
                Send klagens omstændigheder til klageansvarlige Mads Horvitz Larsen:{" "}
                <a href="mailto:mh@ndrp.dk?subject=Klage" className="underline">mh@ndrp.dk</a>.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function InfoItem({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <li>
      <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-nordan-muted)] mb-1">{label}</div>
      {href ? (
        <a href={href} className="font-medium hover:text-[color:var(--color-nordan-accent)]">{value}</a>
      ) : (
        <div className="font-medium">{value}</div>
      )}
    </li>
  );
}
