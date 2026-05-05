import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_NAME = "nrp_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 dage

export async function POST(req: Request) {
  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD ikke konfigureret på serveren." },
      { status: 500 }
    );
  }
  let body: { password?: string };
  try {
    body = (await req.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Ugyldig request" }, { status: 400 });
  }
  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forkert adgangskode" }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, ADMIN_PASSWORD, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
