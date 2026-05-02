"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "./GoogleAnalytics";

type Company = {
  name: string;
  vat: string;
  address?: string;
  industry?: string;
  employees?: string;
};

type Step = "cvr" | "confirm" | "actions" | "done";
type LookupState = "idle" | "loading" | "error";

const STEPS: { key: Step; label: string }[] = [
  { key: "cvr", label: "Virksomhed" },
  { key: "confirm", label: "Bekræft" },
  { key: "actions", label: "Klargør" },
];

type CvrLookupProps = {
  headline?: string;
  /** When provided (e.g. from /analyse?cvr=…) auto-runs lookup and lands on confirm step. */
  initialCvr?: string;
  /** Optional listener so a parent (e.g. /analyse) can render its own step indicator. */
  onStepChange?: (step: Step) => void;
};

export type CvrLookupStep = Step;

export function CvrLookup({ headline, initialCvr, onStepChange }: CvrLookupProps = {}) {
  const [step, setStep] = useState<Step>("cvr");
  const [cvr, setCvr] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [authMethod, setAuthMethod] = useState<"digital" | "download" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const typedOnce = useRef(false);
  const prefillRan = useRef(false);

  const digits = cvr.replace(/\D/g, "").slice(0, 8);
  const isComplete = digits.length === 8;

  useEffect(() => {
    if (prefillRan.current) return;
    const fromProp = (initialCvr ?? "").replace(/\D/g, "").slice(0, 8);
    if (fromProp.length !== 8) return;
    prefillRan.current = true;
    setCvr(fromProp);
    typedOnce.current = true;
    void runLookup(fromProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCvr]);

  async function runLookup(forDigits: string) {
    track("cvr_submitted", { cvr: forDigits, prefilled: true });
    setLookupState("loading");
    setError(null);
    try {
      const res = await fetch(`https://cvrapi.dk/api?country=dk&search=${forDigits}`);
      if (!res.ok) throw new Error("Kunne ikke slå CVR op lige nu");
      const data = await res.json();
      if (data.error) throw new Error("Virksomheden blev ikke fundet");
      setCompany({
        name: data.name ?? "Virksomhed",
        vat: String(data.vat ?? forDigits),
        address: [data.address, data.zipcode, data.city].filter(Boolean).join(", "),
        industry: data.industrydesc ?? undefined,
        employees: data.employees ?? undefined,
      });
      setLookupState("idle");
      setStep("confirm");
    } catch (err) {
      track("cvr_lookup_error", { cvr: forDigits });
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
    } else if (step === "actions") {
      track("cvr_step_actions_view");
    } else if (step === "done") {
      track("cvr_flow_completed", {
        company: company?.name,
        auth_method: authMethod ?? "skipped",
        files_uploaded: files.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const activeIndex = STEPS.findIndex((s) => s.key === step);
  const progress = step === "done" ? 100 : ((Math.max(activeIndex, 0) + 1) / STEPS.length) * 100;

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      company: company?.name ?? "Ukendt",
      topic: "SaaS lead · Gratis forsikringsanalyse",
      message: [
        `CVR: ${company?.vat ?? digits}`,
        company?.address ? `Adresse: ${company.address}` : "",
        authMethod ? `Fuldmagt: ${authMethod === "digital" ? "digital signering" : "downloaded/uploaded"}` : "Fuldmagt: ikke valgt",
        `Policer uploaded: ${files.length}${files.length ? ` (${files.map((f) => f.name).join(", ")})` : ""}`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
    setSubmitting(true);
    track("cvr_contact_submitted", {
      has_phone: !!payload.phone,
      auth_method: authMethod ?? "skipped",
      files_uploaded: files.length,
    });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Noget gik galt. Prøv igen eller ring.");
      }
      setStep("done");
    } catch (err) {
      track("cvr_contact_error");
      setError(err instanceof Error ? err.message : "Noget gik galt");
    } finally {
      setSubmitting(false);
    }
  }

  const widthClass =
    step === "actions"
      ? "max-w-[1100px]"
      : step === "done"
      ? "max-w-[520px]"
      : "max-w-[480px]";

  return (
    <div className={`mx-auto w-full ${widthClass} bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)] transition-[max-width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]`}>
      {/* HEADER with progress */}
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            Gratis analyse
          </div>
          {step !== "done" ? (
            <span className="text-[0.7rem] text-white/60 font-mono">
              {Math.min(activeIndex + 1, STEPS.length)}/{STEPS.length}
            </span>
          ) : null}
        </div>
        <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
          {step === "cvr" && (headline ?? "Indtast CVR — se hvad du kan spare")}
          {step === "confirm" && "Er det din virksomhed?"}
          {step === "actions" && "Klargør jeres analyse"}
          {step === "done" && "Tak! Vi er i gang."}
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
      <div className="p-5 sm:p-7">
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
            onNext={() => setStep("actions")}
          />
        )}
        {step === "actions" && (
          <StepActions
            authMethod={authMethod}
            setAuthMethod={setAuthMethod}
            files={files}
            setFiles={setFiles}
            onBack={() => setStep("confirm")}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
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

/* -------------------- STEP 3: ACTIONS (parallel: fuldmagt + upload + kontakt) -------------------- */
function StepActions({
  authMethod,
  setAuthMethod,
  files,
  setFiles,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  authMethod: "digital" | "download" | null;
  setAuthMethod: (v: "digital" | "download" | null) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="cvr-actions-enter space-y-6">
      <p className="text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
        Udfyld de tre felter nedenfor i den rækkefølge du har lyst — alt sendes samlet, når du er klar.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* PANEL 1 — FULDMAGT */}
        <ActionPanel
          step="01"
          title="Giv os tilladelse"
          subtitle="Underskriv undersøgelsesfuldmagt"
        >
          <div className="space-y-2.5">
            <AuthOption
              selected={authMethod === "digital"}
              onSelect={() => setAuthMethod("digital")}
              icon={<IconSignature />}
              title="Underskriv digitalt"
              body="Via MitID (Penneo). Under 1 minut."
              badge="Anbefalet"
            />
            <AuthOption
              selected={authMethod === "download"}
              onSelect={() => setAuthMethod("download")}
              icon={<IconDownload />}
              title="Download PDF"
              body="Hent, underskriv og upload med policerne."
              action={
                <a
                  href="/dokumenter/undersoegelsesfuldmagt.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[color:var(--color-nordan-accent)] hover:underline"
                >
                  Download <span aria-hidden>↓</span>
                </a>
              }
            />
          </div>
        </ActionPanel>

        {/* PANEL 2 — UPLOAD */}
        <ActionPanel
          step="02"
          title="Upload jeres policer"
          subtitle="PDF, JPG eller PNG — kan også eftersendes"
        >
          <label
            htmlFor="policer"
            className="block border-2 border-dashed border-[color:var(--color-nordan-line)] hover:border-[color:var(--color-nordan-accent)] rounded-[8px] p-5 text-center cursor-pointer transition-colors bg-[color:var(--color-nordan-soft)]/50"
          >
            <input
              id="policer"
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="sr-only"
            />
            <div className="inline-flex flex-col items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-white border border-[color:var(--color-nordan-line)] grid place-items-center text-[color:var(--color-nordan-dark)]">
                <IconUpload />
              </span>
              <div className="font-semibold text-[0.88rem]">Træk filer hertil eller klik</div>
              <div className="text-[0.72rem] text-[color:var(--color-nordan-muted)]">PDF · JPG · PNG · max 20 MB</div>
            </div>
          </label>
          {files.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--color-nordan-soft)] rounded border border-[color:var(--color-nordan-line)] text-[0.82rem]"
                >
                  <IconFile />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-[0.7rem] text-[color:var(--color-nordan-muted)]">
                    {Math.round(f.size / 1024)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="text-[color:var(--color-nordan-muted)] hover:text-red-600 text-base leading-none"
                    aria-label="Fjern"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </ActionPanel>

        {/* PANEL 3 — KONTAKT */}
        <ActionPanel
          step="03"
          title="Hvem ringer vi til?"
          subtitle="Din forsikringsmægler vender tilbage inden for én hverdag"
        >
          <div className="space-y-3">
            <InputField name="name" label="Navn" placeholder="Fornavn Efternavn" required />
            <InputField name="email" label="E-mail" type="email" placeholder="navn@firma.dk" required />
            <InputField name="phone" label="Telefon" type="tel" placeholder="+45 12 34 56 78" required />
          </div>
        </ActionPanel>
      </div>

      {error ? (
        <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="h-[50px] px-5 rounded-[8px] border border-[color:var(--color-nordan-line)] text-[0.88rem] font-medium text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-ink-soft)] disabled:opacity-60"
        >
          Tilbage
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 h-[50px] inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] disabled:opacity-60 transition-colors"
        >
          {submitting ? (
            <>
              <Spinner />
              <span>Sender…</span>
            </>
          ) : (
            <>
              <span>Send &amp; start analyse</span>
              <span aria-hidden>→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function ActionPanel({
  step,
  title,
  subtitle,
  children,
}: {
  step: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[color:var(--color-nordan-line)] rounded-[10px] p-4 sm:p-5 bg-white">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-[color:var(--color-nordan-accent)] font-[family-name:var(--font-inter)] font-bold text-[0.72rem] tracking-[0.18em]">
          {step}
        </span>
        <span className="font-[family-name:var(--font-inter)] font-bold text-[1rem] text-[color:var(--color-nordan-ink)]">
          {title}
        </span>
      </div>
      <p className="text-[0.78rem] text-[color:var(--color-nordan-muted)] mb-4 leading-relaxed">{subtitle}</p>
      {children}
    </div>
  );
}

function AuthOption({
  selected,
  onSelect,
  icon,
  title,
  body,
  badge,
  action,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-[8px] border-2 transition-all ${
        selected
          ? "border-[color:var(--color-nordan-accent)] bg-[color:var(--color-nordan-accent)]/5"
          : "border-[color:var(--color-nordan-line)] hover:border-[color:var(--color-nordan-accent-soft)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`shrink-0 w-10 h-10 rounded-full grid place-items-center ${
            selected
              ? "bg-[color:var(--color-nordan-accent)] text-white"
              : "bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-dark)]"
          }`}
        >
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-[0.95rem]">{title}</span>
            {badge ? (
              <span className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold bg-[color:var(--color-nordan-accent)] text-white px-2 py-0.5 rounded">
                {badge}
              </span>
            ) : null}
          </div>
          <div className="text-[0.82rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed">{body}</div>
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
        <span
          className={`shrink-0 w-5 h-5 rounded-full border-2 mt-1 grid place-items-center ${
            selected ? "border-[color:var(--color-nordan-accent)] bg-[color:var(--color-nordan-accent)]" : "border-[color:var(--color-nordan-line)]"
          }`}
        >
          {selected ? <span className="w-2 h-2 rounded-full bg-white" /> : null}
        </span>
      </div>
    </button>
  );
}

function InputField({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-muted)] mb-2">
        {label} {required ? <span className="text-[color:var(--color-nordan-accent)]">*</span> : null}
      </div>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-12 px-4 bg-[color:var(--color-nordan-soft)] border-2 border-transparent rounded-[8px] focus:outline-none focus:border-[color:var(--color-nordan-accent)] focus:bg-white text-[0.95rem] text-[color:var(--color-nordan-ink)] placeholder:text-[color:var(--color-nordan-muted)]/60 transition-colors"
      />
    </label>
  );
}

/* -------------------- STEP 6: DONE -------------------- */
function StepDone({ company }: { company: Company | null }) {
  return (
    <div className="py-4 text-center">
      <div className="inline-flex w-14 h-14 rounded-full bg-[color:var(--color-nordan-accent)] text-white items-center justify-center mb-4">
        <IconCheck />
      </div>
      <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] mb-2">Tak — vi er i gang</div>
      <p className="text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed max-w-sm mx-auto">
        Vi går straks i gang med at analysere forsikringerne for {company?.name ?? "din virksomhed"} og vender tilbage typisk inden for én hverdag.
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

function IconSignature() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 18c4-8 8-2 12-10" />
      <path d="M13 15l3 3M3 21h18" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12m0 0l-5-5m5 5l5-5" />
      <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21V9m0 0l-5 5m5-5l5 5" />
      <path d="M4 5h16" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" />
      <path d="M14 3v6h6" />
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
