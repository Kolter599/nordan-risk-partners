import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://nordan-risk-partners.vercel.app/sitemap.xml",
    host: "https://nordan-risk-partners.vercel.app",
  };
}
