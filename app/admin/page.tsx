import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listLeads, getStatsBetween, isDbConfigured, type Lead } from "@/lib/db";

export const metadata: Metadata = {
  title: "Admin · Leads",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  kontakt: "Kontakt",
  hero: "Forside",
  analyse: "/analyse",
  hole_in_one: "Hole-in-one",
  sign: "Signering",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Ny", color: "#6b6b6b" },
  partial: { label: "Halvfærdig", color: "#a58878" },
  completed: { label: "Færdig", color: "#253f32" },
  quoted: { label: "Tilbud sendt", color: "#1d4ed8" },
  won: { label: "Vundet", color: "#15803d" },
  lost: { label: "Tabt", color: "#b91c1c" },
};

export default async function AdminDashboard() {
  await requireAdmin();

  if (!isDbConfigured()) {
    return (
      <main className="min-h-screen bg-[color:var(--color-nordan-soft)] px-5 py-16">
        <div className="mx-auto max-w-[920px] bg-white rounded-[10px] p-8 shadow-sm">
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.6rem] mb-3">
            Supabase ikke konfigureret endnu
          </h1>
          <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-4">
            Sæt <code>SUPABASE_URL</code> og <code>SUPABASE_SERVICE_ROLE_KEY</code> i Vercel env vars,
            og kør migration <code>supabase/migrations/0001_init.sql</code> i Supabase SQL editor.
          </p>
        </div>
      </main>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [leads, monthStats, allTimeStats] = await Promise.all([
    listLeads({ limit: 100 }),
    getStatsBetween(monthStart, now),
    getStatsBetween(new Date(2020, 0, 1), now),
  ]);

  return (
    <main className="min-h-screen bg-[color:var(--color-nordan-soft)] py-10 px-5">
      <div className="mx-auto max-w-[1200px]">
        <header className="flex items-baseline justify-between mb-8">
          <div>
            <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
              Admin · Sebastian
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[1.8rem] leading-tight">
              Leads & aktivitet
            </h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-[0.85rem] text-[color:var(--color-nordan-muted)] underline">
              Log ud
            </button>
          </form>
        </header>

        {/* Stats */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Stat label="Denne måned" value={monthStats.totalLeads} sub="leads" />
          <Stat label="Underskrevne" value={monthStats.signedCount} sub="i denne måned" />
          <Stat label="Tilbud sendt" value={monthStats.quotedCount} sub="i denne måned" />
          <Stat label="Vundet" value={monthStats.wonCount} sub="i denne måned" highlight />
        </section>

        {/* Source breakdown */}
        <section className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-[10px] p-5 border border-[color:var(--color-nordan-line)]">
            <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-3">
              Pr. kilde (denne måned)
            </h2>
            {Object.keys(monthStats.bySource).length === 0 ? (
              <div className="text-[0.85rem] text-[color:var(--color-nordan-muted)]">Ingen aktivitet endnu.</div>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(monthStats.bySource).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-[0.92rem]">
                    <span>{SOURCE_LABELS[k] ?? k}</span>
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-[10px] p-5 border border-[color:var(--color-nordan-line)]">
            <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-3">
              Pr. status (denne måned)
            </h2>
            {Object.keys(monthStats.byStatus).length === 0 ? (
              <div className="text-[0.85rem] text-[color:var(--color-nordan-muted)]">Ingen aktivitet endnu.</div>
            ) : (
              <ul className="space-y-1.5">
                {Object.entries(monthStats.byStatus).map(([k, v]) => (
                  <li key={k} className="flex justify-between text-[0.92rem]">
                    <span style={{ color: STATUS_LABELS[k]?.color ?? "#0a0a0a" }}>
                      {STATUS_LABELS[k]?.label ?? k}
                    </span>
                    <strong>{v}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* All-time totals */}
        <section className="text-[0.85rem] text-[color:var(--color-nordan-muted)] mb-3">
          All-time: <strong className="text-[color:var(--color-nordan-ink)]">{allTimeStats.totalLeads}</strong> leads ·{" "}
          <strong className="text-[color:var(--color-nordan-ink)]">{allTimeStats.signedCount}</strong> underskrevne ·{" "}
          <strong className="text-[color:var(--color-nordan-ink)]">{allTimeStats.wonCount}</strong> vundet
        </section>

        {/* Leads table */}
        <section className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[color:var(--color-nordan-line)]">
            <h2 className="font-semibold text-[1rem]">Seneste leads</h2>
          </div>
          {leads.length === 0 ? (
            <div className="p-8 text-center text-[color:var(--color-nordan-muted)]">
              Ingen leads endnu — de begynder at dukke op her når kunder bruger formularen.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.88rem]">
                <thead className="bg-[color:var(--color-nordan-soft)]/40 text-[0.72rem] uppercase tracking-[0.08em] text-[color:var(--color-nordan-muted)]">
                  <tr>
                    <th className="text-left px-4 py-3">Tidspunkt</th>
                    <th className="text-left px-4 py-3">Navn</th>
                    <th className="text-left px-4 py-3">Firma</th>
                    <th className="text-left px-4 py-3">Kilde</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Kontakt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-nordan-line)]">
                  {leads.map((lead) => (
                    <LeadRow key={lead.id} lead={lead} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] p-5 border ${
        highlight
          ? "bg-[color:var(--color-nordan-dark)] text-white border-transparent"
          : "bg-white border-[color:var(--color-nordan-line)]"
      }`}
    >
      <div
        className={`text-[0.7rem] uppercase tracking-[0.18em] font-semibold mb-2 ${
          highlight ? "text-[color:var(--color-nordan-accent-soft)]" : "text-[color:var(--color-nordan-muted)]"
        }`}
      >
        {label}
      </div>
      <div className="font-bold text-[2rem] leading-[1] mb-1">{value}</div>
      {sub ? (
        <div className={`text-[0.78rem] ${highlight ? "text-white/70" : "text-[color:var(--color-nordan-muted)]"}`}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const status = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "#0a0a0a" };
  const formatted = new Date(lead.created_at).toLocaleString("da-DK", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });
  return (
    <tr className="hover:bg-[color:var(--color-nordan-soft)]/30">
      <td className="px-4 py-3 text-[color:var(--color-nordan-muted)] whitespace-nowrap font-mono text-[0.78rem]">
        {formatted}
      </td>
      <td className="px-4 py-3">
        <Link href={`/admin/leads/${lead.id}`} className="font-semibold hover:text-[color:var(--color-nordan-accent)]">
          {lead.name ?? "—"}
        </Link>
      </td>
      <td className="px-4 py-3 text-[color:var(--color-nordan-ink-soft)]">
        {lead.company ?? "—"}
        {lead.cvr ? (
          <span className="text-[0.72rem] text-[color:var(--color-nordan-muted)] ml-1.5">CVR {lead.cvr}</span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-[color:var(--color-nordan-ink-soft)]">
        {SOURCE_LABELS[lead.source] ?? lead.source}
      </td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold"
          style={{
            background: `${status.color}15`,
            color: status.color,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3 text-[color:var(--color-nordan-ink-soft)] whitespace-nowrap">
        <a href={`mailto:${lead.email}`} className="hover:text-[color:var(--color-nordan-accent)]">
          {lead.email}
        </a>
        {lead.phone ? (
          <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)] block">{lead.phone}</span>
        ) : null}
      </td>
    </tr>
  );
}
