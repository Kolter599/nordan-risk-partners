import type { Metadata } from "next";
import Link from "next/link";
import { ContactCta } from "../_components/ContactCta";
import { PageHero } from "../_components/PageHero";
import { Reveal } from "../_components/Reveal";
import { INSURANCE_PRODUCTS } from "@/lib/insurance-products";

export const metadata: Metadata = {
  title: "Erhvervsforsikring",
  description:
    "Uafhængig rådgivning om alle erhvervsforsikringer — fra ansvars- og arbejdsskade til transport, cyber og bestyrelsesansvar. Vi sammenligner markedet for dig.",
};

// Build the A-Å catalog from the CMS data + legacy labels we don't have pages for yet
type CatalogItem = { label: string; href?: string };
type Cat = { letter: string; items: CatalogItem[] };

const EXTRA_LABELS: { letter: string; label: string }[] = [
  { letter: "A", label: "Aflysningsforsikring" },
  { letter: "A", label: "Arrangørforsikring" },
  { letter: "A", label: "Ansvarsforsikring" },
  { letter: "B", label: "Boligselskabsforsikring" },
  { letter: "E", label: "Eventforsikring" },
  { letter: "E", label: "Ejendomsmæglerforsikring" },
  { letter: "E", label: "Ejendomsforsikring" },
  { letter: "F", label: "Fragtføreransvarsforsikring" },
  { letter: "F", label: "Flådeforsikring" },
  { letter: "I", label: "IT-kaskoforsikring" },
  { letter: "K", label: "Kunstnerforsikring" },
  { letter: "L", label: "Landbrugsforsikring" },
  { letter: "L", label: "Landboforsikring" },
  { letter: "L", label: "Lastbilforsikring" },
  { letter: "M", label: "Maskinkaskoforsikring" },
  { letter: "M", label: "Montørforsikring" },
  { letter: "P", label: "Projektansvarsforsikring" },
  { letter: "P", label: "Patientforsikring" },
  { letter: "S", label: "Speditøransvarsforsikring" },
  { letter: "S", label: "Sportsforsikring" },
  { letter: "T", label: "Terrorforsikring" },
  { letter: "Å", label: "Årsentrepriseforsikring" },
];

function buildCategories(): Cat[] {
  const map = new Map<string, CatalogItem[]>();

  for (const p of INSURANCE_PRODUCTS) {
    const items = map.get(p.letter) ?? [];
    items.push({ label: p.title, href: `/erhvervsforsikringer/${p.slug}` });
    map.set(p.letter, items);
  }
  for (const e of EXTRA_LABELS) {
    const items = map.get(e.letter) ?? [];
    items.push({ label: e.label });
    map.set(e.letter, items);
  }

  const out: Cat[] = [];
  const letters = Array.from(map.keys()).sort((a, b) => a.localeCompare(b, "da"));
  for (const letter of letters) {
    const items = (map.get(letter) ?? []).sort((a, b) => a.label.localeCompare(b.label, "da"));
    out.push({ letter, items });
  }
  return out;
}

const CATEGORIES = buildCategories();

export default function ErhvervsforsikringerPage() {
  return (
    <>
      <PageHero
        eyebrow="Erhvervsforsikring"
        title={<>Erhvervsforsikring med Nordan Risk Partners</>}
        body="Den rigtige forsikringsløsning er afgørende for at jeres virksomhed kan modstå uforudsete hændelser — brand, tyveri, driftstab, ansvar. Vi sikrer at jeres program faktisk dækker de risici I står overfor."
        image="/images/copenhagen.jpg"
      />

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[900px] px-6 md:px-10 prose-body">
          <p>
            Erhvervsforsikring er et komplekst område, hvor vilkår, lovkrav og dækningsmuligheder konstant udvikler sig. Det kræver specialiseret viden at sikre, at dækningen rammer de reelle risici — ikke bare skabelonrisici der står i en standardpolice.
          </p>
          <p>
            Som uafhængige forsikringsmæglere arbejder vi udelukkende for vores kunder. Vi sammensætter løsninger ud fra jeres specifikke risikobillede — ikke ud fra hvad der er nemmest at sælge.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/#analyse" className="btn-primary">Få gratis analyse</Link>
            <a href="tel:+4553520006" className="btn-outline">Ring +45 53 52 00 06</a>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-[1200px] px-6 md:px-10">
          <div className="max-w-2xl mb-12">
            <div className="eyebrow mb-4">Alle erhvervsforsikringer</div>
            <h2 className="display-lg">Fra A til Å</h2>
            <p className="mt-4 text-[color:var(--color-nordan-ink-soft)]">
              Et uddrag af de forsikringstyper vi rådgiver om. Står jeres branche ikke på listen? Ring eller skriv — vi dækker også dét.
            </p>
          </div>

          <div className="grid gap-10 md:gap-12 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.letter} delay={i * 30}>
                <div>
                  <div className="text-4xl font-light text-[color:var(--color-nordan-accent)] mb-3">{c.letter}</div>
                  <ul className="space-y-2">
                    {c.items.map((it) => (
                      <li key={it.label}>
                        {it.href ? (
                          <Link href={it.href} className="text-[color:var(--color-nordan-ink)] hover:text-[color:var(--color-nordan-accent)] underline-offset-4 hover:underline">
                            {it.label}
                          </Link>
                        ) : (
                          <span className="text-[color:var(--color-nordan-ink-soft)]">{it.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
