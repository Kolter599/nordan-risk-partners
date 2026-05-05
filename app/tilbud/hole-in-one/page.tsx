import type { Metadata } from "next";
import { HoleInOneForm } from "./HoleInOneForm";

export const metadata: Metadata = {
  title: "Bestil din Hole-in-one forsikring",
  description:
    "Udfyld få oplysninger om turneringen og præmien. Vi vender tilbage med et tilbud på din Hole-in-one forsikring inden for én hverdag.",
  alternates: { canonical: "/tilbud/hole-in-one" },
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ cvr?: string | string[] }>;

export default async function HoleInOneTilbudPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const cvrRaw = Array.isArray(params.cvr) ? params.cvr[0] : params.cvr;
  const initialCvr = (cvrRaw ?? "").replace(/\D/g, "").slice(0, 8);

  return (
    <section className="bg-[color:var(--color-nordan-soft)] min-h-screen pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 md:pb-24">
      <div className="mx-auto max-w-[760px] px-5 sm:px-6 md:px-8">
        <div className="mb-8 sm:mb-10 text-center">
          <div className="text-[0.72rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent)] mb-3">
            Hole-in-one forsikring
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.7rem,4vw,2.4rem)] leading-[1.15] tracking-[-0.01em] mb-3">
            Bestil tilbud på Hole-in-one forsikring
          </h1>
          <p className="text-[color:var(--color-nordan-ink-soft)] leading-relaxed max-w-[560px] mx-auto">
            Udfyld oplysningerne nedenfor — så vender vi tilbage med et tilbud
            inden for én hverdag. Det tager ca. 3 minutter.
          </p>
        </div>

        <HoleInOneForm initialCvr={initialCvr} />
      </div>
    </section>
  );
}
