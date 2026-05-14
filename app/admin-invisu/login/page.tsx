import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-[color:var(--color-nordan-soft)] px-5 py-16">
      <div className="w-full max-w-[400px] bg-white rounded-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.10)] p-8">
        <div className="text-[0.72rem] uppercase tracking-[0.2em] font-semibold text-[color:var(--color-nordan-accent)] mb-3">
          Admin
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[1.6rem] mb-6 leading-tight">
          Login til dashboard
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
