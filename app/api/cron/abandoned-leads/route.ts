import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  listAbandonedSessionsToNotify,
  getAbandonableSession,
  recordSessionEvent,
  recordEvent,
  upsertLead,
  isDbConfigured,
  ABANDONED_LEAD_EVENT,
  type Session,
} from "@/lib/db";
import {
  leadEmailForSession,
  lookupCvr,
  renderAbandonedLeadEmail,
  sourceFor,
  STEP_LABELS,
} from "@/lib/abandoned-lead";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM ?? "Nordan Risk Partners <info@ndrp.dk>";
// Frafaldne leads skal lande samme sted som alle andre leads.
const TO_EMAIL = process.env.CONTACT_TO_EMAIL ?? "info@ndrp.dk";
const LEAD_CC_EMAIL = process.env.LEAD_CC_EMAIL ?? "sebastian@invisu.dk";

// De har indtastet CVR/kontaktinfo men ikke underskrevet inden for så mange minutter → lead.
const MIN_AGE_MINUTES = 20;
// Afbryd ikke en der stadig sidder i flowet.
const IDLE_MINUTES = 5;
// Normal horisont. Backfill-tilstanden strækker den for at hente efterslæbet.
const MAX_AGE_DAYS = 30;
const BACKFILL_MAX_AGE_DAYS = 365;

/**
 * Gør frafaldne flows til rigtige leads.
 *
 * Alle der indtastede CVR og/eller kontaktoplysninger, men aldrig underskrev
 * fuldmagten, bliver oprettet som lead (kilde `frafald`) og sendt til
 * info@ndrp.dk som en almindelig lead-mail — én mail pr. virksomhed, med
 * kontaktoplysninger eller CVR-opslag så Mads kan ringe. Fuldmagten mangler,
 * og det står tydeligt i mailen.
 *
 * Tre indgange, samme dedup (`abandoned_lead_created`-event pr. session):
 *
 *  - ?session=<id> — QStash-callback ~20 min efter CVR blev indtastet.
 *    Tjekker kun den ene session (primær vej, hurtig).
 *  - uden parametre — fuld scanning af alle frafaldne, ikke-sendte sessions.
 *    Kører dagligt som Vercel-cron, så intet går tabt hvis QStash fejler.
 *  - ?backfill=1 — samme scanning, men med et års horisont og uden loft,
 *    til at hente efterslæbet ind én gang.
 *
 * Auth: Vercel-cron-header ELLER ?secret=CRON_SECRET (QStash / manuelt).
 * Brug ?dry=1 til at se hvad der ville ske uden at sende eller markere noget.
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
  const backfill = url.searchParams.get("backfill") === "1";
  const sessionId = url.searchParams.get("session");

  if (!isDbConfigured() || !RESEND_API_KEY) {
    return NextResponse.json({
      ok: false,
      reason: "DB eller Resend ikke konfigureret",
    });
  }

  // Enkelt session (QStash-callback) vs. fuld scanning (dagligt cron / backfill).
  const sessions = sessionId
    ? await (async () => {
        const s = await getAbandonableSession(sessionId, { idleMinutes: IDLE_MINUTES });
        return s ? [s] : [];
      })()
    : await listAbandonedSessionsToNotify({
        minAgeMinutes: MIN_AGE_MINUTES,
        idleMinutes: IDLE_MINUTES,
        maxAgeDays: backfill ? BACKFILL_MAX_AGE_DAYS : MAX_AGE_DAYS,
        limit: backfill ? 200 : 50,
      });

  const mode = sessionId ? "single" : backfill ? "backfill" : "scan";

  // Uden CVR og uden kontaktoplysninger er der intet at følge op på.
  const actionable = sessions.filter((s) => !!leadEmailForSession(s));

  if (actionable.length === 0) {
    return NextResponse.json({ ok: true, created: 0, mode, dryRun });
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      mode,
      wouldCreate: actionable.length,
      sessions: actionable.map((s) => ({
        company: s.company,
        cvr: s.cvr,
        step: STEP_LABELS[s.furthest_step] ?? s.furthest_step,
        contact: s.contact_email ?? s.contact_phone ?? null,
        leadEmail: leadEmailForSession(s),
        source: sourceFor(s).source,
        lastSeen: s.last_seen_at,
      })),
    });
  }

  const resend = new Resend(RESEND_API_KEY);
  const created: string[] = [];
  const failed: Array<{ company: string | null; reason: string }> = [];

  // Sekventielt — cvrapi.dk har rate limits, og der er sjældent mange ad gangen.
  for (const session of actionable) {
    try {
      await processSession(session, resend);
      created.push(session.company ?? session.cvr ?? session.id);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error("[abandoned-leads] Kunne ikke behandle session", session.id, reason);
      failed.push({ company: session.company, reason });
    }
  }

  // 5xx ved delvis fejl, så QStash prøver igen. De der lykkedes er allerede
  // markeret, så et gensend rammer kun dem der fejlede.
  const status = failed.length > 0 && created.length === 0 ? 500 : 200;
  return NextResponse.json(
    { ok: failed.length === 0, mode, created: created.length, companies: created, failed },
    { status }
  );
}

/**
 * Ét frafaldent flow → ét lead + én intern mail.
 *
 * Rækkefølgen er bevidst: lead først, så mail, og først til sidst markeres
 * sessionen. Fejler noget undervejs, bliver sessionen ikke markeret og forsøgt
 * igen næste kørsel — og fordi leadet upsertes på (mail + kilde), giver et
 * gensend ikke en dublet.
 */
async function processSession(session: Session, resend: Resend): Promise<void> {
  const leadEmail = leadEmailForSession(session);
  if (!leadEmail) return;

  // Best-effort berigelse — vigtigst når vi kun har CVR og skal kunne ringe.
  const cvrInfo = await lookupCvr(session.cvr);

  const { source, medium } = sourceFor(session);
  const leadId = await upsertLead({
    source: "frafald",
    status: "new",
    name: session.contact_name,
    email: leadEmail,
    phone: session.contact_phone,
    company: session.company ?? cvrInfo?.name ?? null,
    cvr: session.cvr,
    auditId: null,
    payload: {
      hasSignedFuldmagt: false,
      fromAbandonedSession: session.id,
      furthestStep: session.furthest_step,
      lastSeenAt: session.last_seen_at,
      // Ingen rigtig mailadresse — leadets email er en CVR-pladsholder.
      contactEmailKnown: !!session.contact_email,
      cvrLookup: cvrInfo,
      attribution: {
        source,
        medium,
        landingPath: session.first_touch_path ?? session.landing_path ?? session.source_path,
        referrer: session.first_touch_referrer,
        firstTouchAt: session.first_touch_at,
      },
    },
  });
  // Kast hellere end at maile et lead vi ikke kan finde igen bagefter. Typisk
  // årsag: `frafald` mangler i lead_source-enummet — kør docs/neon-init.sql.
  if (!leadId) {
    throw new Error(
      "lead kunne ikke oprettes (mangler 'frafald' i lead_source? kør docs/neon-init.sql)"
    );
  }

  const { subject, html, text, replyTo } = renderAbandonedLeadEmail(session, cvrInfo);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    cc: LEAD_CC_EMAIL,
    // Kun svar-til når der er en rigtig adresse; ellers svar til postkassen selv.
    replyTo: replyTo ?? TO_EMAIL,
    subject,
    html,
    text,
  });
  if (error) throw error;

  await recordEvent(leadId, "abandoned_lead_mailed", {
    sessionId: session.id,
    step: session.furthest_step,
  });

  // Markér til sidst — så en fejl undervejs betyder "prøv igen", ikke "tabt".
  await recordSessionEvent(session.id, ABANDONED_LEAD_EVENT, {
    sentAt: new Date().toISOString(),
    step: session.furthest_step,
    leadId,
  });
}
