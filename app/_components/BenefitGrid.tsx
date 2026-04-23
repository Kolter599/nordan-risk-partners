import { Reveal } from "./Reveal";

const BENEFITS = [
  {
    title: "Optimal dækning",
    body: "Vi sammensætter et forsikringsprogram der passer til netop din virksomheds risikoprofil – ikke en standardskabelon.",
    icon: "shield",
  },
  {
    title: "Skarp pris",
    body: "Vi forhandler på dine vegne og holder markedet op mod dine behov – så du aldrig betaler for mere end nødvendigt.",
    icon: "scale",
  },
  {
    title: "Tilgængelig service",
    body: "Ingen telefonsluser eller skiftende sagsbehandlere. Du har direkte adgang til din rådgiver — altid.",
    icon: "phone",
  },
  {
    title: "Risikoanalyse",
    body: "Vi går i dybden med din forretning for at kortlægge risici du måske ikke selv ser – før de bliver dyre.",
    icon: "magnify",
  },
  {
    title: "Proaktiv sparring",
    body: "Vi følger din virksomhed løbende og rådgiver ved ændringer i drift, strategi eller lovgivning.",
    icon: "compass",
  },
  {
    title: "Partner på lang sigt",
    body: "Flere af vores kunder har vi arbejdet med i over to årtier. Det er vores målestok for succes.",
    icon: "handshake",
  },
];

export function BenefitGrid() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl mb-14 md:mb-20">
          <div className="eyebrow mb-4">Hvorfor vælge Nordan Risk Partners?</div>
          <h2 className="display-lg">
            Seks ting vores kunder siger vi gør anderledes
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 60}>
              <article className="h-full flex flex-col gap-4 p-8 md:p-9 bg-white border border-[color:var(--color-nordan-line)] rounded-sm hover:border-[color:var(--color-nordan-accent)] transition-colors">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-dark)]">
                  <BenefitIcon name={b.icon} />
                </span>
                <h3 className="display-sm">{b.title}</h3>
                <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{b.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitIcon({ name }: { name: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "shield":
      return <svg {...common}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>;
    case "scale":
      return <svg {...common}><path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0l-3-7zm14 0l-3 7a4 4 0 0 0 6 0l-3-7zM4 21h16"/></svg>;
    case "phone":
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>;
    case "magnify":
      return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
    case "compass":
      return <svg {...common}><circle cx="12" cy="12" r="10"/><path d="m16 8-4 10-4-10 8-2z"/></svg>;
    case "handshake":
      return <svg {...common}><path d="M11 17 7 13l-3 3 4 4 3-3zm2 0 4-4 3 3-4 4-3-3zM8 8l4 4 4-4-4-4-4 4z"/></svg>;
    default:
      return null;
  }
}
