import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listLeads, isPlaceholderEmail, type LeadSource, type LeadStatus } from "@/lib/db";
import { SOURCE_LABELS, STATUS_LABELS } from "../labels";

export const metadata: Metadata = {
  title: "Admin · Alle leads",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ponytail: fast loft på 1000 rækker, tilføj paginering hvis der kommer flere
const MAX_LEADS = 1000;

function pick<T extends string>(value: string | string[] | undefined, allowed: Record<string, unknown>): T | "all" {
  return typeof value === "string" && value in allowed ? (value as T) : "all";
}

export default async function AllLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const source = pick<LeadSource>(params.source, SOURCE_LABELS);
  const status = pick<LeadStatus>(params.status, STATUS_LABELS);
  const leads = await listLeads({ source, status, limit: MAX_LEADS });

  const href = (next: { source?: string; status?: string }) => {
    const q = new URLSearchParams();
    const s = next.source ?? source;
    const st = next.status ?? status;
    if (s !== "all") q.set("source", s);
    if (st !== "all") q.set("status", st);
    const qs = q.toString();
    return `/admin-invisu/leads${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="min-h-screen bg-[color:var(--color-nordan-soft)] py-10 px-5">
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-6">
          <Link href="/admin-invisu" className="text-[0.85rem] text-[color:var(--color-nordan-muted)] underline">
            ← Dashboard
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[1.8rem] leading-tight mt-2">
            Alle leads <span className="text-[color:var(--color-nordan-muted)] text-[1.1rem]">({leads.length})</span>
          </h1>
        </header>

        <FilterRow label="Kilde" options={SOURCE_LABELS} active={source} hrefFor={(v) => href({ source: v })} />
        <FilterRow
          label="Status"
          options={Object.fromEntries(Object.entries(STATUS_LABELS).map(([k, v]) => [k, v.label]))}
          active={status}
          hrefFor={(v) => href({ status: v })}
        />

        <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] overflow-x-auto mt-5">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-[color:var(--color-nordan-muted)]">Ingen leads med de filtre.</div>
          ) : (
            <table className="w-full text-[0.85rem]">
              <thead>
                <tr className="text-left text-[0.66rem] uppercase tracking-[0.18em] text-[color:var(--color-nordan-muted)] border-b border-[color:var(--color-nordan-line)]">
                  <th className="px-4 py-3 font-semibold">Dato</th>
                  <th className="px-4 py-3 font-semibold">Navn</th>
                  <th className="px-4 py-3 font-semibold">Virksomhed</th>
                  <th className="px-4 py-3 font-semibold">Kontakt</th>
                  <th className="px-4 py-3 font-semibold">Kilde</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-nordan-line)]">
                {leads.map((lead) => {
                  const st = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "#0a0a0a" };
                  const email = isPlaceholderEmail(lead.email) ? null : lead.email;
                  return (
                    <tr key={lead.id} className="hover:bg-[color:var(--color-nordan-soft)]/50">
                      <td className="px-4 py-2.5 font-mono text-[0.76rem] text-[color:var(--color-nordan-muted)] whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleString("da-DK", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "Europe/Copenhagen",
                        })}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link href={`/admin-invisu/leads/${lead.id}`} className="font-medium underline hover:text-[color:var(--color-nordan-accent)]">
                          {lead.name ?? (email ?? "Kun CVR")}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        {lead.company ?? "—"}
                        {lead.cvr ? (
                          <span className="block font-mono text-[0.72rem] text-[color:var(--color-nordan-muted)]">CVR {lead.cvr}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5">
                        {email ? <a href={`mailto:${email}`} className="block hover:text-[color:var(--color-nordan-accent)]">{email}</a> : null}
                        {lead.phone ? <span className="block text-[0.76rem] text-[color:var(--color-nordan-muted)]">{lead.phone}</span> : null}
                        {!email && !lead.phone ? "—" : null}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{SOURCE_LABELS[lead.source] ?? lead.source}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-semibold" style={{ color: st.color }}>
                        {st.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

function FilterRow({
  label,
  options,
  active,
  hrefFor,
}: {
  label: string;
  options: Record<string, string>;
  active: string;
  hrefFor: (value: string) => string;
}) {
  const entries: Array<[string, string]> = [["all", "Alle"], ...Object.entries(options)];
  return (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <span className="text-[0.66rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] w-16">
        {label}
      </span>
      {entries.map(([value, text]) => (
        <Link
          key={value}
          href={hrefFor(value)}
          className={`px-3 py-1 rounded-full text-[0.78rem] border ${
            value === active
              ? "bg-[color:var(--color-nordan-dark)] text-white border-transparent"
              : "bg-white border-[color:var(--color-nordan-line)] hover:border-[color:var(--color-nordan-accent)]"
          }`}
        >
          {text}
        </Link>
      ))}
    </div>
  );
}
