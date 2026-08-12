import { NextResponse } from "next/server";
import {
  upsertSession,
  recordSessionEvent,
  type FunnelStep,
} from "@/lib/db";

/**
 * Public, fire-and-forget tracking endpoint. Receives every event the client
 * fires through track(), upserts the matching session, and writes an event row.
 *
 * Strict rules:
 *  - Never blocks user flow. Always returns 200 even on failure.
 *  - No PII in URL params — all data must come via JSON body.
 *  - Treats DB outages as silent: the user's actual flow keeps working.
 */

type AttributionPayload = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  referrer: string | null;
  landingPath: string | null;
  capturedAt: string;
};

type TrackBody = {
  clientId: string;
  event: string;
  params?: Record<string, unknown>;
  path?: string;
  attribution?: {
    first: AttributionPayload | null;
    last: AttributionPayload | null;
  };
};

const STEP_FOR_EVENT: Record<string, FunnelStep> = {
  cvr_started: "started",
  cvr_submitted: "cvr_submitted",
  cvr_lookup_skipped: "cvr_submitted",
  cvr_company_confirmed_view: "confirm",
  // New flow: only one third step — opening the sign card.
  cvr_step_sign_view: "actions",
  sign_flow_view: "actions",
  // Kept for back-compat with any cached client builds firing the old name.
  cvr_step_actions_view: "actions",
  cvr_step_contact_view: "actions",
  cvr_contact_draft: "actions",
  cvr_contact_submitted: "actions",
  // Completed = signed fuldmagt; the lead is created server-side at this point.
  sign_completed: "completed",
  analyse_completed: "completed",
  cvr_flow_completed: "completed",
};

function pickString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "https://nordanriskpartners.dk";
// Grace period before an unfinished CVR flow is reported to Mads.
const ABANDON_DELAY = "20m";

/**
 * Schedule a one-shot abandon check via QStash, ~20 min out. QStash calls our
 * cron endpoint for this single session; if it's still unfinished by then,
 * Mads gets the lead. Fire-and-forget: tracking must never fail because of it,
 * and the daily Vercel cron is the backstop if this publish is lost.
 */
async function scheduleAbandonCheck(sessionId: string): Promise<void> {
  if (!QSTASH_TOKEN || !CRON_SECRET) return;
  const destination = `${SITE_ORIGIN}/api/cron/abandoned-leads?secret=${encodeURIComponent(
    CRON_SECRET
  )}&session=${encodeURIComponent(sessionId)}`;
  try {
    await fetch(`https://qstash.upstash.io/v2/publish/${destination}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${QSTASH_TOKEN}`,
        "Upstash-Delay": ABANDON_DELAY,
        // Collapse duplicate cvr_submitted events for the same session into a
        // single scheduled message within the dedup window.
        "Upstash-Deduplication-Id": `abandon-${sessionId}`,
      },
    });
  } catch (err) {
    console.warn("[track] QStash schedule failed (backstop cron will cover it):", err);
  }
}

export async function POST(req: Request) {
  let body: TrackBody;
  try {
    body = (await req.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 200 });
  }

  const clientId = pickString(body.clientId);
  const event = pickString(body.event);
  if (!clientId || !event) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 200 });
  }

  const params = (body.params ?? {}) as Record<string, unknown>;
  const stepFromEvent = STEP_FOR_EVENT[event];
  const userAgent = req.headers.get("user-agent");
  const referrer = req.headers.get("referer");

  // CVR can arrive as either company.vat or as a `cvr` param.
  const cvr = pickString(params.cvr) ?? pickString((params.company as { vat?: unknown })?.vat);
  const companyName =
    pickString(params.company as unknown) ??
    pickString((params.company as { name?: unknown })?.name);
  const contactEmail = pickString(params.email);
  const contactName = pickString(params.name);
  const contactPhone = pickString(params.phone);

  const last = body.attribution?.last ?? null;
  const first = body.attribution?.first ?? null;

  const sessionId = await upsertSession({
    clientId,
    step: stepFromEvent,
    cvr,
    company: companyName,
    contactEmail,
    contactName,
    contactPhone,
    sourcePath: pickString(body.path),
    userAgent,
    referrer,
    // Last-touch
    landingPath: pickString(last?.landingPath) ?? pickString(first?.landingPath),
    utmSource: pickString(last?.source),
    utmMedium: pickString(last?.medium),
    utmCampaign: pickString(last?.campaign),
    utmContent: pickString(last?.content),
    utmTerm: pickString(last?.term),
    // First-touch (sticky — only set once)
    firstTouchSource: pickString(first?.source),
    firstTouchMedium: pickString(first?.medium),
    firstTouchCampaign: pickString(first?.campaign),
    firstTouchReferrer: pickString(first?.referrer),
    firstTouchPath: pickString(first?.landingPath),
    firstTouchAt: pickString(first?.capturedAt),
  });

  await recordSessionEvent(sessionId, event, params);

  // Arm the 20-minute abandon check as soon as there's something to follow up
  // on: a CVR (we can call the company) or contact details (we can call them).
  const armsAbandonCheck =
    (cvr && stepFromEvent === "cvr_submitted") ||
    ((contactEmail || contactPhone) && event === "cvr_contact_submitted");
  if (sessionId && armsAbandonCheck) {
    await scheduleAbandonCheck(sessionId);
  }

  return NextResponse.json({ ok: true });
}
