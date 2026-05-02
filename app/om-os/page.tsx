import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CvrCtaSection } from "../_components/CvrCtaSection";

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
    image: "/images/team-leo.jpg",
  },
];

export default function OmOsPage() {
  return (
    <>
      {/* HERO — text + full vertical founders portrait */}
      <section className="pt-12 sm:pt-16 md:pt-24 pb-16 sm:pb-20 md:pb-28">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-7">
            <div className="eyebrow mb-5">Om os</div>
            <h1 className="display-xl mb-8">
              „Vi tror på, at løsninger skabes i tæt samarbejde.”
            </h1>
            <p className="text-lg md:text-xl text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-10">
              Over 40 års samlet brancheerfaring. Flere kundeforhold der går tilbage mere end to årtier.
            </p>
            <div className="prose-body">
            <p>
              Nordan Risk Partners er etableret med ambitionen om at tilbyde målrettet, personlig og ærlig forsikringsrådgivning. Med over 40 års samlet erfaring forener vi indsigt og tilgængelighed med ét klart fokus: at skabe reel værdi for vores kunder.
            </p>
            <p>
              Vi tror på, at stærke relationer og tæt sparring er fundamentet for de bedste løsninger. Hos os møder du ikke skiftende kontaktpersoner, automatiserede systemer eller telefonsluser — du får direkte adgang til erfarne rådgivere, der kender din forretning.
            </p>
            <p className="hidden sm:block">
              I en branche præget af standardløsninger og afstand, har vi valgt en anden tilgang. Vi er engagerede i at forstå den enkelte virksomhed og rådgiver med afsæt i din virkelighed. Det betyder også, at vi er ærlige, hvis noget ikke giver mening.
            </p>
            <p>
              Flere af vores kunder har vi samarbejdet med i mere end to årtier. Det vidner om tillid og værdien af et partnerskab, der rækker ud over det formelle.
            </p>
            <p className="hidden sm:block">
              Nordan Risk Partners er for dig, der ønsker kompetent rådgivning, tæt relation og en partner, der altid er til at få fat i.
            </p>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <figure className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <Image
                  src="/images/founders-vertical.jpg"
                  alt="Leo Julsgaard og Mads Horvitz Larsen — stiftere af Nordan Risk Partners"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </figure>
              <figcaption className="mt-4 text-[0.82rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
                Leo Julsgaard &amp; Mads Horvitz Larsen · Stiftere
              </figcaption>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION + VISION */}
      <section className="py-16 sm:py-20 md:py-28 bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8 grid md:grid-cols-2 gap-10 md:gap-16">
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
      <section className="py-16 sm:py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8">
          <div className="eyebrow mb-4">Hvem er vi?</div>
          <h2 className="display-lg mb-10 sm:mb-14">Dine forsikringsmæglere</h2>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-14">
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

      <CvrCtaSection />
    </>
  );
}
