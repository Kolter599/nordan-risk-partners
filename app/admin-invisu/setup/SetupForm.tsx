"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RunResult = {
  ok: boolean;
  total?: number;
  failedCount?: number;
  results?: { ok: boolean; statement: string; error?: string }[];
  error?: string;
};

export function SetupForm() {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/init-db", { method: "POST" });
      const data = (await res.json()) as RunResult;
      setResult(data);
      if (data.ok) {
        setTimeout(() => {
          router.push("/admin-invisu");
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Noget gik galt" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="h-12 px-5 rounded-[6px] bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide hover:bg-[#8f715f] disabled:opacity-60 transition-colors w-full"
      >
        {running ? "Kører migration…" : "Kør migration nu"}
      </button>

      {result ? (
        <div
          className={`p-4 rounded-[6px] text-[0.88rem] ${
            result.ok
              ? "bg-green-50 border border-green-200 text-green-900"
              : "bg-red-50 border border-red-200 text-red-900"
          }`}
        >
          {result.ok ? (
            <>
              ✓ Migration kørt ({result.total} statements). Sender dig videre til dashboardet…
            </>
          ) : (
            <>
              <div className="font-semibold mb-1">Migration fejlede</div>
              <div className="text-[0.82rem]">{result.error ?? `${result.failedCount} af ${result.total} statements fejlede`}</div>
              {result.results ? (
                <pre className="mt-2 text-[0.75rem] bg-white p-2 rounded overflow-x-auto max-h-48">
                  {JSON.stringify(result.results.filter((r) => !r.ok), null, 2)}
                </pre>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
