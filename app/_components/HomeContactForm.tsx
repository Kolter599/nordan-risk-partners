"use client";

import { useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

export function HomeContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const hp = data.get("_hp");
    if (typeof hp === "string" && hp.length > 0) {
      setState("success");
      return;
    }
    const first = String(data.get("first_name") ?? "").trim();
    const last = String(data.get("last_name") ?? "").trim();
    const cvr = String(data.get("cvr") ?? "").trim();
    const payload = {
      name: [first, last].filter(Boolean).join(" "),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim() || undefined,
      company: String(data.get("company") ?? "").trim() || undefined,
      topic: cvr ? `CVR: ${cvr}` : undefined,
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
      <div className="p-8 md:p-10 bg-white border border-[color:var(--color-nordan-line)] rounded-sm">
        <div className="eyebrow mb-3">Tak for din besked</div>
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl leading-snug mb-3">Vi vender tilbage hurtigst muligt</h3>
        <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed">
          Vi svarer typisk inden for én hverdag. Har du brug for hurtigt svar, så ring gerne på{" "}
          <a href="tel:+4553520006" className="underline">+45 53 52 00 06</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <FieldGroup label="Hvad er dit navn?" required>
        <div className="grid grid-cols-2 gap-4">
          <SubField name="first_name" label="Fornavn" required />
          <SubField name="last_name" label="Efternavn" required />
        </div>
      </FieldGroup>

      <FieldGroup label="Virksomhed" required>
        <SubField name="cvr" label="Tilføj CVR" />
        <Input name="company" type="text" />
      </FieldGroup>

      <FieldGroup label="Dit telefon nr." required>
        <Input name="phone" type="tel" required />
      </FieldGroup>

      <FieldGroup label="Din E-mail" required>
        <Input name="email" type="email" required />
      </FieldGroup>

      <FieldGroup label="hvad kan vi hjælpe med?">
        <textarea
          name="message"
          rows={5}
          className="w-full p-4 bg-white border border-[color:var(--color-nordan-line)] focus:outline-none focus:border-[color:var(--color-nordan-dark)] resize-y text-[0.95rem]"
        />
      </FieldGroup>

      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3">{error}</div>
      ) : null}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="inline-flex items-center justify-center h-12 px-10 bg-[color:var(--color-nordan-accent)] text-white text-[0.85rem] font-medium tracking-wide hover:bg-[#8f715f] disabled:opacity-60 transition-colors"
      >
        {state === "submitting" ? "Sender…" : "Send"}
      </button>
    </form>
  );
}

function FieldGroup({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-baseline gap-2 mb-2">
        <span className="text-[1.05rem] font-medium text-[color:var(--color-nordan-ink)]">{label}</span>
        {required ? <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">(påkrævet)</span> : null}
      </label>
      {children}
    </div>
  );
}

function SubField({
  name,
  label,
  required = false,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="text-[0.82rem] text-[color:var(--color-nordan-muted)] mb-1">{label}</div>
      <Input name={name} type="text" required={required} />
    </div>
  );
}

function Input({
  name,
  type = "text",
  required = false,
}: {
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      className="w-full h-12 px-4 bg-white border border-[color:var(--color-nordan-line)] focus:outline-none focus:border-[color:var(--color-nordan-dark)] text-[0.95rem]"
    />
  );
}
