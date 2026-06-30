"use client";

import { useState } from "react";
import { getClientId, track } from "../_components/GoogleAnalytics";
import { getAttribution } from "@/lib/attribution";

type State = "idle" | "submitting" | "success" | "error";

const JOB_TITLE = "Sælger / mødebooker (provision)";

export function JobForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — bots fill hidden fields, humans don't.
    const honeypot = data.get("_hp");
    if (typeof honeypot === "string" && honeypot.length > 0) {
      setState("success");
      return;
    }

    const name = String(data.get("name") ?? "").trim();
    const motivation = String(data.get("message") ?? "").trim();
    const linkedin = String(data.get("linkedin") ?? "").trim();

    // Fold LinkedIn into the message so it lands in Mads' inbox without
    // touching the shared /api/contact schema.
    const message =
      motivation + (linkedin ? `\n\nLinkedIn / profil: ${linkedin}` : "");

    const payload = {
      name,
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      topic: `Jobansøgning — ${JOB_TITLE}`,
      message,
      customerMessage: motivation || "Din ansøgning til stillingen som sælger / mødebooker.",
      clientId: getClientId(),
      attribution: getAttribution(),
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
        throw new Error(body.error ?? "Noget gik galt. Prøv igen eller ring til os.");
      }
      track("job_application_submitted", { has_phone: !!payload.phone, has_linkedin: !!linkedin });
      setState("success");
      form.reset();
    } catch (err) {
      track("job_application_error");
      setState("error");
      setError(err instanceof Error ? err.message : "Noget gik galt.");
    }
  }

  if (state === "success") {
    return (
      <div className="p-8 md:p-10 bg-[color:var(--color-nordan-soft)] border border-[color:var(--color-nordan-line)] rounded-sm">
        <div className="eyebrow mb-3">Tak — vi har den</div>
        <h3 className="display-md mb-3">Vi læser den selv</h3>
        <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
          Din ansøgning ligger nu hos Mads. Vi læser hver eneste én og vender tilbage —
          også hvis det bliver et nej. Har du noget på hjerte i mellemtiden, så ring til
          Mads på <a href="tel:+4531334936" className="underline">+45 31 33 49 36</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Navn" name="name" required autoComplete="name" />
        <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="E-mail" name="email" type="email" required autoComplete="email" />
        <Field label="LinkedIn eller link (valgfrit)" name="linkedin" type="url" placeholder="linkedin.com/in/…" />
      </div>

      <div>
        <label className="block eyebrow mb-2">Skriv lidt om dig selv</label>
        <textarea
          name="message"
          required
          rows={6}
          className="w-full p-4 bg-white border border-[color:var(--color-nordan-line)] rounded-sm focus:outline-none focus:border-[color:var(--color-nordan-dark)] resize-y"
          placeholder="Hvem er du, og hvorfor har det her fanget dig? Har du prøvet at sælge eller booke møder før — eller har du bare en god telefonstemme og lyst til at lære? Skriv det, som det er."
        />
      </div>

      {/* Honeypot */}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm p-3">{error}</div>
      ) : null}

      <div className="flex flex-wrap gap-3 items-center pt-2">
        <button type="submit" disabled={state === "submitting"} className="btn-primary disabled:opacity-60">
          {state === "submitting" ? "Sender…" : "Send ansøgning"}
        </button>
        <a href="tel:+4531334936" className="btn-outline">Ring til Mads i stedet</a>
      </div>

      <p className="text-xs text-[color:var(--color-nordan-muted)]">
        Vi behandler din ansøgning fortroligt. Se vores{" "}
        <a href="/persondatapolitik.pdf" className="underline">persondatapolitik</a>.
        CV må du gerne sende med — bare svar på kvitteringsmailen, så har vi det hele samlet.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-12 px-4 bg-white border border-[color:var(--color-nordan-line)] rounded-sm focus:outline-none focus:border-[color:var(--color-nordan-dark)]"
      />
    </div>
  );
}
