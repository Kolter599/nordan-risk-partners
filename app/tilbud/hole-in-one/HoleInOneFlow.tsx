"use client";

import { useEffect, useState } from "react";
import { track } from "../../_components/GoogleAnalytics";

type Stage = "form" | "done";

type State = {
  // Forsikringstager (auto-fillable from CVR API)
  navn: string;
  adresse: string;
  cvr: string;
  telefon: string;
  email: string;
  // Konkurrencen
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

const EMPTY: State = {
  navn: "",
  adresse: "",
  cvr: "",
  telefon: "",
  email: "",
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

export function HoleInOneFlow({ initialCvr }: { initialCvr: string }) {
  const [s, setS] = useState<State>({ ...EMPTY, cvr: initialCvr });
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [lookupNote, setLookupNote] = useState<string | null>(null);

  // Auto-fill from CVR API on mount — go through our /api/cvr proxy so we
  // hit cvrapi.dk from an EU edge region with the right User-Agent
  // (browser-direct calls hit QUOTA_EXCEEDED and get reported as "ikke
  // fundet").
  useEffect(() => {
    if (!initialCvr || initialCvr.length !== 8) return;
    let cancelled = false;
    async function lookup() {
      setLookupState("loading");
      try {
        const res = await fetch(`/api/cvr?cvr=${initialCvr}`);
        const data = (await res.json()) as
          | {
              ok: true;
              company: {
                name: string;
                vat: string;
                address: string | null;
                industry: string | null;
                employees: string | null;
              };
            }
          | { ok: false; error: string };
        if (cancelled) return;
        if (!data.ok) {
          setLookupState("error");
          setLookupNote(
            data.error === "not_found"
              ? "Virksomheden blev ikke fundet — udfyld venligst manuelt."
              : data.error === "quota"
              ? "CVR-opslaget er midlertidigt overbelastet — udfyld venligst manuelt."
              : "Vi kunne ikke slå CVR op — udfyld venligst manuelt."
          );
          return;
        }
        setS((prev) => ({
          ...prev,
          navn: prev.navn || data.company.name || "",
          adresse: prev.adresse || data.company.address || "",
          cvr: prev.cvr || data.company.vat,
        }));
        setLookupState("ok");
        setLookupNote(`Hentet fra CVR-registret · ${data.company.name}`);
        track("hole_in_one_prefilled", { cvr: initialCvr });
      } catch {
        if (cancelled) return;
        setLookupState("error");
        setLookupNote("Vi kunne ikke slå CVR op — udfyld venligst manuelt.");
      }
    }
    void lookup();
    return () => {
      cancelled = true;
    };
  }, [initialCvr]);

  function set<K extends keyof State>(key: K, value: State[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    track("hole_in_one_submitted", { cvr: s.cvr });

    const message = [
      "=== FORSIKRINGSTAGER ===",
      `Navn: ${s.navn}`,
      `Adresse: ${s.adresse}`,
      `CVR: ${s.cvr}`,
      `Telefon: ${s.telefon}`,
      `E-mail: ${s.email}`,
      "",
      "=== TURNERINGEN ===",
      `Dato: ${s.dato}`,
      `Bane / Klub: ${s.klubnavn}`,
      `Hullets nummer: ${s.hulNummer}`,
      `Hullets index/Hcp: ${s.hulHcp}`,
      `Længde (herre tee): ${s.laengdeHerre} m`,
      `Længde (dame tee): ${s.laengdeDame} m`,
      `Længde (klub pro): ${s.laengdeKlubpro} m`,
      `Antal mænd: ${s.antalMaend}`,
      `Antal damer: ${s.antalDamer}`,
      `Antal pros: ${s.antalPros}`,
      `Hullet spilles (antal runder): ${s.antalRunder}`,
      "",
      "=== PRÆMIEN ===",
      `Beskrivelse: ${s.praemieBeskrivelse}`,
      `Værdi: ${s.praemieVaerdi}`,
      `Leverandør: ${s.praemieLeverandoer}`,
    ].join("\n");

    const customerMessage = [
      `Bane / Klub: ${s.klubnavn}`,
      `Dato: ${s.dato}`,
      `Hullets nummer: ${s.hulNummer}`,
      `Antal deltagere: ${s.antalMaend} mænd · ${s.antalDamer} damer · ${s.antalPros} pros`,
      `Antal runder: ${s.antalRunder}`,
      `Præmie: ${s.praemieBeskrivelse} (værdi ${s.praemieVaerdi} DKK)`,
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.navn,
          email: s.email,
          phone: s.telefon || undefined,
          company: s.navn,
          topic: "Hole-in-one forsikring · tilbudsanmodning",
          message,
          customerMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke sende.");
      track("hole_in_one_completed", {
        cvr: s.cvr,
        praemie_vaerdi: s.praemieVaerdi,
        klubnavn: s.klubnavn,
      });
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="mx-auto w-full max-w-[640px] bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)]">
        <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white">
          <div className="inline-flex items-center gap-2 mb-3 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            Tilbudsanmodning sendt
          </div>
          <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
            Tak — vi er på sagen.
          </div>
        </div>
        <div className="p-6 sm:p-8 text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-full bg-[color:var(--color-nordan-accent)]/15 text-[color:var(--color-nordan-accent)] items-center justify-center mb-1 text-2xl">
            ✓
          </div>
          <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
            Vi vender tilbage til <strong>{s.email}</strong> med et tilbud inden for én hverdag.
          </p>
          <p className="text-[0.85rem] text-[color:var(--color-nordan-muted)]">
            Spørgsmål imens? Ring{" "}
            <a href="tel:+4553520006" className="text-[color:var(--color-nordan-accent)] underline">
              +45 53 52 00 06
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.35)] overflow-hidden text-[color:var(--color-nordan-ink)]">
      {/* HEADER */}
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4 sm:pb-5 bg-gradient-to-br from-[color:var(--color-nordan-dark)] to-[color:var(--color-nordan-dark-deep)] text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent-soft)]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent-soft)]" />
            Hole-in-one tilbud
          </div>
          {lookupState === "loading" ? (
            <span className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">
              <Spinner /> Henter CVR
            </span>
          ) : lookupState === "ok" ? (
            <span className="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-accent-soft)] bg-white/10 px-2.5 py-1 rounded-full">
              ✓ Forudfyldt
            </span>
          ) : null}
        </div>
        <div className="font-[family-name:var(--font-inter)] font-bold text-[1.2rem] sm:text-[1.4rem] leading-[1.15] tracking-[-0.02em]">
          Bestil tilbud — udfyld turneringen
        </div>
        {/* progress bar */}
        <div className="mt-4 h-1 rounded-full bg-white/12 overflow-hidden">
          <div
            className="h-full bg-[color:var(--color-nordan-accent-soft)] transition-all duration-700"
            style={{ width: stage === "form" ? "60%" : "100%" }}
          />
        </div>
      </div>

      {/* BODY */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 md:p-8 space-y-7">
        {lookupNote ? (
          <div
            className={`text-[0.82rem] px-3.5 py-2.5 rounded-[6px] border ${
              lookupState === "ok"
                ? "bg-[color:var(--color-nordan-accent)]/8 border-[color:var(--color-nordan-accent)]/25 text-[color:var(--color-nordan-ink)]"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {lookupNote}
          </div>
        ) : null}

        <Section title="Forsikringstager" subtitle="Hvem skal forsikringen tegnes til?">
          <Field label="Virksomhedsnavn" value={s.navn} onChange={(v) => set("navn", v)} required />
          <Field label="Adresse" value={s.adresse} onChange={(v) => set("adresse", v)} required />
          <Row>
            <Field label="CVR" value={s.cvr} onChange={(v) => set("cvr", v)} required inputMode="numeric" maxLength={8} />
            <Field label="Telefon" type="tel" value={s.telefon} onChange={(v) => set("telefon", v)} required />
          </Row>
          <Field label="E-mail" type="email" value={s.email} onChange={(v) => set("email", v)} required />
        </Section>

        <Section title="Turneringen" subtitle="Hvor og hvornår spilles det?">
          <Row>
            <Field label="Dato" type="date" value={s.dato} onChange={(v) => set("dato", v)} required />
            <Field label="Bane / Klub" value={s.klubnavn} onChange={(v) => set("klubnavn", v)} required />
          </Row>
          <Row>
            <Field label="Hullets nummer" inputMode="numeric" value={s.hulNummer} onChange={(v) => set("hulNummer", v)} required />
            <Field label="Index / Hcp" value={s.hulHcp} onChange={(v) => set("hulHcp", v)} required />
          </Row>
          <Group label="Hullets længde (i meter)">
            <Field label="Herre tee" inputMode="numeric" value={s.laengdeHerre} onChange={(v) => set("laengdeHerre", v)} required compact />
            <Field label="Dame tee" inputMode="numeric" value={s.laengdeDame} onChange={(v) => set("laengdeDame", v)} required compact />
            <Field label="Klub pro" inputMode="numeric" value={s.laengdeKlubpro} onChange={(v) => set("laengdeKlubpro", v)} required compact />
          </Group>
          <Group label="Antal deltagere">
            <Field label="Mænd" inputMode="numeric" value={s.antalMaend} onChange={(v) => set("antalMaend", v)} required compact />
            <Field label="Damer" inputMode="numeric" value={s.antalDamer} onChange={(v) => set("antalDamer", v)} required compact />
            <Field label="Pros" inputMode="numeric" value={s.antalPros} onChange={(v) => set("antalPros", v)} required compact />
          </Group>
          <Field
            label="Hvor mange gange spilles hullet?"
            inputMode="numeric"
            value={s.antalRunder}
            onChange={(v) => set("antalRunder", v)}
            required
          />
        </Section>

        <Section title="Præmien" subtitle="Hvad vinder spilleren ved hole-in-one?">
          <Field label="Beskrivelse af præmien" value={s.praemieBeskrivelse} onChange={(v) => set("praemieBeskrivelse", v)} required />
          <Row>
            <Field label="Værdi (DKK)" inputMode="numeric" value={s.praemieVaerdi} onChange={(v) => set("praemieVaerdi", v)} required />
            <Field label="Leverandør af præmien" value={s.praemieLeverandoer} onChange={(v) => set("praemieLeverandoer", v)} required />
          </Row>
        </Section>

        {error ? (
          <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[color:var(--color-nordan-line)]">
          <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] leading-snug max-w-md">
            Tryk send — så modtager Nordan Risk Partners din anmodning og vender
            tilbage med et tilbud inden for én hverdag.
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-[52px] px-6 inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <Spinner />
                <span>Sender…</span>
              </>
            ) : (
              <>
                <span>Send &amp; få tilbud</span>
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

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
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-[1.05rem] text-[color:var(--color-nordan-ink)]">{title}</h2>
        {subtitle ? (
          <p className="text-[0.85rem] text-[color:var(--color-nordan-muted)] mt-0.5">{subtitle}</p>
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
      <div className="text-[0.78rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-2">
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
        <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-muted)] mb-2">
          {label}{" "}
          {required ? <span className="text-[color:var(--color-nordan-accent)]">*</span> : null}
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
        className="w-full h-12 px-4 bg-[color:var(--color-nordan-soft)] border-2 border-transparent rounded-[8px] focus:outline-none focus:border-[color:var(--color-nordan-accent)] focus:bg-white text-[0.95rem] text-[color:var(--color-nordan-ink)] placeholder:text-[color:var(--color-nordan-muted)]/70 transition-colors"
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
