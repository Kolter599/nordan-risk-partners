export const SITE_URL = "https://nordanriskpartners.dk";

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

type OgInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function pageOpenGraph({ title, description, path, image }: OgInput) {
  const img = image ?? "/images/og-default.png";
  return {
    title,
    description,
    url: `${SITE_URL}${path}`,
    siteName: "Nordan Risk Partners",
    locale: "da_DK",
    type: "website" as const,
    images: [{ url: img, width: 1200, height: 630, alt: title }],
  };
}

export function pageTwitter({ title, description, image }: Omit<OgInput, "path">) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [image ?? "/images/og-default.png"],
  };
}
