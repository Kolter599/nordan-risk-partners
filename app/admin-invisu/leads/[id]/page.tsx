import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getLead, listEventsForLead } from "@/lib/db";
import { LeadStatusForm } from "./LeadStatusForm";

export const metadata: Metadata = {
  title: "Admin · Lead detail",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [lead, events] = await Promise.all([getLead(id), listEventsForLead(id)]);
  if (!lead) notFound();

  const formatted = new Date(lead.created_at).toLocaleString("da-DK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });

  return (
    <main className="min-h-screen bg-[color:var(--color-nordan-soft)] py-10 px-5">
      <div className="mx-auto max-w-[920px]">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[0.85rem] text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-accent)] mb-6"
        >
          ← Tilbage til oversigt
        </Link>

        <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7 mb-5">
          <div className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
            {lead.source} · {formatted}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.7rem] mb-1">{lead.name ?? "—"}</h1>
          <div className="text-[color:var(--color-nordan-ink-soft)] mb-5">
            {lead.company ?? "—"}
            {lead.cvr ? <span className="text-[color:var(--color-nordan-muted)] ml-2">CVR {lead.cvr}</span> : null}
          </div>

          <dl className="grid sm:grid-cols-2 gap-4 text-[0.92rem]">
            <KV label="E-mail" value={<a href={`mailto:${lead.email}`} className="text-[color:var(--color-nordan-accent)]">{lead.email}</a>} />
            <KV label="Telefon" value={lead.phone ? <a href={`tel:${lead.phone}`} className="text-[color:var(--color-nordan-accent)]">{lead.phone}</a> : "—"} />
            <KV label="Audit-ID" value={lead.audit_id ? <span className="font-mono text-[0.82rem]">{lead.audit_id}</span> : "—"} />
            <KV label="Sidst opdateret" value={new Date(lead.updated_at).toLocaleString("da-DK", { dateStyle: "short", timeStyle: "short" })} />
          </dl>
        </div>

        <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7 mb-5">
          <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-4">
            Status & noter
          </h2>
          <LeadStatusForm leadId={lead.id} status={lead.status} notes={lead.notes ?? ""} />
        </div>

        {Object.keys(lead.payload).length > 0 ? (
          <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7 mb-5">
            <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-3">
              Indsendte data
            </h2>
            <pre className="text-[0.82rem] bg-[color:var(--color-nordan-soft)] rounded p-4 overflow-x-auto">{JSON.stringify(lead.payload, null, 2)}</pre>
          </div>
        ) : null}

        <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7">
          <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-4">
            Tidslinje ({events.length} hændelser)
          </h2>
          {events.length === 0 ? (
            <div className="text-[color:var(--color-nordan-muted)] text-[0.88rem]">Ingen hændelser registreret.</div>
          ) : (
            <ol className="space-y-3 border-l-2 border-[color:var(--color-nordan-line)] pl-5">
              {events.map((ev) => (
                <li key={ev.id}>
                  <div className="text-[0.78rem] font-mono text-[color:var(--color-nordan-muted)]">
                    {new Date(ev.created_at).toLocaleString("da-DK", { dateStyle: "short", timeStyle: "medium" })}
                  </div>
                  <div className="font-semibold text-[0.95rem]">{ev.type}</div>
                  {Object.keys(ev.metadata).length > 0 ? (
                    <pre className="text-[0.78rem] text-[color:var(--color-nordan-muted)] mt-1">{JSON.stringify(ev.metadata)}</pre>
                  ) : null}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-1">{label}</dt>
      <dd className="text-[color:var(--color-nordan-ink)]">{value}</dd>
    </div>
  );
}
