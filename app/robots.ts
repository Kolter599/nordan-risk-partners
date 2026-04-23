import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://www.nordanriskpartners.dk/sitemap.xml",
    host: "https://www.nordanriskpartners.dk",
  };
}
