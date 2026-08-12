/**
 * Neon (serverless Postgres) data layer for lead + event tracking.
 *
 * Every API route writes through these helpers. They no-op gracefully when
 * DATABASE_URL isn't set yet — so the user-facing site keeps working even
 * before Neon is wired up.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type LeadSource =
  | "kontakt"
  | "hero"
  | "analyse"
  | "hole_in_one"
  | "sign"
  /** Frafaldent CVR-flow: kontaktoplysninger og/eller CVR, men ingen fuldmagt. */
  | "frafald";
export type LeadStatus =
  | "new"
  | "partial"
  | "completed"
  | "quoted"
  | "won"
  | "lost";

export type Lead = {
  id: string;
  created_at: string;
  updated_at: string;
  source: LeadSource;
  status: LeadStatus;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  cvr: string | null;
  audit_id: string | null;
  payload: Record<string, unknown>;
  notes: string | null;
};

export type LeadEvent = {
  id: string;
  lead_id: string | null;
  created_at: string;
  type: string;
  metadata: Record<string, unknown>;
};

const DATABASE_URL = process.env.DATABASE_URL;

let cached: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> | null {
  if (!DATABASE_URL) return null;
  if (cached) return cached;
  cached = neon(DATABASE_URL);
  return cached;
}

export function isDbConfigured(): boolean {
  return !!DATABASE_URL;
}

/**
 * Quick health check — does the leads table exist? Used by /admin to know
 * whether to show the setup banner instead of the dashboard.
 */
export async function isSchemaReady(): Promise<boolean> {
  const sql = getDb();
  if (!sql) return false;
  try {
    await sql`SELECT 1 FROM leads LIMIT 1`;
    return true;
  } catch {
    return false;
  }
}

/* -------------------- Lead helpers -------------------- */

/** RFC 2606-reserveret TLD — kan aldrig ramme en rigtig postkasse. */
const UNKNOWN_EMAIL_DOMAIN = "ukendt.invalid";

/**
 * `leads.email` er NOT NULL og bruges som dedup-nøgle. Har vi kun CVR (typisk
 * et frafaldent flow), laver vi en deterministisk pladsholder pr. virksomhed —
 * så to frafald fra samme CVR opdaterer det samme lead i stedet for at stable
 * rækker op. Adressen må aldrig vises eller mailes til.
 */
export function placeholderEmailForCvr(cvr: string): string {
  return `cvr-${cvr.replace(/\D/g, "")}@${UNKNOWN_EMAIL_DOMAIN}`;
}

/** True hvis mailen er vores egen pladsholder og ikke en rigtig adresse. */
export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(`@${UNKNOWN_EMAIL_DOMAIN}`);
}

type UpsertLeadInput = {
  source: LeadSource;
  status?: LeadStatus;
  name?: string | null;
  email: string;
  phone?: string | null;
  company?: string | null;
  cvr?: string | null;
  auditId?: string | null;
  payload?: Record<string, unknown>;
};

/**
 * Upsert a lead by (email + source) — re-submissions update existing rows
 * instead of creating duplicates. Returns the lead id.
 */
export async function upsertLead(input: UpsertLeadInput): Promise<string | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const emailLower = input.email.toLowerCase();
    const existing = (await sql`
      SELECT id, payload, status FROM leads
      WHERE email = ${emailLower} AND source = ${input.source}
      ORDER BY created_at DESC
      LIMIT 1
    `) as Array<{ id: string; payload: Record<string, unknown>; status: LeadStatus }>;

    const merged = {
      ...(existing[0]?.payload ?? {}),
      ...(input.payload ?? {}),
    };

    if (existing[0]?.id) {
      const updated = (await sql`
        UPDATE leads SET
          status = ${input.status ?? existing[0].status ?? "new"},
          name = ${input.name ?? null},
          phone = ${input.phone ?? null},
          company = ${input.company ?? null},
          cvr = ${input.cvr ?? null},
          audit_id = ${input.auditId ?? null},
          payload = ${JSON.stringify(merged)}::jsonb
        WHERE id = ${existing[0].id}
        RETURNING id
      `) as Array<{ id: string }>;
      return updated[0]?.id ?? null;
    }

    const inserted = (await sql`
      INSERT INTO leads (source, status, name, email, phone, company, cvr, audit_id, payload)
      VALUES (
        ${input.source},
        ${input.status ?? "new"},
        ${input.name ?? null},
        ${emailLower},
        ${input.phone ?? null},
        ${input.company ?? null},
        ${input.cvr ?? null},
        ${input.auditId ?? null},
        ${JSON.stringify(input.payload ?? {})}::jsonb
      )
      RETURNING id
    `) as Array<{ id: string }>;
    return inserted[0]?.id ?? null;
  } catch (err) {
    console.error("[db] upsertLead failed:", err);
    return null;
  }
}

/**
 * Persist the signed fuldmagt PDF URL onto a lead's payload. Non-destructive:
 * merges into existing payload with jsonb `||` so no other columns are touched.
 */
export async function attachFuldmagtUrl(
  leadId: string | null,
  url: string
): Promise<void> {
  const sql = getDb();
  if (!sql || !leadId) return;
  try {
    await sql`
      UPDATE leads
      SET payload = COALESCE(payload, '{}'::jsonb) || ${JSON.stringify({ fuldmagtUrl: url })}::jsonb
      WHERE id = ${leadId}
    `;
  } catch (err) {
    console.error("[db] attachFuldmagtUrl failed:", err);
  }
}

export async function recordEvent(
  leadId: string | null,
  type: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await sql`
      INSERT INTO events (lead_id, type, metadata)
      VALUES (${leadId}, ${type}, ${JSON.stringify(metadata)}::jsonb)
    `;
  } catch (err) {
    console.error("[db] recordEvent failed:", err);
  }
}

/* -------------------- Admin queries -------------------- */

export async function listLeads(opts: {
  limit?: number;
  status?: LeadStatus | "all";
  source?: LeadSource | "all";
  since?: Date;
} = {}): Promise<Lead[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    const limit = opts.limit ?? 200;
    // Build query incrementally — Neon's tagged template handles the
    // parameter binding for each branch.
    if (opts.status && opts.status !== "all" && opts.source && opts.source !== "all" && opts.since) {
      return (await sql`
        SELECT * FROM leads
        WHERE status = ${opts.status} AND source = ${opts.source} AND created_at >= ${opts.since.toISOString()}
        ORDER BY created_at DESC LIMIT ${limit}
      `) as Lead[];
    }
    if (opts.status && opts.status !== "all" && opts.source && opts.source !== "all") {
      return (await sql`
        SELECT * FROM leads
        WHERE status = ${opts.status} AND source = ${opts.source}
        ORDER BY created_at DESC LIMIT ${limit}
      `) as Lead[];
    }
    if (opts.status && opts.status !== "all") {
      return (await sql`
        SELECT * FROM leads WHERE status = ${opts.status}
        ORDER BY created_at DESC LIMIT ${limit}
      `) as Lead[];
    }
    if (opts.source && opts.source !== "all") {
      return (await sql`
        SELECT * FROM leads WHERE source = ${opts.source}
        ORDER BY created_at DESC LIMIT ${limit}
      `) as Lead[];
    }
    if (opts.since) {
      return (await sql`
        SELECT * FROM leads WHERE created_at >= ${opts.since.toISOString()}
        ORDER BY created_at DESC LIMIT ${limit}
      `) as Lead[];
    }
    return (await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT ${limit}`) as Lead[];
  } catch (err) {
    console.error("[db] listLeads failed:", err);
    return [];
  }
}

export async function getLead(id: string): Promise<Lead | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const rows = (await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`) as Lead[];
    return rows[0] ?? null;
  } catch (err) {
    console.error("[db] getLead failed:", err);
    return null;
  }
}

export async function listEventsForLead(leadId: string): Promise<LeadEvent[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    return (await sql`
      SELECT * FROM events WHERE lead_id = ${leadId}
      ORDER BY created_at ASC
    `) as LeadEvent[];
  } catch (err) {
    console.error("[db] listEventsForLead failed:", err);
    return [];
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await sql`
      UPDATE leads SET status = ${status}, notes = ${notes ?? null}
      WHERE id = ${id}
    `;
    await recordEvent(id, "status_changed", { status, notes });
  } catch (err) {
    console.error("[db] updateLeadStatus failed:", err);
  }
}

/* -------------------- Stats for monthly report -------------------- */

export type MonthlyStats = {
  totalLeads: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  signedCount: number;
  completedCount: number;
  quotedCount: number;
  wonCount: number;
};

/* -------------------- Funnel sessions -------------------- */

export type FunnelStep = "started" | "cvr_submitted" | "confirm" | "actions" | "completed";

export const FUNNEL_STEPS: readonly FunnelStep[] = [
  "started",
  "cvr_submitted",
  "confirm",
  "actions",
  "completed",
];

const STEP_RANK: Record<FunnelStep, number> = {
  started: 0,
  cvr_submitted: 1,
  confirm: 2,
  actions: 3,
  completed: 4,
};

export type Session = {
  id: string;
  client_id: string;
  created_at: string;
  last_seen_at: string;
  source_path: string | null;
  cvr: string | null;
  company: string | null;
  furthest_step: FunnelStep;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  user_agent: string | null;
  referrer: string | null;
  metadata: Record<string, unknown>;
  // Attribution
  landing_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  first_touch_source: string | null;
  first_touch_medium: string | null;
  first_touch_campaign: string | null;
  first_touch_referrer: string | null;
  first_touch_path: string | null;
  first_touch_at: string | null;
};

export type AttributionInput = {
  landingPath?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  firstTouchSource?: string | null;
  firstTouchMedium?: string | null;
  firstTouchCampaign?: string | null;
  firstTouchReferrer?: string | null;
  firstTouchPath?: string | null;
  firstTouchAt?: string | null;
};

type UpsertSessionInput = {
  clientId: string;
  step?: FunnelStep;
  cvr?: string | null;
  company?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  sourcePath?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
} & AttributionInput;

/**
 * Upsert a session by client_id and only advance furthest_step forward —
 * never back. Returns the session id (a UUID), not the client_id.
 */
export async function upsertSession(input: UpsertSessionInput): Promise<string | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    const existing = (await sql`
      SELECT id, furthest_step FROM sessions WHERE client_id = ${input.clientId} LIMIT 1
    `) as Array<{ id: string; furthest_step: FunnelStep }>;

    const incomingRank = input.step ? STEP_RANK[input.step] ?? 0 : 0;

    if (existing[0]) {
      const currentRank = STEP_RANK[existing[0].furthest_step] ?? 0;
      const newStep = incomingRank > currentRank && input.step
        ? input.step
        : existing[0].furthest_step;
      // Last-touch UTMs overwrite. First-touch values use COALESCE so the
      // original capture is sticky and never overwritten on later visits.
      await sql`
        UPDATE sessions SET
          furthest_step = ${newStep},
          cvr = COALESCE(${input.cvr ?? null}, cvr),
          company = COALESCE(${input.company ?? null}, company),
          contact_name = COALESCE(${input.contactName ?? null}, contact_name),
          contact_email = COALESCE(${input.contactEmail ?? null}, contact_email),
          contact_phone = COALESCE(${input.contactPhone ?? null}, contact_phone),
          source_path = COALESCE(source_path, ${input.sourcePath ?? null}),
          user_agent = COALESCE(user_agent, ${input.userAgent ?? null}),
          referrer = COALESCE(referrer, ${input.referrer ?? null}),
          landing_path = COALESCE(landing_path, ${input.landingPath ?? null}),
          utm_source = COALESCE(${input.utmSource ?? null}, utm_source),
          utm_medium = COALESCE(${input.utmMedium ?? null}, utm_medium),
          utm_campaign = COALESCE(${input.utmCampaign ?? null}, utm_campaign),
          utm_content = COALESCE(${input.utmContent ?? null}, utm_content),
          utm_term = COALESCE(${input.utmTerm ?? null}, utm_term),
          first_touch_source = COALESCE(first_touch_source, ${input.firstTouchSource ?? null}),
          first_touch_medium = COALESCE(first_touch_medium, ${input.firstTouchMedium ?? null}),
          first_touch_campaign = COALESCE(first_touch_campaign, ${input.firstTouchCampaign ?? null}),
          first_touch_referrer = COALESCE(first_touch_referrer, ${input.firstTouchReferrer ?? null}),
          first_touch_path = COALESCE(first_touch_path, ${input.firstTouchPath ?? null}),
          first_touch_at = COALESCE(first_touch_at, ${input.firstTouchAt ?? null})
        WHERE id = ${existing[0].id}
      `;
      return existing[0].id;
    }

    const inserted = (await sql`
      INSERT INTO sessions (
        client_id, furthest_step, cvr, company,
        contact_name, contact_email, contact_phone,
        source_path, user_agent, referrer, landing_path,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        first_touch_source, first_touch_medium, first_touch_campaign,
        first_touch_referrer, first_touch_path, first_touch_at
      ) VALUES (
        ${input.clientId},
        ${input.step ?? "started"},
        ${input.cvr ?? null},
        ${input.company ?? null},
        ${input.contactName ?? null},
        ${input.contactEmail ?? null},
        ${input.contactPhone ?? null},
        ${input.sourcePath ?? null},
        ${input.userAgent ?? null},
        ${input.referrer ?? null},
        ${input.landingPath ?? null},
        ${input.utmSource ?? null},
        ${input.utmMedium ?? null},
        ${input.utmCampaign ?? null},
        ${input.utmContent ?? null},
        ${input.utmTerm ?? null},
        ${input.firstTouchSource ?? null},
        ${input.firstTouchMedium ?? null},
        ${input.firstTouchCampaign ?? null},
        ${input.firstTouchReferrer ?? null},
        ${input.firstTouchPath ?? null},
        ${input.firstTouchAt ?? null}
      )
      RETURNING id
    `) as Array<{ id: string }>;
    return inserted[0]?.id ?? null;
  } catch (err) {
    console.error("[db] upsertSession failed:", err);
    return null;
  }
}

export async function recordSessionEvent(
  sessionId: string | null,
  type: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await sql`
      INSERT INTO events (session_id, type, metadata)
      VALUES (${sessionId}, ${type}, ${JSON.stringify(metadata)}::jsonb)
    `;
  } catch (err) {
    console.error("[db] recordSessionEvent failed:", err);
  }
}

export type FunnelStats = {
  total: number;
  byStep: Record<FunnelStep, number>;
  /** Furthest-step counts converted to "reached at least N" cumulative numbers. */
  reachedAtLeast: Record<FunnelStep, number>;
  bySource: Record<string, Record<FunnelStep, number>>;
};

export async function getFunnelStats(since: Date): Promise<FunnelStats> {
  const sql = getDb();
  const empty: FunnelStats = {
    total: 0,
    byStep: { started: 0, cvr_submitted: 0, confirm: 0, actions: 0, completed: 0 },
    reachedAtLeast: { started: 0, cvr_submitted: 0, confirm: 0, actions: 0, completed: 0 },
    bySource: {},
  };
  if (!sql) return empty;
  try {
    const rows = (await sql`
      SELECT furthest_step, source_path FROM sessions
      WHERE created_at >= ${since.toISOString()}
    `) as Array<{ furthest_step: FunnelStep; source_path: string | null }>;
    const stats: FunnelStats = {
      total: rows.length,
      byStep: { started: 0, cvr_submitted: 0, confirm: 0, actions: 0, completed: 0 },
      reachedAtLeast: { started: 0, cvr_submitted: 0, confirm: 0, actions: 0, completed: 0 },
      bySource: {},
    };
    for (const r of rows) {
      stats.byStep[r.furthest_step] = (stats.byStep[r.furthest_step] ?? 0) + 1;
      const path = r.source_path ?? "ukendt";
      if (!stats.bySource[path]) {
        stats.bySource[path] = { started: 0, cvr_submitted: 0, confirm: 0, actions: 0, completed: 0 };
      }
      stats.bySource[path][r.furthest_step] = (stats.bySource[path][r.furthest_step] ?? 0) + 1;
    }
    // Build cumulative ("reached at least") counts: every higher step also counts as having reached lower.
    let running = 0;
    const orderedHighFirst: FunnelStep[] = ["completed", "actions", "confirm", "cvr_submitted", "started"];
    for (const step of orderedHighFirst) {
      running += stats.byStep[step];
      stats.reachedAtLeast[step] = running;
    }
    return stats;
  } catch (err) {
    console.error("[db] getFunnelStats failed:", err);
    return empty;
  }
}

export type AttributionRow = {
  label: string;
  total: number;
  completed: number;
};

export type AttributionStats = {
  bySource: AttributionRow[];
  byMedium: AttributionRow[];
  byCampaign: AttributionRow[];
  byReferrer: AttributionRow[];
  totalWithSignal: number;
};

/**
 * Map a referrer hostname to a friendly source/medium pair. Lets us bucket
 * sessions by channel even when the user didn't add UTMs to the link.
 */
function deriveFromReferrer(referrer: string | null): { source: string; medium: string } {
  if (!referrer) return { source: "direct", medium: "direct" };
  const h = referrer.toLowerCase();
  if (h.includes("linkedin.")) return { source: "linkedin", medium: "social" };
  if (h.includes("facebook.") || h === "fb.com" || h === "m.facebook.com") return { source: "facebook", medium: "social" };
  if (h.includes("instagram.")) return { source: "instagram", medium: "social" };
  if (h === "x.com" || h === "twitter.com" || h === "t.co") return { source: "twitter", medium: "social" };
  if (h.includes("youtube.")) return { source: "youtube", medium: "social" };
  if (h.includes("tiktok.")) return { source: "tiktok", medium: "social" };
  if (h.includes("google.")) return { source: "google", medium: "organic" };
  if (h.includes("bing.")) return { source: "bing", medium: "organic" };
  if (h.includes("duckduckgo.")) return { source: "duckduckgo", medium: "organic" };
  if (h.includes("mail.google.com") || h.includes("outlook.") || h.includes("mail.")) return { source: "email", medium: "email" };
  if (h.includes("chatgpt.") || h.includes("chat.openai.com")) return { source: "chatgpt", medium: "ai" };
  if (h.includes("perplexity.")) return { source: "perplexity", medium: "ai" };
  return { source: h, medium: "referral" };
}

/**
 * Group sessions by first-touch source/medium/campaign/referrer.
 *
 * For sessions WITHOUT manual UTMs we fall back to deriving source/medium
 * from the referrer hostname (linkedin.com → linkedin/social, google.com →
 * google/organic, no referrer at all → direct/direct). That way Mads gets
 * useful breakdowns immediately without having to remember to tag every link.
 */
export async function getAttributionStats(since: Date): Promise<AttributionStats> {
  const sql = getDb();
  const empty: AttributionStats = {
    bySource: [],
    byMedium: [],
    byCampaign: [],
    byReferrer: [],
    totalWithSignal: 0,
  };
  if (!sql) return empty;
  try {
    type Row = {
      first_touch_source: string | null;
      first_touch_medium: string | null;
      first_touch_campaign: string | null;
      first_touch_referrer: string | null;
      first_touch_path: string | null;
      furthest_step: FunnelStep;
    };
    const rows = (await sql`
      SELECT first_touch_source, first_touch_medium, first_touch_campaign,
             first_touch_referrer, first_touch_path, furthest_step
      FROM sessions
      WHERE created_at >= ${since.toISOString()}
    `) as Row[];

    const sourceBucket = new Map<string, { total: number; completed: number }>();
    const mediumBucket = new Map<string, { total: number; completed: number }>();
    const campaignBucket = new Map<string, { total: number; completed: number }>();
    const referrerBucket = new Map<string, { total: number; completed: number }>();

    for (const r of rows) {
      const isCompleted = r.furthest_step === "completed";
      const derived = deriveFromReferrer(r.first_touch_referrer);
      // Source: explicit utm_source wins; otherwise derived from referrer
      const sourceLabel = r.first_touch_source ?? derived.source;
      const mediumLabel = r.first_touch_medium ?? derived.medium;

      const incr = (m: Map<string, { total: number; completed: number }>, key: string) => {
        const cur = m.get(key) ?? { total: 0, completed: 0 };
        cur.total += 1;
        if (isCompleted) cur.completed += 1;
        m.set(key, cur);
      };

      incr(sourceBucket, sourceLabel);
      incr(mediumBucket, mediumLabel);
      if (r.first_touch_campaign) incr(campaignBucket, r.first_touch_campaign);
      incr(referrerBucket, r.first_touch_referrer ?? "direct");
    }

    const toSorted = (
      m: Map<string, { total: number; completed: number }>
    ): AttributionRow[] =>
      Array.from(m.entries())
        .map(([label, v]) => ({ label, ...v }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 12);

    return {
      bySource: toSorted(sourceBucket),
      byMedium: toSorted(mediumBucket),
      byCampaign: toSorted(campaignBucket),
      byReferrer: toSorted(referrerBucket),
      totalWithSignal: rows.length,
    };
  } catch (err) {
    console.error("[db] getAttributionStats failed:", err);
    return empty;
  }
}

/* -------------------- Per-lead attribution (join leads → sessions) -------------------- */

export type LeadAttribution = {
  firstTouch: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    referrer: string | null;
    landingPath: string | null;
    at: string | null;
  } | null;
  lastTouch: {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    content: string | null;
    term: string | null;
  } | null;
  sourcePath: string | null;
  userAgent: string | null;
  serverReferer: string | null;
  clientIp: string | null;
  /** Where on this site they first interacted — typically the page that
   *  triggered the flow (e.g. "/erhvervsforsikringer/fredede-ejendomme"). */
  funnelStartPath: string | null;
  matchedSessionId: string | null;
  matchedBy: "audit" | "cvr_email" | "cvr" | "email" | "payload" | null;
  /** Friendly channel label derived from source + referrer. */
  channel: string;
  channelMedium: string;
};

const EMPTY_ATTRIBUTION: LeadAttribution = {
  firstTouch: null,
  lastTouch: null,
  sourcePath: null,
  userAgent: null,
  serverReferer: null,
  clientIp: null,
  funnelStartPath: null,
  matchedSessionId: null,
  matchedBy: null,
  channel: "direct",
  channelMedium: "direct",
};

function deriveChannel(
  firstSource: string | null,
  firstMedium: string | null,
  firstReferrer: string | null
): { channel: string; channelMedium: string } {
  if (firstSource) {
    return { channel: firstSource, channelMedium: firstMedium ?? "referral" };
  }
  const d = deriveFromReferrer(firstReferrer);
  return { channel: d.source, channelMedium: d.medium };
}

type LeadAttributionRow = {
  id: string;
  client_id: string;
  source_path: string | null;
  user_agent: string | null;
  referrer: string | null;
  landing_path: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  first_touch_source: string | null;
  first_touch_medium: string | null;
  first_touch_campaign: string | null;
  first_touch_referrer: string | null;
  first_touch_path: string | null;
  first_touch_at: string | null;
  last_seen_at: string;
};

function rowToAttribution(
  row: LeadAttributionRow,
  matchedBy: LeadAttribution["matchedBy"],
  payloadContext?: PayloadServerContext | null
): LeadAttribution {
  const channel = deriveChannel(row.first_touch_source, row.first_touch_medium, row.first_touch_referrer);
  return {
    firstTouch: {
      source: row.first_touch_source,
      medium: row.first_touch_medium,
      campaign: row.first_touch_campaign,
      referrer: row.first_touch_referrer,
      landingPath: row.first_touch_path,
      at: row.first_touch_at,
    },
    lastTouch: {
      source: row.utm_source,
      medium: row.utm_medium,
      campaign: row.utm_campaign,
      content: row.utm_content,
      term: row.utm_term,
    },
    sourcePath: row.source_path,
    userAgent: row.user_agent ?? payloadContext?.userAgent ?? null,
    serverReferer: payloadContext?.referer ?? row.referrer,
    clientIp: payloadContext?.ip ?? null,
    funnelStartPath: row.landing_path ?? row.first_touch_path,
    matchedSessionId: row.id,
    matchedBy,
    channel: channel.channel,
    channelMedium: channel.channelMedium,
  };
}

type PayloadServerContext = {
  userAgent?: string | null;
  referer?: string | null;
  ip?: string | null;
};

type PayloadAttribution = {
  first?: { source?: string | null; medium?: string | null; campaign?: string | null; content?: string | null; term?: string | null; referrer?: string | null; landingPath?: string | null; capturedAt?: string | null } | null;
  last?: { source?: string | null; medium?: string | null; campaign?: string | null; content?: string | null; term?: string | null; referrer?: string | null; landingPath?: string | null; capturedAt?: string | null } | null;
  clientId?: string | null;
};

function payloadFallback(
  payload: Record<string, unknown>
): LeadAttribution | null {
  const serverContext = (payload?.serverContext as PayloadServerContext | undefined) ?? null;
  const attribution = (payload?.attribution as PayloadAttribution | undefined) ?? null;
  if (!serverContext && !attribution) return null;
  const first = attribution?.first ?? null;
  const last = attribution?.last ?? null;
  const channel = deriveChannel(first?.source ?? null, first?.medium ?? null, first?.referrer ?? null);
  return {
    firstTouch: first
      ? {
          source: first.source ?? null,
          medium: first.medium ?? null,
          campaign: first.campaign ?? null,
          referrer: first.referrer ?? null,
          landingPath: first.landingPath ?? null,
          at: first.capturedAt ?? null,
        }
      : null,
    lastTouch: last
      ? {
          source: last.source ?? null,
          medium: last.medium ?? null,
          campaign: last.campaign ?? null,
          content: last.content ?? null,
          term: last.term ?? null,
        }
      : null,
    sourcePath: null,
    userAgent: serverContext?.userAgent ?? null,
    serverReferer: serverContext?.referer ?? null,
    clientIp: serverContext?.ip ?? null,
    funnelStartPath: first?.landingPath ?? null,
    matchedSessionId: null,
    matchedBy: "payload",
    channel: channel.channel,
    channelMedium: channel.channelMedium,
  };
}

/**
 * Find the best-matching session for a lead and build a full attribution
 * snapshot. Match order:
 *   1. payload.clientId — strongest, written when the lead row is created
 *   2. cvr + email (lower-cased)  — same person, same company
 *   3. cvr alone — same company, possibly different signer
 *   4. email alone — same person across companies
 *   5. payload-only fallback (no matching session row)
 */
export async function getLeadAttribution(lead: Lead): Promise<LeadAttribution> {
  const sql = getDb();
  if (!sql) return EMPTY_ATTRIBUTION;
  const payload = lead.payload ?? {};
  const fallback = payloadFallback(payload) ?? EMPTY_ATTRIBUTION;
  try {
    const clientId = (payload as { clientId?: unknown })?.clientId;
    const emailLower = lead.email.toLowerCase();
    const cvr = lead.cvr;

    if (typeof clientId === "string" && clientId.length > 0) {
      const rows = (await sql`
        SELECT id, client_id, source_path, user_agent, referrer, landing_path,
               utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               first_touch_source, first_touch_medium, first_touch_campaign,
               first_touch_referrer, first_touch_path, first_touch_at, last_seen_at
        FROM sessions WHERE client_id = ${clientId} LIMIT 1
      `) as LeadAttributionRow[];
      if (rows[0]) return rowToAttribution(rows[0], "audit", payloadFallback(payload));
    }

    if (cvr) {
      const rows = (await sql`
        SELECT id, client_id, source_path, user_agent, referrer, landing_path,
               utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               first_touch_source, first_touch_medium, first_touch_campaign,
               first_touch_referrer, first_touch_path, first_touch_at, last_seen_at
        FROM sessions
        WHERE cvr = ${cvr} AND LOWER(contact_email) = ${emailLower}
        ORDER BY last_seen_at DESC
        LIMIT 1
      `) as LeadAttributionRow[];
      if (rows[0]) return rowToAttribution(rows[0], "cvr_email", payloadFallback(payload));
    }

    if (cvr) {
      const rows = (await sql`
        SELECT id, client_id, source_path, user_agent, referrer, landing_path,
               utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               first_touch_source, first_touch_medium, first_touch_campaign,
               first_touch_referrer, first_touch_path, first_touch_at, last_seen_at
        FROM sessions WHERE cvr = ${cvr}
        ORDER BY last_seen_at DESC LIMIT 1
      `) as LeadAttributionRow[];
      if (rows[0]) return rowToAttribution(rows[0], "cvr", payloadFallback(payload));
    }

    const rows = (await sql`
      SELECT id, client_id, source_path, user_agent, referrer, landing_path,
             utm_source, utm_medium, utm_campaign, utm_content, utm_term,
             first_touch_source, first_touch_medium, first_touch_campaign,
             first_touch_referrer, first_touch_path, first_touch_at, last_seen_at
      FROM sessions WHERE LOWER(contact_email) = ${emailLower}
      ORDER BY last_seen_at DESC LIMIT 1
    `) as LeadAttributionRow[];
    if (rows[0]) return rowToAttribution(rows[0], "email", payloadFallback(payload));

    return fallback;
  } catch (err) {
    console.error("[db] getLeadAttribution failed:", err);
    return fallback;
  }
}

/**
 * Batch version — used by the admin list. One DB round trip per match
 * strategy, then in-memory join. Falls back to payload-only attribution
 * for leads without a matching session.
 */
export async function attachAttributionToLeads(
  leads: Lead[]
): Promise<Array<Lead & { attribution: LeadAttribution }>> {
  if (leads.length === 0) return [];
  const sql = getDb();
  if (!sql) {
    return leads.map((l) => ({
      ...l,
      attribution: payloadFallback(l.payload) ?? EMPTY_ATTRIBUTION,
    }));
  }
  try {
    const clientIds = Array.from(
      new Set(
        leads
          .map((l) => (l.payload as { clientId?: unknown })?.clientId)
          .filter((v): v is string => typeof v === "string" && v.length > 0)
      )
    );
    const cvrs = Array.from(new Set(leads.map((l) => l.cvr).filter((c): c is string => !!c)));
    const emails = Array.from(new Set(leads.map((l) => l.email.toLowerCase())));

    type SessionMatchRow = LeadAttributionRow & {
      cvr: string | null;
      contact_email: string | null;
    };

    const byClientId = new Map<string, SessionMatchRow>();
    if (clientIds.length > 0) {
      const rows = (await sql`
        SELECT id, client_id, source_path, user_agent, referrer, landing_path,
               utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               first_touch_source, first_touch_medium, first_touch_campaign,
               first_touch_referrer, first_touch_path, first_touch_at, last_seen_at,
               cvr, contact_email
        FROM sessions WHERE client_id = ANY(${clientIds})
      `) as SessionMatchRow[];
      for (const r of rows) byClientId.set(r.client_id, r);
    }

    const byCvrEmail = new Map<string, SessionMatchRow>();
    const byCvr = new Map<string, SessionMatchRow>();
    if (cvrs.length > 0) {
      const rows = (await sql`
        SELECT id, client_id, source_path, user_agent, referrer, landing_path,
               utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               first_touch_source, first_touch_medium, first_touch_campaign,
               first_touch_referrer, first_touch_path, first_touch_at, last_seen_at,
               cvr, contact_email
        FROM sessions WHERE cvr = ANY(${cvrs})
        ORDER BY last_seen_at DESC
      `) as SessionMatchRow[];
      for (const r of rows) {
        if (r.cvr) {
          if (r.contact_email) {
            const key = `${r.cvr}::${r.contact_email.toLowerCase()}`;
            if (!byCvrEmail.has(key)) byCvrEmail.set(key, r);
          }
          if (!byCvr.has(r.cvr)) byCvr.set(r.cvr, r);
        }
      }
    }

    const byEmail = new Map<string, SessionMatchRow>();
    if (emails.length > 0) {
      const rows = (await sql`
        SELECT id, client_id, source_path, user_agent, referrer, landing_path,
               utm_source, utm_medium, utm_campaign, utm_content, utm_term,
               first_touch_source, first_touch_medium, first_touch_campaign,
               first_touch_referrer, first_touch_path, first_touch_at, last_seen_at,
               cvr, contact_email
        FROM sessions WHERE LOWER(contact_email) = ANY(${emails})
        ORDER BY last_seen_at DESC
      `) as SessionMatchRow[];
      for (const r of rows) {
        if (r.contact_email) {
          const key = r.contact_email.toLowerCase();
          if (!byEmail.has(key)) byEmail.set(key, r);
        }
      }
    }

    return leads.map((lead) => {
      const fallback = payloadFallback(lead.payload);
      const clientId = (lead.payload as { clientId?: unknown })?.clientId;
      if (typeof clientId === "string" && byClientId.has(clientId)) {
        return { ...lead, attribution: rowToAttribution(byClientId.get(clientId)!, "audit", fallback) };
      }
      const emailLower = lead.email.toLowerCase();
      if (lead.cvr) {
        const key = `${lead.cvr}::${emailLower}`;
        const row = byCvrEmail.get(key);
        if (row) return { ...lead, attribution: rowToAttribution(row, "cvr_email", fallback) };
        const cvrRow = byCvr.get(lead.cvr);
        if (cvrRow) return { ...lead, attribution: rowToAttribution(cvrRow, "cvr", fallback) };
      }
      const emailRow = byEmail.get(emailLower);
      if (emailRow) return { ...lead, attribution: rowToAttribution(emailRow, "email", fallback) };
      return { ...lead, attribution: fallback ?? EMPTY_ATTRIBUTION };
    });
  } catch (err) {
    console.error("[db] attachAttributionToLeads failed:", err);
    return leads.map((l) => ({
      ...l,
      attribution: payloadFallback(l.payload) ?? EMPTY_ATTRIBUTION,
    }));
  }
}

export type SessionsByCvrGroup = {
  cvr: string;
  company: string | null;
  sessions: Session[];
  furthestStep: FunnelStep;
  totalSessions: number;
  lastSeen: string;
};

/**
 * Group recent sessions (default last 30 days) by CVR. Sessions without a CVR
 * are filtered out — they didn't get past step 1 so there's nothing to bind.
 */
export async function listSessionsByCvr(since: Date, limit = 100): Promise<SessionsByCvrGroup[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    const rows = (await sql`
      SELECT * FROM sessions
      WHERE created_at >= ${since.toISOString()} AND cvr IS NOT NULL
      ORDER BY last_seen_at DESC
      LIMIT ${limit * 5}
    `) as Session[];
    const grouped = new Map<string, SessionsByCvrGroup>();
    for (const s of rows) {
      if (!s.cvr) continue;
      const existing = grouped.get(s.cvr);
      if (existing) {
        existing.sessions.push(s);
        existing.totalSessions += 1;
        if ((STEP_RANK[s.furthest_step] ?? 0) > (STEP_RANK[existing.furthestStep] ?? 0)) {
          existing.furthestStep = s.furthest_step;
        }
        if (new Date(s.last_seen_at) > new Date(existing.lastSeen)) {
          existing.lastSeen = s.last_seen_at;
        }
        if (!existing.company && s.company) existing.company = s.company;
      } else {
        grouped.set(s.cvr, {
          cvr: s.cvr,
          company: s.company,
          sessions: [s],
          furthestStep: s.furthest_step,
          totalSessions: 1,
          lastSeen: s.last_seen_at,
        });
      }
    }
    return Array.from(grouped.values())
      .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
      .slice(0, limit);
  } catch (err) {
    console.error("[db] listSessionsByCvr failed:", err);
    return [];
  }
}

/* -------------------- Unified activity (sessions + leads per company) -------------------- */

export type UnifiedActivityGroup = {
  /** Stable group identifier — CVR if we have one, otherwise "email:<lowercased>". */
  groupKey: string;
  cvr: string | null;
  company: string | null;
  /** Sessions tied to this group (sorted by last_seen_at desc). */
  sessions: Session[];
  totalSessions: number;
  furthestStep: FunnelStep | null;
  /** Leads tied to this group (sorted by created_at desc). */
  leads: Array<Lead & { attribution: LeadAttribution }>;
  /** Most recent activity timestamp across sessions + leads. */
  lastActivity: string;
  /** Best attribution snapshot — pulled from the most-recent session, or
   *  falls back to the most-recent lead's payload attribution. */
  attribution: LeadAttribution;
  /** Distinct contacts (name/email/phone) seen across sessions + leads. */
  contacts: Array<{ name: string | null; email: string | null; phone: string | null }>;
};

const STEP_LABEL_FALLBACK: Record<FunnelStep, FunnelStep> = {
  started: "started",
  cvr_submitted: "cvr_submitted",
  confirm: "confirm",
  actions: "actions",
  completed: "completed",
};
void STEP_LABEL_FALLBACK;

/**
 * One unified view of "everything that happened around a company" in the
 * given time window. Combines per-CVR session groups with leads and
 * attribution into a single list ordered by most-recent activity. Leads
 * without a CVR end up in their own group keyed by email so kontakt /
 * hole-in-one submissions are still surfaced.
 */
export async function listUnifiedActivity(
  since: Date,
  limit = 100
): Promise<UnifiedActivityGroup[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    const sessionsRaw = (await sql`
      SELECT * FROM sessions
      WHERE created_at >= ${since.toISOString()}
      ORDER BY last_seen_at DESC
      LIMIT ${limit * 8}
    `) as unknown as Session[];
    const leadsRaw = (await sql`
      SELECT * FROM leads
      WHERE created_at >= ${since.toISOString()}
      ORDER BY created_at DESC
      LIMIT ${limit * 4}
    `) as unknown as Lead[];

    const sessions = sessionsRaw;
    const leads = await attachAttributionToLeads(leadsRaw);

    const groups = new Map<string, UnifiedActivityGroup>();

    const keyFor = (cvr: string | null, email: string | null) => {
      if (cvr) return `cvr:${cvr}`;
      if (email) return `email:${email.toLowerCase()}`;
      return null;
    };

    const upsertGroup = (
      key: string,
      cvr: string | null,
      company: string | null,
      activityAt: string
    ): UnifiedActivityGroup => {
      const existing = groups.get(key);
      if (existing) {
        if (!existing.cvr && cvr) existing.cvr = cvr;
        if (!existing.company && company) existing.company = company;
        if (new Date(activityAt) > new Date(existing.lastActivity)) {
          existing.lastActivity = activityAt;
        }
        return existing;
      }
      const fresh: UnifiedActivityGroup = {
        groupKey: key,
        cvr,
        company,
        sessions: [],
        totalSessions: 0,
        furthestStep: null,
        leads: [],
        lastActivity: activityAt,
        attribution: EMPTY_ATTRIBUTION,
        contacts: [],
      };
      groups.set(key, fresh);
      return fresh;
    };

    // Pass 1: sessions group by CVR (preferred) or contact_email.
    for (const s of sessions) {
      const key = keyFor(s.cvr, s.contact_email);
      if (!key) continue;
      const g = upsertGroup(key, s.cvr, s.company, s.last_seen_at);
      g.sessions.push(s);
      g.totalSessions += 1;
      if (!g.furthestStep || (STEP_RANK[s.furthest_step] ?? 0) > (STEP_RANK[g.furthestStep] ?? 0)) {
        g.furthestStep = s.furthest_step;
      }
    }

    // Pass 2: leads — match preferentially by CVR, else by email.
    for (const lead of leads) {
      const cvrKey = lead.cvr ? `cvr:${lead.cvr}` : null;
      const emailKey = `email:${lead.email.toLowerCase()}`;
      const key = (cvrKey && groups.has(cvrKey) ? cvrKey : null)
        ?? (groups.has(emailKey) ? emailKey : null)
        ?? cvrKey
        ?? emailKey;
      const g = upsertGroup(key, lead.cvr ?? null, lead.company ?? null, lead.created_at);
      g.leads.push(lead);
    }

    // Pass 3: pick best attribution + de-dupe contacts.
    for (const g of groups.values()) {
      g.sessions.sort(
        (a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
      );
      g.leads.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const seenContact = new Set<string>();
      const pushContact = (
        name: string | null,
        email: string | null,
        phone: string | null
      ) => {
        const fp = `${(name ?? "").toLowerCase()}|${(email ?? "").toLowerCase()}|${(phone ?? "").replace(/\D/g, "")}`;
        if (fp === "||" || seenContact.has(fp)) return;
        seenContact.add(fp);
        g.contacts.push({ name, email, phone });
      };
      for (const lead of g.leads) {
        // Pladsholdermails er ikke kontaktoplysninger — vis dem aldrig som sådan.
        pushContact(lead.name, isPlaceholderEmail(lead.email) ? null : lead.email, lead.phone);
      }
      for (const s of g.sessions) {
        pushContact(s.contact_name, s.contact_email, s.contact_phone);
      }

      // Attribution priority: most-recent session row wins; otherwise the
      // top lead's attribution (which itself may be payload-only).
      const topSession = g.sessions[0];
      if (topSession) {
        const channel = deriveChannel(
          topSession.first_touch_source,
          topSession.first_touch_medium,
          topSession.first_touch_referrer
        );
        g.attribution = {
          firstTouch: {
            source: topSession.first_touch_source,
            medium: topSession.first_touch_medium,
            campaign: topSession.first_touch_campaign,
            referrer: topSession.first_touch_referrer,
            landingPath: topSession.first_touch_path,
            at: topSession.first_touch_at,
          },
          lastTouch: {
            source: topSession.utm_source,
            medium: topSession.utm_medium,
            campaign: topSession.utm_campaign,
            content: topSession.utm_content,
            term: topSession.utm_term,
          },
          sourcePath: topSession.source_path,
          userAgent: topSession.user_agent,
          serverReferer: topSession.referrer,
          clientIp: null,
          funnelStartPath: topSession.landing_path ?? topSession.first_touch_path,
          matchedSessionId: topSession.id,
          matchedBy: "cvr_email",
          channel: channel.channel,
          channelMedium: channel.channelMedium,
        };
      } else if (g.leads[0]) {
        g.attribution = g.leads[0].attribution;
      }
    }

    return Array.from(groups.values())
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, limit);
  } catch (err) {
    console.error("[db] listUnifiedActivity failed:", err);
    return [];
  }
}

/** Markerer at et frafaldent flow er blevet omdannet til et lead + mailet ud. */
export const ABANDONED_LEAD_EVENT = "abandoned_lead_created";

/**
 * Find sessions der aldrig gennemførte flowet, men hvor vi har nok til at
 * følge op — og som ikke allerede er sendt videre som lead.
 *
 * Udvælgelse:
 *  - cvr ELLER kontaktoplysninger — enten kan vi ringe til virksomheden, eller
 *    vi har personens mail/telefon. Uden noget af delene er der intet lead.
 *  - furthest_step <> 'completed' — de underskrev aldrig
 *  - created_at ældre end `minAgeMinutes` — giv dem chancen for at blive færdige
 *  - last_seen_at inaktiv i mindst `idleMinutes` — afbryd ikke en igangværende bruger
 *  - oprettet inden for `maxAgeDays` — genopliv ikke urgamle sessions
 *    (skru op for maxAgeDays for at hente et efterslæb ind)
 *  - ingen tidligere `abandoned_lead_created`-event — ét lead pr. session, nogensinde
 *
 * "Allerede sendt"-tjekket slår op i events-tabellen, så markeringen bare er
 * en tilføjet række — ingen schema-migration nødvendig.
 */
export async function listAbandonedSessionsToNotify(opts: {
  minAgeMinutes?: number;
  idleMinutes?: number;
  maxAgeDays?: number;
  limit?: number;
} = {}): Promise<Session[]> {
  const sql = getDb();
  if (!sql) return [];
  const minAge = opts.minAgeMinutes ?? 20;
  const idle = opts.idleMinutes ?? 5;
  const maxAgeDays = opts.maxAgeDays ?? 30;
  const limit = opts.limit ?? 50;
  try {
    return (await sql`
      SELECT s.* FROM sessions s
      WHERE (s.cvr IS NOT NULL OR s.contact_email IS NOT NULL OR s.contact_phone IS NOT NULL)
        AND s.furthest_step <> 'completed'
        AND s.created_at <= NOW() - (${minAge} * INTERVAL '1 minute')
        AND s.last_seen_at <= NOW() - (${idle} * INTERVAL '1 minute')
        AND s.created_at >= NOW() - (${maxAgeDays} * INTERVAL '1 day')
        AND NOT EXISTS (
          SELECT 1 FROM events e
          WHERE e.session_id = s.id AND e.type = ${ABANDONED_LEAD_EVENT}
        )
      ORDER BY s.last_seen_at DESC
      LIMIT ${limit}
    `) as Session[];
  } catch (err) {
    console.error("[db] listAbandonedSessionsToNotify failed:", err);
    return [];
  }
}

/**
 * Enkelt-session-varianten af frafaldstjekket — et manuelt værktøj til at sende
 * ét bestemt frafald videre uden at røre resten (via ?session=<id>).
 * Returnerer kun sessionen hvis den stadig kvalificerer (CVR eller kontaktinfo,
 * ikke gennemført, inaktiv og ikke allerede sendt videre); ellers null
 * (gennemført / allerede sendt / stadig aktiv → no-op).
 */
export async function getAbandonableSession(
  id: string,
  opts: { idleMinutes?: number } = {}
): Promise<Session | null> {
  const sql = getDb();
  if (!sql) return null;
  const idle = opts.idleMinutes ?? 5;
  try {
    const rows = (await sql`
      SELECT s.* FROM sessions s
      WHERE s.id = ${id}
        AND (s.cvr IS NOT NULL OR s.contact_email IS NOT NULL OR s.contact_phone IS NOT NULL)
        AND s.furthest_step <> 'completed'
        AND s.last_seen_at <= NOW() - (${idle} * INTERVAL '1 minute')
        AND NOT EXISTS (
          SELECT 1 FROM events e
          WHERE e.session_id = s.id AND e.type = ${ABANDONED_LEAD_EVENT}
        )
      LIMIT 1
    `) as Session[];
    return rows[0] ?? null;
  } catch (err) {
    console.error("[db] getAbandonableSession failed:", err);
    return null;
  }
}

export async function listRecentSessions(since: Date, limit = 50): Promise<Session[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    return (await sql`
      SELECT * FROM sessions
      WHERE created_at >= ${since.toISOString()}
      ORDER BY last_seen_at DESC
      LIMIT ${limit}
    `) as Session[];
  } catch (err) {
    console.error("[db] listRecentSessions failed:", err);
    return [];
  }
}

export async function getStatsBetween(
  from: Date,
  to: Date
): Promise<MonthlyStats> {
  const sql = getDb();
  const empty: MonthlyStats = {
    totalLeads: 0,
    bySource: {},
    byStatus: {},
    signedCount: 0,
    completedCount: 0,
    quotedCount: 0,
    wonCount: 0,
  };
  if (!sql) return empty;
  try {
    const rows = (await sql`
      SELECT source, status, audit_id FROM leads
      WHERE created_at >= ${from.toISOString()} AND created_at <= ${to.toISOString()}
    `) as Array<Pick<Lead, "source" | "status" | "audit_id">>;
    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const l of rows) {
      bySource[l.source] = (bySource[l.source] ?? 0) + 1;
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    }
    return {
      totalLeads: rows.length,
      bySource,
      byStatus,
      signedCount: rows.filter((l) => !!l.audit_id).length,
      completedCount: rows.filter(
        (l) => l.status === "completed" || l.status === "quoted" || l.status === "won"
      ).length,
      quotedCount: rows.filter((l) => l.status === "quoted" || l.status === "won").length,
      wonCount: rows.filter((l) => l.status === "won").length,
    };
  } catch (err) {
    console.error("[db] getStatsBetween failed:", err);
    return empty;
  }
}
