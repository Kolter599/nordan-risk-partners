"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "./GoogleAnalytics";
import { SignFlow, type SignResult } from "./SignFlow";
import { setRecentSigned } from "@/lib/recent-signed";

type Company = {
  name: string;
  vat: string;
  address?: string;
  industry?: string;
  employees?: string;
};

type Step = "cvr" | "confirm" | "sign" | "done";
type LookupState = "idle" | "loading" | "error";

type CvrLookupProps = {
  headline?: string;
  /** When provided (e.g. from /analyse?cvr=…) auto-runs lookup and lands on confirm step. */
  initialCvr?: string;
  /** Optional listener so a parent (e.g. /analyse) can render its own step indicator. */
  onStepChange?: (step: Step) => void;
};

export type CvrLookupStep = Step;

const STEP_LABELS: Record<Step, string> = {
  cvr: "Indtast CVR — start jeres analyse",
  confirm: "Er det din virksomhed?",
  sign: "Underskriv fuldmagt",
  done: "Tak! Vi er i gang.",
};

export function CvrLookup({ headline, initialCvr, onStepChange }: CvrLookupProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cvr");
  const [cvr, setCvr] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [, setSignResult] = useState<SignResult | null>(null);

  const typedOnce = useRef(false);
  const prefillRan = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const digits = cvr.replace(/\D/g, "").slice(0, 8);
  const isComplete = digits.length === 8;

  function scrollCardIntoView(block: ScrollLogicalPosition = "center") {
    if (typeof window === "undefined") return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block });
  }

  useEffect(() => {
    if (prefillRan.current) return;
    const fromProp = (initialCvr ?? "").replace(/\D/g, "").slice(0, 8);
    if (fromProp.length !== 8) return;
    prefillRan.current = true;
    setCvr(fromProp);
    typedOnce.current = true;
    void runLookup(fromProp);
    const t = setTimeout(scrollCardIntoView, 80);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCvr]);

  async function runLookup(forDigits: string) {
    track("cvr_submitted", { cvr: forDigits, prefilled: true });
    setLookupState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/cvr?cvr=${forDigits}`);
      const data = (await res.json()) as
        | { ok: true; company: { name: string; vat: string; address: string | null; industry: string | null; employees: string | null } }
        | { ok: false; error: string };
      if (!data.ok) {
        const msg =
          data.error === "not_found"
            ? "Virksomheden blev ikke fundet — tjek nummeret eller spring over."
            : data.error === "quota"
            ? "CVR-opslaget er midlertidigt overbelastet. Prøv igen om et minut, eller spring over."
            : "Vi kunne ikke nå CVR-registret lige nu. Prøv igen — eller spring over og udfyld manuelt.";
        track("cvr_lookup_error", { cvr: forDigits, reason: data.error });
        throw new Error(msg);
      }
      setCompany({
        name: data.company.name,
        vat: data.company.vat,
        address: data.company.address ?? undefined,
        industry: data.company.industry ?? undefined,
        employees: data.company.employees ?? undefined,
      });
      setLookupState("idle");
      setStep("confirm");
    } catch (err) {
      if (!(err instanceof Error && err.message.includes("CVR"))) {
        track("cvr_lookup_error", { cvr: forDigits, reason: "exception" });
      }
      setLookupState("error");
      setError(err instanceof Error ? err.message : "Noget gik galt");
    }
  }

  // Fire cvr_started the first time a digit is entered
  useEffect(() => {
    if (!typedOnce.current && digits.length > 0) {
      typedOnce.current = true;
      track("cvr_started", { source_page: typeof window !== "undefined" ? window.location.pathname : "" });
    }
  }, [digits]);

  // Fire step-change events + notify parent listener
  useEffect(() => {
    onStepChange?.(step);
    if (step === "confirm") {
      track("cvr_company_confirmed_view", { cvr: digits, company: company?.name });
    } else if (step === "sign") {
      track("cvr_step_sign_view", { cvr: digits, company: company?.name });
    } else if (step === "done") {
      track("cvr_flow_completed", { company: company?.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete) return;
    await runLookup(digits);
  }

  function skipCompanyLookup() {
    track("cvr_lookup_skipped");
    setCompany({
      name: "Din virksomhed",
      vat: digits || "— —",
    });
    setStep("confirm");
  }

  // After signing succeeds: capture result, persist a recent-signed marker
  // so the homepage can show a personalized "we're working on it"-state,
  // then auto-redirect home after a beat. Done step is shown briefly as a
  // visual confirmation.
  function handleSigned(result: SignResult) {
    setSignResult(result);
    track("analyse_completed", {
      cvr: company?.vat ?? digits,
      company: company?.name,
      audit_id: result.auditId,
    });
    if (company) {
      setRecentSigned({
        signedAt: new Date().toISOString(),
        companyName: company.name,
        cvr: company.vat,
      });
    }
    setStep("done");
    setTimeout(() => scrollCardIntoView("center"), 80);
    // Land back on the homepage where the CVR card will recognize them.
    // 8 seconds gives them time to read the kvitterings-besked.
    setTimeout(() => router.push("/"), 8000);
  }

  // Card grows wider on the sign step so the doc + form layout fits.
  const widthClass =
    step === "sign"
      ? "max-w-[1040px]"
      : step === "done"
      ? "max-w-[520px]"
      : "max-w-[480px]";

  // Step body padding — sign step uses zero padding so SignFlow can run
  // edge-to-edge inside the card.
  const bodyPadding = step === "sign" ? "p-0" : "p-5 sm:p-7";

  // Slim header on the sign step to make room for the doc preview.
  const headerPadding =
    step === "sign"
      ? "px-4 sm:px-5 pt-3.5 sm:pt-4 pb-3"
      : "px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5";

  // The sign step's content (doc + form) is tall — make sure the card
  // never grows past the parent's bounds so /start can keep body locked.
  const heightClass = step === "sign" ? "max-h-full flex flex-col" : "";

  // Map our 4 steps onto the 3 user-visible stages (cvr / confirm / sign).
  // Done collapses back into the sign stage being marked complete.
  const STAGES: Step[] = ["cvr", "confirm", "sign"];
  const stageIndex = step === "done" ? 2 : STAGES.indexOf(step);
  const progress = step === "done" ? 100 : ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div
      ref={cardRef}
      id="cvr-card"
      className={`mx-auto w-full ${widthClass} ${heightClass} bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)] transition-[max-width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]`}
    >
      {/* HEADER with progress */}
      <div
        className={`shrink-0 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white ${headerPadding}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            Gratis analyse
          </div>
          {step !== "done" ? (
            <span className="text-[0.7rem] text-white/60 font-mono">
              {Math.min(stageIndex + 1, STAGES.length)}/{STAGES.length}
            </span>
          ) : null}
        </div>
        <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
          {step === "cvr" && (headline ?? STEP_LABELS.cvr)}
          {step === "confirm" && STEP_LABELS.confirm}
          {step === "sign" && STEP_LABELS.sign}
          {step === "done" && STEP_LABELS.done}
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-[3px] bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--color-nordan-accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* STEP BODY */}
      <div className={`${bodyPadding} ${step === "sign" ? "flex-1 min-h-0 overflow-hidden flex" : ""}`}>
        {step === "cvr" && (
          <StepCvr
            digits={digits}
            isComplete={isComplete}
            setCvr={setCvr}
            onSubmit={handleLookup}
            loading={lookupState === "loading"}
            error={error}
            onSkip={skipCompanyLookup}
          />
        )}
        {step === "confirm" && company && (
          <StepConfirm
            company={company}
            onBack={() => setStep("cvr")}
            onNext={() => setStep("sign")}
          />
        )}
        {step === "sign" && company && (
          <SignFlow
            defaults={{
              companyName: company.name,
              cvr: company.vat,
            }}
            onSigned={handleSigned}
          />
        )}
        {step === "done" && <StepDone company={company} />}
      </div>
    </div>
  );
}

/* -------------------- STEP 1: CVR -------------------- */
function StepCvr({
  digits,
  isComplete,
  setCvr,
  onSubmit,
  loading,
  error,
  onSkip,
}: {
  digits: string;
  isComplete: boolean;
  setCvr: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onSkip: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        disabled={loading || !isComplete}
        className="group w-full h-[58px] inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.95rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] disabled:bg-[color:var(--color-nordan-accent-soft)] disabled:hover:bg-[color:var(--color-nordan-accent-soft)] disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Henter virksomhed…</span>
          </>
        ) : (
          <>
            <span>Start analyse</span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </>
        )}
      </button>

      {error ? (
        <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      ) : null}

      <div className="flex items-center justify-center gap-4 pt-1 text-[0.72rem] text-[color:var(--color-nordan-muted)]">
        <TrustBadge icon="lock" label="Ingen binding" />
        <TrustBadge icon="phone" label="Intet spam" />
        <TrustBadge icon="clock" label="Svar &lt; 24t" />
      </div>

      <DevSkip onClick={onSkip} label="Spring CVR-opslag over" />
    </form>
  );
}

/* -------------------- STEP 2: CONFIRM COMPANY -------------------- */
function StepConfirm({
  company,
  onBack,
  onNext,
}: {
  company: Company;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="p-5 rounded-[8px] bg-[color:var(--color-nordan-soft)] border border-[color:var(--color-nordan-line)]">
        <div className="text-[0.7rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
          CVR {company.vat}
        </div>
        <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] mb-1">{company.name}</div>
        {company.address ? (
          <div className="text-[0.88rem] text-[color:var(--color-nordan-ink-soft)]">{company.address}</div>
        ) : null}
        {company.industry ? (
          <div className="text-[0.82rem] text-[color:var(--color-nordan-muted)] mt-2">
            {company.industry}
            {company.employees ? ` · ${company.employees} ansatte` : ""}
          </div>
        ) : null}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Ja, fortsæt" backLabel="Skift CVR" />
    </div>
  );
}

/* -------------------- STEP 4: DONE -------------------- */
function StepDone({ company }: { company: Company | null }) {
  return (
    <div className="py-4 text-center">
      <div className="inline-flex w-14 h-14 rounded-full bg-[color:var(--color-nordan-accent)] text-white items-center justify-center mb-4">
        <IconCheck />
      </div>
      <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] mb-2">
        Tak — vi er i gang
      </div>
      <p className="text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed max-w-sm mx-auto">
        Fuldmagten er modtaget for <strong>{company?.name ?? "din virksomhed"}</strong>.
        Tjek din indbakke for kvitteringen.
      </p>
    </div>
  );
}

/* -------------------- SHARED -------------------- */
function StepNav({
  onBack,
  onNext,
  backLabel = "Tilbage",
  nextLabel = "Næste",
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="h-[50px] px-5 rounded-[8px] border border-[color:var(--color-nordan-line)] text-[0.88rem] font-medium text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-ink-soft)]"
      >
        {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex-1 h-[50px] inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] transition-colors"
      >
        <span>{nextLabel}</span>
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}

function DevSkip({ onClick, label }: { onClick: () => void; label: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 w-full text-center text-[0.72rem] text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-dark)] underline underline-offset-2"
    >
      {label} (dev)
    </button>
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

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
