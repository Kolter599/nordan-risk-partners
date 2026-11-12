import type { FactSection as FactSectionData } from "@/lib/insurance-products";
import { Reveal } from "./Reveal";

/**
 * Tekst-tunge sektioner uden billede, til produktsider:
 * - "audience":   hvem har brug for den — punkter som en tjekliste i to kolonner
 * - "facts":      faktaboks — kort med label + forklaring på en blød baggrund
 * - "exclusions": hvad dækkes ikke — afgrænset boks med ✕-markører
 */
export function FactSection({ section }: { section: FactSectionData }) {
  const { variant, eyebrow, title, body, items, note } = section;
  const soft = variant === "facts";

  return (
    <section className={`py-12 sm:py-16 md:py-20 ${soft ? "bg-[color:var(--color-nordan-soft)]" : "bg-white"}`}>
      <div className="mx-auto max-w-[1000px] px-5 sm:px-6 md:px-10">
        <div className="max-w-[720px] mb-8 md:mb-10">
          {eyebrow ? <div className="eyebrow mb-4">{eyebrow}</div> : null}
          <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.6rem,2.6vw,2.1rem)] leading-[1.2] mb-4">
            {title}
          </h2>
          {body ? <p className="text-[1.02rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.75]">{body}</p> : null}
        </div>

        {variant === "audience" ? (
          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
            {items.map((it) => (
              <li key={it.label} className="flex gap-3 py-2 border-b border-[color:var(--color-nordan-line)]">
                <span className="text-[color:var(--color-nordan-accent)] font-semibold" aria-hidden>
                  ✓
                </span>
                <span className="text-[color:var(--color-nordan-ink)]">{it.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {variant === "facts" ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((it, i) => (
              <Reveal key={it.label} delay={i * 50}>
                <div className="h-full bg-white rounded-[8px] border border-[color:var(--color-nordan-line)] p-5 md:p-6">
                  <div className="font-semibold text-[color:var(--color-nordan-ink)] mb-2">{it.label}</div>
                  {it.body ? <p className="text-[0.95rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.65]">{it.body}</p> : null}
                </div>
              </Reveal>
            ))}
          </div>
        ) : null}

        {variant === "exclusions" ? (
          <div className="rounded-[8px] border border-[color:var(--color-nordan-line)] p-5 md:p-7">
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.label} className="flex gap-3">
                  <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[color:var(--color-nordan-soft)] grid place-items-center text-[0.7rem] text-[color:var(--color-nordan-muted)]" aria-hidden>
                    ✕
                  </span>
                  <span className="text-[color:var(--color-nordan-ink-soft)] leading-[1.6]">
                    {it.label}
                    {it.body ? <span className="text-[color:var(--color-nordan-muted)]"> — {it.body}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {note ? <p className="mt-6 text-[0.95rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.7] max-w-[720px]">{note}</p> : null}
      </div>
    </section>
  );
}
