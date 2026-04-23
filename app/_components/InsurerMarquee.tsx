import Image from "next/image";

type Insurer = { name: string; src: string; w: number; h: number };

const INSURERS: Insurer[] = [
  { name: "Tryg", src: "/images/insurers/tryg.png", w: 220, h: 80 },
  { name: "Topdanmark", src: "/images/insurers/topdanmark.svg", w: 220, h: 80 },
  { name: "Alm. Brand", src: "/images/insurers/alm-brand.png", w: 220, h: 80 },
  { name: "Codan", src: "/images/insurers/codan.png", w: 220, h: 80 },
  { name: "If", src: "/images/insurers/if.png", w: 220, h: 80 },
  { name: "Gjensidige", src: "/images/insurers/gjensidige.png", w: 220, h: 80 },
  { name: "AIG", src: "/images/insurers/aig.png", w: 220, h: 80 },
  { name: "HDI", src: "/images/insurers/hdi.png", w: 220, h: 80 },
  { name: "Chubb", src: "/images/insurers/chubb.png", w: 220, h: 80 },
  { name: "Zurich", src: "/images/insurers/zurich.png", w: 220, h: 80 },
  { name: "Lloyd's", src: "/images/insurers/lloyds.png", w: 220, h: 80 },
  { name: "Allianz", src: "/images/insurers/allianz.png", w: 220, h: 80 },
  { name: "AXA", src: "/images/insurers/axa.png", w: 220, h: 80 },
  { name: "QBE", src: "/images/insurers/qbe.png", w: 220, h: 80 },
  { name: "LB Forsikring", src: "/images/insurers/lb.svg", w: 220, h: 80 },
];

export function InsurerMarquee() {
  const items = [...INSURERS, ...INSURERS];
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white border-y border-[color:var(--color-nordan-line)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8 mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="eyebrow mb-3">Selskaber vi forhandler med</div>
          <h2 className="display-md max-w-xl">
            Over 25 forsikringsselskaber — vi finder dem der passer til din virksomhed
          </h2>
        </div>
        <p className="text-sm text-[color:var(--color-nordan-muted)] max-w-sm leading-relaxed">
          Som uafhængige forsikringsmæglere har vi ingen bundne aftaler. Vi forhandler på dine vegne med et bredt udsnit af det danske og internationale marked.
        </p>
      </div>

      <div className="marquee-pause relative">
        <div className="marquee-track gap-14 md:gap-20 px-5 md:px-8 items-center">
          {items.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 flex items-center justify-center h-14 sm:h-16 md:h-20 w-[140px] sm:w-[180px] md:w-[220px] opacity-70 hover:opacity-100 transition-opacity"
              title={logo.name}
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.w}
                height={logo.h}
                className="max-h-12 md:max-h-14 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
