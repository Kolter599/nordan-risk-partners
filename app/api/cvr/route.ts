import { NextResponse } from "next/server";

/**
 * Server-side proxy for cvrapi.dk lookups.
 *
 * Client browsers calling cvrapi.dk directly often hit per-IP rate limits
 * (QUOTA_EXCEEDED). cvrapi grants higher limits to identified callers via
 * a recognizable User-Agent header — that's what we send from here.
 *
 * cvrapi.dk only allows European IPs — Vercel's default region (iad1, US East)
 * gets connection-reset by them. Forcing fra1 (Frankfurt) puts us on an EU IP.
 *
 * Client uses: GET /api/cvr?cvr=12345678
 * Returns: { ok: true, company: {...} } or { ok: false, error: "not_found" | "quota" | "network" }
 */

// Edge runtime + EU regions — cvrapi.dk blocks Vercel's default US iad1 IPs.
export const runtime = "edge";
export const preferredRegion = ["fra1", "arn1", "cdg1"]; // Frankfurt, Stockholm, Paris

const UA = "Nordan Risk Partners — info@ndrp.dk";

type CvrApiResponse = {
  vat?: number | string;
  name?: string;
  address?: string;
  zipcode?: string;
  city?: string;
  industrydesc?: string;
  employees?: string;
  error?: string;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("cvr") ?? "";
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length !== 8) {
    return NextResponse.json({ ok: false, error: "invalid_cvr" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://cvrapi.dk/api?country=dk&search=${digits}`, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
      },
      // Don't cache — CVR data changes (employees, address) and the call
      // is cheap enough server-side.
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "network", status: res.status },
        { status: 502 }
      );
    }
    const data = (await res.json()) as CvrApiResponse;
    if (data.error) {
      const code = String(data.error).toLowerCase();
      if (code.includes("quota") || code.includes("limit")) {
        return NextResponse.json({ ok: false, error: "quota" }, { status: 429 });
      }
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      company: {
        name: data.name ?? "Virksomhed",
        vat: String(data.vat ?? digits),
        address: [data.address, data.zipcode, data.city].filter(Boolean).join(", ") || null,
        industry: data.industrydesc ?? null,
        employees: data.employees ?? null,
      },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[/api/cvr] fetch failed:", reason, err);
    return NextResponse.json(
      { ok: false, error: "network", reason },
      { status: 502 }
    );
  }
}
