"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Login mislykkedes");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noget gik galt");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Adgangskode"
        autoFocus
        required
        className="w-full h-12 px-4 rounded-[6px] border-2 border-[color:var(--color-nordan-line)] focus:border-[color:var(--color-nordan-accent)] outline-none text-[0.95rem]"
      />
      {error ? (
        <div className="text-[0.85rem] text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="w-full h-12 inline-flex items-center justify-center gap-2 bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide rounded-[6px] hover:bg-[#8f715f] disabled:opacity-60 transition-colors"
      >
        {submitting ? "Logger ind…" : "Login"}
      </button>
    </form>
  );
}
