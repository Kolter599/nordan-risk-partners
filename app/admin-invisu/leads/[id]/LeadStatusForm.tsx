"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "Ny" },
  { value: "partial", label: "Halvfærdig" },
  { value: "completed", label: "Færdig" },
  { value: "quoted", label: "Tilbud sendt" },
  { value: "won", label: "Vundet" },
  { value: "lost", label: "Tabt" },
];

export function LeadStatusForm({
  leadId,
  status,
  notes,
}: {
  leadId: string;
  status: string;
  notes: string;
}) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSavedAt(null);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: s, notes: n }),
      });
      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString("da-DK"));
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((st) => (
          <button
            key={st.value}
            type="button"
            onClick={() => setS(st.value)}
            className={`px-3 py-1.5 rounded-full text-[0.82rem] border ${
              s === st.value
                ? "bg-[color:var(--color-nordan-accent)] border-[color:var(--color-nordan-accent)] text-white"
                : "bg-white border-[color:var(--color-nordan-line)] text-[color:var(--color-nordan-ink-soft)]"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>
      <textarea
        value={n}
        onChange={(e) => setN(e.target.value)}
        placeholder="Interne noter (kun synlige for dig)"
        rows={3}
        className="w-full px-3 py-2 rounded-[6px] border border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.9rem]"
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-10 px-4 rounded-[6px] bg-[color:var(--color-nordan-dark)] text-white text-[0.85rem] font-semibold hover:bg-[color:var(--color-nordan-dark-deep)] disabled:opacity-60"
        >
          {saving ? "Gemmer…" : "Gem ændringer"}
        </button>
        {savedAt ? <span className="text-[0.78rem] text-green-700">✓ Gemt {savedAt}</span> : null}
      </div>
    </div>
  );
}
