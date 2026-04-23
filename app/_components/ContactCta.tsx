import Link from "next/link";

type Props = {
  eyebrow?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  variant?: "light" | "dark";
};

const DEFAULT_BULLETS = [
  "Du får gennemsigtig og ærlig rådgivning helt fra start",
  "Vi analyserer dine behov og sammenligner med markedet",
  "Vores mål er bedre dækning, skarpe priser og færre overraskelser",
];

export function ContactCta({
  eyebrow = "Kontakt os",
  title = "Få et uforpligtende tjek af dine forsikringer",
  body = "Tænker du, at der måske er plads til forbedring i dine forsikringsaftaler? Så lad os tage første skridt – helt uforpligtende. Hos os får du ikke salgsretorik, men reel rådgivning med dine interesser i centrum.",
  bullets = DEFAULT_BULLETS,
  variant = "dark",
}: Props) {
  const isDark = variant === "dark";
  return (
    <section className={isDark ? "dark-section" : "bg-[color:var(--color-nordan-soft)]"}>
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <div className="md:col-span-7">
          <div className="eyebrow mb-5">{eyebrow}</div>
          <h2 className={`display-lg mb-6 ${isDark ? "text-white" : ""}`}>{title}</h2>
          <p className={`text-[1.0625rem] leading-relaxed ${isDark ? "text-white/85" : "text-[color:var(--color-nordan-ink-soft)]"}`}>
            {body}
          </p>
          <p className={`mt-4 text-[1.0625rem] leading-relaxed ${isDark ? "text-white/85" : "text-[color:var(--color-nordan-ink-soft)]"}`}>
            Vi er med dig — fra første møde og mange år frem.
          </p>
        </div>
        <div className="md:col-span-5">
          <ul className="space-y-4 mb-8">
            {bullets.map((b) => (
              <li key={b} className={`flex gap-3 items-start ${isDark ? "text-white" : "text-[color:var(--color-nordan-ink)]"}`}>
                <CheckIcon dark={isDark} />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Link href="/kontakt-os" className={isDark ? "btn-ghost-light" : "btn-primary"}>
              Få tjek gratis
            </Link>
            <a href="tel:+4553520006" className={isDark ? "btn-accent" : "btn-outline"}>
              Ring +45 53 52 00 06
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      className="mt-1 shrink-0"
      fill="none"
      stroke={dark ? "var(--color-nordan-accent-soft)" : "var(--color-nordan-accent)"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
