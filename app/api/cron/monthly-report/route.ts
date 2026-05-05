import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getStatsBetween, listLeads, isDbConfigured } from "@/lib/db";
import { renderBrandedEmail, emailKvTable, EMAIL_COLORS } from "@/lib/email-template";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";
const REPORT_TO = process.env.REPORT_TO_EMAIL ?? "sebastian@invisu.dk";

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
      reason: "Supabase eller Resend ikke konfigureret",
    });
  }

  const now = new Date();
  // Cover the past 30 days regardless of when the cron runs.
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const stats = await getStatsBetween(thirtyDaysAgo, now);
  const leads = await listLeads({ since: thirtyDaysAgo, limit: 200 });

  const monthLabel = now.toLocaleDateString("da-DK", { month: "long", year: "numeric" });
  const winners = leads.filter((l) => l.status === "won");
  const quoted = leads.filter((l) => l.status === "quoted");

  const sourceRows = Object.entries(stats.bySource).map(
    ([k, v]) => [k, String(v)] as [string, string]
  );
  const statusRows = Object.entries(stats.byStatus).map(
    ([k, v]) => [k, String(v)] as [string, string]
  );

  const recentList = leads.slice(0, 10);

  const html = renderBrandedEmail({
    preheader: `${stats.totalLeads} leads · ${stats.signedCount} underskrevne · ${stats.wonCount} vundet i de seneste 30 dage`,
    eyebrow: `Månedsrapport · ${monthLabel}`,
    title: `${stats.totalLeads} leads i de seneste 30 dage`,
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15.5px;line-height:1.65;">
        Her er hvad der er sket på <strong>nordanriskpartners.dk</strong> de sidste 30 dage.
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="width:25%;padding:14px 8px;text-align:center;background:${EMAIL_COLORS.soft};border-radius:6px;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.green};">${stats.totalLeads}</div>
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Leads</div>
          </td>
          <td style="width:25%;padding:14px 8px;text-align:center;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.green};">${stats.signedCount}</div>
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Underskrevne</div>
          </td>
          <td style="width:25%;padding:14px 8px;text-align:center;background:${EMAIL_COLORS.soft};border-radius:6px;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.green};">${stats.quotedCount}</div>
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Tilbud sendt</div>
          </td>
          <td style="width:25%;padding:14px 8px;text-align:center;">
            <div style="font-weight:700;font-size:24px;color:${EMAIL_COLORS.accent};">${stats.wonCount}</div>
            <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.inkSoft};">Vundet</div>
          </td>
        </tr>
      </table>

      <div style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Pr. kilde</div>
      ${sourceRows.length ? emailKvTable(sourceRows) : "<div style='color:#6b6b6b;font-size:13px;'>Ingen aktivitet</div>"}

      <div style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Pr. status</div>
      ${statusRows.length ? emailKvTable(statusRows) : "<div style='color:#6b6b6b;font-size:13px;'>Ingen aktivitet</div>"}

      ${winners.length ? `<div style="margin-top:24px;padding:14px 16px;background:#f0fdf4;border-left:3px solid #15803d;border-radius:4px;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#15803d;margin-bottom:6px;">Vundet i perioden (${winners.length})</div>
        <div style="font-size:13px;color:#0a0a0a;line-height:1.7;">${winners.map((l) => `${l.name ?? l.email} (${l.company ?? "—"})`).join("<br/>")}</div>
      </div>` : ""}

      ${quoted.length ? `<div style="margin-top:14px;padding:14px 16px;background:#eff6ff;border-left:3px solid #1d4ed8;border-radius:4px;">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:#1d4ed8;margin-bottom:6px;">Tilbud afventer (${quoted.length})</div>
        <div style="font-size:13px;color:#0a0a0a;line-height:1.7;">${quoted.map((l) => `${l.name ?? l.email} (${l.company ?? "—"})`).join("<br/>")}</div>
      </div>` : ""}

      <div style="margin-top:28px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:600;color:${EMAIL_COLORS.accent};margin-bottom:8px;">Seneste leads</div>
      <div style="font-size:13px;line-height:1.7;color:#0a0a0a;">
        ${recentList.length === 0
          ? "<em style='color:#6b6b6b;'>Ingen leads i perioden</em>"
          : recentList
              .map(
                (l) =>
                  `<div style="padding:6px 0;border-bottom:1px solid ${EMAIL_COLORS.line};">
                    <strong>${l.name ?? "—"}</strong>
                    ${l.company ? ` · ${l.company}` : ""}
                    <span style="color:#6b6b6b;font-size:11px;margin-left:6px;">${l.source} · ${l.status}</span>
                  </div>`
              )
              .join("")}
      </div>

      <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#6b6b6b;">
        Se det fulde overblik på <a href="https://nordanriskpartners.dk/admin" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">/admin</a>.
      </p>
    `,
  });

  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: REPORT_TO,
    subject: `Månedsrapport · ${monthLabel} · ${stats.totalLeads} leads`,
    html,
  });

  return NextResponse.json({
    ok: true,
    sentTo: REPORT_TO,
    period: `${thirtyDaysAgo.toISOString()} → ${now.toISOString()}`,
    totalLeads: stats.totalLeads,
  });
}
