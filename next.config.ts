import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90, 95],
  },
  experimental: {
    inlineCss: true,
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      // nordanriskpartners.dk is the canonical/primary domain. Funnel
      // ndrp.dk + www variants onto it (preserves path so SEO equity moves).
      {
        source: "/:path*",
        has: [{ type: "host", value: "ndrp.dk" }],
        destination: "https://nordanriskpartners.dk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ndrp.dk" }],
        destination: "https://nordanriskpartners.dk/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nordanriskpartners.dk" }],
        destination: "https://nordanriskpartners.dk/:path*",
        permanent: true,
      },
      // Preserve SEO equity from the old flat URLs
      { source: "/arbejdsskadeforsikring", destination: "/erhvervsforsikringer/arbejdsskadeforsikring", permanent: true },
      { source: "/erhvervs-og-produktansvarsforsikring", destination: "/erhvervsforsikringer/erhvervs-og-produktansvarsforsikring", permanent: true },
      { source: "/fredede-ejendomme-forsikring", destination: "/erhvervsforsikringer/fredede-ejendomme-forsikring", permanent: true },
      { source: "/hole-in-one-forsikring", destination: "/erhvervsforsikringer/hole-in-one-forsikring", permanent: true },
      { source: "/forsikring-andelsboligforening-ejerforening", destination: "/erhvervsforsikringer/forsikring-andelsboligforening-ejerforening", permanent: true },
    ];
  },
};

export default nextConfig;
