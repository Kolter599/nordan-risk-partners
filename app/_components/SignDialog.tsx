"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SignResult = {
  auditId: string;
  signedAt: string;
  finalHash: string;
  blobUrl: string | null;
  fileName: string;
  scheduledEmailIds?: { internal?: string; signer?: string };
  signerName?: string;
  companyName?: string;
  cvr?: string;
};

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
  const [readOk, setReadOk] = useState(false);
  const [authOk, setAuthOk] = useState(false);
  const [eidasOk, setEidasOk] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const docRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaults.name ?? "");
    setEmail(defaults.email ?? "");
    setTitle("");
    setReadOk(false);
    setAuthOk(false);
    setEidasOk(false);
    setError(null);
    setScrolledToBottom(false);
  }, [open, defaults.name, defaults.email]);

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

  function handleDocScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const reachedBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (reachedBottom && !scrolledToBottom) setScrolledToBottom(true);
  }

  const formComplete =
    name.trim().length > 1 &&
    title.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    readOk &&
    authOk &&
    eidasOk &&
    scrolledToBottom;

  async function handleSubmit() {
    if (!formComplete || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          email: email.trim(),
          phone: defaults.phone,
          companyName: defaults.companyName,
          cvr: defaults.cvr,
          consent: { read: readOk, authorized: authOk, eidas: eidasOk },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke underskrive");
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
      <div className="w-full max-w-[820px] xl:max-w-[1000px] 2xl:max-w-[1100px] max-h-[92vh] bg-white rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
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
            className="w-9 h-9 rounded-full grid place-items-center hover:bg-[color:var(--color-nordan-soft)] text-[color:var(--color-nordan-muted)]"
            aria-label="Luk"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden grid lg:grid-cols-[1.2fr_1fr]">
          {/* Document preview */}
          <div
            ref={docRef}
            onScroll={handleDocScroll}
            className="overflow-y-auto px-5 sm:px-7 py-6 border-b lg:border-b-0 lg:border-r border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)]/40 max-h-[40vh] lg:max-h-none"
          >
            <div className="bg-white border border-[color:var(--color-nordan-line)] rounded-[8px] p-6 sm:p-8 text-[0.92rem] leading-[1.6] text-[color:var(--color-nordan-ink)] shadow-sm">
              <div className="text-center mb-6">
                <div className="font-bold text-[1.4rem] text-[color:var(--color-nordan-dark)]">
                  Undersøgelsesfuldmagt
                </div>
                <div className="text-[0.85rem] text-[color:var(--color-nordan-muted)] mt-1">
                  til forsikringsmægler
                </div>
              </div>

              <p className="mb-3">
                <strong>Virksomhedsnavn:</strong> {defaults.companyName}
                <br />
                <strong>CVR-nr.:</strong> {defaults.cvr}
                <br />
                <span className="text-[color:var(--color-nordan-muted)] text-[0.85rem]">
                  (I det følgende kaldet &ldquo;Fuldmagtsgiver&rdquo;)
                </span>
              </p>

              <p className="mb-4">
                <strong>Nordan Risk Partners ApS</strong>
                <br />
                CVR-nr.: 4595 3769
                <br />
                Toftevej 15B, 3450 Allerød
                <br />
                <span className="text-[color:var(--color-nordan-muted)] text-[0.85rem]">
                  (I det følgende kaldet &ldquo;Nordan Risk Partners&rdquo;)
                </span>
              </p>

              <p className="mb-3">
                Det bekræftes herved, at Fuldmagtsgiver har truffet aftale med Nordan Risk
                Partners om, at Nordan Risk Partners fra dags dato er udpeget som vores
                forsikringsmægler til undersøgelse af forsikringsmarkedet. Fuldmagten er
                ikke eksklusiv og erstatter ikke tidligere udstedte
                forsikringsmæglerfuldmagter.
              </p>
              <p className="mb-2">
                Denne undersøgelsesfuldmagt bemyndiger, og giver forsikringsmægleren ret til,
                på Fuldmagtsgivers vegne:
              </p>
              <ul className="list-disc pl-6 mb-3 space-y-1.5">
                <li>
                  at indhente oplysninger om samtlige bestående forsikringer hos enhver
                  forsikringsdistributør, herunder forsikringspolicer, vilkår, præmier,
                  selvbehold, samt øvrige relevante oplysninger for vurdering af eksisterende
                  forsikringsforhold
                </li>
                <li>
                  at indhente oplysninger om skadehistorik for alle bestående og tidligere
                  forsikringer, herunder skadestatistikker, skadereserver, samt
                  risikovurderinger og andre relevante data, i relation til anmeldte skader
                </li>
                <li>
                  at afgive risikooplysninger til enhver forsikringsdistributør og indhente
                  tilbud på forsikringer inden for alle brancher på skadesforsikringsområdet.
                </li>
              </ul>
              <p className="mb-3">
                Annullering af eksisterende forsikringer eller etablering af nye forsikringer
                kræver, at der gives eksklusiv forsikringsmæglerfuldmagt til Nordan Risk
                Partners.
              </p>
              <p className="mb-3">
                Fuldmagtsgiver er gjort opmærksomme på, at oplysninger, som
                forsikringsmægleren videregiver til forsikringsdistributører, i relation til
                de omhandlede forsikringer, sidestilles med oplysninger afgivet af
                Fuldmagtsgiver.
              </p>
              <p className="mb-3">
                Fuldmagtsgiver er gjort opmærksomme på, at undersøgelsesfuldmagten til enhver
                tid kan tilbagekaldes af Fuldmagtsgiver på samme måde, som den er indgået og
                at den forbliver i kraft, indtil den skriftligt tilbagekaldes, eller der
                indgås mæglerfuldmagt med Nordan Risk Partners. Fuldmagten ophører dog
                automatisk 1 år efter underskriftsdatoen, såfremt den ikke er tilbagekaldt
                forinden.
              </p>
              <p className="mb-3">
                Fuldmagtsgiver påpeger, at Fuldmagtsgiver ønsker at Fuldmagtsgivers nuværende
                forsikringsmægler ikke involveres eller orienteres om nærværende
                undersøgelsesfuldmagt.
              </p>
              <p className="mb-2">
                Underskriver indestår for at være berettiget til at underskrive denne
                undersøgelsesfuldmagt og dermed berettiget til at forpligte Fuldmagtsgiver.
              </p>

              <div
                className={`mt-6 text-center text-[0.78rem] uppercase tracking-[0.18em] font-semibold ${
                  scrolledToBottom
                    ? "text-green-700"
                    : "text-[color:var(--color-nordan-accent)]"
                }`}
              >
                {scrolledToBottom ? "✓ Læst igennem" : "↓ Scroll til bunden for at fortsætte"}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="overflow-y-auto p-5 sm:p-7 space-y-4">
            <div>
              <label className="block text-[0.78rem] font-semibold text-[color:var(--color-nordan-muted)] uppercase tracking-[0.18em] mb-1.5">
                Fuldt navn
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fornavn Efternavn"
                className="w-full h-11 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.95rem]"
              />
            </div>
            <div>
              <label className="block text-[0.78rem] font-semibold text-[color:var(--color-nordan-muted)] uppercase tracking-[0.18em] mb-1.5">
                Titel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="fx Direktør, CEO, Bestyrelsesformand"
                className="w-full h-11 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.95rem]"
              />
            </div>
            <div>
              <label className="block text-[0.78rem] font-semibold text-[color:var(--color-nordan-muted)] uppercase tracking-[0.18em] mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="navn@firma.dk"
                className="w-full h-11 px-3 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.95rem]"
              />
              <div className="text-[0.72rem] text-[color:var(--color-nordan-muted)] mt-1">
                Du modtager en kvittering med den underskrevne PDF
              </div>
            </div>
            <div className="px-3 py-2.5 bg-[color:var(--color-nordan-soft)] rounded-[6px] text-[0.82rem] text-[color:var(--color-nordan-ink-soft)]">
              <div>
                <span className="text-[color:var(--color-nordan-muted)]">Firma:</span>{" "}
                <strong>{defaults.companyName}</strong>
              </div>
              <div>
                <span className="text-[color:var(--color-nordan-muted)]">CVR:</span>{" "}
                <strong>{defaults.cvr}</strong>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[color:var(--color-nordan-line)]">
              <label className="flex gap-2.5 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={readOk}
                  onChange={(e) => setReadOk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[color:var(--color-nordan-accent)]"
                />
                <span className="text-[0.85rem] leading-snug text-[color:var(--color-nordan-ink)]">
                  Jeg har læst og forstået dokumentet
                </span>
              </label>
              <label className="flex gap-2.5 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={authOk}
                  onChange={(e) => setAuthOk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[color:var(--color-nordan-accent)]"
                />
                <span className="text-[0.85rem] leading-snug text-[color:var(--color-nordan-ink)]">
                  Jeg er bemyndiget til at underskrive på vegne af{" "}
                  <strong>{defaults.companyName}</strong>
                </span>
              </label>
              <label className="flex gap-2.5 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={eidasOk}
                  onChange={(e) => setEidasOk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[color:var(--color-nordan-accent)]"
                />
                <span className="text-[0.85rem] leading-snug text-[color:var(--color-nordan-ink)]">
                  Jeg samtykker til elektronisk signering iht. eIDAS-forordningen art. 25
                </span>
              </label>
            </div>

            {error ? (
              <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-[color:var(--color-nordan-line)] flex flex-col sm:flex-row sm:items-center gap-3 bg-[color:var(--color-nordan-soft)]/30">
          <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] flex-1 leading-snug">
            Underskrift sker elektronisk med audit-log (tidspunkt, IP, browser).
            Du modtager en kopi pr. mail.
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
              className={`h-11 px-5 rounded-[6px] text-white text-[0.88rem] font-semibold transition-colors ${
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
