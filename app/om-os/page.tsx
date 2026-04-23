import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ContactCta } from "../_components/ContactCta";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Om os",
  description:
    "Nordan Risk Partners er etableret med ambitionen om målrettet, personlig og ærlig forsikringsrådgivning. Over 40 års samlet erfaring.",
};

const TEAM = [
  {
    name: "Mads Horvitz Larsen",
    role: "Medstifter · Forsikringsmægler og Adm. Direktør",
    bio: "Mads er medstifter af Nordan Risk Partners og har det overordnede ansvar for drift, kunder og strategi. Med mange års erfaring fra forsikringsbranchen samler Mads stor viden om strategisk risikostyring og sammensætning af forsikringsprogrammer. Han er optaget af at skabe langvarige relationer, hvor ærlighed, tilgængelighed og høj faglighed er fundamentet.",
    phone: "+45 31 33 49 36",
    phoneHref: "tel:+4531334936",
    email: "mh@ndrp.dk",
    linkedin: "https://www.linkedin.com/in/mads-horvitz-larsen-8718b91a6/",
    image: "/images/team-mads.jpg",
  },
  {
    name: "Leo Julsgaard",
    role: "Medstifter · Forsikringsmægler og Direktør",
    bio: "Leo er medstifter af Nordan Risk Partners og har mere end 40 års erfaring i forsikringsbranchen. Han har opbygget langvarige relationer med både små og store virksomheder og etablerede tidligere et succesfuldt mæglerhus. Leo er kendt for sin dybdegående faglighed, sit strategiske overblik og sin evne til at skabe rådgivning der bygger på tillid, ordentlighed og langsigtet værdi.",
    phone: "+45 53 52 00 06",
    phoneHref: "tel:+4553520006",
    email: "lj@ndrp.dk",
    linkedin: "https://www.linkedin.com/in/leo-julsgaard-a358a78/",
    image: "/images/nordan-73.jpg",
  },
];

export default function OmOsPage() {
  return (
    <>
      <PageHero
        eyebrow="Om os"
        title={<>„Vi tror på, at løsninger skabes i tæt samarbejde.”</>}
        body="Over 40 års samlet brancheerfaring. Flere kundeforhold der går tilbage mere end to årtier."
        image="/images/nordan-8.jpg"
      />

      {/* INTRO */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-5 md:px-8 prose-body">
          <p>
            Nordan Risk Partners er etableret med ambitionen om at tilbyde målrettet, personlig og ærlig forsikringsrådgivning. Med over 40 års samlet erfaring i branchen forener vi indsigt og tilgængelighed med et klart fokus: at skabe reel værdi for vores kunder — ikke bare her og nu, men på lang sigt.
          </p>
          <p>
            Vi tror på, at stærke relationer og tæt sparring er fundamentet for de bedste løsninger. Derfor er vi til stede hele vejen — fra analyse og rådgivning til løbende dialog og håndtering. Hos os møder du ikke skiftende kontaktpersoner, automatiserede systemer eller telefonsluser. Du får direkte adgang til erfarne rådgivere, der kender din forretning og tager ansvar for din dækning.
          </p>
          <p>
            I en branche præget af standardløsninger og afstand, har vi valgt en anden tilgang. Vi er engagerede i at forstå den enkelte virksomhed og rådgiver med afsæt i din virkelighed. Det betyder også, at vi er ærlige, hvis noget ikke giver mening — og tilgængelige, når behovet opstår.
          </p>
          <p>
            Flere af vores kunder gennem tiden har vi samarbejdet med i mere end to årtier. Det vidner om tillid, gensidighed og værdien af et partnerskab, der rækker ud over det formelle. Vores ambition er at være en langsigtet sparringspartner, der bidrager til din virksomheds tryghed og udvikling.
          </p>
          <p>
            Nordan Risk Partners er for dig, der ønsker kompetent rådgivning, tæt relation og en partner, der altid er til at få fat i.
          </p>
        </div>
      </section>

      {/* MISSION + VISION */}
      <section className="py-20 md:py-28 bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-6xl px-5 md:px-8 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <div className="eyebrow mb-4">Mission</div>
            <h2 className="display-md mb-5">
              At gøre professionel forsikringsrådgivning tilgængelig for alle — uanset virksomhedens størrelse.
            </h2>
            <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
              I en tid præget af stigende kompleksitet, mange udbydere og uklare vilkår, er det vigtigere end nogensinde med uvildig og personlig rådgivning. Vi tror på, at alle virksomheder — store som små — har krav på en rådgiver, der forstår deres behov, gennemskuer markedet og sikrer, at dækningen er rigtig og prisen rimelig.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-4">Vision</div>
            <h2 className="display-md mb-5">
              At sætte en ny standard for forsikringsmægling, hvor alle virksomheder har adgang til kompetent, uafhængig rådgivning.
            </h2>
            <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
              Vi ønsker at være med til at forme en fremtid, hvor forsikringsmægling ikke er forbeholdt de største virksomheder, men er en naturlig del af enhver virksomheds fundament — ligesom revisoren og advokaten. Vi vil være blandt dem, der viser vejen med faglighed, tilgængelighed og ordentlighed som bærende principper.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="eyebrow mb-4">Hvem er vi?</div>
          <h2 className="display-lg mb-14">Dine forsikringsmæglere</h2>
          <div className="grid md:grid-cols-2 gap-10 md:gap-14">
            {TEAM.map((m) => (
              <article key={m.name} className="bg-white border border-[color:var(--color-nordan-line)] rounded-sm overflow-hidden">
                <div className="relative aspect-[4/5]">
                  <Image src={m.image} alt={m.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <div className="p-7 md:p-10">
                  <h3 className="display-md mb-1">{m.name}</h3>
                  <div className="eyebrow mb-5">{m.role}</div>
                  <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{m.bio}</p>
                  <ul className="mt-6 space-y-1 text-[0.95rem]">
                    <li><a href={m.phoneHref} className="hover:text-[color:var(--color-nordan-accent)]">{m.phone}</a></li>
                    <li><a href={`mailto:${m.email}`} className="hover:text-[color:var(--color-nordan-accent)]">{m.email}</a></li>
                    <li><a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--color-nordan-accent)]">LinkedIn</a></li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/kontakt-os" className="btn-primary">Kontakt os</Link>
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
