import type { Metadata } from "next";
import Image from "next/image";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter, SITE_URL } from "@/lib/seo";

const APPLY_EMAIL = "mh@ndrp.dk";
const APPLY_MAILTO =
  "mailto:mh@ndrp.dk" +
  "?subject=" + encodeURIComponent("Ansøgning — Sælger / mødebooker") +
  "&body=" + encodeURIComponent(
    "Hej Mads,\n\nJeg vil gerne høre nærmere om stillingen som sælger / mødebooker.\n\nLidt om mig:\n\n\nMvh\n"
  );

const JOB_TITLE = "Sælger / mødebooker hos Nordan Risk Partners — provision, du sætter selv loftet";
const JOB_DESC =
  "Vi søger en provisionslønnet sælger til salg og mødebooking. Du sidder sammen med os i Allerød, ringer til danske virksomheder og booker møder til to erfarne forsikringsmæglere. Ingen øvre grænse på, hvad du kan tjene.";

export const metadata: Metadata = {
  title: JOB_TITLE,
  description: JOB_DESC,
  alternates: { canonical: "/job" },
  openGraph: pageOpenGraph({ title: JOB_TITLE, description: JOB_DESC, path: "/job" }),
  twitter: pageTwitter({ title: JOB_TITLE, description: JOB_DESC }),
};

// Same crew as /om-os — keep the bios short here, this page is about the job.
const TEAM = [
  {
    name: "Mads Horvitz Larsen",
    role: "Medstifter · Forsikringsmægler",
    note: "Mads tager imod ansøgningerne og er den, du kommer til at ringe sammen med til daglig. Han læser hver eneste ansøgning selv.",
    phone: "+45 31 33 49 36",
    phoneHref: "tel:+4531334936",
    email: "mh@ndrp.dk",
    image: "/images/team-mads.jpg",
  },
  {
    name: "Leo Julsgaard",
    role: "Medstifter · Forsikringsmægler",
    note: "Leo har 40+ år i branchen og har bygget et mæglerhus før. Det er møder til ham og Mads, du booker — og dem, du lærer faget af.",
    phone: "+45 53 52 00 06",
    phoneHref: "tel:+4553520006",
    email: "lj@ndrp.dk",
    image: "/images/team-leo.jpg",
  },
];

const JOB_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Forside", path: "/" },
      { name: "Job", path: "/job" },
    ]),
    {
      "@type": "JobPosting",
      "@id": `${SITE_URL}/job#jobposting`,
      title: "Sælger / mødebooker (provisionsløn)",
      description:
        "Provisionslønnet sælger til salg og mødebooking hos uafhængigt forsikringsmæglerhus i Allerød. Du ringer til danske virksomheder og booker møder til to erfarne forsikringsmæglere. Du sætter selv loftet for, hvad du kan tjene.",
      datePosted: "2026-06-30",
      validThrough: "2026-12-31",
      employmentType: ["FULL_TIME", "PART_TIME"],
      directApply: true,
      hiringOrganization: { "@id": `${SITE_URL}/#organization` },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Toftevej 15B",
          postalCode: "3450",
          addressLocality: "Allerød",
          addressCountry: "DK",
        },
      },
      industry: "Forsikringsmægling",
      employerOverview:
        "Nordan Risk Partners er et uafhængigt forsikringsmæglerhus med over 40 års samlet brancheerfaring. Vi rådgiver danske virksomheder om erhvervsforsikring.",
    },
  ],
};

export default function JobPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JOB_JSONLD) }}
      />

      {/* HERO — light editorial, text + a real photo from the office */}
      <section className="pt-24 sm:pt-28 md:pt-36 pb-14 sm:pb-20 md:pb-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div className="md:col-span-7">
            <div className="eyebrow mb-5">Ledig stilling · Allerød</div>
            <h1 className="display-page mb-7 pr-4">
              Vi mangler en, der er god til at få folk i røret — og booke mødet.
            </h1>
            <div className="prose-body">
              <p>
                Nordan Risk Partners er et lille, uafhængigt forsikringsmæglerhus i Allerød.
                Vi rådgiver danske virksomheder om deres erhvervsforsikringer, og vi har mere,
                vi kan nå, end vi selv kan ringe rundt til. Derfor søger vi en sælger.
              </p>
              <p>
                Helt konkret: du ringer til virksomheder og booker møder til Mads og Leo,
                som så tager den faglige snak. Du skal ikke kunne noget om forsikring fra dag
                ét — det lærer du hos os. Du skal være god til at have folk i røret og ikke gå
                i sort af et nej.
              </p>
              <p>
                Lønnen er provisionsbaseret, hvilket vil sige, at <strong>du selv bestemmer dit
                lønloft</strong> — der er ingen øvre grænse. Booker du mange møder, tjener du derefter.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#ansoeg" className="btn-primary">Send en ansøgning</a>
              <a href="tel:+4531334936" className="btn-outline">Ring til Mads</a>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <figure className="relative w-full aspect-[2/3] overflow-hidden rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <Image
                  src="/images/founders-vertical.jpg"
                  alt="Mads Horvitz Larsen og Leo Julsgaard — stifterne af Nordan Risk Partners"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  quality={95}
                />
              </figure>
              <figcaption className="mt-4 text-[0.82rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
                Mads &amp; Leo · Toftevej 15B, 3450 Allerød
              </figcaption>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FACTS strip */}
      <section className="border-y border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 py-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ["Løn", "Provisionsbaseret — intet loft"],
            ["Hvor", "På kontoret i Allerød"],
            ["Tid", "Fuldtid eller deltid"],
            ["Krav", "God i telefonen"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="eyebrow mb-1">{k}</div>
              <div className="display-sm">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DET ER JOBBET */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5">
            <div className="eyebrow mb-4">Det er jobbet</div>
            <h2 className="display-md mb-5">En dag på kontoret</h2>
            <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
              Det er ikke et manuskript, du skal læse op. Det er at ringe til en virksomhed,
              finde ud af om det giver mening for dem at få et gennemsyn af deres forsikringer,
              og få en aftale i kalenderen, hvis det gør.
            </p>
          </div>
          <div className="md:col-span-7">
            <ul className="check-list text-[1.02rem]">
              <li>Ringe til danske virksomheder — både nye emner og folk, der har vist interesse.</li>
              <li>Booke møder til Mads og Leo. Du åbner døren, de holder mødet.</li>
              <li>Holde styr på dine egne aftaler og opfølgninger i kalenderen.</li>
              <li>Sparre med os løbende — vi sidder lige ved siden af dig, ikke i en anden by.</li>
              <li>Blive klogere på erhvervsforsikring, så dine samtaler bliver skarpere måned for måned.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* DET FÅR DU + DET LEDER VI EFTER */}
      <section className="py-16 sm:py-20 md:py-24 bg-[color:var(--color-nordan-soft)]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <div className="eyebrow mb-4">Det får du</div>
            <h2 className="display-md mb-6">Hvad vi lægger på bordet</h2>
            <ul className="check-list text-[1.02rem]">
              <li><strong>Provision uden loft.</strong> Du sætter selv ambitionen — og bliver betalt derefter.</li>
              <li><strong>Oplæring fra folk med 40+ års erfaring.</strong> Du behøver ikke vide noget om forsikring i forvejen.</li>
              <li><strong>En fast plads på kontoret i Allerød</strong> sammen med os to — ikke hjemmefra, ikke et callcenter.</li>
              <li><strong>Korte beslutningsveje.</strong> Vi er et lille hus. Virker noget ikke, laver vi det om i morgen.</li>
              <li><strong>Et reelt produkt.</strong> Du booker møder om noget, virksomheder faktisk har brug for.</li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Det leder vi efter</div>
            <h2 className="display-md mb-6">Hvem passer ind</h2>
            <ul className="check-list text-[1.02rem]">
              <li>Du kan lide at tale med folk og bliver ikke slået ud af et nej.</li>
              <li>Du er vedholdende — du ringer det opkald mere, der gør forskellen.</li>
              <li>Du kan styre din egen dag uden at nogen står over skulderen på dig.</li>
              <li>Du taler ordentligt dansk i telefonen og lytter mere, end du presser.</li>
              <li>Erfaring med salg eller mødebooking er et plus — men gå-på-mod vejer tungere.</li>
            </ul>
            <p className="mt-6 text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
              Genkender du dig selv i halvdelen af det? Så skriv til os alligevel. Vi ansætter
              på personen, ikke på CV'et.
            </p>
          </div>
        </div>
      </section>

      {/* MØD HOLDET */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10">
          <div className="eyebrow mb-4">Dem du kommer til at sidde med</div>
          <h2 className="display-lg mb-4">Mads og Leo</h2>
          <p className="max-w-2xl text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-10 sm:mb-14">
            Der er ikke en HR-afdeling mellem dig og chefen. Det er de to her, du deler kontor med,
            sparrer med og booker møder til. Sådan ser de ud, så du ved, hvem der tager telefonen,
            når du ringer.
          </p>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-14">
            {TEAM.map((m) => (
              <article key={m.name} className="bg-white border border-[color:var(--color-nordan-line)] rounded-sm overflow-hidden">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={m.image}
                    alt={`${m.name} — ${m.role}, Nordan Risk Partners`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={95}
                  />
                </div>
                <div className="p-7 md:p-10">
                  <h3 className="display-md mb-1">{m.name}</h3>
                  <div className="eyebrow mb-5">{m.role}</div>
                  <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{m.note}</p>
                  <ul className="mt-6 space-y-1 text-[0.95rem]">
                    <li><a href={m.phoneHref} className="hover:text-[color:var(--color-nordan-accent)]">{m.phone}</a></li>
                    <li><a href={`mailto:${m.email}`} className="hover:text-[color:var(--color-nordan-accent)]">{m.email}</a></li>
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ANSØG */}
      <section id="ansoeg" className="py-16 sm:py-20 md:py-24 bg-[color:var(--color-nordan-dark)] text-white scroll-mt-24">
        <div className="mx-auto max-w-[820px] px-5 sm:px-6 md:px-10 text-center">
          <div className="eyebrow !text-[color:var(--color-nordan-accent-soft)] mb-4">Sådan søger du</div>
          <h2 className="display-lg mb-5">Lyder det som dig?</h2>
          <p className="text-white/85 leading-relaxed max-w-[640px] mx-auto">
            Du behøver ikke en fancy ansøgning. Send et par linjer om, hvem du er, og hvorfor det
            fanger dig — har du et CV eller en LinkedIn, så smid det med. Vi læser hver eneste mail
            selv og vender tilbage, uanset hvad.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={APPLY_MAILTO} className="btn-accent">Send ansøgning til {APPLY_EMAIL}</a>
            <a href="tel:+4531334936" className="btn-ghost-light">Ring til Mads · +45 31 33 49 36</a>
          </div>

          <p className="mt-7 text-white/65 text-[0.92rem] leading-relaxed">
            Skriv til <a href={`mailto:${APPLY_EMAIL}`} className="underline">{APPLY_EMAIL}</a> —
            eller ring til Mads, hvis du bare har et spørgsmål, før du sender noget.
          </p>
        </div>
      </section>
    </>
  );
}
