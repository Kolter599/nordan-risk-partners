import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  listAbandonedSessionsToNotify,
  getAbandonableSession,
  recordSessionEvent,
  isDbConfigured,
  type Session,
  type FunnelStep,
} from "@/lib/db";
import { renderBrandedEmail, EMAIL_COLORS } from "@/lib/email-template";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";

// Both see the mail + replies so the thread stays shared (mirrors monthly-report).
const RECIPIENTS = ["sebastian@invisu.dk", "mh@ndrp.dk"];

// They entered a CVR but haven't signed within this many minutes → notify.
const MIN_AGE_MINUTES = 20;
// Don't ping someone who is still actively in the flow.
const IDLE_MINUTES = 5;

/**
 * Map referrer hostname → friendly source/medium pair. Mirrors lib/db.ts and
 * monthly-report so the mail shows the same channel labels as /admin.
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

const STEP_LABELS: Record<FunnelStep, string> = {
  started: "Startede flowet",
  cvr_submitted: "CVR indtastet",
  confirm: "Bekræftede firma",
  actions: "Nået til underskrift",
  completed: "Gennemført",
};

function escape(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function whenLabel(iso: string): string {
  return new Date(iso).toLocaleString("da-DK", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Copenhagen",
  });
}

function sourceFor(s: Session): { source: string; medium: string } {
  const derived = deriveFromReferrer(s.first_touch_referrer);
  return {
    source: s.first_touch_source ?? derived.source,
    medium: s.first_touch_medium ?? derived.medium,
  };
}

function sessionCardHtml(s: Session): string {
  const { source, medium } = sourceFor(s);
  const step = STEP_LABELS[s.furthest_step] ?? s.furthest_step;
  const landing = s.first_touch_path ?? s.landing_path ?? s.source_path;
  const hasContact = !!(s.contact_email || s.contact_phone);

  const contactHtml = hasContact
    ? `${s.contact_name ? `<strong>${escape(s.contact_name)}</strong><br/>` : ""}
       ${s.contact_email ? `<a href="mailto:${escape(s.contact_email)}" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">${escape(s.contact_email)}</a><br/>` : ""}
       ${s.contact_phone ? `<a href="tel:${escape(s.contact_phone.replace(/\s/g, ""))}" style="color:${EMAIL_COLORS.accent};text-decoration:none;">${escape(s.contact_phone)}</a>` : ""}`
    : `<span style="color:${EMAIL_COLORS.inkSoft};font-style:italic;">Ingen kontaktoplysninger oplyst endnu — kun CVR.</span>`;

  return `<div style="padding:16px 18px;margin-bottom:14px;background:${EMAIL_COLORS.soft};border-left:3px solid #a16207;border-radius:6px;">
    <div style="font-size:15px;font-weight:700;color:${EMAIL_COLORS.ink};">
      ${escape(s.company ?? "Ukendt virksomhed")}
      ${s.cvr ? `<span style="font-size:12px;font-weight:500;color:${EMAIL_COLORS.inkSoft};"> · CVR ${escape(s.cvr)}</span>` : ""}
    </div>
    <div style="margin-top:4px;">
      <span style="display:inline-block;padding:2px 9px;border-radius:10px;background:#a1620715;color:#a16207;font-weight:600;font-size:11px;">${escape(step)}</span>
      <span style="font-size:11px;color:${EMAIL_COLORS.inkSoft};margin-left:6px;">sidst aktiv ${escape(whenLabel(s.last_seen_at))}</span>
    </div>

    <div style="margin-top:12px;font-size:13px;line-height:1.6;color:${EMAIL_COLORS.ink};">
      ${contactHtml}
    </div>

    <div style="margin-top:12px;font-size:12px;color:${EMAIL_COLORS.inkSoft};line-height:1.6;">
      Kom fra <strong style="color:${EMAIL_COLORS.ink};">${escape(source)}</strong> · ${escape(medium)}
      ${landing ? `<br/>Landede på <span style="color:${EMAIL_COLORS.ink};">${escape(landing)}</span>` : ""}
    </div>
  </div>`;
}

/**
 * Notifies Mads about visitors who entered a CVR but never finished signing
 * the fuldmagt. Two entry modes, same dedup:
 *
 *  - ?session=<id> — QStash callback ~20 min after a single CVR was entered.
 *    Checks just that session (primary, event-driven, timely).
 *  - no session param — full scan of all abandoned, un-notified sessions.
 *    Runs once daily as a Vercel cron backstop so nothing is ever lost if a
 *    QStash schedule failed to publish.
 *
 * Auth: Vercel cron header OR ?secret=CRON_SECRET (QStash callback / manual).
 * Pass ?dry=1 to preview matches without sending or marking them notified.
 */
export async function GET(req: Request) {
  const isCron = req.headers.get("x-vercel-cron") === "1";
  const url = new URL(req.url);
  const secretMatches =
    process.env.CRON_SECRET && url.searchParams.get("secret") === process.env.CRON_SECRET;
  if (!isCron && !secretMatches) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = url.searchParams.get("dry") === "1";
  const sessionId = url.searchParams.get("session");

  if (!isDbConfigured() || !RESEND_API_KEY) {
    return NextResponse.json({
      ok: false,
      reason: "DB eller Resend ikke konfigureret",
    });
  }

  // Single-session (QStash callback) vs full scan (daily cron backstop).
  const sessions = sessionId
    ? await (async () => {
        const s = await getAbandonableSession(sessionId, { idleMinutes: IDLE_MINUTES });
        return s ? [s] : [];
      })()
    : await listAbandonedSessionsToNotify({
        minAgeMinutes: MIN_AGE_MINUTES,
        idleMinutes: IDLE_MINUTES,
      });

  if (sessions.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, mode: sessionId ? "single" : "scan", dryRun });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      mode: sessionId ? "single" : "scan",
      wouldNotify: sessions.length,
      sessions: sessions.map((s) => ({
        company: s.company,
        cvr: s.cvr,
        step: s.furthest_step,
        contact: s.contact_email ?? s.contact_phone ?? null,
        source: sourceFor(s).source,
        lastSeen: s.last_seen_at,
      })),
    });
  }

  const count = sessions.length;
  const titleNoun = count === 1 ? "virksomhed" : "virksomheder";
  const html = renderBrandedEmail({
    preheader: `${count} ${titleNoun} indtastede CVR men gennemførte ikke — måske værd at ringe.`,
    eyebrow: "Frafald i CVR-flowet",
    title: `${count} ${titleNoun} faldt fra`,
    bodyHtml: `
      <p style="margin:0 0 18px;font-size:15.5px;line-height:1.65;color:${EMAIL_COLORS.ink};">
        Følgende indtastede deres CVR på <strong>nordanriskpartners.dk</strong> men har ikke
        underskrevet fuldmagten inden for ${MIN_AGE_MINUTES} minutter. Her er alt vi ved om dem,
        og hvor langt de nåede — måske værd at følge op.
      </p>
      ${sessions.map(sessionCardHtml).join("")}
      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_COLORS.inkSoft};">
        Se det fulde overblik på <a href="https://nordanriskpartners.dk/admin" style="color:${EMAIL_COLORS.accent};text-decoration:none;font-weight:600;">nordanriskpartners.dk/admin</a>.
        Hver virksomhed her får du kun besked om én gang.
      </p>
    `,
  });

  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: RECIPIENTS,
      replyTo: RECIPIENTS,
      subject: `${count} ${titleNoun} faldt fra i CVR-flowet · nordanriskpartners.dk`,
      html,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[abandoned-leads] Resend send failed:", err);
    // Don't mark as notified, and return 5xx so QStash retries this delivery.
    // Dedup (abandon_notified event) keeps a later success from double-sending.
    return NextResponse.json(
      { ok: false, mailFailed: true, attempted: count },
      { status: 500 }
    );
  }

  // Mark each session so it never gets re-reported. Only runs after a
  // successful send, so a send failure is safely retried next cycle.
  const sentAt = new Date().toISOString();
  await Promise.all(
    sessions.map((s) =>
      recordSessionEvent(s.id, "abandon_notified", { sentAt, step: s.furthest_step })
    )
  );

  return NextResponse.json({ ok: true, notified: count, sentTo: RECIPIENTS });
}
