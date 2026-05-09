import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import {
  listLeads,
  getStatsBetween,
  getFunnelStats,
  listSessionsByCvr,
  getAttributionStats,
  isDbConfigured,
  FUNNEL_STEPS,
  type Lead,
  type FunnelStep,
  type AttributionRow,
} from "@/lib/db";

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

const STEP_LABELS: Record<FunnelStep, string> = {
  started: "Startet",
  cvr_submitted: "CVR indtastet",
  confirm: "Bekræftet virksomhed",
  actions: "Nået til underskrift",
  completed: "Underskrevet fuldmagt",
};

const STEP_COLORS: Record<FunnelStep, string> = {
  started: "#9ca3af",
  cvr_submitted: "#a58878",
  confirm: "#8b6f5e",
  actions: "#5b8467",
  completed: "#253f32",
};

export default async function AdminDashboard() {
  await requireAdmin();

  if (!isDbConfigured()) {
    return (
      <main className="min-h-screen bg-[color:var(--color-nordan-soft)] px-5 py-16">
        <div className="mx-auto max-w-[920px] bg-white rounded-[10px] p-8 shadow-sm">
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.6rem] mb-3">
            Database ikke konfigureret endnu
          </h1>
          <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-4">
            Sæt <code>DATABASE_URL</code> i Vercel env vars (Neon-integration injecter den
            automatisk hvis du har koblet projektet sammen), og kør{" "}
            <code>docs/neon-init.sql</code> i Neon Console SQL Editor.
          </p>
        </div>
      </main>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [leads, monthStats, allTimeStats, funnel, sessionsByCvr, attribution] =
    await Promise.all([
      listLeads({ limit: 100 }),
      getStatsBetween(monthStart, now),
      getStatsBetween(new Date(2020, 0, 1), now),
      getFunnelStats(last30),
      listSessionsByCvr(last30, 80),
      getAttributionStats(last30),
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
        <section className="text-[0.85rem] text-[color:var(--color-nordan-muted)] mb-8">
          All-time: <strong className="text-[color:var(--color-nordan-ink)]">{allTimeStats.totalLeads}</strong> leads ·{" "}
          <strong className="text-[color:var(--color-nordan-ink)]">{allTimeStats.signedCount}</strong> underskrevne ·{" "}
          <strong className="text-[color:var(--color-nordan-ink)]">{allTimeStats.wonCount}</strong> vundet
        </section>

        {/* CVR-flow funnel — last 30 days */}
        <section className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-5 mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-semibold text-[1rem]">Analyse-flow — sidste 30 dage</h2>
            <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">
              {funnel.total} unikke besøg startede flowet
            </span>
          </div>
          {funnel.total === 0 ? (
            <div className="text-[0.88rem] text-[color:var(--color-nordan-muted)]">
              Endnu ingen sessions registreret. Når du har kørt SQL-migrationen og folk
              starter på <code>/analyse</code>, viser drop-off her.
            </div>
          ) : (
            <FunnelChart funnel={funnel} />
          )}
        </section>

        {/* Attribution */}
        <section className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-5 mb-8">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold text-[1rem]">Hvor kommer leads fra — sidste 30 dage</h2>
            <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">
              {attribution.totalWithSignal} sessions
            </span>
          </div>
          <p className="text-[0.78rem] text-[color:var(--color-nordan-muted)] leading-snug mb-4">
            Vi udleder kilden fra hvor folk klikker fra (linkedin.com → linkedin/social,
            google.com → google/organic). UTM-parametre på links giver mere detaljeret data
            men er ikke påkrævet.
          </p>
          {attribution.totalWithSignal === 0 ? (
            <div className="text-[0.88rem] text-[color:var(--color-nordan-muted)]">
              Endnu ingen sessions — kommer her så snart folk besøger sitet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              <AttributionTable
                title="Kilde"
                hint="Hvor fandt de os først (linkedin, google, direct...)"
                rows={attribution.bySource}
              />
              <AttributionTable
                title="Medium"
                hint="Social, organisk, direct, email, ai..."
                rows={attribution.byMedium}
              />
              <AttributionTable
                title="Henvisende domæne"
                hint="Konkret URL hvor de klikkede fra"
                rows={attribution.byReferrer}
              />
              <AttributionTable
                title="Kampagne (utm_campaign)"
                hint="Kun når UTM er tilføjet manuelt"
                rows={attribution.byCampaign}
              />
            </div>
          )}
        </section>

        {/* Per-CVR sessions */}
        <section className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] mb-8 overflow-hidden">
          <div className="px-5 py-4 border-b border-[color:var(--color-nordan-line)]">
            <h2 className="font-semibold text-[1rem]">Aktivitet pr. virksomhed (CVR)</h2>
            <p className="text-[0.78rem] text-[color:var(--color-nordan-muted)] mt-1">
              Sessions der er nået til mindst step 2 (CVR udfyldt). Flere
              personer fra samme virksomhed bindes sammen på CVR.
            </p>
          </div>
          {sessionsByCvr.length === 0 ? (
            <div className="p-8 text-center text-[color:var(--color-nordan-muted)]">
              Ingen halvfærdige flows endnu.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.88rem]">
                <thead className="bg-[color:var(--color-nordan-soft)]/40 text-[0.72rem] uppercase tracking-[0.08em] text-[color:var(--color-nordan-muted)]">
                  <tr>
                    <th className="text-left px-4 py-3">CVR</th>
                    <th className="text-left px-4 py-3">Virksomhed</th>
                    <th className="text-left px-4 py-3">Sessions</th>
                    <th className="text-left px-4 py-3">Længst nået</th>
                    <th className="text-left px-4 py-3">Sidst aktiv</th>
                    <th className="text-left px-4 py-3">Kontakt(er)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--color-nordan-line)]">
                  {sessionsByCvr.map((g) => (
                    <CvrGroupRow key={g.cvr} group={g} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

function AttributionTable({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: AttributionRow[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-[0.78rem] font-semibold text-[color:var(--color-nordan-ink)]">
            {title}
          </div>
          <div className="text-[0.7rem] text-[color:var(--color-nordan-muted)]">{hint}</div>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] py-2">— ingen data</div>
      ) : (
        <ul className="divide-y divide-[color:var(--color-nordan-line)]">
          {rows.map((r) => {
            const cvr = r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;
            return (
              <li key={r.label} className="flex items-center justify-between py-2 text-[0.85rem]">
                <span className="font-mono text-[0.78rem] truncate flex-1 mr-3" title={r.label}>
                  {r.label}
                </span>
                <span className="text-[color:var(--color-nordan-muted)] mr-3">{r.total}</span>
                <span
                  className={`text-[0.72rem] font-semibold tabular-nums w-12 text-right ${
                    cvr > 20
                      ? "text-green-700"
                      : cvr > 0
                      ? "text-[color:var(--color-nordan-ink)]"
                      : "text-[color:var(--color-nordan-muted)]"
                  }`}
                >
                  {r.completed}/{r.total}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FunnelChart({ funnel }: { funnel: import("@/lib/db").FunnelStats }) {
  const max = Math.max(funnel.reachedAtLeast.started, 1);
  return (
    <div className="space-y-3">
      {FUNNEL_STEPS.map((step, i) => {
        const reached = funnel.reachedAtLeast[step];
        const widthPct = (reached / max) * 100;
        const prevReached = i === 0 ? reached : funnel.reachedAtLeast[FUNNEL_STEPS[i - 1]];
        const dropoffPct = prevReached > 0 ? Math.round(((prevReached - reached) / prevReached) * 100) : 0;
        return (
          <div key={step} className="grid grid-cols-[180px_1fr_70px] sm:grid-cols-[200px_1fr_90px] items-center gap-3">
            <div className="text-[0.85rem] font-medium text-[color:var(--color-nordan-ink)]">
              {STEP_LABELS[step]}
            </div>
            <div className="relative h-7 bg-[color:var(--color-nordan-soft)] rounded">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${widthPct}%`, background: STEP_COLORS[step] }}
              />
              <div className="absolute inset-0 flex items-center px-3 text-[0.78rem] font-semibold text-white mix-blend-difference">
                {reached}
              </div>
            </div>
            <div className="text-right text-[0.78rem]">
              {i === 0 ? (
                <span className="text-[color:var(--color-nordan-muted)]">100%</span>
              ) : dropoffPct > 0 ? (
                <span className="text-red-700">−{dropoffPct}%</span>
              ) : (
                <span className="text-[color:var(--color-nordan-muted)]">0%</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CvrGroupRow({ group }: { group: import("@/lib/db").SessionsByCvrGroup }) {
  const stepColor = STEP_COLORS[group.furthestStep];
  const stepLabel = STEP_LABELS[group.furthestStep];
  const lastSeen = new Date(group.lastSeen).toLocaleString("da-DK", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });
  const contacts = group.sessions
    .map((s) => ({ name: s.contact_name, email: s.contact_email, phone: s.contact_phone }))
    .filter((c) => c.email || c.name || c.phone);
  return (
    <tr className="hover:bg-[color:var(--color-nordan-soft)]/30 align-top">
      <td className="px-4 py-3 font-mono text-[0.82rem] whitespace-nowrap">{group.cvr}</td>
      <td className="px-4 py-3 font-semibold text-[color:var(--color-nordan-ink)]">
        {group.company ?? "—"}
      </td>
      <td className="px-4 py-3 text-[color:var(--color-nordan-ink-soft)]">{group.totalSessions}</td>
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold"
          style={{ background: `${stepColor}15`, color: stepColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: stepColor }} />
          {stepLabel}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-[0.78rem] text-[color:var(--color-nordan-muted)] whitespace-nowrap">
        {lastSeen}
      </td>
      <td className="px-4 py-3 text-[color:var(--color-nordan-ink-soft)]">
        {contacts.length === 0 ? (
          <span className="text-[color:var(--color-nordan-muted)]">— ingen oplyst</span>
        ) : (
          <ul className="space-y-1">
            {contacts.map((c, i) => (
              <li key={i} className="text-[0.82rem] leading-tight">
                {c.name ? <span className="font-medium">{c.name}</span> : null}
                {c.email ? (
                  <a href={`mailto:${c.email}`} className="block hover:text-[color:var(--color-nordan-accent)]">
                    {c.email}
                  </a>
                ) : null}
                {c.phone ? (
                  <span className="block text-[0.78rem] text-[color:var(--color-nordan-muted)]">{c.phone}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </td>
    </tr>
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
