import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { INSURANCE_PRODUCTS } from "@/lib/insurance-products";

const SITE = "https://nordanriskpartners.dk";

const STATIC_ROUTES: { path: string; priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/analyse", priority: 0.95, changefreq: "weekly" },
  { path: "/om-os", priority: 0.8, changefreq: "monthly" },
  { path: "/hvorfor-forsikringsmaegler", priority: 0.8, changefreq: "monthly" },
  { path: "/saadan-arbejder-vi", priority: 0.8, changefreq: "monthly" },
  { path: "/erhvervsforsikringer", priority: 0.85, changefreq: "weekly" },
  { path: "/kontakt-os", priority: 0.9, changefreq: "monthly" },
  { path: "/tilbud/hole-in-one", priority: 0.7, changefreq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map(({ path, priority, changefreq }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: changefreq,
    priority,
  }));

  const productEntries = INSURANCE_PRODUCTS.map((p) => ({
    url: `${SITE}/erhvervsforsikringer/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articleEntries = ARTICLES.map((a) => ({
    url: `${SITE}/artikler/${a.slug}`,
    lastModified: new Date(a.publishedAt),
    changeFrequency: "yearly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...productEntries, ...articleEntries];
}
