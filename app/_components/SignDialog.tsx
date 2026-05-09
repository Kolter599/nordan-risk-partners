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
  const [confirming, setConfirming] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mobile only: split into read → fill steps so each screen has one focus.
  // Desktop ignores this and shows both columns side-by-side as before.
  const [mobileStep, setMobileStep] = useState<"read" | "fill">("read");

  const docRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

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
    setScrolledToBottom(false);
    setMobileStep("read");
  }, [open, defaults.name, defaults.email, defaults.phone]);

  // Track whether the user has reached the bottom of the doc — used to swap
  // the sticky bottom hint between "scroll to read" and "you've read it all".
  useEffect(() => {
    if (!open) return;
    const node = docRef.current;
    if (!node) return;
    const onScroll = () => {
      const reachedBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 24;
      if (reachedBottom) setScrolledToBottom(true);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [open]);

  // Smooth, eased scroll using requestAnimationFrame. easeInOutQuint is
  // softer than cubic — the bounce reads as a gentle invitation rather than
  // a yank.
  function easedScrollTo(target: number, duration = 1800) {
    const node = docRef.current;
    if (!node) return;
    const start = node.scrollTop;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;
    const startTime = performance.now();
    const ease = (t: number) =>
      t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
    function step(now: number) {
      const node = docRef.current;
      if (!node) return;
      if (userScrolledRef.current) return;
      const progress = Math.min((now - startTime) / duration, 1);
      node.scrollTop = start + distance * ease(progress);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Auto-bounce the document at a relaxed cadence. ~14s between bounces
  // keeps the hint visible without nagging.
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
      if (docRef.current.scrollTop > 6) return;
      // Down ~56px gently, hold, then back up — total ~4 seconds.
      easedScrollTo(56, 1800);
      setTimeout(() => {
        if (!userScrolledRef.current) easedScrollTo(0, 1800);
      }, 2100);
    }, 14000);

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

  function getMissingFields() {
    const missing: string[] = [];
    if (name.trim().length < 2) missing.push("Fuldt navn");
    if (title.trim().length === 0) missing.push("Titel");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) missing.push("Gyldig e-mail");
    if (phone.trim().length < 6) missing.push("Telefon");
    if (!combinedConsent) missing.push("Bekræftelse af fuldmagt");
    return missing;
  }

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
    if (submitting) return;
    if (!formComplete) {
      setAttemptedSubmit(true);
      return;
    }
    setSubmitting(true);
    setAttemptedSubmit(false);
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
      // Show the success animation for ~1.6s before handing off to the
      // parent (which closes the dialog). Gives the user a clear visual
      // beat so they trust the signature actually went through.
      setConfirming(true);
      setSubmitting(false);
      setTimeout(() => onSigned(data as SignResult), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt");
      setSubmitting(false);
    }
  }

  if (!open) return null;
  if (typeof document === "undefined") return null;

  if (confirming) {
    const confirmDialog = (
      <div className="fixed inset-0 z-[80] flex items-center justify-center px-3 py-6 sm:p-6 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-[420px] bg-white rounded-[14px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col items-center text-center px-7 py-10">
          <SuccessCircle />
          <div className="mt-6 font-bold text-[1.25rem] text-[color:var(--color-nordan-ink)]">
            Underskrevet
          </div>
          <div className="mt-2 text-[0.92rem] text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
            Din underskrift er logget med tidspunkt og audit-ID. Kvittering med PDF er på vej til <strong>{email.trim()}</strong>.
          </div>
          <div className="mt-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e6effd] text-[#0060e6] text-[0.72rem] font-bold uppercase tracking-[0.1em]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0060e6]" />
            Verificeret · eIDAS art. 25
          </div>
        </div>
      </div>
    );
    return createPortal(confirmDialog, document.body);
  }

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
          {/* LEFT — document, scrollable, with scroll-hint bounce.
              On mobile this is step 1 of a 2-step flow; on desktop both
              columns are always side-by-side. */}
          <div
            className={`relative border-b lg:border-b-0 lg:border-r border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)]/40 max-h-[65vh] lg:max-h-none flex-col overflow-hidden ${
              mobileStep === "fill" ? "hidden lg:flex" : "flex"
            }`}
          >
            <div
              ref={docRef}
              tabIndex={0}
              className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 pb-16"
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

            {/* Sticky bottom hint (desktop only — on mobile we have a
                proper 'Fortsæt' button instead). */}
            <div className="hidden lg:block absolute inset-x-0 bottom-0 px-5 sm:px-7 py-3 pointer-events-none bg-gradient-to-t from-[color:var(--color-nordan-soft)] via-[color:var(--color-nordan-soft)]/95 to-transparent">
              <div
                className={`text-center text-[0.8rem] uppercase tracking-[0.16em] font-bold transition-colors duration-500 ${
                  scrolledToBottom ? "text-green-700" : "text-[color:var(--color-nordan-accent)]"
                }`}
              >
                {scrolledToBottom
                  ? "✓ Du har læst hele teksten"
                  : "↓ Scroll til bunden for at læse fuldmagten"}
              </div>
            </div>

            {/* Mobile-only continue button — moves user to step 2 (form). */}
            <div className="lg:hidden flex-shrink-0 px-5 py-3 border-t border-[color:var(--color-nordan-line)] bg-white">
              <button
                type="button"
                onClick={() => {
                  setMobileStep("fill");
                  // Reset auto-bounce state if they re-open the read step
                  userScrolledRef.current = false;
                }}
                className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-[8px] text-white text-[0.95rem] font-semibold bg-green-600 hover:bg-green-700 transition-colors shadow-[0_4px_14px_rgba(22,163,74,0.25)]"
              >
                Fortsæt — udfyld dine oplysninger →
              </button>
              <p className="mt-2 text-center text-[0.7rem] text-[color:var(--color-nordan-muted)] leading-snug">
                {scrolledToBottom
                  ? "✓ Du har læst hele teksten — næste trin er hurtig udfyldelse"
                  : "Du kan også scrolle først for at læse fuldmagten"}
              </p>
            </div>
          </div>

          {/* RIGHT — compact form, no internal scroll on desktop;
              becomes step 2 on mobile (hidden until they tap Fortsæt). */}
          <div
            className={`p-5 sm:p-7 flex-col gap-5 overflow-y-auto lg:overflow-visible ${
              mobileStep === "read" ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Mobile-only: small back-link to re-read the agreement. */}
            <button
              type="button"
              onClick={() => setMobileStep("read")}
              className="lg:hidden self-start -mt-1 mb-1 text-[0.78rem] font-medium text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-ink)] inline-flex items-center gap-1"
            >
              ← Læs aftalen igen
            </button>

            {/* Signer */}
            <section>
              <h3 className="text-[1rem] font-bold text-[color:var(--color-nordan-ink)] mb-2.5">
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
                <h3 className="text-[1rem] font-bold text-[color:var(--color-nordan-ink)]">
                  Forsikringsselskaber I bruger i dag
                </h3>
                <span className="text-[0.72rem] text-[color:var(--color-nordan-muted)]">
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

              {attemptedSubmit && !formComplete ? (
                <div className="mt-2 text-[0.82rem] text-amber-900 bg-amber-50 border border-amber-200 rounded-[6px] px-3 py-2">
                  <div className="font-semibold mb-0.5">Mangler før du kan underskrive:</div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {getMissingFields().map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {error ? (
                <div className="mt-2 text-[0.82rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  {error}
                </div>
              ) : null}

              {/* Mobile-only: inline submit. Appears once form is complete
                  so the user has nothing to do but tap. No Annullér button —
                  the X in the header is the way out. */}
              <div className="lg:hidden mt-3">
                {formComplete ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-[8px] text-white text-[0.95rem] font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-60 transition-colors shadow-[0_4px_14px_rgba(22,163,74,0.25)]"
                  >
                    {submitting ? "Underskriver…" : "Underskriv & send →"}
                  </button>
                ) : (
                  <div className="rounded-[8px] border border-dashed border-[color:var(--color-nordan-line)] px-3.5 py-3 text-center text-[0.78rem] text-[color:var(--color-nordan-muted)] leading-snug">
                    Udfyld felterne og bekræft fuldmagten — så dukker
                    underskriv-knappen frem.
                  </div>
                )}
                <p className="mt-2 text-center text-[0.7rem] text-[color:var(--color-nordan-muted)] leading-snug">
                  Underskrift logges med tidspunkt, IP og browser.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer — desktop only. On mobile we surface the submit inline
            inside the form so the dialog isn't dominated by a sticky bar. */}
        <div className="hidden lg:flex px-5 sm:px-7 py-4 border-t border-[color:var(--color-nordan-line)] flex-col sm:flex-row sm:items-center gap-3 bg-[color:var(--color-nordan-soft)]/30">
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
              disabled={submitting}
              aria-disabled={!formComplete}
              className={`h-11 px-5 rounded-[6px] text-white text-[0.9rem] font-semibold transition-all ${
                formComplete && !submitting
                  ? "bg-green-600 hover:bg-green-700 shadow-[0_4px_14px_rgba(22,163,74,0.25)]"
                  : "bg-[color:var(--color-nordan-accent)]/55 hover:bg-[color:var(--color-nordan-accent)]/65"
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

/**
 * Animated success circle — green ring expanding then white check drawing in.
 * Pure CSS keyframes; no JS state needed since it auto-plays on mount.
 */
function SuccessCircle() {
  return (
    <div
      className="relative w-[112px] h-[112px]"
      role="status"
      aria-live="polite"
      aria-label="Underskrevet"
    >
      <style>{`
        @keyframes nrp-success-ring {
          0%   { transform: scale(0.4); opacity: 0; }
          50%  { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes nrp-success-pulse {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes nrp-success-check {
          to { stroke-dashoffset: 0; }
        }
        .nrp-ring { animation: nrp-success-ring 520ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .nrp-pulse { animation: nrp-success-pulse 1200ms ease-out 320ms infinite; }
        .nrp-check { stroke-dasharray: 36; stroke-dashoffset: 36; animation: nrp-success-check 380ms ease-out 380ms forwards; }
      `}</style>
      <span
        className="nrp-pulse absolute inset-0 rounded-full"
        style={{ backgroundColor: "var(--color-nordan-accent, #a58878)", opacity: 0.4 }}
      />
      <svg
        viewBox="0 0 56 56"
        className="nrp-ring absolute inset-0 w-full h-full"
        aria-hidden
      >
        <circle cx="28" cy="28" r="26" fill="var(--color-nordan-accent, #a58878)" />
        <path
          className="nrp-check"
          d="M16 29 L25 38 L41 20"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
