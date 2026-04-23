import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "../_components/PageHero";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Kontakt os",
  description:
    "Kontakt Nordan Risk Partners. Send en besked, ring +45 53 52 00 06 eller skriv til info@ndrp.dk. Vi svarer typisk inden for én hverdag.",
};

export default function KontaktPage() {
  return (
    <>
      <PageHero
        eyebrow="Kontakt os"
        title={<>Lad os tage en uforpligtende snak</>}
        body="Hos os er der ingen hurtige sælgere — vi er på jeres side af bordet. Skriv et par linjer om virksomheden, så ringer vi eller skriver tilbage hurtigt."
        image="/images/nordan-12.jpg"
      />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8 grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-7">
            <div className="eyebrow mb-4">Skriv til os</div>
            <h2 className="display-lg mb-8">Få et uforpligtende tjek</h2>
            <ContactForm />
          </div>

          <aside className="md:col-span-5 space-y-10">
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden">
              <Image src="/images/nordan-56.jpg" alt="Nordan Risk Partners kontor" fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" />
            </div>

            <div className="bg-[color:var(--color-nordan-soft)] p-7 rounded-sm">
              <div className="eyebrow mb-4">Kontaktoplysninger</div>
              <ul className="space-y-4 text-[0.98rem]">
                <InfoItem label="Telefon" value="+45 53 52 00 06" href="tel:+4553520006" />
                <InfoItem label="E-mail" value="info@ndrp.dk" href="mailto:info@ndrp.dk" />
                <InfoItem label="Adresse" value="Toftevej 15B, 3450 Allerød" />
                <InfoItem label="CVR" value="45953769" />
              </ul>
            </div>

            <div className="bg-white border border-[color:var(--color-nordan-line)] p-7 rounded-sm">
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
