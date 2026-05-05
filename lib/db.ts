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
