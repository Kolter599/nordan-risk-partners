"use client";

import { useState } from "react";
import { track } from "../../_components/GoogleAnalytics";

type State = {
  // Forsikringstager
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

export function HoleInOneForm({ initialCvr }: { initialCvr: string }) {
  const [s, setS] = useState<State>({ ...EMPTY, cvr: initialCvr });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke sende.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-8 sm:p-10 text-center">
        <div className="inline-flex w-14 h-14 rounded-full bg-[color:var(--color-nordan-accent)] text-white items-center justify-center mb-4 text-2xl">
          ✓
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[1.6rem] mb-2">
          Tak — vi er på sagen
        </h2>
        <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
          Vi vender tilbage til {s.email} med et tilbud inden for én hverdag.
          Har du spørgsmål imens, er du velkommen til at ringe på{" "}
          <a href="tel:+4553520006" className="text-[color:var(--color-nordan-accent)] underline">
            +45 53 52 00 06
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-6 sm:p-8 md:p-10 space-y-8"
    >
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
        <div>
          <Label>Hullets længde (i meter)</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Herre tee" inputMode="numeric" value={s.laengdeHerre} onChange={(v) => set("laengdeHerre", v)} required compact />
            <Field label="Dame tee" inputMode="numeric" value={s.laengdeDame} onChange={(v) => set("laengdeDame", v)} required compact />
            <Field label="Klub pro" inputMode="numeric" value={s.laengdeKlubpro} onChange={(v) => set("laengdeKlubpro", v)} required compact />
          </div>
        </div>
        <div>
          <Label>Antal deltagere</Label>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Mænd" inputMode="numeric" value={s.antalMaend} onChange={(v) => set("antalMaend", v)} required compact />
            <Field label="Damer" inputMode="numeric" value={s.antalDamer} onChange={(v) => set("antalDamer", v)} required compact />
            <Field label="Pros" inputMode="numeric" value={s.antalPros} onChange={(v) => set("antalPros", v)} required compact />
          </div>
        </div>
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

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[color:var(--color-nordan-line)]">
        <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] leading-snug max-w-md">
          Tryk send — så modtager Nordan Risk Partners din anmodning og vender
          tilbage med et tilbud inden for én hverdag.
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-[52px] px-6 inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide rounded-[8px] hover:bg-[#8f715f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Sender…" : "Send & få tilbud →"}
        </button>
      </div>
    </form>
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.78rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-2">
      {children}
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
        <div className="text-[0.78rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-1.5">
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
        className="w-full h-12 px-3.5 rounded-[6px] bg-[color:var(--color-nordan-soft)] border-2 border-transparent focus:outline-none focus:border-[color:var(--color-nordan-accent)] focus:bg-white text-[0.95rem] text-[color:var(--color-nordan-ink)] placeholder:text-[color:var(--color-nordan-muted)]/70 transition-colors"
      />
    </label>
  );
}
