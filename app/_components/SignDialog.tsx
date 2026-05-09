"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { track } from "./GoogleAnalytics";

export type SignResult = {
  auditId: string;
  signedAt: string;
  finalHash: string;
  blobUrl: string | null;
  fileName: string;
  signerName?: string;
  signerEmail?: string;
  signerPhone?: string | null;
  companyName?: string;
  cvr?: string;
  insurers?: string[];
  internalSubject?: string;
  receiptSubject?: string;
  internalMessageId?: string;
  receiptMessageId?: string;
};

const INSURER_GROUPS: { label: string; items: string[] }[] = [
  {
    label: "Danske skadesforsikrings­selskaber",
    items: [
      "Tryg Forsikring",
      "Topdanmark Forsikring",
      "If Skadeforsikring",
      "Codan Forsikring",
      "Alm. Brand Forsikring",
      "Gjensidige Forsikring",
      "Alka Forsikring",
      "LB Forsikring",
      "GF Forsikring",
      "AXA Forsikring",
    ],
  },
  {
    label: "Niche & lokale selskaber",
    items: [
      "Aros Forsikring",
      "Bornholms Brandforsikring",
      "Sønderjysk Forsikring",
      "Thisted Forsikring",
      "FDM Forsikringer",
      "Europæiske Rejseforsikring",
      "Forsia Forsikring",
      "Frida Forsikring",
      "Dansk Boligforsikring",
      "Bauta Forsikring",
      "Alpha Insurance",
    ],
  },
  {
    label: "Pension & liv",
    items: ["PFA Pension", "PFA Forsikring", "Danica Pension", "Nordea Liv & Pension"],
  },
  {
    label: "Internationale selskaber",
    items: [
      "AIG",
      "HDI",
      "Chubb",
      "Zurich",
      "Lloyd's",
      "Allianz",
      "QBE",
      "Baltic Finance Underwriting",
      "Riskpoint",
      "Viking",
    ],
  },
];

const INSURER_OPTIONS = INSURER_GROUPS.flatMap((g) => g.items);

type Props = {
  open: boolean;
  onClose: () => void;
  onSigned: (result: SignResult) => void;
  defaults: {
    name?: string;
    email?: string;
    phone?: string;
    companyName: string;
    cvr: string;
  };
};

export function SignDialog({ open, onClose, onSigned, defaults }: Props) {
  const [name, setName] = useState(defaults.name ?? "");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState(defaults.email ?? "");
  const [phone, setPhone] = useState(defaults.phone ?? "");
  const [insurers, setInsurers] = useState<string[]>([]);
  const [otherInsurers, setOtherInsurers] = useState("");
  const [showOtherField, setShowOtherField] = useState(false);
  const [insurerSearch, setInsurerSearch] = useState("");
  const [insurerOpen, setInsurerOpen] = useState(false);
  const [combinedConsent, setCombinedConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    track("sign_dialog_opened", { company: defaults.companyName, cvr: defaults.cvr });
    setName(defaults.name ?? "");
    setEmail(defaults.email ?? "");
    setPhone(defaults.phone ?? "");
    setInsurers([]);
    setOtherInsurers("");
    setShowOtherField(false);
    setInsurerSearch("");
    setInsurerOpen(false);
    setCombinedConsent(false);
    setTitle("");
    setError(null);
    userScrolledRef.current = false;
  }, [open, defaults.name, defaults.email, defaults.phone]);

  // Auto-bounce the document every 7s to hint that it's scrollable —
  // stops as soon as the user makes any real scroll gesture themselves.
  useEffect(() => {
    if (!open) return;
    const node = docRef.current;
    if (!node) return;

    const markUserScrolled = () => {
      userScrolledRef.current = true;
    };
    node.addEventListener("wheel", markUserScrolled, { passive: true });
    node.addEventListener("touchmove", markUserScrolled, { passive: true });
    node.addEventListener("keydown", markUserScrolled);

    const interval = setInterval(() => {
      if (userScrolledRef.current || !docRef.current) return;
      // Only bounce if we're at the top — once they're elsewhere they got it.
      if (docRef.current.scrollTop > 4) return;
      docRef.current.scrollTo({ top: 32, behavior: "smooth" });
      setTimeout(() => {
        if (docRef.current && !userScrolledRef.current) {
          docRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 900);
    }, 7000);

    return () => {
      clearInterval(interval);
      node.removeEventListener("wheel", markUserScrolled);
      node.removeEventListener("touchmove", markUserScrolled);
      node.removeEventListener("keydown", markUserScrolled);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const formComplete =
    name.trim().length > 1 &&
    title.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim().length >= 6 &&
    combinedConsent;

  const filteredInsurers = useMemo(() => {
    const q = insurerSearch.trim().toLowerCase();
    if (!q) return INSURER_OPTIONS.filter((opt) => !insurers.includes(opt)).slice(0, 12);
    return INSURER_OPTIONS.filter(
      (opt) => opt.toLowerCase().includes(q) && !insurers.includes(opt)
    ).slice(0, 12);
  }, [insurerSearch, insurers]);

  function addInsurer(name: string) {
    setInsurers((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setInsurerSearch("");
  }

  function removeInsurer(name: string) {
    setInsurers((prev) => prev.filter((n) => n !== name));
  }

  async function handleSubmit() {
    if (!formComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const otherList = otherInsurers
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const allInsurers = [...insurers, ...otherList];
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          email: email.trim(),
          phone: phone.trim(),
          companyName: defaults.companyName,
          cvr: defaults.cvr,
          insurers: allInsurers,
          // Combined consent covers all three legal points; we still send all
          // three flags to /api/sign so the audit trail records each one.
          consent: { read: combinedConsent, authorized: combinedConsent, eidas: combinedConsent },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke underskrive");
      track("sign_completed", {
        company: defaults.companyName,
        cvr: defaults.cvr,
        insurers_count: allInsurers.length,
        audit_id: (data as SignResult).auditId,
        // Pass signer details so /api/track persists them on the session row.
        // Without this, "Aktivitet pr. virksomhed" shows "ingen oplyst" even
        // though the same details were just submitted to /api/sign.
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      onSigned(data as SignResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const dialog = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-3 py-6 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[1040px] max-h-[92vh] bg-white rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-[color:var(--color-nordan-line)] flex items-center justify-between">
          <div>
            <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
              Elektronisk signering
            </div>
            <div className="font-bold text-[1.1rem] text-[color:var(--color-nordan-ink)]">
              Undersøgelsesfuldmagt
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full grid place-items-center hover:bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-muted)] text-[1.4rem]"
            aria-label="Luk"
          >
            ×
          </button>
        </div>

        {/* Two-column body: doc on left (scrolls), form on right (fits without scrolling) */}
        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1fr_1.05fr]">
          {/* LEFT — document, scrollable, with scroll-hint bounce */}
          <div
            ref={docRef}
            tabIndex={0}
            className="overflow-y-auto px-5 sm:px-7 py-6 border-b lg:border-b-0 lg:border-r border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)]/40 max-h-[40vh] lg:max-h-none scroll-smooth"
          >
            {/* TL;DR card */}
            <div className="bg-white border border-[color:var(--color-nordan-line)] rounded-[10px] p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent)]" />
                <h3 className="text-[0.74rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
                  Hvad du underskriver
                </h3>
              </div>
              <ul className="space-y-1.5 text-[0.9rem] text-[color:var(--color-nordan-ink)] leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-[color:var(--color-nordan-accent)] shrink-0">✓</span>
                  <span>Tilladelse til at <strong>indhente policer og skadehistorik</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[color:var(--color-nordan-accent)] shrink-0">✓</span>
                  <span><strong>Ingen forsikringer ændres eller opsiges</strong> — kun analyse.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[color:var(--color-nordan-accent)] shrink-0">✓</span>
                  <span><strong>Kan tilbagekaldes når som helst</strong>; ophører automatisk efter 1 år.</span>
                </li>
              </ul>
              <div className="mt-3 text-[0.74rem] text-[color:var(--color-nordan-muted)] italic">
                ↓ Scroll for at læse fuldmagten
              </div>
            </div>

            {/* Full document */}
            <div className="bg-white border border-[color:var(--color-nordan-line)] rounded-[8px] p-5 sm:p-6 text-[0.9rem] leading-[1.6] text-[color:var(--color-nordan-ink)] shadow-sm">
              <div className="text-center mb-5">
                <div className="font-bold text-[1.2rem] text-[color:var(--color-nordan-dark)]">
                  Undersøgelsesfuldmagt
                </div>
                <div className="text-[0.8rem] text-[color:var(--color-nordan-muted)] mt-1">
                  til forsikringsmægler
                </div>
              </div>
              <p className="mb-3">
                <strong>Virksomhedsnavn:</strong> {defaults.companyName}
                <br />
                <strong>CVR-nr.:</strong> {defaults.cvr}
                <br />
                <span className="text-[color:var(--color-nordan-muted)] text-[0.82rem]">
                  (I det følgende kaldet &ldquo;Fuldmagtsgiver&rdquo;)
                </span>
              </p>
              <p className="mb-3">
                <strong>Nordan Risk Partners ApS</strong>
                <br />
                CVR-nr.: 4595 3769
                <br />
                Toftevej 15B, 3450 Allerød
              </p>
              <p className="mb-3">
                Det bekræftes herved, at Fuldmagtsgiver har truffet aftale med Nordan Risk Partners om, at Nordan Risk Partners fra dags dato er udpeget som forsikringsmægler til undersøgelse af forsikringsmarkedet. Fuldmagten er ikke eksklusiv og erstatter ikke tidligere udstedte forsikringsmæglerfuldmagter.
              </p>
              <p className="mb-2">Denne undersøgelsesfuldmagt bemyndiger forsikringsmægleren til på Fuldmagtsgivers vegne:</p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>at indhente oplysninger om samtlige bestående forsikringer hos enhver forsikringsdistributør, herunder policer, vilkår, præmier og selvbehold,</li>
                <li>at indhente oplysninger om skadehistorik, skadestatistikker, skadereserver og risikovurderinger,</li>
                <li>at afgive risikooplysninger og indhente tilbud på forsikringer inden for skadesforsikringsområdet.</li>
              </ul>
              <p className="mb-3">
                Annullering af eksisterende forsikringer eller etablering af nye forsikringer kræver, at der gives eksklusiv forsikringsmæglerfuldmagt til Nordan Risk Partners.
              </p>
              <p className="mb-3">
                Fuldmagtsgiver er gjort opmærksomme på, at oplysninger, som forsikringsmægleren videregiver til forsikringsdistributører, sidestilles med oplysninger afgivet af Fuldmagtsgiver.
              </p>
              <p className="mb-3">
                Fuldmagten kan til enhver tid tilbagekaldes skriftligt og ophører automatisk 1 år efter underskriftsdatoen, såfremt den ikke er tilbagekaldt forinden.
              </p>
              <p className="mb-3">
                Fuldmagtsgiver påpeger, at nuværende forsikringsmægler ikke involveres eller orienteres om nærværende undersøgelsesfuldmagt.
              </p>
              <p>
                Underskriver indestår for at være berettiget til at underskrive denne undersøgelsesfuldmagt og dermed berettiget til at forpligte Fuldmagtsgiver.
              </p>
            </div>
          </div>

          {/* RIGHT — compact form, no internal scroll */}
          <div className="p-5 sm:p-7 flex flex-col gap-5 overflow-y-auto lg:overflow-visible">
            {/* Signer */}
            <section>
              <h3 className="text-[0.74rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-muted)] mb-2.5">
                Hvem underskriver?
              </h3>
              <div className="space-y-2.5">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Field label="Fuldt navn">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Fornavn Efternavn"
                      className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem]"
                    />
                  </Field>
                  <Field label="Titel">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="fx Direktør"
                      className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem]"
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <Field label="E-mail">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="navn@firma.dk"
                      className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem]"
                    />
                  </Field>
                  <Field label="Telefon">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+45 12 34 56 78"
                      className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem]"
                    />
                  </Field>
                </div>
                <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">
                  På vegne af{" "}
                  <strong className="text-[color:var(--color-nordan-ink)]">{defaults.companyName}</strong>{" "}
                  · CVR {defaults.cvr}
                </div>
              </div>
            </section>

            {/* Insurers */}
            <section>
              <div className="flex items-baseline justify-between mb-1.5">
                <h3 className="text-[0.74rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-muted)]">
                  Forsikringsselskaber I bruger i dag
                </h3>
                <span className="text-[0.7rem] text-[color:var(--color-nordan-muted)]">
                  Vælg flere
                </span>
              </div>
              <p className="text-[0.78rem] text-[color:var(--color-nordan-ink-soft)] leading-snug mb-2">
                Hjælper os med at gå direkte til de rigtige selskaber.
              </p>

              {insurers.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {insurers.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-0.5 rounded-full bg-[color:var(--color-nordan-accent)] text-white text-[0.78rem] font-medium"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => removeInsurer(opt)}
                        className="w-4 h-4 rounded-full grid place-items-center hover:bg-white/20 text-[0.92rem] leading-none"
                        aria-label={`Fjern ${opt}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="relative">
                <input
                  type="text"
                  value={insurerSearch}
                  onChange={(e) => {
                    setInsurerSearch(e.target.value);
                    setInsurerOpen(true);
                  }}
                  onFocus={() => setInsurerOpen(true)}
                  onBlur={() => setTimeout(() => setInsurerOpen(false), 150)}
                  placeholder={insurers.length > 0 ? "Tilføj endnu et selskab…" : "Søg eller vælg fra listen…"}
                  className="w-full h-10 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem]"
                />
                {insurerOpen && filteredInsurers.length > 0 ? (
                  <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[color:var(--color-nordan-line)] rounded-[8px] shadow-lg max-h-[220px] overflow-y-auto">
                    {filteredInsurers.map((opt) => (
                      <li key={opt}>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addInsurer(opt);
                          }}
                          className="w-full text-left px-3 py-2 text-[0.9rem] hover:bg-[color:var(--color-nordan-soft)]"
                        >
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {!showOtherField ? (
                <button
                  type="button"
                  onClick={() => setShowOtherField(true)}
                  className="mt-1.5 text-[0.78rem] text-[color:var(--color-nordan-accent)] font-medium hover:underline"
                >
                  + Selskab ikke på listen?
                </button>
              ) : (
                <input
                  type="text"
                  value={otherInsurers}
                  onChange={(e) => setOtherInsurers(e.target.value)}
                  placeholder="Skriv selskaber adskilt med komma"
                  className="mt-1.5 w-full h-9 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.85rem]"
                />
              )}
            </section>

            {/* Combined consent */}
            <section className="mt-auto">
              <label className="flex gap-3 items-start cursor-pointer p-3 rounded-[8px] hover:bg-[color:var(--color-nordan-soft)]/40 transition-colors border border-[color:var(--color-nordan-line)] has-[:checked]:border-[color:var(--color-nordan-accent)] has-[:checked]:bg-[color:var(--color-nordan-accent)]/5">
                <input
                  type="checkbox"
                  checked={combinedConsent}
                  onChange={(e) => setCombinedConsent(e.target.checked)}
                  className="mt-0.5 w-5 h-5 accent-[color:var(--color-nordan-accent)] shrink-0"
                />
                <span className="text-[0.85rem] leading-snug text-[color:var(--color-nordan-ink)]">
                  Jeg har læst undersøgelsesfuldmagten og <strong>er bemyndiget til at underskrive på vegne af {defaults.companyName}</strong>. Jeg samtykker til elektronisk signering iht. eIDAS art. 25.
                </span>
              </label>

              {error ? (
                <div className="mt-2 text-[0.82rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              ) : null}
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-[color:var(--color-nordan-line)] flex flex-col sm:flex-row sm:items-center gap-3 bg-[color:var(--color-nordan-soft)]/30">
          <div className="text-[0.74rem] text-[color:var(--color-nordan-muted)] flex-1 leading-snug">
            Underskrift logges med tidspunkt, IP og browser. Du modtager en kopi pr. mail.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-11 px-4 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[0.88rem] font-medium text-[color:var(--color-nordan-ink-soft)] hover:border-[color:var(--color-nordan-ink-soft)]"
            >
              Annullér
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !formComplete}
              className={`h-11 px-5 rounded-[6px] text-white text-[0.9rem] font-semibold transition-colors ${
                formComplete && !submitting
                  ? "bg-[color:var(--color-nordan-accent)] hover:bg-[#8f715f]"
                  : "bg-[color:var(--color-nordan-accent)]/50 cursor-not-allowed"
              }`}
            >
              {submitting ? "Underskriver…" : "Underskriv & send →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.74rem] font-semibold text-[color:var(--color-nordan-muted)] uppercase tracking-[0.16em] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
