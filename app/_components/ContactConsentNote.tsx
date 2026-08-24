type Variant = "micro" | "full";

type Props = {
  /** "micro" = én linje til trange CTA-kort. "full" = fuld formulering til rigtige formularer. */
  variant?: Variant;
  /** Verbet der beskriver handlingen — matcher knappen ("sende", "fortsætte", "underskrive"). */
  action?: string;
  className?: string;
};

const POLICY_HREF = "/cookies#henvendelser";

/**
 * Oplysning ved indsamling af CVR og kontaktoplysninger.
 *
 * Brugeren beder os ikke om at ringe — de trykker "start analyse". Det de
 * giver, er en tilladelse til at kontakte dem. Teksten siger derfor "giver du
 * os lov til", ikke "beder du os om": det er accepten, der skal være tydelig,
 * fordi det er den, opkaldet hviler på.
 *
 * Hører hjemme ved formularen og IKKE i cookie-banneret: cookie-samtykket
 * dækker statistik-cookies, og et "Afvis" dér må ikke kunne læses som et nej
 * til at blive ringet op.
 */
export function ContactConsentNote({
  variant = "full",
  action = "sende",
  className = "",
}: Props) {
  const base = "text-[color:var(--color-nordan-muted)] leading-snug";

  if (variant === "micro") {
    return (
      <p className={`text-[0.7rem] ${base} ${className}`}>
        * Ved at {action} giver du os lov til at kontakte jer pr. telefon eller mail
        om jeres forsikringsforhold.{" "}
        <a href={POLICY_HREF} className="underline hover:text-[color:var(--color-nordan-ink-soft)]">
          Sådan behandler vi oplysningerne
        </a>
        .
      </p>
    );
  }

  return (
    <p className={`text-[0.75rem] ${base} ${className}`}>
      * Ved at {action} giver du Nordan Risk Partners lov til at kontakte dig —
      pr. telefon eller mail — om jeres forsikringsforhold. Vi bruger kun CVR og
      kontaktoplysninger til det formål, og du kan til enhver tid tilbagekalde
      din accept på{" "}
      <a href="mailto:info@ndrp.dk" className="underline hover:text-[color:var(--color-nordan-ink-soft)]">
        info@ndrp.dk
      </a>
      .{" "}
      <a href={POLICY_HREF} className="underline hover:text-[color:var(--color-nordan-ink-soft)]">
        Læs mere
      </a>
      .
    </p>
  );
}
