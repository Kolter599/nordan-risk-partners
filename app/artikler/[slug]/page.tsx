import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../_components/Breadcrumbs";
import { CvrCapture } from "../../_components/CvrCapture";
import { ScrollToCta } from "../../_components/ScrollToCta";
import { ARTICLES, getAllArticleSlugs, getArticle, type ArticleSection } from "@/lib/articles";
import { getProduct } from "@/lib/insurance-products";
import { SITE_URL, breadcrumbJsonLd, pageOpenGraph, pageTwitter } from "@/lib/seo";

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Artikel" };
  const path = `/artikler/${article.slug}`;
  // Shorter SEO title for Google's ~60-char window — keeps the brand
  // suffix but avoids truncation that hurts CTR in the SERP.
  const seoTitle = `${article.title} | Nordan Risk Partners`;
  const ogImageUrl = `${SITE_URL}${article.heroImage}`;
  return {
    title: seoTitle,
    description: article.metaDescription,
    alternates: { canonical: path },
    authors: [{ name: article.author }],
    keywords: [
      "forsikring fredede ejendomme",
      "fredet ejendom forsikring",
      "præmiestigning fredede bygninger",
      "forsikringsmægler fredede ejendomme",
      "forsikring fredet bygning afslag",
      "fredet bygning forsikringssum",
      "Slots- og Kulturstyrelsen forsikring",
      "Historiske Huse forsikring",
      "førsterisikoforsikring fredet ejendom",
      "Nordan Risk Partners",
    ],
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: `${SITE_URL}${path}`,
      siteName: "Nordan Risk Partners",
      locale: "da_DK",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.publishedAt,
      authors: [article.author],
      section: "Forsikring",
      tags: [
        "fredede ejendomme",
        "forsikring",
        "forsikringsmægler",
        "præmiestigning",
        "kulturarv",
      ],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1200,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const relatedProduct = article.relatedProductSlug
    ? getProduct(article.relatedProductSlug)
    : null;

  const wordCount = article.body.reduce((acc, s) => {
    if (s.type === "paragraph" || s.type === "lead") return acc + s.body.split(/\s+/).length;
    if (s.type === "heading") return acc + s.body.split(/\s+/).length;
    if (s.type === "list") return acc + s.items.join(" ").split(/\s+/).length;
    if (s.type === "callout")
      return acc + s.body.split(/\s+/).length + (s.title?.split(/\s+/).length ?? 0);
    return acc;
  }, 0);

  const authorName = article.author.split(",")[0].trim();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    alternativeHeadline: article.deck,
    description: article.metaDescription,
    image: [
      {
        "@type": "ImageObject",
        url: `${SITE_URL}${article.heroImage}`,
        width: 1200,
        height: 1200,
      },
    ],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    inLanguage: "da-DK",
    wordCount,
    author: {
      "@type": "Person",
      name: authorName,
      affiliation: {
        "@type": "Organization",
        name: "Nordan Risk Partners",
        url: SITE_URL,
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Nordan Risk Partners",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
        width: 600,
        height: 160,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/artikler/${article.slug}`,
    },
    about: [
      { "@type": "Thing", name: "Forsikring af fredede ejendomme" },
      { "@type": "Thing", name: "Forsikringsmægler" },
      { "@type": "Thing", name: "Bevaringsværdige bygninger" },
    ],
  };

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Forside", path: "/" },
    { name: "Artikler", path: "/artikler" },
    { name: article.title, path: `/artikler/${article.slug}` },
  ]);

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* HEADER — editorial layout with 1:1 social image as a feature.
          Image preserves its square aspect ratio (it's a social-style
          graphic with text baked in), not stretched as full-bleed. */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-12 bg-white">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 md:px-10">
          <Breadcrumbs
            items={[
              { label: "Forside", href: "/" },
              { label: "Artikler", href: "/artikler" },
              { label: article.title },
            ]}
          />
          <div className="text-[0.72rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent)] mb-4 mt-2">
            Artikel · {article.readingTime}
          </div>
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-start">
            <div className="min-w-0 max-w-[36rem]">
              <h1
                lang="da"
                className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.85rem,4.4vw,2.9rem)] leading-[1.1] tracking-[-0.015em] text-[color:var(--color-nordan-ink)]"
                style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
              >
                {article.title}
              </h1>
              <p className="mt-5 text-[1.1rem] sm:text-[1.18rem] leading-[1.55] text-[color:var(--color-nordan-ink-soft)]">
                {article.deck}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-[0.86rem] text-[color:var(--color-nordan-muted)]">
                <span className="font-semibold text-[color:var(--color-nordan-ink)]">
                  {article.author}
                </span>
                <span className="opacity-50">·</span>
                <span>{formattedDate}</span>
              </div>
            </div>
            <figure className="lg:w-[380px] xl:w-[420px] mx-auto lg:mx-0 w-full max-w-[460px]">
              <div className="relative aspect-square overflow-hidden rounded-[10px] shadow-[0_18px_50px_rgba(36,65,52,0.18)] border border-[color:var(--color-nordan-line)]">
                <Image
                  src={article.heroImage}
                  alt={article.title}
                  fill
                  priority
                  fetchPriority="high"
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  quality={95}
                />
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-[760px] px-5 sm:px-6 md:px-10">
        <div className="h-px bg-[color:var(--color-nordan-line)]" />
      </div>

      {/* BODY */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-[760px] px-5 sm:px-6 md:px-10">
          <ArticleBody body={article.body} />

          {/* Mid-page CVR capture — keeps the read in flow but converts intent
              without forcing them to scroll all the way down. */}
          {article.cvrLabel ? (
            <div id="hio-form" className="my-14 sm:my-16 scroll-mt-24">
              <CvrCapture headline={article.cvrLabel} />
            </div>
          ) : null}
        </div>
      </section>

      {/* Related product CTA — internal link strengthens cluster authority
          and gives Mads a clear next step for engaged readers. */}
      {relatedProduct && article.relatedProductCta ? (
        <section className="py-14 sm:py-20 md:py-24 bg-[color:var(--color-nordan-soft)]">
          <div className="mx-auto max-w-[1040px] px-5 sm:px-6 md:px-10">
            <div className="relative bg-white rounded-[10px] border border-[color:var(--color-nordan-line)] shadow-[0_8px_30px_rgba(36,65,52,0.06)] overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 w-[3px] bg-[color:var(--color-nordan-accent)]"
                aria-hidden
              />
              <div className="grid md:grid-cols-[1fr_auto] gap-7 md:gap-12 items-center px-7 sm:px-10 md:px-12 py-9 sm:py-11 md:py-12">
                <div className="min-w-0">
                  <div className="text-[0.7rem] uppercase tracking-[0.22em] font-semibold text-[color:var(--color-nordan-accent)] mb-3">
                    {article.relatedProductCta.eyebrow}
                  </div>
                  <h2 className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.45rem,2.6vw,1.95rem)] leading-[1.2] tracking-[-0.01em] text-[color:var(--color-nordan-ink)] mb-3">
                    {article.relatedProductCta.headline}
                  </h2>
                  <p className="text-[0.98rem] sm:text-[1rem] leading-[1.65] text-[color:var(--color-nordan-ink-soft)] max-w-[42rem] mb-4">
                    {article.relatedProductCta.body}
                  </p>
                  <Link
                    href={`/erhvervsforsikringer/${relatedProduct.slug}`}
                    className="inline-flex items-center gap-1.5 text-[0.86rem] font-semibold text-[color:var(--color-nordan-accent)] hover:text-[color:var(--color-nordan-dark)] underline underline-offset-4"
                  >
                    Læs mere om {relatedProduct.navLabel.toLowerCase()}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <ScrollToCta
                  targetId="hio-form"
                  className="group inline-flex items-center justify-center gap-2 h-[54px] px-7 rounded-[8px] bg-[color:var(--color-nordan-accent)] text-white text-[0.92rem] font-semibold tracking-wide hover:bg-[#8f715f] transition-colors shadow-[0_8px_22px_rgba(165,136,120,0.32)] whitespace-nowrap self-start md:self-center cursor-pointer"
                >
                  <span>{article.relatedProductCta.buttonLabel}</span>
                  <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </ScrollToCta>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Source — attribution-only, no outbound link */}
      {article.sourceNote ? (
        <section className="py-10 sm:py-12 bg-white border-t border-[color:var(--color-nordan-line)]">
          <div className="mx-auto max-w-[760px] px-5 sm:px-6 md:px-10">
            <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-muted)] mb-2">
              Kilde
            </div>
            <p className="text-[0.88rem] text-[color:var(--color-nordan-ink-soft)] leading-[1.65]">
              {article.sourceNote}
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}

/* ---------------- Body renderer ---------------- */

function ArticleBody({ body }: { body: ArticleSection[] }) {
  return (
    <article className="prose-article">
      {body.map((section, i) => {
        if (section.type === "lead") {
          return (
            <p
              key={i}
              className="text-[clamp(1.05rem,1.3vw,1.2rem)] leading-[1.6] text-[color:var(--color-nordan-ink)] font-medium mb-6 sm:mb-8 first:mt-0"
            >
              {section.body}
            </p>
          );
        }
        if (section.type === "paragraph") {
          return (
            <p
              key={i}
              className="text-[1rem] sm:text-[1.05rem] leading-[1.75] text-[color:var(--color-nordan-ink-soft)] mb-5"
            >
              {section.body}
            </p>
          );
        }
        if (section.type === "heading") {
          if (section.level === 2) {
            return (
              <h2
                key={i}
                className="font-[family-name:var(--font-playfair)] font-medium text-[clamp(1.4rem,2.4vw,1.75rem)] leading-[1.25] tracking-[-0.01em] text-[color:var(--color-nordan-ink)] mt-10 sm:mt-12 mb-4"
              >
                {section.body}
              </h2>
            );
          }
          return (
            <h3
              key={i}
              className="font-[family-name:var(--font-inter)] font-semibold text-[1.05rem] sm:text-[1.15rem] text-[color:var(--color-nordan-ink)] mt-8 mb-3"
            >
              {section.body}
            </h3>
          );
        }
        if (section.type === "list") {
          return (
            <ul key={i} className="mb-6 space-y-2 pl-1">
              {section.items.map((item, j) => (
                <li
                  key={j}
                  className="flex gap-3 text-[1rem] sm:text-[1.02rem] leading-[1.65] text-[color:var(--color-nordan-ink-soft)]"
                >
                  <span
                    className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-[color:var(--color-nordan-accent)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (section.type === "callout") {
          return (
            <aside
              key={i}
              className="my-8 relative bg-[color:var(--color-nordan-soft)] rounded-[8px] border border-[color:var(--color-nordan-line)] p-6 sm:p-7"
            >
              <div
                className="absolute top-0 bottom-0 left-0 w-[3px] bg-[color:var(--color-nordan-accent)] rounded-l-[8px]"
                aria-hidden
              />
              {section.eyebrow ? (
                <div className="text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-[color:var(--color-nordan-accent)] mb-2">
                  {section.eyebrow}
                </div>
              ) : null}
              {section.title ? (
                <div className="font-[family-name:var(--font-playfair)] font-medium text-[1.15rem] sm:text-[1.25rem] leading-[1.3] text-[color:var(--color-nordan-ink)] mb-2">
                  {section.title}
                </div>
              ) : null}
              <p className="text-[0.95rem] sm:text-[1rem] leading-[1.65] text-[color:var(--color-nordan-ink-soft)]">
                {section.body}
              </p>
            </aside>
          );
        }
        return null;
      })}
    </article>
  );
}

// Suppress unused-import warning in some bundlers — ARTICLES is the
// catalog used by generateStaticParams indirectly.
void ARTICLES;
