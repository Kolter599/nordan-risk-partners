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

type TrackBody = {
  clientId: string;
  event: string;
  params?: Record<string, unknown>;
  path?: string;
};

const STEP_FOR_EVENT: Record<string, FunnelStep> = {
  cvr_started: "started",
  cvr_submitted: "cvr_submitted",
  cvr_lookup_skipped: "cvr_submitted",
  cvr_company_confirmed_view: "confirm",
  cvr_step_actions_view: "actions",
  cvr_contact_submitted: "actions",
  analyse_completed: "completed",
  cvr_flow_completed: "completed",
};

function pickString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
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
  });

  await recordSessionEvent(sessionId, event, params);

  return NextResponse.json({ ok: true });
}
