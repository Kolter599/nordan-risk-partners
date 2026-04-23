"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StickyMobileCta() {
  const pathname = usePathname();
  if (pathname === "/kontakt-os") return null;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[color:var(--color-nordan-dark)] border-t border-white/10 px-3 py-3 grid grid-cols-2 gap-2 shadow-[0_-8px_24px_rgba(0,0,0,0.18)]">
      <a
        href="tel:+4553520006"
        className="flex items-center justify-center gap-2 h-12 rounded-sm border border-white/40 text-white text-xs font-semibold tracking-[0.12em] uppercase"
      >
        Ring nu
      </a>
      <Link
        href="/kontakt-os"
        className="flex items-center justify-center h-12 rounded-sm bg-[color:var(--color-nordan-accent)] text-white text-xs font-semibold tracking-[0.12em] uppercase"
      >
        Få tjek gratis
      </Link>
    </div>
  );
}
