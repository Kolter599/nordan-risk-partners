import Image from "next/image";
import Link from "next/link";
import { CvrLookup } from "../_components/CvrLookup";

type SearchParams = Promise<{ cvr?: string | string[] }>;

export default async function StartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.cvr) ? sp.cvr[0] : sp.cvr;
  const initialCvr = (raw ?? "").replace(/\D/g, "").slice(0, 8);
  const hasInitial = initialCvr.length === 8;

  return (
    <div className="h-full w-full flex flex-col">
      {/* Minimal app header — just brand mark + close link back to nordanriskpartners.dk */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[color:var(--color-nordan-line)] bg-white shrink-0">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image
            src="/images/logo-icon-white.png"
            alt="Nordan Risk Partners"
            width={32}
            height={32}
            className="hidden"
            priority
          />
          <Image
            src="/images/logo-icon.png"
            alt="Nordan Risk Partners"
            width={140}
            height={32}
            className="h-7 sm:h-8 w-auto"
            priority
          />
        </Link>
        <Link
          href="/"
          className="text-[0.78rem] sm:text-[0.85rem] font-medium text-[color:var(--color-nordan-muted)] hover:text-[color:var(--color-nordan-ink)] inline-flex items-center gap-1.5"
        >
          <span aria-hidden>×</span>
          Luk
        </Link>
      </header>

      {/* Card area — centered, body never scrolls */}
      <main className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-6 md:p-8">
        <CvrLookup initialCvr={hasInitial ? initialCvr : undefined} />
      </main>
    </div>
  );
}
