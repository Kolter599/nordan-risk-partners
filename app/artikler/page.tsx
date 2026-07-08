import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CvrCtaSection } from "../_components/CvrCtaSection";
import { PageHero } from "../_components/PageHero";
import { Reveal } from "../_components/Reveal";
import { ARTICLES, type Article, type ArticleCategory } from "@/lib/articles";
import { breadcrumbJsonLd, pageOpenGraph, pageTwitter, SITE_URL } from "@/lib/seo";

const ART_TITLE = "Artikler og guides om erhvervsforsikring og forsikringsmægler";
const ART_DESC =
  "Indsigt, guides og markedsanalyser om erhvervsforsikring — fra hvordan du vælger forsikringsmægler til, hvornår en uafhængig mægler er et stærkt alternativ. Fra Nordan Risk Partners.";

export const metadata: Metadata = {
  title: ART_TITLE,
  description: ART_DESC,
  alternates: { canonical: "/artikler" },
  openGraph: pageOpenGraph({ title: ART_TITLE, description: ART_DESC, path: "/artikler" }),
  twitter: pageTwitter({ title: ART_TITLE, description: ART_DESC }),
};

// Newest first — keeps the freshest content at the top of each group.
const SORTED = [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

const GROUPS: { key: ArticleCategory; label: string; blurb: string }[] = [
  {
    key: "marked",
    label: "Markedsindsigt",
    blurb: "Analyser og observationer fra forsikringsmarkedet, som vi ser det indefra.",
  },
  {
    key: "guide",
    label: "Guides",
    blurb: "Praktiske svar på de spørgsmål, virksomheder oftest stiller os.",
  },
  {
    key: "alternativ",
    label: "Sammenlign mæglere",
    blurb: "Ærlige sammenligninger — hvornår en uafhængig mægler er det rette match.",
  },
];

const ART_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumbJsonLd([
      { name: "Forside", path: "/" },
      { name: "Artikler", path: "/artikler" },
    ]),
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/artikler#collectionpage`,
      url: `${SITE_URL}/artikler`,
      name: ART_TITLE,
      description: ART_DESC,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      hasPart: SORTED.map((a) => ({
        "@type": "Article",
        headline: a.title,
        url: `${SITE_URL}/artikler/${a.slug}`,
        datePublished: a.publishedAt,
      })),
    },
  ],
};

function group(cat: ArticleCategory): Article[] {
  return SORTED.filter((a) => (a.category ?? "marked") === cat);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}

export default function ArtiklerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ART_JSONLD) }}
      />
      <PageHero
        eyebrow="Viden"
        title={<>Artikler og guides</>}
        body={
          <>
            Indsigt om erhvervsforsikring fra et uafhængigt mæglerhus — markedsanalyser, praktiske
            guides og ærlige sammenligninger, der hjælper jer med at træffe bedre forsikringsvalg.
          </>
        }
        image="/images/nordan-73.jpg"
        imageAlt="Nordan Risk Partners — viden om erhvervsforsikring"
      />

      {GROUPS.map((g, gi) => {
        const items = group(g.key);
        if (items.length === 0) return null;
        return (
          <section
            key={g.key}
            className={`py-16 md:py-24 ${gi % 2 === 1 ? "bg-[color:var(--color-nordan-soft)]" : "bg-white"}`}
          >
            <div className="mx-auto max-w-[1200px] px-6 md:px-10">
              <div className="max-w-2xl mb-10 md:mb-12">
                <div className="eyebrow mb-4">{g.label}</div>
                <p className="text-[1.05rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.7]">
                  {g.blurb}
                </p>
              </div>

              <div className="grid gap-6 md:gap-7 md:grid-cols-2 lg:grid-cols-3">
                {items.map((a, i) => (
                  <Reveal key={a.slug} delay={i * 40}>
                    <Link
                      href={`/artikler/${a.slug}`}
                      className="group flex flex-col h-full bg-white border border-[color:var(--color-nordan-line)] rounded-[10px] overflow-hidden hover:border-[color:var(--color-nordan-accent)] transition-colors shadow-[0_6px_24px_rgba(36,65,52,0.05)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={a.heroImage}
                          alt={a.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
                          quality={90}
                        />
                      </div>
                      <div className="flex flex-col flex-1 p-6">
                        <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-accent)] mb-3">
                          {a.readingTime} · {formatDate(a.publishedAt)}
                        </div>
                        <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[1.2rem] leading-[1.25] text-[color:var(--color-nordan-ink)] mb-3">
                          {a.title}
                        </h2>
                        <p className="text-[0.92rem] leading-[1.6] text-[color:var(--color-nordan-ink-soft)] line-clamp-3">
                          {a.deck}
                        </p>
                        <span className="inline-flex items-center gap-1.5 mt-5 text-[0.78rem] uppercase tracking-[0.12em] font-semibold text-[color:var(--color-nordan-accent)] group-hover:text-[color:var(--color-nordan-dark)]">
                          Læs artikel <span aria-hidden>→</span>
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <CvrCtaSection variant="soft" />
    </>
  );
}
