/**
 * Neon (serverless Postgres) data layer for lead + event tracking.
 *
 * Every API route writes through these helpers. They no-op gracefully when
 * DATABASE_URL isn't set yet — so the user-facing site keeps working even
 * before Neon is wired up.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export type LeadSource = "kontakt" | "hero" | "analyse" | "hole_in_one" | "sign";
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
