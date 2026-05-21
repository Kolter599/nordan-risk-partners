import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getStatsBetween,
  getFunnelStats,
  listUnifiedActivity,
  getAttributionStats,
  isDbConfigured,
  FUNNEL_STEPS,
  type LeadAttribution,
  type FunnelStep,
  type AttributionRow,
  type UnifiedActivityGroup,
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
  const [monthStats, allTimeStats, funnel, activity, attribution] = await Promise.all([
    getStatsBetween(monthStart, now),
    getStatsBetween(new Date(2020, 0, 1), now),
    getFunnelStats(last30),
    listUnifiedActivity(last30, 120),
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

        {/* Unified activity per company — sessions + leads + attribution */}
        <section className="mb-8">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[1rem]">Aktivitet & leads pr. virksomhed</h2>
              <p className="text-[0.78rem] text-[color:var(--color-nordan-muted)] mt-1">
                Alt vi ved om hver virksomhed samlet — sessions, attribution, kontakter og leads i ét.
                Sorteret efter senest aktive.
              </p>
            </div>
            <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">
              {activity.length} virksomheder · sidste 30 dage
            </span>
          </div>
          {activity.length === 0 ? (
            <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-8 text-center text-[color:var(--color-nordan-muted)]">
              Ingen aktivitet endnu — den dukker op her så snart en besøgende
              starter på CVR-flowet eller indsender en formular.
            </div>
          ) : (
            <div className="grid gap-4">
              {activity.map((group) => (
                <ActivityCard key={group.groupKey} group={group} />
              ))}
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

function ActivityCard({ group }: { group: UnifiedActivityGroup }) {
  const stepColor = group.furthestStep ? STEP_COLORS[group.furthestStep] : "#9ca3af";
  const stepLabel = group.furthestStep ? STEP_LABELS[group.furthestStep] : "Ingen session";
  const lastActivity = new Date(group.lastActivity).toLocaleString("da-DK", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });
  const title = group.company ?? group.contacts[0]?.name ?? group.contacts[0]?.email ?? "Ukendt";
  const latestLeadStatus = group.leads[0]
    ? STATUS_LABELS[group.leads[0].status]
    : null;

  return (
    <article className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] overflow-hidden hover:border-[color:var(--color-nordan-accent)]/40 transition-colors">
      {/* Header: title + CVR + status badge + timestamp */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-[color:var(--color-nordan-line)] bg-[color:var(--color-nordan-soft)]/30">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
            <h3 className="font-semibold text-[1.02rem] text-[color:var(--color-nordan-ink)] truncate">
              {title}
            </h3>
            {group.cvr ? (
              <span className="font-mono text-[0.78rem] text-[color:var(--color-nordan-muted)]">
                CVR {group.cvr}
              </span>
            ) : (
              <span className="text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--color-nordan-muted)]">
                Uden CVR
              </span>
            )}
          </div>
          <div className="text-[0.78rem] text-[color:var(--color-nordan-muted)] font-mono mt-0.5">
            sidst aktiv {lastActivity}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold"
            style={{ background: `${stepColor}15`, color: stepColor }}
            title="Længst nået i CVR-flowet"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: stepColor }} />
            {stepLabel}
          </span>
          {latestLeadStatus ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold"
              style={{ background: `${latestLeadStatus.color}15`, color: latestLeadStatus.color }}
              title="Status på seneste lead"
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: latestLeadStatus.color }} />
              {latestLeadStatus.label}
            </span>
          ) : null}
        </div>
      </div>

      {/* Body grid: attribution | metrics | contacts | leads */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 px-5 py-5 text-[0.85rem]">
        <Col label="Indkommet via">
          <AttributionBadge attribution={group.attribution} />
        </Col>

        <Col label="Sessions">
          <div className="text-[0.92rem] font-semibold text-[color:var(--color-nordan-ink)]">
            {group.totalSessions === 0
              ? "—"
              : `${group.totalSessions} ${group.totalSessions === 1 ? "session" : "sessioner"}`}
          </div>
          {group.attribution.sourcePath ? (
            <div
              className="text-[0.72rem] text-[color:var(--color-nordan-muted)] truncate mt-1"
              title={`Udfyldte CVR på: ${group.attribution.sourcePath}`}
            >
              📝 {group.attribution.sourcePath === "/" ? "Forsiden" : group.attribution.sourcePath}
            </div>
          ) : null}
        </Col>

        <Col label="Kontakter">
          {group.contacts.length === 0 ? (
            <span className="text-[color:var(--color-nordan-muted)] text-[0.82rem]">— ingen oplyst</span>
          ) : (
            <ul className="space-y-1.5">
              {group.contacts.slice(0, 3).map((c, i) => (
                <li key={i} className="text-[0.82rem] leading-tight">
                  {c.name ? <span className="font-medium text-[color:var(--color-nordan-ink)]">{c.name}</span> : null}
                  {c.email ? (
                    <a
                      href={`mailto:${c.email}`}
                      className="block hover:text-[color:var(--color-nordan-accent)] truncate"
                    >
                      {c.email}
                    </a>
                  ) : null}
                  {c.phone ? (
                    <span className="block text-[0.76rem] text-[color:var(--color-nordan-muted)]">{c.phone}</span>
                  ) : null}
                </li>
              ))}
              {group.contacts.length > 3 ? (
                <li className="text-[0.74rem] text-[color:var(--color-nordan-muted)]">
                  +{group.contacts.length - 3} mere
                </li>
              ) : null}
            </ul>
          )}
        </Col>

        <Col label={group.leads.length > 0 ? `Leads (${group.leads.length})` : "Leads"}>
          {group.leads.length === 0 ? (
            <span className="text-[color:var(--color-nordan-muted)] text-[0.82rem]">— ingen lead endnu</span>
          ) : (
            <ul className="space-y-1.5">
              {group.leads.slice(0, 3).map((lead) => {
                const leadStatus = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "#0a0a0a" };
                const date = new Date(lead.created_at).toLocaleDateString("da-DK", {
                  day: "2-digit",
                  month: "short",
                });
                return (
                  <li key={lead.id} className="text-[0.82rem] leading-tight">
                    <Link
                      href={`/admin-invisu/leads/${lead.id}`}
                      className="group inline-flex items-baseline gap-1.5 hover:text-[color:var(--color-nordan-accent)]"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                        style={{ background: leadStatus.color }}
                      />
                      <span className="font-mono text-[0.74rem] text-[color:var(--color-nordan-muted)] shrink-0">
                        {date}
                      </span>
                      <span className="font-medium">{lead.name ?? lead.email}</span>
                      <span className="text-[0.72rem] text-[color:var(--color-nordan-muted)]">
                        · {SOURCE_LABELS[lead.source] ?? lead.source}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {group.leads.length > 3 ? (
                <li className="text-[0.74rem] text-[color:var(--color-nordan-muted)]">
                  +{group.leads.length - 3} ældre leads
                </li>
              ) : null}
            </ul>
          )}
        </Col>
      </div>
    </article>
  );
}

function Col({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[0.66rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-1.5">
        {label}
      </div>
      {children}
    </div>
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

function AttributionBadge({ attribution }: { attribution: LeadAttribution }) {
  const hasSignal =
    attribution.firstTouch?.source ||
    attribution.firstTouch?.referrer ||
    attribution.firstTouch?.campaign ||
    attribution.firstTouch?.landingPath ||
    attribution.sourcePath;
  if (!hasSignal) {
    return <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">Direct / ingen signal</span>;
  }
  const sourcePath = attribution.sourcePath;
  const landingPath = attribution.firstTouch?.landingPath ?? attribution.funnelStartPath;
  // Same path = no point showing twice — the CVR was filled where they landed.
  const showLandingSeparately = sourcePath && landingPath && sourcePath !== landingPath;
  return (
    <div className="flex flex-col gap-1 text-[0.8rem] leading-tight">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold"
          style={{ background: "#a5887815", color: "#a58878" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#a58878]" />
          {attribution.channel}
        </span>
        <span className="text-[0.7rem] text-[color:var(--color-nordan-muted)]">
          {attribution.channelMedium}
        </span>
      </div>
      {attribution.firstTouch?.campaign ? (
        <div className="text-[0.72rem] text-[color:var(--color-nordan-muted)] font-mono truncate max-w-[220px]">
          {attribution.firstTouch.campaign}
        </div>
      ) : null}
      {sourcePath ? (
        <div
          className="text-[0.74rem] text-[color:var(--color-nordan-ink-soft)] truncate max-w-[240px] font-medium"
          title={`Udfyldte CVR på: ${sourcePath}`}
        >
          <span className="text-[color:var(--color-nordan-muted)] font-normal">📝 </span>
          {sourcePath === "/" ? "Forsiden" : sourcePath}
        </div>
      ) : null}
      {showLandingSeparately && landingPath ? (
        <div
          className="text-[0.7rem] text-[color:var(--color-nordan-muted)] truncate max-w-[240px]"
          title={`Landede først på: ${landingPath}`}
        >
          ↳ landede på {landingPath === "/" ? "/" : landingPath}
        </div>
      ) : null}
    </div>
  );
}
