/**
 * Supabase data layer for lead + event tracking.
 *
 * Every API route writes through these helpers. They no-op gracefully when
 * env vars aren't set yet — so the user-facing site keeps working even before
 * the Supabase project is wired up.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let cached: SupabaseClient | null = null;

export function getDb(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isDbConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_KEY);
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
 * Upsert a lead by (email + source) — so re-submissions update existing
 * rows instead of creating duplicates. Returns the lead id.
 */
export async function upsertLead(input: UpsertLeadInput): Promise<string | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const { data: existing } = await db
      .from("leads")
      .select("id, payload, status")
      .eq("email", input.email.toLowerCase())
      .eq("source", input.source)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const merged = {
      ...(existing?.payload ?? {}),
      ...(input.payload ?? {}),
    };

    if (existing?.id) {
      const { error } = await db
        .from("leads")
        .update({
          status: input.status ?? existing.status ?? "new",
          name: input.name ?? null,
          phone: input.phone ?? null,
          company: input.company ?? null,
          cvr: input.cvr ?? null,
          audit_id: input.auditId ?? null,
          payload: merged,
        })
        .eq("id", existing.id);
      if (error) console.error("[db] update lead failed:", error);
      return existing.id;
    }

    const { data, error } = await db
      .from("leads")
      .insert({
        source: input.source,
        status: input.status ?? "new",
        name: input.name ?? null,
        email: input.email.toLowerCase(),
        phone: input.phone ?? null,
        company: input.company ?? null,
        cvr: input.cvr ?? null,
        audit_id: input.auditId ?? null,
        payload: input.payload ?? {},
      })
      .select("id")
      .single();
    if (error) {
      console.error("[db] insert lead failed:", error);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("[db] upsertLead exception:", err);
    return null;
  }
}

export async function recordEvent(
  leadId: string | null,
  type: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const db = getDb();
  if (!db) return;
  try {
    const { error } = await db
      .from("events")
      .insert({ lead_id: leadId, type, metadata });
    if (error) console.error("[db] insert event failed:", error);
  } catch (err) {
    console.error("[db] recordEvent exception:", err);
  }
}

/* -------------------- Admin queries -------------------- */

export async function listLeads(opts: {
  limit?: number;
  status?: LeadStatus | "all";
  source?: LeadSource | "all";
  since?: Date;
} = {}): Promise<Lead[]> {
  const db = getDb();
  if (!db) return [];
  let q = db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.status && opts.status !== "all") q = q.eq("status", opts.status);
  if (opts.source && opts.source !== "all") q = q.eq("source", opts.source);
  if (opts.since) q = q.gte("created_at", opts.since.toISOString());
  const { data, error } = await q;
  if (error) {
    console.error("[db] listLeads failed:", error);
    return [];
  }
  return (data ?? []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from("leads").select("*").eq("id", id).maybeSingle();
  return (data as Lead) ?? null;
}

export async function listEventsForLead(leadId: string): Promise<LeadEvent[]> {
  const db = getDb();
  if (!db) return [];
  const { data } = await db
    .from("events")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  return (data ?? []) as LeadEvent[];
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db.from("leads").update({ status, notes: notes ?? null }).eq("id", id);
  await recordEvent(id, "status_changed", { status, notes });
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
  const db = getDb();
  const empty: MonthlyStats = {
    totalLeads: 0,
    bySource: {},
    byStatus: {},
    signedCount: 0,
    completedCount: 0,
    quotedCount: 0,
    wonCount: 0,
  };
  if (!db) return empty;
  const { data: leads } = await db
    .from("leads")
    .select("source, status, audit_id")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());
  const all = (leads ?? []) as Pick<Lead, "source" | "status" | "audit_id">[];
  const bySource: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const l of all) {
    bySource[l.source] = (bySource[l.source] ?? 0) + 1;
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  }
  return {
    totalLeads: all.length,
    bySource,
    byStatus,
    signedCount: all.filter((l) => !!l.audit_id).length,
    completedCount: all.filter((l) => l.status === "completed" || l.status === "quoted" || l.status === "won").length,
    quotedCount: all.filter((l) => l.status === "quoted" || l.status === "won").length,
    wonCount: all.filter((l) => l.status === "won").length,
  };
}
