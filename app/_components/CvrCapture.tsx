"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { track } from "./GoogleAnalytics";
import { getRecentSigned, clearRecentSigned, type RecentSigned } from "@/lib/recent-signed";
import { ContactConsentNote } from "./ContactConsentNote";

type Props = {
  headline?: string;
  subline?: string;
  variant?: "card" | "inline";
  /** Where to send the visitor after a valid CVR. Defaults to the standard analyse flow. */
  redirectPath?: string;
  ctaLabel?: string;
  /** When true, swap the CVR card for a personalized "we're working on it"
   *  state if the user just finished a sign flow. */
  showRecentSigned?: boolean;
};

/**
 * Single-step CVR capture used everywhere on the marketing site.
 * Validates 8 digits, then opens the focused sign-flow at /start (which
 * runs without Nav/Footer and locks body scroll) in a new tab.
 *
 * Hole-in-one and other product-specific paths still get their own
 * redirectPath via the prop and stay on the same domain.
 */
export function CvrCapture({
  headline = "Indtast CVR — start jeres analyse",
  subline = "Vi henter automatisk virksomhedsdata og foreslår de næste skridt.",
  variant = "card",
  redirectPath = "/start",
  ctaLabel = "Start analyse",
  showRecentSigned = false,
}: Props) {
  const router = useRouter();
  const [cvr, setCvr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentSigned, setRecentSigned] = useState<RecentSigned | null>(null);
  const typedOnce = useRef(false);

  const digits = cvr.replace(/\D/g, "").slice(0, 8);
  const isComplete = digits.length === 8;

  useEffect(() => {
    if (!showRecentSigned) return;
    setRecentSigned(getRecentSigned());
  }, [showRecentSigned]);

  useEffect(() => {
    if (!typedOnce.current && digits.length > 0) {
      typedOnce.current = true;
      track("cvr_started", {
        source_page: typeof window !== "undefined" ? window.location.pathname : "",
      });
    }
  }, [digits]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || submitting) return;
    setSubmitting(true);
    track("cvr_submitted", { cvr: digits, redirect_path: redirectPath });
    const sep = redirectPath.includes("?") ? "&" : "?";
    router.push(`${redirectPath}${sep}cvr=${digits}`);
  }

  if (variant === "inline") {
    return (
      <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
        <input
          aria-label="CVR-nummer"
          value={digits}
          onChange={(e) => setCvr(e.target.value)}
          required
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          pattern="[0-9]{8}"
          placeholder="12 34 56 78"
          className="flex-1 h-12 px-4 bg-white border-2 border-[color:var(--color-nordan-line)] rounded-[6px] focus:outline-none focus:border-[color:var(--color-nordan-accent)] text-[1rem] font-[family-name:var(--font-inter)] font-semibold tracking-[0.12em] text-[color:var(--color-nordan-ink)] placeholder:text-[color:var(--color-nordan-muted)]/50"
        />
        <button
          type="submit"
          disabled={!isComplete || submitting}
          className="h-12 px-6 inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.9rem] font-semibold tracking-wide rounded-[6px] hover:bg-[#8f715f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <span>{ctaLabel}</span>
          <span aria-hidden>→</span>
        </button>
      </form>
        <ContactConsentNote variant="micro" action="fortsætte" className="mt-2" />
      </div>
    );
  }

  // Personalized post-submit state — only shown on the homepage. Copy
  // varies by which flow the user just finished (analyse vs hole-in-one).
  if (recentSigned) {
    const isHoleInOne = recentSigned.kind === "hole_in_one";
    const headlineLabel = isHoleInOne ? "Bestilling modtaget" : "Modtaget";
    const bodyTitle = isHoleInOne
      ? "Vi er i gang med dit hole-in-one tilbud"
      : "Vi er i gang med at indhente jeres oplysninger";
    const bodyText = isHoleInOne
      ? "Tjek din indbakke for kvitteringen — vi vender tilbage med et skarpt tilbud inden for én hverdag."
      : "Tjek din indbakke for kvitteringen — har I jeres policer ved hånden, så send dem som svar på den mail. Det hjælper os med at gå hurtigere i gang.";
    return (
      <div className="bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)]">
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white">
          <div className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)] mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            {headlineLabel}
          </div>
          <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
            Tak {recentSigned.companyName}
          </div>
        </div>
        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 inline-flex w-9 h-9 rounded-full bg-[color:var(--color-nordan-accent)]/15 text-[color:var(--color-nordan-accent)] items-center justify-center mt-0.5">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-[1rem] text-[color:var(--color-nordan-ink)] mb-0.5">
                {bodyTitle}
              </div>
              <p className="text-[0.88rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
                {bodyText}
              </p>
            </div>
          </div>
          <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] flex items-center justify-between pt-2 border-t border-[color:var(--color-nordan-line)]">
            <span>CVR {recentSigned.cvr}</span>
            <button
              type="button"
              onClick={() => {
                clearRecentSigned();
                setRecentSigned(null);
              }}
              className="underline hover:text-[color:var(--color-nordan-ink)]"
            >
              Start ny analyse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)]">
      {/* HEADER */}
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            Gratis analyse
          </div>
          <span className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
            <SparkleIcon />
            AI-drevet
          </span>
        </div>
        <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
          {headline}
        </div>
      </div>

      {/* BODY */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-4">
        <p className="text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
          {subline}
        </p>

        <label htmlFor="cvr-input" className="block">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-muted)]">
              CVR-nummer
            </span>
            <span
              className={`text-[0.72rem] font-mono ${
                isComplete ? "text-[color:var(--color-nordan-dark)]" : "text-[color:var(--color-nordan-muted)]"
              }`}
            >
              {digits.length}/8
            </span>
          </div>
          <input
            id="cvr-input"
            value={digits}
            onChange={(e) => setCvr(e.target.value)}
            required
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            pattern="[0-9]{8}"
            placeholder="12 34 56 78"
            className="w-full h-[64px] sm:h-[68px] px-4 sm:px-5 bg-[color:var(--color-nordan-soft)] border-2 border-transparent rounded-[8px] focus:outline-none focus:border-[color:var(--color-nordan-accent)] focus:bg-white text-[1.5rem] sm:text-[1.75rem] font-[family-name:var(--font-inter)] font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-[color:var(--color-nordan-ink)] placeholder:text-[color:var(--color-nordan-muted)]/50 placeholder:tracking-[0.1em] transition-colors"
          />
        </label>

        <button
          type="submit"
          disabled={!isComplete || submitting}
          className="group w-full h-[58px] inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.95rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] disabled:bg-[color:var(--color-nordan-accent-soft)] disabled:hover:bg-[color:var(--color-nordan-accent-soft)] disabled:cursor-not-allowed transition-all"
        >
          <span>{ctaLabel}</span>
          <span className="transition-transform group-hover:translate-x-1" aria-hidden>
            →
          </span>
        </button>

        <div className="flex items-center justify-center gap-4 pt-1 text-[0.72rem] text-[color:var(--color-nordan-muted)]">
          <TrustBadge icon="lock" label="Ingen binding" />
          <TrustBadge icon="phone" label="Intet spam" />
          <TrustBadge icon="clock" label="Svar &lt; 24t" />
        </div>

        <ContactConsentNote variant="micro" action="fortsætte" className="text-center" />
      </form>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: "lock" | "phone" | "clock"; label: string }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon === "lock" ? (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" />
        </svg>
      ) : icon === "phone" ? (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
        </svg>
      ) : (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      )}
      <span dangerouslySetInnerHTML={{ __html: label }} />
    </span>
  );
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
      <path d="M12 2l1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2z" />
      <path d="M19 14l.85 2.65L22 17l-2.15.35L19 20l-.85-2.65L16 17l2.15-.35L19 14z" />
    </svg>
  );
}
