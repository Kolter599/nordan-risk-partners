type Testimonial = {
  quote: string;
  name: string;
  title: string;
  company: string;
};

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Nordan+Risk+Partners+Anmeldelser&stick=H4sIAAAAAAAAAONgkxIxNLU0MDM1trQwMTWwMDWysDAwMdnAyPiKUcEvvyglMU8hKLM4WyEgsagkL7WoWMExLzc1JyU1pzi1aBErQSUANtM5-2EAAAA&rldimm=15906539845085288044#lkt=LocalPoiReviews";

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Vi laver video- og reklameproduktion, og vi havde brug for en mægler der forstod vores branche. Nordan tog sig tid til at forstå hvad vi lever af — og det gjorde hele forskellen.",
    name: "Sebastian Kolter",
    title: "Direktør",
    company: "Invisu ApS",
  },
  {
    quote:
      "Nordan sparede os både på præmien og på mæglerhonoraret. Og de fik en besigtigelse af vores fredede ejendom i hus — noget andre havde forsøgt uden held.",
    name: "Peter Amdrup",
    title: "Direktør",
    company: "Skindhuset A/S",
  },
  {
    quote:
      "Vi har kendt Nordan i mange år og ved præcis hvad de står for. De holder alle vores lokationer opdateret — og har udvidet programmet med dækninger vi faktisk manglede.",
    name: "Jacob Vestergaard",
    title: "Direktør",
    company: "Henning Vestergaard & Søn",
  },
  {
    quote:
      "Vi havde samarbejdet før, så jeg ringede dagen efter de startede Nordan Risk Partners. Der var ingen tvivl om at de også skulle tage sig af os fremover.",
    name: "Jacob Nørregård",
    title: "Direktør",
    company: "Estaldo",
  },
];

type Variant = "light" | "soft" | "dark";

export function TestimonialMarquee({
  eyebrow = "Kundeanmeldelser",
  title = "Det siger vores kunder",
  variant = "soft",
}: {
  eyebrow?: string;
  title?: string;
  variant?: Variant;
}) {
  // Repeat enough times so the track stays wider than any viewport — prevents visible dead gap at loop boundary
  const items = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  const sectionBg = {
    light: "bg-white",
    soft: "bg-[color:var(--color-nordan-soft)]",
    dark: "bg-[color:var(--color-nordan-dark)] text-white",
  }[variant];

  // Cards always use beige (nordan-soft) background with dark text for maximum legibility
  const cardBg = "bg-[color:var(--color-nordan-soft)] border-transparent text-[color:var(--color-nordan-ink)]";
  const fadeFrom = variant === "light" ? "from-white" : variant === "soft" ? "from-[color:var(--color-nordan-soft)]" : "from-[color:var(--color-nordan-dark)]";
  const fadeTo = variant === "light" ? "to-white" : variant === "soft" ? "to-[color:var(--color-nordan-soft)]" : "to-[color:var(--color-nordan-dark)]";
  const eyebrowColor = variant === "dark" ? "!text-[color:var(--color-nordan-accent-soft)]" : "";
  const titleColor = variant === "dark" ? "text-white" : "";
  const bodyColor = "text-[color:var(--color-nordan-ink-soft)]";
  const nameColor = "text-[color:var(--color-nordan-ink)]";
  const roleColor = "text-[color:var(--color-nordan-muted)]";

  return (
    <section className={`py-12 sm:py-16 md:py-20 border-y border-[color:var(--color-nordan-line)] overflow-hidden ${sectionBg}`}>
      <div className="mx-auto max-w-7xl px-5 md:px-8 mb-8 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-5 md:gap-6">
        <div>
          <div className={`eyebrow mb-3 ${eyebrowColor}`}>{eyebrow}</div>
          <h2 className={`font-[family-name:var(--font-playfair)] font-normal text-[clamp(1.8rem,3.2vw,2.6rem)] leading-[1.15] max-w-[18ch] ${titleColor}`}>
            {title}
          </h2>
        </div>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`group inline-flex items-center gap-3 text-[0.88rem] shrink-0 ${
            variant === "dark" ? "text-white" : "text-[color:var(--color-nordan-ink)]"
          }`}
        >
          <GoogleGIcon />
          <span className="flex flex-col leading-tight">
            <span className="flex items-center gap-1.5">
              <Stars size={14} />
              <span className="font-semibold">5,0</span>
            </span>
            <span className={`text-[0.74rem] ${variant === "dark" ? "text-white/70" : "text-[color:var(--color-nordan-muted)]"}`}>
              Verificeret på Google — <span className="underline group-hover:no-underline">se alle anmeldelser</span>
            </span>
          </span>
        </a>
      </div>

      <div className="marquee-pause marquee-slow relative">
        <div className="marquee-track gap-6 md:gap-8 px-5 md:px-8">
          {items.map((t, i) => (
            <article
              key={`${t.company}-${i}`}
              className={`shrink-0 w-[280px] sm:w-[320px] md:w-[420px] border rounded-[8px] p-6 sm:p-7 md:p-8 flex flex-col ${cardBg}`}
            >
              <span className="inline-flex mb-4 text-[color:var(--color-nordan-accent)]/60" aria-hidden>
                <QuoteIcon />
              </span>
              <p className={`flex-1 text-[0.98rem] md:text-[1.02rem] leading-[1.65] ${bodyColor}`}>
                “{t.quote}”
              </p>
              <div className="mt-6 pt-5 border-t border-[color:var(--color-nordan-line)]">
                <div className={`font-[family-name:var(--font-inter)] font-semibold text-[1rem] ${nameColor}`}>
                  {t.name}
                </div>
                <div className={`text-[0.78rem] uppercase tracking-[0.15em] mt-1 ${roleColor}`}>
                  {t.title} · {t.company}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r ${fadeFrom} to-transparent`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l ${fadeTo} to-transparent`} />
      </div>
    </section>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden>
      <path d="M9.5 6C6.5 6 4 8.5 4 11.5v6.5h6v-6H6.5a3 3 0 0 1 3-3V6zm10 0c-3 0-5.5 2.5-5.5 5.5v6.5h6v-6h-3.5a3 3 0 0 1 3-3V6z" />
    </svg>
  );
}

function Stars({ size = 16 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label="5 ud af 5 stjerner">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} fill="#F4B400" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

function GoogleGIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
