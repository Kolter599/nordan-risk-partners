import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { INSURANCE_PRODUCTS } from "@/lib/insurance-products";
import { LASTMOD } from "@/lib/lastmod";

const SITE = "https://nordanriskpartners.dk";

const STATIC_ROUTES: { path: string; priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/analyse", priority: 0.95, changefreq: "weekly" },
  { path: "/om-os", priority: 0.8, changefreq: "monthly" },
  { path: "/hvorfor-forsikringsmaegler", priority: 0.8, changefreq: "monthly" },
  { path: "/saadan-arbejder-vi", priority: 0.8, changefreq: "monthly" },
  { path: "/erhvervsforsikringer", priority: 0.85, changefreq: "weekly" },
  { path: "/artikler", priority: 0.8, changefreq: "weekly" },
  { path: "/kontakt-os", priority: 0.9, changefreq: "monthly" },
  { path: "/job", priority: 0.7, changefreq: "monthly" },
  { path: "/tilbud/hole-in-one", priority: 0.7, changefreq: "monthly" },
];

/**
 * Datoerne kommer fra lib/lastmod.ts, som er genereret ud fra git-historikken
 * og committet i repoet (`npm run lastmod`). Ikke `new Date()`: det ville give
 * alle 47 URL'er dagens dato ved hvert eneste deploy, og et lastmod der altid
 * er "i dag" er præcis det signal Google lærer at ignorere.
 *
 * Mangler en rute i kortet, udelades <lastmod> helt for den. Ingen oplysning
 * er bedre end en forkert.
 */
function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  const lastModified = LASTMOD[path];
  return {
    url: `${SITE}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_ROUTES.map(({ path, priority, changefreq }) =>
    entry(path, changefreq, priority)
  );

  const productEntries = INSURANCE_PRODUCTS.map((p) =>
    entry(`/erhvervsforsikringer/${p.slug}`, "monthly", 0.7)
  );

  const articleEntries = ARTICLES.map((a) => entry(`/artikler/${a.slug}`, "yearly", 0.65));

  return [...staticEntries, ...productEntries, ...articleEntries];
}
