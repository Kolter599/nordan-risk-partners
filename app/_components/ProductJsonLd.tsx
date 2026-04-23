import type { InsuranceProduct } from "@/lib/insurance-products";

const SITE = "https://nordan-risk-partners.vercel.app";

/**
 * Emits a bundle of JSON-LD blocks for a single product page:
 * - Service (what the product IS)
 * - Organization provider context
 * - BreadcrumbList (home → erhvervsforsikringer → product)
 * - FAQPage (only if product has FAQ)
 */
export function ProductJsonLd({ product }: { product: InsuranceProduct }) {
  const url = `${SITE}/erhvervsforsikringer/${product.slug}`;

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: product.title,
    name: product.title,
    description: product.metaDescription,
    url,
    provider: {
      "@type": "InsuranceAgency",
      name: "Nordan Risk Partners ApS",
      url: SITE,
      telephone: "+4553520006",
      email: "info@ndrp.dk",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Toftevej 15B",
        postalCode: "3450",
        addressLocality: "Allerød",
        addressCountry: "DK",
      },
    },
    areaServed: { "@type": "Country", name: "Denmark" },
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: "0",
        priceCurrency: "DKK",
        description: "Gratis uforpligtende analyse",
      },
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: SITE },
      { "@type": "ListItem", position: 2, name: "Erhvervsforsikring", item: `${SITE}/erhvervsforsikringer` },
      { "@type": "ListItem", position: 3, name: product.title, item: url },
    ],
  };

  const faq = product.faq && product.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: product.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {faq ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      ) : null}
    </>
  );
}
