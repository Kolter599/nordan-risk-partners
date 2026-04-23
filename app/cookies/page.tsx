import type { Metadata } from "next";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookie- og privatlivspolitik for nordanriskpartners.dk",
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
            Vi bruger udelukkende cookies til <strong>anonym besøgsstatistik via Google Analytics 4</strong>. Det hjælper os med at forstå hvilke sider der er relevante for vores besøgende, så vi kan forbedre indholdet løbende.
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
