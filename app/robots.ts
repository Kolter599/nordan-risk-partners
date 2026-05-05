import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://nordanriskpartners.dk/sitemap.xml",
    host: "https://nordanriskpartners.dk",
  };
}
