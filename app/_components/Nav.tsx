"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/om-os", label: "Om os" },
  { href: "/hvorfor-forsikringsmaegler", label: "Hvorfor forsikringsmægler?" },
  { href: "/saadan-arbejder-vi", label: "Sådan arbejder vi" },
  { href: "/erhvervsforsikringer", label: "Erhvervsforsikring" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Pages without a dark hero behind the nav — keep the bar solid even at the top
  // so light/white page backgrounds don't render the nav invisible.
  const FORCE_SOLID_PAGES = ["/om-os", "/hvorfor-forsikringsmaegler", "/analyse"];
  const forceSolid = FORCE_SOLID_PAGES.includes(pathname ?? "");
  const overlay = !scrolled && !forceSolid;
  const navCls = overlay ? "nav-overlay" : "nav-solid";
  const barHeightCls = overlay ? "h-20 md:h-28" : "h-16 md:h-20";
  const logoHeightCls = overlay ? "h-11 md:h-16" : "h-8 md:h-10";

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${navCls}`}>
        <div className={`mx-auto max-w-[1400px] px-6 md:px-10 flex items-center justify-between gap-6 transition-[height] duration-300 ${barHeightCls}`}>
          <Link href="/" className="flex items-center shrink-0" aria-label="Nordan Risk Partners forside">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-white.png"
              alt="Nordan Risk Partners"
              className={`w-auto transition-all duration-300 ${logoHeightCls}`}
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[0.92rem] font-semibold tracking-wide">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link relative transition-opacity hover:opacity-70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] ${active ? "font-bold" : ""}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <a
              href="tel:+4553520006"
              className="hidden md:inline-flex items-center gap-1.5 text-[0.88rem] font-semibold hover:text-[color:var(--color-nordan-accent-soft)] transition-colors"
              aria-label="Ring til os"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+45 53 52 00 06</span>
            </a>
            <Link
              href="/analyse"
              className="hidden sm:inline-flex items-center h-11 px-5 rounded-[6px] bg-[color:var(--color-nordan-accent)] text-white text-[0.85rem] font-semibold tracking-wide hover:bg-[#8f715f] transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
            >
              Lav analyse
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Luk menu" : "Åbn menu"}
              aria-expanded={open}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 -mr-2"
            >
              <span aria-hidden className="relative block w-6 h-[2px] bg-current">
                <span
                  className="absolute left-0 top-[-7px] block w-6 h-[2px] bg-current transition-transform"
                  style={{ transform: open ? "translateY(7px) rotate(45deg)" : "none" }}
                />
                <span
                  className="absolute left-0 top-[7px] block w-6 h-[2px] bg-current transition-transform"
                  style={{ transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }}
                />
                <span
                  className="block w-6 h-[2px] bg-current transition-opacity"
                  style={{ opacity: open ? 0 : 1 }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>


      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
        <div
          className={`absolute top-16 md:top-20 inset-x-0 bg-white border-b border-[color:var(--color-nordan-line)] transition-transform duration-300 ${
            open ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <nav className="px-6 py-6 flex flex-col">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`py-4 border-b border-[color:var(--color-nordan-line)] text-lg ${
                  pathname === l.href ? "text-[color:var(--color-nordan-accent)] font-medium" : "text-[color:var(--color-nordan-ink)]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="tel:+4553520006"
              className="btn-primary mt-6 justify-center"
            >
              Ring +45 53 52 00 06
            </a>
            <Link href="/kontakt-os" className="btn-outline mt-3 justify-center">
              Kontakt os
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

