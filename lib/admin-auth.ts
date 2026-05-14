import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "nrp_admin";

export async function requireAdmin(): Promise<void> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    // Misconfiguration — block access entirely.
    redirect("/admin-invisu/login?error=not_configured");
  }
  const jar = await cookies();
  const cookie = jar.get(COOKIE_NAME)?.value;
  if (cookie !== expected) {
    redirect("/admin-invisu/login");
  }
}
