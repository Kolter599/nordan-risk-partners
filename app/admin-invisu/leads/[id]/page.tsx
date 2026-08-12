import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { list } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getLead,
  getLeadAttribution,
  isPlaceholderEmail,
  listEventsForLead,
  type Lead,
  type LeadAttribution,
} from "@/lib/db";
import { LeadStatusForm } from "./LeadStatusForm";

/**
 * Find the signed fuldmagt PDF for a lead so admins can download it.
 *   1. payload.fuldmagtUrl — written by /api/sign for every new signing.
 *   2. payload.signedFuldmagt.blobUrl — legacy shape from the analyse flow.
 *   3. Blob fallback — for signings from before the URL was persisted: the
 *      PDF still lives in Blob under fuldmagter/{cvr}-{...}-{auditId8}.pdf.
 */
async function resolveFuldmagtUrl(lead: Lead): Promise<string | null> {
  const payload = lead.payload ?? {};
  const direct = payload.fuldmagtUrl;
  if (typeof direct === "string" && direct.startsWith("http")) return direct;
  const legacy = (payload.signedFuldmagt as { blobUrl?: unknown } | undefined)?.blobUrl;
  if (typeof legacy === "string" && legacy.startsWith("http")) return legacy;

  // Fallback: look it up in Blob storage by CVR + audit-id.
  if (!process.env.BLOB_READ_WRITE_TOKEN || !lead.audit_id || !lead.cvr) return null;
  try {
    const cvrSlug = lead.cvr.replace(/\D/g, "");
    const { blobs } = await list({ prefix: `fuldmagter/${cvrSlug}-` });
    const auditFragment = lead.audit_id.slice(0, 8);
    const match = blobs.find((b) => b.pathname.includes(auditFragment)) ?? blobs[0];
    return match?.url ?? null;
  } catch (err) {
    console.error("[admin] resolveFuldmagtUrl blob lookup failed:", err);
    return null;
  }
}

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
  const lead = await getLead(id);
  if (!lead) notFound();
  const [events, attribution, fuldmagtUrl] = await Promise.all([
    listEventsForLead(id),
    getLeadAttribution(lead),
    resolveFuldmagtUrl(lead),
  ]);

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
            <KV
              label="E-mail"
              value={
                isPlaceholderEmail(lead.email) ? (
                  <span className="text-[color:var(--color-nordan-muted)]">
                    — ingen oplyst (kun CVR)
                  </span>
                ) : (
                  <a href={`mailto:${lead.email}`} className="text-[color:var(--color-nordan-accent)]">
                    {lead.email}
                  </a>
                )
              }
            />
            <KV label="Telefon" value={lead.phone ? <a href={`tel:${lead.phone}`} className="text-[color:var(--color-nordan-accent)]">{lead.phone}</a> : "—"} />
            <KV label="Audit-ID" value={lead.audit_id ? <span className="font-mono text-[0.82rem]">{lead.audit_id}</span> : "—"} />
            <KV label="Sidst opdateret" value={new Date(lead.updated_at).toLocaleString("da-DK", { dateStyle: "short", timeStyle: "short" })} />
          </dl>
        </div>

        {fuldmagtUrl ? (
          <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7 mb-5">
            <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-4">
              Underskrevet fuldmagt
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={fuldmagtUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[color:var(--color-nordan-accent)] text-white text-[0.88rem] font-semibold hover:bg-[#8f715f] transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </a>
              <a
                href={fuldmagtUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.85rem] text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-accent)] break-all"
              >
                Åbn i ny fane
              </a>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7 mb-5">
          <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-4">
            Status & noter
          </h2>
          <LeadStatusForm leadId={lead.id} status={lead.status} notes={lead.notes ?? ""} />
        </div>

        <AttributionBlock attribution={attribution} />


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
      <dd className="text-[color:var(--color-nordan-ink)] break-words">{value}</dd>
    </div>
  );
}

const MATCHED_BY_LABEL: Record<NonNullable<LeadAttribution["matchedBy"]>, string> = {
  audit: "Direkte (client-id)",
  cvr_email: "CVR + e-mail",
  cvr: "CVR",
  email: "E-mail",
  payload: "Lead payload",
};

function AttributionBlock({ attribution }: { attribution: LeadAttribution }) {
  const hasAny =
    attribution.firstTouch ||
    attribution.lastTouch ||
    attribution.serverReferer ||
    attribution.userAgent ||
    attribution.clientIp ||
    attribution.funnelStartPath ||
    attribution.sourcePath;
  return (
    <div className="bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] p-7 mb-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-[0.72rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)]">
          Hvor leadet er kommet ind
        </h2>
        {attribution.matchedBy ? (
          <span className="text-[0.7rem] text-[color:var(--color-nordan-muted)]">
            matchet via: {MATCHED_BY_LABEL[attribution.matchedBy]}
          </span>
        ) : null}
      </div>

      {!hasAny ? (
        <p className="text-[0.88rem] text-[color:var(--color-nordan-muted)]">
          Ingen attribution-data fundet for dette lead. Det kan ske hvis personen ikke gennemførte
          CVR-flowet i denne browser, eller hvis cookies/localStorage var ryddet.
        </p>
      ) : (
        <>
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold"
                style={{ background: "#a5887818", color: "#a58878" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#a58878]" />
                {attribution.channel}
              </span>
              <span className="text-[0.78rem] text-[color:var(--color-nordan-muted)]">
                {attribution.channelMedium}
              </span>
            </div>
            <div className="space-y-2">
              {attribution.sourcePath ? (
                <div className="flex items-baseline gap-2 text-[0.92rem]">
                  <span className="text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-muted)] w-[10rem] shrink-0">
                    Udfyldte CVR på
                  </span>
                  <code className="text-[0.88rem] font-semibold text-[color:var(--color-nordan-ink)] break-all">
                    {attribution.sourcePath}
                  </code>
                </div>
              ) : null}
              {attribution.funnelStartPath && attribution.funnelStartPath !== attribution.sourcePath ? (
                <div className="flex items-baseline gap-2 text-[0.88rem]">
                  <span className="text-[0.7rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-muted)] w-[10rem] shrink-0">
                    Landede først på
                  </span>
                  <code className="text-[0.85rem] text-[color:var(--color-nordan-ink-soft)] break-all">
                    {attribution.funnelStartPath}
                  </code>
                </div>
              ) : null}
            </div>
          </div>

          {attribution.firstTouch ? (
            <div className="mb-5">
              <div className="text-[0.72rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
                First touch
              </div>
              <dl className="grid sm:grid-cols-2 gap-3 text-[0.88rem]">
                <KV label="utm_source" value={attribution.firstTouch.source ?? "—"} />
                <KV label="utm_medium" value={attribution.firstTouch.medium ?? "—"} />
                <KV label="utm_campaign" value={attribution.firstTouch.campaign ?? "—"} />
                <KV label="Henvisende domæne" value={attribution.firstTouch.referrer ?? "—"} />
                <KV label="Landing page" value={attribution.firstTouch.landingPath ?? "—"} />
                <KV
                  label="Tidspunkt"
                  value={
                    attribution.firstTouch.at
                      ? new Date(attribution.firstTouch.at).toLocaleString("da-DK", {
                          dateStyle: "short",
                          timeStyle: "short",
                          timeZone: "Europe/Copenhagen",
                        })
                      : "—"
                  }
                />
              </dl>
            </div>
          ) : null}

          {attribution.lastTouch &&
          (attribution.lastTouch.source ||
            attribution.lastTouch.medium ||
            attribution.lastTouch.campaign ||
            attribution.lastTouch.content ||
            attribution.lastTouch.term) ? (
            <div className="mb-5">
              <div className="text-[0.72rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
                Last touch (senest opdateret)
              </div>
              <dl className="grid sm:grid-cols-2 gap-3 text-[0.88rem]">
                <KV label="utm_source" value={attribution.lastTouch.source ?? "—"} />
                <KV label="utm_medium" value={attribution.lastTouch.medium ?? "—"} />
                <KV label="utm_campaign" value={attribution.lastTouch.campaign ?? "—"} />
                <KV label="utm_content" value={attribution.lastTouch.content ?? "—"} />
                <KV label="utm_term" value={attribution.lastTouch.term ?? "—"} />
              </dl>
            </div>
          ) : null}

          <div>
            <div className="text-[0.72rem] uppercase tracking-[0.16em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
              Teknisk kontekst
            </div>
            <dl className="grid sm:grid-cols-2 gap-3 text-[0.88rem]">
              <KV
                label="IP"
                value={attribution.clientIp ? <code className="text-[0.82rem]">{attribution.clientIp}</code> : "—"}
              />
              <KV
                label="Server-referer"
                value={
                  attribution.serverReferer ? (
                    <code className="text-[0.78rem] break-all">{attribution.serverReferer}</code>
                  ) : (
                    "—"
                  )
                }
              />
              <KV
                label="User-Agent"
                value={
                  attribution.userAgent ? (
                    <code className="text-[0.78rem] break-all">{attribution.userAgent}</code>
                  ) : (
                    "—"
                  )
                }
              />
              <KV
                label="Funnel started on"
                value={attribution.sourcePath ?? attribution.funnelStartPath ?? "—"}
              />
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
