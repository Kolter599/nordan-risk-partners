import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-28 md:py-40">
      <div className="mx-auto max-w-xl px-5 md:px-8 text-center">
        <div className="eyebrow mb-5">404</div>
        <h1 className="display-lg mb-5">Siden findes ikke</h1>
        <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed mb-10">
          Linket er måske forældet eller skrevet forkert. Gå tilbage til forsiden eller kontakt os hvis du har brug for hjælp.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Til forsiden</Link>
          <Link href="/kontakt-os" className="btn-outline">Kontakt os</Link>
        </div>
      </div>
    </section>
  );
}
