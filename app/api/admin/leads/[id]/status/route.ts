import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateLeadStatus, type LeadStatus } from "@/lib/db";

const COOKIE_NAME = "nrp_admin";

async function isAuthed(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value === expected;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: { status?: string; notes?: string };
  try {
    body = (await req.json()) as { status?: string; notes?: string };
  } catch {
    return NextResponse.json({ error: "Ugyldig request" }, { status: 400 });
  }
  const validStatuses: LeadStatus[] = ["new", "partial", "completed", "quoted", "won", "lost"];
  if (!body.status || !validStatuses.includes(body.status as LeadStatus)) {
    return NextResponse.json({ error: "Ugyldig status" }, { status: 400 });
  }
  await updateLeadStatus(id, body.status as LeadStatus, body.notes);
  return NextResponse.json({ ok: true });
}
