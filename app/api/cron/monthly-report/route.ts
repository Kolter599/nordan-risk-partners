import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  getStatsBetween,
  listLeads,
  listRecentSessions,
  isDbConfigured,
  type Lead,
  type Session,
} from "@/lib/db";
import { renderBrandedEmail, EMAIL_COLORS } from "@/lib/email-template";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";

// Both recipients see the email + replies (shared thread). Reply goes to
// both so Mads can answer and Sebastian sees it without forwarding.
const RECIPIENTS = ["sebastian@invisu.dk", "mh@ndrp.dk"];

/**
 * Map referrer hostname → friendly source/medium pair. Mirrors the
 * derivation in lib/db.ts so the email shows the same labels as /admin.
 */
function deriveFromReferrer(referrer: string | null): { source: string; medium: string } {
  if (!referrer) return { source: "direct", medium: "direct" };
  const h = referrer.toLowerCase();
  if (h.includes("linkedin.")) return { source: "linkedin", medium: "social" };
  if (h.includes("facebook.")) return { source: "facebook", medium: "social" };
  if (h.includes("instagram.")) return { source: "instagram", medium: "social" };
  if (h === "x.com" || h === "twitter.com" || h === "t.co") return { source: "twitter", medium: "social" };
  if (h.includes("youtube.")) return { source: "youtube", medium: "social" };
  if (h.includes("google.")) return { source: "google", medium: "organic" };
  if (h.includes("bing.")) return { source: "bing", medium: "organic" };
  if (h.includes("mail.")) return { source: "email", medium: "email" };
  if (h.includes("chatgpt.")) return { source: "chatgpt", medium: "ai" };
  return { source: h, medium: "referral" };
}

function escape(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function leadDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
  });
}

export async function GET(req: Request) {
  // Vercel sets x-vercel-cron header on legitimate cron invocations; allow
  // a manual trigger via ?secret= for testing.
  const isCron = req.headers.get("x-vercel-cron") === "1";
  const url = new URL(req.url);
  const secretMatches =
    process.env.CRON_SECRET && url.searchParams.get("secret") === process.env.CRON_SECRET;
  if (!isCron && !secretMatches) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isDbConfigured() || !RESEND_API_KEY) {
    return NextResponse.json({
      ok: false,
      reason: "DB eller Resend ikke konfigureret",
    });
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [stats, leads, sessions] = await Promise.all([
    getStatsBetween(thirtyDaysAgo, now),
    listLeads({ since: thirtyDaysAgo, limit: 500 }),
    listRecentSessions(thirtyDaysAgo, 500),
  ]);

  // Build a lookup so we can attach attribution + journey to each lead
  const sessionByCvr = new Map<string, Session>();
  const sessionByEmail = new Map<string, Session>();
  for (const s of sessions) {
    if (s.cvr && !sessionByCvr.has(s.cvr)) sessionByCvr.set(s.cvr, s);
    if (s.contact_email && !sessionByEmail.has(s.contact_email))
      sessionByEmail.set(s.contact_email, s);
  }

  type EnrichedLead = {
    lead: Lead;
    source: string;
    medium: string;
    landingPath: string | null;
    furthestStep: string | null;
  };

  const enriched: EnrichedLead[] = leads.map((lead) => {
    const session = (lead.cvr && sessionByCvr.get(lead.cvr)) ||
      sessionByEmail.get(lead.email) ||
      null;
    const derived = deriveFromReferrer(session?.first_touch_referrer ?? null);
    return {
      lead,
      source: session?.first_touch_source ?? derived.source,
      medium: session?.first_touch_medium ?? derived.medium,
      landingPath: session?.first_touch_path ?? null,
      furthestStep: session?.furthest_step ?? null,
    };
  });

  const monthLabel = now.toLocaleDateString("da-DK", { month: "long", year: "numeric" });
  const conversionPct =
    stats.totalLeads > 0 ? Math.round((stats.signedCount / stats.totalLeads) * 100) : 0;

  // Per-lead table — the main thing in the email
  const leadsHtml = enriched.length === 0
    ? `<div style="padding:14px 16px;background:${EMAIL_COLORS.soft};border-radius:6px;text-align:center;color:${EMAIL_COLORS.inkSoft};font-size:13px;">Ingen leads i perioden.</div>`
    : `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:10px 8px;border-bottom:2px solid ${EMAIL_COLORS.line};font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};font-weight:600;">Dato</th>
            <th style="text-align:left;padding:10px 8px;border-bottom:2px solid ${EMAIL_COLORS.line};font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};font-weight:600;">Firma</th>
            <th style="text-align:left;padding:10px 8px;border-bottom:2px solid ${EMAIL_COLORS.line};font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};font-weight:600;">Kontakt</th>
            <th style="text-align:left;padding:10px 8px;border-bottom:2px solid ${EMAIL_COLORS.line};font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};font-weight:600;">Kilde</th>
            <th style="text-align:left;padding:10px 8px;border-bottom:2px solid ${EMAIL_COLORS.line};font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};font-weight:600;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${enriched
            .map((e) => {
              const l = e.lead;
              const statusColor =
                l.status === "won"
                  ? "#15803d"
                  : l.status === "completed"
                  ? EMAIL_COLORS.green
                  : l.status === "quoted"
                  ? "#1d4ed8"
                  : l.status === "lost"
                  ? "#b91c1c"
                  : EMAIL_COLORS.inkSoft;
              return `<tr>
                <td style="padding:10px 8px;border-bottom:1px solid ${EMAIL_COLORS.line};font-size:12px;color:${EMAIL_COLORS.inkSoft};white-space:nowrap;">${escape(leadDateLabel(l.created_at))}</td>
                <td style="padding:10px 8px;border-bottom:1px solid ${EMAIL_COLORS.line};font-size:13px;color:${EMAIL_COLORS.ink};">
                  <strong>${escape(l.company ?? "—")}</strong>${l.cvr ? `<div style="font-size:11px;color:${EMAIL_COLORS.inkSoft};">CVR ${escape(l.cvr)}</div>` : ""}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid ${EMAIL_COLORS.line};font-size:12px;color:${EMAIL_COLORS.ink};">
                  ${escape(l.name ?? "—")}<br/>
                  <a href="mailto:${escape(l.email)}" style="color:${EMAIL_COLORS.accent};font-size:11px;text-decoration:none;">${escape(l.email)}</a>${l.phone ? `<div style="font-size:11px;color:${EMAIL_COLORS.inkSoft};">${escape(l.phone)}</div>` : ""}
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid ${EMAIL_COLORS.line};font-size:12px;color:${EMAIL_COLORS.inkSoft};">
                  <strong style="color:${EMAIL_COLORS.ink};">${escape(e.source)}</strong>
                  <div style="font-size:10px;color:${EMAIL_COLORS.inkSoft};">${escape(e.medium)}</div>
                </td>
                <td style="padding:10px 8px;border-bottom:1px solid ${EMAIL_COLORS.line};font-size:12px;">
                  <span style="display:inline-block;padding:2px 8px;border-radius:10px;background:${statusColor}15;color:${statusColor};font-weight:600;font-size:11px;">${escape(l.status)}</span>
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>`;

  // Half-finished — sessions that reached at least step 2 (CVR confirmed)
  // but didn't complete. Useful for follow-up calls.
  const halfFinished = sessions.filter(
    (s) =>
      s.cvr &&
      s.contact_email &&
      (s.furthest_step === "confirm" || s.furthest_step === "actions")
  );

  const halfFinishedHtml = halfFinished.length === 0
    ? ""
    : `<div style="margin-top:32px;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#a16207;margin-bottom:8px;">Halvfærdige flows (${halfFinished.length})</div>
        <p style="margin:0 0 12px;font-size:13px;color:${EMAIL_COLORS.inkSoft};line-height:1.6;">Folk der nåede til Bekræft eller Underskrift uden at gennemføre. Måske værd at ringe.</p>
        <div style="font-size:13px;line-height:1.7;">
          ${halfFinished
            .slice(0, 10)
            .map(
              (s) => `<div style="padding:8px 0;border-bottom:1px solid ${EMAIL_COLORS.line};">
                <strong>${escape(s.company ?? "Ukendt")}</strong>${s.cvr ? ` <span style="color:${EMAIL_COLORS.inkSoft};">CVR ${escape(s.cvr)}</span>` : ""} —
                <span style="color:${EMAIL_COLORS.inkSoft};">${escape(s.contact_name ?? "ingen navn")}</span>
                ${s.contact_email ? ` · <a href="mailto:${escape(s.contact_email)}" style="color:${EMAIL_COLORS.accent};text-decoration:none;">${escape(s.contact_email)}</a>` : ""}
                <span style="float:right;font-size:11px;color:${EMAIL_COLORS.inkSoft};">nåede ${escape(s.furthest_step)}</span>
              </div>`
            )
            .join("")}
        </div>
      </div>`;

  const html = renderBrandedEmail({
    preheader: `${stats.totalLeads} leads · ${stats.signedCount} underskrevne i ${monthLabel}`,
    eyebrow: `Månedsrapport · ${monthLabel}`,
    title: `${stats.totalLeads} leads gennem hjemmesiden`,
    bodyHtml: `
      <p style="margin:0 0 18px;font-size:15.5px;line-height:1.65;color:${EMAIL_COLORS.ink};">
        Her er hvad der er sket på <strong>nordanriskpartners.dk</strong> de sidste 30 dage.
        Hej Sebastian + Mads — svar gerne med status på de enkelte leads (se bunden).
      </p>

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;margin:8px 0 24px;">
        <tr>
          <td style="width:25%;padding:14px 8px;text-align:center;background:${EMAIL_COLORS.soft};border-radius:6px;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.green};">${stats.totalLeads}</div>
            <div style="font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Leads</div>
          </td>
          <td style="width:25%;padding:14px 8px;text-align:center;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.green};">${stats.signedCount}</div>
            <div style="font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Underskrevne</div>
          </td>
          <td style="width:25%;padding:14px 8px;text-align:center;background:${EMAIL_COLORS.soft};border-radius:6px;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.accent};">${stats.wonCount}</div>
            <div style="font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Vundet</div>
          </td>
          <td style="width:25%;padding:14px 8px;text-align:center;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.green};">${conversionPct}%</div>
            <div style="font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Conversion</div>
          </td>
        </tr>
      </table>

      <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin:20px 0 10px;">Alle leads i perioden</div>
      ${leadsHtml}

      ${halfFinishedHtml}

      <div style="margin-top:36px;padding:16px 18px;background:${EMAIL_COLORS.soft};border-left:3px solid ${EMAIL_COLORS.accent};border-radius:4px;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Mads — svar gerne</div>
        <p style="margin:0 0 8px;font-size:13.5px;line-height:1.65;color:${EMAIL_COLORS.ink};">
          Bare svar på denne mail med en linje pr. lead du vil opdatere. Eksempler:
        </p>
        <ul style="margin:6px 0 0;padding-left:20px;font-size:13px;line-height:1.75;color:${EMAIL_COLORS.ink};">
          <li><strong>Acme ApS</strong>: vundet · honorar ca. 35.000 kr/år</li>
          <li><strong>Beta Co</strong>: tilbud sendt · venter på svar</li>
          <li><strong>Gamma A/S</strong>: ikke fra hjemmeside — selv-skaffet</li>
          <li><strong>Delta ApS</strong>: tabt · valgte konkurrent</li>
        </ul>
        <p style="margin:14px 0 0;font-size:12px;color:${EMAIL_COLORS.inkSoft};">
          Sebastian opdaterer admin-panelet bagefter, og næste rapport reflekterer det.
        </p>
      </div>

      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_COLORS.inkSoft};">
        Se det fulde overblik på <a href="https://nordanriskpartners.dk/admin" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">nordanriskpartners.dk/admin</a>.
      </p>
    `,
  });

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: RECIPIENTS,
    // Replies go back to both addresses so the thread stays shared.
    replyTo: RECIPIENTS,
    subject: `Månedsrapport · ${monthLabel} · ${stats.totalLeads} leads`,
    html,
  });

  return NextResponse.json({
    ok: true,
    sentTo: RECIPIENTS,
    period: `${thirtyDaysAgo.toISOString()} → ${now.toISOString()}`,
    totalLeads: stats.totalLeads,
    leadsListed: enriched.length,
    halfFinished: halfFinished.length,
  });
}
