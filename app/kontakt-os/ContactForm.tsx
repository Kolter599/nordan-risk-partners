"use client";

import { useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const honeypot = data.get("_hp");
    if (typeof honeypot === "string" && honeypot.length > 0) {
      setState("success");
      return;
    }
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      company: String(data.get("company") ?? "").trim() || undefined,
      topic: String(data.get("topic") ?? "").trim() || undefined,
      message: String(data.get("message") ?? "").trim(),
    };

    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Noget gik galt. Prøv igen eller ring.");
      }
      setState("success");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Noget gik galt.");
    }
  }

  if (state === "success") {
    return (
      <div className="p-8 md:p-10 bg-[color:var(--color-nordan-soft)] border border-[color:var(--color-nordan-line)] rounded-sm">
        <div className="eyebrow mb-3">Tak for din besked</div>
        <h3 className="display-md mb-3">Vi vender tilbage hurtigst muligt</h3>
        <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
          Vi har modtaget din henvendelse og svarer typisk inden for én hverdag. Har du brug for hurtigt svar, så ring gerne på <a href="tel:+4553520006" className="underline">+45 53 52 00 06</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Navn" name="name" required />
        <Field label="Virksomhed" name="company" />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="E-mail" name="email" type="email" required />
        <Field label="Telefon" name="phone" type="tel" />
      </div>

      <div>
        <label className="block eyebrow mb-2">Emne</label>
        <select
          name="topic"
          defaultValue=""
          className="w-full h-12 px-4 bg-white border border-[color:var(--color-nordan-line)] rounded-sm focus:outline-none focus:border-[color:var(--color-nordan-dark)]"
        >
          <option value="">Vælg emne (valgfrit)</option>
          <option>Uforpligtende tjek af eksisterende forsikringer</option>
          <option>Andelsbolig- eller ejerforening</option>
          <option>Fredet ejendom</option>
          <option>Hole in one forsikring</option>
          <option>Nystartet virksomhed / opbygning af program</option>
          <option>Andet</option>
        </select>
      </div>

      <div>
        <label className="block eyebrow mb-2">Besked</label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full p-4 bg-white border border-[color:var(--color-nordan-line)] rounded-sm focus:outline-none focus:border-[color:var(--color-nordan-dark)] resize-y"
          placeholder="Fortæl kort om virksomheden og hvad du gerne vil have gennemgået."
        />
      </div>

      {/* Honeypot */}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">{error}</div>
      ) : null}

      <div className="flex flex-wrap gap-3 items-center pt-2">
        <button type="submit" disabled={state === "submitting"} className="btn-primary disabled:opacity-60">
          {state === "submitting" ? "Sender…" : "Send besked"}
        </button>
        <a href="tel:+4553520006" className="btn-outline">Ring i stedet</a>
      </div>

      <p className="text-xs text-[color:var(--color-nordan-muted)]">
        Ved at sende accepterer du vores <a href="/persondatapolitik.pdf" className="underline">persondatapolitik</a>.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block eyebrow mb-2">
        {label} {required ? <span aria-hidden className="text-[color:var(--color-nordan-accent)]">*</span> : null}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full h-12 px-4 bg-white border border-[color:var(--color-nordan-line)] rounded-sm focus:outline-none focus:border-[color:var(--color-nordan-dark)]"
      />
    </div>
  );
}
