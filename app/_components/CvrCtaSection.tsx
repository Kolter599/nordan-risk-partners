import { CvrLookup } from "./CvrLookup";

type Props = {
  eyebrow?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  cvrHeadline?: string;
  variant?: "light" | "soft";
};

const DEFAULT_BULLETS = [
  "Du får gennemsigtig og ærlig rådgivning helt fra start",
  "Vi analyserer dine behov og sammenligner med markedet",
  "Vores mål er bedre dækning, skarpe priser og færre overraskelser",
];

/**
 * Drop-in CTA section used at the bottom of informational pages.
 * Text on the left (kept for SEO + trust signals), CVR analyser on the right.
 * Replaces the old ContactCta button block across all non-contact pages.
 */
export function CvrCtaSection({
  eyebrow = "Kontakt os",
  title = "Få et uforpligtende tjek af dine forsikringer",
  body = "Tænker du, at der måske er plads til forbedring i dine forsikringsaftaler? Så lad os tage første skridt — helt uforpligtende. Hos os får du ikke salgsretorik, men reel rådgivning med dine interesser i centrum.",
  bullets = DEFAULT_BULLETS,
  cvrHeadline = "Indtast CVR — start jeres analyse",
  variant = "light",
}: Props) {
  const bg = variant === "soft" ? "bg-[color:var(--color-nordan-soft)]" : "bg-white";
  return (
    <section className={`py-14 sm:py-20 md:py-28 ${bg} border-t border-[color:var(--color-nordan-line)]`}>
      <div className="mx-auto max-w-[1200px] px-5 sm:px-6 md:px-10 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <div className="md:col-span-6">
          <div className="eyebrow mb-4">{eyebrow}</div>
          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.9rem,3.2vw,2.5rem)] leading-[1.15] mb-6">
            {title}
          </h2>
          <p className="text-[1.05rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.75] mb-8">
            {body}
          </p>
          <ul className="check-list mb-6">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="text-[0.98rem] italic text-[color:var(--color-nordan-ink-soft)]">
            Vi er med dig — fra første møde og mange år frem.
          </p>
        </div>
        <div className="md:col-span-6">
          <CvrLookup headline={cvrHeadline} />
        </div>
      </div>
    </section>
  );
}
