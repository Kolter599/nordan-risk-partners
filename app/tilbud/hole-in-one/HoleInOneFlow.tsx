"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getClientId, track } from "../../_components/GoogleAnalytics";
import { setRecentSigned } from "@/lib/recent-signed";
import { getAttribution } from "@/lib/attribution";

type Company = {
  name: string;
  vat: string;
  address?: string;
};

type Step = "cvr" | "confirm" | "form" | "done";
type LookupState = "idle" | "loading" | "error";

type FormState = {
  // Kontakt
  navn: string;
  email: string;
  telefon: string;
  // Turneringen
  dato: string;
  klubnavn: string;
  hulNummer: string;
  hulHcp: string;
  laengdeHerre: string;
  laengdeDame: string;
  laengdeKlubpro: string;
  antalMaend: string;
  antalDamer: string;
  antalPros: string;
  antalRunder: string;
  // Præmien
  praemieBeskrivelse: string;
  praemieVaerdi: string;
  praemieLeverandoer: string;
};

const EMPTY_FORM: FormState = {
  navn: "",
  email: "",
  telefon: "",
  dato: "",
  klubnavn: "",
  hulNummer: "",
  hulHcp: "",
  laengdeHerre: "",
  laengdeDame: "",
  laengdeKlubpro: "",
  antalMaend: "",
  antalDamer: "",
  antalPros: "",
  antalRunder: "",
  praemieBeskrivelse: "",
  praemieVaerdi: "",
  praemieLeverandoer: "",
};

const STEP_LABELS: Record<Step, string> = {
  cvr: "Indtast CVR — start jeres bestilling",
  confirm: "Er det din virksomhed?",
  form: "Bestil tilbud — udfyld turneringen",
  done: "Tak — vi er på sagen",
};

export function HoleInOneFlow({ initialCvr }: { initialCvr: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("cvr");
  const [cvr, setCvr] = useState(initialCvr);
  const [company, setCompany] = useState<Company | null>(null);
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const typedOnce = useRef(false);
  const prefillRan = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const digits = cvr.replace(/\D/g, "").slice(0, 8);
  const cvrComplete = digits.length === 8;

  function scrollCardIntoView(block: ScrollLogicalPosition = "center") {
    if (typeof window === "undefined") return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block });
  }

  function setF<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Auto-prefill from CVR if URL had ?cvr=…
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
    track("hole_in_one_cvr_submitted", { cvr: forDigits });
    setLookupState("loading");
    setError(null);
    try {
      const res = await fetch(`/api/cvr?cvr=${forDigits}`);
      const data = (await res.json()) as
        | {
            ok: true;
            company: { name: string; vat: string; address: string | null };
          }
        | { ok: false; error: string };
      if (!data.ok) {
        const msg =
          data.error === "not_found"
            ? "Virksomheden blev ikke fundet — tjek nummeret eller spring over."
            : data.error === "quota"
            ? "CVR-opslaget er midlertidigt overbelastet. Prøv igen om et minut, eller spring over."
            : "Vi kunne ikke nå CVR-registret lige nu.";
        throw new Error(msg);
      }
      setCompany({
        name: data.company.name,
        vat: data.company.vat,
        address: data.company.address ?? undefined,
      });
      setLookupState("idle");
      setStep("confirm");
    } catch (err) {
      setLookupState("error");
      setError(err instanceof Error ? err.message : "Noget gik galt");
    }
  }

  // Fire start event on first keystroke
  useEffect(() => {
    if (!typedOnce.current && digits.length > 0) {
      typedOnce.current = true;
      track("hole_in_one_started", {
        source_page: typeof window !== "undefined" ? window.location.pathname : "",
      });
    }
  }, [digits]);

  function skipCvr() {
    setCompany({ name: "Din virksomhed", vat: digits || "— —" });
    setStep("confirm");
  }

  async function handleCvrSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cvrComplete) return;
    await runLookup(digits);
  }

  function getMissingFields(): string[] {
    const missing: string[] = [];
    if (form.navn.trim().length < 2) missing.push("Navn");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) missing.push("Gyldig e-mail");
    if (form.telefon.replace(/\D/g, "").length < 6) missing.push("Telefon");
    if (!form.dato) missing.push("Dato");
    if (!form.klubnavn.trim()) missing.push("Bane / Klub");
    if (!form.hulNummer.trim()) missing.push("Hullets nummer");
    if (!form.praemieBeskrivelse.trim()) missing.push("Beskrivelse af præmien");
    if (!form.praemieVaerdi.trim()) missing.push("Værdi af præmien");
    return missing;
  }

  const formComplete = getMissingFields().length === 0;

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (!formComplete) {
      setAttemptedSubmit(true);
      return;
    }
    setSubmitting(true);
    setAttemptedSubmit(false);
    setError(null);
    track("hole_in_one_submitted", { cvr: company?.vat ?? digits });

    const message = [
      "=== FORSIKRINGSTAGER ===",
      `Virksomhed: ${company?.name ?? "Ukendt"}`,
      `Adresse: ${company?.address ?? "—"}`,
      `CVR: ${company?.vat ?? digits}`,
      `Kontaktperson: ${form.navn}`,
      `Telefon: ${form.telefon}`,
      `E-mail: ${form.email}`,
      "",
      "=== TURNERINGEN ===",
      `Dato: ${form.dato}`,
      `Bane / Klub: ${form.klubnavn}`,
      `Hullets nummer: ${form.hulNummer}`,
      `Hullets index/Hcp: ${form.hulHcp}`,
      `Længde (herre tee): ${form.laengdeHerre} m`,
      `Længde (dame tee): ${form.laengdeDame} m`,
      `Længde (klub pro): ${form.laengdeKlubpro} m`,
      `Antal mænd: ${form.antalMaend}`,
      `Antal damer: ${form.antalDamer}`,
      `Antal pros: ${form.antalPros}`,
      `Hullet spilles (antal runder): ${form.antalRunder}`,
      "",
      "=== PRÆMIEN ===",
      `Beskrivelse: ${form.praemieBeskrivelse}`,
      `Værdi: ${form.praemieVaerdi}`,
      `Leverandør: ${form.praemieLeverandoer}`,
    ].join("\n");

    const customerMessage = [
      `Bane / Klub: ${form.klubnavn}`,
      `Dato: ${form.dato}`,
      `Hullets nummer: ${form.hulNummer}`,
      `Antal deltagere: ${form.antalMaend} mænd · ${form.antalDamer} damer · ${form.antalPros} pros`,
      `Antal runder: ${form.antalRunder}`,
      `Præmie: ${form.praemieBeskrivelse} (værdi ${form.praemieVaerdi} DKK)`,
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.navn,
          email: form.email,
          phone: form.telefon || undefined,
          company: company?.name ?? form.navn,
          topic: "Hole-in-one forsikring · tilbudsanmodning",
          message,
          customerMessage,
          clientId: getClientId(),
          attribution: getAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke sende.");
      track("hole_in_one_completed", {
        cvr: company?.vat ?? digits,
        praemie_vaerdi: form.praemieVaerdi,
        klubnavn: form.klubnavn,
      });
      if (company) {
        setRecentSigned({
          signedAt: new Date().toISOString(),
          companyName: company.name,
          cvr: company.vat,
          kind: "hole_in_one",
        });
      }
      setStep("done");
      setTimeout(() => scrollCardIntoView("center"), 80);
      setTimeout(() => router.push("/"), 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt.");
    } finally {
      setSubmitting(false);
    }
  }

  // Card sizing per step
  const widthClass =
    step === "form"
      ? "max-w-[820px]"
      : step === "done"
      ? "max-w-[520px]"
      : "max-w-[480px]";

  // Step indicator stage progression: cvr / confirm / form (=actions stage)
  const STAGES: Step[] = ["cvr", "confirm", "form"];
  const stageIndex = step === "done" ? 2 : STAGES.indexOf(step);
  const progress = step === "done" ? 100 : ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div
      ref={cardRef}
      id="cvr-card"
      className={`mx-auto w-full ${widthClass} bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)] transition-[max-width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]`}
    >
      {/* HEADER */}
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            Hole-in-one tilbud
          </div>
          {step !== "done" ? (
            <span className="text-[0.7rem] text-white/60 font-mono">
              {Math.min(stageIndex + 1, STAGES.length)}/{STAGES.length}
            </span>
          ) : null}
        </div>
        <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
          {STEP_LABELS[step]}
        </div>
        <div className="mt-4 h-[3px] bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[color:var(--color-nordan-accent)] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* BODY */}
      <div className="p-5 sm:p-7">
        {step === "cvr" && (
          <CvrInput
            digits={digits}
            cvrComplete={cvrComplete}
            setCvr={setCvr}
            onSubmit={handleCvrSubmit}
            loading={lookupState === "loading"}
            error={error}
            onSkip={skipCvr}
          />
        )}
        {step === "confirm" && company && (
          <Confirm
            company={company}
            onBack={() => setStep("cvr")}
            onNext={() => setStep("form")}
          />
        )}
        {step === "form" && company && (
          <FormStep
            company={company}
            form={form}
            setF={setF}
            attemptedSubmit={attemptedSubmit}
            missing={getMissingFields()}
            onSubmit={handleFormSubmit}
            submitting={submitting}
            error={error}
            formComplete={formComplete}
            onBack={() => setStep("confirm")}
          />
        )}
        {step === "done" && <Done company={company} email={form.email} />}
      </div>
    </div>
  );
}

/* -------------------- CVR input -------------------- */
function CvrInput({
  digits,
  cvrComplete,
  setCvr,
  onSubmit,
  loading,
  error,
  onSkip,
}: {
  digits: string;
  cvrComplete: boolean;
  setCvr: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onSkip: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label htmlFor="hio-cvr-input" className="block">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-muted)]">
            CVR-nummer
          </span>
          <span
            className={`text-[0.72rem] font-mono ${
              cvrComplete ? "text-[color:var(--color-nordan-dark)]" : "text-[color:var(--color-nordan-muted)]"
            }`}
          >
            {digits.length}/8
          </span>
        </div>
        <input
          id="hio-cvr-input"
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
        disabled={loading || !cvrComplete}
        className="group w-full h-[58px] inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.95rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] disabled:bg-[color:var(--color-nordan-accent-soft)] disabled:hover:bg-[color:var(--color-nordan-accent-soft)] disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Henter virksomhed…</span>
          </>
        ) : (
          <>
            <span>Næste</span>
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
          </>
        )}
      </button>

      {error ? (
        <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      ) : null}

      {process.env.NODE_ENV !== "production" ? (
        <button
          type="button"
          onClick={onSkip}
          className="mt-2 w-full text-center text-[0.72rem] text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-dark)] underline underline-offset-2"
        >
          Spring CVR-opslag over (dev)
        </button>
      ) : null}
    </form>
  );
}

/* -------------------- Confirm -------------------- */
function Confirm({
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
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-[50px] px-5 rounded-[8px] border border-[color:var(--color-nordan-line)] text-[0.88rem] font-medium text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-ink-soft)]"
        >
          Skift CVR
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 h-[50px] inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] transition-colors"
        >
          <span>Ja, fortsæt</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

/* -------------------- Form -------------------- */
function FormStep({
  company,
  form,
  setF,
  attemptedSubmit,
  missing,
  onSubmit,
  submitting,
  error,
  formComplete,
  onBack,
}: {
  company: Company;
  form: FormState;
  setF: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  attemptedSubmit: boolean;
  missing: string[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  error: string | null;
  formComplete: boolean;
  onBack: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="text-[0.82rem] text-[color:var(--color-nordan-muted)] -mt-2">
        Bestilling for <strong className="text-[color:var(--color-nordan-ink)]">{company.name}</strong>{" "}
        · CVR {company.vat}
      </div>

      <Section title="Hvem ringer vi til?">
        <Row>
          <Field label="Navn" value={form.navn} onChange={(v) => setF("navn", v)} required />
          <Field label="Telefon" type="tel" value={form.telefon} onChange={(v) => setF("telefon", v)} required />
        </Row>
        <Field label="E-mail" type="email" value={form.email} onChange={(v) => setF("email", v)} required />
      </Section>

      <Section title="Turneringen" subtitle="Hvor og hvornår spilles det?">
        <Row>
          <Field label="Dato" type="date" value={form.dato} onChange={(v) => setF("dato", v)} required />
          <Field label="Bane / Klub" value={form.klubnavn} onChange={(v) => setF("klubnavn", v)} required />
        </Row>
        <Row>
          <Field label="Hullets nummer" inputMode="numeric" value={form.hulNummer} onChange={(v) => setF("hulNummer", v)} required />
          <Field label="Index / Hcp" value={form.hulHcp} onChange={(v) => setF("hulHcp", v)} />
        </Row>
        <Group label="Hullets længde (i meter)">
          <Field label="Herre tee" inputMode="numeric" value={form.laengdeHerre} onChange={(v) => setF("laengdeHerre", v)} compact />
          <Field label="Dame tee" inputMode="numeric" value={form.laengdeDame} onChange={(v) => setF("laengdeDame", v)} compact />
          <Field label="Klub pro" inputMode="numeric" value={form.laengdeKlubpro} onChange={(v) => setF("laengdeKlubpro", v)} compact />
        </Group>
        <Group label="Antal deltagere">
          <Field label="Mænd" inputMode="numeric" value={form.antalMaend} onChange={(v) => setF("antalMaend", v)} compact />
          <Field label="Damer" inputMode="numeric" value={form.antalDamer} onChange={(v) => setF("antalDamer", v)} compact />
          <Field label="Pros" inputMode="numeric" value={form.antalPros} onChange={(v) => setF("antalPros", v)} compact />
        </Group>
        <Field
          label="Hvor mange gange spilles hullet?"
          inputMode="numeric"
          value={form.antalRunder}
          onChange={(v) => setF("antalRunder", v)}
        />
      </Section>

      <Section title="Præmien" subtitle="Hvad vinder spilleren ved hole-in-one?">
        <Field label="Beskrivelse af præmien" value={form.praemieBeskrivelse} onChange={(v) => setF("praemieBeskrivelse", v)} required />
        <Row>
          <Field label="Værdi (DKK)" inputMode="numeric" value={form.praemieVaerdi} onChange={(v) => setF("praemieVaerdi", v)} required />
          <Field label="Leverandør af præmien" value={form.praemieLeverandoer} onChange={(v) => setF("praemieLeverandoer", v)} />
        </Row>
      </Section>

      {attemptedSubmit && missing.length > 0 ? (
        <div className="text-[0.85rem] text-amber-900 bg-amber-50 border border-amber-200 rounded-[8px] px-3.5 py-2.5">
          <div className="font-semibold mb-0.5">Mangler før vi kan sende:</div>
          <ul className="list-disc pl-5 space-y-0.5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      ) : null}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2.5 pt-2 border-t border-[color:var(--color-nordan-line)]">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="h-[44px] px-5 rounded-[8px] border border-[color:var(--color-nordan-line)] text-[0.85rem] font-medium text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-ink-soft)] disabled:opacity-60"
        >
          Tilbage
        </button>
        <button
          type="submit"
          disabled={submitting}
          aria-disabled={!formComplete}
          className={`flex-1 h-[44px] inline-flex items-center justify-center gap-2 text-white text-[0.9rem] font-semibold tracking-wide rounded-[8px] transition-all bg-[color:var(--color-nordan-dark)] hover:bg-[color:var(--color-nordan-dark-deep)] ${
            formComplete && !submitting
              ? "brightness-[1.12] shadow-[0_6px_22px_rgba(36,65,52,0.32)]"
              : "shadow-[0_2px_10px_rgba(36,65,52,0.18)]"
          } disabled:opacity-60`}
        >
          {submitting ? (
            <>
              <Spinner />
              <span>Sender…</span>
            </>
          ) : (
            <>
              <span>Send &amp; få tilbud →</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* -------------------- Done -------------------- */
function Done({ company, email }: { company: Company | null; email: string }) {
  return (
    <div className="py-4 text-center">
      <div className="inline-flex w-14 h-14 rounded-full bg-[color:var(--color-nordan-accent)] text-white items-center justify-center mb-4">
        <IconCheck />
      </div>
      <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] mb-2">
        Tak — vi er på sagen
      </div>
      <p className="text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed max-w-sm mx-auto">
        Vi vender tilbage til <strong>{email || (company?.name ?? "dig")}</strong> med et tilbud inden for én hverdag.
      </p>
    </div>
  );
}

/* -------------------- Helpers -------------------- */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-semibold text-[1rem] text-[color:var(--color-nordan-ink)]">{title}</h2>
        {subtitle ? (
          <p className="text-[0.82rem] text-[color:var(--color-nordan-muted)] mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-2">
        {label}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
  inputMode,
  maxLength,
  compact = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  compact?: boolean;
}) {
  return (
    <label className="block">
      {!compact ? (
        <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-1.5">
          {label} {required ? <span className="text-[color:var(--color-nordan-accent)]">*</span> : null}
        </div>
      ) : null}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={compact ? label : undefined}
        className="w-full h-11 px-3.5 bg-[color:var(--color-nordan-soft)] border-2 border-transparent rounded-[7px] focus:outline-none focus:border-[color:var(--color-nordan-accent)] focus:bg-white text-[0.92rem] text-[color:var(--color-nordan-ink)] placeholder:text-[color:var(--color-nordan-muted)]/70 transition-colors"
      />
    </label>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
