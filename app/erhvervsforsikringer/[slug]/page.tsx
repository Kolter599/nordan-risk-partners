import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsurancePageTemplate } from "../../_components/InsurancePageTemplate";
import { getAllSlugs, getProduct } from "@/lib/insurance-products";

const SITE = "https://nordan-risk-partners.vercel.app";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Forsikring" };

  const url = `${SITE}/erhvervsforsikringer/${slug}`;

  return {
    title: `${product.title} — Nordan Risk Partners`,
    description: product.metaDescription,
    keywords: [
      product.title.toLowerCase(),
      product.navLabel.toLowerCase(),
      "forsikring",
      "forsikringsmægler",
      "erhvervsforsikring",
      "uafhængig rådgivning",
      "Nordan Risk Partners",
      "uvildig rådgivning",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "da_DK",
      url,
      siteName: "Nordan Risk Partners",
      title: `${product.title} — Nordan Risk Partners`,
      description: product.metaDescription,
      images: [{ url: `${SITE}${product.heroImage}`, width: 1200, height: 630, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — Nordan Risk Partners`,
      description: product.metaDescription,
      images: [`${SITE}${product.heroImage}`],
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

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <InsurancePageTemplate product={product} />;
}
