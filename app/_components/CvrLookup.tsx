"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { track } from "./GoogleAnalytics";
import { SignDialog, type SignResult } from "./SignDialog";
import { FilePreviewDialog } from "./FilePreviewDialog";

type UploadedFile = {
  name: string;
  url: string;
  size: number;
  kind: "policy" | "authorization";
};

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
  const [digitalConfirmed, setDigitalConfirmed] = useState(false);
  const [digitalResult, setDigitalResult] = useState<SignResult | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [authFile, setAuthFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);

  // Reset method-specific state when user switches between digital and download.
  useEffect(() => {
    setDigitalConfirmed(false);
    setDigitalResult(null);
    setAuthFile(null);
  }, [authMethod]);
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
      // Only one auth method available — auto-select digital so the SignDialog CTA shows immediately.
      if (!authMethod) setAuthMethod("digital");
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
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    const authComplete =
      (authMethod === "digital" && digitalConfirmed) ||
      (authMethod === "download" && authFile !== null);
    if (!authComplete) {
      setError("Underskriv fuldmagten først — digitalt eller upload den underskrevne PDF.");
      return;
    }
    if (files.length === 0) {
      setError("Upload mindst én police før du sender.");
      return;
    }

    const uploadsToDo: { file: File; kind: "policy" | "authorization" }[] = [
      ...files.map((f) => ({ file: f, kind: "policy" as const })),
      ...(authFile ? [{ file: authFile, kind: "authorization" as const }] : []),
    ];
    // The digital-sign flow already uploaded its PDF to Blob; we surface that URL in the payload.
    const preUploaded: UploadedFile[] = digitalResult?.blobUrl
      ? [
          {
            name: digitalResult.fileName,
            url: digitalResult.blobUrl,
            size: 0,
            kind: "authorization",
          },
        ]
      : [];

    setSubmitting(true);
    setError(null);
    track("cvr_contact_submitted", {
      has_phone: !!phone,
      auth_method: authMethod ?? "skipped",
      files_uploaded: files.length,
    });

    const uploaded: UploadedFile[] = [...preUploaded];
    const fellBackToInline: { file: File; kind: "policy" | "authorization" }[] = [];
    setUploadProgress({ current: 0, total: uploadsToDo.length });
    for (let i = 0; i < uploadsToDo.length; i++) {
      const { file, kind } = uploadsToDo[i];
      try {
        const blob = await upload(`uploads/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload-token",
        });
        uploaded.push({ name: file.name, url: blob.url, size: file.size, kind });
      } catch (err) {
        // Blob storage isn't configured (or failed) — fall back to attaching the
        // file inline via multipart so info@ndrp.dk still receives the document.
        console.warn("Blob upload failed, will attach inline:", file.name, err);
        fellBackToInline.push({ file, kind });
      }
      setUploadProgress({ current: i + 1, total: uploadsToDo.length });
    }
    setUploadProgress(null);

    const inlineTotalBytes = fellBackToInline.reduce((sum, f) => sum + f.file.size, 0);
    const INLINE_LIMIT = 4 * 1024 * 1024;
    const inlineTooLarge = inlineTotalBytes > INLINE_LIMIT;

    const messageParts: string[] = [
      `CVR: ${company?.vat ?? digits}`,
    ];
    if (company?.address) messageParts.push(`Adresse: ${company.address}`);
    messageParts.push(
      authMethod === "digital"
        ? "Fuldmagt: digital signering (vores eget e-signatur-flow)"
        : authMethod === "download"
        ? `Fuldmagt: PDF downloaded og uploaded${authFile ? ` (${authFile.name})` : ""}`
        : "Fuldmagt: ikke valgt"
    );
    messageParts.push(
      `Policer uploaded: ${files.length}${files.length ? ` (${files.map((f) => f.name).join(", ")})` : ""}`
    );
    if (inlineTooLarge) {
      messageParts.push(
        `Bemærk: ${fellBackToInline.length} fil(er) på ${(inlineTotalBytes / 1024 / 1024).toFixed(1)} MB i alt kunne ikke vedhæftes (over 4 MB-grænsen). Bed kunden eftersende på info@ndrp.dk.`
      );
    }
    const message = messageParts.join("\n");

    // Customer-facing summary — friendly, no internal jargon.
    const customerSummaryParts = [
      `CVR ${company?.vat ?? digits}${company?.name ? ` · ${company.name}` : ""}`,
      authMethod === "digital" && digitalConfirmed
        ? "Undersøgelsesfuldmagt underskrevet"
        : authMethod === "download" && authFile
        ? "Undersøgelsesfuldmagt vedhæftet"
        : "",
      files.length
        ? `${files.length} ${files.length === 1 ? "police" : "policer"} indsendt til gennemgang`
        : "",
    ].filter(Boolean);
    const customerMessage = customerSummaryParts.join("\n");

    try {
      let res: Response;
      if (fellBackToInline.length === 0 || inlineTooLarge) {
        res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: phone || undefined,
            company: company?.name ?? "Ukendt",
            topic: "Forsikringsanalyse · CVR-flow",
            message,
            customerMessage,
            files: uploaded,
          }),
        });
      } else {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("email", email);
        if (phone) fd.append("phone", phone);
        fd.append("company", company?.name ?? "Ukendt");
        fd.append("topic", "Forsikringsanalyse · CVR-flow");
        fd.append("message", message);
        fd.append("customerMessage", customerMessage);
        for (const { file } of fellBackToInline) {
          fd.append("files", file, file.name);
        }
        res = await fetch("/api/contact", { method: "POST", body: fd });
      }
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
            digitalConfirmed={digitalConfirmed}
            setDigitalConfirmed={setDigitalConfirmed}
            digitalResult={digitalResult}
            authFile={authFile}
            setAuthFile={setAuthFile}
            files={files}
            setFiles={setFiles}
            contactName={contactName}
            setContactName={setContactName}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            signDialogOpen={signDialogOpen}
            setSignDialogOpen={setSignDialogOpen}
            onSignedDigitally={(r) => {
              setDigitalResult(r);
              setDigitalConfirmed(true);
              setSignDialogOpen(false);
            }}
            companyName={company?.name ?? "Din virksomhed"}
            cvr={company?.vat ?? digits}
            onBack={() => setStep("confirm")}
            onSubmit={handleSubmit}
            submitting={submitting}
            uploadProgress={uploadProgress}
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
  digitalConfirmed,
  setDigitalConfirmed,
  digitalResult,
  authFile,
  setAuthFile,
  files,
  setFiles,
  contactName,
  setContactName,
  contactEmail,
  setContactEmail,
  contactPhone,
  setContactPhone,
  signDialogOpen,
  setSignDialogOpen,
  onSignedDigitally,
  companyName,
  cvr,
  onBack,
  onSubmit,
  submitting,
  uploadProgress,
  error,
}: {
  authMethod: "digital" | "download" | null;
  setAuthMethod: (v: "digital" | "download" | null) => void;
  digitalConfirmed: boolean;
  setDigitalConfirmed: (v: boolean) => void;
  digitalResult: SignResult | null;
  authFile: File | null;
  setAuthFile: (f: File | null) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  signDialogOpen: boolean;
  setSignDialogOpen: (v: boolean) => void;
  onSignedDigitally: (r: SignResult) => void;
  companyName: string;
  cvr: string;
  onBack: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  uploadProgress: { current: number; total: number } | null;
  error: string | null;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthDragging, setIsAuthDragging] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const authComplete =
    (authMethod === "digital" && digitalConfirmed) ||
    (authMethod === "download" && authFile !== null);
  const policiesComplete = files.length > 0;
  const canSubmit = authComplete && policiesComplete;

  function handleSubmitClick(e: React.FormEvent<HTMLFormElement>) {
    if (!canSubmit) {
      e.preventDefault();
      setAttemptedSubmit(true);
      return;
    }
    onSubmit(e);
  }

  function addFiles(incoming: FileList | File[] | null) {
    if (!incoming) return;
    const next = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.type.startsWith("image/")
    );
    if (!next.length) return;
    setFiles([...files, ...next]);
  }

  return (
    <form onSubmit={handleSubmitClick} className="cvr-actions-enter space-y-6">
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
              body="Læs fuldmagten, udfyld dine oplysninger, og bekræft elektronisk."
              badge="Sikker e-signatur"
            />
          </div>

          {/* Expanded: digital signing flow */}
          {authMethod === "digital" ? (
            <div className="mt-3 p-3.5 rounded-[8px] bg-[color:var(--color-nordan-soft)] border border-[color:var(--color-nordan-line)]">
              {!digitalConfirmed ? (
                <>
                  <div className="text-[0.82rem] text-[color:var(--color-nordan-ink-soft)] mb-3 leading-relaxed">
                    Læs fuldmagten, udfyld dine oplysninger og tegn din underskrift. Du får kvittering pr. mail.
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignDialogOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[6px] bg-[color:var(--color-nordan-dark)] text-white text-[0.85rem] font-semibold hover:bg-[color:var(--color-nordan-dark-deep)] transition-colors"
                  >
                    Underskriv elektronisk →
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[0.85rem]">
                    <span className="w-5 h-5 rounded-full bg-green-600 text-white grid place-items-center text-xs">✓</span>
                    <span className="font-medium text-[color:var(--color-nordan-ink)]">
                      Underskrevet
                    </span>
                    <button
                      type="button"
                      onClick={() => setSignDialogOpen(true)}
                      className="ml-auto text-[0.78rem] text-[color:var(--color-nordan-muted)] underline"
                    >
                      Underskriv igen
                    </button>
                  </div>
                  {digitalResult?.blobUrl ? (
                    <a
                      href={digitalResult.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[0.78rem] text-[color:var(--color-nordan-accent)] hover:underline"
                    >
                      Hent kopi af din underskrift ↓
                    </a>
                  ) : null}
                  {digitalResult?.auditId ? (
                    <div className="text-[0.7rem] font-mono text-[color:var(--color-nordan-muted)]">
                      Audit-ID: {digitalResult.auditId}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          {/* Expanded: download-then-upload flow */}
        </ActionPanel>

        {/* PANEL 2 — UPLOAD */}
        <ActionPanel
          step="02"
          title="Upload jeres policer"
          subtitle="Træk én eller flere filer hertil — eller klik"
        >
          <label
            htmlFor="policer"
            onDragOver={(e) => {
              e.preventDefault();
              if (!isDragging) setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`group relative block border-2 border-dashed rounded-[10px] py-8 px-5 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-[color:var(--color-nordan-accent)] bg-[color:var(--color-nordan-accent)]/10 scale-[1.01]"
                : "border-[color:var(--color-nordan-line)] hover:border-[color:var(--color-nordan-accent)] bg-[color:var(--color-nordan-soft)]/50"
            }`}
          >
            <input
              id="policer"
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
              className="sr-only"
            />
            <div className="inline-flex flex-col items-center gap-3">
              <span className="relative w-14 h-12 grid place-items-center">
                <span className="absolute left-0 top-1 w-10 h-12 rounded-md bg-white border border-[color:var(--color-nordan-line)] -rotate-6 origin-bottom-left" />
                <span className="absolute right-0 top-0 w-10 h-12 rounded-md bg-white border border-[color:var(--color-nordan-line)] rotate-6 origin-bottom-right" />
                <span className="relative w-10 h-12 rounded-md bg-white border border-[color:var(--color-nordan-line)] grid place-items-center text-[color:var(--color-nordan-dark)] shadow-sm">
                  <IconUpload />
                </span>
              </span>
              <div>
                <div className="font-semibold text-[0.95rem] text-[color:var(--color-nordan-ink)]">
                  {isDragging ? "Slip filerne her" : "Træk policer hertil — én eller flere"}
                </div>
                <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] mt-1">
                  PDF · JPG · PNG · max 4 MB i alt
                </div>
              </div>
              <div className="text-[0.78rem] text-[color:var(--color-nordan-accent)] font-semibold underline-offset-2 group-hover:underline">
                eller vælg fra computer
              </div>
            </div>
          </label>

          {files.length > 0 ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[0.78rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
                  {files.length} {files.length === 1 ? "fil tilføjet" : "filer tilføjet"}
                </div>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-[0.78rem] text-[color:var(--color-nordan-muted)] hover:text-red-600"
                >
                  Ryd alle
                </button>
              </div>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${f.size}-${i}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[color:var(--color-nordan-soft)] rounded border border-[color:var(--color-nordan-line)] text-[0.82rem]"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewFile(f)}
                      className="flex items-center gap-2 flex-1 min-w-0 text-left hover:text-[color:var(--color-nordan-accent)] transition-colors"
                      title="Klik for at se filen"
                    >
                      <IconFile />
                      <span className="flex-1 truncate underline-offset-2 hover:underline">{f.name}</span>
                    </button>
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
            </div>
          ) : null}
        </ActionPanel>

        {/* PANEL 3 — KONTAKT */}
        <ActionPanel
          step="03"
          title="Hvem ringer vi til?"
          subtitle="Din forsikringsmægler vender tilbage inden for én hverdag"
        >
          <div className="space-y-3">
            <InputField name="name" label="Navn" placeholder="Fornavn Efternavn" required value={contactName} onChange={setContactName} />
            <InputField name="email" label="E-mail" type="email" placeholder="navn@firma.dk" required value={contactEmail} onChange={setContactEmail} />
            <InputField name="phone" label="Telefon" type="tel" placeholder="+45 12 34 56 78" required value={contactPhone} onChange={setContactPhone} />
          </div>
        </ActionPanel>
      </div>

      {error ? (
        <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      ) : null}

      {attemptedSubmit && !canSubmit && !submitting ? (
        <div className="text-[0.85rem] text-amber-900 bg-amber-50 border border-amber-200 rounded px-3.5 py-2.5">
          <span className="font-semibold">Mangler før du kan sende:</span>{" "}
          {!authComplete ? "underskreven fuldmagt" : null}
          {!authComplete && !policiesComplete ? " · " : null}
          {!policiesComplete ? "mindst én police uploadet" : null}
        </div>
      ) : null}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
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
          aria-disabled={!canSubmit}
          className={`flex-1 h-[50px] inline-flex items-center justify-center gap-2 text-white text-[0.92rem] font-semibold tracking-wide rounded-[8px] transition-colors ${
            canSubmit
              ? "bg-[color:var(--color-nordan-accent)] hover:bg-[#8f715f]"
              : "bg-[color:var(--color-nordan-accent)]/50 cursor-not-allowed"
          } disabled:opacity-60`}
        >
          {submitting ? (
            <>
              <Spinner />
              <span>
                {uploadProgress
                  ? `Uploader ${uploadProgress.current}/${uploadProgress.total}…`
                  : "Sender…"}
              </span>
            </>
          ) : (
            <>
              <span>Send &amp; start analyse</span>
              <span aria-hidden>→</span>
            </>
          )}
        </button>
      </div>

      <SignDialog
        open={signDialogOpen}
        onClose={() => setSignDialogOpen(false)}
        onSigned={onSignedDigitally}
        defaults={{
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          companyName,
          cvr,
        }}
      />

      <FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
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
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
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
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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
