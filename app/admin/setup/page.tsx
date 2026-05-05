import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { SetupForm } from "./SetupForm";

export const metadata: Metadata = {
  title: "Admin · Database setup",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  await requireAdmin();
  return (
    <main className="min-h-screen grid place-items-center bg-[color:var(--color-nordan-soft)] px-5 py-16">
      <div className="w-full max-w-[600px] bg-white rounded-[12px] shadow-[0_30px_80px_rgba(0,0,0,0.10)] p-8">
        <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-accent)] mb-3">
          Admin · Setup
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[1.7rem] mb-3 leading-tight">
          Initialiser Neon-databasen
        </h1>
        <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-6">
          Klik nedenfor for at oprette <code>leads</code> + <code>events</code> tabellerne i Neon. Det er en engangs-handling — efter første kørsel kan du bruge dashboardet normalt.
        </p>
        <SetupForm />
      </div>
    </main>
  );
}
