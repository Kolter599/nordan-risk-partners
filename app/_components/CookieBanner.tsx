"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "nrp.cookies.consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      // Ignore storage errors (private mode etc.)
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
      window.dispatchEvent(new Event("nrp:consent-changed"));
    } catch {}
    setVisible(false);
  }

  function decline() {
    try {
      localStorage.setItem(STORAGE_KEY, "declined");
      window.dispatchEvent(new Event("nrp:consent-changed"));
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-md z-50">
      <div className="bg-white border border-[color:var(--color-nordan-line)] rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-5 md:p-6">
        <div className="eyebrow mb-2">Cookies</div>
        <p className="text-[0.9rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.55] mb-4">
          Vi bruger cookies til anonym besøgsstatistik — ingen annoncer, ingen tredjepartsdeling. Hjælper os med at forbedre sitet.{" "}
          <a href="/cookies" className="underline hover:text-[color:var(--color-nordan-accent)]">Læs mere</a>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={accept}
            className="flex-1 inline-flex items-center justify-center h-10 px-5 rounded-[6px] bg-[color:var(--color-nordan-accent)] text-white text-[0.84rem] font-semibold tracking-wide hover:bg-[#8f715f] transition-colors"
          >
            Accepter
          </button>
          <button
            type="button"
            onClick={decline}
            className="inline-flex items-center justify-center h-10 px-4 rounded-[6px] border border-[color:var(--color-nordan-line)] text-[color:var(--color-nordan-ink-soft)] text-[0.84rem] font-medium hover:border-[color:var(--color-nordan-ink-soft)] transition-colors"
          >
            Afvis
          </button>
        </div>
      </div>
    </div>
  );
}
