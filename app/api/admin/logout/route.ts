import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const jar = await cookies();
  jar.delete("nrp_admin");
  return NextResponse.redirect(new URL("/admin-invisu/login", process.env.NEXT_PUBLIC_SITE_URL ?? "https://nordanriskpartners.dk"));
}
