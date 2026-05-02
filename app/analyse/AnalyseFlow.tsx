"use client";

import { useState } from "react";
import { CvrLookup, type CvrLookupStep } from "../_components/CvrLookup";

type Props = {
  initialCvr?: string;
};

const STAGES = [
  { key: "cvr", label: "Indtast CVR" },
  { key: "confirm", label: "Bekræft virksomhed" },
  { key: "actions", label: "Klargør analyse" },
] as const;

export function AnalyseFlow({ initialCvr }: Props) {
  const [step, setStep] = useState<CvrLookupStep>(initialCvr ? "cvr" : "cvr");

  const currentIndex =
    step === "cvr" ? 0 : step === "confirm" ? 1 : step === "actions" || step === "done" ? 2 : 0;
  const allDone = step === "done";

  return (
    <div>
      {/* STATIC STEP INDICATOR — fixed at the top of the card area, never reflows with the card */}
      <ol className="mx-auto max-w-[1100px] flex items-center justify-between sm:justify-start gap-2 sm:gap-0 mb-10 sm:mb-12 text-[0.82rem] font-medium">
        {STAGES.map((s, i) => {
          const status: "done" | "active" | "next" =
            allDone || i < currentIndex ? "done" : i === currentIndex ? "active" : "next";
          return (
            <li key={s.key} className="flex items-center flex-1 sm:flex-none last:flex-none">
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <span
                  className={`shrink-0 w-9 h-9 rounded-full grid place-items-center text-[0.85rem] font-semibold transition-all duration-500 ${
                    status === "done"
                      ? "bg-[color:var(--color-nordan-dark)] text-white"
                      : status === "active"
                      ? "bg-[color:var(--color-nordan-accent)] text-white ring-[6px] ring-[color:var(--color-nordan-accent)]/15"
                      : "bg-white border border-[color:var(--color-nordan-line)] text-[color:var(--color-nordan-muted)]"
                  }`}
                  aria-hidden
                >
                  {status === "done" ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`hidden sm:inline transition-colors duration-500 whitespace-nowrap ${
                    status === "next"
                      ? "text-[color:var(--color-nordan-muted)]"
                      : "text-[color:var(--color-nordan-ink)]"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STAGES.length - 1 ? (
                <span
                  aria-hidden
                  className={`flex-1 sm:w-16 sm:flex-none h-px mx-3 sm:mx-6 transition-colors duration-500 ${
                    status === "done"
                      ? "bg-[color:var(--color-nordan-accent)]"
                      : "bg-[color:var(--color-nordan-line)]"
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <CvrLookup
        headline="Indtast CVR — start jeres analyse"
        initialCvr={initialCvr}
        onStepChange={setStep}
      />
    </div>
  );
}
