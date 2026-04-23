import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsurancePageTemplate } from "../../_components/InsurancePageTemplate";
import { getAllSlugs, getProduct } from "@/lib/insurance-products";

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
  return {
    title: product.title,
    description: product.metaDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  return <InsurancePageTemplate product={product} />;
}
