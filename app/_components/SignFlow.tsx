"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getClientId, track } from "./GoogleAnalytics";
import { getAttribution } from "@/lib/attribution";

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
    label: "Danske skadesforsikringsselskaber",
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
  onSigned: (result: SignResult) => void;
  defaults: {
    name?: string;
    email?: string;
    phone?: string;
    companyName: string;
    cvr: string;
  };
};

/**
 * Inline signing experience. Lives inside CvrLookup's "sign" step — no modal,
 * no portal, no separate header. Two-column layout on desktop (doc | form),
 * 2-mobile-step pattern on small screens (read → fill).
 *
 * Submission goes to /api/sign which creates a lead row, sends a kvittering
 * email to the signer, and emails Mads internally with the signed PDF blob.
 * Parent receives onSigned(result) and transitions to its "done" step.
 */
export function SignFlow({ onSigned, defaults }: Props) {
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
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState<"read" | "fill">("read");

  const docRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Re-sync from defaults if the parent changes them mid-flow
  useEffect(() => {
    if (defaults.name) setName((v) => v || defaults.name!);
    if (defaults.email) setEmail((v) => v || defaults.email!);
    if (defaults.phone) setPhone((v) => v || defaults.phone!);
  }, [defaults.name, defaults.email, defaults.phone]);

  useEffect(() => {
    track("sign_flow_view", { company: defaults.companyName, cvr: defaults.cvr });
  }, [defaults.companyName, defaults.cvr]);

  // Track scroll progress (0–1) and reaching-bottom flag.
  useEffect(() => {
    const node = docRef.current;
    if (!node) return;
    const onScroll = () => {
      const max = node.scrollHeight - node.clientHeight;
      const progress = max > 24 ? Math.min(1, node.scrollTop / max) : 1;
      setScrollProgress(progress);
      if (node.scrollTop + node.clientHeight >= node.scrollHeight - 24) {
        setScrolledToBottom(true);
      }
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

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

  useEffect(() => {
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
  }, []);

  const formComplete =
    name.trim().length > 1 &&
    title.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim().length >= 6 &&
    combinedConsent;

  const invalidName = name.trim().length < 2;
  const invalidTitle = title.trim().length === 0;
  const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const invalidPhone = phone.trim().length < 6;
  const invalidConsent = !combinedConsent;
  const showInvalid = attemptedSubmit && !formComplete;

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
          consent: { read: combinedConsent, authorized: combinedConsent, eidas: combinedConsent },
          clientId: getClientId(),
          attribution: getAttribution(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke underskrive");
      track("sign_completed", {
        company: defaults.companyName,
        cvr: defaults.cvr,
        insurers_count: allInsurers.length,
        audit_id: (data as SignResult).auditId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      onSigned(data as SignResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col w-full flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden grid lg:grid-cols-[1fr_1.05fr]">
        {/* LEFT — document, scrollable */}
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
            {/* Why-this-step framing — sets the fuldmagt up as standard
                industry practice so it doesn't feel like an unusual ask. */}
            <div className="bg-[color:var(--color-nordan-soft)] border border-[color:var(--color-nordan-line)] rounded-[10px] p-5 mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-dark)]" />
                <h3 className="text-[0.74rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-dark)]">
                  Hvorfor en undersøgelsesfuldmagt?
                </h3>
              </div>
              <p className="text-[0.9rem] leading-relaxed text-[color:var(--color-nordan-ink)]">
                Forsikringsselskaberne udleverer kun policer og skadehistorik til en{" "}
                <strong>autoriseret forsikringsmægler</strong> — så vi har brug for en kort
                undersøgelsesfuldmagt for at kunne lave analysen.{" "}
                <span className="text-[color:var(--color-nordan-ink-soft)]">
                  Det er standard branchepraksis; alle mæglere arbejder sådan her. Du forpligter
                  dig til intet, og undersøgelsesfuldmagten kan trækkes tilbage når som helst.
                </span>
              </p>
            </div>

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
                Fuldmagten kan til enhver tid tilbagekaldes skriftligt og ophører automatisk 1 år efter underskriftsdatoen.
              </p>
              <p className="mb-3">
                Fuldmagtsgiver påpeger, at nuværende forsikringsmægler ikke involveres eller orienteres om nærværende undersøgelsesfuldmagt.
              </p>
              <p>
                Underskriver indestår for at være berettiget til at underskrive denne undersøgelsesfuldmagt på vegne af Fuldmagtsgiver.
              </p>
            </div>
          </div>

          {/* Sticky bottom hint (desktop) — progress strip + status */}
          <div className="hidden lg:block absolute inset-x-0 bottom-0 px-5 sm:px-7 py-3 pointer-events-none bg-gradient-to-t from-[color:var(--color-nordan-soft)] via-[color:var(--color-nordan-soft)]/95 to-transparent">
            <div className="h-[3px] w-full bg-[color:var(--color-nordan-line)]/60 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-out"
                style={{
                  width: `${Math.round(scrollProgress * 100)}%`,
                  backgroundColor: "var(--color-nordan-dark)",
                }}
              />
            </div>
            <div
              className={`text-center text-[0.8rem] uppercase tracking-[0.16em] font-bold transition-colors duration-500 ${
                scrolledToBottom ? "text-green-700" : "text-[color:var(--color-nordan-accent)]"
              }`}
            >
              {scrolledToBottom
                ? "✓ Du har læst hele teksten"
                : "↓ Scroll til bunden for at læse undersøgelsesfuldmagten"}
            </div>
          </div>

          {/* Mobile-only continue button */}
          <div className="lg:hidden flex-shrink-0 px-5 pt-3 pb-3 border-t border-[color:var(--color-nordan-line)] bg-white">
            <div className="h-[3px] w-full bg-[color:var(--color-nordan-line)]/60 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-[width] duration-200 ease-out"
                style={{
                  width: `${Math.round(scrollProgress * 100)}%`,
                  backgroundColor: "var(--color-nordan-dark)",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileStep("fill");
                userScrolledRef.current = false;
              }}
              className={`w-full h-12 inline-flex items-center justify-center gap-2 rounded-[8px] text-white text-[0.95rem] font-semibold transition-all bg-[color:var(--color-nordan-dark)] hover:bg-[color:var(--color-nordan-dark-deep)] ${
                scrolledToBottom
                  ? "brightness-[1.12] shadow-[0_6px_22px_rgba(36,65,52,0.32)]"
                  : "shadow-[0_2px_10px_rgba(36,65,52,0.18)]"
              }`}
            >
              Fortsæt →
            </button>
            {scrolledToBottom ? (
              <p className="mt-2 text-center text-[0.72rem] text-[color:var(--color-nordan-muted)] leading-snug">
                ✓ Du har læst hele undersøgelsesfuldmagten
              </p>
            ) : null}
          </div>
        </div>

        {/* RIGHT — form */}
        <div
          className={`flex-col overflow-hidden lg:overflow-visible ${
            mobileStep === "read" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex-1 overflow-y-auto lg:overflow-visible bg-[color:var(--color-nordan-soft)]/40 lg:bg-transparent px-4 py-4 sm:p-7">
            <button
              type="button"
              onClick={() => setMobileStep("read")}
              className="lg:hidden mb-3 text-[0.78rem] font-medium text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-ink)] inline-flex items-center gap-1"
            >
              ← Læs aftalen igen
            </button>

            <div className="flex flex-col gap-5 lg:gap-5 bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-5 shadow-sm lg:bg-transparent lg:border-0 lg:rounded-none lg:p-0 lg:shadow-none">
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
                        className={`w-full h-10 px-3 rounded-[6px] border focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem] ${
                          showInvalid && invalidName
                            ? "border-red-500 bg-red-50"
                            : "border-[color:var(--color-nordan-line)]"
                        }`}
                      />
                    </Field>
                    <Field label="Titel">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="fx Direktør"
                        className={`w-full h-10 px-3 rounded-[6px] border focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem] ${
                          showInvalid && invalidTitle
                            ? "border-red-500 bg-red-50"
                            : "border-[color:var(--color-nordan-line)]"
                        }`}
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
                        className={`w-full h-10 px-3 rounded-[6px] border focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem] ${
                          showInvalid && invalidEmail
                            ? "border-red-500 bg-red-50"
                            : "border-[color:var(--color-nordan-line)]"
                        }`}
                      />
                    </Field>
                    <Field label="Telefon">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+45 12 34 56 78"
                        className={`w-full h-10 px-3 rounded-[6px] border focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.92rem] ${
                          showInvalid && invalidPhone
                            ? "border-red-500 bg-red-50"
                            : "border-[color:var(--color-nordan-line)]"
                        }`}
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

              <section>
                <h3 className="text-[1rem] font-bold text-[color:var(--color-nordan-ink)] mb-1">
                  Forsikringsselskaber
                </h3>
                <p className="text-[0.78rem] text-[color:var(--color-nordan-ink-soft)] leading-snug mb-2.5">
                  Vælg dem I bruger i dag — så går vi direkte til de rigtige.
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

              <section className="mt-auto">
                <label
                  className={`flex gap-3 items-start cursor-pointer p-3 rounded-[8px] hover:bg-[color:var(--color-nordan-soft)]/40 transition-colors border has-[:checked]:border-[color:var(--color-nordan-accent)] has-[:checked]:bg-[color:var(--color-nordan-accent)]/5 ${
                    showInvalid && invalidConsent
                      ? "border-red-500 bg-red-50"
                      : "border-[color:var(--color-nordan-line)]"
                  }`}
                >
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

          {/* Mobile-only sticky bottom submit */}
          <div className="lg:hidden flex-shrink-0 px-5 pt-3 pb-3 border-t border-[color:var(--color-nordan-line)] bg-white">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              aria-disabled={!formComplete}
              className={`w-full h-12 inline-flex items-center justify-center gap-2 rounded-[8px] text-white text-[0.95rem] font-semibold transition-all bg-[color:var(--color-nordan-dark)] hover:bg-[color:var(--color-nordan-dark-deep)] ${
                formComplete && !submitting
                  ? "brightness-[1.12] shadow-[0_6px_22px_rgba(36,65,52,0.32)]"
                  : "shadow-[0_2px_10px_rgba(36,65,52,0.18)]"
              } disabled:opacity-60`}
            >
              {submitting ? "Underskriver…" : "Underskriv & send →"}
            </button>
            {formComplete ? (
              <p className="mt-2 text-center text-[0.72rem] text-[color:var(--color-nordan-muted)] leading-snug">
                ✓ Klar til at underskrive
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Desktop footer */}
      <div className="hidden lg:flex px-5 sm:px-7 py-4 border-t border-[color:var(--color-nordan-line)] flex-col sm:flex-row sm:items-center gap-3 bg-[color:var(--color-nordan-soft)]/30">
        <div className="text-[0.74rem] text-[color:var(--color-nordan-muted)] flex-1 leading-snug">
          Underskrift logges med tidspunkt, IP og browser. Du modtager en kopi pr. mail.
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          aria-disabled={!formComplete}
          className={`h-11 px-5 rounded-[6px] text-white text-[0.9rem] font-semibold transition-all bg-[color:var(--color-nordan-dark)] hover:bg-[color:var(--color-nordan-dark-deep)] ${
            formComplete && !submitting
              ? "brightness-[1.12] shadow-[0_6px_22px_rgba(36,65,52,0.32)]"
              : "shadow-[0_2px_10px_rgba(36,65,52,0.18)]"
          } disabled:opacity-60`}
        >
          {submitting ? "Underskriver…" : "Underskriv & send →"}
        </button>
      </div>
    </div>
  );
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
