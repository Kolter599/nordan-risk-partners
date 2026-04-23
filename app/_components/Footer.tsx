import Link from "next/link";

export function Footer() {
  return (
    <footer className="dark-section">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex" aria-label="Nordan Risk Partners forside">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-white.png"
              alt="Nordan Risk Partners"
              className="h-14 md:h-16 w-auto"
            />
          </Link>
          <p className="mt-8 text-white/90 max-w-sm leading-relaxed text-[0.95rem] font-medium">
            Uafhængigt forsikringsmæglerhus med speciale i erhvervsforsikringer. Over 40 års brancheerfaring. Nærvær, faglighed og tilgængelighed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/analyse" className="btn-accent">Få gratis analyse</Link>
            <Link
              href="/kontakt-os"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-[6px] border border-white/40 text-white hover:bg-white/10 transition-colors text-[0.85rem] font-semibold tracking-wide"
            >
              Kontakt os
            </Link>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="eyebrow !text-white/70 mb-5 font-bold">Kontakt</div>
          <ul className="space-y-2 text-white text-[0.95rem] font-medium">
            <li><a href="tel:+4553520006" className="hover:text-[color:var(--color-nordan-accent-soft)]">+45 53 52 00 06</a></li>
            <li><a href="mailto:info@ndrp.dk" className="hover:text-[color:var(--color-nordan-accent-soft)]">info@ndrp.dk</a></li>
            <li className="pt-2">Toftevej 15B</li>
            <li>3450 Allerød</li>
            <li className="pt-2 text-white/65 font-normal">CVR 45953769</li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow !text-white/70 mb-5 font-bold">Ydelser</div>
          <ul className="space-y-2 text-white text-[0.95rem] font-medium">
            <li><Link href="/erhvervsforsikringer" className="hover:text-[color:var(--color-nordan-accent-soft)]">Erhvervsforsikring</Link></li>
            <li><Link href="/erhvervsforsikringer/arbejdsskadeforsikring" className="hover:text-[color:var(--color-nordan-accent-soft)]">Arbejdsskade</Link></li>
            <li><Link href="/erhvervsforsikringer/erhvervs-og-produktansvarsforsikring" className="hover:text-[color:var(--color-nordan-accent-soft)]">Produktansvar</Link></li>
            <li><Link href="/erhvervsforsikringer/forsikring-andelsboligforening-ejerforening" className="hover:text-[color:var(--color-nordan-accent-soft)]">Foreninger</Link></li>
            <li><Link href="/erhvervsforsikringer/fredede-ejendomme-forsikring" className="hover:text-[color:var(--color-nordan-accent-soft)]">Fredede ejendomme</Link></li>
            <li><Link href="/erhvervsforsikringer/cyberforsikring" className="hover:text-[color:var(--color-nordan-accent-soft)]">Cyberforsikring</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow !text-white/70 mb-5 font-bold">Firma</div>
          <ul className="space-y-2 text-white text-[0.95rem] font-medium">
            <li><Link href="/om-os" className="hover:text-[color:var(--color-nordan-accent-soft)]">Om os</Link></li>
            <li><Link href="/hvorfor-forsikringsmaegler" className="hover:text-[color:var(--color-nordan-accent-soft)]">Hvorfor mægler?</Link></li>
            <li><Link href="/saadan-arbejder-vi" className="hover:text-[color:var(--color-nordan-accent-soft)]">Sådan arbejder vi</Link></li>
            <li><Link href="/kontakt-os" className="hover:text-[color:var(--color-nordan-accent-soft)]">Kontakt</Link></li>
            <li className="pt-2">
              <a
                href="https://www.linkedin.com/company/nordan-risk-partners"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[color:var(--color-nordan-accent-soft)]"
              >
                LinkedIn ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 text-[0.82rem] text-white/70 font-medium flex flex-col md:flex-row justify-between gap-3">
          <span>© {new Date().getFullYear()} Nordan Risk Partners ApS · Medlem af FMF</span>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/persondatapolitik.pdf" className="hover:text-white">Persondatapolitik</Link>
            <Link href="/whistleblower.pdf" className="hover:text-white">Whistleblower</Link>
            <span>Allerød, Danmark</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
